import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Download } from "lucide-react";
import { useAuthActions, useAuthUser } from "../../context/AuthContext";
import { dispatchWebhook } from "../../services/webhook";
import { IS_STAGING, APP_NAME, STORAGE_PREFIX } from "../../config/env";
import illustration from "../../assets/auth-splash.svg";
import Logo from "../../components/ui/Logo";
import ConnectWalletModal from "../../components/ui/ConnectWalletModal";


/**
 * SignUp page component - entry point for new users to connect their wallet.
 *
 * This component serves as the authentication entry point for the application.
 * Users who are not yet authenticated can connect their wallet here to sign up.
 * Authenticated users are automatically redirected away from this page.
 *
 * @returns {JSX.Element} The SignUp page with wallet connection UI
 */
function SignUp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useAuthUser();
  const { connectWallet, updateProfile } = useAuthActions();

  /** @type {boolean} */
  const [isModalOpen, setIsModalOpen] = useState(false);

  /** @type {string} */
  const redirectTo = searchParams.get("redirect") || "/";

  /**
   * Redirects authenticated users to the specified destination.
   *
   * Runs on mount and whenever user.isAuthenticated changes.
   *
   * @see https://react.dev/learn/you-might-not-need-an-effect
   */
  useEffect(() => {
    if (user.isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [user.isAuthenticated, navigate, redirectTo]);

  /**
   * Handles successful wallet connection - marks user for onboarding,
   * fires webhook event, and navigates to redirect destination.
   *
   * @param {string | null} walletAddress - Connected wallet address or null to use fallback
   * @param {string | null} walletType - Wallet type (e.g., 'evm', 'stellar') or null to use fallback
   */
  const handleConnectSuccess = useCallback((walletAddress, walletType) => {
    // Mark as first-time user so Onboarding/Welcome logic can trigger if needed
    localStorage.setItem("tradazone_onboarded", "false");

    // Fire user.signed_up webhook (non-blocking)
    dispatchWebhook("user.signed_up", {
      walletAddress: walletAddress || user.walletAddress,
      walletType: walletType || user.walletType,
    });
    navigate(redirectTo, { replace: true });
  }, [navigate, redirectTo, user.walletAddress, user.walletType]);


  /**
   * Exports current auth state to CSV file.
   * Downloads auth_data.csv with wallet address and signup status.
   */
  const handleExportToCSV = () => {
    const isAuthenticated = user?.isAuthenticated ?? false;
    const status = isAuthenticated ? "Connected" : "Disconnected";
    const walletAddress = user?.walletAddress || "None";

    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Wallet Address,Status\n" +
      `${walletAddress},${status}\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "auth_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          ⚠️ {APP_NAME} — STAGING ENVIRONMENT. Data is not real and may be reset
          at any time.
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
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 h-10 bg-brand text-white text-sm font-semibold hover:opacity-90 active:scale-95 transition-all mb-4 rounded-lg"
          >
            Connect Wallet
          </button>

          {/* Export to CSV Button */}
          <button
            onClick={handleExportToCSV}
            aria-label="Export signup data to CSV"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 h-10 bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 active:scale-95 transition-all mb-6 rounded-lg"
          >
            <Download size={16} />
            Export to CSV
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
