import { useState, useCallback } from "react";
import { isConnected, requestAccess, getNetwork } from "@stellar/freighter-api";
import { waitForFreighter } from "../utils/detectFreighter";

export function useFreighter() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [publicKey, setPublicKey] = useState(null);
  const [network, setNetwork] = useState(null);

  const connect = useCallback(async () => {
    // Guard: prevent double-clicks / overlapping calls
    if (isConnecting) return null;

    setError(null);
    setIsConnecting(true);

    try {
      // Step 1: Wait for Freighter to inject into window (up to 3s)
      const detected = await waitForFreighter(3000);
      if (!detected) {
        throw new Error("NOT_INSTALLED");
      }

      // Step 2: Check if Freighter is unlocked.
      // NOTE: newer versions of @stellar/freighter-api return an _object_:
      //   { isConnected: true } or { isConnected: false }
      // Older versions return a plain boolean.
      // We handle both here.
      const connectionResult = await isConnected();
      const connected =
        typeof connectionResult === "boolean"
          ? connectionResult
          : !!connectionResult?.isConnected;

      if (!connected) {
        throw new Error("LOCKED");
      }

      // Step 3: Request wallet access — fires the Freighter popup
      const accessResult = await requestAccess();

      // Again, newer versions return { address, error } object,
      // older versions return the address string directly.
      let address = null;
      if (typeof accessResult === "string") {
        address = accessResult; // old API
      } else if (accessResult?.address) {
        address = accessResult.address; // new API
      } else if (accessResult?.error) {
        throw new Error("ACCESS_DENIED");
      } else {
        throw new Error("ACCESS_DENIED");
      }

      // Step 4: Get the current network to verify config
      let currentNetwork = "UNKNOWN";
      try {
        const netResult = await getNetwork();
        currentNetwork =
          typeof netResult === "string"
            ? netResult
            : netResult?.network ?? "UNKNOWN";
      } catch {
        // getNetwork() is non-critical, don't fail if it throws
      }

      setPublicKey(address);
      setNetwork(currentNetwork);
      console.log(`[Freighter] Connected to ${currentNetwork}:`, address);
      return { success: true, address, network: currentNetwork };

    } catch (err) {
      console.error("[Freighter] Connection failed:", err.message);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting]);

  return { connect, isConnecting, publicKey, network, error };
}
