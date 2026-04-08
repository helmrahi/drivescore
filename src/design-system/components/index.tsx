// ============================================
// LIBRAIRIE COMPOSANTS — DriveScore
// Tous les composants réutilisables de l'app
// ============================================

import React from 'react'
import { tokens } from '../tokens'

const t = tokens

// ─── BUTTON ─────────────────────────────────
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  onClick?: () => void
  type?: 'button' | 'submit'
}

export function Button({
  children, variant = 'primary', size = 'md',
  disabled, loading, fullWidth, onClick, type = 'button'
}: ButtonProps) {
  const styles: Record<string, React.CSSProperties> = {
    primary: {
      background: `linear-gradient(135deg, ${t.color.primary[600]}, ${t.color.primary[500]})`,
      color: '#fff',
      border: 'none',
      boxShadow: `0 4px 12px rgba(46,125,50,0.3)`,
    },
    secondary: {
      background: t.color.gold[100],
      color: t.color.gold[700],
      border: `1.5px solid ${t.color.gold[500]}`,
    },
    ghost: {
      background: 'transparent',
      color: t.color.neutral[600],
      border: `1.5px solid ${t.color.neutral[200]}`,
    },
    danger: {
      background: `linear-gradient(135deg, #DC2626, #EF4444)`,
      color: '#fff',
      border: 'none',
    },
  }

  const sizes: Record<string, React.CSSProperties> = {
    sm: { padding: `${t.space[2]} ${t.space[3]}`, fontSize: t.font.size.sm, height: '32px' },
    md: { padding: `${t.space[3]} ${t.space[5]}`, fontSize: t.font.size.base, height: '44px' },
    lg: { padding: `${t.space[4]} ${t.space[6]}`, fontSize: t.font.size.md, height: '52px' },
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...styles[variant],
        ...sizes[size],
        width: fullWidth ? '100%' : 'auto',
        borderRadius: t.radius.lg,
        fontWeight: t.font.weight.bold,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: t.space[2],
        transition: t.transition.fast,
        fontFamily: t.font.family.sans,
        letterSpacing: '0.2px',
      }}
    >
      {loading && (
        <span style={{
          width: 16, height: 16,
          border: '2px solid rgba(255,255,255,0.3)',
          borderTopColor: 'white',
          borderRadius: '50%',
          animation: 'ds-spin 0.7s linear infinite',
          display: 'inline-block',
        }} />
      )}
      {children}
    </button>
  )
}

// ─── CARD ───────────────────────────────────
interface CardProps {
  children: React.ReactNode
  accent?: string
  padding?: string
  onClick?: () => void
}

export function Card({ children, accent, padding = t.space[5], onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff',
        borderRadius: t.radius['2xl'],
        padding,
        boxShadow: t.shadow.sm,
        border: `0.5px solid ${t.color.neutral[200]}`,
        borderTop: accent ? `4px solid ${accent}` : undefined,
        cursor: onClick ? 'pointer' : undefined,
        transition: onClick ? t.transition.normal : undefined,
      }}
    >
      {children}
    </div>
  )
}

// ─── INPUT ──────────────────────────────────
interface InputProps {
  label?: string
  placeholder?: string
  type?: string
  value: string
  onChange: (v: string) => void
  error?: string
  icon?: string
  required?: boolean
}

export function Input({ label, placeholder, type = 'text', value, onChange, error, icon, required }: InputProps) {
  const [focused, setFocused] = React.useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: t.space[1] }}>
      {label && (
        <label style={{
          fontSize: t.font.size.xs,
          fontWeight: t.font.weight.semibold,
          color: t.color.neutral[500],
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>
          {label}{required && <span style={{ color: t.color.danger.solid, marginLeft: 2 }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{
            position: 'absolute', left: 14, top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 16, opacity: 0.4,
          }}>{icon}</span>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          required={required}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            padding: `${t.space[3]} ${t.space[4]}`,
            paddingLeft: icon ? '44px' : t.space[4],
            borderRadius: t.radius.lg,
            border: `1.5px solid ${error ? t.color.danger.border : focused ? t.color.primary[500] : t.color.neutral[200]}`,
            fontSize: t.font.size.base,
            outline: 'none',
            boxSizing: 'border-box',
            background: focused ? '#fff' : t.color.neutral[50],
            color: t.color.neutral[900],
            transition: t.transition.fast,
            fontFamily: t.font.family.sans,
          }}
        />
      </div>
      {error && (
        <span style={{ fontSize: t.font.size.xs, color: t.color.danger.text }}>⚠ {error}</span>
      )}
    </div>
  )
}

// ─── BADGE ──────────────────────────────────
interface BadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'gold'
  size?: 'sm' | 'md'
}

