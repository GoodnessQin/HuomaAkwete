import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Landing, OurStory, Odogwu, Reserve, Confirmed, Privacy } from './App.jsx'
import Admin from './Admin.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/story" element={<OurStory />} />
      <Route path="/odogwu" element={<Odogwu />} />
      <Route path="/reserve" element={<Reserve />} />
      <Route path="/confirmed" element={<Confirmed />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
)
