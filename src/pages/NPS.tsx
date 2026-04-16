import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const C = {
  greenDeep: '#0D2E1C', greenMid: '#1E5C35', greenAccent: '#2A8A50', greenBright: '#3EBD6F',
  amber: '#F5A623', amberDark: '#8B5E00',
  red: '#E5403A', redDark: '#8B1A17',
  blue: '#2D7DD2', blueDark: '#1A4A7D', blueLight: '#E8F2FC',
  white: '#FFFFFF', surface: '#F7F8F6', surface2: '#EDEFEB',
  textPrimary: '#0D1F16', textSecondary: '#4A6355', textTertiary: '#8AA898',
  border: 'rgba(13,46,28,0.08)', borderStrong: 'rgba(13,46,28,0.14)',
  fontSans: "'DM Sans', sans-serif", fontMono: "'DM Mono', monospace",
}

const PALETTE = ['#E5403A','#E5403A','#E5403A','#E5403A','#E5403A','#E5403A','#E5403A','#F5A623','#F5A623','#3EBD6F','#3EBD6F']
const FEEDBACK = ['😢 Très déçu','😞 Déçu','😕 Pas satisfait','😕 Pas satisfait','😐 Mitigé','😐 Neutre','🙂 Passable','🙂 Satisfait','😊 Bien','😄 Très satisfait','🤩 Vous adorez DriveScore !']

const TAGS_MAP: Record<string, string[]> = {
  high: ['Score en temps réel','Économies sur la prime','Carte GPS','Interface simple','Classement'],
  mid: ['Précision GPS','Coaching conduite','Notifications','Interface','Détails trajets'],
  low: ['GPS imprécis','Score pas clair','Bugs','Prime insuffisante','Trop complexe'],
}

interface Props { pseudoId: string; score: number; km: number; onClose: () => void }

