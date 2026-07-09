import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Coins, 
  UserCheck, 
  Zap, 
  ArrowRight, 
  Lock, 
  ExternalLink,
  Activity,
  Cpu
} from 'lucide-react';

interface HomeSectionProps {
  onStartTournament: () => void;
  onJoinTournament: () => void;
  walletConnected: boolean;
  onConnectWallet: () => void;
}

export default function HomeSection({
  onStartTournament,
  onJoinTournament,
  walletConnected,
  onConnectWallet
}: HomeSectionProps) {
  return (
    <div className="text-zinc-100 flex flex-col items-center">
      
      {/* HERO SECTION WITH VIDEO BACKGROUND */}
      <section className="w-full relative overflow-hidden border-b border-zinc-900/40" id="hero-section">
        
        {/* Subtle Dark Glass/Translucent Overlay for Typography Contrast */}
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.5px] z-10 pointer-events-none"></div>

        {/* Hero Elements Grid (Z-indexed above video) */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-28 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          {/* Left Column: Hero Content (Slightly left-aligned layout) */}
          <div className="w-full lg:w-[62%] text-left flex flex-col items-start space-y-6 sm:space-y-8" id="hero-content">
            
            {/* Glowing Badge */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-zinc-950/80 border border-sky-500/30 shadow-[0_0_15px_rgba(14,165,233,0.05)]"
              id="hero-badge"
            >
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
              <span className="font-mono text-[10px] sm:text-xs font-bold tracking-[0.15em] text-sky-400">
                TETHER DEVELOPERS CUP PROJECT
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display font-black tracking-tight text-white leading-[0.95] text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl flex flex-col"
              id="hero-heading"
            >
              <span>TRUST THE MATCH.</span>
              <span className="mt-1">
                <span className="bg-gradient-to-r from-sky-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                  NOT THE{" "}
                </span>
                <span className="bg-gradient-to-r from-orange-400 via-coral-400 to-[#F05A28] bg-clip-text text-transparent">
                  MIDDLEMAN.
                </span>
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-zinc-300 font-sans text-sm sm:text-base md:text-lg max-w-xl leading-relaxed font-normal text-shadow-sm"
              id="hero-description"
            >
              No cash bags. No disputed scores. RefTrust locks entry fees in self-custodial multi-sig escrow, settling automatically only when both team captains sign. Pure football, cryptographic trust.
            </motion.p>

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto pt-2"
              id="hero-actions"
            >
              <button
                onClick={onStartTournament}
                className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-sky-400 to-sky-500 text-black font-display font-extrabold text-sm tracking-wider shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:shadow-[0_0_35px_rgba(14,165,233,0.45)] active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                id="btn-start-tournament"
              >
                <span>Start a Tournament</span>
              </button>

              <button
                onClick={onJoinTournament}
                className="group px-8 py-4 rounded-full border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900/60 hover:border-zinc-700 active:scale-98 transition-all text-sm font-display font-bold text-zinc-300 flex items-center justify-center space-x-2 cursor-pointer"
                id="btn-join-with-code"
              >
                <span>Join with Code</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-sky-400" />
              </button>
            </motion.div>
          </div>

          {/* Right Column: Visual Escrow Engine Panel */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full lg:w-[38%] bg-zinc-950/70 backdrop-blur-md border border-zinc-900 rounded-2xl p-6 relative overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.6)] self-stretch flex flex-col justify-between"
            id="hero-engine-preview"
          >
            {/* Subtle Ambient Background Gradients */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/5 blur-[80px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/5 blur-[80px] rounded-full pointer-events-none"></div>

            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-900/80 pb-4 mb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="font-mono text-[10px] text-zinc-400 tracking-wider">TETHER WDK SECURE</span>
                </div>
                <span className="font-mono text-[10px] text-zinc-600">v1.2.4-Sepolia</span>
              </div>

              {/* Simulated Live Contract Info */}
              <div className="space-y-4">
                <div>
                  <label className="block font-mono text-[9px] text-zinc-500 uppercase tracking-widest mb-1.5">Active Escrow Wallet</label>
                  <div className="bg-black/50 border border-zinc-900 px-3 py-2 rounded-lg flex items-center justify-between">
                    <span className="font-mono text-xs text-sky-400 font-semibold">0xRefTrustEscrow_WDK...3A5E</span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-600" />
                  </div>
                </div>

                {/* Grid of details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/40 border border-zinc-900/50 p-3 rounded-lg">
                    <span className="block font-mono text-[8px] text-zinc-500 uppercase mb-1">Contract Status</span>
                    <div className="flex items-center space-x-1.5">
                      <Lock className="w-3.5 h-3.5 text-orange-400" />
                      <span className="font-mono text-xs font-extrabold text-orange-400 tracking-wide uppercase">LOCKED</span>
                    </div>
                  </div>
                  <div className="bg-black/40 border border-zinc-900/50 p-3 rounded-lg">
                    <span className="block font-mono text-[8px] text-zinc-500 uppercase mb-1">Total Pool Locked</span>
                    <div className="flex items-center space-x-1">
                      <span className="font-display text-sm font-bold text-white">100.00</span>
                      <span className="font-mono text-[9px] font-bold text-sky-400">USDT</span>
                    </div>
                  </div>
                </div>

                {/* Captain multi-sig verification checklist */}
                <div className="space-y-2 mt-2">
                  <label className="block font-mono text-[9px] text-zinc-500 uppercase tracking-widest mb-1">Multi-Sig Signatures Required</label>
                  
                  <div className="flex items-center justify-between px-3 py-2 bg-black/30 border border-zinc-900/60 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                      <span className="text-xs text-zinc-300 font-medium">Captain Alice (Winner Side)</span>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-900/50 px-2 py-0.5 rounded-full">SIGNED</span>
                  </div>

                  <div className="flex items-center justify-between px-3 py-2 bg-black/30 border border-zinc-900/60 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <UserCheck className="w-3.5 h-3.5 text-zinc-600" />
                      <span className="text-xs text-zinc-500 font-medium">Captain Bob (Loser Side)</span>
                    </div>
                    <span className="font-mono text-[10px] text-orange-400 font-bold bg-orange-950/30 border border-orange-900/40 px-2 py-0.5 rounded-full animate-pulse">AWAITING</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Micro Telemetry Graph */}
            <div className="mt-6 border-t border-zinc-900/80 pt-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="font-mono text-[9px] text-zinc-500 uppercase">QVAC Zero-Latency Sync</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-3 bg-zinc-800 rounded-[1px]"></span>
                <span className="w-1.5 h-4 bg-zinc-800 rounded-[1px]"></span>
                <span className="w-1.5 h-5 bg-zinc-700 rounded-[1px]"></span>
                <span className="w-1.5 h-3 bg-zinc-700 rounded-[1px]"></span>
                <span className="w-1.5 h-5 bg-sky-500 rounded-[1px] animate-[pulse_1s_infinite]"></span>
                <span className="w-1.5 h-4 bg-sky-500 rounded-[1px]"></span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* HOW REFTRUST ELIMINATES DISPUTES SECTION */}
      <section className="w-full bg-transparent border-t border-zinc-900/40 py-16 md:py-24" id="disputes-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Centered Heading with Accent Line */}
          <div className="text-center flex flex-col items-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-white tracking-wider uppercase" id="disputes-heading">
              HOW REFTRUST ELIMINATES DISPUTES
            </h2>
            {/* Bright Accent Line Exactly Like Image 2 */}
            <div className="w-16 h-[3px] bg-sky-400 mt-4 rounded-full shadow-[0_0_10px_rgba(14,165,233,0.8)]"></div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8" id="disputes-grid">
            
            {/* Card 1: Secure Deposit */}
            <motion.div 
              whileHover={{ y: -6, borderColor: 'rgba(14,165,233,0.3)' }}
              className="bg-zinc-950/50 backdrop-blur-md border border-zinc-900/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-8 transition-colors duration-300"
              id="card-secure-deposit"
            >
              <div className="space-y-6">
                {/* Icon Container */}
                <div className="w-12 h-12 rounded-xl border border-sky-500/20 bg-sky-950/10 flex items-center justify-center text-sky-400">
                  <Coins className="w-6 h-6" />
                </div>
                
                <h3 className="font-display font-bold text-lg sm:text-xl text-white tracking-wide uppercase">
                  1. SECURE DEPOSIT
                </h3>
                
                <p className="text-zinc-400 text-sm leading-relaxed font-sans font-normal">
                  Entry fees are deposited in USDt directly into a unique Sepolia testnet escrow wallet managed via the Tether WDK. No organizer custody means funds cannot be stolen.
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-900/60">
                <span className="font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  WDK WALLET ENGINE
                </span>
              </div>
            </motion.div>

            {/* Card 2: Play & Verify */}
            <motion.div 
              whileHover={{ y: -6, borderColor: 'rgba(249,115,22,0.3)' }}
              className="bg-zinc-950/50 backdrop-blur-md border border-zinc-900/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-8 transition-colors duration-300"
              id="card-play-verify"
            >
              <div className="space-y-6">
                {/* Icon Container - Orange Theme */}
                <div className="w-12 h-12 rounded-xl border border-orange-500/20 bg-orange-950/10 flex items-center justify-center text-orange-400">
                  <UserCheck className="w-6 h-6" />
                </div>
                
                <h3 className="font-display font-bold text-lg sm:text-xl text-white tracking-wide uppercase">
                  2. PLAY & VERIFY
                </h3>
                
                <p className="text-zinc-400 text-sm leading-relaxed font-sans font-normal">
                  Teams play the match. At full-time, both captains submit the scoreline on-device. QVAC performs a zero-latency correlation check, identifying logical inconsistencies or score discrepancies on the spot.
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-900/60">
                <span className="font-mono text-[10px] font-bold text-orange-500/60 uppercase tracking-widest">
                  QVAC AUDIT CORE
                </span>
              </div>
            </motion.div>

            {/* Card 3: Instant Release */}
            <motion.div 
              whileHover={{ y: -6, borderColor: 'rgba(14,165,233,0.3)' }}
              className="bg-zinc-950/50 backdrop-blur-md border border-zinc-900/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-8 transition-colors duration-300"
              id="card-instant-release"
            >
              <div className="space-y-6">
                {/* Icon Container - Blue/Teal Theme */}
                <div className="w-12 h-12 rounded-xl border border-teal-500/20 bg-teal-950/10 flex items-center justify-center text-sky-400">
                  <Zap className="w-6 h-6" />
                </div>
                
                <h3 className="font-display font-bold text-lg sm:text-xl text-white tracking-wide uppercase">
                  3. INSTANT RELEASE
                </h3>
                
                <p className="text-zinc-400 text-sm leading-relaxed font-sans font-normal">
                  Upon mutual signing, QVAC verification triggers the WDK multi-sig, releasing 100% of the locked escrow to the winner based on the tournament rule. Fully automatic, trustless payoff.
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-900/60">
                <span className="font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  ESCROW SETTLEMENT
                </span>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* FOOTER CO-BRANDING */}
      <footer className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 border-t border-zinc-900 text-center flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 font-mono text-xs">
        <div>
          <span>© 2026 REFTRUST ESCROW PROTOCOL. Built with Tether WDK & QVAC.</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sky-500">Security Audited</span>
          <span className="text-zinc-700">|</span>
          <span className="text-orange-400">Sepolia Testnet Live</span>
        </div>
      </footer>

    </div>
  );
}
