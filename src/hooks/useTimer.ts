import { useEffect, useRef, useState } from 'preact/hooks'

const useTimer = (initialDuration = 0) => {
  const [duration, setDuration] = useState(initialDuration)
  const [secondsLeft, setSecondsLeft] = useState(initialDuration)
  const [isRunning, setIsRunning] = useState(false)
  const lastTimeRef = useRef<number | null>(null)
  const frameRef = useRef<number | null>(null)
  const flooredSeconds = Math.floor(secondsLeft)

  const tick = (time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time
    const delta = (time - lastTimeRef.current) / 1000
    lastTimeRef.current = time
    setSecondsLeft(s => {
      const next = s - delta
      if (next <= 0) {
        cancelAnimationFrame(frameRef.current!)
        setIsRunning(false)
        return 0
      }
      frameRef.current = requestAnimationFrame(tick)
      return next
    })
  }

  const update = (s: number) => {
    pause()
    setDuration(s)
    setSecondsLeft(s)
  }

  useEffect(() => {
    if (isRunning) {
      frameRef.current = requestAnimationFrame(tick)
    } else {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      lastTimeRef.current = null
    }
    return () => frameRef.current && cancelAnimationFrame(frameRef.current)
  }, [isRunning])

  const play = () => setIsRunning(true)

  const pause = () => setIsRunning(false)

  const addSeconds = (s: number) => {
    setSecondsLeft(prev => Math.min(duration, Math.max(0, prev + s)))
  }

  useEffect(() => {
    setSecondsLeft(prev => Math.min(duration, prev))
  }, [duration])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') addSeconds(5)
      if (e.key === 'ArrowRight') addSeconds(-5)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return { duration, secondsLeft, play, pause, isRunning, update, flooredSeconds }
}

export default useTimer
