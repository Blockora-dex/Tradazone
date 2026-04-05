/**
 * @fileoverview SignIn — landing page and wallet connection entry point.
 *
 * ISSUE: #174 (Build size limits and monitoring for SignIn)
 * Category: DevOps & Infrastructure
 * Affected Area: SignIn
 * Description: Implement production build size limits and monitoring for SignIn.
 * This page is the main entry point and includes modal components; build size
 * monitoring is enforced in vite.config.js and CI to prevent bundle bloat.
 *
 * ISSUE: Implement 'Export to CSV' button on Auth module
 * Category: Feature Enhancement | Priority: Critical | Status: RESOLVED ✓
 * Affected Files: SignIn.jsx, SignUp.jsx
 * Description: Added CSV export buttons exporting wallet address + auth status.
 * CSV Format: "Wallet Address,Status\n<address>,<status>"
 * Download: Client-side data URI (no server deps).
 * Testing: Manual verification - no regressions.
 */
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuthActions, useAuthIsAuthenticated, useAuthWalletState } from "../../context/AuthContext";
import { AlertCircle, Download, Shield, Zap, Globe, ArrowRight } from "lucide-react";

import Logo from "../../components/ui/Logo";
import ConnectWalletModal from "../../components/ui/ConnectWalletModal";
import StagingBanner from "../../components/ui/StagingBanner";

function SignIn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAuthenticated = useAuthIsAuthenticated();
  const { connectWallet } = useAuthActions();
  const { lastWallet } = useAuthWalletState();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const redirectTo = useMemo(() => searchParams.get("redirect") || "/", [searchParams]);
  const sessionExpired = searchParams.get("reason") === "expired";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  const handleConnectSuccess = useCallback(() => {
    navigate(redirectTo, { replace: true });
  }, [navigate, redirectTo]);

  const handleExportToCSV = useCallback(() => {
    const status = isAuthenticated ? "Connected" : "Disconnected";
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Wallet Address,Status\n" +
      `${lastWallet || "None"},${status}\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "auth_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [lastWallet, isAuthenticated]);

  const shortWallet = lastWallet
    ? `${lastWallet.slice(0, 6)}...${lastWallet.slice(-4)}`
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-page">
      <StagingBanner />
      <div className="flex flex-1 min-h-0">

        {/* ── Left Panel ── */}
        <div className="w-full lg:w-[45%] flex flex-col justify-center px-6 py-10 lg:px-14 lg:py-16 bg-white overflow-y-auto">

          {/* Logo */}
          <div className="mb-10">
            <Logo variant="light" className="h-8" />
          </div>

          {/* Session expired banner */}
          {sessionExpired && (
            <div className="flex items-start gap-3 px-4 py-3.5 mb-6 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>Your session expired — reconnect to continue.</span>
            </div>
          )}

          {/* Headline */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-[38px] font-bold text-t-primary leading-tight mb-3">
              The fastest way to get paid in crypto
            </h1>
            <p className="text-base text-t-secondary leading-relaxed">
              Manage clients, send invoices, and accept payments directly to your wallet — no middlemen.
            </p>
          </div>

          {/* Returning user hint */}
          {shortWallet && !sessionExpired && (
            <div className="flex items-center gap-3 px-4 py-3 mb-5 bg-brand-bg border border-brand/20 rounded-xl text-sm text-brand">
              <span className="w-2.5 h-2.5 rounded-full bg-brand flex-shrink-0" />
              <span>
                Welcome back —{" "}
                <span className="font-mono font-semibold">{shortWallet}</span>
              </span>
            </div>
          )}

          {/* Connect Wallet CTA */}
          <button
            id="signin-connect-wallet-btn"
            onClick={() => setIsModalOpen(true)}
            aria-label="Connect your wallet to sign in"
            className="btn-primary w-full mb-3 group"
          >
            Connect Wallet
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Export to CSV — secondary */}
          <button
            onClick={handleExportToCSV}
            aria-label="Export authentication data to CSV"
            className="btn-secondary w-full mb-8"
          >
            <Download size={15} />
            Export to CSV
          </button>

          {/* Split link */}
          <p className="text-center text-sm text-t-muted mb-10">
            New to Tradazone?{" "}
            <Link to="/signup" className="text-brand font-semibold hover:underline">
              Create account
            </Link>
          </p>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Shield, label: 'Non-custodial', sub: 'You keep your keys' },
              { icon: Zap, label: 'Instant settle', sub: 'Stellar network' },
              { icon: Globe, label: 'Global reach', sub: '180+ countries' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center text-center p-3 bg-coin-gray rounded-xl">
                <Icon size={18} className="text-brand mb-1.5" strokeWidth={1.8} />
                <span className="text-[11px] font-semibold text-t-primary">{label}</span>
                <span className="text-[10px] text-t-muted mt-0.5">{sub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Panel — Brand Gradient ── */}
        <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col items-center justify-center p-12"
          style={{
            background: 'linear-gradient(135deg, #3C3CEF 0%, #2E2ED4 40%, #1a1ab8 100%)',
          }}
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

          {/* Content */}
          <div className="relative z-10 text-center max-w-md">
            {/* App name badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 mb-8">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/90 text-xs font-semibold tracking-wide uppercase">Live Network</span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
              Invoice &amp; collect payments on-chain
            </h2>
            <p className="text-white/60 text-base leading-relaxed mb-10">
              Powered by the Stellar network for near-instant, near-free global payments.
            </p>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: '0.001s', label: 'Avg settle time' },
                { value: '$0.00', label: 'Network fee' },
                { value: '100%', label: 'Non-custodial' },
              ].map(({ value, label }) => (
                <div key={label} className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <span className="text-2xl font-bold text-white tabular">{value}</span>
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

export default SignIn;
