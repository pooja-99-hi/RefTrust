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
  const [walletBalance, setWalletBalance] = useState<number>(1250);
  const walletAddress = '0x71C8A6e25501CEBa2E42c1936eB60D74a5f8E43E';

  // Pre-populate with an active demo tournament so they can play right away
  const [tournaments, setTournaments] = useState<Tournament[]>([
    {
      id: 'demo-tether',
      name: 'Tether Developers Cup',
      code: 'TETHER-DEV',
      captain1: {
        name: 'Captain Alice',
        address: '0x7A14b98F8641EbA82F2C55dB600D74a5f8E43E9D',
        score: null,
        opponentScore: null,
        signed: false,
      },
      captain2: {
        name: 'Captain Bob',
        address: '0x3B99c15Ad41E4790CE936171510C1B824f2F4186',
        score: null,
        opponentScore: null,
        signed: false,
      },
      escrow: {
        contractAddress: '0x8Fb4726c5df962da42e3a53e48102381bc5ef3ea',
        entryFee: 50,
        totalPool: 100,
        currency: 'USDT',
        status: 'LOCKED',
        winnerAddress: null,
        txHash: '0x7e1a384f67c29548483b5190a6e0c609c0f99bc7b2b07e774c8bc23cf9e9c32f',
      },
      createdAt: '2026-07-07, 08:00:00 AM',
    }
  ]);

  const [activeTournamentId, setActiveTournamentId] = useState<string | null>('demo-tether');

  // Callback for when tournament is created
  const handleCreateSuccess = (newTournament: Tournament) => {
    setTournaments(prev => [newTournament, ...prev]);
    setActiveTournamentId(newTournament.id);
    setActiveTab('dashboard');
  };

  // Callback for when user joins an escrow successfully
  const handleJoinSuccess = (tournamentCode: string, captainIndex: 1 | 2) => {
    const codeUpper = tournamentCode.trim().toUpperCase();
    setTournaments(prev => prev.map(t => {
      if (t.code === codeUpper) {
        // Subtract entry fee from user's balance
        setWalletBalance(b => b - t.escrow.entryFee);
        
        // Mark joining captain as signed/joined
        if (captainIndex === 1) {
          return {
            ...t,
            captain1: { ...t.captain1, signed: true }
          };
        } else {
          return {
            ...t,
            captain2: { ...t.captain2, signed: true }
          };
        }
      }
      return t;
    }));

    const found = tournaments.find(t => t.code === codeUpper);
    if (found) {
      setActiveTournamentId(found.id);
    }
    setActiveTab('dashboard');
  };

  const handleConnectWallet = () => {
    setWalletConnected(true);
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
          setWalletConnected={setWalletConnected}
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

