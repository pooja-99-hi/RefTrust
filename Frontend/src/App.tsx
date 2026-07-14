/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Header from './components/Header';
import HomeSection from './components/HomeSection';
import CreateSection from './components/CreateSection';
import JoinSection from './components/JoinSection';
import DashboardSection from './components/DashboardSection';
import { Tournament } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'create' | 'join' | 'dashboard'>('home');
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [walletBalance, setWalletBalance] = useState<number>(1250);

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [activeTournamentId, setActiveTournamentId] = useState<string | null>(null);

  // Check if MetaMask is already connected and setup listener
  React.useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      (window as any).ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts && accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setWalletConnected(true);
          }
        })
        .catch((err: any) => console.error('Error checking MetaMask accounts:', err));

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setWalletConnected(false);
          setWalletAddress('');
        } else {
          setWalletAddress(accounts[0]);
          setWalletConnected(true);
        }
      };

      (window as any).ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        if ((window as any).ethereum.removeListener) {
          (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, []);

  // Load tournaments from server on mount
  React.useEffect(() => {
    fetch('/api/tournaments')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load tournaments');
        return res.json();
      })
      .then(data => {
        setTournaments(data);
        if (data.length > 0) {
          setActiveTournamentId(data[0].id);
        }
      })
      .catch(err => console.error('Error loading tournaments:', err));
  }, []);

  // Callback for when tournament is created
  const handleCreateSuccess = (newTournament: Tournament) => {
    setTournaments(prev => [newTournament, ...prev]);
    setActiveTournamentId(newTournament.id);
    setActiveTab('dashboard');
  };

  // Callback for when user joins an escrow successfully
  const handleJoinSuccess = (updatedTournament: Tournament) => {
    // Subtract entry fee from user's balance
    setWalletBalance(b => b - updatedTournament.escrow.entryFee);
    
    // Update local tournaments list
    setTournaments(prev => prev.map(t => t.id === updatedTournament.id ? updatedTournament : t));
    setActiveTournamentId(updatedTournament.id);
    setActiveTab('dashboard');
  };

  const handleConnectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setWalletConnected(true);
        }
      } catch (err: any) {
        console.error('MetaMask connection failed:', err);
        alert(err.message || 'MetaMask connection rejected');
      }
    } else {
      alert('MetaMask is not installed. Please install MetaMask to use this feature!');
      window.open('https://metamask.io/download/', '_blank');
    }
  };

  const handleDisconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress('');
    setWalletBalance(1250); // reset to mock test value
  };

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-100 selection:bg-sky-500/20 selection:text-sky-400 font-sans antialiased overflow-x-hidden flex flex-col justify-between relative">
      
      {/* Global Pure-CSS Cyber-Grid, Background Video, and Ambient Glowing Background */}
      <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none bg-[#020202]">
        {/* Cinematic Background Video Loop */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none scale-100"
        >
          <source 
            src="https://res.cloudinary.com/dtw14rxgi/video/upload/v1783434349/kling_20260707_Image_to_Video__5595_0_kay1db.mp4" 
            type="video/mp4" 
          />
        </video>

        {/* Animated Cyber-grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.12] z-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, #0ea5e9 1px, transparent 1px),
              linear-gradient(to bottom, #0ea5e9 1px, transparent 1px)
            `,
            backgroundSize: '45px 45px',
          }}
        ></div>
        {/* Glowing cyber spheres / ambient particles */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-sky-500/10 blur-[130px] animate-pulse z-10" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-500/5 blur-[120px] animate-pulse z-10" style={{ animationDuration: '12s' }} />
        <div className="absolute top-[30%] right-[15%] w-[30%] h-[30%] rounded-full bg-sky-500/5 blur-[100px] animate-pulse z-10" style={{ animationDuration: '10s' }} />
        
        {/* Cyber Dots Patterns */}
        <div 
          className="absolute inset-0 opacity-[0.2] z-10"
          style={{
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Elegant overlay gradient that preserves contrast and gives an ultra-premium tech feeling */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/25 to-black/85 z-20"></div>
      </div>

      <div className="relative z-10">
        {/* Navigation Header */}
        <Header 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          walletConnected={walletConnected}
          onConnectWallet={handleConnectWallet}
          onDisconnectWallet={handleDisconnectWallet}
          walletAddress={walletAddress}
          walletBalance={walletBalance}
        />

        {/* Dynamic Route Render */}
        <main className="relative flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="w-full flex justify-center"
            >
              {activeTab === 'home' && (
                <HomeSection 
                  onStartTournament={() => setActiveTab('create')}
                  onJoinTournament={() => setActiveTab('join')}
                  walletConnected={walletConnected}
                  onConnectWallet={handleConnectWallet}
                />
              )}
              {activeTab === 'create' && (
                <CreateSection 
                  onCreateSuccess={handleCreateSuccess}
                  walletConnected={walletConnected}
                  onConnectWallet={handleConnectWallet}
                />
              )}
              {activeTab === 'join' && (
                <JoinSection 
                  tournaments={tournaments}
                  onJoinSuccess={handleJoinSuccess}
                  walletConnected={walletConnected}
                  onConnectWallet={handleConnectWallet}
                  walletBalance={walletBalance}
                />
              )}
              {activeTab === 'dashboard' && (
                <DashboardSection 
                  tournaments={tournaments}
                  setTournaments={setTournaments}
                  activeTournamentId={activeTournamentId}
                  setActiveTournamentId={setActiveTournamentId}
                  walletConnected={walletConnected}
                  onConnectWallet={handleConnectWallet}
                  setWalletBalance={setWalletBalance}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

