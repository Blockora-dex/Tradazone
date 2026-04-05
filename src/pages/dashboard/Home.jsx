import { Link } from 'react-router-dom';
import {
    Wallet,
    TrendingUp,
    ArrowDownRight,
    FileText,
    Users,
    ShoppingCart,
    Package,
    Zap,
    ChevronDown,
    ArrowUpRight,
    Activity,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import WelcomeModal from '../../components/ui/WelcomeModal';

function Home() {
    const { wallet } = useAuth();
    const { transactions, dashboardStats } = useData();
    const recentTransactions = transactions.slice(0, 5);

    return (
        <div className="max-w-[1100px]">
            <WelcomeModal />

            {/* ── Page Heading ── */}
            <div className="flex items-center justify-between mb-7">
                <div>
                    <h1 className="text-2xl font-bold text-t-primary leading-tight">
                        Dashboard
                    </h1>
                    <p className="text-sm text-t-muted mt-0.5">
                        Welcome back — here&apos;s your financial overview.
                    </p>
                </div>
                <Link
                    to="/invoices/create"
                    className="btn-primary btn-sm hidden lg:inline-flex"
                >
                    New Invoice
                    <ArrowUpRight size={14} />
                </Link>
            </div>

            {/* ── Top Row: Wallet + Receivable ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

                {/* Wallet Balance Card — brand gradient */}
                <div
                    className="rounded-card p-6 text-white flex flex-col min-h-[200px] relative overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, #3C3CEF 0%, #2E2ED4 50%, #2525c2 100%)',
                    }}
                >
                    {/* Decorative glow */}
                    <div
                        className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
                        style={{
                            background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)',
                            transform: 'translate(20%, -20%)',
                        }}
                    />

                    <div className="flex items-center justify-between mb-auto">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Wallet size={15} strokeWidth={2} className="text-white" />
                            </div>
                            <span className="text-xs text-white/60 font-mono font-medium">
                                {wallet?.address
                                    ? `${wallet.address.slice(0, 8)}...${wallet.address.slice(-4)}`
                                    : 'Not connected'}
                            </span>
                        </div>
                        <span className="text-[10px] font-semibold tracking-widest uppercase text-white/40 bg-white/10 px-2.5 py-1 rounded-full">
                            LIVE
                        </span>
                    </div>

                    <div className="mt-6">
                        <p className="text-xs text-white/50 font-medium mb-1 uppercase tracking-wider">Wallet Balance</p>
                        <div className="flex items-end gap-2">
                            <span className="text-[46px] font-bold leading-none tracking-tight tabular">
                                {dashboardStats?.walletBalance || '0.00'}
                            </span>
                            <span className="text-lg text-white/40 font-medium mb-1">STRK</span>
                        </div>
                    </div>
                </div>

                {/* Total Receivable Card */}
                <div className="bg-white border border-border rounded-card p-6 flex flex-col min-h-[200px] shadow-card hover:shadow-card-hover transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-brand-bg flex items-center justify-center">
                                <ArrowDownRight size={16} strokeWidth={2} className="text-brand" />
                            </div>
                            <span className="text-sm font-semibold text-t-primary">Total Receivable</span>
                        </div>
                        <span className="badge bg-success/10 text-success text-[10px]">Active</span>
                    </div>
                    <p className="text-xs text-t-muted mb-5 ml-10">Outstanding unpaid invoices</p>

                    {/* Progress Bar — rounded */}
                    <div className="w-full h-2 bg-page rounded-full overflow-hidden mb-5">
                        <div
                            className="h-full bg-brand rounded-full transition-all duration-500"
                            style={{
                                width: (() => {
                                    const bal = parseFloat(dashboardStats?.walletBalance) || 0;
                                    const rec = parseFloat(String(dashboardStats?.receivables || '').replace(',', '')) || 0;
                                    const total = bal + rec;
                                    return total > 0 ? `${(bal / total) * 100}%` : '0%';
                                })()
                            }}
                        />
                    </div>

                    {/* Stats */}
                    <div className="flex gap-8 mt-auto">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] text-t-muted font-semibold uppercase tracking-wider">Current</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-bold text-t-primary tabular">
                                    {dashboardStats?.walletBalance || '0'}
                                </span>
                                <span className="text-xs text-brand font-semibold">STRK</span>
                            </div>
                        </div>
                        <div className="w-px bg-border" />
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] text-t-muted font-semibold uppercase tracking-wider">Unpaid</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-bold text-t-primary tabular">
                                    {dashboardStats?.receivables || '0'}
                                </span>
                                <span className="text-xs text-brand font-semibold">STRK</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Middle Row: Transactions + Activity ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

                {/* Transactions Card */}
                <div className="bg-white border border-border rounded-card overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-200">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                        <div className="flex items-center gap-2.5">
                            <FileText size={16} strokeWidth={2} className="text-t-muted" />
                            <span className="font-semibold text-sm text-t-primary">Transactions</span>
                        </div>
                        <button className="flex items-center gap-1 text-xs text-t-muted font-medium px-3 py-1.5 border border-border rounded-full bg-white hover:bg-coin-gray transition-colors">
                            Last 6 months <ChevronDown size={12} />
                        </button>
                    </div>

                    <div>
                        {recentTransactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-14 text-center px-6">
                                <div className="w-12 h-12 bg-coin-gray rounded-xl flex items-center justify-center mb-3">
                                    <FileText size={22} className="text-t-muted/50" strokeWidth={1.5} />
                                </div>
                                <p className="text-sm font-semibold text-t-secondary mb-1">No transactions yet</p>
                                <p className="text-xs text-t-muted">Transactions will appear here once you get paid.</p>
                            </div>
                        ) : (
                            recentTransactions.map((tx, i) => (
                                <div
                                    key={tx.id}
                                    className={`flex items-center gap-3 px-5 py-3.5 hover:bg-page transition-colors cursor-pointer ${
                                        i < recentTransactions.length - 1 ? 'border-b border-border' : ''
                                    }`}
                                >
                                    <div className="w-9 h-9 bg-brand-bg rounded-xl flex items-center justify-center text-brand flex-shrink-0">
                                        <FileText size={15} strokeWidth={2} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="block text-[13px] font-semibold text-t-primary truncate">{tx.description}</span>
                                        <span className="block text-[11px] text-t-muted mt-0.5">{tx.date}</span>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <span className="block text-[13px] font-bold text-t-primary tabular">
                                            {tx.amount}<span className="text-brand text-[11px] ml-0.5">STRK</span>
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Activity Card */}
                <div className="bg-white border border-border rounded-card overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-200">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                        <div className="flex items-center gap-2.5">
                            <Activity size={16} strokeWidth={2} className="text-t-muted" />
                            <span className="font-semibold text-sm text-t-primary">Activity</span>
                        </div>
                        <button className="flex items-center gap-1 text-xs text-t-muted font-medium px-3 py-1.5 border border-border rounded-full bg-white hover:bg-coin-gray transition-colors">
                            Last 6 months <ChevronDown size={12} />
                        </button>
                    </div>

                    <div>
                        {recentTransactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-14 text-center px-6">
                                <div className="w-12 h-12 bg-coin-gray rounded-xl flex items-center justify-center mb-3">
                                    <TrendingUp size={22} className="text-t-muted/50" strokeWidth={1.5} />
                                </div>
                                <p className="text-sm font-semibold text-t-secondary mb-1">No activity yet</p>
                                <p className="text-xs text-t-muted">Your activity feed will show up here.</p>
                            </div>
                        ) : (
                            recentTransactions.map((tx, i) => (
                                <div
                                    key={`act-${tx.id}`}
                                    className={`flex items-center gap-3 px-5 py-3.5 hover:bg-page transition-colors cursor-pointer ${
                                        i < recentTransactions.length - 1 ? 'border-b border-border' : ''
                                    }`}
                                >
                                    <div className="w-9 h-9 bg-success/10 rounded-xl flex items-center justify-center text-success flex-shrink-0">
                                        <TrendingUp size={15} strokeWidth={2} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="block text-[13px] font-semibold text-t-primary truncate">
                                            Invoice sent to {tx.customer || 'Client'}
                                        </span>
                                        <span className="block text-[11px] text-t-muted mt-0.5">{tx.date}</span>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <span className="block text-[13px] font-bold text-t-primary tabular">
                                            {tx.amount}<span className="text-brand text-[11px] ml-0.5">STRK</span>
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* ── Quick Actions ── */}
            <div className="bg-white border border-border rounded-card px-6 py-7 shadow-card">
                <div className="flex items-center gap-2 mb-6">
                    <Zap size={16} className="text-accent-orange" strokeWidth={2} />
                    <span className="text-sm font-semibold text-t-primary">Quick Actions</span>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { icon: FileText, label: 'New Invoice', sub: 'Send in seconds', to: '/invoices/create', color: 'text-brand', bg: 'bg-brand-bg' },
                        { icon: Users, label: 'Add Customer', sub: 'Manage clients', to: '/customers/add', color: 'text-purple-600', bg: 'bg-purple-50' },
                        { icon: ShoppingCart, label: 'Checkout', sub: 'Payment page', to: '/checkout/create', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { icon: Package, label: 'Add Product', sub: 'Items & services', to: '/items/add', color: 'text-orange-500', bg: 'bg-orange-50' },
                    ].map((action) => (
                        <Link
                            key={action.label}
                            to={action.to}
                            className="flex flex-col items-center gap-2.5 p-4 rounded-xl hover:bg-coin-gray active:scale-[0.97] transition-all duration-150 group"
                        >
                            <div className={`w-12 h-12 ${action.bg} ${action.color} rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-150`}>
                                <action.icon size={22} strokeWidth={1.8} />
                            </div>
                            <div className="text-center">
                                <span className="block text-[12px] font-semibold text-t-primary">{action.label}</span>
                                <span className="block text-[10px] text-t-muted mt-0.5">{action.sub}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Home;
