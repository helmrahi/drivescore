# Design System DriveScore

## Principes fondamentaux

### 1. Clarté avant tout
L'utilisateur doit comprendre son score et sa prime en moins de 3 secondes.

### 2. Mobile first
80% des utilisateurs sont sur mobile. Chaque décision de design commence par le mobile.

### 3. Confiance et sécurité
Palette verte = sécurité, fiabilité. Or = récompense, premium. Cohérent avec l'assurance.

### 4. Feedback immédiat
Chaque action a une réponse visuelle : couleur, animation, message.

---

## Palette de couleurs

### Primaire — Vert Wafa
| Token | Valeur | Usage |
|-------|--------|-------|
| primary.500 | #2E7D32 | Boutons principaux, score excellent |
| primary.600 | #1B5E20 | Hover, états actifs |
| primary.50  | #F0FDF4 | Arrière-plans success |

### Secondaire — Or Wafa
| Token | Valeur | Usage |
|-------|--------|-------|
| gold.500 | #F5A623 | CTA secondaires, badges premium |
| gold.600 | #D4891A | Texte sur fond clair |
| gold.100 | #FEF3C7 | Arrière-plans informatifs |

### Score conducteur
| Score | Couleur | Hex |
|-------|---------|-----|
| 90-100 | Excellent | #16A34A |
| 80-89 | Bon | #2E7D32 |
| 70-79 | Moyen | #D97706 |
| 60-69 | Faible | #EA580C |
| 0-59 | Danger | #DC2626 |

---

## Typographie

Police : Inter (standard fintech mondial)
Grille : 8px

| Niveau | Taille | Poids | Usage |
|--------|--------|-------|-------|
| Display | 48px | 900 | Score principal |
| H1 | 30px | 700 | Titres de page |
| H2 | 24px | 700 | Sections |
| H3 | 18px | 600 | Sous-sections |
| Body | 15px | 400 | Contenu |
| Caption | 11px | 500 | Labels, tags |

---

## Composants disponibles

| Composant | Usage |
|-----------|-------|
| Button | Actions principales et secondaires |
| Card | Conteneur d'informations |
| Input | Saisie utilisateur |
| Badge | Statuts, niveaux |
| ScoreGauge | Affichage score conducteur |
| MetricCard | KPIs (km, facture, score) |
| Loader | États de chargement |
| EmptyState | Absence de données |
| Toggle | Préférences utilisateur |
| BottomNav | Navigation mobile principale |
| SectionHeader | En-têtes de sections |

---

## Règles UX critiques

1. Score toujours visible avec sa couleur et son impact prime
2. Prix en MAD toujours en gras et en orange
3. Bouton principal toujours en bas sur mobile (zone pouce)
4. Feedback d'erreur sous le champ concerné, jamais en popup
5. États de chargement sur toutes les actions async
