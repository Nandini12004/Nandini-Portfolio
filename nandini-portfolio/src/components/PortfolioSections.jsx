import { useState } from 'react'
import { fetchWithRetry } from '../apiFetch'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Award,
  BriefcaseBusiness,
  ExternalLink,
  GraduationCap,
  Mail,
  MapPin,
  Send,
} from 'lucide-react'

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">
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

function contactHref(item) {
  if (item.url) return item.url
  if (item.type === 'email') return `mailto:${item.value}`
  if (item.type === 'phone') return `tel:${item.value.replace(/[^\d+]/g, '')}`
  return ''
}

const fallback = {
  profile: {
    name: 'Nandini Srivastava',
    title: 'Web Developer',
    tagline: 'Turning Ideas Into Interactive Digital Experiences.',
    bio: 'Motivated Computer Science Engineering student with a strong interest in Python and Data Analytics, complemented by hands-on experience in Frontend Development through an internship. Familiar with React.js, JavaScript, and problem-solving. Eager to apply technical and analytical skills while continuously learning and contributing to impactful projects.',
    location: 'India',
    education: 'B.Tech Computer Science Engineering',
    focus: 'Development & Analytics',
  },
  socialLinks: {
    github: 'https://github.com/Nandini12004',
    linkedin: 'https://www.linkedin.com/in/nandinisrivastava012/',
    email: 'nandini.1210sr@gmail.com',
  },
  skills: [
    { name: 'Python', category: 'Languages' },
    { name: 'JavaScript', category: 'Languages' },
    { name: 'HTML', category: 'Frontend' },
    { name: 'CSS', category: 'Frontend' },
    { name: 'React.js', category: 'Frontend' },
    { name: 'Node.js', category: 'Backend' },
    { name: 'Express.js', category: 'Backend' },
    { name: 'MongoDB', category: 'Database' },
    { name: 'MySQL', category: 'Database' },
    { name: 'Git', category: 'Tools' },
    { name: 'GitHub', category: 'Tools' },
  ],
  projects: [
    {
      title: 'Suraksha',
      description: 'Smart disaster preparedness platform developed for the Smart India Hackathon.',
      technologies: ['Web Development', 'AI Support', 'Responsive UI'],
      status: 'published',
    },
    {
      title: 'Attendance Buddy',
      description: 'A full-stack student attendance and syllabus tracking application with academic progress analytics.',
      technologies: ['JavaScript', 'Frontend', 'Attendance Analytics'],
      status: 'published',
    },
  ],
  experience: [
    {
      company: 'DENSO India',
      role: 'Web Developer Intern',
      startDate: 'June 2026',
      endDate: 'July 2026',
      description: 'Contributed to the development and enhancement of DENSO India’s official website. Built responsive web pages and UI components using HTML, CSS, and JavaScript, and assisted with UI fixes and feature implementation.',
    },
  ],
  certificates: [
    { name: 'Generative AI', issuer: 'IBM SkillBuild', certificateUrl: '' },
    { name: 'Basics of Python', issuer: 'Infosys Springboard', certificateUrl: '' },
  ],
  achievements: [
    { title: '2nd Position – Smart India Hackathon 2025' },
    { title: '13th Position – HackLoop Hackathon 2025' },
  ],
  education: [
    {
      degree: 'B.Tech in Computer Science Engineering',
      institution: 'Dr. A.P.J. Abdul Kalam Technical University, Lucknow',
      startYear: '2023',
      endYear: '2027',
    },
  ],
}

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
}

