import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    TrendingUp,
    ArrowDownRight,
    FileText,
    Users,
    ShoppingCart,
    Package,
    Zap,
    ChevronDown,
    ArrowUpRight,
} from 'lucide-react';
import { useData } from '../../../context/DataContext';
import WelcomeModal from '../../../components/ui/WelcomeModal';
import { formatPrice, useCurrencyPreference } from '../../../utils/currencyPreference';

// ── Filter helpers ────────────────────────────────────────────────────────────

const FILTERS = [
    { label: 'Last week',  key: 'week'  },
    { label: 'Last month', key: 'month' },
    { label: 'Last year',  key: 'year'  },
];

function getStartDate(key) {
    const now = new Date();
    if (key === 'week')  { const d = new Date(now); d.setDate(d.getDate() - 7);   return d; }
    if (key === 'month') { const d = new Date(now); d.setMonth(d.getMonth() - 1); return d; }
    if (key === 'year')  { const d = new Date(now); d.setFullYear(d.getFullYear() - 1); return d; }
    return new Date(0);
}

// ── Component ─────────────────────────────────────────────────────────────────

function Home() {
    const { invoices = [] } = useData();
    const displayCurrency    = useCurrencyPreference();
    const [txFilter, setTxFilter] = useState('month');

    // All paid invoices
    const paidInvoices = invoices.filter(inv => inv.status === 'paid');

    // Total transactions filtered by period
    const filterStart = getStartDate(txFilter);
    const filteredTotal = paidInvoices
        .filter(inv => {
            const d = inv.paidAt ? new Date(inv.paidAt) : null;
            return d && d >= filterStart;
        })
        .reduce((sum, inv) => sum + parseFloat((inv.amount || '0').replace(/,/g, '')), 0);

    const totalAllTime = paidInvoices
        .reduce((sum, inv) => sum + parseFloat((inv.amount || '0').replace(/,/g, '')), 0);

    // Unpaid receivables (all time)
    const receivables = invoices
        .filter(inv => inv.status !== 'paid')
        .reduce((sum, inv) => sum + parseFloat((inv.amount || '0').replace(/,/g, '')), 0);

    // Recent transactions for the feed
    const recentTransactions = paidInvoices
        .map(inv => ({
            id:          inv.id,
            description: `Payment from ${inv.customer}`,
            date:        inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : 'Unknown',
            rawDate:     inv.paidAt || '',
            amount:      inv.amount,
            customer:    inv.customer,
        }))
        .sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate))
        .slice(0, 5);

    const activeFilterLabel = FILTERS.find(f => f.key === txFilter)?.label || 'Last month';

    return (
        <div className="max-w-[1100px]">
            <WelcomeModal />

            <h1 className="text-xl font-medium text-t-primary mb-6">
                Welcome to Tradazone
            </h1>

            {/* ── Top Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                {/* Total Transactions Card */}
                <div className="bg-brand rounded-card p-6 text-white flex flex-col min-h-[192px]">
                    {/* Header row */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <ArrowUpRight size={15} strokeWidth={2} />
                            </div>
                            <span className="text-sm font-semibold text-white">Total Transactions</span>
                        </div>

                        {/* Period filter */}
                        <div className="relative">
                            <select
                                value={txFilter}
                                onChange={e => setTxFilter(e.target.value)}
                                className="appearance-none bg-white/15 text-white text-xs font-medium pl-3 pr-7 py-1.5 rounded-md outline-none cursor-pointer border border-white/20 hover:bg-white/25 transition-colors"
                            >
                                {FILTERS.map(f => (
                                    <option key={f.key} value={f.key} className="text-t-primary bg-white">
                                        {f.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 pointer-events-none" />
                        </div>
                    </div>

                    {/* Amount */}
                    <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-[44px] font-bold leading-none tracking-tight">
                            {formatPrice(filteredTotal, displayCurrency)}
                        </span>
                    </div>
                    <span className="text-sm text-white/60 mt-auto">{activeFilterLabel} · {formatPrice(totalAllTime, displayCurrency)} all time</span>
                </div>

                {/* Total Receivable Card */}
                <div className="bg-white border border-border rounded-card p-6 flex flex-col min-h-[192px]">
                    <div className="flex items-center gap-2 mb-1">
                        <ArrowDownRight size={20} strokeWidth={2} className="text-brand" />
                        <span className="text-base font-semibold text-t-primary">Total receivable</span>
                    </div>
                    <p className="text-sm text-t-muted mb-5">Total unpaid invoices</p>

                    {/* Progress bar */}
                    <div className="w-full h-2.5 bg-page overflow-hidden mb-5">
                        <div
                            className="h-full bg-brand"
                            style={{
                                width: (() => {
                                    const total = totalAllTime + receivables;
                                    return total > 0 ? `${(totalAllTime / total) * 100}%` : '0%';
                                })()
                            }}
                        />
                    </div>

                    <div className="flex gap-10 mt-auto">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-t-muted font-medium">Collected</span>
                            <span className="text-base font-bold text-t-primary">
                                {formatPrice(totalAllTime, displayCurrency)}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-t-muted font-medium">Unpaid</span>
                            <span className="text-base font-bold text-t-primary">
                                {formatPrice(receivables, displayCurrency)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Middle Row: Transactions + Activity ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                {/* Transactions Card */}
                <div className="bg-white border border-border rounded-card overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                        <div className="flex items-center gap-2 font-semibold text-sm text-t-primary">
                            <FileText size={18} strokeWidth={1.8} />
                            <span>Transactions</span>
                        </div>
                    </div>
                    <div>
                        {recentTransactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-14 text-center px-6">
                                <FileText size={32} className="text-t-muted/30 mb-3" strokeWidth={1.5} />
                                <p className="text-sm font-medium text-t-secondary mb-1">No transactions yet</p>
                                <p className="text-xs text-t-muted">Transactions will appear here once you get paid.</p>
                            </div>
                        ) : (
                            recentTransactions.map((tx, i) => (
                                <div key={tx.id} className={`flex items-center gap-3 px-6 py-3.5 ${i < recentTransactions.length - 1 ? 'border-b border-border' : ''}`}>
                                    <div className="w-9 h-9 bg-page rounded-lg flex items-center justify-center text-t-muted flex-shrink-0">
                                        <FileText size={16} strokeWidth={1.8} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="block text-[13px] font-medium text-t-primary truncate">{tx.description}</span>
                                        <span className="block text-[11px] text-t-muted mt-0.5">{tx.date}</span>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <span className="block text-[13px] font-semibold text-success">
                                            +{formatPrice(tx.amount, displayCurrency)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Activity Card */}
                <div className="bg-white border border-border rounded-card overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                        <div className="flex items-center gap-2 font-semibold text-sm text-t-primary">
                            <TrendingUp size={18} strokeWidth={1.8} />
                            <span>Activity</span>
                        </div>
                    </div>
                    <div>
                        {recentTransactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-14 text-center px-6">
                                <TrendingUp size={32} className="text-t-muted/30 mb-3" strokeWidth={1.5} />
                                <p className="text-sm font-medium text-t-secondary mb-1">No activity yet</p>
                                <p className="text-xs text-t-muted">Your activity feed will show up here.</p>
                            </div>
                        ) : (
                            recentTransactions.map((tx, i) => (
                                <div key={`act-${tx.id}`} className={`flex items-center gap-3 px-6 py-3.5 ${i < recentTransactions.length - 1 ? 'border-b border-border' : ''}`}>
                                    <div className="w-9 h-9 bg-page rounded-lg flex items-center justify-center text-t-muted flex-shrink-0">
                                        <FileText size={16} strokeWidth={1.8} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="block text-[13px] font-medium text-t-primary truncate">
                                            Invoice paid by {tx.customer || 'customer'}
                                        </span>
                                        <span className="block text-[11px] text-t-muted mt-0.5">{tx.date}</span>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <span className="block text-[13px] font-semibold text-success">
                                            +{formatPrice(tx.amount, displayCurrency)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* ── Quick Actions ── */}
            <div className="bg-white border border-border rounded-card px-6 py-8">
                <div className="flex items-center justify-center gap-2 font-semibold text-sm mb-6">
                    <Zap size={18} className="text-accent-orange" />
                    <span className="text-t-primary">Quick action</span>
                </div>
                <div className="flex justify-center gap-10">
                    {[
                        { icon: FileText,     label: 'Invoice',  to: '/invoices/create'  },
                        { icon: Users,        label: 'Customer', to: '/customers/add'    },
                        { icon: ShoppingCart, label: 'Checkout', to: '/checkout/create'  },
                        { icon: Package,      label: 'Products', to: '/items/add'        },
                    ].map((action) => (
                        <Link
                            key={action.label}
                            to={action.to}
                            className="flex flex-col items-center gap-3 hover:-translate-y-0.5 active:scale-95 transition-transform"
                        >
                            <div className="w-16 h-16 bg-brand flex items-center justify-center text-white shadow-md shadow-brand/20">
                                <action.icon size={26} strokeWidth={1.6} />
                            </div>
                            <span className="text-xs font-medium text-t-secondary">{action.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Home;
