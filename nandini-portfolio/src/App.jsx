import { useEffect, useState } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import PortfolioSections from './components/PortfolioSections'
import AdminLogin from './components/AdminLogin'
import AdminDashboard from './components/AdminDashboard'
import { fetchWithRetry } from './apiFetch'
import './App.css'

function PublicPortfolio() {
  const [portfolio, setPortfolio] = useState(null)

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'

    fetchWithRetry(`${apiUrl}/api/portfolio`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Portfolio data is unavailable')
        }
        return response.json()
      })
      .then((data) => setPortfolio(data))
      .catch(() => setPortfolio(null))
  }, [])

  return (
    <>
      <Navbar />
      <Hero portfolio={portfolio} />
      <PortfolioSections portfolio={portfolio} />
      <Link className="admin-access-button" to="/admin" aria-label="Open admin login">
        Admin
      </Link>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicPortfolio />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
