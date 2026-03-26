import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { dispatchWebhook, setWebhookUrl, getWebhookUrl } from '../services/webhook';

const DataContext = createContext(null);

/* ---------- localStorage helpers ---------- */
const KEYS = {
    customers: 'tradazone_customers',
    invoices: 'tradazone_invoices',
    checkouts: 'tradazone_checkouts',
    items: 'tradazone_items',
};



function save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

/* ---------- Provider ---------- */
export function DataProvider({ children }) {
    // Clear persisted data once on mount so the app starts as a fresh new user
    // (avoid clearing on every render — that races with in-flight saves).
    useEffect(() => {
        localStorage.removeItem(KEYS.customers);
        localStorage.removeItem(KEYS.invoices);
        localStorage.removeItem(KEYS.checkouts);
        localStorage.removeItem(KEYS.items);
    }, []);

    const [customers, setCustomers] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [checkouts, setCheckouts] = useState([]);
    const [items, setItems] = useState([]);

    // Refs mirror state length so sequential IDs are always correct
    // even when multiple adds happen within the same render batch.
    const invoiceCountRef = useRef(0);
    const checkoutCountRef = useRef(0);

    // ---------- Customers ----------
    const addCustomer = useCallback((data) => {
        const newCustomer = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name: data.name,
            email: data.email,
            phone: data.phone || '',
            address: data.address || '',
            totalSpent: '0',
            currency: 'STRK',
            invoiceCount: 0,
            createdAt: new Date().toISOString().split('T')[0],
        };
        setCustomers((prev) => {
            const next = [...prev, newCustomer];
            save(KEYS.customers, next);
            return next;
        });
        return newCustomer;
    }, []);

    // ---------- Items ----------
    const addItem = useCallback((data) => {
        const newItem = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name: data.name,
            description: data.description || '',
            type: data.type || 'service',
            price: data.price,
            currency: 'STRK',
            unit: data.unit || 'unit',
        };
        setItems((prev) => {
            const next = [...prev, newItem];
            save(KEYS.items, next);
            return next;
        });
        return newItem;
    }, []);

    // ---------- Invoices ----------
    const addInvoice = useCallback(
        (data) => {
            const customer = customers.find((c) => c.id === data.customerId);
            const resolvedItems = data.items.map((di) => {
                const found = items.find((i) => i.id === di.itemId);
                return {
                    name: found ? found.name : 'Custom Item',
                    quantity: parseInt(di.quantity, 10) || 1,
                    price: di.price || (found ? found.price : '0'),
                };
            });
            const total = resolvedItems.reduce(
                (sum, it) => sum + parseFloat(it.price) * it.quantity,
                0
            );
            const newInvoice = {
                id: `INV-${String(++invoiceCountRef.current).padStart(3, '0')}`,
                customer: customer ? customer.name : 'Unknown',
                customerId: data.customerId,
                amount: total.toLocaleString(),
                currency: 'STRK',
                status: 'pending',
                dueDate: data.dueDate,
                createdAt: new Date().toISOString().split('T')[0],
                items: resolvedItems,
            };
            setInvoices((prev) => {
                const next = [...prev, newInvoice];
                save(KEYS.invoices, next);
                return next;
            });
            return newInvoice;
        },
        [customers, items]
    );

    // ---------- Checkouts ----------
    const addCheckout = useCallback(
        (data) => {
            const id = `CHK-${String(++checkoutCountRef.current).padStart(3, '0')}`;
            const newCheckout = {
                id,
                title: data.title,
                description: data.description || '',
                amount: data.amount,
                currency: data.currency || 'STRK',
                status: 'active',
                createdAt: new Date().toISOString().split('T')[0],
                paymentLink: `https://pay.tradazone.com/${id}`,
                views: 0,
                payments: 0,
            };
            setCheckouts((prev) => {
                const next = [...prev, newCheckout];
                save(KEYS.checkouts, next);
                return next;
            });
            // Fire checkout.created webhook (non-blocking)
            dispatchWebhook('checkout.created', {
                id: newCheckout.id,
                title: newCheckout.title,
                amount: newCheckout.amount,
                currency: newCheckout.currency,
                paymentLink: newCheckout.paymentLink,
            });
            return newCheckout;
        },
        []
    );

    /**
     * markCheckoutPaid — marks a checkout as paid, updates the linked customer's
     * totalSpent and invoiceCount, then fires the checkout.paid webhook.
     *
     * @param {string} checkoutId - ID of the checkout being paid
     * @param {string} customerId - ID of the customer who paid
     * @param {string} [walletType] - wallet type used for payment (e.g. 'starknet')
     */
    const markCheckoutPaid = useCallback(
        (checkoutId, customerId, walletType = '') => {
            let paidCheckout;
            flushSync(() => {
                setCheckouts((prev) => {
                    const next = prev.map((c) =>
                        c.id === checkoutId
                            ? { ...c, status: 'paid', payments: c.payments + 1 }
                            : c
                    );
                    paidCheckout = next.find((c) => c.id === checkoutId);
                    save(KEYS.checkouts, next);
                    return next;
                });
            });
            if (customerId) {
                setCustomers((prev) => {
                    const next = prev.map((c) => {
                        if (c.id !== customerId) return c;
                        const prevSpent = parseFloat(c.totalSpent.replace(/,/g, '')) || 0;
                        const added = parseFloat(paidCheckout?.amount || '0') || 0;
                        return {
                            ...c,
                            totalSpent: (prevSpent + added).toLocaleString(),
                            invoiceCount: c.invoiceCount + 1,
                        };
                    });
                    save(KEYS.customers, next);
                    return next;
                });
            }
            // Fire checkout.paid webhook (non-blocking)
            if (paidCheckout) {
                dispatchWebhook('checkout.paid', {
                    id: paidCheckout.id,
                    title: paidCheckout.title,
                    amount: paidCheckout.amount,
                    currency: paidCheckout.currency,
                    customerId,
                    walletType,
                });
            }
        },
        []
    );

    return (
        <DataContext.Provider
            value={{
                customers,
                invoices,
                checkouts,
                items,
                transactions: [],
                dashboardStats: { walletBalance: '0', currency: 'STRK', receivables: '0', totalTransactions: 0, totalCustomers: 0 },
                addCustomer,
                addItem,
                addInvoice,
                addCheckout,
                markCheckoutPaid,
                setWebhookUrl,
                getWebhookUrl,
            }}
        >
            {children}
        </DataContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error('useData must be used within a DataProvider');
    return ctx;
}
