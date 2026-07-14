import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '12mb' })); // Support base64 image uploads

const DB_PATH = path.resolve(__dirname, 'data/tournaments.json');

// Initialize Gemini client if API key is provided
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  console.log('[RefTrust Backend] Gemini API Key found. Initializing Gemini SDK...');
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} else {
  console.warn('[RefTrust Backend] WARNING: GEMINI_API_KEY is not set. Dispute resolution will run in simulated mode.');
}

// Database helper functions
function loadTournaments(): any[] {
  try {
    if (!fs.existsSync(DB_PATH)) {
      // Ensure folder exists
      const dbDir = path.dirname(DB_PATH);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      // Initial template
      const initialSeed = [
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
      ];
      fs.writeFileSync(DB_PATH, JSON.stringify(initialSeed, null, 2));
      return initialSeed;
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading database:', err);
    return [];
  }
}

function saveTournaments(data: any[]) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

// API Routes

// 1. Get all tournaments
app.get('/api/tournaments', (req, res) => {
  const data = loadTournaments();
  res.json(data);
});

// 2. Search tournament by code
app.get('/api/tournaments/:code', (req, res) => {
  const codeUpper = req.params.code.trim().toUpperCase();
  const data = loadTournaments();
  const found = data.find(t => t.code === codeUpper);
  if (found) {
    res.json(found);
  } else {
    res.status(404).json({ error: `Tournament not found for code ${codeUpper}` });
  }
});

// 3. Create a tournament escrow
app.post('/api/tournaments', (req, res) => {
  const { name, entryFee, captain1Name, captain1Address, captain2Name, captain2Address } = req.body;
  
  if (!name || !entryFee || !captain1Name || !captain1Address || !captain2Name || !captain2Address) {
    return res.status(400).json({ error: 'Missing required settings fields.' });
  }

  const code = `REF-${Math.floor(1000 + Math.random() * 9000)}`;
  const id = Math.random().toString(36).substring(7);
  
  // Generate random mock contract address
  const hexChars = '0123456789abcdef';
  let mockAddr = '0x';
  for (let i = 0; i < 40; i++) {
    mockAddr += hexChars[Math.floor(Math.random() * 16)];
  }

  const newTournament = {
    id,
    name,
    code,
    captain1: {
      name: captain1Name,
      address: captain1Address,
      score: null,
      opponentScore: null,
      signed: false,
    },
    captain2: {
      name: captain2Name,
      address: captain2Address,
      score: null,
      opponentScore: null,
      signed: false,
    },
    escrow: {
      contractAddress: mockAddr,
      entryFee,
      totalPool: entryFee * 2,
      currency: 'USDT',
      status: 'LOCKED',
      winnerAddress: null,
      txHash: '0x' + Array.from({ length: 64 }, () => hexChars[Math.floor(Math.random() * 16)]).join(''),
    },
    createdAt: new Date().toLocaleString(),
  };

  const data = loadTournaments();
  data.unshift(newTournament);
  saveTournaments(data);

  res.json(newTournament);
});

// 4. Join a tournament (simulate deposit)
app.post('/api/tournaments/:id/join', (req, res) => {
  const { id } = req.params;
  const { captainIndex } = req.body;

  if (captainIndex !== 1 && captainIndex !== 2) {
    return res.status(400).json({ error: 'Invalid captainIndex. Must be 1 or 2.' });
  }

  const data = loadTournaments();
  const index = data.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Tournament not found' });
  }

  const tournament = data[index];
  if (captainIndex === 1) {
    tournament.captain1.signed = true;
  } else {
    tournament.captain2.signed = true;
  }

  data[index] = tournament;
  saveTournaments(data);
  res.json(tournament);
});

// 5. Submit score and sign contract
app.post('/api/tournaments/:id/sign', (req, res) => {
  const { id } = req.params;
  const { captainIndex, score, opponentScore } = req.body;

  if (captainIndex !== 1 && captainIndex !== 2) {
    return res.status(400).json({ error: 'Invalid captainIndex. Must be 1 or 2.' });
  }
  if (score === undefined || opponentScore === undefined) {
    return res.status(400).json({ error: 'Missing score inputs.' });
  }

  const data = loadTournaments();
  const index = data.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Tournament not found' });
  }

  const tournament = data[index];
  if (captainIndex === 1) {
    tournament.captain1.score = Number(score);
    tournament.captain1.opponentScore = Number(opponentScore);
    tournament.captain1.signed = true;
  } else {
    tournament.captain2.score = Number(opponentScore); // Inward perspective mapping
    tournament.captain2.opponentScore = Number(score);
    tournament.captain2.signed = true;
  }

  data[index] = tournament;
  saveTournaments(data);
  res.json(tournament);
});

// 6. QVAC correlation verification check
app.post('/api/tournaments/:id/verify', (req, res) => {
  const { id } = req.params;
  
  const data = loadTournaments();
  const index = data.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Tournament not found' });
  }

  const tournament = data[index];
  const cap1 = tournament.captain1;
  const cap2 = tournament.captain2;

  if (!cap1.signed || !cap2.signed) {
    return res.status(400).json({ error: 'Both captains must sign before verification.' });
  }

  // Correlation audit check
  // Alice's score must equal Bob's perception of Alice's score, and vice-versa
  const doesMatch = cap1.score === cap2.opponentScore && cap1.opponentScore === cap2.score;

  if (doesMatch) {
    tournament.escrow.status = 'DISBURSED';
    // Determine winner address
    if (cap1.score! > cap2.score!) {
      tournament.escrow.winnerAddress = cap1.address;
    } else if (cap2.score! > cap1.score!) {
      tournament.escrow.winnerAddress = cap2.address;
    } else {
      // Draw - disburse split or operator refund (for demo, default to cap1)
      tournament.escrow.winnerAddress = cap1.address;
    }
  } else {
    tournament.escrow.status = 'DISPUTED';
  }

  data[index] = tournament;
  saveTournaments(data);
  res.json(tournament);
});

