'use client'

import { useState, useEffect } from 'react'
import { Container, Section, Flex, Grid } from '../components/ui/LayoutComponents'
import { Card, CardHeader, CardBody } from '../components/ui/FormComponents'
import { Input, Select } from '../components/ui/FormComponents'
import { Button, Badge } from '../components/ui/FormComponents'
import { Alert } from '../components/ui/DataDisplayComponents'
import { cn } from '../utils/helpers'
import { 
  Heart, 
  Cpu, 
  Database, 
  Shield, 
  Bell, 
  Palette, 
  Globe, 
  Info, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Wifi,
  WifiOff,
  Save,
  RotateCcw
} from 'lucide-react'
import { api } from '../services/api'
import { handleApiError } from '../services/api'

const defaultSettings = {
  theme: 'light' as 'light' | 'dark' | 'system',
  autoRefresh: true,
  refreshInterval: 30,
  showConfidence: true,
  riskThresholds: { low: 40, high: 70 },
  notifications: { email: false, browser: true, analysisComplete: true, highRiskAlert: true },
  apiTimeout: 30000,
  debugMode: false,
}

export function SettingsPage() {
  const [settings, setSettings] = useState(defaultSettings)
  const [health, setHealth] = useState<{ status: string; model_loaded: boolean; dataset_loaded: boolean } | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSettings()
    checkApiHealth()
  }, [])

  const loadSettings = () => {
    const stored = localStorage.getItem('geneva-settings')
    if (stored) {
      try {
        setSettings(JSON.parse(stored))
      } catch {
        // Use defaults
      }
    }
  }

  const checkApiHealth = async () => {
    try {
      const res = await api.healthCheck()
      setHealth(res)
    } catch {
      setHealth({ status: 'unhealthy', model_loaded: false, dataset_loaded: false })
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    
    try {
      // Save to localStorage
      localStorage.setItem('geneva-settings', JSON.stringify(settings))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(handleApiError(err))
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setSettings(defaultSettings)
    localStorage.removeItem('geneva-settings')
  }

  const updateSetting = <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <Container size="lg">
        {/* Header */}
        <Flex justify="between" align="center" className="mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Cpu className="w-6 h-6 text-blue-600" />
              Settings
            </h1>
            <p className="text-gray-600 mt-1">Configure application preferences and system settings</p>
          </div>
          <Flex gap={2}>
            <Button variant="secondary" icon={<RotateCcw className="w-4 h-4" />} onClick={handleReset}>
              Reset Defaults
            </Button>
            <Button icon={<Save className="w-4 h-4" />} onClick={handleSave} isLoading={saving}>
              {saved ? 'Saved!' : 'Save Settings'}
            </Button>
          </Flex>
        </Flex>

        {saved && (
          <Alert type="success" message="Settings saved successfully!" className="mb-6" />
        )}

        {error && <Alert type="error" message={error} onDismiss={() => setError(null)} className="mb-6" />}

        {/* API Health Status */}
        <Section title="System Status" className="mb-8">
          <Card>
            <CardHeader>
              <Flex justify="between" align="center">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Wifi className="w-5 h-5" />
                  API Health Check
                </h3>
                <Button variant="ghost" size="sm" icon={<RotateCcw className="w-4 h-4" />} onClick={checkApiHealth} disabled={loading}>
                  {loading ? 'Checking...' : 'Refresh'}
                </Button>
              </Flex>
            </CardHeader>
            <CardBody>
              {loading ? (
                <Flex align="center" gap={3}>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                  <span className="text-gray-500">Checking API health...</span>
                </Flex>
              ) : health ? (
                <Grid cols={3} gap="lg">
                  <Flex align="center" gap={3} className={cn('p-4 rounded-lg', health.status === 'healthy' ? 'bg-green-50' : 'bg-red-50')}>
                    <div className={cn('w-3 h-3 rounded-full', health.status === 'healthy' ? 'bg-green-500' : 'bg-red-500')} />
                    <div>
                      <p className="font-medium text-gray-900">API Status</p>
                      <p className={cn('text-sm', health.status === 'healthy' ? 'text-green-700' : 'text-red-700')}>
                        {health.status === 'healthy' ? 'Healthy' : 'Degraded'}
                      </p>
                    </div>
                  </Flex>
                  <Flex align="center" gap={3} className={cn('p-4 rounded-lg', health.model_loaded ? 'bg-blue-50' : 'bg-red-50')}>
                    <div className={cn('w-3 h-3 rounded-full', health.model_loaded ? 'bg-blue-500' : 'bg-red-500')} />
                    <div>
                      <p className="font-medium text-gray-900">Models Loaded</p>
                      <p className={cn('text-sm', health.model_loaded ? 'text-blue-700' : 'text-red-700')}>
                        {health.model_loaded ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </Flex>
                  <Flex align="center" gap={3} className={cn('p-4 rounded-lg', health.dataset_loaded ? 'bg-teal-50' : 'bg-red-50')}>
                    <div className={cn('w-3 h-3 rounded-full', health.dataset_loaded ? 'bg-teal-500' : 'bg-red-500')} />
                    <div>
                      <p className="font-medium text-gray-900">Dataset Loaded</p>
                      <p className={cn('text-sm', health.dataset_loaded ? 'text-teal-700' : 'text-red-700')}>
                        {health.dataset_loaded ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </Flex>
                </Grid>
              ) : (
                <Flex align="center" gap={3} className="p-4 rounded-lg bg-red-50">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700">Unable to connect to API</span>
                </Flex>
              )}
            </CardBody>
          </Card>
        </Section>

        {/* Appearance */}
        <Section title="Appearance" className="mb-8">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Palette className="w-5 h-5 text-blue-500" />
                Theme & Display
              </h3>
            </CardHeader>
            <CardBody>
              <Grid cols={2} gap="lg">
                <div>
                  <label className="label">Theme</label>
                  <Select
                    value={settings.theme}
                    onChange={(e) => updateSetting('theme', e.target.value as any)}
                    options={[
                      { value: 'light', label: 'Light' },
                      { value: 'dark', label: 'Dark' },
                      { value: 'system', label: 'System' },
                    ]}
                    placeholder="Select theme"
                  />
                  <p className="text-sm text-gray-500 mt-1">Dark mode coming in future release</p>
                </div>
                <div>
                  <label className="label">Auto-refresh Dashboard</label>
                  <Select
                    value={settings.autoRefresh ? String(settings.refreshInterval) : '0'}
                    onChange={(e) => {
                      const val = parseInt(e.target.value)
                      updateSetting('autoRefresh', val > 0)
                      updateSetting('refreshInterval', val)
                    }}
                    options={[
                      { value: '0', label: 'Disabled' },
                      { value: '10', label: 'Every 10 seconds' },
                      { value: '30', label: 'Every 30 seconds' },
                      { value: '60', label: 'Every minute' },
                      { value: '300', label: 'Every 5 minutes' },
                    ]}
                    placeholder="Select interval"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="label">Show Confidence Intervals</label>
                  <Select
                    value={String(settings.showConfidence)}
                    onChange={(e) => updateSetting('showConfidence', e.target.value === 'true')}
                    options={[
                      { value: 'true', label: 'Enabled' },
                      { value: 'false', label: 'Disabled' },
                    ]}
                    placeholder="Select option"
                  />
                  <p className="text-sm text-gray-500 mt-1">Display confidence intervals in prediction results</p>
                </div>
              </Grid>
            </CardBody>
          </Card>
        </Section>

        {/* Risk Thresholds */}
        <Section title="Risk Thresholds" className="mb-8">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                Classification Thresholds
              </h3>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-gray-600 mb-6">
                Adjust the probability thresholds used to classify risk levels. 
                These affect risk labels throughout the application.
              </p>
              <Grid cols={2} gap="lg">
                <div>
                  <label className="label">Low Risk Threshold (%)</label>
                  <Input
                    type="number"
                    value={settings.riskThresholds.low}
                    onChange={(e) => updateSetting('riskThresholds', { ...settings.riskThresholds, low: parseInt(e.target.value) || 40 })}
                    min={10}
                    max={90}
                    step={5}
                    helperText="Below this: Low Risk (Green)"
                  />
                </div>
                <div>
                  <label className="label">High Risk Threshold (%)</label>
                  <Input
                    type="number"
                    value={settings.riskThresholds.high}
                    onChange={(e) => updateSetting('riskThresholds', { ...settings.riskThresholds, high: parseInt(e.target.value) || 70 })}
                    min={50}
                    max={95}
                    step={5}
                    helperText="Above this: High Risk (Red)"
                  />
                </div>
              </Grid>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900 mb-2">Current Risk Categories:</p>
                <Flex gap={4} wrap>
                  <Badge variant="green">{'Low Risk: < ' + settings.riskThresholds.low + '%'}</Badge>
                  <Badge variant="amber">{'Moderate: ' + settings.riskThresholds.low + '% – ' + settings.riskThresholds.high + '%'}</Badge>
                  <Badge variant="red">{'High Risk: > ' + settings.riskThresholds.high + '%'}</Badge>
                </Flex>
              </div>
            </CardBody>
          </Card>
        </Section>

        {/* Notifications */}
        <Section title="Notifications" className="mb-8">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-500" />
                Notification Preferences
              </h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {[
                  { key: 'email', label: 'Email Notifications', desc: 'Receive email updates (requires backend config)' },
                  { key: 'browser', label: 'Browser Notifications', desc: 'Show desktop notifications when allowed' },
                  { key: 'analysisComplete', label: 'Analysis Complete', desc: 'Notify when prediction finishes' },
                  { key: 'highRiskAlert', label: 'High Risk Alerts', desc: 'Alert when high-risk predictions detected' },
                ].map((item) => (
                  <Flex key={item.key} justify="between" align="center" className="p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                      onChange={(e) => updateSetting('notifications', { ...settings.notifications, [item.key]: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </Flex>
                ))}
              </div>
            </CardBody>
          </Card>
        </Section>

        {/* Advanced */}
        <Section title="Advanced" className="mb-8">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-500" />
                API & Debug
              </h3>
            </CardHeader>
            <CardBody>
              <Grid cols={2} gap="lg">
                <div>
                  <label className="label">API Timeout (ms)</label>
                  <Input
                    type="number"
                    value={settings.apiTimeout}
                    onChange={(e) => updateSetting('apiTimeout', parseInt(e.target.value) || 30000)}
                    min={5000}
                    max={120000}
                    step={5000}
                    helperText="Request timeout for backend calls"
                  />
                </div>
                <div>
                  <label className="label">Debug Mode</label>
                  <Select
                    value={String(settings.debugMode)}
                    onChange={(e) => updateSetting('debugMode', e.target.value === 'true')}
                    options={[
                      { value: 'true', label: 'Enabled' },
                      { value: 'false', label: 'Disabled' },
                    ]}
                    placeholder="Select option"
                  />
                  <p className="text-sm text-gray-500 mt-1">Enable verbose logging and debug panels</p>
                </div>
              </Grid>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Danger Zone</h4>
                <Flex gap={3} align="center">
                  <div className="flex-1">
                    <p className="font-medium text-red-600">Reset All Settings</p>
                    <p className="text-sm text-gray-500">Restore all settings to default values</p>
                  </div>
                  <Button variant="danger" onClick={handleReset}>
                    Reset to Defaults
                  </Button>
                </Flex>
              </div>
            </CardBody>
          </Card>
        </Section>

        {/* About */}
        <Section title="About">
          <Card>
            <CardBody>
              <Flex gap={4} align="center">
                <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">GENEVA v1.0.0</h3>
                  <p className="text-sm text-gray-500">AI Cardiovascular Risk Visualization & Prediction System</p>
                  <p className="text-xs text-gray-400 mt-1">IIT Mandi Multimodal AI Hackathon 2026 — Track A</p>
                </div>
              </Flex>
              <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">React 18</p>
                  <p className="text-xs text-gray-500">Frontend</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-teal-600">FastAPI</p>
                  <p className="text-xs text-gray-500">Backend</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">scikit-learn</p>
                  <p className="text-xs text-gray-500">ML</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">Three.js</p>
                  <p className="text-xs text-gray-500">3D</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Section>
      </Container>
  )
}