export default function NPS({ pseudoId, score, km, onClose }: Props) {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [sel, setSel] = useState(-1)
  const [tags, setTags] = useState<string[]>([])
  const [verbatim, setVerbatim] = useState('')
  const [saving, setSaving] = useState(false)

  const color = sel < 0 ? C.surface2 : PALETTE[sel]
  const isHigh = sel >= 9
  const isMid = sel >= 7 && sel <= 8
  const tagGroup = isHigh ? 'high' : isMid ? 'mid' : 'low'
  const textColor = sel >= 7 && sel <= 8 ? C.textPrimary : 'white'

  function toggleTag(t: string) {
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  async function submit() {
    setSaving(true)
    await supabase.from('nps_responses').insert({
      pseudo_id: pseudoId, score: sel,
      tags, verbatim: verbatim || null,
    })
    setSaving(false)
    setStep(3)
  }

  const progressDot = (n: number) => (
    <div style={{ width: step >= n ? 20 : 8, height: 4, borderRadius: 2, background: step >= n ? C.greenBright : 'rgba(255,255,255,0.2)', transition: 'all 0.3s' }} />
  )

  return (
    <div style={{ minHeight: '100vh', background: C.greenDeep, fontFamily: C.fontSans, position: 'relative', overflow: 'hidden' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} @keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}`}</style>

      {/* BG décoratif */}
      <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, background: 'radial-gradient(circle,rgba(62,189,111,0.2) 0%,transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 300, left: -40, width: 140, height: 140, background: 'radial-gradient(circle,rgba(245,166,35,0.1) 0%,transparent 70%)', pointerEvents: 'none' }} />

      {/* HEADER */}
      <div style={{ padding: '20px 24px 0', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.greenBright, boxShadow: '0 0 8px rgba(62,189,111,0.6)' }} />
            <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.55)' }}>Wafa · DriveScore</span>
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            {[1,2,3].map(n => progressDot(n))}
          </div>
        </div>

        {/* Score conducteur */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <svg width="60" height="60" viewBox="0 0 60 60" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5"/>
              <circle cx="30" cy="30" r="24" fill="none" stroke={C.amber} strokeWidth="5"
                strokeDasharray={`${2*Math.PI*24*score/100} ${2*Math.PI*24}`} strokeLinecap="round"/>
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'white', fontFamily: C.fontMono, lineHeight: 1 }}>{score}</span>
              <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)' }}>/100</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 3 }}>Votre score ce mois</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'white', letterSpacing: '-0.3px' }}>
              {score >= 90 ? 'Excellent conducteur 🏅' : score >= 80 ? 'Bon conducteur ✅' : score >= 70 ? 'Conducteur moyen' : 'En progression 💪'}
            </div>
            <div style={{ fontSize: 11, color: C.greenBright, marginTop: 2 }}>
              {score >= 90 ? '-15%' : score >= 80 ? '-10%' : score >= 70 ? '-5%' : '0%'} sur votre prime
            </div>
          </div>
        </div>
      </div>

      {/* CARD */}
      <div style={{ background: C.surface, borderRadius: '22px 22px 0 0', padding: '26px 22px 40px', animation: 'fadeUp 0.3s ease' }}>

        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 19, fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.4px', lineHeight: 1.3, marginBottom: 5 }}>
                Recommanderiez-vous DriveScore à un ami ?
              </div>
              <div style={{ fontSize: 12, color: C.textTertiary }}>30 secondes · Anonyme</div>
            </div>

            {/* Boutons 0-10 */}
            <div style={{ display: 'flex', gap: 3, justifyContent: 'space-between', marginBottom: 6 }}>
              {Array.from({length: 11}, (_, i) => (
                <div key={i} onClick={() => setSel(i)} style={{
                  width: 28, height: 28, borderRadius: 7, cursor: 'pointer', fontSize: 11, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  fontFamily: C.fontMono, transition: 'all 0.2s',
                  background: sel === i ? PALETTE[i] : C.white,
                  color: sel === i ? (i >= 7 && i <= 8 ? C.textPrimary : 'white') : C.textTertiary,
                  border: `1px solid ${sel === i ? PALETTE[i] : C.borderStrong}`,
                  transform: sel === i ? 'scale(1.18)' : 'scale(1)',
                  boxShadow: sel === i ? `0 4px 12px ${PALETTE[i]}40` : 'none',
                }}>
                  {i}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.textTertiary, marginBottom: 14 }}>
              <span>😞 Jamais</span><span>😍 Certainement</span>
            </div>

            {/* Feedback live */}
            <div style={{ height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, opacity: sel >= 0 ? 1 : 0, transition: 'opacity 0.2s' }}>
              {sel >= 0 && (
                <div style={{ padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, background: PALETTE[sel] + '18', color: sel >= 9 ? C.greenMid : sel >= 7 ? C.amberDark : C.redDark }}>
                  {FEEDBACK[sel]}
                </div>
              )}
            </div>

            <button onClick={() => sel >= 0 && setStep(2)} style={{
              width: '100%', padding: '14px', borderRadius: 14, fontFamily: C.fontSans,
              background: sel >= 0 ? color : C.surface2,
              color: sel >= 0 ? textColor : C.textTertiary,
              border: 'none', fontWeight: 600, fontSize: 14,
              cursor: sel >= 0 ? 'pointer' : 'not-allowed',
              transition: 'all 0.25s',
            }}>
              {sel >= 0 ? 'Continuer →' : 'Sélectionnez une note'}
            </button>
            <button onClick={onClose} style={{ width: '100%', padding: '9px', borderRadius: 12, background: 'transparent', border: 'none', color: C.textTertiary, fontSize: 12, cursor: 'pointer', marginTop: 6, fontFamily: C.fontSans }}>
              Me demander plus tard
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div style={{ animation: 'fadeUp 0.3s ease' }}>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 17, fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.3px', marginBottom: 5 }}>
                {isHigh ? "C'est quoi le plus pour vous ?" : isMid ? "Qu'est-ce qu'on peut faire mieux ?" : "Qu'est-ce qui vous a déçu ?"}
              </div>
              <div style={{ fontSize: 12, color: C.textTertiary }}>
                {isHigh ? 'Aidez-nous à savoir ce que vous aimez.' : 'Votre retour sera lu par notre équipe.'}
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
              {TAGS_MAP[tagGroup].map(t => (
                <button key={t} onClick={() => toggleTag(t)} style={{
                  padding: '7px 13px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 500, fontFamily: C.fontSans, transition: 'all 0.15s',
                  background: tags.includes(t) ? (isHigh ? C.greenMid : isMid ? C.amberDark : '#8B1A17') : C.white,
                  color: tags.includes(t) ? 'white' : C.textSecondary,
                  border: `1px solid ${tags.includes(t) ? 'transparent' : C.borderStrong}`,
                }}>
                  {t}
                </button>
              ))}
            </div>

            <textarea value={verbatim} onChange={e => setVerbatim(e.target.value)} rows={3}
              placeholder="Dites-nous en plus... (facultatif)"
              style={{ width: '100%', padding: '12px', borderRadius: 12, border: `1px solid ${C.borderStrong}`, fontSize: 13, resize: 'none', outline: 'none', fontFamily: C.fontSans, color: C.textPrimary, background: C.white, lineHeight: 1.6, boxSizing: 'border-box' as const }} />

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => setStep(1)} style={{ padding: '13px 18px', borderRadius: 14, background: 'transparent', border: `1px solid ${C.borderStrong}`, color: C.textTertiary, fontSize: 14, cursor: 'pointer', fontFamily: C.fontSans }}>←</button>
              <button onClick={submit} disabled={saving} style={{ flex: 1, padding: '13px', borderRadius: 14, background: C.greenMid, color: 'white', border: 'none', fontWeight: 600, fontSize: 14, cursor: saving ? 'wait' : 'pointer', fontFamily: C.fontSans }}>
                {saving ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                    Envoi...
                  </span>
                ) : 'Envoyer mon avis'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div style={{ textAlign: 'center', animation: 'fadeUp 0.3s ease' }}>
            <div style={{ fontSize: 52, marginBottom: 14, animation: 'pulse 0.6s ease' }}>
              {isHigh ? '🎉' : isMid ? '🙏' : '💪'}
            </div>
            <div style={{ fontSize: 19, fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.4px', marginBottom: 8 }}>
              {isHigh ? 'Vous êtes fantastique !' : isMid ? 'Merci pour votre honnêteté' : "Merci, on va s'améliorer"}
            </div>
            <div style={{ fontSize: 13, color: C.textTertiary, lineHeight: 1.7, marginBottom: 24 }}>
              {isHigh
                ? "Votre confiance est notre plus belle récompense. Aidez d'autres conducteurs à découvrir DriveScore."
                : isMid ? "Votre avis a été transmis à notre équipe produit. On reviendra vers vous."
                : "Notre équipe va analyser votre retour en priorité et vous contactera sous 24h."}
            </div>

            {isHigh ? (
              <>
                <button onClick={() => { const txt = '🚗 Je recommande DriveScore — assurance auto intelligente au Maroc ! drivescore-eight.vercel.app'; window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, '_blank') }}
                  style={{ width: '100%', padding: '13px', borderRadius: 14, background: '#25D366', color: 'white', border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: C.fontSans, marginBottom: 8 }}>
                  📲 Recommander à un ami
                </button>
                <button onClick={onClose} style={{ width: '100%', padding: '10px', borderRadius: 12, background: 'transparent', border: `1px solid ${C.borderStrong}`, color: C.textTertiary, fontSize: 12, cursor: 'pointer', fontFamily: C.fontSans }}>
                  Retour au tableau de bord
                </button>
              </>
            ) : (
              <>
                <div style={{ background: C.blueLight, borderRadius: 14, padding: 14, border: `1px solid rgba(45,125,210,0.15)`, textAlign: 'left', marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.blueDark, marginBottom: 4 }}>Notre équipe vous contacte</div>
                  <div style={{ fontSize: 11, color: C.textTertiary, lineHeight: 1.5 }}>Réponse garantie sous 24h à votre adresse email enregistrée.</div>
                </div>
                <button onClick={onClose} style={{ width: '100%', padding: '10px', borderRadius: 12, background: 'transparent', border: `1px solid ${C.borderStrong}`, color: C.textTertiary, fontSize: 12, cursor: 'pointer', fontFamily: C.fontSans }}>
                  Retour au tableau de bord
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
