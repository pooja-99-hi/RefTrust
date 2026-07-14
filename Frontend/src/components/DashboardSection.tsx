import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle, 
  AlertTriangle, 
  Coins, 
  ArrowRight, 
  UserCheck, 
  Zap, 
  Copy, 
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Award,
  AlertOctagon,
  Wifi,
  WifiOff,
  TrendingUp,
  Award as TrophyIcon
} from 'lucide-react';
import { Tournament, Captain } from '../types';

interface DashboardSectionProps {
  tournaments: Tournament[];
  setTournaments: React.Dispatch<React.SetStateAction<Tournament[]>>;
  activeTournamentId: string | null;
  setActiveTournamentId: (id: string | null) => void;
  walletConnected: boolean;
  onConnectWallet: () => void;
  setWalletBalance: React.Dispatch<React.SetStateAction<number>>;
}

export default function DashboardSection({
  tournaments,
  setTournaments,
  activeTournamentId,
  setActiveTournamentId,
  walletConnected,
  onConnectWallet,
  setWalletBalance,
}: DashboardSectionProps) {
  // Find current active tournament
  const activeTournament = tournaments.find(t => t.id === activeTournamentId) || tournaments[0];
  
  // State for QVAC's offline-first simulation
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showSyncSuccess, setShowSyncSuccess] = useState<boolean>(false);
  
  // State for forms
  const [cap1MyScore, setCap1MyScore] = useState<number | ''>('');
  const [cap1OpScore, setCap1OpScore] = useState<number | ''>('');
  const [cap2MyScore, setCap2MyScore] = useState<number | ''>('');
  const [cap2OpScore, setCap2OpScore] = useState<number | ''>('');

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<'MATCH' | 'MISMATCH' | null>(null);
  const [copiedContract, setCopiedContract] = useState(false);
  const [disputeResolved, setDisputeResolved] = useState(false);

  // Gemini dispute states
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGeminiArbitrating, setIsGeminiArbitrating] = useState<boolean>(false);

  if (!activeTournament) {
    return (
      <div className="w-full max-w-7xl px-4 py-16 text-center text-zinc-500 font-mono">
        No active tournaments available. Create or join a tournament to start.
      </div>
    );
  }

  const handleSelectTournament = (id: string) => {
    setActiveTournamentId(id);
    // Reset state
    setCap1MyScore('');
    setCap1OpScore('');
    setCap2MyScore('');
    setCap2OpScore('');
    setVerificationResult(null);
    setIsVerifying(false);
    setDisputeResolved(false);
    setEvidenceFile(null);
    setPreviewUrl(null);
  };

  const copyContract = () => {
    navigator.clipboard.writeText(activeTournament.escrow.contractAddress);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEvidenceFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Captain 1 Signs
  const handleCap1Sign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletConnected) {
      alert('Please connect your wallet to authorize contract!');
      return;
    }
    if (cap1MyScore === '' || cap1OpScore === '') return;

    try {
      const response = await fetch(`/api/tournaments/${activeTournament.id}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          captainIndex: 1,
          score: Number(cap1MyScore),
          opponentScore: Number(cap1OpScore)
        })
      });
      if (!response.ok) throw new Error('Failed to sign match outcomes');
      const updatedTournament = await response.json();
      setTournaments(prev => prev.map(t => t.id === updatedTournament.id ? updatedTournament : t));
    } catch (err: any) {
      alert(err.message || 'Error signing escrow');
    }
  };

  // Captain 2 Signs
  const handleCap2Sign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletConnected) {
      alert('Please connect your wallet to authorize contract!');
      return;
    }
    if (cap2MyScore === '' || cap2OpScore === '') return;

    try {
      const response = await fetch(`/api/tournaments/${activeTournament.id}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          captainIndex: 2,
          score: Number(cap2MyScore),
          opponentScore: Number(cap2OpScore)
        })
      });
      if (!response.ok) throw new Error('Failed to sign match outcomes');
      const updatedTournament = await response.json();
      setTournaments(prev => prev.map(t => t.id === updatedTournament.id ? updatedTournament : t));
    } catch (err: any) {
      alert(err.message || 'Error signing escrow');
    }
  };

  const triggerConfettiCelebration = () => {
    // Fire confetti from left
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { x: 0.1, y: 0.6 },
      colors: ['#0ea5e9', '#10b981', '#f59e0b', '#3b82f6', '#f43f5e']
    });
    // Fire confetti from right
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { x: 0.9, y: 0.6 },
      colors: ['#0ea5e9', '#10b981', '#f59e0b', '#3b82f6', '#f43f5e']
    });

    // Staggered burst in the middle
    setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#3b82f6', '#10b981', '#ffffff', '#f59e0b']
      });
    }, 600);
  };

  // Run QVAC Correlation and Multi-sig Disburse
  const runVerification = async () => {
    setIsVerifying(true);
    setVerificationResult(null);

    // Simulated scanning delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    try {
      const response = await fetch(`/api/tournaments/${activeTournament.id}/verify`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Verification request failed');
      const updatedTournament = await response.json();
      
      setIsVerifying(false);
      const cap1 = updatedTournament.captain1;
      const cap2 = updatedTournament.captain2;
      const doesMatch = cap1.score === cap2.opponentScore && cap1.opponentScore === cap2.score;

      if (doesMatch) {
        setVerificationResult('MATCH');
        triggerConfettiCelebration();
        
        // Update local tournaments list
        setTournaments(prev => prev.map(t => t.id === updatedTournament.id ? updatedTournament : t));
        // Add to wallet balance
        setWalletBalance(prev => prev + activeTournament.escrow.totalPool);
        
        setTimeout(() => {
          triggerConfettiCelebration();
        }, 1500);
      } else {
        setVerificationResult('MISMATCH');
        setTournaments(prev => prev.map(t => t.id === updatedTournament.id ? updatedTournament : t));
      }
    } catch (err: any) {
      alert(err.message || 'Error executing QVAC audit');
      setIsVerifying(false);
    }
  };

  // Reset/Redo match scores
  const handleResetScores = async () => {
    try {
      const response = await fetch(`/api/tournaments/${activeTournament.id}/reset`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Reset request failed');
      const updatedTournament = await response.json();
      setTournaments(prev => prev.map(t => t.id === updatedTournament.id ? updatedTournament : t));
      
      setCap1MyScore('');
      setCap1OpScore('');
      setCap2MyScore('');
      setCap2OpScore('');
      setVerificationResult(null);
      setIsVerifying(false);
      setDisputeResolved(false);
      setEvidenceFile(null);
      setPreviewUrl(null);
    } catch (err: any) {
      alert(err.message || 'Error resetting match scores');
    }
  };

  // Override / Emergency Resolution for Demo
  const forceResolveDispute = async () => {
    setIsGeminiArbitrating(true);
    
    // Read file if selected and convert to base64
    let base64Image = null;
    let fileMimeType = null;
    
    if (evidenceFile) {
      base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(evidenceFile);
      });
      fileMimeType = evidenceFile.type;
    }

    try {
      const response = await fetch(`/api/tournaments/${activeTournament.id}/resolve-dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evidenceImage: base64Image,
          mimeType: fileMimeType
        })
      });
      if (!response.ok) throw new Error('Arbitration request failed');
      const updatedTournament = await response.json();
      
      setTournaments(prev => prev.map(t => t.id === updatedTournament.id ? updatedTournament : t));
      setDisputeResolved(true);
      setVerificationResult('MATCH');
      triggerConfettiCelebration();

      setWalletBalance(prev => prev + activeTournament.escrow.totalPool);
      setTimeout(() => {
        triggerConfettiCelebration();
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Error running dispute arbitration');
    } finally {
      setIsGeminiArbitrating(false);
    }
  };

  const isBothSigned = activeTournament.captain1.signed && activeTournament.captain2.signed;

  return (
    <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Header and Selectors */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 sm:mb-10" id="dashboard-header">
        <div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            MATCH ESCROW COORDINATOR
          </h1>
          <p className="text-zinc-500 font-sans text-xs sm:text-sm mt-1 max-w-xl">
            Simulate Captain Alice and Captain Bob submitting scorelines. See QVAC verify discrepancies and release Tether WDK multi-sig funds in real-time.
          </p>
        </div>

        {/* Tournament Switcher */}
        <div className="flex items-center space-x-2">
          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Active Match:</span>
          <select 
            value={activeTournament.id} 
            onChange={(e) => handleSelectTournament(e.target.value)}
            className="px-3 py-2 bg-zinc-950 border border-zinc-900 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-sky-500"
            id="select-tournament"
          >
            {tournaments.map(t => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dynamic 3-Column Stats Grid: Standings, Captain Trust Matrix & Escrow Payout Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 sm:mb-10" id="dashboard-highlevel-stats">
        
        {/* Widget 1: Tournament Standings */}
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 blur-[40px] rounded-full pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-mono font-bold uppercase text-zinc-400 tracking-wider flex items-center space-x-1.5">
                <TrophyIcon className="w-4 h-4 text-sky-400" />
                <span>Tournament Standings</span>
              </h2>
              <span className="text-[10px] bg-sky-950/40 border border-sky-500/20 text-sky-400 font-mono px-2 py-0.5 rounded uppercase font-semibold">
                Group Stage
              </span>
            </div>
            
            <div className="space-y-2 font-mono text-[11px]">
              {/* Leaderboard Table */}
              <div className="grid grid-cols-12 text-zinc-500 pb-1.5 border-b border-zinc-900 text-left">
                <span className="col-span-2">Pos</span>
                <span className="col-span-5">Squad</span>
                <span className="col-span-2 text-center">W/L</span>
                <span className="col-span-3 text-right">Pts</span>
              </div>
              
              <div className="grid grid-cols-12 py-1.5 border-b border-zinc-900/40 text-left items-center text-white">
                <span className="col-span-2 font-bold text-sky-400">#1</span>
                <span className="col-span-5 font-sans font-semibold">Alice's Eleven</span>
                <span className="col-span-2 text-center text-zinc-400">12 - 3</span>
                <span className="col-span-3 text-right text-emerald-400 font-bold">36 pts</span>
              </div>

              <div className="grid grid-cols-12 py-1.5 border-b border-zinc-900/40 text-left items-center text-zinc-300">
                <span className="col-span-2 font-bold text-zinc-400">#2</span>
                <span className="col-span-5 font-sans font-semibold">Bob's United</span>
                <span className="col-span-2 text-center text-zinc-400">9 - 4</span>
                <span className="col-span-3 text-right text-sky-400 font-bold">28 pts</span>
              </div>

              <div className="grid grid-cols-12 py-1.5 text-left items-center text-zinc-400">
                <span className="col-span-2 font-bold text-zinc-500">#3</span>
                <span className="col-span-5 font-sans">Charlie's FC</span>
                <span className="col-span-2 text-center text-zinc-500">6 - 8</span>
                <span className="col-span-3 text-right text-zinc-500">18 pts</span>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-zinc-900/50 flex items-center justify-between text-[10px] text-zinc-500 font-sans mt-3">
            <span>Standings updated dynamically via QVAC</span>
            <span className="font-mono text-[9px] text-zinc-600">v1.0.2</span>
          </div>
        </div>

        {/* Widget 2: Captain Trust & Reputation Badge */}
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-[40px] rounded-full pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-mono font-bold uppercase text-zinc-400 tracking-wider flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Captain Trust Matrix</span>
              </h2>
              <span className="text-[10px] bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 font-mono px-2 py-0.5 rounded uppercase font-semibold">
                Perfect Fair Play
              </span>
            </div>

            <div className="space-y-3">
              {/* Alice reputation */}
              <div className="bg-black/40 border border-zinc-900/60 rounded-xl p-2.5 flex items-center justify-between">
                <div>
                  <span className="block font-sans text-xs font-bold text-white">Captain Alice</span>
                  <span className="font-mono text-[9px] text-zinc-500">Address: {activeTournament.captain1.address.slice(0, 6)}...{activeTournament.captain1.address.slice(-4)}</span>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-400">
                    Disputes caused: 0
                  </div>
                  <span className="block font-mono text-[9px] text-zinc-500 mt-0.5">Rating: 99.8% Trusted</span>
                </div>
              </div>

              {/* Bob reputation */}
              <div className="bg-black/40 border border-zinc-900/60 rounded-xl p-2.5 flex items-center justify-between">
                <div>
                  <span className="block font-sans text-xs font-bold text-white">Captain Bob</span>
                  <span className="font-mono text-[9px] text-zinc-500">Address: {activeTournament.captain2.address.slice(0, 6)}...{activeTournament.captain2.address.slice(-4)}</span>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-400">
                    Disputes caused: 0
                  </div>
                  <span className="block font-mono text-[9px] text-zinc-500 mt-0.5">Rating: 99.5% Trusted</span>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-zinc-900/50 flex items-center justify-between text-[10px] text-zinc-500 font-sans mt-3">
            <span>Reputation Badge verified on Sepolia</span>
            <span className="font-mono text-[9px] text-emerald-500 font-bold">TRUST SCORE: A+</span>
          </div>
        </div>

        {/* Widget 3: Escrow Payout Status */}
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 blur-[40px] rounded-full pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-mono font-bold uppercase text-zinc-400 tracking-wider flex items-center space-x-1.5">
                <Coins className="w-4 h-4 text-orange-400" />
                <span>Escrow Payout Status</span>
              </h2>
              <span className="text-[10px] bg-orange-950/40 border border-orange-500/20 text-orange-400 font-mono px-2 py-0.5 rounded uppercase font-semibold">
                Multi-Sig 2-of-2
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between items-center py-1 border-b border-zinc-900/40">
                <span className="text-zinc-500">Active Escrow Address</span>
                <span className="text-sky-400 text-[10px]">{activeTournament.escrow.contractAddress.slice(0, 10)}...{activeTournament.escrow.contractAddress.slice(-6)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-zinc-900/40">
                <span className="text-zinc-500">Total Escrow Volume</span>
                <span className="text-white font-bold">{activeTournament.escrow.totalPool} {activeTournament.escrow.currency}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-zinc-500">Settlement Status</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTournament.escrow.status === 'DISBURSED' 
                    ? 'bg-emerald-950 border border-emerald-500/30 text-emerald-400' 
                    : activeTournament.escrow.status === 'DISPUTED' 
                    ? 'bg-red-950 border border-red-500/30 text-red-400'
                    : 'bg-orange-950 border border-orange-500/30 text-orange-400 animate-pulse'
                }`}>
                  {activeTournament.escrow.status === 'DISBURSED' 
                    ? 'PAYOUT RELEASED' 
                    : activeTournament.escrow.status === 'DISPUTED' 
                    ? 'DISPUTE DETECTED'
                    : 'POOL LOCKED'
                  }
                </span>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-zinc-900/50 flex items-center justify-between text-[10px] text-zinc-500 font-sans mt-3">
            <span>Security audit hash</span>
            <span className="font-mono text-[9px] text-zinc-600">0x7e1a384f...</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Active Escrow Status Panel */}
        <div className="lg:col-span-5 space-y-6" id="dashboard-left-panel">
          
          {/* Main Escrow Status Card */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 blur-[60px] rounded-full pointer-events-none"></div>

            {/* Title & Status */}
            <div className="flex justify-between items-start border-b border-zinc-900 pb-4">
              <div>
                <h2 className="font-display font-extrabold text-base text-white">{activeTournament.name}</h2>
                <span className="font-mono text-[9px] text-zinc-500 uppercase">RefTrust Multi-sig Vault</span>
              </div>

              {/* Dynamic Status Badges */}
              {activeTournament.escrow.status === 'LOCKED' && (
                <span className="font-mono text-[10px] font-bold text-orange-400 bg-orange-950/30 border border-orange-900/40 px-3 py-1 rounded-full animate-pulse flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                  <span>LOCKED</span>
                </span>
              )}
              {activeTournament.escrow.status === 'DISBURSED' && (
                <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-3 py-1 rounded-full flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>DISBURSED</span>
                </span>
              )}
              {activeTournament.escrow.status === 'DISPUTED' && (
                <span className="font-mono text-[10px] font-bold text-red-400 bg-red-950/30 border border-red-900/40 px-3 py-1 rounded-full flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                  <span>DISPUTED</span>
                </span>
              )}
            </div>

            {/* Smart Contract Info */}
            <div className="space-y-4">
              <div>
                <label className="block font-mono text-[8px] text-zinc-500 uppercase tracking-widest mb-1">Contract Address (Sepolia)</label>
                <div className="bg-black/60 border border-zinc-900 px-3 py-2 rounded-lg flex items-center justify-between">
                  <span className="font-mono text-[11px] text-sky-400 font-medium">
                    {activeTournament.escrow.contractAddress.slice(0, 16)}...
                  </span>
                  <button onClick={copyContract} className="text-zinc-600 hover:text-white transition-colors">
                    {copiedContract ? <span className="text-[9px] font-mono text-emerald-400">Copied!</span> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Pool Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 border border-zinc-900 p-3 rounded-lg">
                  <span className="block font-mono text-[8px] text-zinc-500 uppercase mb-0.5">Total Pool Locked</span>
                  <span className="font-display font-extrabold text-xl text-white">
                    {activeTournament.escrow.totalPool} <span className="font-mono text-xs text-sky-400">USDT</span>
                  </span>
                </div>
                <div className="bg-black/40 border border-zinc-900 p-3 rounded-lg">
                  <span className="block font-mono text-[8px] text-zinc-500 uppercase mb-0.5">Network Gas</span>
                  <span className="font-mono text-sm font-bold text-emerald-400">
                    24 Gwei
                  </span>
                </div>
              </div>

              {/* Signers Check List */}
              <div className="space-y-2 pt-2">
                <label className="block font-mono text-[8px] text-zinc-500 uppercase tracking-widest mb-1">Signer Authorization Matrix</label>
                
                {/* Captain 1 state */}
                <div className="flex items-center justify-between p-3 bg-black/20 border border-zinc-900/60 rounded-xl">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                    <div>
                      <span className="text-xs font-semibold text-zinc-200 block">{activeTournament.captain1.name}</span>
                      <span className="text-[9px] font-mono text-zinc-500">{activeTournament.captain1.address.slice(0, 14)}...</span>
                    </div>
                  </div>
                  {activeTournament.captain1.signed ? (
                    isOffline ? (
                      <span className="font-mono text-[9px] font-bold text-amber-400 bg-amber-950/40 border border-amber-900/40 px-2 py-0.5 rounded-md flex items-center space-x-1">
                        <span className="w-1 h-1 rounded-full bg-amber-400 animate-ping"></span>
                        <span>PENDING SYNC</span>
                      </span>
                    ) : (
                      <span className="font-mono text-[9px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-2 py-0.5 rounded-md">
                        SYNCED ON-CHAIN
                      </span>
                    )
                  ) : (
                    <span className="font-mono text-[9px] font-bold text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md animate-pulse">
                      PENDING
                    </span>
                  )}
                </div>
 
                {/* Captain 2 state */}
                <div className="flex items-center justify-between p-3 bg-black/20 border border-zinc-900/60 rounded-xl">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-400"></div>
                    <div>
                      <span className="text-xs font-semibold text-zinc-200 block">{activeTournament.captain2.name}</span>
                      <span className="text-[9px] font-mono text-zinc-500">{activeTournament.captain2.address.slice(0, 14)}...</span>
                    </div>
                  </div>
                  {activeTournament.captain2.signed ? (
                    isOffline ? (
                      <span className="font-mono text-[9px] font-bold text-amber-400 bg-amber-950/40 border border-amber-900/40 px-2 py-0.5 rounded-md flex items-center space-x-1">
                        <span className="w-1 h-1 rounded-full bg-amber-400 animate-ping"></span>
                        <span>PENDING SYNC</span>
                      </span>
                    ) : (
                      <span className="font-mono text-[9px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-2 py-0.5 rounded-md">
                        SYNCED ON-CHAIN
                      </span>
                    )
                  ) : (
                    <span className="font-mono text-[9px] font-bold text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md animate-pulse">
                      PENDING
                    </span>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* Ledger History List */}
          <div className="bg-black border border-zinc-900 rounded-2xl p-5" id="transaction-ledger">
            <h3 className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest border-b border-zinc-900 pb-3 mb-3">
              CONTRACT STATE LEDGER (WDK AUDIT)
            </h3>
            <div className="space-y-3 font-mono text-[10px] leading-relaxed">
              <div className="flex justify-between items-start">
                <span className="text-zinc-500">Block #5819032</span>
                <span className="text-sky-400">Escrow deployed by Operator</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-zinc-500">Block #5819034</span>
                <span className="text-emerald-400">Cap. A entry fee locked (50.0 USDT)</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-zinc-500">Block #5819045</span>
                <span className="text-emerald-400">Cap. B entry fee locked (50.0 USDT)</span>
              </div>
              
              {activeTournament.captain1.signed && (
                <div className="flex justify-between items-start">
                  <span className="text-zinc-500">Block #5819060</span>
                  <span className="text-orange-400">Cap. A submitted score ({activeTournament.captain1.score}-{activeTournament.captain1.opponentScore}) & Signed</span>
                </div>
              )}
              {activeTournament.captain2.signed && (
                <div className="flex justify-between items-start">
                  <span className="text-zinc-500">Block #5819062</span>
                  <span className="text-sky-400">Cap. B submitted score ({activeTournament.captain2.opponentScore}-{activeTournament.captain2.score}) & Signed</span>
                </div>
              )}
              {activeTournament.escrow.status === 'DISBURSED' && (
                <div className="flex justify-between items-start border-t border-zinc-900/80 pt-2 mt-2">
                  <span className="text-emerald-400">CONFIRMED</span>
                  <span className="text-emerald-400 font-bold">100.00 USDT Released to winner!</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Match Outcome Signing Panel */}
        <div className="lg:col-span-7 bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 sm:p-8 space-y-8" id="dashboard-right-panel">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
            <h2 className="text-sm font-mono font-bold uppercase text-zinc-400 tracking-wider flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
              <span>Simulate Captain Outcome Signing</span>
            </h2>
            
            {/* Offline simulator switch */}
            <div className="flex items-center space-x-3">
              <button 
                type="button"
                onClick={() => {
                  if (isOffline) {
                    setIsSyncing(true);
                    setTimeout(() => {
                      setIsSyncing(false);
                      setIsOffline(false);
                      setShowSyncSuccess(true);
                      setTimeout(() => setShowSyncSuccess(false), 2500);
                    }, 1200);
                  } else {
                    setIsOffline(true);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] font-bold tracking-wider uppercase transition-all duration-300 flex items-center space-x-1.5 cursor-pointer ${
                  isOffline 
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-400 hover:bg-amber-900/40' 
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
                id="btn-offline-toggle"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                    <span>Syncing Local Cache...</span>
                  </>
                ) : isOffline ? (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>Mode: Offline (Simulation)</span>
                  </>
                ) : (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Mode: Online (Synced)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sync Success Notification */}
          {showSyncSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-mono flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Cryptographic offline ledger synced successfully with Sepolia multi-sig contract!</span>
            </motion.div>
          )}

          {/* Offline Mode Alert Banner */}
          {isOffline && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-amber-950/20 border border-amber-500/20 rounded-xl text-amber-400 text-xs font-sans space-y-1"
            >
              <div className="flex items-center space-x-2 font-mono font-bold text-xs uppercase tracking-wider">
                <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>QVAC Offline-First Mode Engaged</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Signatures & match outcomes are stored instantly inside on-device IndexedDB sandboxes. They are cryptographically pre-signed, fully auditable, and will auto-propagate to Sepolia once connectivity is restored.
              </p>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Captain 1 Form Box */}
            <div className="bg-black/40 border border-zinc-900 p-5 rounded-xl space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-orange-950/40 border border-orange-500/30 flex items-center justify-center text-orange-400 font-mono text-xs">A</div>
                <span className="text-xs font-bold text-white uppercase">{activeTournament.captain1.name}</span>
              </div>

              {activeTournament.captain1.signed ? (
                <div className="py-6 flex flex-col items-center justify-center text-emerald-400 space-y-2 bg-emerald-950/10 rounded-lg border border-emerald-900/30">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-mono text-[10px] font-bold">MUTUAL SIGNATURE SUBMITTED</span>
                  <span className="text-xs font-semibold text-zinc-300">Submitted: {activeTournament.captain1.score} - {activeTournament.captain1.opponentScore}</span>
                </div>
              ) : (
                <form onSubmit={handleCap1Sign} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">My Score ({activeTournament.captain1.name.slice(-5)})</label>
                      <input 
                        type="number" 
                        value={cap1MyScore}
                        onChange={(e) => setCap1MyScore(e.target.value === '' ? '' : parseInt(e.target.value))}
                        min={0}
                        required
                        placeholder="e.g. 2"
                        className="w-full px-3 py-2 bg-black border border-zinc-900 rounded-lg font-mono text-center text-sm text-white focus:outline-none focus:border-orange-500"
                        id="input-cap1-my-score"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">{activeTournament.captain2.name.slice(-3)} Score</label>
                      <input 
                        type="number" 
                        value={cap1OpScore}
                        onChange={(e) => setCap1OpScore(e.target.value === '' ? '' : parseInt(e.target.value))}
                        min={0}
                        required
                        placeholder="e.g. 1"
                        className="w-full px-3 py-2 bg-black border border-zinc-900 rounded-lg font-mono text-center text-sm text-white focus:outline-none focus:border-orange-500"
                        id="input-cap1-op-score"
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-orange-500 text-black font-display font-extrabold text-[10px] uppercase tracking-wider hover:bg-orange-400 transition-colors cursor-pointer"
                    id="btn-cap1-sign"
                  >
                    Authorize & Sign Escrow
                  </button>
                </form>
              )}
            </div>

            {/* Captain 2 Form Box */}
            <div className="bg-black/40 border border-zinc-900 p-5 rounded-xl space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-sky-950/40 border border-sky-500/30 flex items-center justify-center text-sky-400 font-mono text-xs">B</div>
                <span className="text-xs font-bold text-white uppercase">{activeTournament.captain2.name}</span>
              </div>

              {activeTournament.captain2.signed ? (
                <div className="py-6 flex flex-col items-center justify-center text-emerald-400 space-y-2 bg-emerald-950/10 rounded-lg border border-emerald-900/30">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-mono text-[10px] font-bold">MUTUAL SIGNATURE SUBMITTED</span>
                  <span className="text-xs font-semibold text-zinc-300">Submitted: {activeTournament.captain2.opponentScore} - {activeTournament.captain2.score}</span>
                </div>
              ) : (
                <form onSubmit={handleCap2Sign} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">{activeTournament.captain1.name.slice(-5)} Score</label>
                      <input 
                        type="number" 
                        value={cap2OpScore}
                        onChange={(e) => setCap2OpScore(e.target.value === '' ? '' : parseInt(e.target.value))}
                        min={0}
                        required
                        placeholder="e.g. 2"
                        className="w-full px-3 py-2 bg-black border border-zinc-900 rounded-lg font-mono text-center text-sm text-white focus:outline-none focus:border-sky-500"
                        id="input-cap2-op-score"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">My Score ({activeTournament.captain2.name.slice(-3)})</label>
                      <input 
                        type="number" 
                        value={cap2MyScore}
                        onChange={(e) => setCap2MyScore(e.target.value === '' ? '' : parseInt(e.target.value))}
                        min={0}
                        required
                        placeholder="e.g. 1"
                        className="w-full px-3 py-2 bg-black border border-zinc-900 rounded-lg font-mono text-center text-sm text-white focus:outline-none focus:border-sky-500"
                        id="input-cap2-my-score"
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-sky-500 text-black font-display font-extrabold text-[10px] uppercase tracking-wider hover:bg-sky-400 transition-colors cursor-pointer"
                    id="btn-cap2-sign"
                  >
                    Authorize & Sign Escrow
                  </button>
                </form>
              )}
            </div>

          </div>

          {/* Interactive Scanning/Verification Stage */}
          <div className="border-t border-zinc-900 pt-6 space-y-4" id="coordinator-audit-box">
            
            {/* If neither captain has signed yet */}
            {!isBothSigned && (
              <div className="p-4 bg-zinc-900/20 border border-zinc-900 rounded-xl text-center text-xs text-zinc-500 font-sans">
                Signatures required from both Captains to start the QVAC audit check. Fill both scorelines above and sign.
              </div>
            )}

            {/* If both signed, show check or processing */}
            {isBothSigned && !isVerifying && !verificationResult && (
              <div className="bg-black border border-zinc-900 p-5 rounded-xl text-center space-y-4">
                {isOffline ? (
                  <>
                    <div className="flex items-center justify-center space-x-2 text-amber-400">
                      <WifiOff className="w-5 h-5 animate-pulse" />
                      <span className="font-mono text-xs font-bold uppercase tracking-wider">OFFLINE SIGNATURES ENCRYPTED</span>
                    </div>
                    <p className="text-xs text-zinc-400 max-w-md mx-auto">
                      Both signatures have been successfully saved locally in QVAC Offline buffers. Connect and sync online to broadcast to Sepolia and release multi-sig funds.
                    </p>
                    <button
                      onClick={() => {
                        setIsSyncing(true);
                        setTimeout(() => {
                          setIsSyncing(false);
                          setIsOffline(false);
                          setShowSyncSuccess(true);
                          setTimeout(() => setShowSyncSuccess(false), 2500);
                        }, 1200);
                      }}
                      className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-display font-extrabold text-xs tracking-wider uppercase rounded-lg transition-colors cursor-pointer inline-flex items-center space-x-2"
                      id="btn-sync-offline-now"
                    >
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      <span>Sync Ledger Online Now</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center space-x-2 text-orange-400">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-mono text-xs font-bold uppercase tracking-wider">BOTH SIGNATURES COLLECTED</span>
                    </div>
                    <p className="text-xs text-zinc-400 max-w-md mx-auto">
                      The multi-sig thresholds has been met. Trigger the QVAC audit check to ensure scores correspond before dispersing locked funds.
                    </p>
                    <button
                      onClick={runVerification}
                      className="px-6 py-3 bg-sky-400 hover:bg-sky-300 text-black font-display font-extrabold text-xs tracking-wider uppercase rounded-lg transition-colors cursor-pointer inline-flex items-center space-x-2"
                      id="btn-verify-scores"
                    >
                      <Zap className="w-4 h-4 fill-black" />
                      <span>Execute QVAC Correlation Audit</span>
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Processing scanning state */}
            {isVerifying && (
              <div className="p-6 bg-sky-950/10 border border-sky-500/20 rounded-xl flex flex-col items-center space-y-4 text-center">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-sky-500/20 border-t-sky-400 animate-spin"></div>
                  <RefreshCw className="w-5 h-5 text-sky-400 absolute inset-0 m-auto" />
                </div>
                <div className="space-y-1">
                  <span className="text-sky-400 font-mono text-xs font-bold uppercase animate-pulse">Scanning Match Reports...</span>
                  <p className="text-zinc-500 text-[10px] font-mono">QVAC: Verifying consistency parameters, latency audits, signature hashes...</p>
                </div>
              </div>
            )}

            {/* Verification Success (Matched scores or Resolved disputes) */}
            {verificationResult === 'MATCH' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-5"
                id="audit-match-view"
              >
                <div className="flex items-center space-x-3 text-emerald-400">
                  <CheckCircle className="w-6 h-6" />
                  <div>
                    <h4 className="font-display font-extrabold text-sm tracking-wider uppercase">
                      {activeTournament.disputeResolution ? 'QVAC ARBITRATION RESOLVED' : 'QVAC AUDIT PASSED'}
                    </h4>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                      {activeTournament.disputeResolution ? 'Dispute settled by Gemini AI' : 'Zero-Latency Consensus Reached'}
                    </span>
                  </div>
                </div>

                <p className="text-zinc-300 text-xs leading-relaxed font-sans font-normal">
                  Consensus scoreline confirmed: <strong>{activeTournament.captain1.score} - {activeTournament.captain1.opponentScore}</strong>. Tether WDK Multi-sig has triggered settlement disburse.
                </p>

                {activeTournament.disputeResolution && (
                  <div className="p-4 bg-zinc-950/60 border border-zinc-900/60 rounded-xl space-y-3 font-mono text-[10px]">
                    <div className="flex items-center justify-between border-b border-zinc-900/80 pb-1.5 text-zinc-400">
                      <span className="text-zinc-500 uppercase tracking-widest text-[9px]">Settlement Method:</span>
                      <span className="text-sky-400 font-bold">GEMINI WDK AUDITOR</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className="text-zinc-500 uppercase tracking-widest text-[9px]">Decision Confidence:</span>
                      <span className="text-emerald-400 font-bold">{(activeTournament.disputeResolution.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className="text-zinc-500 uppercase tracking-widest text-[9px]">Ground Truth Winner:</span>
                      <span className="text-white font-bold">{activeTournament.disputeResolution.suggestedWinner}</span>
                    </div>
                    {activeTournament.disputeResolution.isSimulated && (
                      <div className="flex items-center justify-between text-zinc-400">
                        <span className="text-zinc-500 uppercase tracking-widest text-[9px]">Status:</span>
                        <span className="text-amber-500 font-bold uppercase">Simulated Fallback</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-zinc-900/80 text-zinc-300 leading-normal font-sans text-xs">
                      <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-1">AI Audit Report:</span>
                      {activeTournament.disputeResolution.geminiAnalysis}
                    </div>
                  </div>
                )}

                {activeTournament.escrow.status === 'DISBURSED' ? (
                  <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-emerald-950/30 border border-emerald-900/40 rounded-lg gap-4">
                    <div className="flex items-center space-x-3 text-white">
                      <Award className="w-8 h-8 text-yellow-400 animate-bounce" />
                      <div>
                        <span className="block font-mono text-[8px] text-zinc-500 uppercase">Settled Winner</span>
                        <span className="text-xs font-bold">
                          {activeTournament.escrow.winnerAddress === activeTournament.captain1.address 
                            ? activeTournament.captain1.name 
                            : activeTournament.captain2.name} ({activeTournament.escrow.totalPool}.00 USDT disbursed)
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={handleResetScores}
                      className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-mono font-bold tracking-wider uppercase rounded-md text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Reset Sim
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                    <div className="w-2.5 h-2.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Executing Smart Contract Transaction Hash...</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Verification Mismatch (Dispute detected) */}
            {verificationResult === 'MISMATCH' && !disputeResolved && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-red-950/20 border border-red-500/30 rounded-xl space-y-5"
                id="audit-mismatch-view"
              >
                <div className="flex items-center space-x-3 text-red-400">
                  <AlertOctagon className="w-6 h-6" />
                  <div>
                    <h4 className="font-display font-extrabold text-sm tracking-wider uppercase text-red-400">DISPUTE DETECTED</h4>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">QVAC Score Correlation Mismatch</span>
                  </div>
                </div>

                <p className="text-zinc-300 text-xs leading-relaxed font-sans font-normal">
                  Signers submitted inconsistent match results! Alice submitted <strong>{activeTournament.captain1.score}-{activeTournament.captain1.opponentScore}</strong>, but Bob submitted <strong>{activeTournament.captain2.opponentScore}-{activeTournament.captain2.score}</strong>. Funds are frozen inside the self-custodial escrow contract.
                </p>

                {/* Evidence Upload Section */}
                <div className="bg-black/60 border border-zinc-900/80 rounded-xl p-4 space-y-3">
                  <label className="block font-mono text-[8px] text-zinc-500 uppercase tracking-widest">
                    Upload Score Screenshot (Match Evidence)
                  </label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-[10px] text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-zinc-900 file:text-zinc-300 file:hover:bg-zinc-800 cursor-pointer"
                  />
                  {previewUrl && (
                    <div className="relative mt-2 border border-zinc-900 rounded-lg overflow-hidden max-h-40 bg-zinc-950 flex items-center justify-center">
                      <img src={previewUrl} alt="Evidence Screenshot" className="max-h-40 object-contain w-auto" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  {isGeminiArbitrating ? (
                    <button
                      disabled
                      className="flex-1 py-3 bg-zinc-900 text-zinc-500 border border-zinc-800 font-display font-extrabold text-[10px] uppercase tracking-wider rounded-lg flex items-center justify-center space-x-2"
                    >
                      <div className="w-3.5 h-3.5 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Gemini AI Auditing Evidence...</span>
                    </button>
                  ) : (
                    <button
                      onClick={forceResolveDispute}
                      className="flex-1 py-3 bg-red-500 text-black font-display font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-colors hover:bg-red-400 cursor-pointer flex items-center justify-center space-x-2"
                      id="btn-force-arbitrate"
                    >
                      <Zap className="w-3.5 h-3.5 fill-black" />
                      <span>{evidenceFile ? 'Arbitrate via Gemini AI' : 'Simulate Dispute Arbitration'}</span>
                    </button>
                  )}
                  
                  <button
                    onClick={handleResetScores}
                    disabled={isGeminiArbitrating}
                    className="flex-1 py-3 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white font-display font-bold text-[10px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    id="btn-reset-dispute"
                  >
                    Re-submit Scores
                  </button>
                </div>
              </motion.div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
