import { NavLink } from 'react-router-dom'
import styles from './Navbar.module.css'

export default function Navbar() {
  return (
    <header className={styles.navbar}>
      {/* Logo */}
      <div className={styles.logo}>
        <NavLink to="/" className={styles.brand}>
          PDF<span>Forge</span>
        </NavLink>
      </div>

      {/* Navigation Links */}
      <nav className={styles.navLinks}>
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? styles.active : styles.link
          }
        >
          Home
        </NavLink>

        <NavLink
          to="/editor"
          className={({ isActive }) =>
            isActive ? styles.active : styles.link
          }
        >
          Editor
        </NavLink>

        <NavLink
          to="/convert"
          className={({ isActive }) =>
            isActive ? styles.active : styles.link
          }
        >
          Convert
        </NavLink>

        <NavLink
          to="/about"
          className={({ isActive }) =>
            isActive ? styles.active : styles.link
          }
        >
          About
        </NavLink>
      </nav>

      {/* CTA */}
      <div className={styles.actions}>
        <NavLink to="/editor" className={styles.ctaBtn}>
          Try Editor
        </NavLink>
      </div>
    </header>
  )
}
