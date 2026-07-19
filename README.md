# RefTrust Escrow

RefTrust is a trustless, AI-powered escrow and dispute resolution platform for gaming tournament matches. It uses Google Gemini AI to analyze match details and resolve score disputes fairly.

## Tech Stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Motion
- **Backend:** Express, tsx
- **AI Integration:** Google Gemini API (`@google/genai`)

## Getting Started

### 1. Installation
Install dependencies in the frontend directory:
```bash
npm run install:frontend
```

### 2. Environment Setup
Create a `.env` file in the `Frontend/` folder using the template:
```bash
cp Frontend/.env.example Frontend/.env
```
Open `Frontend/.env` and add your **Google Gemini API Key**:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

### 3. Run the Application
Start the development server from the root directory:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

## Scripts
- `npm run dev` - Starts the development server.
- `npm run build` - Builds the frontend for production.
- `npm run clean` - Cleans built assets.
- `npm run lint` - Lints TypeScript code.
