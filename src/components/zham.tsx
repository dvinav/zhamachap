import type { FunctionalComponent } from 'preact'
import { useEffect, useRef } from 'preact/hooks'
import styles from '../styles/styles.module.css'

interface Props {
  secondsLeft: number
  duration: number
}

const Zham: FunctionalComponent<Props> = ({ secondsLeft, duration }) => {
  const strokeRef = useRef<SVGCircleElement | null>(null)

  useEffect(() => {
    const maxFrames = 600
    const progress = Math.min(1 - secondsLeft / duration, 1)
    const frame = maxFrames - Math.floor(progress * maxFrames)
    const dashoffset = -804 + (804 * frame) / maxFrames
    if (strokeRef?.current) strokeRef.current.style.strokeDashoffset = dashoffset.toString()
  }, [secondsLeft, duration])

  return (
    <svg className={styles.zhamSvg} viewBox="0 0 512 512">
      <circle ref={strokeRef} className={styles.zhamStroke} cx="50%" cy="50%" r="128" fill="none" stroke="white" />
    </svg>
  )
}

export default Zham
