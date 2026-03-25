import styles from './AboutUs.module.css'

export default function AboutUs() {
  const problems = [
    { text: "56% of rural elderly are illiterate — cannot read medicine labels", colorClass: styles.red },
    { text: "42% of rural students cannot understand English textbooks", colorClass: styles.blue },
    { text: "60% of farmers face crop diseases with no expert guidance", colorClass: styles.green },
    { text: "50%+ interest charged by informal moneylenders to rural farmers", colorClass: styles.amber },
  ]

  const tools = [
    { name: "Dawa Sunaao", desc: "Medicine label reader", colorClass: styles.red },
    { name: "Pustak Dost", desc: "Textbook simplifier", colorClass: styles.blue },
    { name: "Kisaan Marg", desc: "Crop doctor and loan advisor", colorClass: styles.green },
    { name: "Hunar Upyog", desc: "Job and skill finder", colorClass: styles.amber },
  ]

  const sdgs = [
    "SDG 1 — No Poverty",
    "SDG 2 — Zero Hunger",
    "SDG 3 — Good Health",
    "SDG 4 — Quality Education",
    "SDG 10 — Reduced Inequalities",
  ]

  return (
    <div className={styles.pageContainer}>
      <section className={styles.section}>
        <h1 className={styles.heroHeading}>About EARTH</h1>
        <p className={styles.heroSubtitle}>Empowering rural India through accessible technology</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Our Mission</h2>
        <p className={styles.missionText}>
          EARTH is a voice-first, Hindi-first rural companion app built for the 600 million people
          of rural India. We believe technology should work for everyone — not just those who can
          read English or afford expensive tools.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>The Problem</h2>
        <div className={styles.problemGrid}>
          {problems.map((p, i) => (
            <div key={i} className={`${styles.statCard} ${p.colorClass}`}>
              {p.text}
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>What We Built</h2>
        <div className={styles.toolsRow}>
          {tools.map((t, i) => (
            <div key={i} className={`${styles.toolCard} ${t.colorClass}`}>
              <div className={styles.toolName}>{t.name}</div>
              <div className={styles.toolDesc}>{t.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>UN Goals We Address</h2>
        <div className={styles.sdgContainer}>
          {sdgs.map((s, i) => (
            <div key={i} className={styles.sdgBadge}>{s}</div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Built By</h2>
        <div className={styles.teamRow}>
          <div className={styles.teamCard}>
            <div className={styles.teamName}>Abhijay(MONSTER LIAR)</div>
            <div className={styles.teamRole}>Frontend Developer</div>
          </div>
          <div className={styles.teamCard}>
            <div className={styles.teamName}>Dishank</div>
            <div className={styles.teamRole}>Backend Developer</div>
          </div>
        </div>
        <p className={styles.hackathonText}>Built for The 2030 AI Challenge 2026</p>
      </section>
    </div>
  )
}
