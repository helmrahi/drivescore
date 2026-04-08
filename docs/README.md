# DriveScore by Wafa Assurance

## Vision produit
DriveScore est la première assurance auto télématique PAYD au Maroc.

## Stack technique
- Frontend : React 19 + Vite + TypeScript
- Backend : Supabase (PostgreSQL + Auth + RLS)
- Deploiement : Vercel
- GPS/Capteurs : Web APIs natives
- Limites vitesse : OpenStreetMap Overpass API

## Architecture
src/
  config/    - Constantes centralisees (WAFA colors, tarifs, seuils)
  hooks/     - Logique React reutilisable (useAuth, useDashboard, useTelematics)
  lib/       - Clients externes (supabase.ts, speedLimits.ts)
  pages/     - Vues (Login, Dashboard, Telematics, Trajets, Leaderboard)
  services/  - Logique metier (profileService, trajetService, scoringService)
  types/     - Types TypeScript centralises

## Lancer le projet
npm install
cp .env.example .env.local
npm run dev

## URLs
- Production : https://drivescore-eight.vercel.app
- Supabase : https://fjunjzojbvjuinokoued.supabase.co
- GitHub : https://github.com/helmrahi/drivescore
