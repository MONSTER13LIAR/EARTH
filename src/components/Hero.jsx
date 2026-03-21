import styles from './Hero.module.css'

export default function Hero() {
  return (
    <div className={styles.wrapper}>
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
