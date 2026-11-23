import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, LogOut, Mail, Plus, Save, Trash2, Upload, UserRound } from 'lucide-react'
import { fetchWithRetry } from '../apiFetch'

const legacyContactItems = (data) => [
  data.socialLinks?.email && { type: 'email', label: 'Email', value: data.socialLinks.email, url: `mailto:${data.socialLinks.email}`, visible: true },
  data.profile?.location && { type: 'location', label: 'Location', value: data.profile.location, url: '', visible: true },
  data.socialLinks?.github && { type: 'link', label: 'GitHub', value: data.socialLinks.github, url: data.socialLinks.github, visible: true },
  data.socialLinks?.linkedin && { type: 'link', label: 'LinkedIn', value: data.socialLinks.linkedin, url: data.socialLinks.linkedin, visible: true },
].filter(Boolean)
function AdminDashboard() {
  const navigate = useNavigate()
  const [portfolio, setPortfolio] = useState(null)
  const [newSkillCategory, setNewSkillCategory] = useState('')
  const [categoryRenameDrafts, setCategoryRenameDrafts] = useState({})
  const [categorySkillDrafts, setCategorySkillDrafts] = useState({})
  const [editingSkills, setEditingSkills] = useState({})
  const addSkillCategory = () => {
  const categoryName = newSkillCategory.trim()

  if (!categoryName) {
    setStatus('Category name cannot be empty')
    return
  }

  if ((portfolio.skillCategories || []).some((category) =>
    category.toLowerCase() === categoryName.toLowerCase()
  )) {
    setStatus('This category already exists')
    return
  }

  setPortfolio((prev) => ({
    ...prev,
    skillCategories: [...(prev.skillCategories || []), categoryName],
  }))

  setNewSkillCategory('')
  setStatus('Category added successfully')
}
const updateSkillCategory = (oldName, newName) => {
  const categoryName = newName.trim()

  if (!categoryName) {
    setStatus('Category name cannot be empty')
    return
  }

  if ((portfolio.skillCategories || []).some((category) =>
    category !== oldName && category.toLowerCase() === categoryName.toLowerCase()
  )) {
    setStatus('This category already exists')
    return
  }

  setPortfolio((prev) => ({
    ...prev,
    skillCategories: (prev.skillCategories || []).map((category) =>
      category === oldName ? categoryName : category
    ),
    skills: (prev.skills || []).map((skill) => ({
      ...skill,
      category: skill.category === oldName ? categoryName : skill.category,
    })),
  }))
  setStatus('Category renamed successfully')
}
const removeSkillCategory = (categoryName) => {
  const hasSkills = portfolio.skills.some(
    (skill) => skill.category === categoryName
  )

  if (hasSkills) {
    setStatus('Move or remove skills from this category before deleting it')
    return
  }

  setPortfolio((prev) => ({
    ...prev,
    skillCategories: prev.skillCategories.filter(
      (category) => category !== categoryName
    ),
  }))

  setStatus('Category deleted successfully')
}
  const [contacts, setContacts] = useState([])
  const [status, setStatus] = useState('')
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const [portfolioResponse, contactResponse] = await Promise.all([
          fetchWithRetry(`${apiUrl}/api/admin/portfolio`, { credentials: 'include' }),
          fetch(`${apiUrl}/api/admin/contact`, { credentials: 'include' }),
        ])

        if (portfolioResponse.status === 401 || contactResponse.status === 401) {
          navigate('/admin')
          return
        }

        
const portfolioData = await portfolioResponse.json()

const skillCategories = (Array.isArray(portfolioData.skillCategories)
  ? portfolioData.skillCategories
  : []
).map((category) => (category || '').trim()).filter(Boolean)

const skills = (Array.isArray(portfolioData.skills) ? portfolioData.skills : [])
  .map((skill) => ({ ...skill, name: (skill.name || '').trim(), category: (skill.category || '').trim() }))
  .filter((skill) => skill.name)

setPortfolio({
  ...portfolioData,
  skills,
  skillCategories,
  contactItems: portfolioData.contactItems?.length
    ? portfolioData.contactItems
    : legacyContactItems(portfolioData),
})

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

  const addSkillToCategory = (category) => {
    const name = (categorySkillDrafts[category] || '').trim()
    if (!name) {
      setStatus('Skill name cannot be empty')
      return
    }

    setPortfolio((current) => ({
      ...current,
      skills: [...(current.skills || []), { name, category }],
    }))
    setCategorySkillDrafts((current) => ({ ...current, [category]: '' }))
    setStatus(`Skill added to ${category}`)
  }

  const startEditingSkill = (skillKey, skillName) => {
    setEditingSkills((current) => ({
      ...current,
      [skillKey]: skillName,
    }))
  }

  const saveEditingSkill = (skillKey, skillIndex) => {
    const name = (editingSkills[skillKey] || '').trim()
    if (!name) {
      setStatus('Skill name cannot be empty')
      return
    }
    updateArrayItem('skills', skillIndex, 'name', name)
    setEditingSkills((current) => {
      const next = { ...current }
      delete next[skillKey]
      return next
    })
    setStatus('Skill renamed successfully')
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
      const skillCategories = [...new Map(
        (portfolio.skillCategories || [])
          .map((category) => (category || '').trim())
          .filter(Boolean)
          .map((category) => [category.toLowerCase(), category])
      ).values()]
      const validCategories = new Set(skillCategories)
      const skills = (portfolio.skills || [])
        .map((skill) => ({
          ...skill,
          name: (skill.name || '').trim(),
          category: (skill.category || '').trim(),
        }))
        .filter((skill) => skill.name && validCategories.has(skill.category))
      const payload = {
        ...portfolio,
        skillCategories,
        skills,
      }

      const response = await fetch(`${apiUrl}/api/admin/portfolio`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message)
      setPortfolio(payload)
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
    <div><p>TECHNICAL ARSENAL</p><h2>Manage Technical Arsenal</h2></div>
  </div>

  <div className="admin-editor-row admin-editor-row--add-category">
    <input
      aria-label="New category name"
      placeholder="Enter new category name"
      value={newSkillCategory}
      onChange={(event) => setNewSkillCategory(event.target.value)}
    />
    <button className="button button--secondary" type="button" onClick={addSkillCategory}>
      <Plus size={16} /> Add New Category
    </button>
  </div>

  <div className="technical-category-grid">
    {(portfolio.skillCategories || []).map((category) => {
      const categorySkills = (portfolio.skills || [])
        .map((skill, skillIndex) => ({ skill, skillIndex }))
        .filter(({ skill }) => skill.category === category)

      return (
        <article className="technical-category-card" key={category}>
          <div className="technical-category-card__heading">
            <input
              aria-label={`Rename ${category}`}
              value={categoryRenameDrafts[category] ?? category}
              onChange={(event) => setCategoryRenameDrafts((current) => ({
                ...current,
                [category]: event.target.value,
              }))}
            />
            <button
              type="button"
              className="button button--secondary"
              onClick={() => {
                const nextName = categoryRenameDrafts[category] ?? category
                updateSkillCategory(category, nextName)
              }}
            >
              Rename Category
            </button>
            <button
              type="button"
              className="admin-category-delete"
              aria-label={`Delete ${category}`}
              onClick={() => removeSkillCategory(category)}
            >
              <Trash2 size={15} /> Delete Category
            </button>
          </div>

          <div className="technical-category-card__skills">
            {categorySkills.length === 0 && (
              <p className="technical-category-card__empty">No skills in this category.</p>
            )}
            {categorySkills.map(({ skill, skillIndex }) => {
              const skillKey = skill._id || `${category}-${skillIndex}`
              const isEditing = Object.prototype.hasOwnProperty.call(editingSkills, skillKey)
              return (
                <div className="technical-skill-row" key={skillKey}>
                  {isEditing ? (
                    <input
                      aria-label={`Edit skill ${skill.name}`}
                      value={editingSkills[skillKey]}
                      onChange={(event) => setEditingSkills((current) => ({
                        ...current,
                        [skillKey]: event.target.value,
                      }))}
                    />
                  ) : (
                    <span className="technical-skill-row__name">{skill.name}</span>
                  )}

                  <select
                    aria-label={`Change category for ${skill.name}`}
                    value={(portfolio.skillCategories || []).includes(skill.category) ? skill.category : ''}
                    onChange={(event) => updateArrayItem('skills', skillIndex, 'category', event.target.value)}
                  >
                    <option value="">Select category</option>
                    {(portfolio.skillCategories || []).map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>

                  {isEditing ? (
                    <button type="button" className="button button--secondary" onClick={() => saveEditingSkill(skillKey, skillIndex)}>
                      Save
                    </button>
                  ) : (
                    <button type="button" className="button button--secondary" onClick={() => startEditingSkill(skillKey, skill.name)}>
                      Edit
                    </button>
                  )}
                  <button type="button" aria-label={`Delete ${skill.name}`} onClick={() => removeArrayItem('skills', skillIndex)}>
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
              )
            })}
          </div>

          <div className="technical-category-card__add">
            <input
              aria-label={`Add skill to ${category}`}
              placeholder="Skill name"
              value={categorySkillDrafts[category] || ''}
              onChange={(event) => setCategorySkillDrafts((current) => ({
                ...current,
                [category]: event.target.value,
              }))}
            />
            <button type="button" className="button button--secondary" onClick={() => addSkillToCategory(category)}>
              <Plus size={15} /> Add Skill
            </button>
          </div>
        </article>
      )
    })}
  </div>
</section>


        <section className="admin-panel">
          <div className="admin-panel__heading">
            <div><p>CONTENT</p><h2>Contact Information</h2></div>
            <button className="button button--secondary" type="button" onClick={() => addArrayItem('contactItems', { type: 'link', label: '', value: '', url: '', visible: true })}><Plus size={16} /> Add contact item</button>
          </div>
          <div className="admin-editor-list">
            {(portfolio.contactItems || []).map((item, index) => (
              <div className="admin-project-editor" key={item._id || index}>
                <input aria-label="Contact label" placeholder="Label (for example, LeetCode)" value={item.label || ''} onChange={(event) => updateArrayItem('contactItems', index, 'label', event.target.value)} />
                <select aria-label="Contact type" value={item.type || 'link'} onChange={(event) => updateArrayItem('contactItems', index, 'type', event.target.value)}>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="location">Location</option>
                  <option value="link">Link</option>
                </select>
                <input aria-label="Contact value" placeholder="Displayed value" value={item.value || ''} onChange={(event) => updateArrayItem('contactItems', index, 'value', event.target.value)} />
                <input aria-label="Contact URL" placeholder="URL (required for links)" value={item.url || ''} onChange={(event) => updateArrayItem('contactItems', index, 'url', event.target.value)} />
                <label className="admin-visibility-toggle"><input type="checkbox" checked={item.visible !== false} onChange={(event) => updateArrayItem('contactItems', index, 'visible', event.target.checked)} /> Visible publicly</label>
                <button type="button" aria-label="Remove contact item" onClick={() => removeArrayItem('contactItems', index)}><Trash2 size={16} /> Remove</button>
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
