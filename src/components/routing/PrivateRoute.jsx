import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loadSession } from '../../context/AuthContext';

/**
 * PrivateRoute
 *
 * Part of the ADR-002 routing model (docs/adr/002-app-routing-stack.md, Issue #202).
 *
 * Guards protected routes by checking BOTH the in-memory React auth state
 * AND the live localStorage session on every render.
 *
 * Three outcomes:
 *  1. Authenticated + live session valid → render children.
 *  2. Authenticated in memory BUT session expired in storage → redirect to
 *     /signin?reason=expired and call logout() to purge in-memory state.
 *  3. Not authenticated at all → redirect to /signin?redirect=<path>.
 *
 * Checking loadSession() directly (not just user.isAuthenticated) is critical:
 * the React state is set once at mount and stays truthy for the entire page
 * session, even after the localStorage TTL has passed.
 */
function PrivateRoute({ children }) {
    const { user, logout } = useAuth();
    const location = useLocation();

    // Live check — reads and re-validates localStorage on every render.
    const liveSession    = loadSession();
    const sessionExpired = user.isAuthenticated && liveSession === null;

    // Purge in-memory state after the redirect has been issued.
    // Runs as an effect (not during render) to avoid state updates mid-render.
    useEffect(() => {
        if (sessionExpired) {
            logout();
        }
    }, [sessionExpired, logout]);

    if (sessionExpired) {
        return (
            <Navigate
                to={`/signin?reason=expired&redirect=${encodeURIComponent(location.pathname)}`}
                replace
            />
        );
    }

    if (!user.isAuthenticated) {
        return (
            <Navigate
                to={`/signin?redirect=${encodeURIComponent(location.pathname)}`}
                replace
            />
        );
    }

    return children;
}

export default PrivateRoute;
