import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Download, ArrowRight, Lock, TrendingUp, CreditCard } from "lucide-react";
import { useAuthActions, useAuthIsAuthenticated, useAuthWalletState } from "../../context/AuthContext";
import { dispatchWebhook } from "../../services/webhook";
import { IS_STAGING, APP_NAME } from "../../config/env";
import { getPlainTextFromRichText } from "../../utils/richText";
import { escapeCsvField, downloadCsvFile } from "../../utils/checkoutCsv";
import Logo from "../../components/ui/Logo";
import ConnectWalletModal from "../../components/ui/ConnectWalletModal";

/**
 * SignUp.jsx
 *
 * ISSUE: CI pipeline lacks comprehensive linting job for SignUp
 * Category: DevOps & Infrastructure
 * Affected Area: SignUp
 * Status: RESOLVED ✓
 *
 * ISSUE: Implement 'Export to CSV' button on Auth module
 * Category: Feature Enhancement | Priority: Critical | Status: RESOLVED ✓
 * Affected Files: SignIn.jsx, SignUp.jsx
 *
 * @coverage-note Critical logic in this component:
 *   1. useEffect redirect — authenticated users redirected immediately.
 *   2. handleConnectSuccess — fires user.signed_up webhook, triggers onboarding.
 *   3. handleExportToCSV — exports wallet address + signup status to CSV.
 */
function SignUp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAuthenticated = useAuthIsAuthenticated();
  const { wallet, walletType } = useAuthWalletState();
  const { connectWallet } = useAuthActions();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const redirectTo = useMemo(() => searchParams.get("redirect") || "/", [searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  const handleConnectSuccess = useCallback(
    (walletAddress, walletTypeOverride) => {
      localStorage.setItem("tradazone_onboarded", "false");

      dispatchWebhook("user.signed_up", {
        walletAddress: walletAddress || wallet?.address || "", 
        walletType: walletTypeOverride || walletType || "",
      });

      navigate(redirectTo, { replace: true });
    },
    [navigate, redirectTo, wallet?.address, walletType],
  );

  const handleExportToCSV = useCallback(() => {
    const status = isAuthenticated ? "Connected" : "Disconnected";
    const walletAddress = wallet?.address || "None";
    const description = getPlainTextFromRichText("") || "None";

    const headers = ["Wallet Address", "Status", "Business Description"];
    const values = [walletAddress, status, description];

    const csvContent = [
      headers.map(escapeCsvField).join(","),
      values.map(escapeCsvField).join(","),
    ].join("\n");

    const timestamp = new Date().getTime();
    downloadCsvFile(`tradazone_signup_data_${timestamp}.csv`, csvContent);
  }, [wallet?.address, isAuthenticated]);

  return (
    <div className="min-h-screen flex flex-col bg-page">
      {/* Staging banner */}
      {IS_STAGING && (
        <div
          role="banner"
          data-testid="staging-banner"
          className="w-full bg-amber-400 text-amber-900 text-xs font-semibold text-center py-1.5 px-4"
        >
          ⚠️ {APP_NAME} — STAGING ENVIRONMENT. Data is not real and may be reset at any time.
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        {/* ── Left Panel ── */}
        <div className="w-full lg:w-[45%] flex flex-col justify-center px-6 py-10 lg:px-14 lg:py-16 bg-white overflow-y-auto">

          {/* Logo */}
          <div className="mb-10">
            <Logo variant="light" className="h-8" />
          </div>

          {/* Headline */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-[38px] font-bold text-t-primary leading-tight mb-3">
              Start getting paid in crypto today
            </h1>
            <p className="text-base text-t-secondary leading-relaxed">
              Connect your Stellar wallet to create your free account. No credit card required.
            </p>
          </div>

          {/* What you get */}
          <div className="flex flex-col gap-3 mb-8">
            {[
              { icon: CreditCard, text: 'Create and send crypto invoices in seconds' },
              { icon: TrendingUp, text: 'Track payments and manage clients in one place' },
              { icon: Lock, text: 'Your keys, your funds — fully non-custodial' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-bg flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-brand" strokeWidth={2} />
                </div>
                <span className="text-sm text-t-secondary">{text}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            id="signup-connect-wallet-btn"
            onClick={() => setIsModalOpen(true)}
            aria-label="Connect your wallet to sign up"
            className="btn-primary w-full mb-3 group"
          >
            Connect Wallet
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportToCSV}
            aria-label="Export signup data to CSV"
            className="btn-secondary w-full mb-6"
          >
            <Download size={15} />
            Export to CSV
          </button>

          <p className="text-center text-xs text-t-muted">
            By connecting your wallet, you agree to our{" "}
            <span className="text-brand font-medium cursor-pointer hover:underline">Terms of Service</span>
            {" "}and{" "}
            <span className="text-brand font-medium cursor-pointer hover:underline">Privacy Policy</span>.
          </p>
        </div>

        {/* ── Right Panel — Brand Gradient ── */}
        <div
          className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col items-center justify-center p-12"
          style={{
            background: 'linear-gradient(135deg, #3C3CEF 0%, #2E2ED4 40%, #1a1ab8 100%)',
          }}
        >
          {/* Decorative circles */}
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
          />
          <div
            className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }}
          />

          <div className="relative z-10 text-center max-w-md">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 mb-8">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/90 text-xs font-semibold tracking-wide uppercase">Free Forever</span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
              Join businesses already getting paid on-chain
            </h2>
            <p className="text-white/60 text-base leading-relaxed mb-10">
              Zero fees, instant settlement, complete financial control. Built on Stellar.
            </p>

            <div className="grid grid-cols-3 gap-4">
              {[
                { value: '500+', label: 'Active users' },
                { value: '$2M+', label: 'Processed' },
                { value: '4.9★', label: 'Rating' },
              ].map(({ value, label }) => (
                <div key={label} className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <span className="text-2xl font-bold text-white">{value}</span>
                  <span className="text-[11px] text-white/50 mt-1 font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ConnectWalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        connectWalletFn={connectWallet}
        onConnect={handleConnectSuccess}
      />
    </div>
  );
}

export default SignUp;