function SectionHeading({ eyebrow, title }) {
  return (
    <motion.div
      className="section-heading"
      variants={reveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
    >
      <span>{eyebrow}</span>
      <h2>{title}</h2>
    </motion.div>
  )
}

function PortfolioSections({ portfolio }) {
  const reduceMotion = useReducedMotion()
  const data = portfolio || fallback
  const profile = data.profile || {}
  const socialLinks = data.socialLinks || fallback.socialLinks
  const contactItems = data.contactItems?.length
    ? data.contactItems.filter((item) => item.visible !== false && item.value)
    : [
        socialLinks.email && { type: 'email', label: 'Email', value: socialLinks.email, url: `mailto:${socialLinks.email}` },
        profile.location && { type: 'location', label: 'Location', value: profile.location },
        socialLinks.github && { type: 'link', label: 'GitHub', value: socialLinks.github, url: socialLinks.github },
        socialLinks.linkedin && { type: 'link', label: 'LinkedIn', value: socialLinks.linkedin, url: socialLinks.linkedin },
      ].filter(Boolean)
  const skills = data.skills?.length ? data.skills : fallback.skills
  const projects = data.projects?.filter((project) => project.status !== 'draft') || fallback.projects
  const experience = data.experience?.length ? data.experience : fallback.experience
  const certificates = data.certificates?.length ? data.certificates : fallback.certificates
  const achievements = data.achievements?.length ? data.achievements : fallback.achievements
  const education = data.education?.length ? data.education : fallback.education
  const skillCategories = ['Languages', 'Frontend', 'Backend', 'Database', 'Tools']
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [formStatus, setFormStatus] = useState({ type: '', message: '' })
  const [submitting, setSubmitting] = useState(false)

  const updateForm = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const submitContact = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setFormStatus({ type: '', message: '' })

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'
      const response = await fetchWithRetry(`${apiUrl}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Unable to send your message.')
      }

      setForm({ name: '', email: '', subject: '', message: '' })
      setFormStatus({ type: 'success', message: result.message })
    } catch (error) {
      setFormStatus({ type: 'error', message: error.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <section id="about" className="portfolio-section about-section">
        <div className="portfolio-section__container">
          <SectionHeading eyebrow="01 / ABOUT" title="A Little About Me" />
          <motion.div
            className="about-grid"
            variants={reveal}
            initial={reduceMotion ? false : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7 }}
          >
            <div className="about-summary">
              <p>
                {(profile.bio || fallback.profile.bio).split(/(Python|Data Analytics|Frontend Development)/g).map((text, index) =>
                  ['Python', 'Data Analytics', 'Frontend Development'].includes(text)
                    ? <mark key={`${text}-${index}`}>{text}</mark>
                    : text
                )}
              </p>
            </div>
            <div className="about-meta">
              <div><GraduationCap size={20} /><span><small>Education</small>{profile.education || fallback.profile.education}</span></div>
              <div><MapPin size={20} /><span><small>Location</small>{profile.location || fallback.profile.location}</span></div>
              <div><BriefcaseBusiness size={20} /><span><small>Focus</small>{profile.focus || fallback.profile.focus}</span></div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="skills" className="portfolio-section skills-section">
        <div className="portfolio-section__container">
          <SectionHeading eyebrow="02 / SKILLS" title="My Technical Arsenal" />
          <div className="skill-categories">
            {skillCategories.map((category, categoryIndex) => {
              const categorySkills = skills.filter((skill) => {
                if (category === 'Languages') return ['Python', 'C', 'C++', 'JavaScript'].includes(skill.name)
                if (category === 'Frontend') return ['HTML', 'CSS', 'JavaScript', 'React.js'].includes(skill.name)
                if (category === 'Backend') return ['Node.js', 'Express.js'].includes(skill.name)
                if (category === 'Database') return ['MongoDB', 'MySQL', 'Supabase'].includes(skill.name)
                if (category === 'Tools') return ['Git', 'GitHub', 'VS Code'].includes(skill.name)
                return false
              })
              if (!categorySkills.length) return null

              return (
                <motion.article
                  className="skill-category"
                  key={category}
                  initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ delay: categoryIndex * 0.08, duration: 0.55 }}
                >
                  <h3>{category}</h3>
                  <div className="skill-list">
                    {categorySkills.map((skill) => (
                      <span className="skill-chip" key={skill.name}>{skill.name}</span>
                    ))}
                  </div>
                </motion.article>
              )
            })}
          </div>
        </div>
      </section>

      <section id="experience" className="portfolio-section experience-section">
        <div className="portfolio-section__container">
          <SectionHeading eyebrow="03 / EXPERIENCE" title="My Professional Journey" />
          <div className="timeline">
            {experience.map((item, index) => (
              <motion.article
                className="timeline-item"
                key={`${item.company}-${index}`}
                initial={reduceMotion ? false : { opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.58 }}
              >
                <span className="timeline-dot"></span>
                <div className="timeline-card">
                  <div className="timeline-card__top">
                    <div><small>{item.startDate}{item.endDate ? ` — ${item.endDate}` : ''}</small><h3>{item.role}</h3></div>
                    <BriefcaseBusiness size={22} />
                  </div>
                  <p>{item.company}</p>
                  {item.description && <span>{item.description}</span>}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="projects" className="portfolio-section projects-section">
        <div className="portfolio-section__container">
          <SectionHeading eyebrow="04 / PROJECTS" title="Things I've Built" />
          <motion.div
            className="projects-grid"
            initial={reduceMotion ? false : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            {projects.map((project, index) => (
              <motion.article
                className="project-card"
                key={`${project.title}-${index}`}
                variants={reveal}
                transition={{ delay: index * 0.1, duration: 0.58 }}
              >
                {project.imageUrl && (
                  <img
                    className="project-card__image"
                    src={project.imageUrl.startsWith('/api/') ? `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'}${project.imageUrl}` : project.imageUrl}
                    alt=""
                  />
                )}
                <div className="project-card__top">
                  <span>0{index + 1}</span>
                  <div>
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" aria-label={`${project.title} GitHub`}>
                        <GitHubIcon />
                      </a>
                    )}
                    {project.projectUrl && (
                      <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" aria-label={`${project.title} live demo`}>
                        <ExternalLink size={18} />
                      </a>
                    )}
                  </div>
                </div>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                {project.technologies?.length > 0 && (
                  <div className="project-tags">
                    {project.technologies.map((technology) => <span key={technology}>{technology}</span>)}
                  </div>
                )}
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="education" className="portfolio-section education-section">
        <div className="portfolio-section__container">
          <SectionHeading eyebrow="05 / EDUCATION" title="Academic Journey" />
          <motion.article
            className="education-card"
            initial={reduceMotion ? false : { opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.35 }}
          >
            <GraduationCap size={28} />
            {education.map((item, index) => (
              <div key={item._id || index}>
                <small>{item.startYear}{item.endYear ? ` — ${item.endYear}` : ''}</small>
                <h3>{item.degree}</h3>
                <p>{item.institution}</p>
              </div>
            ))}
          </motion.article>
        </div>
      </section>

      <section id="achievements" className="portfolio-section achievements-section">
        <div className="portfolio-section__container">
          <SectionHeading eyebrow="06 / ACHIEVEMENTS" title="Recognition" />
          <div className="achievement-list">
              {achievements.map((item, index) => (
                <motion.article
                  className="achievement-card"
                  key={item.title || index}
                  initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Award size={20} /><div><h3>{item.title}</h3>{item.description && <p>{item.description}</p>}</div>
                </motion.article>
              ))}
              {certificates.map((certificate) => (
                <motion.article className="achievement-card" key={certificate.name} initial={reduceMotion ? false : { opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                  <Award size={20} /><div><small>Certificate</small><h3>{certificate.name}</h3><p>{certificate.issuer}</p></div>
                </motion.article>
              ))}
          </div>
        </div>
      </section>

      <section id="contact" className="portfolio-section contact-section">
        <div className="portfolio-section__container">
          <SectionHeading eyebrow="07 / CONTACT" title="Let's Build Something Great Together." />
          <div className="contact-grid">
            <motion.div className="contact-intro" initial={reduceMotion ? false : { opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.25 }}>
              <p>I am open to opportunities in software development and data analytics.</p>
              {contactItems.filter((item) => !['github', 'linkedin'].includes(item.label.toLowerCase())).map((item) => {
                const href = contactHref(item)
                if (!href) return <p className="contact-detail" key={`${item.label}-${item.value}`}><MapPin size={18} /> {item.value}</p>
                if (item.label.toLowerCase() === 'github') {
                  return <a href={href} target="_blank" rel="noopener noreferrer" key={`${item.label}-${item.value}`}><GitHubIcon /> {item.value}</a>
                }
                if (item.label.toLowerCase() === 'linkedin') {
                  return <a href={href} target="_blank" rel="noopener noreferrer" key={`${item.label}-${item.value}`}><LinkedInIcon /> {item.value}</a>
                }
                return <a href={href} target={item.type === 'link' ? '_blank' : undefined} rel={item.type === 'link' ? 'noopener noreferrer' : undefined} key={`${item.label}-${item.value}`}><Mail size={18} /> {item.value}</a>
              })}
              <div className="contact-socials">
                {contactItems.filter((item) => ['github', 'linkedin'].includes(item.label.toLowerCase())).map((item) => (
                  <a href={contactHref(item)} target="_blank" rel="noopener noreferrer" aria-label={item.label} key={`icon-${item.label}`}>
                    {item.label.toLowerCase() === 'github' ? <GitHubIcon /> : <LinkedInIcon />}
                  </a>
                ))}
              </div>
            </motion.div>
            <motion.form className="contact-form" onSubmit={submitContact} initial={reduceMotion ? false : { opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.25 }}>
              <div className="form-row">
                <label>Name<input name="name" value={form.name} onChange={updateForm} required minLength="2" autoComplete="name" /></label>
                <label>Email<input name="email" type="email" value={form.email} onChange={updateForm} required autoComplete="email" /></label>
              </div>
              <label>Subject<input name="subject" value={form.subject} onChange={updateForm} required minLength="3" /></label>
              <label>Message<textarea name="message" value={form.message} onChange={updateForm} required minLength="10" rows="5" /></label>
              {formStatus.message && <p className={`form-status form-status--${formStatus.type}`}>{formStatus.message}</p>}
              <button className="button button--primary" type="submit" disabled={submitting}>
                {submitting ? 'Sending...' : 'Send Message'} <Send size={16} />
              </button>
            </motion.form>
          </div>
        </div>
      </section>
    </>
  )
}

export default PortfolioSections
