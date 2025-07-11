import { requireAuth } from '@/lib/auth'
import { Upload, Download, Cloud, RefreshCw } from 'lucide-react'

export default async function ImportExportPage() {
  const user = await requireAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Import & Export</h1>
        <p className="text-gray-600">Manage your data imports, exports, and backups</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center mb-4">
            <Upload className="w-6 h-6 text-blue-600" />
            <h3 className="ml-3 text-lg font-semibold">Import Data</h3>
          </div>
          
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              Import from CSV
            </button>
            <button className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              Import from OFX
            </button>
            <button className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              Import from QIF
            </button>
            <button className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              Import GnuCash XML
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center mb-4">
            <Download className="w-6 h-6 text-green-600" />
            <h3 className="ml-3 text-lg font-semibold">Export Data</h3>
          </div>
          
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Export to CSV
            </button>
            <button className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Export to OFX
            </button>
            <button className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Export to QIF
            </button>
            <button className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Export GnuCash XML
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Cloud className="w-6 h-6 text-red-600" />
            <h3 className="ml-3 text-lg font-semibold">Google Drive Backup</h3>
          </div>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
            Connected
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Last Backup</p>
            <p className="font-medium">Today, 3:00 PM</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Backup Frequency</p>
            <p className="font-medium">Daily</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Storage Used</p>
            <p className="font-medium">2.3 MB</p>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Cloud className="w-4 h-4" />
            Backup Now
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Restore from Backup
          </button>
          <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            View Backup History
          </button>
        </div>
      </div>
    </div>
  )
}
