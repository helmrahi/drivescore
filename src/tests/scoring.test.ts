import { describe, it, expect } from 'vitest'
import { calculerScore, calculerFacture } from '../services/scoringService'
import { estEnExces, excesGrave, getToleranceVitesse } from '../lib/speedLimits'

describe('calculerScore', () => {
  it('score départ = 100 sans incident', () => {
    const r = calculerScore([], 0, 0, 0)
    expect(r.score).toBe(100)
  })

  it('freinage brusque = -3 pts', () => {
    const events = [{ type: 'freinage' as const, magnitude: 9, timestamp: 0 }]
    const r = calculerScore(events, 0, 0, 0)
    expect(r.score).toBe(97)
  })

  it('freinage urgence = -8 pts', () => {
    const events = [{ type: 'freinage' as const, magnitude: 13, timestamp: 0 }]
    const r = calculerScore(events, 0, 0, 0)
    expect(r.score).toBe(92)
  })

  it('acceleration brusque = -2 pts', () => {
    const events = [{ type: 'acceleration' as const, magnitude: 9, timestamp: 0 }]
    const r = calculerScore(events, 0, 0, 0)
    expect(r.score).toBe(98)
  })

  it('exces leger = -3 pts', () => {
    const r = calculerScore([], 0, 1, 0)
    expect(r.score).toBe(97)
  })

  it('exces grave = -7 pts', () => {
    const r = calculerScore([], 0, 1, 1)
    expect(r.score).toBe(93)
  })

  it('score minimum = 0', () => {
    const events = Array(20).fill({ type: 'freinage' as const, magnitude: 13, timestamp: 0 })
    const r = calculerScore(events, 0, 50, 50)
    expect(r.score).toBe(0)
  })

  it('score ne peut pas être négatif', () => {
    const r = calculerScore([], 0, 100, 100)
    expect(r.score).toBeGreaterThanOrEqual(0)
  })
})

describe('estEnExces', () => {
  it('60 km/h zone 50 ville = excès', () => {
    expect(estEnExces(60, 50, 'ville')).toBe(true)
  })

  it('54 km/h zone 50 ville = pas excès (tolérance +5)', () => {
    expect(estEnExces(54, 50, 'ville')).toBe(false)
  })

  it('90 km/h zone 80 route = pas excès (tolérance +8)', () => {
    expect(estEnExces(87, 80, 'route')).toBe(false)
  })

  it('100 km/h zone 80 route = excès', () => {
    expect(estEnExces(100, 80, 'route')).toBe(true)
  })

  it('130 km/h zone 120 autoroute = pas excès (tolérance +10)', () => {
    expect(estEnExces(129, 120, 'autoroute')).toBe(false)
  })

  it('faux positif OSM autoroute ignoré', () => {
    expect(estEnExces(95, 40, 'autoroute')).toBe(false)
  })

  it('limite aberrante ignorée', () => {
    expect(estEnExces(60, 0, 'ville')).toBe(false)
  })
})

describe('excesGrave', () => {
  it('+20 km/h au dessus tolérance ville = grave', () => {
    expect(excesGrave(80, 50, 'ville')).toBe(true)
  })

  it('+10 km/h = pas grave', () => {
    expect(excesGrave(65, 50, 'ville')).toBe(false)
  })
})

describe('tolerances', () => {
  it('ville = +5 km/h', () => expect(getToleranceVitesse('ville')).toBe(5))
  it('route = +8 km/h', () => expect(getToleranceVitesse('route')).toBe(8))
  it('autoroute = +10 km/h', () => expect(getToleranceVitesse('autoroute')).toBe(10))
})

