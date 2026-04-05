/**
 * App shell header (rendered inside Layout for protected App routes).
 *
 * Issue #38: Icon-only controls need accessible names; `<img>` avatar uses `alt`.
 */
import { Bell, Menu, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../ui/Logo';

function Header({ onMenuToggle }) {
    const { user } = useAuth();

    return (
        <header className="h-header bg-white border-b border-border fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-4 lg:px-6">
            {/* Left: hamburger (mobile) + Logo */}
            <div className="flex items-center gap-3">
                {/* Hamburger — mobile only */}
                <button
                    className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-t-secondary hover:bg-coin-gray transition-colors"
                    onClick={onMenuToggle}
                    aria-label="Open menu"
                >
                    <Menu size={20} />
                </button>
                <Logo variant="light" className="h-7" />
            </div>

            {/* Right: Search (desktop) + Bell + Avatar */}
            <div className="flex items-center gap-1 lg:gap-2">
                {/* Search — desktop only */}
                <button className="hidden lg:flex w-9 h-9 rounded-lg items-center justify-center text-t-muted hover:bg-coin-gray hover:text-t-secondary transition-colors">
                    <Search size={18} />
                </button>

                {/* Notifications */}
                <button className="relative w-9 h-9 rounded-lg flex items-center justify-center text-t-muted hover:bg-coin-gray hover:text-t-secondary transition-colors" aria-label="Notifications">
                    <Bell size={18} aria-hidden="true" />
                    {/* Notification dot */}
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-brand rounded-full" />
                </button>

                {/* Divider */}
                <div className="hidden lg:block w-px h-5 bg-border mx-1" />

                {/* Avatar */}
                <button className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-full hover:bg-coin-gray transition-colors group">
                    <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-border flex-shrink-0">
                        <img
                            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=3C3CEF&color=fff&bold=true`}
                            alt={user.name || 'User avatar'}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <span className="hidden lg:block text-[13px] font-semibold text-t-primary max-w-[100px] truncate">
                        {user.name || 'Account'}
                    </span>
                </button>
            </div>
        </header>
    );
}

export default Header;
