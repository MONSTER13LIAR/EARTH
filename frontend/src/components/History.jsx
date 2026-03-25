import styles from './History.module.css'

export default function History() {
  const historyData = [
    {
      id: 1,
      time: "Today, 10:30 AM",
      tool: "Dawa Sunaao",
      result: "Paracetamol 500mg — Take twice daily",
      color: "#E53935",
    },
    {
      id: 2,
      time: "Today, 9:15 AM",
      tool: "Kisaan Marg",
      result: "Detected: Leaf blight — Apply copper fungicide",
      color: "#43A047",
    },
    {
      id: 3,
      time: "Yesterday, 4:00 PM",
      tool: "Pustak Dost",
      result: "Chapter 3 Science simplified in Hindi",
      color: "#1E88E5",
    },
    {
      id: 4,
      time: "Yesterday, 11:00 AM",
      tool: "Hunar Upyog",
      result: "Matched to PM Kaushal Vikas Yojana scheme",
      color: "#FB8C00",
    },
    {
      id: 5,
      time: "2 days ago, 3:30 PM",
      tool: "Dawa Sunaao",
      result: "Metformin 500mg — Take with meals",
      color: "#E53935",
    },
    {
      id: 6,
      time: "3 days ago, 8:00 AM",
      tool: "Kisaan Marg",
      result: "Loan document: Interest rate 36% — High risk",
      color: "#43A047",
    },
  ]

  return (
    <div className={styles.pageContainer}>
      <div className={styles.authSection}>
        <div>
          <h2 className={styles.authHeading}>Sign in to save your history</h2>
          <p className={styles.authSubtitle}>Your scans, results and history — all in one place</p>
        </div>
        
        <button className={styles.googleBtn}>
          <svg className={styles.googleIcon} viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className={styles.googleText}>Sign in with Google</span>
        </button>

        <div className={styles.arrowContainer}>
          <svg className={styles.bigRedArrow} viewBox="0 0 24 24">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </div>
      </div>

      <div className={styles.timeline}>
        {historyData.map((item) => (
          <div key={item.id} className={styles.itemContainer}>
            <div className={styles.dot} />
            <div className={styles.card}>
              <div className={styles.badge} style={{ backgroundColor: item.color }}>
                {item.tool}
              </div>
              <span className={styles.timestamp}>{item.time}</span>
              <p className={styles.result}>{item.result}</p>
              
              <div className={styles.watermark}>
                <svg className={styles.lockIcon} viewBox="0 0 24 24">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
                <span className={styles.watermarkText}>Login to save your history</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
