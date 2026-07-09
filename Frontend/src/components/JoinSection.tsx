import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Lock, 
  Coins, 
  Wallet, 
  Key, 
  ArrowRight, 
  CheckCircle, 
  Search, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { Tournament } from '../types';

interface JoinSectionProps {
  tournaments: Tournament[];
  onJoinSuccess: (tournamentCode: string, captainIndex: 1 | 2) => void;
  walletConnected: boolean;
  onConnectWallet: () => void;
  walletBalance: number;
}

export default function JoinSection({
  tournaments,
  onJoinSuccess,
  walletConnected,
  onConnectWallet,
  walletBalance,
}: JoinSectionProps) {
  const [code, setCode] = useState('');
  const [searchedTournament, setSearchedTournament] = useState<Tournament | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSearchedTournament(null);

    const codeUpper = code.trim().toUpperCase();
    const found = tournaments.find(t => t.code === codeUpper);
    
    if (found) {
      setSearchedTournament(found);
    } else {
      setErrorMsg(`No active tournament escrow found for code "${codeUpper}". Make sure you typed it correctly or create one first!`);
    }
  };

  const executeDeposit = async () => {
    if (!walletConnected) {
      alert('Please connect your wallet first!');
      return;
    }
    
    if (!searchedTournament) return;

    const fee = searchedTournament.escrow.entryFee;
    if (walletBalance < fee) {
      alert(`Insufficient balance! You need ${fee} USDT, but your wallet only holds ${walletBalance} USDT.`);
      return;
    }

    setIsDepositing(true);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate deposit tx
    
    setIsDepositing(false);
    setDepositSuccess(true);
    
    // Default to Captain 1 joining if neither is signed, or whichever is remaining
    const isCap1Signed = searchedTournament.captain1.signed;
    const targetCaptain: 1 | 2 = isCap1Signed ? 2 : 1;
    
    onJoinSuccess(searchedTournament.code, targetCaptain);
  };

  return (
    <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Title */}
      <div className="text-left mb-8 sm:mb-10" id="join-header">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
          JOIN TOURNAMENT ESCROW
        </h1>
        <p className="text-zinc-500 font-sans text-sm mt-1 max-w-xl">
          Enter a RefTrust Code to fund your match entry fees. Your deposit goes directly into the self-custodial contract, secured until full-time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Code Enter & Search */}
        <div className="lg:col-span-6 bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 sm:p-8 space-y-6" id="join-form-container">
          
          <h2 className="text-sm font-mono font-bold uppercase text-zinc-400 tracking-wider flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
            <span>Enter Tournament Code</span>
          </h2>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Key className="w-4 h-4 text-zinc-600 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. REF-1234"
                className="w-full pl-11 pr-4 py-3 bg-black border border-zinc-900 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-sky-500 font-mono tracking-widest uppercase"
                required
                id="input-join-code"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg border border-zinc-800 text-xs font-mono font-bold tracking-wider uppercase transition-colors flex items-center space-x-1.5 shrink-0 cursor-pointer"
              id="btn-search-code"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </form>

          {/* Feedback & Error */}
          {errorMsg && (
            <div className="p-4 bg-orange-950/20 border border-orange-500/30 rounded-xl flex items-start space-x-3 text-orange-400" id="search-error">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-xs font-sans leading-relaxed">
                {errorMsg}
              </p>
            </div>
          )}

          {/* If found but already deposited */}
          {searchedTournament && !depositSuccess && (
            <div className="space-y-6 pt-2" id="search-results">
              <div className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-xl space-y-3">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">ESCROW TARGET DETECTED</span>
                
                <div>
                  <h3 className="font-display font-extrabold text-lg text-white">{searchedTournament.name}</h3>
                  <span className="font-mono text-[10px] text-zinc-500">Escrow Address: {searchedTournament.escrow.contractAddress}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="block font-mono text-[9px] text-zinc-500 uppercase">Secure Fee</span>
                    <span className="font-mono text-sm font-bold text-white">{searchedTournament.escrow.entryFee} USDT</span>
                  </div>
                  <div>
                    <span className="block font-mono text-[9px] text-zinc-500 uppercase">Pool Target</span>
                    <span className="font-mono text-sm font-bold text-sky-400">{searchedTournament.escrow.totalPool} USDT</span>
                  </div>
                </div>
              </div>

              {/* Deposit CTA Button */}
              <div className="pt-2">
                {walletConnected ? (
                  <button
                    onClick={executeDeposit}
                    disabled={isDepositing}
                    className="w-full py-4 rounded-lg bg-emerald-400 hover:bg-emerald-300 disabled:bg-emerald-950 disabled:text-emerald-500 disabled:border-emerald-900 text-black font-display font-extrabold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center space-x-2 cursor-pointer"
                    id="btn-deposit-fee"
                  >
                    {isDepositing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <span>Verifying Deposit signature...</span>
                      </>
                    ) : (
                      <>
                        <Coins className="w-4 h-4" />
                        <span>Authorize & Deposit {searchedTournament.escrow.entryFee} USDT</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onConnectWallet}
                    className="w-full py-4 rounded-lg border border-sky-500/30 bg-sky-950/10 hover:bg-sky-950/20 text-sky-400 font-display font-extrabold text-xs tracking-wider uppercase transition-all flex items-center justify-center space-x-2 cursor-pointer"
                    id="btn-connect-to-deposit-fee"
                  >
                    <span>Connect Wallet to Deposit Entry Fee</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Deposit success view */}
          {depositSuccess && (
            <div className="space-y-6 pt-4 text-center py-6" id="deposit-success-view">
              <div className="w-12 h-12 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                <CheckCircle className="w-6 h-6" />
              </div>
              
              <div className="space-y-1">
                <h3 className="font-display font-black text-xl text-white tracking-wider">ENTRY FEE DEPOSITED</h3>
                <p className="text-zinc-500 text-xs font-mono">Tether WDK: 2-of-2 Multi-Sig Escrow Active</p>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl space-y-2 text-left">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Tournament Name</span>
                  <span className="text-white font-medium">{searchedTournament?.name}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Amount Deposited</span>
                  <span className="text-emerald-400 font-mono font-bold">{searchedTournament?.escrow.entryFee} USDT</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Transaction Hash</span>
                  <span className="text-zinc-400 font-mono">0x2b89...5cf3</span>
                </div>
              </div>

              <button
                onClick={() => onJoinSuccess(searchedTournament!.code, 1)}
                className="w-full py-4 rounded-lg bg-sky-400 text-black font-display font-extrabold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(14,165,233,0.15)] hover:bg-sky-300 transition-colors cursor-pointer flex items-center justify-center space-x-2"
                id="btn-join-success-dashboard"
              >
                <span>Go to Demo Dashboard</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            </div>
          )}

        </div>

        {/* Right Side: Visual Security Card */}
        <div className="lg:col-span-6 bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 sm:p-8 flex flex-col justify-between self-stretch" id="join-info-card">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg border border-sky-500/20 bg-sky-950/10 flex items-center justify-center text-sky-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-base">Self-Custodial Multi-Sig Protection</h3>
                <span className="text-zinc-500 font-mono text-[9px] uppercase tracking-widest">Tether WDK Technology</span>
              </div>
            </div>

            <p className="text-zinc-400 font-sans text-xs sm:text-sm leading-relaxed font-normal">
              Unlike traditional platforms where a centralized organizer manages and holds your money, RefTrust routes all entry fees directly into a smart contract vault built using the official <strong>Tether WDK</strong>.
            </p>

            <ul className="space-y-3.5 text-xs text-zinc-300">
              <li className="flex items-start space-x-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5"></span>
                <span><strong>No Custody Risk:</strong> RefTrust operators hold 0% of the funds. They cannot be stolen, frozen, or compromised.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5"></span>
                <span><strong>2-of-2 Captain Threshold:</strong> Funds are locked on Sepolia and cannot be moved until BOTH team captains confirm and sign the final scoreline.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5"></span>
                <span><strong>QVAC Zero-Latency Auditor:</strong> Instant correlation verifies that scores match before invoking the smart contract disburse function.</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 p-3.5 bg-black/40 border border-zinc-900 rounded-lg flex items-center justify-between">
            <span className="font-mono text-[10px] text-zinc-500">YOUR WALLET BALANCE:</span>
            <span className="font-mono text-sm font-bold text-emerald-400">{walletBalance.toLocaleString()} USDT</span>
          </div>
        </div>

      </div>

    </div>
  );
}
