// Global type augmentations for wallet browser extensions

interface Window {
  ethereum?:         unknown;
  starknet?:         unknown;
  starknet_argentX?: unknown;
  lobstrSignerExtension?: unknown;
  coinbaseWalletExtension?: unknown;
  phantom?:          { ethereum?: unknown };
}
