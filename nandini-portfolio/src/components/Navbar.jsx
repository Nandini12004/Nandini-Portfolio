import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

const navigationItems = [
  { label: 'Home', id: 'home' },
  { label: 'About', id: 'about' },
  { label: 'Skills', id: 'skills' },
  { label: 'Experience', id: 'experience' },
  { label: 'Projects', id: 'projects' },
  { label: 'Education', id: 'education' },
  { label: 'Achievements', id: 'achievements' },
  { label: 'Contact', id: 'contact' },
]

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  const closeMenu = () => setIsMenuOpen(false)

  useEffect(() => {
    const sections = navigationItems
      .map((item) => document.getElementById(item.id))
      .filter(Boolean)

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (visibleEntry) {
          setActiveSection(visibleEntry.target.id)
        }
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0.01, 0.25, 0.5] },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return (
    <header className="navbar">
      <div className="navbar__container">
        <a className="navbar__brand" href="#home" onClick={closeMenu} aria-label="Go to home">
          <span className="navbar__brand-mark">NS</span>
          <span>Nandini Srivastava</span>
        </a>

        <button
          className="navbar__menu-button"
          type="button"
          aria-label={isMenuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <nav className={`navbar__links ${isMenuOpen ? 'navbar__links--open' : ''}`}>
          {navigationItems.map((item) => (
            <a
              className={activeSection === item.id ? 'navbar__link--active' : ''}
              href={`#${item.id}`}
              onClick={closeMenu}
              key={item.id}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
