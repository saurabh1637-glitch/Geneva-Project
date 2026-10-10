'use client'

import { useState } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { Sidebar, MobileMenuButton } from './Sidebar'
import { Header } from './Header'
import { cn } from '../../utils/helpers'
import { Heart } from 'lucide-react'

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 min-w-0 p-3 sm:p-4 lg:p-5 2xl:p-6">
          <Outlet />
        </main>
        
        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white py-3 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>
              GENEVA — AI Cardiovascular Risk Visualization & Prediction System
            </p>
            <p className="text-red-600 font-medium">
              For research and educational use only. Not a substitute for professional medical diagnosis.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export function SimpleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2" aria-label="GENEVA Home">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl text-navy">GENEVA</span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link to="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900">Dashboard</Link>
              <Link to="/patients/new" className="btn-primary">Start Analysis</Link>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          <p className="text-red-600 font-medium mb-2">For research and educational use only. Not a substitute for professional medical diagnosis.</p>
          <p>GENEVA — IIT Mandi Multimodal AI Hackathon 2026, Track A</p>
        </div>
      </footer>
    </div>
  )
}