import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Download, 
  Trash2, 
  File, 
  Folder, 
  Search, 
  Plus,
  Eye,
  Edit3,
  Share2,
  MoreVertical,
  Grid,
  List,
  Filter,
  SortAsc
} from 'lucide-react';

const FileManagerApp = () => {
  const [files, setFiles] = useState([
    { id: 1, name: 'Documents', type: 'folder', size: null, modified: '2025-01-10', items: 12 },
    { id: 2, name: 'project-plan.pdf', type: 'file', size: '2.4 MB', modified: '2025-01-09', extension: 'pdf' },
    { id: 3, name: 'Images', type: 'folder', size: null, modified: '2025-01-08', items: 48 },
    { id: 4, name: 'budget-2025.xlsx', type: 'file', size: '856 KB', modified: '2025-01-07', extension: 'xlsx' },
    { id: 5, name: 'presentation.pptx', type: 'file', size: '12.3 MB', modified: '2025-01-06', extension: 'pptx' },
    { id: 6, name: 'notes.txt', type: 'file', size: '4 KB', modified: '2025-01-05', extension: 'txt' },
    { id: 7, name: 'Downloads', type: 'folder', size: null, modified: '2025-01-04', items: 23 },
    { id: 8, name: 'backup.zip', type: 'file', size: '145 MB', modified: '2025-01-03', extension: 'zip' },
  ]);

  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const fileInputRef = useRef(null);

  const getFileIcon = (file) => {
    if (file.type === 'folder') {
      return <Folder className="w-8 h-8 text-blue-500" />;
    }

    const iconMap = {
      pdf: <File className="w-8 h-8 text-red-500" />,
      xlsx: <File className="w-8 h-8 text-green-500" />,
      pptx: <File className="w-8 h-8 text-orange-500" />,
      txt: <File className="w-8 h-8 text-gray-500" />,
      zip: <File className="w-8 h-8 text-purple-500" />,
    };

    return iconMap[file.extension] || <File className="w-8 h-8 text-gray-400" />;
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'modified':
        return new Date(b.modified) - new Date(a.modified);
      case 'size':
        if (a.type === 'folder' && b.type === 'folder') return 0;
        if (a.type === 'folder') return -1;
        if (b.type === 'folder') return 1;
        const aSize = parseFloat(a.size) || 0;
        const bSize = parseFloat(b.size) || 0;
        return bSize - aSize;
      default:
        return 0;
    }
  });

  const handleFileSelect = (fileId) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleFileUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files);
    const newFiles = uploadedFiles.map((file, index) => ({
      id: files.length + index + 1,
      name: file.name,
      type: 'file',
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      modified: new Date().toISOString().split('T')[0],
      extension: file.name.split('.').pop().toLowerCase()
    }));

    setFiles(prev => [...prev, ...newFiles]);
    setShowUpload(false);
  };

  const handleDelete = () => {
    if (selectedFiles.length > 0 && confirm(`Delete ${selectedFiles.length} item(s)?`)) {
      setFiles(prev => prev.filter(file => !selectedFiles.includes(file.id)));
      setSelectedFiles([]);
    }
  };

  const handleDownload = () => {
    if (selectedFiles.length > 0) {
      alert(`Downloading ${selectedFiles.length} item(s)...`);
    }
  };

  const createNewFolder = () => {
    const folderName = prompt('Enter folder name:');
    if (folderName) {
      const newFolder = {
        id: files.length + 1,
        name: folderName,
        type: 'folder',
        size: null,
        modified: new Date().toISOString().split('T')[0],
        items: 0
      };
      setFiles(prev => [...prev, newFolder]);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">File Manager</h1>
            <p className="text-gray-600">Organize and manage your files</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={createNewFolder}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Folder
            </button>
            
            <button
              onClick={() => setShowUpload(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Files
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Sort by Name</option>
              <option value="modified">Sort by Date</option>
              <option value="size">Sort by Size</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            {/* Selection Actions */}
            {selectedFiles.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedFiles.length} selected
                </span>
                <button
                  onClick={handleDownload}
                  className="text-blue-600 hover:text-blue-700 p-1"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-700 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* View Toggle */}
            <div className="flex border rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* File Grid/List */}
      <div className="flex-1 overflow-auto p-6">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {sortedFiles.map(file => (
              <div
                key={file.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                  selectedFiles.includes(file.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => handleFileSelect(file.id)}
              >
                <div className="flex flex-col items-center">
                  {getFileIcon(file)}
                  <div className="mt-2 text-center">
                    <p className="text-sm font-medium text-gray-900 truncate w-full">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {file.type === 'folder' ? `${file.items} items` : file.size}
                    </p>
                    <p className="text-xs text-gray-400">
                      {file.modified}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-900">Name</th>
                  <th className="text-left p-4 font-medium text-gray-900">Size</th>
                  <th className="text-left p-4 font-medium text-gray-900">Modified</th>
                  <th className="text-center p-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedFiles.map(file => (
                  <tr
                    key={file.id}
                    className={`border-b hover:bg-gray-50 cursor-pointer ${
                      selectedFiles.includes(file.id) ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleFileSelect(file.id)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {getFileIcon(file)}
                        <span className="font-medium text-gray-900">{file.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">
                      {file.type === 'folder' ? `${file.items} items` : file.size}
                    </td>
                    <td className="p-4 text-gray-600">{file.modified}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="text-gray-400 hover:text-blue-600">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-green-600">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {sortedFiles.length === 0 && (
          <div className="text-center py-12">
            <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms' : 'Upload some files to get started'}
            </p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Upload Files</h3>
            
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Click to select files</p>
              <p className="text-sm text-gray-500">or drag and drop files here</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex-1"
              >
                Select Files
              </button>
              <button
                onClick={() => setShowUpload(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="bg-white border-t px-6 py-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{sortedFiles.length} items</span>
          <span>
            {selectedFiles.length > 0 && `${selectedFiles.length} selected`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FileManagerApp;