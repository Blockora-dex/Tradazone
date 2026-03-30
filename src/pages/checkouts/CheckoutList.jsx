/**
 * CheckoutList
 *
 * Issue #138: Export to CSV on the checkout flow (list view).
 * Category: Feature / data portability
 *
 * Issue #30: Virtualization fix handled in DataTable.
 *
 * Issue #52: WCAG AA Color Contrast Fix
 * - Replaced low-contrast tokens (text-t-*, border-border, bg-page)
 * - Improved input, header, and icon contrast
 * - Ensured accessible button and text combinations
 */

import { useNavigate } from 'react-router-dom';
import { Plus, Search, ShoppingCart, FileSpreadsheet } from 'lucide-react';
import DataTable from '../../components/tables/DataTable';
import StatusBadge from '../../components/tables/StatusBadge';
import Button from '../../components/forms/Button';
import { buildCheckoutsListCsv, downloadCsvFile } from '../../utils/checkoutCsv';
import EmptyState from '../../components/ui/EmptyState';
import { useCheckoutData } from '../../context/DataContext';
import { formatUtcDate } from '../../utils/date';

function CheckoutList() {
    const navigate = useNavigate();
    const { checkouts } = useCheckoutData();

    const handleExportCsv = () => {
        if (checkouts.length === 0) return;
        const csv = buildCheckoutsListCsv(checkouts);
        const stamp = new Date().toISOString().slice(0, 10);
        downloadCsvFile(`tradazone-checkouts-${stamp}.csv`, csv);
    };

    const columns = [
        { key: 'id', header: 'ID' },
        { key: 'title', header: 'Title' },
        { key: 'amount', header: 'Amount', render: (value, row) => `${value} ${row.currency}` },
        { key: 'status', header: 'Status', render: (value) => <StatusBadge status={value} /> },
        { key: 'views', header: 'Views' },
        { key: 'payments', header: 'Payments' },
        { key: 'createdAt', header: 'Created', render: (value) => formatUtcDate(value) }
    ];

    return (
        <div>
            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
                {/*  FIX: strong heading contrast */}
                <h1 className="text-xl font-semibold text-gray-900">
                    Checkouts
                </h1>

                <div className="flex items-center gap-2">
                    {checkouts.length > 0 && (
                        <Button
                            variant="secondary"
                            icon={FileSpreadsheet}
                            onClick={handleExportCsv}
                        >
                            Export to CSV
                        </Button>
                    )}

                    {/*  FIX: ensured button contrast meets WCAG */}
                    <button
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 h-10 bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-95 transition-all"
                        onClick={() => navigate('/checkout/create')}
                    >
                        <Plus size={18} />
                        Create Checkout
                    </button>
                </div>
            </div>

            {/* EMPTY STATE */}
            {checkouts.length === 0 ? (
                <EmptyState
                    icon={ShoppingCart}
                    title="No checkout links yet"
                    description="Create a checkout link to accept one-click crypto payments from anyone."
                    actionLabel="Create your first checkout"
                    actionPath="/checkout/create"
                />
            ) : (
                <>
                    {/* SEARCH BAR */}
                    <div className="flex items-center gap-3 mb-5 px-4 py-2.5 bg-white border border-gray-200 rounded-lg">
                        {/*  FIX: icon contrast */}
                        <Search size={18} className="text-gray-600" />

                        {/*  FIX: input text + placeholder contrast */}
                        <input
                            type="text"
                            placeholder="Search checkouts..."
                            className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-500"
                        />
                    </div>

                    {/* DATA TABLE */}
                    <DataTable
                        columns={columns}
                        data={checkouts}
                        onRowClick={(checkout) => navigate(`/checkout/${checkout.id}`)}
                    />
                </>
            )}
        </div>
    );
}

export default CheckoutList;