export function Badge({ children, variant = 'neutral', size = 'sm' }: BadgeProps) {
  const styles: Record<string, React.CSSProperties> = {
    success: { background: t.color.success.bg, color: t.color.success.text, border: `1px solid ${t.color.success.border}` },
    warning: { background: t.color.warning.bg, color: t.color.warning.text, border: `1px solid ${t.color.warning.border}` },
    danger:  { background: t.color.danger.bg,  color: t.color.danger.text,  border: `1px solid ${t.color.danger.border}` },
    info:    { background: t.color.info.bg,    color: t.color.info.text,    border: `1px solid ${t.color.info.border}` },
    neutral: { background: t.color.neutral[100], color: t.color.neutral[600], border: `1px solid ${t.color.neutral[200]}` },
    gold:    { background: t.color.gold[100], color: t.color.gold[700], border: `1px solid ${t.color.gold[300]}` },
  }

  return (
    <span style={{
      ...styles[variant],
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: size === 'sm' ? '3px 8px' : '5px 12px',
      borderRadius: t.radius.full,
      fontSize: size === 'sm' ? t.font.size.xs : t.font.size.sm,
      fontWeight: t.font.weight.semibold,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}

// ─── SCORE GAUGE ────────────────────────────
interface ScoreGaugeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function ScoreGauge({ score, size = 'md', showLabel = true }: ScoreGaugeProps) {
  const color = score >= 90 ? t.color.score.excellent
    : score >= 80 ? t.color.score.good
    : score >= 70 ? t.color.score.average
    : score >= 60 ? t.color.score.poor
    : t.color.score.danger

  const label = score >= 90 ? '🏅 Excellent'
    : score >= 80 ? '✅ Bon conducteur'
    : score >= 70 ? '⚠️ Moyen'
    : '🔴 À améliorer'

  const sizes = { sm: 56, md: 80, lg: 112 }
  const dim = sizes[size]
  const fontSize = { sm: 20, md: 32, lg: 44 }[size]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: t.space[2] }}>
      <div style={{
        width: dim, height: dim, borderRadius: '50%',
        background: `${color}18`,
        border: `3px solid ${color}`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize, fontWeight: t.font.weight.black, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: t.font.size.xs, color: t.color.neutral[400] }}>/100</span>
      </div>
      {showLabel && (
        <Badge variant={score >= 80 ? 'success' : score >= 60 ? 'warning' : 'danger'}>
          {label}
        </Badge>
      )}
    </div>
  )
}

// ─── LOADER ─────────────────────────────────
export function Loader({ text = 'Chargement...' }: { text?: string }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: t.space[4], background: t.color.neutral[50] }}>
      <style>{`@keyframes ds-spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ width: 40, height: 40, border: `3px solid ${t.color.primary[100]}`, borderTopColor: t.color.primary[500], borderRadius: '50%', animation: 'ds-spin 0.8s linear infinite' }} />
      <span style={{ fontSize: t.font.size.sm, color: t.color.neutral[400] }}>{text}</span>
    </div>
  )
}

// ─── EMPTY STATE ────────────────────────────
interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return (
    <div style={{ textAlign: 'center', padding: `${t.space[10]} ${t.space[6]}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: t.space[3] }}>
      <span style={{ fontSize: 40 }}>{icon}</span>
      <div>
        <p style={{ fontSize: t.font.size.md, fontWeight: t.font.weight.semibold, color: t.color.neutral[700], margin: 0 }}>{title}</p>
        {description && <p style={{ fontSize: t.font.size.sm, color: t.color.neutral[400], margin: `${t.space[1]} 0 0` }}>{description}</p>}
      </div>
      {action && <Button variant="primary" size="sm" onClick={action.onClick}>{action.label}</Button>}
    </div>
  )
}

