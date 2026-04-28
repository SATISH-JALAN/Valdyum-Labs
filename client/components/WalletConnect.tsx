'use client';

import { useState, useEffect } from 'react';
import { truncateAddress } from '@/lib/stellar';
import { createPortal } from 'react-dom';

type WalletOption = {
  id: string;
  name: string;
  icon: string;
  description: string;
};

const WALLET_OPTIONS: WalletOption[] = [
  {
    id: 'freighter',
    name: 'Freighter',
    icon: '🚀',
    description: 'Official Stellar browser extension wallet',
  },
  {
    id: 'lobstr',
    name: 'LOBSTR',
    icon: '🦞',
    description: 'Popular Stellar wallet with WalletConnect',
  },
  {
    id: 'xbull',
    name: 'xBull Wallet',
    icon: '🐂',
    description: 'Feature-rich Stellar wallet extension',
  },
  {
    id: 'albedo',
    name: 'Albedo',
    icon: '✨',
    description: 'Non-custodial signer — no install required',
  },
];

export default function WalletConnect() {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [connecting, setConnecting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('wallet_address');
    if (saved) {
      setAddress(saved);
      fetchBalance(saved);
    }
    setMounted(true);
  }, []);

  const fetchBalance = async (addr: string) => {
    try {
      const { getXlmBalance } = await import('@/lib/stellar');
      const bal = await getXlmBalance(addr);
      setBalance(parseFloat(bal).toFixed(2));
    } catch {
      setBalance('0');
    }
  };

  const connectFreighter = async (): Promise<string | null> => {
    const freighter = await import('@stellar/freighter-api');
    const connectionResult = await freighter.isConnected();
    if (!connectionResult.isConnected) {
      throw new Error('Freighter extension not found. Please install it from https://freighter.app');
    }
    await freighter.requestAccess();
    const { address: pubKey, error } = await freighter.getAddress();
    if (error || !pubKey) throw new Error('Could not retrieve address from Freighter');
    return pubKey;
  };

  const connectXBull = async (): Promise<string | null> => {
    // xBull exposes window.xBullSDK after install
    const win = window as unknown as { xBullSDK?: { connect: () => Promise<{ publicKey: string }> } };
    if (!win.xBullSDK) {
      throw new Error('xBull Wallet extension not found. Please install it from https://xbull.app');
    }
    const result = await win.xBullSDK.connect();
    if (!result?.publicKey) throw new Error('xBull did not return a public key');
    return result.publicKey;
  };

  const connectAlbedo = async (): Promise<string | null> => {
    const albedo = await import(
      /* webpackIgnore: true */ 'https://albedo.link/albedo.js' as string
    ).catch(() => null);
    if (!albedo) {
      // Albedo loads as a global script; check window.albedo
      const win = window as unknown as { albedo?: { publicKey: (opts: object) => Promise<{ pubkey: string }> } };
      if (!win.albedo) {
        throw new Error('Albedo could not be loaded. Try opening https://albedo.link in a new tab first.');
      }
      const result = await win.albedo.publicKey({ require_existing: false });
      return result?.pubkey || null;
    }
    const result = await (albedo as { publicKey: (opts: object) => Promise<{ pubkey: string }> }).publicKey({ require_existing: false });
    return result?.pubkey || null;
  };

  const connectLobstr = async (): Promise<string | null> => {
    // LOBSTR exposes the Stellar Web Authentication protocol via WalletConnect or their extension
    // Check if the extension is present
    const win = window as unknown as { lobstr?: { getPublicKey: () => Promise<string> } };
    if (!win.lobstr) {
      throw new Error(
        'LOBSTR extension not found. Install from https://lobstr.co or scan the QR code with the LOBSTR mobile app.'
      );
    }
    const pubKey = await win.lobstr.getPublicKey();
    if (!pubKey) throw new Error('LOBSTR did not return a public key');
    return pubKey;
  };

  const handleWalletSelect = async (walletId: string) => {
    setConnecting(true);
    setWalletError(null);
    try {
      let pubKey: string | null = null;

      switch (walletId) {
        case 'freighter':
          pubKey = await connectFreighter();
          break;
        case 'xbull':
          pubKey = await connectXBull();
          break;
        case 'albedo':
          pubKey = await connectAlbedo();
          break;
        case 'lobstr':
          pubKey = await connectLobstr();
          break;
        default:
          throw new Error(`Unknown wallet: ${walletId}`);
      }

      if (pubKey) {
        setAddress(pubKey);
        localStorage.setItem('wallet_address', pubKey);
        localStorage.setItem('wallet_type', walletId);
        await fetchBalance(pubKey);
        setShowModal(false);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setWalletError(msg);
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setBalance('0');
    localStorage.removeItem('wallet_address');
    localStorage.removeItem('wallet_type');
  };

  if (address) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-[#F5F6F8]">
          <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
          <span className="font-mono text-xs text-[#0A0E27]">{truncateAddress(address)}</span>
          <span className="font-mono text-xs text-[#475569]">{balance} XLM</span>
        </div>
        <button
          onClick={disconnect}
          className="text-xs text-[#94a3b8] hover:text-[#dc2626] transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => { setShowModal(true); setWalletError(null); }}
        disabled={connecting}
        className="px-5 py-2 text-sm font-medium bg-[#4F46E5] text-white rounded-xl hover:bg-[#4338CA] transition-colors disabled:opacity-50"
      >
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </button>

      {showModal && mounted && createPortal(
        <div className="fixed inset-0 z-[120] flex items-end justify-center px-4 pb-6 pt-6 sm:items-start sm:pt-24">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-sm max-h-[72vh] overflow-y-auto rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-[0_24px_64px_-12px_rgba(10,14,39,0.18)] sm:max-h-[70vh]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-editorial text-lg font-bold text-[#0A0E27]">Connect a Wallet</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#94a3b8] hover:text-[#0A0E27] transition-colors text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#475569] mb-4">
              Select a Stellar wallet to connect to Valdyum.
            </p>

            {walletError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">
                {walletError}
              </div>
            )}

            <div className="space-y-2">
              {WALLET_OPTIONS.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => handleWalletSelect(wallet.id)}
                  disabled={connecting}
                  className="w-full flex items-center gap-4 p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F5F6F8] hover:border-[#4F46E5] hover:bg-[rgba(79,70,229,0.04)] transition-all text-left disabled:opacity-50"
                >
                  <span className="text-2xl leading-none">{wallet.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[#0A0E27] text-sm">{wallet.name}</div>
                    <div className="text-xs text-[#475569] truncate">{wallet.description}</div>
                  </div>
                  <span className="text-[#94a3b8] text-xs shrink-0">→</span>
                </button>
              ))}
            </div>

            <p className="mt-4 text-[10px] text-[#94a3b8] text-center">
              Connecting will request access to your public key only. No funds are moved.
            </p>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
