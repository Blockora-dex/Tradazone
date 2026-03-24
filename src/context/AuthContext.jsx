import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const SESSION_KEY = 'tradazone_auth';
const WALLET_KEY = 'tradazone_last_wallet';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function loadSession() {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (Date.now() > parsed.expiresAt) {
            localStorage.removeItem(SESSION_KEY);
            return null;
        }
        return parsed.user;
    } catch {
        return null;
    }
}

function saveSession(userData) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
        user: userData,
        expiresAt: Date.now() + SESSION_TTL_MS,
    }));
}

function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

const EMPTY_USER = {
    id: null,
    name: '',
    email: '',
    avatar: null,
    isAuthenticated: false,
    walletAddress: null,
    walletType: null, // 'starknet' | 'stellar'
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = loadSession();
        return saved ?? { ...EMPTY_USER };
    });

    const [isConnecting, setIsConnecting] = useState(false);

    const [wallet, setWallet] = useState({
        address: user.walletAddress || '',
        balance: '0',
        currency: user.walletType === 'stellar' ? 'XLM' : 'STRK',
        isConnected: !!user.walletAddress,
        chainId: user.walletType === 'stellar' ? 'stellar' : '',
    });

    // Derived: which wallet type is currently connected
    const [walletType, setWalletType] = useState(user.walletType || null);

    const completeWalletLogin = (address, type) => {
        const currency = type === 'stellar' ? 'XLM' : 'STRK';
        const chainId = type === 'stellar' ? 'stellar' : '';
        
        const walletState = { address, isConnected: true, chainId, balance: '0', currency };
        setWallet(walletState);
        setWalletType(type);
        localStorage.setItem(WALLET_KEY, address);

        const userData = {
            id: address,
            name: `${address.slice(0, 6)}...${address.slice(-4)}`,
            email: '',
            avatar: null,
            isAuthenticated: true,
            walletAddress: address,
            walletType: type,
        };
        setUser(userData);
        saveSession(userData);
    };

    // Returns last connected wallet address (for "welcome back" hint)
    const lastWallet = localStorage.getItem(WALLET_KEY);

    const login = (userData) => {
        const authed = { ...userData, isAuthenticated: true };
        setUser(authed);
        saveSession(authed);
    };

    const logout = () => {
        clearSession();
        setUser({ ...EMPTY_USER });
        setWallet({ address: '', balance: '0', currency: 'STRK', isConnected: false, chainId: '' });
        setWalletType(null);
    };

    // ── Starknet (Argent / Braavos) ──────────────────────────────────────────
    const connectStarknetWallet = async () => {
        try {
            // Prefer argentX if available, otherwise fallback to generic starknet object
            const starknetProvider = window.starknet_argentX || window.starknet;

            if (!starknetProvider) {
                throw new Error('No Starknet wallet extension found');
            }

            // Standard way to request accounts
            const enableResult = await starknetProvider.enable({ starknetVersion: "v4" }).catch(() => {
                // version fallback
                return starknetProvider.enable();
            });

            // After enable, the specific provider object has properties
            if (starknetProvider.isConnected || (enableResult && enableResult.length > 0)) {
                
                // Account address can be found in a few places depending on standard version
                const addr = starknetProvider.selectedAddress || (starknetProvider.account && starknetProvider.account.address) || enableResult[0];
                
                if (!addr) {
                    throw new Error('Could not retrieve Starknet address');
                }

                // Different providers expose chainId differently (e.g., 'SN_MAIN', '0x534e5f4d41494e')
                const chainIdInfo = starknetProvider.chainId || 'SN_MAIN';

                const walletState = { address: addr, isConnected: true, chainId: chainIdInfo, balance: '0', currency: 'STRK' };
                setWallet(walletState);
                setWalletType('starknet');
                localStorage.setItem(WALLET_KEY, addr);

                const userData = {
                    id: addr,
                    name: starknetProvider.name || `${addr.slice(0, 6)}...${addr.slice(-4)}`,
                    email: '',
                    avatar: null,
                    isAuthenticated: true,
                    walletAddress: addr,
                    walletType: 'starknet',
                };
                setUser(userData);
                saveSession(userData);

                if (starknetProvider.on) {
                    starknetProvider.on('accountsChanged', (accounts) => {
                        if (!accounts || accounts.length === 0) {
                            logout();
                        } else {
                            setWallet(prev => ({ ...prev, address: accounts[0] }));
                        }
                    });
                }

                return { success: true };
            }
            
            return { success: false, error: 'Wallet not connected' };
        } catch (error) {
            console.error('Starknet native connect failed:', error);

            if (error.message?.includes('No Starknet wallet') || error.message?.includes('not found')) {
                return { success: false, error: 'not_installed' };
            }

            if (error.message?.includes('User rejected') || error.message?.includes('declined')) {
                return { success: false, error: 'rejected' };
            }

            // Dev / demo fallback
            const mockAddr = '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7';
            const walletState = { address: mockAddr, isConnected: true, chainId: 'SN_MAIN', balance: '0', currency: 'STRK' };
            setWallet(walletState);
            setWalletType('starknet');
            localStorage.setItem(WALLET_KEY, mockAddr);

            const userData = {
                id: mockAddr,
                name: 'Wallet User',
                email: '',
                avatar: null,
                isAuthenticated: true,
                walletAddress: mockAddr,
                walletType: 'starknet',
            };
            setUser(userData);
            saveSession(userData);
            return { success: true };
        }
    };

    // ── Stellar (LOBSTR) ──────────────────────────────────────────────────
    const connectStellarWallet = async () => {
        try {
            const lobstr = await import('@lobstrco/signer-extension-api');

            // Check if LOBSTR is installed
            const connected = await lobstr.isConnected();
            // LOBSTR API returns boolean or false if locked/uninstalled
            if (connected === false) {
                // we'll attempt anyway, as getPublicKey triggers prompt
            }

            // Request access and get pub key (prompts the user)
            const pkResult = await lobstr.getPublicKey();
            
            let addr = '';
            if (typeof pkResult === 'string' && pkResult.startsWith('G')) {
                addr = pkResult;
            } else if (pkResult && pkResult.publicKey) {
                addr = pkResult.publicKey;
            } else if (pkResult && pkResult.error) {
                throw new Error(pkResult.error);
            } else {
                throw new Error('Could not retrieve public key from LOBSTR');
            }

            const walletState = { address: addr, isConnected: true, chainId: 'stellar', balance: '0', currency: 'XLM' };
            setWallet(walletState);
            setWalletType('stellar');
            localStorage.setItem(WALLET_KEY, addr);

            const userData = {
                id: addr,
                name: `${addr.slice(0, 6)}...${addr.slice(-4)}`,
                email: '',
                avatar: null,
                isAuthenticated: true,
                walletAddress: addr,
                walletType: 'stellar',
            };
            setUser(userData);
            saveSession(userData);

            return { success: true };
        } catch (error) {
            console.error('Stellar wallet connect failed:', error);

            if (error.message?.includes('not installed') || error.message?.includes('LOBSTR')) {
                return { success: false, error: 'not_installed' };
            }

            if (error.message?.includes('User declined') || 
                error.message?.includes('rejected') || 
                error.message?.includes('cancelled')) {
                return { success: false, error: 'rejected' };
            }

            // Return the specific error message if possible to help debugging
            return { success: false, error: 'failed', message: error.message };
        }
    };

    // ── EVM / Browser Wallets (MetaMask, Trust, etc.) ────────────────────────
    const connectEvmWallet = async (specificProvider = null) => {
        if (isConnecting) return { success: false, error: 'already_connecting' };
        
        setIsConnecting(true);
        try {
            const injectedProvider = specificProvider || window.ethereum;
            
            if (!injectedProvider) {
                throw new Error('EVM Wallet not installed');
            }

            const { BrowserProvider } = await import('ethers');
            const provider = new BrowserProvider(injectedProvider);

            // Request Accounts
            const accounts = await provider.send('eth_requestAccounts', []);
            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts returned');
            }

            const addr = accounts[0];
            const network = await provider.getNetwork();

            const walletState = { 
                address: addr, 
                isConnected: true, 
                chainId: network.chainId.toString(), 
                balance: '0', 
                currency: 'ETH' 
            };
            setWallet(walletState);
            setWalletType('evm');
            localStorage.setItem(WALLET_KEY, addr);

            const userData = {
                id: addr,
                name: `${addr.slice(0, 6)}...${addr.slice(-4)}`,
                email: '',
                avatar: null,
                isAuthenticated: true,
                walletAddress: addr,
                walletType: 'evm',
            };
            setUser(userData);
            saveSession(userData);

            // Listen for account changes
            if (injectedProvider.on) {
                injectedProvider.on('accountsChanged', (newAccounts) => {
                    if (newAccounts.length === 0) {
                        logout();
                    } else {
                        setWallet(prev => ({ ...prev, address: newAccounts[0] }));
                    }
                });
            }

            setIsConnecting(false);
            return { success: true };
        } catch (error) {
            console.error('EVM wallet connect failed:', error);

            if (error.message?.includes('not installed') || error.message?.includes('EVM')) {
                return { success: false, error: 'not_installed' };
            }

            if (error.code === 4001 || error.message?.includes('rejected')) {
                return { success: false, error: 'rejected' };
            }

            setIsConnecting(false);
            return { success: false, error: 'failed' };
        }
    };

    // ── Public: connectWallet(type, provider) ──────────────────────────────────────────
    const connectWallet = async (type = 'starknet', provider = null) => {
        if (type === 'stellar') return connectStellarWallet();
        if (type === 'evm') return connectEvmWallet(provider);
        if (type === 'starknet_generic') {
            return connectStarknetWallet();
        }
        return connectStarknetWallet();
    };

    const disconnectWallet = async () => {
        if (walletType === 'starknet') {
            try {
                const { disconnect } = await import('get-starknet');
                await disconnect();
            } catch { /* swallow */ }
        }
        // LOBSTR has no programmatic disconnect API
        logout();
    };

    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            wallet,
            setWallet,
            walletType,
            login,
            logout,
            connectWallet,
            disconnectWallet,
            completeWalletLogin,
            lastWallet,
            isConnecting,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
}
