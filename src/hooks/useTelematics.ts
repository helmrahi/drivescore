// ============================================
// HOOK TELEMATICS — GPS + Accéléromètre
// ============================================

import { useState, useEffect, useRef } from 'react'
import { GpsPoint, AccelEvent, TelematicsPhase } from '../types'
import { calculerScore } from '../services/scoringService'
import { getLimiteVitesse, estEnExces, messageAlerte } from '../lib/speedLimits'
import { TELEMATICS } from '../config/wafa'

function calcDistance(p1: GpsPoint, p2: GpsPoint): number {
  const R = 6371
  const dLat = (p2.lat - p1.lat) * Math.PI / 180
  const dLon = (p2.lng - p1.lng) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function useTelematics() {
  const [phase, setPhase] = useState<TelematicsPhase>('idle')
  const [km, setKm] = useState(0)
  const [speedKmh, setSpeedKmh] = useState(0)
  const [speedMax, setSpeedMax] = useState(0)
  const [duration, setDuration] = useState(0)
  const [events, setEvents] = useState<AccelEvent[]>([])
  const [score, setScore] = useState(100)
  const [limiteActuelle, setLimiteActuelle] = useState<number | null>(null)
  const [alerteVitesse, setAlerteVitesse] = useState('')
  const [excessVitesse, setExcessVitesse] = useState(0)
  const [error, setError] = useState('')

  const gpsPoints = useRef<GpsPoint[]>([])
  const watchId = useRef<number | null>(null)
  const timerRef = useRef<any>(null)
  const startTime = useRef<number>(0)
  const lastAccel = useRef({ x: 0, y: 0, z: 0, t: 0 })
  const accelEvents = useRef<AccelEvent[]>([])
  const excessRef = useRef(0)
  const speedMaxRef = useRef(0)

  useEffect(() => {
    if (phase === 'running') {
      startTime.current = Date.now()
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime.current) / 1000))
      }, 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase])

  useEffect(() => {
    if (phase !== 'running') return

    function handleMotion(e: DeviceMotionEvent) {
      const accel = e.accelerationIncludingGravity
      if (!accel?.x || !accel?.y || !accel?.z) return
      const now = Date.now()
      if (now - lastAccel.current.t < TELEMATICS.delaiEntreEvents) return

      const dx = Math.abs(accel.x - lastAccel.current.x)
      const dy = Math.abs(accel.y - lastAccel.current.y)
      const magnitude = Math.sqrt(dx ** 2 + dy ** 2)

      if (magnitude > TELEMATICS.seuilFreinage) {
        const type = accel.y < lastAccel.current.y ? 'freinage' : 'acceleration'
        const evt: AccelEvent = { type, magnitude, timestamp: now }
        accelEvents.current.push(evt)
        setEvents([...accelEvents.current])
        const result = calculerScore(accelEvents.current, speedMaxRef.current, excessRef.current)
        setScore(result.score)
      }

      lastAccel.current = { x: accel.x, y: accel.y, z: accel.z, t: now }
    }

    window.addEventListener('devicemotion', handleMotion)
    return () => window.removeEventListener('devicemotion', handleMotion)
  }, [phase])

  async function startTrajet() {
    setPhase('requesting')
    setError('')

    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const perm = await (DeviceMotionEvent as any).requestPermission()
        if (perm !== 'granted') {
          setError('Permission accéléromètre refusée.')
          setPhase('idle')
          return
        }
      } catch {}
    }

    if (!navigator.geolocation) {
      setError('GPS non disponible.')
      setPhase('idle')
      return
    }

    gpsPoints.current = []
    accelEvents.current = []
    excessRef.current = 0
    speedMaxRef.current = 0
    setKm(0); setSpeedKmh(0); setSpeedMax(0); setDuration(0)
    setEvents([]); setLimiteActuelle(null); setAlerteVitesse(''); setExcessVitesse(0)

    watchId.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const point: GpsPoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          speed: pos.coords.speed || 0,
          timestamp: pos.timestamp,
          accuracy: pos.coords.accuracy,
        }

        const currentSpeedKmh = Math.round((pos.coords.speed || 0) * 3.6)
        setSpeedKmh(currentSpeedKmh)
        speedMaxRef.current = Math.max(speedMaxRef.current, currentSpeedKmh)
        setSpeedMax(speedMaxRef.current)

        if (currentSpeedKmh > 5) {
          try {
            const limite = await getLimiteVitesse(point.lat, point.lng, currentSpeedKmh)
            setLimiteActuelle(limite.limite)
            if (estEnExces(currentSpeedKmh, limite.limite)) {
              setAlerteVitesse(messageAlerte(currentSpeedKmh, limite.limite))
              excessRef.current += 1
              setExcessVitesse(excessRef.current)
              const result = calculerScore(accelEvents.current, speedMaxRef.current, excessRef.current)
              setScore(result.score)
            } else {
              setAlerteVitesse('')
            }
          } catch {}
        }

        if (gpsPoints.current.length > 0) {
          const last = gpsPoints.current[gpsPoints.current.length - 1]
          const dist = calcDistance(last, point)
          if (dist > TELEMATICS.distanceMinGPS) {
            gpsPoints.current.push(point)
            const total = gpsPoints.current.reduce((sum, p, i) => {
              if (i === 0) return 0
              return sum + calcDistance(gpsPoints.current[i - 1], p)
            }, 0)
            setKm(+total.toFixed(2))
          }
        } else {
          gpsPoints.current.push(point)
        }
      },
      (err) => {
        setError(`Erreur GPS : ${err.message}`)
        setPhase('idle')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )

    setPhase('running')
  }

  function stopTrajet() {
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current)
    if (timerRef.current) clearInterval(timerRef.current)
    const result = calculerScore(accelEvents.current, speedMaxRef.current, excessRef.current)
    setScore(result.score)
    setPhase('stopped')
  }

  function resetTrajet() {
    setPhase('idle')
    setKm(0); setSpeedKmh(0); setSpeedMax(0); setDuration(0)
    setEvents([]); setScore(100); setLimiteActuelle(null)
    setAlerteVitesse(''); setExcessVitesse(0); setError('')
    gpsPoints.current = []
    accelEvents.current = []
    excessRef.current = 0
    speedMaxRef.current = 0
  }

  return {
    phase, setPhase, km, speedKmh, speedMax, duration,
    events, score, limiteActuelle, alerteVitesse,
    excessVitesse, error, accelEvents, excessRef, speedMaxRef,
    startTrajet, stopTrajet, resetTrajet, gpsPoints,
  }
}
