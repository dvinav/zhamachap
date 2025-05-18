import { useEffect, useRef } from 'preact/hooks'

interface Opts {
  repeat?: boolean
  sequence: { frequency?: number; duration?: number }[]
}

const useBeep = (opts: Opts) => {
  const ctxRef = useRef<AudioContext | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const isPlayingRef = useRef(false)
  const oscRefs = useRef<OscillatorNode[]>([])
  const totalDuration = opts.sequence.reduce((acc, { duration = 200 }) => acc + duration + 100, 0) / 1000

  const play = () => {
    stop()
    if (isPlayingRef.current) return
    isPlayingRef.current = true
    if (!ctxRef.current) ctxRef.current = new AudioContext()
    let time = ctxRef.current.currentTime
    oscRefs.current = []

    opts.sequence.forEach(({ frequency = 600, duration = 200 }) => {
      const osc = ctxRef.current!.createOscillator()
      const gain = ctxRef.current!.createGain()
      osc.type = 'sine'
      const adjDuration = duration + 200

      osc.connect(gain)
      gain.connect(ctxRef.current!.destination)

      osc.start(time)
      osc.stop(time + adjDuration / 1000)
      oscRefs.current.push(osc)

      gain.gain.setValueAtTime(0, time)
      gain.gain.linearRampToValueAtTime(0.4, time + 0.005)
      gain.gain.exponentialRampToValueAtTime(0.0001, time + adjDuration / 1000)
      osc.frequency.setValueAtTime(frequency, time)

      time += duration / 1000
    })

    if (opts.repeat) {
      timeoutRef.current = window.setTimeout(() => {
        if (isPlayingRef.current) play()
      }, totalDuration * 1000 + 500)
    }
  }

  const stop = () => {
    isPlayingRef.current = false
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    oscRefs.current.forEach(osc => {
      try {
        osc.stop()
        osc.disconnect()
      } catch {}
    })
    oscRefs.current = []
  }

  useEffect(() => {
    return () => {
      stop()
      if (ctxRef.current) {
        ctxRef.current.close()
        ctxRef.current = null
      }
    }
  }, [])

  return { play, stop }
}

export default useBeep
