
export function calcScoreAvance(
  events: Array<{type: string, magnitude: number, vitesseAuMoment: number}>,
  speedMax: number
): number {
  let score = 100

  events.forEach(e => {
    if (e.type === 'freinage') {
      // Pas de pénalité si vitesse < 20 km/h (feu rouge, stop)
      if (e.vitesseAuMoment < 20) return
      // Pénalité proportionnelle à la vitesse
      if (e.vitesseAuMoment < 50) score -= 1  // ville
      else if (e.vitesseAuMoment < 90) score -= 3  // route
      else score -= 6  // autoroute
    }
    if (e.type === 'acceleration') {
      if (e.vitesseAuMoment < 30) return  // démarrage normal
      score -= 2
    }
  })

  if (speedMax > 130) score -= 15
  else if (speedMax > 110) score -= 8
  else if (speedMax > 90) score -= 3

  return Math.max(0, Math.min(100, score))
}
