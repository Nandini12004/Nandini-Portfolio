import heroImage from '../assets/hero.png'
import { ArrowDown, Download, Mail } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" fill="currentColor">
      <path d="M12 .7a11.3 11.3 0 0 0-3.57 22c.57.1.78-.25.78-.55v-2.12c-3.18.69-3.85-1.35-3.85-1.35-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.24 3.33.95.1-.74.4-1.24.72-1.53-2.54-.29-5.21-1.27-5.21-5.65 0-1.25.44-2.27 1.17-3.07-.12-.29-.51-1.45.11-3.03 0 0 .95-.31 3.12 1.17A10.8 10.8 0 0 1 12 5.72c.96 0 1.92.13 2.82.38 2.17-1.48 3.12-1.17 3.12-1.17.62 1.58.23 2.74.11 3.03.73.8 1.17 1.82 1.17 3.07 0 4.39-2.67 5.36-5.22 5.64.41.36.78 1.06.78 2.14v3.17c0 .31.21.66.79.55A11.3 11.3 0 0 0 12 .7Z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">
      <path d="M5.3 7.3H1.6V22h3.7V7.3ZM3.45 1.2A2.15 2.15 0 1 0 3.45 5.5a2.15 2.15 0 0 0 0-4.3ZM22.4 13.55c0-4.42-2.36-6.47-5.51-6.47a4.76 4.76 0 0 0-4.32 2.37V7.3H8.86V22h3.71v-7.27c0-1.92.36-3.78 2.75-3.78 2.35 0 2.38 2.2 2.38 3.9V22h3.71l-.01-8.45Z" />
    </svg>
  )
}

function Hero({ portfolio }) {
  const profile = portfolio?.profile
  const socialLinks = portfolio?.socialLinks
  const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'
  const resumeUrl = profile?.resumeUrl?.startsWith('/api/')
    ? `${apiUrl}${profile.resumeUrl}?download=1`
    : profile?.resumeUrl || "/Nandini's%20Resume.pdf"
  const profilePhotoUrl = profile?.profilePhotoUrl?.startsWith('/api/')
    ? `${apiUrl}${profile.profilePhotoUrl}`
    : profile?.profilePhotoUrl
  const reduceMotion = useReducedMotion()

  return (
    <main id="home" className="hero">
      <div className="hero__container">
        <motion.div
          className="hero__content"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.p
            className="hero__eyebrow"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.18, duration: 0.5 }}
          >
            <span></span>
            Web Developer
          </motion.p>

          <h1>Hi, I'm <span>{profile?.name || 'Nandini Srivastava'}</span></h1>
          <p className="hero__title">
            {profile?.title || 'Web Developer'} <span>|</span> Computer Science Engineering Student
          </p>

          <motion.p
            className="hero__description"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.62 }}
          >
            {profile?.tagline || 'Turning Ideas Into Interactive Digital Experiences.'}
          </motion.p>

          <div className="hero__actions">
            <a className="button button--primary" href="#projects">
              Explore My Work <ArrowDown size={17} />
            </a>
            <a className="button button--secondary" href="#contact">
              <Mail size={17} /> Contact Me
            </a>
            {resumeUrl && (
              <a className="button button--ghost" href={resumeUrl} download>
                <Download size={17} /> Resume
              </a>
            )}
          </div>

          <p className="hero__location">
            <span className="hero__location-dot"></span> Based in India
          </p>
        </motion.div>

        <motion.div
          className="hero__visual"
          aria-label="Developer profile"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.72 }}
        >
          <div className="hero__image-frame">
            <div className="hero__orb hero__orb--one"></div>
            <div className="hero__orb hero__orb--two"></div>
            <img src={profilePhotoUrl || heroImage} alt={profile?.name || 'Nandini Srivastava'} className="hero__image" />
            <div className="hero__code-card" aria-hidden="true">
              <span>developer.js</span>
              <code>build(<b>ideas</b>);</code>
            </div>
          </div>
          <div className="hero__socials">
            {socialLinks?.github && (
              <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <GitHubIcon />
              </a>
            )}
            {socialLinks?.linkedin && (
              <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <LinkedInIcon />
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  )
}

export default Hero
