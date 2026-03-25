import styles from './Navbar.module.css'

export default function Navbar({ setView }) {
  const handleClick = (e, view) => {
    e.preventDefault();
    setView(view);
  };

  return (
    <nav className={styles.navWrapper}>
      <div className={styles.pill}>
        <ul className={styles.links}>
          <li><a href="#home" onClick={(e) => handleClick(e, 'home')}>HOME</a></li>
          <li><a href="#tools" id="nav-tools" onClick={(e) => handleClick(e, 'tools')}>TOOLS</a></li>
          <li><a href="#history" onClick={(e) => handleClick(e, 'history')}>HISTORY</a></li>
          <li><a href="#about" onClick={(e) => handleClick(e, 'about')}>ABOUT US</a></li>
        </ul>
      </div>
    </nav>
  )
}
