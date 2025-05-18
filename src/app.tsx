import Lottie, { type LottieRefCurrentProps } from 'lottie-react'
import watchAnim from './watch.json'
import { useEffect, useRef } from 'preact/hooks'
import styles from './styles.module.css'
import useBeep from './hooks/useBeep'
import useTimer from './hooks/useTimer'

const App = () => {
  const lottieRef = useRef<LottieRefCurrentProps | null>(null)
  const { play, pause, update, isRunning, duration, secondsLeft, flooredSeconds } = useTimer(300)
  const getTime = () =>
    `${Math.floor(flooredSeconds / 60)
      .toString()
      .padStart(2, '0')}:${(flooredSeconds % 60).toString().padStart(2, '0')}`
  const minLeftBeep = useBeep({
    sequence: [
      { duration: 100, frequency: 500 },
      { duration: 500, frequency: 400 }
    ]
  })
  const finishBeep = useBeep({
    repeat: true,
    sequence: [
      { duration: 100, frequency: 500 },
      { duration: 200, frequency: 500 }
    ]
  })

  useEffect(() => {
    if (flooredSeconds === 60) minLeftBeep.play()
  }, [flooredSeconds])

  useEffect(() => {
    if (secondsLeft === 0) finishBeep.play()
  }, [secondsLeft])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      finishBeep.stop()
      if (e.key >= '1' && e.key <= '9') {
        const mins = Number(e.key)
        update(mins * 60)
      } else if (e.key === ' ') {
        e.preventDefault()
        isRunning ? pause() : play()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  })

  useEffect(() => {
    lottieRef.current?.goToAndStop(600 - Math.min((secondsLeft / duration) * 600, 600), true)
  }, [secondsLeft])

  return (
    <div className={`${styles.main}  ${secondsLeft < 60 ? styles.minLeft : ''}`}>
      <div className={`${styles.anim}`}>
        <Lottie animationData={watchAnim} loop={false} autoplay={false} lottieRef={lottieRef} className={styles.lottie} />
      </div>
      <span className={`${styles.time}  ${secondsLeft < 10 ? styles.flash : ''}`}>{getTime()}</span>
    </div>
  )
}

export default App
