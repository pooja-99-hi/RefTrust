/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Captain {
  name: string;
  address: string;
  score: number | null;
  opponentScore: number | null;
  signed: boolean;
}

export interface EscrowDetails {
  contractAddress: string;
  entryFee: number;
  totalPool: number;
  currency: string;
  status: 'AWAITING_DEPOSIT' | 'LOCKED' | 'PENDING_SIGNATURES' | 'VERIFYING' | 'DISBURSED' | 'DISPUTED';
  winnerAddress: string | null;
  txHash: string | null;
}

export interface DisputeResolutionDetails {
  resolvedAt: string;
  geminiAnalysis: string;
  suggestedWinner: string;
  confidence: number;
  isSimulated?: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  code: string;
  captain1: Captain;
  captain2: Captain;
  escrow: EscrowDetails;
  createdAt: string;
  disputeResolution?: DisputeResolutionDetails;
}

export interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'contract';
}
