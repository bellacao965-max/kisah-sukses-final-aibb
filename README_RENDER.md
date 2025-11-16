Render-ready package — Updated

How to deploy:
1. Upload **all files** from this package into your GitHub repo root.
2. On Render.com create a new Web Service and connect to your repo.
   - Environment: Node
   - Root Directory: .
   - Build Command: npm install
   - Start Command: npm start
3. Set environment variable OPENAI_API_KEY on Render for real AI responses (or GROQ_API_KEY as fallback).
4. OPTIONAL: set MODEL env var (default gpt-4o-mini).
5. Visit the URL after deploy.

Local test:
1. npm install
2. npm start
3. Visit http://localhost:3000

Added features:
- /api/quote — GET returns a random inspirational quote (used by the UI).
- /api/social — POST { platform, text, url } returns a share URL for Facebook/Twitter/Instagram/TikTok.
- Client: added social share buttons and a small browser game in index.html.

Notes:
- This repo now uses the OpenAI REST API. Make sure OPENAI_API_KEY is set in Render Secrets.
