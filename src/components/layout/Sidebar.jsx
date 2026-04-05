import { NavLink, useNavigate } from 'react-router-dom';
import {
    Home, FileText, ShoppingCart, Users, Package, Settings, LogOut, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/invoices', icon: FileText, label: 'Invoice' },
    { path: '/checkout', icon: ShoppingCart, label: 'Checkout' },
    { path: '/customers', icon: Users, label: 'Customer' },
    { path: '/items', icon: Package, label: 'Items & Services' },
    { path: '/settings', icon: Settings, label: 'Settings' },
];

function Sidebar({ open, onClose }) {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/signin');
    };

    return (
        <>
            {/* Overlay — mobile */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[90] lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed top-header left-0 z-[95]
                h-[calc(100vh-theme(spacing.header))]
                w-sidebar bg-white border-r border-border
                flex flex-col justify-between overflow-y-auto
                transition-transform duration-300 ease-in-out
                ${open ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
            `}>
                {/* Top: Close + Nav */}
                <div className="pt-3 pb-4">
                    {/* Close — mobile only */}
                    <button
                        className="lg:hidden flex items-center gap-2 mx-3 mb-2 px-3 py-2 rounded-lg text-t-muted text-sm hover:bg-coin-gray hover:text-t-primary transition-colors"
                        onClick={onClose}
                    >
                        <X size={16} />
                        <span>Close</span>
                    </button>

                    {/* Section label */}
                    <p className="px-5 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-t-muted/60">
                        Navigation
                    </p>

                    <nav className="flex flex-col gap-0.5 px-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                                        isActive
                                            ? 'bg-brand-bg text-brand font-semibold'
                                            : 'text-t-secondary hover:bg-coin-gray hover:text-t-primary'
                                    }`
                                }
                                end={item.path === '/'}
                            >
                                {({ isActive }) => (
                                    <>
                                        <item.icon
                                            size={18}
                                            strokeWidth={isActive ? 2.2 : 1.8}
                                            className={isActive ? 'text-brand' : 'text-t-muted'}
                                        />
                                        <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                                            {item.label}
                                        </span>
                                        {isActive && (
                                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
                                        )}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* Bottom: Logout */}
                <div className="p-2 pb-5 border-t border-border mt-2">
                    <button
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-t-muted hover:bg-error/5 hover:text-error transition-all duration-150"
                        onClick={handleLogout}
                    >
                        <LogOut size={18} strokeWidth={1.8} />
                        <span>Sign out</span>
                    </button>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
