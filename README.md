# RemedySetu AI Sales Assistant

A web app that turns a customer's WhatsApp message into a ready-to-send sales reply. A salesperson pastes the message, and the app detects the intent and language, matches the product against the catalogue, retrieves verified prices and bulk discounts, and writes a reply in Hindi, English or Hinglish.



**Live demo:** https://remedysetu-ai-five.vercel.app/
**API health check:** https://remedysetu-ai.onrender.com/api/health
**GitHub:** https://github.com/Piyush3091/remedysetu-ai
**Video walkthrough:** ADD_YOUR_VIDEO_LINK_HERE

> The backend runs on Render's free tier and sleeps when idle, so the first request can take up to ~50 seconds.

## Features

- Intent detection (price enquiry, bulk order, complaint, availability, general enquiry)
- Language detection and replies in Hindi, English or Hinglish
- Product matching against a local JSON catalogue (18 sample products, with aliases and Hindi names)
- Verified unit price, bulk price, minimum bulk quantity and total
- Copy-to-clipboard for generated replies
- Query history (SQLite) and a dashboard with basic statistics
- Product catalogue view with search
- Fallback mode: if Gemini is unavailable, deterministic rule-based replies keep the app working


## Tech stack

| Layer    | Technology                                   |
|----------|----------------------------------------------|
| Frontend | React, Vite, Tailwind CSS, JavaScript        |
| Backend  | Python, FastAPI                              |
| AI       | Google Gemini API (`google-genai` SDK)       |
| Data     | `products.json` (catalogue), SQLite (history)|

## How it works

```
WhatsApp message -> React -> FastAPI
  1. Gemini (fast model) extracts intent, language, product text, quantity as JSON
  2. Backend matches the product in products.json and computes prices (source of truth)
  3. Gemini writes a reply using ONLY the verified facts passed in the prompt
  4. Backend validates the reply; on any problem it uses a deterministic reply instead
  5. Result is saved to SQLite and returned to the UI
```

### How hallucinated prices are prevented

1. Prices come only from `products.json`; the AI never supplies them.
2. The AI receives verified facts and strict instructions: no extra maths, no invented products or discounts.
3. The validator rejects any reply containing a number that is not in the verified facts or the customer's message, any percentage, or the name of a product other than the matched one.
4. A rejected or failed AI response is replaced by a deterministic reply built from the same verified data.
5. Ambiguous or unknown products produce a clarification question instead of a guess.

## Project structure

```
backend/
  main.py          FastAPI app and routes
  catalogue.py     Product matching, quantity parsing, pricing, fallback replies
  ai_service.py    Gemini calls, merge logic, reply validation
  database.py      SQLite history and stats
  products.json    Product catalogue (sample data)
frontend/
  src/App.jsx, src/api.js, src/components/ (Dashboard, NewReply, History, Catalogue)
```

## Local setup

Requirements: Python 3.9+, Node 18+.

**Backend**

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # then put your Gemini API key in .env
uvicorn main:app --reload --port 8000
```

Get a free key at https://aistudio.google.com/apikey. Without a key the app runs in fallback mode.

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

## Environment variables

| Variable               | Where    | Purpose                                              |
|------------------------|----------|------------------------------------------------------|
| `GEMINI_API_KEY`       | backend  | Gemini API key (never commit it)                     |
| `GEMINI_MODEL`         | backend  | Model that writes the reply                          |
| `GEMINI_EXTRACT_MODEL` | backend  | Faster model for intent/product extraction           |
| `ALLOWED_ORIGINS`      | backend  | Comma-separated frontend URLs allowed by CORS        |
| `VITE_API_URL`         | frontend | Backend base URL (defaults to http://localhost:8000) |

## API

| Method | Route          | Description                          |
|--------|----------------|--------------------------------------|
| GET    | `/api/health`  | Health check                         |
| GET    | `/api/products`| Full catalogue                       |
| POST   | `/api/process` | Body `{"message": "..."}`; returns analysis and reply |
| GET    | `/api/history` | Saved queries, newest first          |
| GET    | `/api/stats`   | Dashboard counts and recent queries  |

## Notes

- The 18 products and all prices in `products.json` are **sample data** created for this assignment.
- Gemini model names change over time; if a model is retired, set `GEMINI_MODEL` / `GEMINI_EXTRACT_MODEL` to a current one. The backend also tries backup models automatically.
- On free hosting, the SQLite history may reset when the server restarts.

## Possible improvements

- Real catalogue from a database or admin panel, and stock levels
- WhatsApp Business API integration to receive messages automatically
- User login for the sales team
- Persistent hosted database for history