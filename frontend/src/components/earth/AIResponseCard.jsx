import styles from "./AIResponseCard.module.css";

export default function AIResponseCard({ title, content, warning, loading }) {
  if (loading) {
    return <div className={styles.card}>AI is generating response...</div>;
  }

  if (!content) {
    return <div className={styles.card}>AI response will appear here.</div>;
  }

  return (
    <div className={styles.card}>
      <h3>{title}</h3>
      <p>{content}</p>
      {warning ? <p className={styles.warning}>⚠️ {warning}</p> : null}
    </div>
  );
}
