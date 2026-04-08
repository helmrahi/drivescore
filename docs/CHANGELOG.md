# Changelog DriveScore

## [1.3.0] - Avril 2026

### feat
- Leaderboard conducteurs avec podium Top 3
- Toggle consentement leaderboard CNDP
- Badges 3 niveaux Bronze/Argent/Or
- Dashboard connecte aux vraies donnees Supabase
- Architecture refactorisee (services, hooks, types, config)

### fix
- Responsive mobile Login, Inscription, ResetPassword
- Gestion erreur sauvegarde trajet
- RLS Supabase policies

### perf
- SpeedLimits : overpass.kumi.systems (3x plus rapide)
- Rayon OSM 30m -> 15m, timeout 5s -> 3s

## [1.2.0] - Avril 2026

### feat
- Module telematique GPS + accelerometre
- Limite vitesse OSM en temps reel
- Reset password flow complet

### fix
- Seuil accelerometre 7, delai 2000ms
- Variables Supabase sur Vercel
- vercel.json routing SPA

## [1.0.0] - Avril 2026
- Initialisation projet React + Vite + TypeScript + Supabase
