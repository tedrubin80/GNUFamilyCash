'use client'

import { useState } from 'react'
import { Save, Database, Cloud, Shield, Globe } from 'lucide-react'

export default function SystemSettings() {
  const [settings, setSettings] = useState({
    appName: 'Family GnuCash',
    defaultCurrency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    fiscalYearStart: '01-01',
    sessionTimeout: 8,
    backupFrequency: 'daily',
    googleDriveEnabled: true
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Settings saved successfully!')
    } catch (error) {
      alert('Error saving settings')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600">Configure application settings and preferences</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center mb-4">
            <Globe className="w-5 h-5 text-blue-600" />
            <h3 className="ml-2 text-lg font-semibold">General Settings</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Application Name</label>
              <input
                type="text"
                value={settings.appName}
                onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Default Currency</label>
              <select
                value={settings.defaultCurrency}
                onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date Format</label>
              <select
                value={settings.dateFormat}
                onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center mb-4">
            <Shield className="w-5 h-5 text-red-600" />
            <h3 className="ml-2 text-lg font-semibold">Security Settings</h3>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Session Timeout (hours)</label>
            <input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
              className="w-32 px-3 py-2 border rounded-lg"
              min="1"
              max="24"
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center mb-4">
            <Cloud className="w-5 h-5 text-green-600" />
            <h3 className="ml-2 text-lg font-semibold">Backup Settings</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Google Drive Backup</label>
                <p className="text-sm text-gray-600">Automatically backup to Google Drive</p>
              </div>
              <input
                type="checkbox"
                checked={settings.googleDriveEnabled}
                onChange={(e) => setSettings({ ...settings, googleDriveEnabled: e.target.checked })}
                className="rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Backup Frequency</label>
              <select
                value={settings.backupFrequency}
                onChange={(e) => setSettings({ ...settings, backupFrequency: e.target.value })}
                className="w-full max-w-xs px-3 py-2 border rounded-lg"
                disabled={!settings.googleDriveEnabled}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}
