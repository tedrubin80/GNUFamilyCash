// File Location: ./components/FamilyGnuCash.tsx
// Or use as: ./app/page.tsx (for Next.js main page)
// Purpose: Complete React prototype with all accounting features

import React, { useState, useEffect } from 'react';
import { Plus, Upload, Download, Calendar, Search, Filter, BarChart3, PieChart, TrendingUp, Settings, Users, Home, CreditCard, Wallet, Building, DollarSign, Lock, LogOut, FileText, Target, CheckSquare, Eye, EyeOff, Save, RefreshCw } from 'lucide-react';

const FamilyGnuCash = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '', showPassword: false });
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedMonth, setSelectedMonth] = useState('2025-07');
  const [filterAccount, setFilterAccount] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock database state - in real app, this would be API calls
  const [accounts, setAccounts] = useState([
    { id: 1, name: 'Checking Account', type: 'Asset', balance: 5420.50, parent: null, code: '1001', reconciled: true, lastReconciled: '2025-07-01' },
    { id: 2, name: 'Savings Account', type: 'Asset', balance: 12850.00, parent: null, code: '1002', reconciled: true, lastReconciled: '2025-07-01' },
    { id: 3, name: 'Emergency Fund', type: 'Asset', balance: 8500.00, parent: 2, code: '1002.01', reconciled: true, lastReconciled: '2025-07-01' },
    { id: 4, name: 'Credit Card', type: 'Liability', balance: -1245.30, parent: null, code: '2001', reconciled: false, lastReconciled: '2025-06-01' },
    { id: 5, name: 'Mortgage', type: 'Liability', balance: -245000.00, parent: null, code: '2002', reconciled: true, lastReconciled: '2025-07-01' },
    { id: 6, name: 'Salary Income', type: 'Income', balance: -8500.00, parent: null, code: '4001', reconciled: true, lastReconciled: '' },
    { id: 7, name: 'Groceries', type: 'Expense', balance: 850.00, parent: null, code: '5001', reconciled: true, lastReconciled: '' },
    { id: 8, name: 'Utilities', type: 'Expense', balance: 320.00, parent: null, code: '5002', reconciled: true, lastReconciled: '' },
    { id: 9, name: 'Gas', type: 'Expense', balance: 180.00, parent: null, code: '5003', reconciled: true, lastReconciled: '' },
    { id: 10, name: 'Dining Out', type: 'Expense', balance: 450.00, parent: null, code: '5004', reconciled: true, lastReconciled: '' },
  ]);

  const [transactions, setTransactions] = useState([
    { id: 1, date: '2025-07-08', description: 'Grocery Store', reconciled: true, splits: [
      { account: 'Groceries', debit: 85.50, credit: 0 },
      { account: 'Checking Account', debit: 0, credit: 85.50 }
    ]},
    { id: 2, date: '2025-07-07', description: 'Salary Deposit', reconciled: true, splits: [
      { account: 'Checking Account', debit: 4250.00, credit: 0 },
      { account: 'Salary Income', debit: 0, credit: 4250.00 }
    ]},
    { id: 3, date: '2025-07-06', description: 'Electric Bill', reconciled: false, splits: [
      { account: 'Utilities', debit: 125.00, credit: 0 },
      { account: 'Credit Card', debit: 0, credit: 125.00 }
    ]},
    { id: 4, date: '2025-07-05', description: 'Restaurant', reconciled: true, splits: [
      { account: 'Dining Out', debit: 65.00, credit: 0 },
      { account: 'Credit Card', debit: 0, credit: 65.00 }
    ]},
  ]);

  const [budgets, setBudgets] = useState([
    { id: 1, name: 'Monthly Budget 2025-07', period: '2025-07', accounts: [
      { account: 'Groceries', budgeted: 800, actual: 850, variance: -50 },
      { account: 'Utilities', budgeted: 300, actual: 320, variance: -20 },
      { account: 'Gas', budgeted: 200, actual: 180, variance: 20 },
      { account: 'Dining Out', budgeted: 400, actual: 450, variance: -50 },
    ]},
  ]);

  const [users] = useState([
    { id: 1, username: 'admin', password: 'admin123', role: 'admin', name: 'Family Admin' },
    { id: 2, username: 'spouse', password: 'spouse123', role: 'user', name: 'Spouse' },
    { id: 3, username: 'teen', password: 'teen123', role: 'readonly', name: 'Teen' },
  ]);

  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    splits: [
      { account: '', debit: '', credit: '' },
      { account: '', debit: '', credit: '' }
    ]
  });

  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'Asset',
    code: '',
    parent: null
  });

  const [newBudget, setNewBudget] = useState({
    name: '',
    period: new Date().toISOString().slice(0, 7),
    accounts: []
  });

  const [gdriveStatus, setGdriveStatus] = useState('disconnected');
  const [lastSync, setLastSync] = useState(null);

  const accountTypes = ['Asset', 'Liability', 'Income', 'Expense', 'Equity'];

  // Authentication
  const handleLogin = () => {
    const user = users.find(u => u.username === loginForm.username && u.password === loginForm.password);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      setLoginForm({ username: '', password: '', showPassword: false });
    } else {
      alert('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setActiveView('dashboard');
  };

  // Database simulation functions
  const saveToDatabase = async (data, table) => {
    // Simulate API call
    console.log(`Saving to ${table}:`, data);
    return new Promise(resolve => setTimeout(resolve, 500));
  };

  const loadFromDatabase = async (table) => {
    // Simulate API call
    console.log(`Loading from ${table}`);
    return new Promise(resolve => setTimeout(resolve, 300));
  };

  // Google Drive Integration
  const connectGoogleDrive = async () => {
    setGdriveStatus('connecting');
    // Simulate Google Drive connection
    setTimeout(() => {
      setGdriveStatus('connected');
      setLastSync(new Date().toISOString());
    }, 2000);
  };

  const syncToGoogleDrive = async () => {
    if (gdriveStatus !== 'connected') return;
    
    setGdriveStatus('syncing');
    // Simulate backup to Google Drive
    const backupData = {
      accounts,
      transactions,
      budgets,
      timestamp: new Date().toISOString()
    };
    
    setTimeout(() => {
      setGdriveStatus('connected');
      setLastSync(new Date().toISOString());
      alert('Data backed up to Google Drive successfully!');
    }, 2000);
  };

  const restoreFromGoogleDrive = async () => {
    if (gdriveStatus !== 'connected') return;
    
    if (confirm('This will replace all current data. Are you sure?')) {
      setGdriveStatus('syncing');
      // Simulate restore from Google Drive
      setTimeout(() => {
        setGdriveStatus('connected');
        alert('Data restored from Google Drive successfully!');
      }, 2000);
    }
  };

  // Utility functions
  const getAccountIcon = (type) => {
    switch(type) {
      case 'Asset': return <Wallet className="w-4 h-4" />;
      case 'Liability': return <CreditCard className="w-4 h-4" />;
      case 'Income': return <TrendingUp className="w-4 h-4" />;
      case 'Expense': return <DollarSign className="w-4 h-4" />;
      case 'Equity': return <Building className="w-4 h-4" />;
      default: return <Home className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getAccountHierarchy = () => {
    const hierarchy = {};
    accounts.forEach(account => {
      if (!account.parent) {
        hierarchy[account.id] = { ...account, children: [] };
      }
    });
    
    accounts.forEach(account => {
      if (account.parent) {
        if (hierarchy[account.parent]) {
          hierarchy[account.parent].children.push(account);
        }
      }
    });
    
    return Object.values(hierarchy);
  };

  // CRUD Operations
  const addTransaction = async () => {
    const totalDebits = newTransaction.splits.reduce((sum, split) => sum + (parseFloat(split.debit) || 0), 0);
    const totalCredits = newTransaction.splits.reduce((sum, split) => sum + (parseFloat(split.credit) || 0), 0);
    
    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      alert('Transaction must balance: Total debits must equal total credits');
      return;
    }

    const transaction = {
      id: transactions.length + 1,
      date: newTransaction.date,
      description: newTransaction.description,
      reconciled: false,
      splits: newTransaction.splits.filter(split => split.account && (split.debit || split.credit))
    };

    const updatedTransactions = [...transactions, transaction];
    setTransactions(updatedTransactions);
    await saveToDatabase(transaction, 'transactions');
    
    setNewTransaction({
      date: new Date().toISOString().split('T')[0],
      description: '',
      splits: [
        { account: '', debit: '', credit: '' },
        { account: '', debit: '', credit: '' }
      ]
    });
    
    setActiveView('transactions');
  };

  const addAccount = async () => {
    if (!newAccount.name) return;
    
    const account = {
      id: accounts.length + 1,
      name: newAccount.name,
      type: newAccount.type,
      balance: 0,
      parent: newAccount.parent || null,
      code: newAccount.code || `${accounts.length + 1}001`,
      reconciled: false,
      lastReconciled: ''
    };

    const updatedAccounts = [...accounts, account];
    setAccounts(updatedAccounts);
    await saveToDatabase(account, 'accounts');
    
    setNewAccount({ name: '', type: 'Asset', code: '', parent: null });
    setActiveView('accounts');
  };

  const toggleReconciled = async (transactionId) => {
    const updatedTransactions = transactions.map(t => 
      t.id === transactionId ? { ...t, reconciled: !t.reconciled } : t
    );
    setTransactions(updatedTransactions);
    await saveToDatabase(updatedTransactions.find(t => t.id === transactionId), 'transactions');
  };

  // Export functions
  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Description', 'Account', 'Debit', 'Credit', 'Reconciled'],
      ...transactions.flatMap(t => 
        t.splits.map(split => [
          t.date,
          t.description,
          split.account,
          split.debit || '',
          split.credit || '',
          t.reconciled ? 'Yes' : 'No'
        ])
      )
    ].map(row => row.join(',')).join('\n');

    downloadFile(csvContent, `family-accounts-${selectedMonth}.csv`, 'text/csv');
  };

  const exportToOFX = () => {
    const ofxHeader = `OFXHEADER:100
DATA:OFXSGML
VERSION:103
SECURITY:NONE
ENCODING:USASCII
CHARSET:1252
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE

<OFX>
<BANKMSGSRSV1>
<STMTTRNRS>
<STMTRS>
<CURDEF>USD</CURDEF>
<BANKACCTFROM>
<BANKID>123456789</BANKID>
<ACCTID>CHECKING</ACCTID>
<ACCTTYPE>CHECKING</ACCTTYPE>
</BANKACCTFROM>
<BANKTRANLIST>`;

    const ofxTransactions = transactions.map(t => {
      const amount = t.splits[0].debit || -t.splits[0].credit;
      return `<STMTTRN>
<TRNTYPE>${amount > 0 ? 'CREDIT' : 'DEBIT'}</TRNTYPE>
<DTPOSTED>${t.date.replace(/-/g, '')}</DTPOSTED>
<TRNAMT>${amount}</TRNAMT>
<FITID>${t.id}</FITID>
<NAME>${t.description}</NAME>
</STMTTRN>`;
    }).join('\n');

    const ofxFooter = `</BANKTRANLIST>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>`;

    const ofxContent = ofxHeader + ofxTransactions + ofxFooter;
    downloadFile(ofxContent, `family-accounts-${selectedMonth}.ofx`, 'application/x-ofx');
  };

  const exportToQIF = () => {
    const qifContent = transactions.map(t => {
      const mainSplit = t.splits[0];
      const amount = mainSplit.debit || -mainSplit.credit;
      return `D${t.date}
T${amount.toFixed(2)}
P${t.description}
L${mainSplit.account}
^`;
    }).join('\n');

    downloadFile(qifContent, `family-accounts-${selectedMonth}.qif`, 'application/qif');
  };

  const exportToGnuCashXML = () => {
    const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<gnc-v2>
  <gnc:book version="2.0.0">
    <book:id type="guid">family-accounts</book:id>
    ${accounts.map(account => `
    <gnc:account version="2.0.0">
      <act:name>${account.name}</act:name>
      <act:id type="guid">${account.id}</act:id>
      <act:type>${account.type.toUpperCase()}</act:type>
      <act:code>${account.code}</act:code>
    </gnc:account>`).join('')}
    ${transactions.map(t => `
    <gnc:transaction version="2.0.0">
      <trn:id type="guid">${t.id}</trn:id>
      <trn:description>${t.description}</trn:description>
      <trn:date-posted>
        <ts:date>${t.date}</ts:date>
      </trn:date-posted>
      ${t.splits.map((split, index) => `
      <trn:split>
        <split:id type="guid">${t.id}-${index}</split:id>
        <split:account type="guid">${accounts.find(a => a.name === split.account)?.id}</split:account>
        <split:value>${(split.debit || -split.credit) * 100}/100</split:value>
        <split:quantity>${(split.debit || -split.credit) * 100}/100</split:quantity>
      </trn:split>`).join('')}
    </gnc:transaction>`).join('')}
  </gnc:book>
</gnc-v2>`;

    downloadFile(xmlContent, `family-accounts-${selectedMonth}.gnucash`, 'application/xml');
  };

  const downloadFile = (content, filename, contentType) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Report generation
  const getMonthlyReport = () => {
    const monthTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));
    const report = {
      income: 0,
      expenses: 0,
      assets: 0,
      liabilities: 0,
      netWorth: 0
    };

    accounts.forEach(account => {
      switch(account.type) {
        case 'Income':
          report.income += Math.abs(account.balance);
          break;
        case 'Expense':
          report.expenses += account.balance;
          break;
        case 'Asset':
          report.assets += account.balance;
          break;
        case 'Liability':
          report.liabilities += Math.abs(account.balance);
          break;
      }
    });

    report.netWorth = report.assets - report.liabilities;
    return report;
  };

  const getProfitLoss = () => {
    const income = accounts.filter(a => a.type === 'Income').reduce((sum, a) => sum + Math.abs(a.balance), 0);
    const expenses = accounts.filter(a => a.type === 'Expense').reduce((sum, a) => sum + a.balance, 0);
    return {
      income,
      expenses,
      netIncome: income - expenses
    };
  };

  const getBalanceSheet = () => {
    const assets = accounts.filter(a => a.type === 'Asset').reduce((sum, a) => sum + a.balance, 0);
    const liabilities = accounts.filter(a => a.type === 'Liability').reduce((sum, a) => sum + Math.abs(a.balance), 0);
    const equity = accounts.filter(a => a.type === 'Equity').reduce((sum, a) => sum + a.balance, 0);
    
    return {
      assets,
      liabilities,
      equity,
      totalEquity: assets - liabilities + equity
    };
  };

  // Filter and search functions
  const getFilteredTransactions = () => {
    return transactions.filter(t => {
      const matchesMonth = t.date.startsWith(selectedMonth);
      const matchesAccount = !filterAccount || t.splits.some(s => s.account === filterAccount);
      const matchesSearch = !searchTerm || 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.splits.some(s => s.account.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesMonth && matchesAccount && matchesSearch;
    });
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <div className="text-center mb-6">
            <Lock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Family GnuCash</h1>
            <p className="text-gray-600">Please sign in to continue</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Enter username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={loginForm.showPassword ? 'text' : 'password'}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg pr-10"
                  placeholder="Enter password"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setLoginForm({...loginForm, showPassword: !loginForm.showPassword})}
                  className="absolute right-3 top-2.5 text-gray-500"
                >
                  {loginForm.showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Sign In
            </button>
          </div>
          
          <div className="mt-6 text-sm text-gray-600">
            <p><strong>Demo Accounts:</strong></p>
            <p>Admin: admin / admin123</p>
            <p>User: spouse / spouse123</p>
            <p>Read-only: teen / teen123</p>
          </div>
        </div>
      </div>
    );
  }

  const report = getMonthlyReport();
  const profitLoss = getProfitLoss();
  const balanceSheet = getBalanceSheet();
  const filteredTransactions = getFilteredTransactions();

  const addSplit = () => {
    setNewTransaction({
      ...newTransaction,
      splits: [...newTransaction.splits, { account: '', debit: '', credit: '' }]
    });
  };

  const updateSplit = (index, field, value) => {
    const updatedSplits = [...newTransaction.splits];
    updatedSplits[index][field] = value;
    setNewTransaction({ ...newTransaction, splits: updatedSplits });
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Total Assets</p>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(report.assets)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Total Liabilities</p>
              <p className="text-2xl font-bold text-red-700">{formatCurrency(report.liabilities)}</p>
            </div>
            <CreditCard className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Net Worth</p>
              <p className="text-2xl font-bold text-blue-700">{formatCurrency(report.netWorth)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Monthly P&L</p>
              <p className="text-2xl font-bold text-orange-700">{formatCurrency(profitLoss.netIncome)}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Description</th>
                  <th className="text-right py-2">Amount</th>
                  <th className="text-center py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(-5).map(transaction => (
                  <tr key={transaction.id} className="border-b">
                    <td className="py-2">{formatDate(transaction.date)}</td>
                    <td className="py-2">{transaction.description}</td>
                    <td className="py-2 text-right">
                      {formatCurrency(transaction.splits[0].debit || transaction.splits[0].credit)}
                    </td>
                    <td className="py-2 text-center">
                      {transaction.reconciled ? 
                        <CheckSquare className="w-4 h-4 text-green-600 mx-auto" /> : 
                        <div className="w-4 h-4 border border-gray-400 rounded mx-auto"></div>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Budget vs Actual</h3>
          {budgets[0]?.accounts.map(item => (
            <div key={item.account} className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">{item.account}</span>
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  Budget: {formatCurrency(item.budgeted)}
                </div>
                <div className={`text-sm font-medium ${
                  item.variance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  Actual: {formatCurrency(item.actual)} ({item.variance >= 0 ? '+' : ''}{formatCurrency(item.variance)})
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAccounts = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Chart of Accounts</h2>
        {(currentUser?.role === 'admin' || currentUser?.role === 'user') && (
          <button
            onClick={() => setActiveView('add-account')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Account
          </button>
        )}
      </div>

      {accountTypes.map(type => (
        <div key={type} className="bg-white p-4 rounded-lg border">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            {getAccountIcon(type)}
            {type} Accounts
          </h3>
          <div className="space-y-2">
            {getAccountHierarchy().filter(account => account.type === type).map(account => (
              <div key={account.id}>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{account.name}</span>
                    <span className="text-sm text-gray-500">({account.code})</span>
                    {account.reconciled ? 
                      <CheckSquare className="w-4 h-4 text-green-600" /> : 
                      <div className="w-4 h-4 border border-gray-400 rounded"></div>
                    }
                  </div>
                  <span className={`font-semibold ${
                    account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(account.balance)}
                  </span>
                </div>
                {account.children?.map(child => (
                  <div key={child.id} className="flex justify-between items-center p-3 bg-gray-100 rounded ml-6 mt-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{child.name}</span>
                      <span className="text-sm text-gray-500">({child.code})</span>
                    </div>
                    <span className={`font-semibold ${
                      child.balance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(child.balance)}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderTransactions = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Transactions</h2>
        <div className="flex gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
          {(currentUser?.role === 'admin' || currentUser?.role === 'user') && (
            <button
              onClick={() => setActiveView('add-transaction')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Transaction
            </button>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <select
            value={filterAccount}
            onChange={(e) => setFilterAccount(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">All Accounts</option>
            {accounts.map(account => (
              <option key={account.id} value={account.name}>{account.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Description</th>
                <th className="text-left p-4">Account</th>
                <th className="text-right p-4">Debit</th>
                <th className="text-right p-4">Credit</th>
                <th className="text-center p-4">Reconciled</th>
                {(currentUser?.role === 'admin' || currentUser?.role === 'user') && (
                  <th className="text-center p-4">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.flatMap(transaction => 
                transaction.splits.map((split, index) => (
                  <tr key={`${transaction.id}-${index}`} className="border-b">
                    <td className="p-4">{formatDate(transaction.date)}</td>
                    <td className="p-4">{transaction.description}</td>
                    <td className="p-4">{split.account}</td>
                    <td className="p-4 text-right">{split.debit ? formatCurrency(split.debit) : ''}</td>
                    <td className="p-4 text-right">{split.credit ? formatCurrency(split.credit) : ''}</td>
                    <td className="p-4 text-center">
                      {transaction.reconciled ? 
                        <CheckSquare className="w-4 h-4 text-green-600 mx-auto" /> : 
                        <div className="w-4 h-4 border border-gray-400 rounded mx-auto"></div>
                      }
                    </td>
                    {(currentUser?.role === 'admin' || currentUser?.role === 'user') && index === 0 && (
                      <td className="p-4 text-center">
                        <button
                          onClick={() => toggleReconciled(transaction.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {transaction.reconciled ? 'Unreconcile' : 'Reconcile'}
                        </button>
                      </td>
                    )}
                    {(currentUser?.role === 'admin' || currentUser?.role === 'user') && index > 0 && (
                      <td className="p-4"></td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Financial Reports</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-semibold text-lg mb-4">Profit & Loss Statement</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium text-green-600">Total Income</span>
              <span className="font-semibold text-green-600">{formatCurrency(profitLoss.income)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium text-red-600">Total Expenses</span>
              <span className="font-semibold text-red-600">{formatCurrency(profitLoss.expenses)}</span>
            </div>
            <div className="flex justify-between py-2 border-b-2 border-gray-300">
              <span className="font-bold">Net Income</span>
              <span className={`font-bold ${profitLoss.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(profitLoss.netIncome)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-semibold text-lg mb-4">Balance Sheet</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium">Total Assets</span>
              <span className="font-semibold">{formatCurrency(balanceSheet.assets)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium">Total Liabilities</span>
              <span className="font-semibold">{formatCurrency(balanceSheet.liabilities)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium">Equity</span>
              <span className="font-semibold">{formatCurrency(balanceSheet.equity)}</span>
            </div>
            <div className="flex justify-between py-2 border-b-2 border-gray-300">
              <span className="font-bold">Total Equity</span>
              <span className="font-bold">{formatCurrency(balanceSheet.totalEquity)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border">
        <h3 className="font-semibold text-lg mb-4">Account Balances by Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accountTypes.map(type => (
            <div key={type} className="space-y-2">
              <h4 className="font-medium text-gray-700 flex items-center gap-2">
                {getAccountIcon(type)}
                {type} Accounts
              </h4>
              {accounts.filter(a => a.type === type).map(account => (
                <div key={account.id} className="flex justify-between text-sm">
                  <span>{account.name}</span>
                  <span className={account.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(account.balance)}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBudgets = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Budget Management</h2>
        {(currentUser?.role === 'admin' || currentUser?.role === 'user') && (
          <button
            onClick={() => setActiveView('add-budget')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Create Budget
          </button>
        )}
      </div>

      {budgets.map(budget => (
        <div key={budget.id} className="bg-white p-6 rounded-lg border">
          <h3 className="font-semibold text-lg mb-4">{budget.name}</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Account</th>
                  <th className="text-right py-2">Budgeted</th>
                  <th className="text-right py-2">Actual</th>
                  <th className="text-right py-2">Variance</th>
                  <th className="text-right py-2">% of Budget</th>
                </tr>
              </thead>
              <tbody>
                {budget.accounts.map(item => (
                  <tr key={item.account} className="border-b">
                    <td className="py-2 font-medium">{item.account}</td>
                    <td className="py-2 text-right">{formatCurrency(item.budgeted)}</td>
                    <td className="py-2 text-right">{formatCurrency(item.actual)}</td>
                    <td className={`py-2 text-right font-medium ${
                      item.variance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.variance >= 0 ? '+' : ''}{formatCurrency(item.variance)}
                    </td>
                    <td className="py-2 text-right">
                      {((item.actual / item.budgeted) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAddTransaction = () => (
    <div className="max-w-2xl">
      <h2 className="text-xl font-semibold mb-6">Add New Transaction</h2>
      
      <div className="bg-white p-6 rounded-lg border space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <input
              type="date"
              value={newTransaction.date}
              onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <input
              type="text"
              value={newTransaction.description}
              onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Transaction description"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Splits</h3>
            <button
              onClick={addSplit}
              className="text-blue-600 text-sm flex items-center gap-1 hover:text-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Split
            </button>
          </div>
          
          {newTransaction.splits.map((split, index) => (
            <div key={index} className="grid grid-cols-4 gap-2 mb-2">
              <select
                value={split.account}
                onChange={(e) => updateSplit(index, 'account', e.target.value)}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="">Select Account</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.name}>{account.name}</option>
                ))}
              </select>
              <input
                type="number"
                step="0.01"
                value={split.debit}
                onChange={(e) => updateSplit(index, 'debit', e.target.value)}
                placeholder="Debit"
                className="px-3 py-2 border rounded-lg"
              />
              <input
                type="number"
                step="0.01"
                value={split.credit}
                onChange={(e) => updateSplit(index, 'credit', e.target.value)}
                placeholder="Credit"
                className="px-3 py-2 border rounded-lg"
              />
              <div className="text-sm text-gray-500 py-2">
                {split.debit && split.credit ? 'Error: Both debit and credit' : ''}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={addTransaction}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Transaction
          </button>
          <button
            onClick={() => setActiveView('transactions')}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const renderAddAccount = () => (
    <div className="max-w-lg">
      <h2 className="text-xl font-semibold mb-6">Add New Account</h2>
      
      <div className="bg-white p-6 rounded-lg border space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Account Name</label>
          <input
            type="text"
            value={newAccount.name}
            onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Account name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Account Type</label>
          <select
            value={newAccount.type}
            onChange={(e) => setNewAccount({...newAccount, type: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
          >
            {accountTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Parent Account</label>
          <select
            value={newAccount.parent || ''}
            onChange={(e) => setNewAccount({...newAccount, parent: e.target.value ? parseInt(e.target.value) : null})}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">None (Top Level)</option>
            {accounts.filter(a => a.type === newAccount.type).map(account => (
              <option key={account.id} value={account.id}>{account.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Account Code</label>
          <input
            type="text"
            value={newAccount.code}
            onChange={(e) => setNewAccount({...newAccount, code: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Optional account code"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={addAccount}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Create Account
          </button>
          <button
            onClick={() => setActiveView('accounts')}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const renderImportExport = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Import & Export</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Data
          </h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700">
              Import from CSV
            </button>
            <button className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700">
              Import from OFX
            </button>
            <button className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700">
              Import from QIF
            </button>
            <button className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700">
              Import from GnuCash XML
            </button>
            <p className="text-sm text-gray-600">
              Supported formats: CSV, OFX, QIF, and GnuCash XML files
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Data
          </h3>
          <div className="space-y-3">
            <button 
              onClick={exportToCSV}
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
            >
              Export to CSV
            </button>
            <button 
              onClick={exportToOFX}
              className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700"
            >
              Export to OFX
            </button>
            <button 
              onClick={exportToQIF}
              className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700"
            >
              Export to QIF
            </button>
            <button 
              onClick={exportToGnuCashXML}
              className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700"
            >
              Export to GnuCash XML
            </button>
            <p className="text-sm text-gray-600">
              Export your data for backup or use in other accounting software
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Google Drive Integration
        </h3>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-medium">Status: <span className={`${
              gdriveStatus === 'connected' ? 'text-green-600' : 
              gdriveStatus === 'connecting' || gdriveStatus === 'syncing' ? 'text-yellow-600' : 
              'text-gray-600'
            }`}>
              {gdriveStatus === 'connected' ? 'Connected' : 
               gdriveStatus === 'connecting' ? 'Connecting...' :
               gdriveStatus === 'syncing' ? 'Syncing...' : 'Disconnected'}
            </span></p>
            {lastSync && (
              <p className="text-sm text-gray-600">
                Last sync: {formatDate(lastSync)}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex gap-3">
          {gdriveStatus === 'disconnected' && (
            <button
              onClick={connectGoogleDrive}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Connect to Google Drive
            </button>
          )}
          
          {gdriveStatus === 'connected' && (
            <>
              <button
                onClick={syncToGoogleDrive}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Backup to Drive
              </button>
              <button
                onClick={restoreFromGoogleDrive}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Restore from Drive
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderReconciliation = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Account Reconciliation</h2>
      
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="font-semibold mb-4">Reconciliation Status</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Account</th>
                <th className="text-right py-2">Balance</th>
                <th className="text-center py-2">Status</th>
                <th className="text-left py-2">Last Reconciled</th>
                <th className="text-center py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.filter(a => a.type === 'Asset' || a.type === 'Liability').map(account => (
                <tr key={account.id} className="border-b">
                  <td className="py-2 font-medium">{account.name}</td>
                  <td className="py-2 text-right">{formatCurrency(account.balance)}</td>
                  <td className="py-2 text-center">
                    {account.reconciled ? 
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">Reconciled</span> :
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">Needs Reconciliation</span>
                    }
                  </td>
                  <td className="py-2">{account.lastReconciled ? formatDate(account.lastReconciled) : 'Never'}</td>
                  <td className="py-2 text-center">
                    {(currentUser?.role === 'admin' || currentUser?.role === 'user') && (
                      <button className="text-blue-600 hover:text-blue-700">
                        Reconcile
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border">
        <h3 className="font-semibold mb-4">Unreconciled Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Description</th>
                <th className="text-left py-2">Account</th>
                <th className="text-right py-2">Amount</th>
                <th className="text-center py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.filter(t => !t.reconciled).map(transaction => 
                transaction.splits.map((split, index) => (
                  <tr key={`${transaction.id}-${index}`} className="border-b">
                    <td className="py-2">{formatDate(transaction.date)}</td>
                    <td className="py-2">{transaction.description}</td>
                    <td className="py-2">{split.account}</td>
                    <td className="py-2 text-right">
                      {split.debit ? `+${formatCurrency(split.debit)}` : `-${formatCurrency(split.credit)}`}
                    </td>
                    <td className="py-2 text-center">
                      {(currentUser?.role === 'admin' || currentUser?.role === 'user') && index === 0 && (
                        <button
                          onClick={() => toggleReconciled(transaction.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          Mark Reconciled
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-gray-900">Family GnuCash</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {currentUser?.name}</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{currentUser?.role}</span>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          <nav className="w-64 bg-white rounded-lg border p-4">
            <ul className="space-y-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: Home },
                { id: 'accounts', label: 'Accounts', icon: Wallet },
                { id: 'transactions', label: 'Transactions', icon: CreditCard },
                { id: 'budgets', label: 'Budgets', icon: Target },
                { id: 'reports', label: 'Reports', icon: BarChart3 },
                { id: 'reconciliation', label: 'Reconciliation', icon: CheckSquare },
                { id: 'import-export', label: 'Import/Export', icon: Upload },
              ].map(item => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveView(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 ${
                      activeView === item.id 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <main className="flex-1">
            {activeView === 'dashboard' && renderDashboard()}
            {activeView === 'accounts' && renderAccounts()}
            {activeView === 'transactions' && renderTransactions()}
            {activeView === 'budgets' && renderBudgets()}
            {activeView === 'reports' && renderReports()}
            {activeView === 'reconciliation' && renderReconciliation()}
            {activeView === 'add-transaction' && renderAddTransaction()}
            {activeView === 'add-account' && renderAddAccount()}
            {activeView === 'import-export' && renderImportExport()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default FamilyGnuCash;