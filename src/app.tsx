import { render } from 'preact'
import './styles/index.css'
import { useEffect } from 'preact/hooks'
import styles from './styles/styles.module.css'
import useBeep from './hooks/useBeep'
import useTimer from './hooks/useTimer'
import Zham from './components/zham'

const App = () => {
  const { play, pause, update, isRunning, duration, secondsLeft, flooredSeconds, setSecondsLeft } = useTimer(300)
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

  const addSeconds = (s: number) => setSecondsLeft(prev => Math.min(duration, Math.max(0, prev + s)))

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      finishBeep.stop()
      if (e.code.startsWith('Digit') && e.code !== 'Digit0') {
        e.preventDefault()
        const mins = Number(e.code.replace('Digit', ''))
        update(mins * 60)
      } else if (e.code === 'Digit0') update(600)
      else if (e.code === 'Minus') update(660)
      else if (e.code === 'Equal') update(720)
      else if (e.code === 'Space') {
        e.preventDefault()
        isRunning ? pause() : play()
      } else if (e.code === 'ArrowLeft') addSeconds(5)
      else if (e.code === 'ArrowRight') addSeconds(-5)
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  })

  return (
    <div className={`${styles.main}  ${secondsLeft < 60 ? styles.minLeft : ''}`}>
      <div className={`${styles.anim}`}>
        <Zham secondsLeft={secondsLeft} duration={duration} />
      </div>
      <span className={`${styles.time}  ${secondsLeft < 10 ? styles.flash : ''}`}>{getTime()}</span>
    </div>
  )
}

render(<App />, document.body)
