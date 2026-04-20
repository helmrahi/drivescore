import { describe, it, expect } from 'vitest'
import { calculerScore } from '../services/scoringService'
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
