import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dispatchWebhook } from '../../services/webhook';
import { IS_STAGING, APP_NAME } from '../../config/env';
import illustration from '../../assets/auth-splash.svg';
import Logo from '../../components/ui/Logo';
import ConnectWalletModal from '../../components/ui/ConnectWalletModal';

/**
 * SignUp.jsx
 *
 * ISSUE: Staging config for SignUp deployments
 * Category: DevOps & Infrastructure
 * Affected Area: SignUp
 * Description: Missing staging environment configuration for SignUp deployments.
 * This file contains the SignUp component that requires proper staging env vars
 * (VITE_APP_ENV=staging, VITE_APP_NAME, etc.) for banner display and behavior.
 */

function SignUp() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { connectWallet, user } = useAuth();

    const [isModalOpen, setIsModalOpen] = useState(false);

    const redirectTo = searchParams.get('redirect') || '/';

    useEffect(() => {
        if (user.isAuthenticated) {
            navigate(redirectTo, { replace: true });
        }
    }, [user.isAuthenticated, navigate, redirectTo]);

    const handleConnectSuccess = (walletAddress, walletType) => {
        // Mark as first-time user so Onboarding/Welcome logic can trigger if needed
        localStorage.setItem('tradazone_onboarded', 'false');
        // Fire user.signed_up webhook (non-blocking)
        dispatchWebhook('user.signed_up', {
            walletAddress: walletAddress || user.walletAddress,
            walletType: walletType || user.walletType,
        });
        navigate(redirectTo, { replace: true });
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* ── Staging environment banner ── */}
            {IS_STAGING && (
                <div
                    role="banner"
                    data-testid="staging-banner"
                    className="w-full bg-amber-400 text-amber-900 text-xs font-semibold text-center py-1.5 px-4"
                >
                    ⚠️ {APP_NAME} — STAGING ENVIRONMENT. Data is not real and may be reset at any time.
                </div>
            )}

            <div className="flex flex-1">
            {/* ── Left Panel ── */}
            <div className="w-full lg:w-[40%] flex flex-col justify-start px-6 py-8 lg:px-10 lg:py-10 bg-white overflow-y-auto">
                {/* Logo */}
                <div className="mb-8 lg:mb-12">
                    <Logo variant="light" className="h-7 lg:h-9" />
                </div>

                {/* Headline */}
                <h1 className="text-xl lg:text-3xl font-bold text-t-primary mb-3 leading-snug">
                    Manage clients, send invoices, and accept payments directly into your preferred wallet
                </h1>
                <p className="text-sm text-t-muted mb-8 lg:mb-10">
                    Connect your wallet to get started
                </p>

                {/* Connect Wallet Button */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 h-10 bg-brand text-white text-sm font-semibold hover:opacity-90 active:scale-95 transition-all mb-6 rounded-lg"
                >
                    Connect Wallet
                </button>

                <ConnectWalletModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    connectWalletFn={connectWallet}
                    onConnect={handleConnectSuccess}
                />


            </div>

            {/* ── Right Panel — Illustration ── */}
            <div className="hidden lg:block lg:w-[60%] bg-gray-50 relative overflow-hidden">
                <img
                    src={illustration}
                    alt="Tradazone — invoices, payments, crypto"
                    className="absolute inset-0 w-full h-full object-cover"
                />
            </div>
            </div>
        </div>
    );
}

export default SignUp;
