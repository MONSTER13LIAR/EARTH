import styles from './AboutUs.module.css'

export default function AboutUs() {
  const problemCategories = [
    {
      tool: "Swasth Raho",
      problems: [
        "Cannot read medicine labels due to illiteracy",
        "Wrong medication dosage causing fatal errors",
        "Cannot understand what the doctor said",
        "No access to basic medical diagnosis"
      ]
    },
    {
      tool: "Pustak Dost",
      problems: [
        "Cannot understand English textbooks",
        "No career guidance for rural youth",
        "Unaware of government skill and job schemes"
      ]
    },
    {
      tool: "Kisan Rath",
      problems: [
        "Crop disease with no expert help available",
        "Wrong fertilizer and pesticide dosage",
        "Trapped in informal loans at 60% interest",
        "Unaware of government farming schemes"
      ]
    },
    {
      tool: "Shakti",
      problems: [
        "Domestic abuse with no safe way to get help",
        "Rural women unaware of their legal rights",
        "No silent emergency SOS in danger",
        "Unaware of women's scholarships and schemes"
      ]
    }
  ]

  const tools = [
    { name: "Swasth Raho", desc: "Complete rural health companion — medicine reader, symptom checker, doctor visit explainer, health profile" },
    { name: "Pustak Dost", desc: "Education and career guide — textbook simplifier, career roadmap, job and skill scheme finder" },
    { name: "Kisan Rath", desc: "Complete farming companion — crop disease detector, loan explainer, government scheme matcher, farm scaling guide" },
    { name: "Shakti", desc: "Women's safety and empowerment — silent SOS, abuse reporting, legal rights guide, health and scholarship finder" },
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
          EARTH is a voice-first, Hindi-first digital toolkit built for rural India. We believe the biggest barrier between rural communities and a better life is not resources — it is access to information they can understand. EARTH breaks that barrier across health, education, farming, and women's safety — in their language, on their phone, for free.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>The Problem We Solve</h2>
        <div className={styles.problemList}>
          {problemCategories.map((cat, i) => (
            <div key={i} className={styles.problemCard}>
              <h3 className={styles.problemToolName}>{cat.tool}</h3>
              <div className={styles.divider} />
              <ul className={styles.problemItems}>
                {cat.problems.map((prob, j) => (
                  <li key={j} className={styles.problemItem}>— {prob}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>What We Built</h2>
        <div className={styles.toolsRow}>
          {tools.map((t, i) => (
            <div key={i} className={styles.toolCard}>
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
