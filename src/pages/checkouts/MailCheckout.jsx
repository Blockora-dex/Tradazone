/**
 * MailCheckout
 *
 * Issue #52: WCAG AA Color Contrast Fix
 * - Replaced low-contrast text tokens with accessible gray/white variants
 * - Updated background and button colors for sufficient contrast
 * - Added focus styles for keyboard accessibility
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { useCheckoutData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/ui/Logo';
import ConnectWalletModal from '../../components/ui/ConnectWalletModal';
import { dispatchWebhook } from '../../services/webhook';

function MailCheckout() {
    const { checkoutId } = useParams();
    const { checkouts } = useCheckoutData();
    const checkout = checkouts.find(c => c.id === checkoutId) || {
        id: checkoutId || 'demo',
        title: 'Premium Package',
        description: 'Full service web development package',
        amount: '200',
        currency: 'STRK'
    };

    const { connectWallet } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Dispatch checkout.viewed on mount
    useEffect(() => {
        dispatchWebhook('checkout.viewed', { id: checkout.id, title: checkout.title });
    }, [checkout.id]);

    const handlePay = () => setIsModalOpen(true);

    const handleConnectSuccess = (walletType) => {
        dispatchWebhook('checkout.paid', {
            id: checkout.id,
            amount: checkout.amount,
            currency: checkout.currency,
            walletType,
        });
        setIsModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* LOGO & HEADER */}
                <div className="text-center mb-8">
                    <Logo variant="dark" className="h-7 mx-auto mb-1" />
                    <p className="text-white/80 text-sm">Secure crypto payment</p>
                </div>

                {/* CHECKOUT CARD */}
                <div className="bg-white rounded-2xl p-8 text-center shadow-xl">
                    <h1 className="text-xl font-bold text-gray-900 mb-2">{checkout.title}</h1>
                    <p className="text-sm text-gray-700 mb-8">{checkout.description}</p>

                    <div className="flex items-baseline justify-center gap-2 mb-8">
                        <span className="text-5xl font-bold text-gray-900">{checkout.amount}</span>
                        <span className="text-lg text-gray-700">{checkout.currency}</span>
                    </div>

                    <button
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 h-10 bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 active:scale-95 transition-all"
                        onClick={handlePay}
                    >
                        <Wallet size={20} /> Connect Wallet to Pay
                    </button>
                </div>

                {/* WALLET MODAL */}
                <ConnectWalletModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConnect={handleConnectSuccess}
                    connectWalletFn={connectWallet}
                />

                {/* FOOTER */}
                <p className="text-center text-sm text-white/70 mt-6">Powered by Tradazone on Starknet</p>
            </div>
        </div>
    );
}

export default MailCheckout;