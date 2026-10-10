'use client'

import { useState } from 'react'
import { Link, useLocation, NavLink } from 'react-router-dom'
import { cn } from '../../utils/helpers'
import {
  LayoutDashboard,
  UserPlus,
  Users,
  Activity,
  Heart,
  Brain,
  BarChart3,
  FileText,
  Database,
  Settings,
  Info,
  ChevronLeft,
  ChevronRight,
  Menu,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'New Analysis', href: '/patients/new', icon: UserPlus },
  { name: 'Patient Records', href: '/patients', icon: Users },
  { name: 'Results', href: '/results', icon: Activity, disabled: true }, // Dynamic route
  { name: '3D Heart', href: '/heart-3d', icon: Heart },
  { name: 'Explainability', href: '/explainability', icon: Brain },
  { name: 'Model Performance', href: '/model-performance', icon: BarChart3 },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Dataset', href: '/dataset', icon: Database },
  { name: 'About', href: '/about', icon: Info },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static z-50 h-screen lg:h-auto bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col',
          collapsed ? 'w-16' : 'w-64',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        aria-label="Main navigation"
      >
        {/* Header */}
        <div className={cn('flex items-center justify-between h-16 px-4 border-b border-gray-200', collapsed && 'justify-center')}>
          {!collapsed && (
            <Link to="/dashboard" className="flex items-center gap-2" aria-label="GENEVA Home">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-navy">GENEVA</span>
            </Link>
          )}
          {collapsed && (
            <Link to="/dashboard" className="p-2" aria-label="GENEVA Home">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center mx-auto">
                <Heart className="w-5 h-5 text-white" />
              </div>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn('p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors', collapsed && 'mx-auto')}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto" role="navigation" aria-label="Main menu">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== '/' && location.pathname.startsWith(item.href))
            
            if (item.disabled) {
              return (
                <span
                  key={item.name}
                  className={cn(
                    'sidebar-link',
                    'opacity-50 cursor-not-allowed pointer-events-none',
                    collapsed && 'justify-center px-2'
                  )}
                  title={collapsed ? item.name : undefined}
                  tabIndex={-1}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  {!collapsed && <span>{item.name}</span>}
                </span>
              )
            }
            
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive: active }) => cn(
                  'sidebar-link',
                  active && 'sidebar-link-active',
                  collapsed && 'justify-center px-2'
                )}
                title={collapsed ? item.name : undefined}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer */}
        <div className={cn('p-4 border-t border-gray-200', collapsed && 'hidden')}>
          <div className="text-xs text-gray-500 text-center">
            <p>GENEVA v1.0.0</p>
            <p className="mt-1">IIT Mandi Hackathon 2026</p>
            <p className="mt-2 text-red-600 font-medium">Research Use Only</p>
          </div>
        </div>
      </aside>
    </>
  )
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
      aria-label="Open menu"
      aria-expanded="false"
    >
      <Menu className="w-6 h-6" />
    </button>
  )
}