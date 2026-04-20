import { describe, it, expect } from 'vitest'
import { calculerFacture, getReduction } from '../services/scoringService'

describe('calculerFacture', () => {
  it('200 MAD base + 0.5/km', () => {
    const f = calculerFacture(100, 95, 'avril 2026')
    expect(f.base).toBe(200)
    expect(f.coutKm).toBe(50)
  })

  it('score 90+ = -15%', () => {
    const f = calculerFacture(100, 92, 'avril 2026')
    expect(f.reduction).toBe(Math.round(250 * 0.15))
  })

  it('score 80-89 = -10%', () => {
    const f = calculerFacture(100, 85, 'avril 2026')
    expect(f.reduction).toBe(Math.round(250 * 0.10))
  })

  it('score 70-79 = -5%', () => {
    const f = calculerFacture(100, 75, 'avril 2026')
    expect(f.reduction).toBe(Math.round(250 * 0.05))
  })

  it('score < 70 = 0%', () => {
    const f = calculerFacture(100, 65, 'avril 2026')
    expect(f.reduction).toBe(0)
  })

  it('total = base + km - reduction', () => {
    const f = calculerFacture(100, 92, 'avril 2026')
    expect(f.total).toBe(f.base + f.coutKm - f.reduction)
  })
})
