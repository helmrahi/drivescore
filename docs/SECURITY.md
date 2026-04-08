# Securite & Conformite CNDP

## Mesures de securite

### Authentification
- Supabase Auth avec JWT
- Sessions securisees cote client
- Reset mot de passe avec token temporaire
- Routes protegees par ProtectedRoute

### Base de donnees
- Row Level Security (RLS) active sur toutes les tables
- Chaque utilisateur voit uniquement ses propres donnees
- Cle anonyme publique uniquement dans le frontend
- Cle service_role jamais exposee cote client

### Donnees sensibles
- Variables d environnement (.env.local jamais commite)
- Pseudo-anonymisation : pseudo_id (USR-XXXXXX)
- Donnees hebergees en Europe (Frankfurt)

## Conformite CNDP (Loi 09-08 Maroc)

### Consentements collectes a l inscription
1. Traitement des donnees personnelles
2. Geolocalisation et donnees de conduite

### Droits des utilisateurs
- Droit d acces : visible dans le dashboard
- Droit de rectification : profil modifiable
- Droit d opposition : toggle leaderboard
- Droit a l oubli : a implementer

### Donnees collectees
| Donnee | Usage | Conservation |
|--------|-------|-------------|
| Email | Authentification | Duree du contrat |
| GPS | Calcul km et score | 12 mois |
| Accelerometre | Detection freinages | Agregee uniquement |
| Score | Calcul prime | 12 mois |