// 7. Reset tournament simulation
app.post('/api/tournaments/:id/reset', (req, res) => {
  const { id } = req.params;

  const data = loadTournaments();
  const index = data.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Tournament not found' });
  }

  const tournament = data[index];
  tournament.captain1.score = null;
  tournament.captain1.opponentScore = null;
  tournament.captain1.signed = false;
  tournament.captain2.score = null;
  tournament.captain2.opponentScore = null;
  tournament.captain2.signed = false;
  tournament.escrow.status = 'LOCKED';
  tournament.escrow.winnerAddress = null;
  
  // Clear any dispute resolution details
  delete tournament.disputeResolution;

  data[index] = tournament;
  saveTournaments(data);
  res.json(tournament);
});

// 8. Dispute Arbitration via Gemini AI
app.post('/api/tournaments/:id/resolve-dispute', async (req, res) => {
  const { id } = req.params;
  const { evidenceImage, mimeType } = req.body;

  const data = loadTournaments();
  const index = data.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Tournament not found' });
  }

  const tournament = data[index];
  const cap1 = tournament.captain1;
  const cap2 = tournament.captain2;

  // Check if we can perform Gemini AI analysis
  if (ai && evidenceImage && mimeType) {
    try {
      console.log(`[RefTrust Backend] Invoking Gemini API to resolve dispute for tournament: ${tournament.name}`);
      
      // Clean base64 image data (remove header if present)
      let base64Data = evidenceImage;
      if (evidenceImage.includes('base64,')) {
        base64Data = evidenceImage.split('base64,')[1];
      }

      const promptText = `
Analyze the uploaded match result screenshot. This screenshot represents the final score of a competitive game match (such as FIFA, PES, Valorant, CS:GO, Rocket League, or similar).
Your job is to identify the final score and who won the match.

Captain Alice's Team Name: "${cap1.name}" (Wallet: ${cap1.address})
Captain Bob's Team Name: "${cap2.name}" (Wallet: ${cap2.address})

Carefully read the text and numbers in the screenshot. Match the teams shown in the image to "${cap1.name}" and "${cap2.name}".
Return your analysis strictly in the following JSON format:
{
  "aliceScore": <number or null if not found>,
  "bobScore": <number or null if not found>,
  "winner": "alice" | "bob" | "draw",
  "confidence": <number between 0.0 and 1.0 indicating your confidence>,
  "explanation": "<a detailed 2-3 sentence explanation of your observation of the screenshot and how you determined the winner>"
}
Return only this raw JSON object. Do not include markdown formatting or backticks.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { text: promptText },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data
                }
              }
            ]
          }
        ],
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text || '';
      console.log('[RefTrust Backend] Gemini API response:', responseText);

      // Parse Gemini's JSON response
      const result = JSON.parse(responseText.trim());
      
      // Apply the dispute resolution
      let winnerAddress = cap1.address; // Fallback
      if (result.winner === 'bob') {
        winnerAddress = cap2.address;
      }

      tournament.escrow.status = 'DISBURSED';
      tournament.escrow.winnerAddress = winnerAddress;
      
      // Update reported scores to represent the ground truth resolved by Gemini
      tournament.captain1.score = result.aliceScore !== null ? result.aliceScore : tournament.captain1.score;
      tournament.captain1.opponentScore = result.bobScore !== null ? result.bobScore : tournament.captain1.opponentScore;
      tournament.captain2.score = result.bobScore !== null ? result.bobScore : tournament.captain2.score;
      tournament.captain2.opponentScore = result.aliceScore !== null ? result.aliceScore : tournament.captain2.opponentScore;

      tournament.disputeResolution = {
        resolvedAt: new Date().toLocaleString(),
        geminiAnalysis: result.explanation,
        suggestedWinner: result.winner === 'alice' ? cap1.name : cap2.name,
        confidence: result.confidence,
        isSimulated: false
      };

      data[index] = tournament;
      saveTournaments(data);

      return res.json(tournament);

    } catch (err: any) {
      console.error('[RefTrust Backend] Error contacting Gemini API, falling back to simulation:', err);
      // Fallback below
    }
  }

  // Fallback / Simulated Dispute Resolution (used if Gemini is not configured or fails)
  console.log('[RefTrust Backend] Running simulated dispute arbitration fallback.');
  
  tournament.escrow.status = 'DISBURSED';
  // Default to Alice as winner in the mock simulation
  tournament.escrow.winnerAddress = cap1.address;
  tournament.captain1.score = 2;
  tournament.captain1.opponentScore = 1;
  tournament.captain2.score = 1;
  tournament.captain2.opponentScore = 2;

  tournament.disputeResolution = {
    resolvedAt: new Date().toLocaleString(),
    geminiAnalysis: `[SIMULATED RUN] The QVAC arbitration parsed the uploaded evidence image. Alice's Squad is verified as the winner (2-1 scoreline) based on OCR match metadata and latency audit corroboration.`,
    suggestedWinner: cap1.name,
    confidence: 0.95,
    isSimulated: true
  };

  data[index] = tournament;
  saveTournaments(data);
  res.json(tournament);
});

// Serve frontend client
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // Serve static files in production
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    // Run Vite dev middleware in development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });
    
    app.use(vite.middlewares);
    
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }

  const port = parseInt(process.env.PORT || '3000');
  app.listen(port, '0.0.0.0', () => {
    console.log(`[RefTrust Escrow] Unified Server running at http://localhost:${port}`);
  });
}

startServer();
