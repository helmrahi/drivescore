# Librairie de composants DriveScore

Import : `import { Button, Card, Input, Badge, ScoreGauge, MetricCard, Loader, EmptyState, Toggle, BottomNav, SectionHeader } from '../design-system/components'`

## Button

```tsx
<Button variant="primary" size="md" onClick={fn}>Se connecter</Button>
<Button variant="secondary">Annuler</Button>
<Button variant="ghost">En savoir plus</Button>
<Button variant="danger">Supprimer</Button>
<Button loading>Chargement...</Button>
<Button fullWidth>Pleine largeur</Button>
```

Variantes : primary | secondary | ghost | danger
Tailles : sm (32px) | md (44px) | lg (52px)

## Card

```tsx
<Card accent="#2E7D32">
  Contenu avec accent vert en haut
</Card>
```

## Input

```tsx
<Input
  label="Email"
  type="email"
  placeholder="sara@email.com"
  value={email}
  onChange={setEmail}
  icon="✉️"
  error="Email invalide"
  required
/>
```

## Badge

```tsx
<Badge variant="success">Excellent</Badge>
<Badge variant="warning">Moyen</Badge>
<Badge variant="danger">Danger</Badge>
<Badge variant="gold">🥇 Or</Badge>
```

## ScoreGauge

```tsx
<ScoreGauge score={87} size="lg" showLabel />
```

## MetricCard

```tsx
<MetricCard
  label="Score conduite"
  value={87}
  unit="/100"
  accent="#2E7D32"
  icon="📊"
  sub="Excellent ce mois"
/>
```

## BottomNav

```tsx
<BottomNav
  items={[
    { icon: '🏠', label: 'Accueil', path: '/dashboard' },
    { icon: '🚗', label: 'Trajet', path: '/telematics' },
    { icon: '📋', label: 'Historique', path: '/trajets' },
    { icon: '🏆', label: 'Classement', path: '/leaderboard' },
  ]}
  active="/dashboard"
  onNavigate={navigate}
/>
```
