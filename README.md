# Map App (React + Mapbox)

Simple, responsive React app using Mapbox GL JS showing two markers: Miami, FL and West Palm Beach, FL.

## Setup

1. Install dependencies:

   ```bash
   cd map-app
   npm install
   ```

2. Set your Mapbox token:

   - Copy `.env.example` to `.env` and set `VITE_MAPBOX_TOKEN` to your Mapbox access token.

   ```bash
   cp .env.example .env
   # edit .env and paste your token
   ```

   Create a token at https://account.mapbox.com/ if you don't have one.

3. Run the dev server:

   ```bash
   npm run dev
   ```

4. Build for production:

   ```bash
   npm run build
   npm run preview
   ```

## Notes

- The map automatically fits bounds to both markers and resizes with the window.
- Marker colors: Miami (red), West Palm Beach (blue). Click markers for labels.

