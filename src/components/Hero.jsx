import styles from './Hero.module.css'

export default function Hero() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.stage}>
        <div className={styles.line} aria-hidden="true" />
        <h1 className={styles.title}>Earth</h1>
      </div>
    </div>
  )
}
