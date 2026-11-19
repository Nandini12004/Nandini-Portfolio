import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, LogOut, Mail, Plus, Save, Trash2, Upload, UserRound } from 'lucide-react'

function AdminDashboard() {
  const navigate = useNavigate()
  const [portfolio, setPortfolio] = useState(null)
  const [contacts, setContacts] = useState([])
  const [status, setStatus] = useState('')
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)

  const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const [portfolioResponse, contactResponse] = await Promise.all([
          fetch(`${apiUrl}/api/admin/portfolio`, { credentials: 'include' }),
          fetch(`${apiUrl}/api/admin/contact`, { credentials: 'include' }),
        ])

        if (portfolioResponse.status === 401 || contactResponse.status === 401) {
          navigate('/admin')
          return
        }

        setPortfolio(await portfolioResponse.json())
        setContacts(await contactResponse.json())
      } catch (error) {
        setStatus(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadAdminData()
  }, [apiUrl, navigate])

  const updateProfile = (event) => {
    const { name, value } = event.target
    setPortfolio((current) => ({
      ...current,
      profile: { ...current.profile, [name]: value },
    }))
  }

  const updateSocial = (event) => {
    const { name, value } = event.target
    setPortfolio((current) => ({
      ...current,
      socialLinks: { ...current.socialLinks, [name]: value },
    }))
  }

  const updateArrayItem = (section, index, field, value) => {
    setPortfolio((current) => ({
      ...current,
      [section]: current[section].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }))
  }

  const addArrayItem = (section, item) => {
    setPortfolio((current) => ({
      ...current,
      [section]: [...(current[section] || []), item],
    }))
  }

  const removeArrayItem = (section, index) => {
    setPortfolio((current) => ({
      ...current,
      [section]: current[section].filter((item, itemIndex) => itemIndex !== index),
    }))
  }

  const uploadFile = async (type, file) => {
    if (!file) return

    setStatus(type === 'resume' ? 'Uploading resume...' : 'Uploading profile photo...')
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${apiUrl}/api/admin/upload/${type}`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message)

      setPortfolio((current) => ({
        ...current,
        profile: {
          ...current.profile,
          [type === 'resume' ? 'resumeUrl' : 'profilePhotoUrl']: result.url,
        },
      }))
      setStatus('File uploaded.')
    } catch (error) {
      setStatus(error.message)
    }
  }

  const removeFile = async (type) => {
    setStatus(type === 'resume' ? 'Removing resume...' : 'Removing profile photo...')

    try {
      const response = await fetch(`${apiUrl}/api/admin/upload/${type}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message)

      setPortfolio((current) => ({
        ...current,
        profile: {
          ...current.profile,
          [type === 'resume' ? 'resumeUrl' : 'profilePhotoUrl']: '',
        },
      }))
      setStatus(type === 'resume' ? 'Resume removed.' : 'Profile photo removed.')
      setToast({
        type: 'success',
        message: type === 'resume' ? 'Resume removed.' : 'Profile photo removed.',
      })
      window.setTimeout(() => setToast(null), 3500)
    } catch (error) {
      setStatus(error.message)
      setToast({ type: 'error', message: error.message })
      window.setTimeout(() => setToast(null), 4500)
    }
  }

  const savePortfolio = async (event) => {
    event.preventDefault()
    setStatus('Saving...')
    setToast({ type: 'info', message: 'Saving changes...' })

    try {
      const response = await fetch(`${apiUrl}/api/admin/portfolio`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(portfolio),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message)
      setStatus('Changes saved.')
      setToast({ type: 'success', message: 'Changes saved successfully.' })
      window.setTimeout(() => setToast(null), 3500)
    } catch (error) {
      setStatus(error.message)
      setToast({ type: 'error', message: error.message })
      window.setTimeout(() => setToast(null), 4500)
    }
  }

  const logout = async () => {
    await fetch(`${apiUrl}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })
    navigate('/admin')
  }

  const deleteContact = async (contactId) => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/contact/${contactId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message)

      setContacts((current) => current.filter((contact) => contact._id !== contactId))
      setToast({ type: 'success', message: 'Message deleted.' })
      window.setTimeout(() => setToast(null), 3500)
    } catch (error) {
      setToast({ type: 'error', message: error.message })
      window.setTimeout(() => setToast(null), 4500)
    }
  }

  const clearInbox = async () => {
    if (!window.confirm('Delete all contact messages? This cannot be undone.')) return

    try {
      const response = await fetch(`${apiUrl}/api/admin/contact`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message)

      setContacts([])
      setToast({ type: 'success', message: 'Inbox cleared.' })
      window.setTimeout(() => setToast(null), 3500)
    } catch (error) {
      setToast({ type: 'error', message: error.message })
      window.setTimeout(() => setToast(null), 4500)
    }
  }

  if (loading) return <main className="admin-loading">Loading dashboard...</main>
  if (!portfolio) return <main className="admin-loading">Portfolio data unavailable.</main>

  return (
    <main className="admin-dashboard">
      {toast && (
        <div className={`admin-toast admin-toast--${toast.type}`} role="status" aria-live="polite">
          {toast.message}
        </div>
      )}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand"><LayoutDashboard size={20} /><span>Admin</span></div>
        <button type="button" onClick={() => document.getElementById('profile-editor')?.scrollIntoView()}><UserRound size={17} /> Profile</button>
        <button type="button" onClick={() => document.getElementById('contact-inbox')?.scrollIntoView()}><Mail size={17} /> Inbox</button>
        <button type="button" onClick={logout}><LogOut size={17} /> Logout</button>
      </aside>

      <div className="admin-content">
        <header className="admin-header">
          <div><p>PRIVATE DASHBOARD</p><h1>Portfolio Control</h1></div>
        </header>

        <form id="profile-editor" className="admin-panel" onSubmit={savePortfolio}>
          <div className="admin-panel__heading"><div><p>PROFILE</p><h2>Personal Information</h2></div><button className="button button--primary" type="submit"><Save size={16} /> Save changes</button></div>
          <div className="admin-form-grid">
            <label>Name<input name="name" value={portfolio.profile?.name || ''} onChange={updateProfile} /></label>
            <label>Title<input name="title" value={portfolio.profile?.title || ''} onChange={updateProfile} /></label>
            <label>Tagline<input name="tagline" value={portfolio.profile?.tagline || ''} onChange={updateProfile} /></label>
            <label>Location<input name="location" value={portfolio.profile?.location || ''} onChange={updateProfile} /></label>
            <label>Education<input name="education" value={portfolio.profile?.education || ''} onChange={updateProfile} /></label>
            <label>Professional focus<input name="focus" value={portfolio.profile?.focus || ''} onChange={updateProfile} /></label>
            <label className="admin-form-grid__wide">Bio<textarea name="bio" value={portfolio.profile?.bio || ''} onChange={updateProfile} rows="5" /></label>
            <label>GitHub<input name="github" value={portfolio.socialLinks?.github || ''} onChange={updateSocial} /></label>
            <label>LinkedIn<input name="linkedin" value={portfolio.socialLinks?.linkedin || ''} onChange={updateSocial} /></label>
            <label>Email<input name="email" type="email" value={portfolio.socialLinks?.email || ''} onChange={updateSocial} /></label>
            <label>
              Portfolio visibility
              <select value={portfolio.status || 'draft'} onChange={(event) => setPortfolio((current) => ({ ...current, status: event.target.value }))}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
            <label className="admin-upload">
              Profile photo
              <span><Upload size={16} /> JPG, PNG or WebP — max 5 MB</span>
              {portfolio.profile?.profilePhotoUrl && (
                <img
                  className="admin-photo-preview"
                  src={portfolio.profile.profilePhotoUrl.startsWith('/api/')
                    ? `${apiUrl}${portfolio.profile.profilePhotoUrl}`
                    : portfolio.profile.profilePhotoUrl}
                  alt="Profile preview"
                />
              )}
              <input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={(event) => uploadFile('profile-photo', event.target.files?.[0])} />
              <div className="admin-file-actions">
                <label className="admin-file-action">
                  Replace
                  <input className="admin-file-action__input" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={(event) => uploadFile('profile-photo', event.target.files?.[0])} />
                </label>
                {portfolio.profile?.profilePhotoUrl && (
                  <button type="button" className="admin-file-action admin-file-action--remove" onClick={() => removeFile('profile-photo')}>
                    <Trash2 size={14} /> Remove
                  </button>
                )}
              </div>
            </label>
            <label className="admin-upload">
              Resume PDF
              <span><Upload size={16} /> PDF — max 10 MB</span>
              <input type="file" accept=".pdf,application/pdf" onChange={(event) => uploadFile('resume', event.target.files?.[0])} />
              {portfolio.profile?.resumeUrl && (
                <a className="admin-current-file" href={portfolio.profile.resumeUrl.startsWith('/api/')
                  ? `${apiUrl}${portfolio.profile.resumeUrl}?download=1`
                  : portfolio.profile.resumeUrl} target="_blank" rel="noopener noreferrer">
                  Current resume
                </a>
              )}
              <div className="admin-file-actions">
                <label className="admin-file-action">
                  Replace
                  <input className="admin-file-action__input" type="file" accept=".pdf,application/pdf" onChange={(event) => uploadFile('resume', event.target.files?.[0])} />
                </label>
                {portfolio.profile?.resumeUrl && (
                  <button type="button" className="admin-file-action admin-file-action--remove" onClick={() => removeFile('resume')}>
                    <Trash2 size={14} /> Remove
                  </button>
                )}
              </div>
            </label>
          </div>
          {status && <p className="admin-status">{status}</p>}
        </form>

        <section className="admin-panel">
          <div className="admin-panel__heading">
            <div><p>CONTENT</p><h2>Skills</h2></div>
            <button className="button button--secondary" type="button" onClick={() => addArrayItem('skills', { name: '', category: 'core' })}><Plus size={16} /> Add skill</button>
          </div>
          <div className="admin-editor-list">
            {(portfolio.skills || []).map((skill, index) => (
              <div className="admin-editor-row" key={skill._id || index}>
                <input aria-label="Skill name" value={skill.name || ''} onChange={(event) => updateArrayItem('skills', index, 'name', event.target.value)} />
                <select aria-label="Skill category" value={skill.category || 'core'} onChange={(event) => updateArrayItem('skills', index, 'category', event.target.value)}>
                  <option value="core">Core</option>
                  <option value="advanced">Advanced</option>
                  <option value="learning">Learning</option>
                </select>
                <button type="button" aria-label="Remove skill" onClick={() => removeArrayItem('skills', index)}><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel__heading">
            <div><p>CONTENT</p><h2>Projects</h2></div>
            <button className="button button--secondary" type="button" onClick={() => addArrayItem('projects', { title: '', description: '', technologies: [], projectUrl: '', githubUrl: '', status: 'published' })}><Plus size={16} /> Add project</button>
          </div>
          <div className="admin-editor-list">
            {(portfolio.projects || []).map((project, index) => (
              <div className="admin-project-editor" key={project._id || index}>
                <input aria-label="Project title" placeholder="Project title" value={project.title || ''} onChange={(event) => updateArrayItem('projects', index, 'title', event.target.value)} />
                <textarea aria-label="Project description" placeholder="Description" value={project.description || ''} onChange={(event) => updateArrayItem('projects', index, 'description', event.target.value)} />
                <input aria-label="Project technologies" placeholder="Technology names separated by commas" value={(project.technologies || []).join(', ')} onChange={(event) => updateArrayItem('projects', index, 'technologies', event.target.value.split(',').map((value) => value.trim()).filter(Boolean))} />
                <input aria-label="Project live URL" placeholder="Live demo URL" value={project.projectUrl || ''} onChange={(event) => updateArrayItem('projects', index, 'projectUrl', event.target.value)} />
                <input aria-label="Project GitHub URL" placeholder="GitHub URL" value={project.githubUrl || ''} onChange={(event) => updateArrayItem('projects', index, 'githubUrl', event.target.value)} />
                <select aria-label="Project status" value={project.status || 'draft'} onChange={(event) => updateArrayItem('projects', index, 'status', event.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
                <button type="button" aria-label="Remove project" onClick={() => removeArrayItem('projects', index)}><Trash2 size={16} /> Remove</button>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel__heading">
            <div><p>CONTENT</p><h2>Experience and Certificates</h2></div>
          </div>
          <div className="admin-editor-list">
            {(portfolio.experience || []).map((item, index) => (
              <div className="admin-project-editor" key={item._id || index}>
                <input aria-label="Company" placeholder="Company" value={item.company || ''} onChange={(event) => updateArrayItem('experience', index, 'company', event.target.value)} />
                <input aria-label="Role" placeholder="Role" value={item.role || ''} onChange={(event) => updateArrayItem('experience', index, 'role', event.target.value)} />
                <input aria-label="Experience start date" placeholder="Start date" value={item.startDate || ''} onChange={(event) => updateArrayItem('experience', index, 'startDate', event.target.value)} />
                <input aria-label="Experience end date" placeholder="End date" value={item.endDate || ''} onChange={(event) => updateArrayItem('experience', index, 'endDate', event.target.value)} />
                <textarea aria-label="Experience description" placeholder="Responsibilities" value={item.description || ''} onChange={(event) => updateArrayItem('experience', index, 'description', event.target.value)} />
                <button type="button" aria-label="Remove experience" onClick={() => removeArrayItem('experience', index)}><Trash2 size={16} /> Remove experience</button>
              </div>
            ))}
            <button className="button button--secondary" type="button" onClick={() => addArrayItem('experience', { company: '', role: '', startDate: '', endDate: '', description: '' })}><Plus size={16} /> Add experience</button>
            {(portfolio.certificates || []).map((certificate, index) => (
              <div className="admin-editor-row" key={certificate._id || index}>
                <input aria-label="Certificate name" placeholder="Certificate name" value={certificate.name || ''} onChange={(event) => updateArrayItem('certificates', index, 'name', event.target.value)} />
                <input aria-label="Certificate issuer" placeholder="Issuer" value={certificate.issuer || ''} onChange={(event) => updateArrayItem('certificates', index, 'issuer', event.target.value)} />
                <input aria-label="Certificate URL" placeholder="Certificate URL" value={certificate.certificateUrl || ''} onChange={(event) => updateArrayItem('certificates', index, 'certificateUrl', event.target.value)} />
                <button type="button" aria-label="Remove certificate" onClick={() => removeArrayItem('certificates', index)}><Trash2 size={16} /></button>
              </div>
            ))}
            <button className="button button--secondary" type="button" onClick={() => addArrayItem('certificates', { name: '', issuer: '', certificateUrl: '' })}><Plus size={16} /> Add certificate</button>
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel__heading">
            <div><p>CONTENT</p><h2>Education and Achievements</h2></div>
          </div>
          <div className="admin-editor-list">
            {(portfolio.education || []).map((item, index) => (
              <div className="admin-project-editor" key={item._id || index}>
                <input aria-label="Degree" placeholder="Degree" value={item.degree || ''} onChange={(event) => updateArrayItem('education', index, 'degree', event.target.value)} />
                <input aria-label="Institution" placeholder="Institution" value={item.institution || ''} onChange={(event) => updateArrayItem('education', index, 'institution', event.target.value)} />
                <input aria-label="Start year" placeholder="Start year" value={item.startYear || ''} onChange={(event) => updateArrayItem('education', index, 'startYear', event.target.value)} />
                <input aria-label="End year" placeholder="End year" value={item.endYear || ''} onChange={(event) => updateArrayItem('education', index, 'endYear', event.target.value)} />
                <button type="button" aria-label="Remove education" onClick={() => removeArrayItem('education', index)}><Trash2 size={16} /> Remove education</button>
              </div>
            ))}
            <button className="button button--secondary" type="button" onClick={() => addArrayItem('education', { degree: '', institution: '', startYear: '', endYear: '' })}><Plus size={16} /> Add education</button>
            {(portfolio.achievements || []).map((item, index) => (
              <div className="admin-project-editor" key={item._id || index}>
                <input aria-label="Achievement title" placeholder="Achievement title" value={item.title || ''} onChange={(event) => updateArrayItem('achievements', index, 'title', event.target.value)} />
                <input aria-label="Achievement description" placeholder="Description" value={item.description || ''} onChange={(event) => updateArrayItem('achievements', index, 'description', event.target.value)} />
                <button type="button" aria-label="Remove achievement" onClick={() => removeArrayItem('achievements', index)}><Trash2 size={16} /> Remove achievement</button>
              </div>
            ))}
            <button className="button button--secondary" type="button" onClick={() => addArrayItem('achievements', { title: '', description: '' })}><Plus size={16} /> Add achievement</button>
          </div>
        </section>

        <section id="contact-inbox" className="admin-panel">
          <div className="admin-panel__heading">
            <div><p>INBOX</p><h2>Contact Messages</h2></div>
            {contacts.length > 0 && (
              <button className="button admin-inbox-clear" type="button" onClick={clearInbox}>
                <Trash2 size={16} /> Clear Inbox
              </button>
            )}
          </div>
          {contacts.length === 0 ? (
            <p className="admin-empty">No contact messages received yet.</p>
          ) : (
            <div className="admin-inbox">
              {contacts.map((contact) => (
                <article key={contact._id}>
                  <div><strong>{contact.name}</strong><span>{contact.email}</span></div>
                  <h3>{contact.subject}</h3>
                  <p>{contact.message}</p>
                  <small>{new Date(contact.createdAt).toLocaleString()}</small>
                  <button
                    className="admin-message-delete"
                    type="button"
                    aria-label={`Delete message from ${contact.name}`}
                    onClick={() => deleteContact(contact._id)}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default AdminDashboard
