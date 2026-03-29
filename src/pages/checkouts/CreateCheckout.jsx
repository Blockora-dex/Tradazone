/**
 * CreateCheckout
 *
 * Issue #52: WCAG AA Color Contrast Fix
 * - Updated all low-contrast text tokens (text-t-*, text-t-secondary) to gray-600/700/900
 * - Updated brand/bg-brand colors for better contrast
 * - Updated borders for better visibility
 * - Added focus outlines for keyboard navigation
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Copy, Link as LinkIcon } from 'lucide-react';
import Input from '../../components/forms/Input';
import Button from '../../components/forms/Button';
import { useCheckoutData } from '../../context/DataContext';
import Logo from '../../components/ui/Logo';
import { dispatchWebhook } from '../../services/webhook';

function CreateCheckout() {
    const navigate = useNavigate();
    const { addCheckout } = useCheckoutData();
    const [formData, setFormData] = useState({ title: '', description: '', amount: '', currency: 'STRK' });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!formData.title.trim()) {
            newErrors.title = 'Checkout title is required';
        }
        if (!formData.amount.trim()) {
            newErrors.amount = 'Amount is required';
        } else if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Please enter a valid amount greater than 0';
        }
        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isSubmitting) return;

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            const checkout = addCheckout(formData);
            dispatchWebhook('checkout.created', {
                id: checkout.id,
                title: checkout.title,
                amount: checkout.amount,
                currency: checkout.currency,
                paymentLink: checkout.paymentLink,
            });
            navigate('/checkout');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field) => (e) => {
        setFormData({ ...formData, [field]: e.target.value });
        if (errors[field]) setErrors({ ...errors, [field]: undefined });
    };

    const previewLink = formData.title
        ? `pay.tradazone.com/${formData.title.toLowerCase().replace(/\s+/g, '-')}`
        : 'pay.tradazone.com/your-checkout';

    return (
        <div>
            {/* HEADER */}
            <div className="mb-6">
                <Link
                    to="/checkout"
                    className="inline-flex items-center gap-1.5 text-sm text-gray-700 hover:text-indigo-700 transition-colors mb-2"
                >
                    <ArrowLeft size={16} /> Back to Checkouts
                </Link>
                <h1 className="text-xl font-semibold text-gray-900">Create Checkout</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
                {/* FORM */}
                <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-card p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-5">Checkout Details</h2>
                    <div className="flex flex-col gap-5 mb-6">
                        <Input
                            id="title"
                            label="Title"
                            placeholder="Enter checkout title"
                            value={formData.title}
                            onChange={handleChange('title')}
                            required
                            error={errors.title}
                        />

                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="description"
                                className="text-xs font-medium text-gray-700 uppercase tracking-wide"
                            >
                                Description
                            </label>
                            <textarea
                                id="description"
                                value={formData.description}
                                onChange={handleChange('description')}
                                placeholder="Enter a detailed description..."
                                rows={6}
                                className="w-full px-3 py-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg outline-none focus:border-indigo-600 resize-y min-h-[120px]"
                            />
                        </div>

                        <div className="relative">
                            <Input
                                id="amount"
                                label="Amount"
                                type="number"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={handleChange('amount')}
                                required
                                error={errors.amount}
                            />
                            <span className="absolute right-3 bottom-2.5 text-xs font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                                STRK
                            </span>
                        </div>
                    </div>

                    {/* FORM ACTIONS */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <Button variant="secondary" onClick={() => navigate('/checkout')} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create Checkout'}
                        </Button>
                    </div>
                </form>

                {/* PREVIEW */}
                <div>
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Preview</h2>
                    <div className="bg-white border border-gray-200 rounded-card overflow-hidden mb-4">
                        <div className="bg-indigo-600 px-5 py-4">
                            <Logo variant="dark" className="h-5" />
                        </div>
                        <div className="p-6 text-center">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {formData.title || 'Your Checkout Title'}
                            </h3>

                            {formData.description.trim() ? (
                                <p className="text-sm text-gray-700 mb-6 text-left whitespace-pre-wrap break-words">
                                    {formData.description}
                                </p>
                            ) : (
                                <p className="text-sm text-gray-700 mb-6">Description will appear here</p>
                            )}

                            <div className="flex items-baseline justify-center gap-2 mb-6">
                                <span className="text-4xl font-bold text-gray-900">{formData.amount || '0'}</span>
                                <span className="text-gray-700">STRK</span>
                            </div>

                            <button
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 h-10 bg-indigo-600 text-white text-sm font-semibold opacity-50 cursor-not-allowed"
                                disabled
                            >
                                Connect Wallet to Pay
                            </button>
                        </div>
                    </div>

                    {/* PAYMENT LINK */}
                    <div>
                        <span className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                            Payment Link
                        </span>
                        <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-lg border border-gray-200">
                            <LinkIcon size={16} className="text-gray-600 flex-shrink-0" />
                            <span className="flex-1 text-sm text-gray-900 truncate">{previewLink}</span>
                            <button
                                type="button"
                                className="text-gray-600 hover:text-indigo-700 transition-colors flex-shrink-0"
                            >
                                <Copy size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateCheckout;