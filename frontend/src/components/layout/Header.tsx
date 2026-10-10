'use client'

import { Link } from 'react-router-dom'
import { cn } from '../../utils/helpers'
import { Heart, Bell, User, Menu, LogOut, Sun, Moon } from 'lucide-react'

interface HeaderProps {
  onMenuClick: () => void
  title?: string
  breadcrumbs?: { label: string; href?: string }[]
}

export function Header({ onMenuClick, title, breadcrumbs }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 lg:pl-64">
        {/* Left side - Menu button and breadcrumbs */}
        <div className="flex items-center gap-4 lg:pl-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="hidden sm:flex items-center gap-2 text-sm" aria-label="Breadcrumb">
              <Link to="/dashboard" className="text-gray-500 hover:text-gray-700">
                Dashboard
              </Link>
              {breadcrumbs.map((crumb, index) => (
                <span key={crumb.label} className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  {crumb.href ? (
                    <Link to={crumb.href} className="text-gray-500 hover:text-gray-700">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-gray-900 font-medium" aria-current="page">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
          
          {title && !breadcrumbs && (
            <h1 className="text-lg font-semibold text-gray-900 lg:hidden">{title}</h1>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          {/* Theme toggle - placeholder for future dark mode */}
          <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700" aria-label="Toggle theme">
            <Sun className="w-5 h-5" />
          </button>
          
          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700" aria-label="Notifications">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          
          {/* User menu */}
          <div className="relative">
            <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100" aria-label="User menu">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Heart className="w-5 h-5 text-blue-600" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">Researcher</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}