import React, { useState } from 'react';
import { 
  Folder, 
  FolderOpen, 
  File, 
  ChevronRight, 
  ChevronDown, 
  Copy,
  Download,
  Eye,
  EyeOff,
  Plus,
  Minus
} from 'lucide-react';

const FolderStructureTree = () => {
  const [fileStructure] = useState({
    name: 'family-gnucash',
    type: 'folder',
    children: [
      {
        name: 'app',
        type: 'folder',
        children: [
          {
            name: 'admin',
            type: 'folder',
            children: [
              { name: 'page.tsx', type: 'file', size: '2.1KB' },
              {
                name: 'users',
                type: 'folder',
                children: [
                  { name: 'page.tsx', type: 'file', size: '3.4KB' }
                ]
              },
              {
                name: 'settings',
                type: 'folder',
                children: [
                  { name: 'page.tsx', type: 'file', size: '2.8KB' }
                ]
              }
            ]
          },
          {
            name: 'api',
            type: 'folder',
            children: [
              {
                name: 'auth',
                type: 'folder',
                children: [
                  {
                    name: '[...nextauth]',
                    type: 'folder',
                    children: [
                      { name: 'route.ts', type: 'file', size: '1.9KB' }
                    ]
                  }
                ]
              },
              {
                name: 'accounts',
                type: 'folder',
                children: [
                  { name: 'route.ts', type: 'file', size: '1.5KB' }
                ]
              },
              {
                name: 'transactions',
                type: 'folder',
                children: [
                  { name: 'route.ts', type: 'file', size: '2.2KB' },
                  {
                    name: '[id]',
                    type: 'folder',
                    children: [
                      {
                        name: 'reconcile',
                        type: 'folder',
                        children: [
                          { name: 'route.ts', type: 'file', size: '1.1KB' }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          { name: 'accounts', type: 'folder', children: [{ name: 'page.tsx', type: 'file', size: '1.8KB' }] },
          { name: 'budgets', type: 'folder', children: [{ name: 'page.tsx', type: 'file', size: '2.5KB' }] },
          { name: 'dashboard', type: 'folder', children: [{ name: 'page.tsx', type: 'file', size: '3.1KB' }] },
          { name: 'login', type: 'folder', children: [{ name: 'page.tsx', type: 'file', size: '2.9KB' }] },
          { name: 'reports', type: 'folder', children: [{ name: 'page.tsx', type: 'file', size: '3.7KB' }] },
          { name: 'transactions', type: 'folder', children: [{ name: 'page.tsx', type: 'file', size: '2.3KB' }] },
          { name: 'globals.css', type: 'file', size: '0.8KB' },
          { name: 'layout.tsx', type: 'file', size: '1.2KB' },
          { name: 'providers.tsx', type: 'file', size: '0.4KB' }
        ]
      },
      {
        name: 'components',
        type: 'folder',
        children: [
          { name: 'Navigation.tsx', type: 'file', size: '2.6KB' },
          { name: 'AccountsList.tsx', type: 'file', size: '1.9KB' },
          { name: 'AddAccountForm.tsx', type: 'file', size: '2.4KB' },
          { name: 'TransactionsList.tsx', type: 'file', size: '2.1KB' },
          { name: 'AddTransactionForm.tsx', type: 'file', size: '3.2KB' },
          { name: 'TransactionFilters.tsx', type: 'file', size: '1.7KB' }
        ]
      },
      {
        name: 'lib',
        type: 'folder',
        children: [
          { name: 'auth.ts', type: 'file', size: '1.3KB' },
          { name: 'database.ts', type: 'file', size: '2.0KB' },
          { name: 'google-drive.ts', type: 'file', size: '2.8KB' },
          { name: 'utils.ts', type: 'file', size: '1.5KB' }
        ]
      },
      {
        name: 'prisma',
        type: 'folder',
        children: [
          { name: 'schema.prisma', type: 'file', size: '3.1KB' },
          { name: 'seed.ts', type: 'file', size: '2.4KB' }
        ]
      },
      {
        name: 'types',
        type: 'folder',
        children: [
          { name: 'index.ts', type: 'file', size: '1.8KB' }
        ]
      },
      { name: '.env.local', type: 'file', size: '0.6KB' },
      { name: '.gitignore', type: 'file', size: '0.3KB' },
      { name: 'middleware.ts', type: 'file', size: '1.4KB' },
      { name: 'next.config.js', type: 'file', size: '0.7KB' },
      { name: 'package.json', type: 'file', size: '1.9KB' },
      { name: 'postcss.config.js', type: 'file', size: '0.2KB' },
      { name: 'README.md', type: 'file', size: '4.2KB' },
      { name: 'tailwind.config.js', type: 'file', size: '1.1KB' },
      { name: 'tsconfig.json', type: 'file', size: '0.8KB' }
    ]
  });

  const [expandedNodes, setExpandedNodes] = useState(new Set(['family-gnucash', 'app', 'components', 'lib']));
  const [showSizes, setShowSizes] = useState(true);
  const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'flat'

  const toggleNode = (path) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedNodes(newExpanded);
  };

  const expandAll = () => {
    const allPaths = new Set();
    
    const collectPaths = (node, currentPath = '') => {
      const nodePath = currentPath ? `${currentPath}/${node.name}` : node.name;
      if (node.type === 'folder') {
        allPaths.add(nodePath);
        if (node.children) {
          node.children.forEach(child => collectPaths(child, nodePath));
        }
      }
    };
    
    collectPaths(fileStructure);
    setExpandedNodes(allPaths);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set(['family-gnucash']));
  };

  const getFileIcon = (file) => {
    if (file.type === 'folder') {
      return file.name === 'family-gnucash' || expandedNodes.has(file.path) ? 
        <FolderOpen className="w-4 h-4 text-blue-500" /> : 
        <Folder className="w-4 h-4 text-blue-500" />;
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    const colorMap = {
      'tsx': 'text-blue-600',
      'ts': 'text-blue-500',
      'js': 'text-yellow-500',
      'jsx': 'text-blue-600',
      'css': 'text-green-500',
      'json': 'text-orange-500',
      'md': 'text-gray-600',
      'prisma': 'text-purple-500',
      'env': 'text-red-500'
    };

    return <File className={`w-4 h-4 ${colorMap[extension] || 'text-gray-400'}`} />;
  };

  const renderTreeNode = (node, depth = 0, parentPath = '') => {
    const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
    const isExpanded = expandedNodes.has(currentPath);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={currentPath}>
        <div 
          className={`flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer rounded`}
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
          onClick={() => node.type === 'folder' && hasChildren && toggleNode(currentPath)}
        >
          {/* Expand/Collapse Icon */}
          {node.type === 'folder' && hasChildren && (
            <div className="w-4 h-4 mr-1 flex items-center justify-center">
              {isExpanded ? 
                <ChevronDown className="w-3 h-3 text-gray-500" /> : 
                <ChevronRight className="w-3 h-3 text-gray-500" />
              }
            </div>
          )}
          
          {/* File/Folder Icon */}
          <div className="mr-2">
            {getFileIcon({ ...node, path: currentPath })}
          </div>
          
          {/* Name */}
          <span className={`text-sm ${node.type === 'folder' ? 'font-medium text-gray-800' : 'text-gray-700'}`}>
            {node.name}
          </span>
          
          {/* Size */}
          {showSizes && node.size && (
            <span className="ml-auto text-xs text-gray-500">
              {node.size}
            </span>
          )}
          
          {/* Folder count */}
          {node.type === 'folder' && node.children && (
            <span className="ml-auto text-xs text-gray-500">
              {node.children.length} items
            </span>
          )}
        </div>
        
        {/* Children */}
        {node.type === 'folder' && hasChildren && isExpanded && (
          <div>
            {node.children.map(child => renderTreeNode(child, depth + 1, currentPath))}
          </div>
        )}
      </div>
    );
  };

  const flattenStructure = (node, parentPath = '', depth = 0) => {
    const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
    const result = [{ ...node, path: currentPath, depth }];
    
    if (node.children && expandedNodes.has(currentPath)) {
      node.children.forEach(child => {
        result.push(...flattenStructure(child, currentPath, depth + 1));
      });
    }
    
    return result;
  };

  const generateTextStructure = () => {
    const lines = [];
    
    const addNode = (node, prefix = '', isLast = true) => {
      const connector = isLast ? '└── ' : '├── ';
      const line = prefix + connector + node.name + (node.size ? ` (${node.size})` : '');
      lines.push(line);
      
      if (node.children && expandedNodes.has(prefix + node.name)) {
        const newPrefix = prefix + (isLast ? '    ' : '│   ');
        node.children.forEach((child, index) => {
          addNode(child, newPrefix, index === node.children.length - 1);
        });
      }
    };
    
    addNode(fileStructure);
    return lines.join('\n');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateTextStructure());
    alert('File structure copied to clipboard!');
  };

  const downloadStructure = () => {
    const content = generateTextStructure();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'file-structure.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">File Structure</h1>
            <p className="text-gray-600">Project folder hierarchy visualization</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSizes(!showSizes)}
              className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50"
            >
              {showSizes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showSizes ? 'Hide Sizes' : 'Show Sizes'}
            </button>
            
            <button
              onClick={expandAll}
              className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50"
            >
              <Plus className="w-4 h-4" />
              Expand All
            </button>
            
            <button
              onClick={collapseAll}
              className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50"
            >
              <Minus className="w-4 h-4" />
              Collapse All
            </button>
            
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
            
            <button
              onClick={downloadStructure}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="bg-gray-50 rounded-lg border p-4">
            <div className="font-mono text-sm">
              {renderTreeNode(fileStructure)}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="border-t px-6 py-3 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Total items: {flattenStructure(fileStructure).length}
          </span>
          <span>
            Folders: {flattenStructure(fileStructure).filter(item => item.type === 'folder').length} | 
            Files: {flattenStructure(fileStructure).filter(item => item.type === 'file').length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FolderStructureTree;