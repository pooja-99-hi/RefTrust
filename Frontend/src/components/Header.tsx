import React from 'react';
import { Shield, Wallet, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  activeTab: 'home' | 'create' | 'join' | 'dashboard';
  setActiveTab: (tab: 'home' | 'create' | 'join' | 'dashboard') => void;
  walletConnected: boolean;
  setWalletConnected: (connected: boolean) => void;
  walletAddress: string;
  walletBalance: number;
}

export default function Header({
  activeTab,
  setActiveTab,
  walletConnected,
  setWalletConnected,
  walletAddress,
  walletBalance,
}: HeaderProps) {
  const toggleWallet = () => {
    setWalletConnected(!walletConnected);
  };

  return (
    <header className="border-b border-zinc-900 bg-black/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo and Brand */}
        <div 
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => setActiveTab('home')}
          id="brand-logo"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-sky-500/20 blur-md rounded-lg"></div>
            <div className="relative w-10 h-10 rounded-lg border border-sky-500/30 bg-zinc-950 flex items-center justify-center text-sky-400">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline space-x-0.5">
              <span className="font-display font-extrabold text-xl text-white tracking-tight">REF</span>
              <span className="font-display font-extrabold text-xl text-sky-400 tracking-tight">TRUST</span>
            </div>
            <span className="font-mono text-[9px] text-zinc-500 tracking-widest uppercase">WDK + QVAC ESCROW</span>
          </div>
        </div>

        {/* Navigation Links - Desktop */}
        <nav className="hidden md:flex items-center space-x-8" id="desktop-nav">
          {[
            { id: 'home', label: 'HOME' },
            { id: 'create', label: 'CREATE' },
            { id: 'join', label: 'JOIN' },
            { id: 'dashboard', label: 'DEMO DASHBOARD' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative font-display text-xs font-semibold tracking-wider transition-colors py-2 ${
                  isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
                id={`nav-${tab.id}`}
              >
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400/80 blur-[0.5px]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Wallet Connect Button */}
        <div className="flex items-center space-x-3">
          {walletConnected ? (
            <div className="flex items-center space-x-3">
              {/* Desktop Details */}
              <div className="hidden sm:flex flex-col items-end">
                <span className="font-mono text-[10px] text-zinc-400">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
                <span className="font-mono text-xs font-semibold text-emerald-400">
                  {walletBalance.toLocaleString()} USDT
                </span>
              </div>
              <button
                onClick={toggleWallet}
                className="flex items-center space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-emerald-500/30 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-950/40 transition-colors text-xs font-medium"
                id="wallet-connected-btn"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Sepolia</span>
              </button>
            </div>
          ) : (
            <button
              onClick={toggleWallet}
              className="group relative flex items-center space-x-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-sky-500/30 bg-zinc-950 hover:bg-sky-950/10 hover:border-sky-400 transition-all text-xs font-bold text-sky-400 tracking-wider shadow-[0_0_15px_rgba(14,165,233,0.03)] hover:shadow-[0_0_20px_rgba(14,165,233,0.15)] cursor-pointer"
              id="wallet-connect-btn"
            >
              <Wallet className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation - Mobile Rail */}
      <div className="md:hidden border-t border-zinc-900 bg-black/90 flex justify-around py-3" id="mobile-nav">
        {[
          { id: 'home', label: 'HOME' },
          { id: 'create', label: 'CREATE' },
          { id: 'join', label: 'JOIN' },
          { id: 'dashboard', label: 'DASHBOARD' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`text-[10px] font-bold tracking-wider transition-colors px-2 py-1.5 rounded ${
                isActive ? 'text-sky-400 bg-zinc-900/50' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              id={`nav-mobile-${tab.id}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
