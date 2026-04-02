interface Props { size?: number; withText?: boolean }

export default function WafaLogo({ size = 40, withText = true }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <img
        src="/wafa-logo.png"
        alt="Wafa Assurance"
        style={{ width: size, height: size, borderRadius: size * 0.18, objectFit: 'cover' }}
      />
      {withText && (
        <div>
          <div style={{ fontWeight: 900, fontSize: size * 0.38, color: '#1A1A1A', letterSpacing: '-0.3px', lineHeight: 1 }}>
            WAFA <span style={{ color: '#2E7D32' }}>ASSURANCE</span>
          </div>
          <div style={{ fontSize: size * 0.22, color: '#94A3B8', letterSpacing: '0.8px', marginTop: 1 }}>
            DRIVESCORE PAYD
          </div>
        </div>
      )}
    </div>
  )
}
