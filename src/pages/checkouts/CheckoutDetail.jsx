/**
 * CheckoutDetail
 *
 * Issue #138: Export to CSV on the checkout flow (detail view).
 * Category: Feature / data portability
 * Resolution: "Export to CSV" downloads a key-value summary for the active checkout.
 *
 * issue #52 improve color contrast across the checkout module to meet WCAG AA standards
 * Category: Accessibility
 * Resolution: Updated text and background colors to ensure a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text, meeting WCAG AA guidelines.
 * Accessibility Fix:
 * - Improved color contrast to meet WCAG AA standards
 * - Replaced low-contrast text tokens
 * - Improved background/text combinations
 * - Enhanced focus + readability
 */

import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Copy,
    Link as LinkIcon,
    Edit,
    Trash2,
    ExternalLink,
    FileSpreadsheet
} from 'lucide-react';

import Button from '../../components/forms/Button';
import StatusBadge from '../../components/tables/StatusBadge';
import { useCheckoutData } from '../../context/DataContext';
import { formatUtcDate } from '../../utils/date';
import { buildCheckoutDetailCsv, downloadCsvFile } from '../../utils/checkoutCsv';
import LazyChart from '../../components/ui/LazyChart';

function CheckoutDetail() {
    const { id } = useParams();
    const { checkouts, recordCheckoutView } = useCheckoutData();
    const checkout = checkouts.find(c => c.id === id);

    useEffect(() => {
        if (id) {
            recordCheckoutView(id);
        }
    }, [id, recordCheckoutView]);

    // FIX: Improved empty state contrast
    if (!checkout) {
        return (
            <div className="p-8">
                <p className="text-sm text-gray-700">
                    Checkout not found
                </p>
            </div>
        );
    }

    const copyLink = () => {
        navigator.clipboard.writeText(checkout.paymentLink);
    };

    const handleExportCsv = () => {
        const csv = buildCheckoutDetailCsv(checkout);
        downloadCsvFile(`${checkout.id}.csv`, csv);
    };

    const chartData = {
        labels: ['Views', 'Payments'],
        datasets: [
            {
                label: 'Engagement',
                data: [checkout.views, checkout.payments],

                // FIX: Stronger contrast colors
                backgroundColor: [
                    'rgba(67, 56, 202, 0.7)',
                    'rgba(249, 115, 22, 0.7)'
                ],
                borderColor: [
                    'rgb(67, 56, 202)',
                    'rgb(194, 65, 12)'
                ],
                borderWidth: 1.5,
                borderRadius: 6,
            }
        ]
    };

    const chartOptions = {
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: {
                beginAtZero: true,

                // FIX: darker grid for visibility
                grid: { color: 'rgba(0,0,0,0.15)' },

                ticks: {
                    color: '#374151' // gray-700
                }
            },
            x: {
                grid: { display: false },
                ticks: {
                    color: '#374151'
                }
            }
        }
    };

    return (
        <div>
            {/* HEADER */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    {/* FIX: stronger link contrast */}
                    <Link
                        to="/checkout"
                        className="inline-flex items-center gap-1.5 text-sm text-gray-700 hover:text-indigo-700 transition-colors mb-2"
                    >
                        <ArrowLeft size={16} /> Back to Checkouts
                    </Link>

                    {/* FIX: ensured strong heading contrast */}
                    <h1 className="text-xl font-semibold text-gray-900">
                        {checkout.title}
                    </h1>

                    {/* FIX: ID text more readable */}
                    <p className="text-sm text-gray-600">
                        {checkout.id}
                    </p>
                </div>

                <div className="flex gap-2 flex-wrap">
                    <Button variant="secondary" icon={FileSpreadsheet} onClick={handleExportCsv}>
                        Export to CSV
                    </Button>
                    <Button variant="secondary" icon={Edit}>
                        Edit
                    </Button>
                    <Button variant="danger" icon={Trash2}>
                        Delete
                    </Button>
                </div>
            </div>

            {/* CHECKOUT INFO */}
            <div className="bg-white border border-gray-200 rounded-card p-6 mb-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-gray-900">
                        Checkout Information
                    </h2>
                    <StatusBadge status={checkout.status} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                    {[
                        ['Amount', `${checkout.amount} ${checkout.currency}`],
                        ['Description', checkout.description],
                        ['Views', checkout.views],
                        ['Payments', checkout.payments],
                        ['Created', formatUtcDate(checkout.createdAt)],
                    ].map(([label, value]) => (
                        <div key={label}>
                            {/*  FIX: label contrast */}
                            <span className="block text-xs text-gray-600 mb-1">
                                {label}
                            </span>

                            {/* FIX: value contrast */}
                            <span className="text-sm font-medium text-gray-900">
                                {value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* PAYMENT LINK */}
            <div className="bg-white border border-gray-200 rounded-card p-6 mb-5">
                <h2 className="text-base font-semibold text-gray-900 mb-4">
                    Payment Link
                </h2>

                <div className="flex items-center gap-3">
                    {/* FIX: background + text contrast */}
                    <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-lg">
                        <LinkIcon size={16} className="text-gray-600" />

                        <span className="text-sm text-gray-800 break-all">
                            {checkout.paymentLink}
                        </span>
                    </div>

                    <Button variant="secondary" icon={Copy} onClick={copyLink}>
                        Copy
                    </Button>

                    <Button variant="secondary" icon={ExternalLink}>
                        Open
                    </Button>
                </div>
            </div>

            {/* CHART */}
            <div className="bg-white border border-gray-200 rounded-card p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">
                    Performance Metrics
                </h2>

                {/* FIX: darker background for chart container */}
                <div className="bg-gray-50 rounded-xl p-4">
                    <LazyChart
                        type="bar"
                        data={chartData}
                        options={chartOptions}
                        height={240}
                    />
                </div>
            </div>
        </div>
    );
}

export default CheckoutDetail;