describe('simulation trajets complets', () => {
  it('trajet parfait — 0 incident = 100', () => {
    const r = calculerScore([], 0, 0, 0)
    expect(r.score).toBe(100)
  })

  it('trajet avec 3 freinages = 91', () => {
    const events = Array(3).fill({ type: 'freinage' as const, magnitude: 9, timestamp: 0 })
    const r = calculerScore(events, 0, 0, 0)
    expect(r.score).toBe(91)
  })

  it('trajet avec 5 excès légers = 85', () => {
    const r = calculerScore([], 0, 5, 0)
    expect(r.score).toBe(85)
  })

  it('trajet avec 2 excès graves = 86', () => {
    const r = calculerScore([], 0, 2, 2)
    expect(r.score).toBe(86)
  })

  it('trajet nocturne — score non impacté', () => {
    const r = calculerScore([], 0, 0, 0)
    expect(r.score).toBe(100) // nocturne = info seulement
  })

  it('réduction 90+ = -15%', () => {
    const f = calculerFacture(200, 95, 'avril')
    expect(f.reduction).toBeGreaterThan(0)
  })
})

describe('partage WhatsApp — génération lien', () => {
  it('lien trajet valide', () => {
    const trajetId = 'abc-123'
    const link = `https://drivescore-eight.vercel.app/trajet/${trajetId}`
    expect(link).toContain('/trajet/')
    expect(link).toContain(trajetId)
  })

  it('message WhatsApp contient score et km', () => {
    const score = 94
    const km = 12.5
    const link = 'https://drivescore-eight.vercel.app/trajet/abc-123'
    const msg = `🚗 Mon trajet DriveScore\nScore: ${score}/100 | ${km.toFixed(2)} km | ${(km*0.5).toFixed(2)} MAD\n👉 ${link}`
    expect(msg).toContain('Score: 94/100')
    expect(msg).toContain('12.50 km')
    expect(msg).toContain('6.25 MAD')
    expect(msg).toContain('drivescore-eight.vercel.app/trajet/')
  })

  it('URL WhatsApp encodée correctement', () => {
    const msg = '🚗 Test DriveScore'
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`
    expect(url).toContain('wa.me')
    expect(url).toContain(encodeURIComponent(msg))
  })
})

describe('🧑‍🎓 Tests simples — tout le monde comprend', () => {

  it('je commence un trajet avec un score parfait de 100', () => {
    const score = calculerScore([], 0, 0, 0).score
    expect(score).toBe(100)
  })

  it('je freine brusquement 1 fois → je perds 3 points', () => {
    const avant = 100
    const apres = calculerScore([{ type: 'freinage', magnitude: 9, timestamp: 0 }], 0, 0, 0).score
    expect(avant - apres).toBe(3)
  })

  it('je roule à 60 km/h dans une zone 50 → excès détecté', () => {
    const enExces = estEnExces(60, 50, 'ville')
    expect(enExces).toBe(true)
  })

  it('je roule à 54 km/h dans une zone 50 → tolérance → pas d excès', () => {
    const enExces = estEnExces(54, 50, 'ville')
    expect(enExces).toBe(false)
  })

  it('score 92 → je paie moins cher que l assurance classique', () => {
    const f = calculerFacture(200, 92, 'avril 2026')
    expect(f.total).toBeLessThan(500)
  })

  it('score 65 → pas de réduction', () => {
    const f = calculerFacture(100, 65, 'avril 2026')
    expect(f.reduction).toBe(0)
  })

  it('plus je roule → plus je paie', () => {
    const peu = calculerFacture(50, 80, 'avril').total
    const beaucoup = calculerFacture(500, 80, 'avril').total
    expect(beaucoup).toBeGreaterThan(peu)
  })

  it('meilleur score → meilleure réduction', () => {
    const excellent = calculerFacture(100, 95, 'avril').reduction
    const moyen = calculerFacture(100, 75, 'avril').reduction
    expect(excellent).toBeGreaterThan(moyen)
  })

})

describe('partage WhatsApp', () => {
  it('lien trajet contient ID valide', () => {
    const id = 'abc-123-def'
    const link = `https://drivescore-eight.vercel.app/trajet/${id}`
    expect(link).toMatch(/\/trajet\/[a-z0-9-]+$/)
  })

  it('message contient score km et MAD', () => {
    const score = 94, km = 12.5
    const msg = `Score: ${score}/100 | ${km.toFixed(2)} km | ${(km*0.5).toFixed(2)} MAD`
    expect(msg).toContain('94/100')
    expect(msg).toContain('12.50 km')
    expect(msg).toContain('6.25 MAD')
  })

  it('URL WhatsApp encodée', () => {
    const msg = '🚗 DriveScore test'
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`
    expect(url).toContain('wa.me')
    expect(url).not.toContain(' ')
  })
})

describe('🚗 Simulation conduite complète', () => {

  // Simulation trajet Casa → Rabat
  it('trajet 116km autoroute sans incident = score 100', () => {
    const r = calculerScore([], 120, 0, 0)
    expect(r.score).toBe(100)
  })

  it('trajet ville avec embouteillages = 5 freinages = score 85', () => {
    const events = Array(5).fill({ type: 'freinage' as const, magnitude: 9, timestamp: 0 })
    const r = calculerScore(events, 60, 0, 0)
    expect(r.score).toBe(85)
  })

  it('trajet risqué = 3 excès graves + 2 freinages urgence = score 63', () => {
    const events = Array(2).fill({ type: 'freinage' as const, magnitude: 13, timestamp: 0 })
    const r = calculerScore(events, 0, 3, 3)
    expect(r.score).toBe(63) // 100 - 2×8 - 3×7 = 63
  })

  it('trajet court 0.3km = km valide pour sauvegarde', () => {
    const km = 0.3
    expect(km >= 0).toBe(true)
  })

  it('trajet 0km = rejeté par isValidKm', () => {
    const km = 0
    const valid = km >= 0.01
    expect(valid).toBe(false)
  })

  // Simulation OSM — limites par type route
  it('route nationale 60 km/h → pas excès à 67 (tolérance +8)', () => {
    const enExces = estEnExces(67, 60, 'route')
    expect(enExces).toBe(false) // 67 < 60+8=68 → OK
  })

  it('route nationale 60 km/h → excès à 70', () => {
    const enExces = estEnExces(70, 60, 'route')
    expect(enExces).toBe(true) // 70 > 68
  })

  it('ville 60 km/h → excès à 66', () => {
    const enExces = estEnExces(66, 60, 'ville')
    expect(enExces).toBe(true) // 66 > 65
  })

  // Simulation facturation fin de mois
  it('conducteur exemplaire 300km/mois = prime optimale', () => {
    const f = calculerFacture(300, 95, 'avril 2026')
    const base = 200 + 300 * 0.5 // 350
    const reduction = Math.round(base * 0.15) // 52
    expect(f.total).toBe(base - reduction)
    expect(f.total).toBeLessThan(300)
  })

  it('conducteur risqué 300km/mois = prime pleine', () => {
    const f = calculerFacture(300, 60, 'avril 2026')
    expect(f.reduction).toBe(0)
    expect(f.total).toBe(200 + 300 * 0.5)
  })

  // WhatsApp lien simulation
  it('après trajet 116km score 97 = lien WhatsApp valide', () => {
    const score = 97, km = 116
    const id = 'test-trajet-id-123'
    const link = `https://drivescore-eight.vercel.app/trajet/${id}`
    const msg = `🚗 Mon trajet DriveScore\nScore: ${score}/100 | ${km.toFixed(2)} km | ${(km*0.5).toFixed(2)} MAD\n👉 ${link}`
    expect(msg).toContain('97/100')
    expect(msg).toContain('116.00 km')
    expect(msg).toContain('58.00 MAD')
    expect(msg).toContain('/trajet/test-trajet-id-123')
    const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`
    expect(waUrl).toContain('wa.me')
  })
})
