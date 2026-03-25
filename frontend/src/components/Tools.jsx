import styles from './Tools.module.css'

export default function Tools() {
  const toolsData = [
    {
      name: "Dawa Sunaao",
      description: "Medicine label reader",
      color: "#E53935",
    },
    {
      name: "Pustak Dost",
      description: "Textbook simplifier",
      color: "#1E88E5",
    },
    {
      name: "Kisaan Marg",
      description: "Crop doctor and loan advisor",
      color: "#43A047",
    },
    {
      name: "Hunar Upyog",
      description: "Job and skill finder",
      color: "#FB8C00",
    },
  ]

  return (
    <div className={styles.pageContainer}>
      <div className={styles.cardContainer}>
        {toolsData.map((tool, index) => (
          <div 
            key={index} 
            className={styles.card} 
            style={{ backgroundColor: tool.color }}
          >
            <h2 className={styles.cardName}>{tool.name}</h2>
            <p className={styles.cardDesc}>{tool.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
