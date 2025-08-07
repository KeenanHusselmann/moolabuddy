import React, { useState, useMemo, useEffect } from 'react';
import Card from './Card';
import type { Transaction } from '../types';
import { TransactionType } from '../types';
import { useToast } from './ToastContext';

interface TransactionsProps {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
}

const EditTransactionModal: React.FC<{
  transaction: Transaction | null;
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
}> = ({ transaction, onClose, onSave }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    if (transaction) {
      setDescription(transaction.description);
      setAmount(String(transaction.amount));
      setType(transaction.type);
      setCategory(transaction.category);
      setDate(transaction.date);
    }
  }, [transaction]);

  if (!transaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category || !date) {
      showToast('Please fill all fields.', 'error');
      return;
    }
    onSave({
      ...transaction,
      description,
      amount: parseFloat(amount),
      type,
      category,
      date
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-white mb-4">Edit Transaction</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-300">Description</label>
            <input type="text" id="edit-description" value={description} onChange={e => setDescription(e.target.value)}
              placeholder="e.g., Salary, Groceries"
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-500 focus:border-brand-500" />
          </div>
          <div>
            <label htmlFor="edit-amount" className="block text-sm font-medium text-gray-300">Amount</label>
            <input type="number" id="edit-amount" value={amount} onChange={e => setAmount(e.target.value)} step="0.01"
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-500 focus:border-brand-500" />
          </div>
          <div>
            <label htmlFor="edit-category" className="block text-sm font-medium text-gray-300">Category</label>
            <input type="text" id="edit-category" value={category} onChange={e => setCategory(e.target.value)}
              placeholder="e.g., Food, Salary"
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-500 focus:border-brand-500" />
          </div>
          <div>
            <label htmlFor="edit-date" className="block text-sm font-medium text-gray-300">Date</label>
            <input type="date" id="edit-date" value={date} onChange={e => setDate(e.target.value)}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-500 focus:border-brand-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Type</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`w-1/2 rounded-l-md px-4 py-2 text-sm font-medium transition-colors ${type === TransactionType.EXPENSE ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Expense</button>
              <button type="button" onClick={() => setType(TransactionType.INCOME)} className={`w-1/2 rounded-r-md px-4 py-2 text-sm font-medium transition-colors ${type === TransactionType.INCOME ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Income</button>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} className="flex-1 py-1.5 sm:py-2 px-3 sm:px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base">Cancel</button>
            <button type="submit" className="flex-1 py-1.5 sm:py-2 px-3 sm:px-4 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm sm:text-base">Save</button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const Transactions: React.FC<TransactionsProps> = ({ transactions, addTransaction, updateTransaction, deleteTransaction }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState(TransactionType.EXPENSE);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const { showToast } = useToast();

  // Enhanced state for search and filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'description'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Get unique categories for filter dropdown
  const availableCategories = useMemo(() => {
    const categories = [...new Set(transactions.map(t => t.category))];
    return categories.sort();
  }, [transactions]);

  // Enhanced transaction filtering and sorting
  const filteredAndSortedTransactions = useMemo(() => {
    // Filter out shopping list and receipt transactions
    let filteredTransactions = transactions.filter(transaction => 
      !transaction.description.includes('(Shopping List:') && 
      !transaction.description.includes('(Receipt:')
    );

    // Apply search filter
    if (searchTerm) {
      filteredTransactions = filteredTransactions.filter(t =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filteredTransactions = filteredTransactions.filter(t =>
        t.type === (filterType === 'income' ? TransactionType.INCOME : TransactionType.EXPENSE)
      );
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      filteredTransactions = filteredTransactions.filter(t =>
        t.category === filterCategory
      );
    }

    // Apply date range filter
    if (dateRange.start) {
      filteredTransactions = filteredTransactions.filter(t =>
        new Date(t.date) >= new Date(dateRange.start)
      );
    }
    if (dateRange.end) {
      filteredTransactions = filteredTransactions.filter(t =>
        new Date(t.date) <= new Date(dateRange.end)
      );
    }

    // Sort transactions
    return filteredTransactions.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'description':
          comparison = a.description.localeCompare(b.description);
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [transactions, searchTerm, filterType, filterCategory, sortBy, sortOrder, dateRange]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const filtered = filteredAndSortedTransactions;
    const income = filtered.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
    const expenses = filtered.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);
    const netAmount = income - expenses;
    
    // Category breakdown
    const categoryBreakdown: Record<string, { income: number; expenses: number; net: number }> = {};
    filtered.forEach(t => {
      if (!categoryBreakdown[t.category]) {
        categoryBreakdown[t.category] = { income: 0, expenses: 0, net: 0 };
      }
      if (t.type === TransactionType.INCOME) {
        categoryBreakdown[t.category].income += t.amount;
      } else {
        categoryBreakdown[t.category].expenses += t.amount;
      }
      categoryBreakdown[t.category].net = categoryBreakdown[t.category].income - categoryBreakdown[t.category].expenses;
    });

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netAmount,
      transactionCount: filtered.length,
      averageTransaction: filtered.length > 0 ? (income + expenses) / filtered.length : 0,
      categoryBreakdown
    };
  }, [filteredAndSortedTransactions]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterCategory('all');
    setDateRange({ start: '', end: '' });
    setSortBy('date');
    setSortOrder('desc');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category) {
      showToast('Please fill in all fields.', 'error');
      return;
    }
    addTransaction({ description, amount: parseFloat(amount), type, category });
    setDescription('');
    setAmount('');
    setCategory('');
    setType(TransactionType.EXPENSE);
    showToast('Transaction added successfully!', 'success');
  };

  const handleUpdate = (updatedTransaction: Transaction) => {
    updateTransaction(updatedTransaction);
    setEditingTransaction(null);
    showToast('Transaction updated successfully!', 'success');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(id);
      showToast('Transaction deleted successfully!', 'success');
    }
  };
  
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Info Card */}
      <Card className="p-6 bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30">
        <h2 className="text-xl font-bold text-white mb-3">Smart Transaction Management</h2>
        <p className="text-gray-300 text-sm leading-relaxed">
          Comprehensive transaction tracking with advanced search, filtering, and analytics. Monitor your income and expenses 
          with powerful tools to understand your spending patterns and financial health.
        </p>
      </Card>

      {/* Analytics Summary */}
      {showAnalytics && (
        <Card className="p-6 bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-500/30">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Transaction Analytics</h3>
            <button
              onClick={() => setShowAnalytics(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">N${analytics.totalIncome.toFixed(2)}</div>
              <div className="text-sm text-gray-400">Total Income</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">N${analytics.totalExpenses.toFixed(2)}</div>
              <div className="text-sm text-gray-400">Total Expenses</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${analytics.netAmount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                N${analytics.netAmount.toFixed(2)}
              </div>
              <div className="text-sm text-gray-400">Net Amount</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-400">{analytics.transactionCount}</div>
              <div className="text-sm text-gray-400">Transactions</div>
            </div>
          </div>

          {/* Category Breakdown */}
          {Object.keys(analytics.categoryBreakdown).length > 0 && (
            <div className="mb-4">
              <h4 className="text-md font-medium text-white mb-3">Category Breakdown</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(analytics.categoryBreakdown)
                  .sort(([,a], [,b]) => Math.abs(b.net) - Math.abs(a.net))
                  .slice(0, 6)
                  .map(([category, data]) => (
                    <div key={category} className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                      <div className="font-medium text-white text-sm mb-1">{category}</div>
                      <div className="text-xs text-green-400">Income: +N${data.income.toFixed(2)}</div>
                      <div className="text-xs text-red-400">Expenses: -N${data.expenses.toFixed(2)}</div>
                      <div className={`text-xs font-medium ${data.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        Net: N${data.net.toFixed(2)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Enhanced Search and Filter Controls */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Transaction Management</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm"
            >
              {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Search and Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search description or category..."
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            >
              <option value="all">All Categories</option>
              {availableCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Sort By</label>
            <div className="flex gap-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'description')}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-md py-2 px-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="description">Description</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-2 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">From Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">To Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="text-sm text-gray-300">
            Showing <span className="font-semibold text-white">{filteredAndSortedTransactions.length}</span> of{' '}
            <span className="font-semibold text-white">
              {transactions.filter(t => 
                !t.description.includes('(Shopping List:') && !t.description.includes('(Receipt:')
              ).length}
            </span> transactions
            {(searchTerm || filterType !== 'all' || filterCategory !== 'all' || dateRange.start || dateRange.end) && (
              <span className="text-brand-400 font-medium"> (filtered)</span>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction List */}
        <div className="lg:col-span-2">
          <Card className="p-4">
            <h2 className="text-xl font-bold text-white mb-4">Transaction List</h2>
            <div className="overflow-y-auto overflow-x-auto max-h-[70vh]">
              {/* Mobile View */}
              <div className="lg:hidden space-y-3">
                {filteredAndSortedTransactions.length > 0 ? filteredAndSortedTransactions.map(t => (
                  <Card key={t.id} className={`p-4 flex flex-col gap-2 shadow-lg border-l-4 ${t.type === TransactionType.INCOME ? 'border-green-500' : 'border-red-500'}`}>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg text-white">{t.description}</span>
                      <span className={`font-bold text-lg ${t.type === TransactionType.INCOME ? 'text-green-400' : 'text-red-400'}`}>
                        {t.type === TransactionType.INCOME ? '+' : '-'}N${t.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span>{t.category}</span>
                      <span>{new Date(t.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button 
                        onClick={() => setEditingTransaction(t)} 
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(t.id)} 
                        className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </Card>
                )) : (
                  <div className="text-center text-gray-500 py-8">
                    No transactions found matching your criteria.
                  </div>
                )}
              </div>

              {/* Desktop View */}
              <div className="hidden lg:block">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="sticky top-0 bg-gray-800 z-10">
                    <tr>
                      <th className="p-3 text-sm font-semibold text-gray-300">Date</th>
                      <th className="p-3 text-sm font-semibold text-gray-300">Description</th>
                      <th className="p-3 text-sm font-semibold text-gray-300">Category</th>
                      <th className="p-3 text-sm font-semibold text-gray-300 text-right">Amount</th>
                      <th className="p-3 text-sm font-semibold text-gray-300 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedTransactions.length > 0 ? filteredAndSortedTransactions.map(t => (
                      <tr key={t.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                        <td className="p-3 text-sm text-gray-400 whitespace-nowrap">{new Date(t.date).toLocaleDateString()}</td>
                        <td className="p-3 text-sm text-white">{t.description}</td>
                        <td className="p-3 text-sm text-gray-300">{t.category}</td>
                        <td className={`p-3 text-sm font-semibold text-right whitespace-nowrap ${t.type === TransactionType.INCOME ? 'text-green-400' : 'text-red-400'}`}>
                          {t.type === TransactionType.INCOME ? '+' : '-'}N${t.amount.toFixed(2)}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex justify-center items-center gap-2">
                            <button 
                              onClick={() => setEditingTransaction(t)} 
                              className="text-blue-400 hover:text-blue-300 p-1 rounded bg-blue-900/30 hover:bg-blue-800/40 transition-colors"
                              aria-label={`Edit transaction ${t.description}`}
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(t.id)} 
                              className="text-red-400 hover:text-red-300 p-1 rounded bg-red-900/30 hover:bg-red-800/40 transition-colors"
                              aria-label={`Delete transaction ${t.description}`}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="text-center text-gray-500 py-8">
                          No transactions found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>

        {/* Add Transaction Form */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Add New Transaction</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <input 
                  type="text" 
                  id="description" 
                  value={description} 
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g., Salary, Groceries"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">Amount (N$)</label>
                <input 
                  type="number" 
                  id="amount" 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                  step="0.01"
                  placeholder="0.00"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                <input 
                  type="text" 
                  id="category" 
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                  placeholder="e.g., Food, Salary, Transport"
                  list="category-suggestions"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <datalist id="category-suggestions">
                  {availableCategories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                <div className="flex rounded-md shadow-sm">
                  <button 
                    type="button" 
                    onClick={() => setType(TransactionType.EXPENSE)} 
                    className={`w-1/2 rounded-l-md px-4 py-2 text-sm font-medium transition-colors ${
                      type === TransactionType.EXPENSE 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Expense
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setType(TransactionType.INCOME)} 
                    className={`w-1/2 rounded-r-md px-4 py-2 text-sm font-medium transition-colors ${
                      type === TransactionType.INCOME 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-brand-600 text-white py-1.5 sm:py-2 px-3 sm:px-4 rounded-md hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors font-medium text-sm sm:text-base"
              >
                Add Transaction
              </button>
            </form>

            {/* Quick Tips */}
            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium text-white mb-2">💡 Quick Tips</h3>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Use consistent category names for better analytics</li>
                <li>• Shopping lists and receipts are tracked separately</li>
                <li>• Use the search and filter tools to find transactions</li>
                <li>• Enable analytics to see spending patterns</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Transaction Modal */}
      <EditTransactionModal 
        transaction={editingTransaction}
        onClose={() => setEditingTransaction(null)}
        onSave={handleUpdate}
      />
    </div>
  );
};

export default Transactions;
