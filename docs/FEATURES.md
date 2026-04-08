# Fonctionnalites DriveScore

## MVP - Disponible en production

### Auth & Onboarding
- Inscription avec consentements CNDP (Loi 09-08)
- Connexion email/mot de passe
- Reset mot de passe par email
- Protection des routes (ProtectedRoute)

### Dashboard conducteur
- Score de conduite moyen (vraies donnees Supabase)
- Km parcourus ce mois
- Facture estimee (200 MAD + 0,50/km - reduction score)
- Historique des 5 derniers trajets
- Systeme de badges 3 niveaux (Bronze/Argent/Or)
- Toggle leaderboard (consentement CNDP)

### Telematique GPS reelle
- GPS watchPosition haute precision
- Accelerometre detection freinages (seuil 7)
- Limite vitesse OSM en temps reel
- Alerte exces vitesse (tolerance 2 km/h)
- Score calcule automatiquement
- Sauvegarde Supabase

### Leaderboard
- Classement conducteurs ayant consenti
- Top 3 podium avec medailles
- Filtres : score / km / trajets
- Ma position mise en evidence

## Futur - Roadmap

| Priorite | Fonctionnalite |
|----------|---------------|
| Haute    | PWA Android installable |
| Haute    | Emails automatiques Resend |
| Moyenne  | Graphique evolution score |
| Moyenne  | Carte trajet GPS Leaflet |
| Basse    | Back-office admin Wafa |
