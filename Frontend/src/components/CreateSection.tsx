import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  HelpCircle, 
  Cpu, 
  ChevronRight, 
  CheckCircle, 
  Copy, 
  ExternalLink,
  ArrowRight,
  Terminal
} from 'lucide-react';
import { Tournament, LogEntry } from '../types';

interface CreateSectionProps {
  onCreateSuccess: (tournament: Tournament) => void;
  walletConnected: boolean;
  onConnectWallet: () => void;
}

export default function CreateSection({
  onCreateSuccess,
  walletConnected,
  onConnectWallet,
}: CreateSectionProps) {
  const [name, setName] = useState('Tether Developers Cup');
  const [fee, setFee] = useState(50);
  const [cap1Name, setCap1Name] = useState('Captain Alice');
  const [cap1Address, setCap1Address] = useState('0x7A14b98F8641EbA82F2C55dB600D74a5f8E43E9D');
  const [cap2Name, setCap2Name] = useState('Captain Bob');
  const [cap2Address, setCap2Address] = useState('0x3B99c15Ad41E4790CE936171510C1B824f2F4186');
  
  const [isDeploying, setIsDeploying] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [deployedTournament, setDeployedTournament] = useState<Tournament | null>(null);
  const [copied, setCopied] = useState(false);

  const startDeployment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletConnected) {
      alert('Please connect your wallet first!');
      return;
    }

    setIsDeploying(true);
    setLogs([]);
    setDeployedTournament(null);

    const simulationLogs: Omit<LogEntry, 'timestamp'>[] = [
      { message: 'Initializing RefTrust WDK Escrow compiler...', type: 'info' },
      { message: `Configuring self-custodial contract for tournament: "${name}"`, type: 'info' },
      { message: `WDK Wallet Engine: Generating multi-sig parameters with threshold 2-of-2`, type: 'info' },
      { message: `Binding Signer 1: ${cap1Name} (${cap1Address.slice(0, 10)}...)`, type: 'contract' },
      { message: `Binding Signer 2: ${cap2Name} (${cap2Address.slice(0, 10)}...)`, type: 'contract' },
      { message: `Securing entry fee target: ${fee} USDt per player (Total Pool: ${fee * 2} USDt)`, type: 'info' },
      { message: 'Submitting transaction payload to Sepolia testnet node...', type: 'info' },
      { message: 'Transaction broadcasted. Waiting for block confirmation (Estimated: 3-4s)...', type: 'warning' },
      { message: 'Transaction confirmed in Block #5819032. Gas Used: 142,501 Gwei.', type: 'success' },
      { message: `WDK ESCROW CONTRACT SUCCESSFULLY DEPLOYED AT: 0x8Fb4726c5df962da42e3a53e48102381bc5ef3ea`, type: 'success' },
      { message: 'Registering QVAC zero-latency scoreline dispute auditor...', type: 'info' },
      { message: 'QVAC dispute correlation engine ONLINE & BOUND.', type: 'success' },
      { message: 'RefTrust Escrow Active. Ready to secure entry fees.', type: 'success' }
    ];

    for (let i = 0; i < simulationLogs.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 350 + Math.random() * 250));
      setLogs(prev => [
        ...prev,
        {
          timestamp: new Date().toLocaleTimeString(),
          ...simulationLogs[i]
        } as LogEntry
      ]);
    }

    try {
      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          entryFee: fee,
          captain1Name: cap1Name,
          captain1Address: cap1Address,
          captain2Name: cap2Name,
          captain2Address: cap2Address
        })
      });
      if (!response.ok) throw new Error('Failed to deploy tournament escrow contract');
      const result: Tournament = await response.json();
      setDeployedTournament(result);
    } catch (err: any) {
      alert(err.message || 'Error deploying escrow');
    } finally {
      setIsDeploying(false);
    }
  };

  const copyCode = () => {
    if (!deployedTournament) return;
    navigator.clipboard.writeText(deployedTournament.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Title */}
      <div className="text-left mb-8 sm:mb-10" id="create-header">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
          CREATE TOURNAMENT ESCROW
        </h1>
        <p className="text-zinc-500 font-sans text-sm mt-1 max-w-xl">
          Deploy a self-custodial 2-of-2 multi-sig escrow contract instantly via the Tether WDK to secure match entry fees.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Hand: Deployment Form */}
        <div className="lg:col-span-7 bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 sm:p-8" id="create-form-container">
          {!deployedTournament && !isDeploying ? (
            <form onSubmit={startDeployment} className="space-y-6">
              
              {/* General details */}
              <div className="space-y-4">
                <h2 className="text-sm font-mono font-bold uppercase text-zinc-400 tracking-wider flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                  <span>Tournament Settings</span>
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono font-medium text-zinc-500 uppercase mb-1.5">Tournament Name</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-black border border-zinc-900 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-sans"
                      id="input-tournament-name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-medium text-zinc-500 uppercase mb-1.5">Entry Fee (USDT)</label>
                    <input 
                      type="number" 
                      value={fee} 
                      onChange={(e) => setFee(parseInt(e.target.value) || 0)}
                      required
                      min={5}
                      className="w-full px-4 py-3 bg-black border border-zinc-900 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono"
                      id="input-entry-fee"
                    />
                  </div>
                </div>
              </div>

              {/* Captain Alice Info */}
              <div className="space-y-4 pt-4 border-t border-zinc-900/80">
                <h2 className="text-sm font-mono font-bold uppercase text-orange-400 tracking-wider flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                  <span>Captain 1 (Signer A)</span>
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-medium text-zinc-500 uppercase mb-1.5">Captain 1 Name</label>
                    <input 
                      type="text" 
                      value={cap1Name} 
                      onChange={(e) => setCap1Name(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-black border border-zinc-900 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      id="input-cap1-name"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono font-medium text-zinc-500 uppercase mb-1.5">Sepolia Wallet Address</label>
                    <input 
                      type="text" 
                      value={cap1Address} 
                      onChange={(e) => setCap1Address(e.target.value)}
                      required
                      pattern="^0x[a-fA-F0-9]{40}$"
                      title="Must be a valid Ethereum address starting with 0x"
                      className="w-full px-4 py-3 bg-black border border-zinc-900 rounded-lg text-xs text-zinc-300 font-mono focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      id="input-cap1-address"
                    />
                  </div>
                </div>
              </div>

              {/* Captain Bob Info */}
              <div className="space-y-4 pt-4 border-t border-zinc-900/80">
                <h2 className="text-sm font-mono font-bold uppercase text-sky-400 tracking-wider flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                  <span>Captain 2 (Signer B)</span>
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-medium text-zinc-500 uppercase mb-1.5">Captain 2 Name</label>
                    <input 
                      type="text" 
                      value={cap2Name} 
                      onChange={(e) => setCap2Name(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-black border border-zinc-900 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                      id="input-cap2-name"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono font-medium text-zinc-500 uppercase mb-1.5">Sepolia Wallet Address</label>
                    <input 
                      type="text" 
                      value={cap2Address} 
                      onChange={(e) => setCap2Address(e.target.value)}
                      required
                      pattern="^0x[a-fA-F0-9]{40}$"
                      title="Must be a valid Ethereum address starting with 0x"
                      className="w-full px-4 py-3 bg-black border border-zinc-900 rounded-lg text-xs text-zinc-300 font-mono focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                      id="input-cap2-address"
                    />
                  </div>
                </div>
              </div>

              {/* Submit / Notice */}
              <div className="pt-4 border-t border-zinc-900/80 space-y-4">
                <div className="p-3 bg-zinc-900/30 border border-zinc-900/80 rounded-lg flex items-start space-x-3">
                  <ShieldAlert className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-zinc-500 leading-normal">
                    <strong>RefTrust Escrow is self-custodial:</strong> Only the nominated captains hold signing keys. RefTrust operators cannot access, freeze, or redirect these funds. Ensure addresses are entered correctly.
                  </p>
                </div>

                {walletConnected ? (
                  <button
                    type="submit"
                    className="w-full py-4 rounded-lg bg-gradient-to-r from-sky-400 to-sky-500 text-black font-display font-extrabold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(14,165,233,0.15)] hover:shadow-[0_0_25px_rgba(14,165,233,0.3)] hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center space-x-2"
                    id="btn-deploy-escrow"
                  >
                    <span>Deploy Tether WDK Escrow Contract</span>
                    <ChevronRight className="w-4 h-4 text-black" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onConnectWallet}
                    className="w-full py-4 rounded-lg border border-sky-500/30 bg-sky-950/10 hover:bg-sky-950/20 text-sky-400 font-display font-extrabold text-xs tracking-wider uppercase transition-all flex items-center justify-center space-x-2 cursor-pointer"
                    id="btn-connect-to-deploy"
                  >
                    <span>Connect Wallet to Deploy Contract</span>
                  </button>
                )}
              </div>

            </form>
          ) : isDeploying ? (
            /* Deploying animation state */
            <div className="flex flex-col items-center justify-center py-16 space-y-6 text-center" id="deploying-state">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-sky-500/20 border-t-sky-400 animate-spin"></div>
                <Cpu className="w-6 h-6 text-sky-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-white font-display font-extrabold text-lg tracking-wider">DEPLOYING MULTI-SIG ESCROW</h3>
                <p className="text-zinc-500 text-xs font-mono">Running Tether WDK Wallet Builder...</p>
              </div>
            </div>
          ) : (
            /* Success state */
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8 py-4"
              id="success-state"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-display font-black text-2xl text-white tracking-wider">ESCROW SECURED</h3>
                  <p className="text-zinc-500 text-xs font-mono mt-1">RefTrust Contract Active on Sepolia</p>
                </div>
              </div>

              <div className="space-y-4 bg-zinc-950/60 border border-zinc-900 rounded-xl p-5">
                {/* Code Showcase */}
                <div className="flex items-center justify-between p-4 bg-black/40 border border-zinc-900/80 rounded-lg">
                  <div>
                    <span className="block font-mono text-[9px] text-zinc-500 uppercase tracking-widest">Share Join Code</span>
                    <span className="font-display font-extrabold text-2xl text-sky-400 tracking-wider">
                      {deployedTournament?.code}
                    </span>
                  </div>
                  <button 
                    onClick={copyCode}
                    className="p-3 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg border border-zinc-800/80 transition-colors flex items-center space-x-1.5 text-xs font-bold"
                  >
                    <Copy className="w-4 h-4" />
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Details list */}
                <div className="space-y-3 pt-2 text-sm font-sans">
                  <div className="flex justify-between border-b border-zinc-900 pb-2">
                    <span className="text-zinc-500">Tournament Name</span>
                    <span className="text-zinc-200 font-semibold">{deployedTournament?.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-900 pb-2">
                    <span className="text-zinc-500">Escrow Address</span>
                    <span className="text-sky-400 font-mono text-xs flex items-center space-x-1">
                      <span>{deployedTournament?.escrow.contractAddress.slice(0, 14)}...</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-900 pb-2">
                    <span className="text-zinc-500">Fee per Captain</span>
                    <span className="text-emerald-400 font-mono font-semibold">
                      {deployedTournament?.escrow.entryFee} USDT
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Total Secured Pool</span>
                    <span className="text-white font-mono font-bold text-base">
                      {deployedTournament?.escrow.totalPool} USDT
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                <button
                  onClick={() => onCreateSuccess(deployedTournament!)}
                  className="flex-1 py-4 rounded-lg bg-sky-400 text-black font-display font-extrabold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(14,165,233,0.15)] hover:bg-sky-300 transition-colors cursor-pointer flex items-center justify-center space-x-2"
                  id="btn-goto-dashboard"
                >
                  <span>Go to Demo Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </button>
                
                <button
                  onClick={() => {
                    setDeployedTournament(null);
                    setLogs([]);
                  }}
                  className="px-6 py-4 rounded-lg border border-zinc-800 bg-zinc-950/20 hover:bg-zinc-900/40 text-zinc-400 hover:text-white text-xs font-display font-bold uppercase transition-colors"
                  id="btn-deploy-another"
                >
                  <span>Deploy Another</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Hand: Immersive Engineering Console Log */}
        <div className="lg:col-span-5 bg-black border border-zinc-900 rounded-2xl h-[480px] flex flex-col justify-between overflow-hidden" id="deployment-console">
          {/* Console Header */}
          <div className="px-4 py-3 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-sky-400" />
              <span className="font-mono text-[10px] font-bold text-zinc-400 tracking-wider uppercase">
                Tether WDK Deployer Engine Log
              </span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          {/* Logs scroll body */}
          <div className="flex-1 p-5 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-3 bg-zinc-950/40 custom-scrollbar">
            {logs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-600 text-center text-xs">
                <span>Deployer offline.<br />Configure settings and click Deploy to power up compiler logs.</span>
              </div>
            ) : (
              <AnimatePresence>
                {logs.map((log, index) => {
                  let color = 'text-zinc-400';
                  let symbol = '⚡';
                  if (log.type === 'success') {
                    color = 'text-emerald-400';
                    symbol = '✔';
                  } else if (log.type === 'warning') {
                    color = 'text-orange-400';
                    symbol = '⚠';
                  } else if (log.type === 'contract') {
                    color = 'text-sky-400';
                    symbol = '✦';
                  }
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-start space-x-2 ${color}`}
                    >
                      <span className="text-zinc-600 text-[9px] mt-0.5 select-none">{log.timestamp}</span>
                      <span className="select-none text-xs">{symbol}</span>
                      <p className="flex-1 whitespace-pre-line">{log.message}</p>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          {/* Console Footer */}
          <div className="px-4 py-3 bg-zinc-950 border-t border-zinc-900 flex justify-between items-center font-mono text-[9px] text-zinc-600">
            <span>NETWORK: SEPOLIA TESTNET</span>
            <span>WDK ESCROW ENGINE v1.2</span>
          </div>
        </div>

      </div>

    </div>
  );
}
