import { useNavigate } from 'react-router-dom';

/**
 * Reusable empty state component for list pages.
 * * ISSUE #134: Support dark mode themes in CustomerList.
 * Added 'dark:' variants for background, icon container, and text.
 */
function EmptyState({ icon: Icon, title, description, actionLabel, actionPath }) {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center transition-colors">
            {/* Icon Container: Softer, larger container with coin-gray */}
            <div className="w-20 h-20 rounded-full bg-coin-gray dark:bg-zinc-900 flex items-center justify-center mb-6">
                {Icon && (
                    <Icon 
                        size={32} 
                        className="text-t-muted dark:text-zinc-500" 
                        strokeWidth={1.5} 
                    />
                )}
            </div>

            {/* Title: Coinbase style hierarchy */}
            <h3 className="text-[18px] font-semibold text-t-primary dark:text-zinc-100 mb-2">
                {title}
            </h3>

            {/* Description: Coinbase muted blue-gray */}
            <p className="text-[15px] text-t-secondary dark:text-zinc-500 max-w-sm mb-8 leading-relaxed">
                {description}
            </p>

            {actionLabel && actionPath && (
                <button
                    onClick={() => navigate(actionPath)}
                    className="btn-primary"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}

export default EmptyState;