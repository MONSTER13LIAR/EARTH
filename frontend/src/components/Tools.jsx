import styles from './Tools.module.css'

export default function Tools({ setView }) {
  const toolsData = [
    {
      name: "Swasth Raho",
      description: "Your complete rural health companion — scan medicine labels, check symptoms, understand your doctor's advice, all in Hindi",
      color: "#E53935",
      view: "swasth-raho",
    },
    {
      name: "Pustak Dost",
      description: "Your education and career guide — simplify textbooks, get a career roadmap, find jobs and government skill schemes",
      color: "#1E88E5",
    },
    {
      name: "Kisan Rath",
      description: "Your complete farming companion — detect crop disease, understand loan documents, find government schemes and scale your farm",
      color: "#43A047",
    },
    {
      name: "Shakti",
      description: "Women's safety and empowerment — know your rights, report abuse safely, find scholarships and health guidance privately",
      color: "#7C3AED",
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
            onClick={() => tool.view && setView(tool.view)}
          >
            <h2 className={styles.cardName}>{tool.name}</h2>
            <p className={styles.cardDesc}>{tool.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
