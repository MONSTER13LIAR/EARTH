import Spline from '@splinetool/react-spline'
import styles from './Hero.module.css'

export default function Hero() {
  return (
    <div className={styles.wrapper}>
      <Spline
        scene="https://prod.spline.design/SU8t11v6uwkt1Jxn/scene.splinecode"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0
        }}
      />
      <div className={styles.torch} aria-hidden="true" />
      <div className={styles.stage}>
        <div className={styles.line} aria-hidden="true" />
        <h1 className={styles.title}>EARTH</h1>
        <div className={styles.wordsRow}>
          <div className={styles.wordItem}>Education</div>
          <div className={styles.wordItem}>Agriculture</div>
          <div className={styles.wordItem}>Rural Fintech</div>
          <div className={styles.wordItem}>Technology</div>
          <div className={styles.wordItem}>Health</div>
        </div>
      </div>
    </div>
  )
}
