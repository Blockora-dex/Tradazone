const CACHE_TTL = 60 * 1000;
let ratesCache = {};
let cacheTimestamp = 0;

export const priceService = {
    getRates: async () => {
        const now = Date.now();
        if (now - cacheTimestamp < CACHE_TTL && Object.keys(ratesCache).length > 0) {
            return ratesCache;
        }

        try {
            const response = await fetch(
                'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,starknet,stellar&vs_currencies=usd,eur,gbp,ngn'
            );

            if (!response.ok) throw new Error('Failed to fetch prices');

            const data = await response.json();

            ratesCache = {
                ETH:  data.ethereum  || {},
                STRK: data.starknet  || {},
                XLM:  data.stellar   || {},
            };
            cacheTimestamp = now;

            return ratesCache;
        } catch (error) {
            console.error('Error fetching crypto prices:', error);
            if (Object.keys(ratesCache).length > 0) return ratesCache;
            return {
                ETH:  { usd: 3000,  eur: 2800,  gbp: 2400,  ngn: 4_500_000 },
                STRK: { usd: 1.5,   eur: 1.4,   gbp: 1.2,   ngn: 2_250    },
                XLM:  { usd: 0.1,   eur: 0.093, gbp: 0.079, ngn: 150      },
            };
        }
    },

    /**
     * Convert a fiat amount to a crypto amount.
     * @param {number} amount - Amount in the specified fiat currency.
     * @param {string} cryptoSymbol - 'ETH' | 'STRK' | 'XLM'
     * @param {string} [fiatCurrency='usd'] - 'usd' | 'eur' | 'gbp' | 'ngn'
     */
    convertFiatToCrypto: async (amount, cryptoSymbol, fiatCurrency = 'usd') => {
        const rates = await priceService.getRates();
        const cryptoRates = rates[cryptoSymbol];
        if (!cryptoRates) return 0;

        const key = fiatCurrency.toLowerCase();
        // Fall back to USD if the requested fiat is not in the response
        const rate = cryptoRates[key] ?? cryptoRates['usd'];
        if (!rate) return 0;

        return parseFloat((amount / rate).toFixed(6));
    },

    /**
     * Derive an approximate fiat-to-fiat exchange rate from crypto cross-rates.
     * Uses STRK as the reference asset (any crypto yields the same result).
     * @param {'usd'|'eur'|'gbp'|'ngn'} from
     * @param {'usd'|'eur'|'gbp'|'ngn'} to
     */
    getFiatRate: async (from, to) => {
        if (from === to) return 1;
        const rates = await priceService.getRates();
        const ref = rates.STRK;
        if (!ref) return 1;
        const fromRate = ref[from.toLowerCase()];
        const toRate   = ref[to.toLowerCase()];
        if (!fromRate || !toRate) return 1;
        // 1 unit of `from` = (toRate / fromRate) units of `to`
        return toRate / fromRate;
    },
};