// ─── METRIC CARD ────────────────────────────
interface MetricCardProps {
  label: string
  value: string | number
  unit?: string
  accent?: string
  icon?: string
  sub?: string
}

export function MetricCard({ label, value, unit, accent, icon, sub }: MetricCardProps) {
  return (
    <Card accent={accent}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: t.space[3] }}>
        <span style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, color: t.color.neutral[400], letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>
        {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: t.space[1], marginBottom: t.space[2] }}>
        <span style={{ fontSize: t.font.size['4xl'], fontWeight: t.font.weight.black, color: accent || t.color.neutral[900], lineHeight: 1 }}>{value}</span>
        {unit && <span style={{ fontSize: t.font.size.sm, color: t.color.neutral[400] }}>{unit}</span>}
      </div>
      {sub && <span style={{ fontSize: t.font.size.xs, color: t.color.neutral[400] }}>{sub}</span>}
    </Card>
  )
}

// ─── TOGGLE ─────────────────────────────────
interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
  description?: string
}

export function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: t.space[4] }}>
      {(label || description) && (
        <div>
          {label && <p style={{ fontSize: t.font.size.base, fontWeight: t.font.weight.medium, color: t.color.neutral[800], margin: 0 }}>{label}</p>}
          {description && <p style={{ fontSize: t.font.size.sm, color: t.color.neutral[400], margin: `${t.space[1]} 0 0` }}>{description}</p>}
        </div>
      )}
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 48, height: 28, borderRadius: t.radius.full,
          background: checked ? t.color.primary[500] : t.color.neutral[200],
          position: 'relative', cursor: 'pointer',
          transition: t.transition.normal, flexShrink: 0,
        }}
      >
        <div style={{
          position: 'absolute', top: 3,
          left: checked ? 23 : 3,
          width: 22, height: 22, borderRadius: '50%',
          background: '#fff',
          boxShadow: t.shadow.sm,
          transition: t.transition.spring,
        }} />
      </div>
    </div>
  )
}

// ─── SECTION HEADER ─────────────────────────
interface SectionHeaderProps {
  title: string
  action?: { label: string; onClick: () => void }
  badge?: string
}

export function SectionHeader({ title, action, badge }: SectionHeaderProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.space[4] }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: t.space[2] }}>
        <h2 style={{ fontSize: t.font.size.md, fontWeight: t.font.weight.bold, color: t.color.neutral[800], margin: 0 }}>{title}</h2>
        {badge && <Badge variant="neutral">{badge}</Badge>}
      </div>
      {action && (
        <button onClick={action.onClick} style={{ fontSize: t.font.size.sm, color: t.color.primary[500], fontWeight: t.font.weight.semibold, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          {action.label} →
        </button>
      )}
    </div>
  )
}

// ─── BOTTOM NAVIGATION ──────────────────────
interface NavItem {
  icon: string
  label: string
  path: string
}

interface BottomNavProps {
  items: NavItem[]
  active: string
  onNavigate: (path: string) => void
}

export function BottomNav({ items, active, onNavigate }: BottomNavProps) {
  return (
    <nav style={{
      position: 'sticky', bottom: 0, left: 0, right: 0,
      background: '#fff',
      borderTop: `0.5px solid ${t.color.neutral[200]}`,
      display: 'flex',
      zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {items.map(item => {
        const isActive = active === item.path
        return (
          <button
            key={item.path}
            onClick={() => onNavigate(item.path)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 3, padding: `${t.space[3]} 0`,
              background: 'none', border: 'none', cursor: 'pointer',
              color: isActive ? t.color.primary[500] : t.color.neutral[400],
              transition: t.transition.fast,
            }}
          >
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span style={{ fontSize: t.font.size.xs, fontWeight: isActive ? t.font.weight.semibold : t.font.weight.regular }}>
              {item.label}
            </span>
            {isActive && (
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: t.color.primary[500], marginTop: -2 }} />
            )}
          </button>
        )
      })}
    </nav>
  )
}

// CSS global animations
export const DS_GLOBAL_STYLES = `
  @keyframes ds-spin { to { transform: rotate(360deg) } }
  @keyframes ds-fade-in { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes ds-pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.5 } }
  * { box-sizing: border-box; }
  body { font-family: ${tokens.font.family.sans}; }
`
