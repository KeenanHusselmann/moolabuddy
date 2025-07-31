
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
      date,
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <Card className="p-6 w-full max-w-md relative" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-4">Edit Transaction</h2>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <form onSubmit={handleSubmit} className="space-y-4">
           <div>
              <label htmlFor="edit-date" className="block text-sm font-medium text-gray-300">Date</label>
              <input type="date" id="edit-date" value={date} onChange={e => setDate(e.target.value)}
                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-500 focus:border-brand-500" />
            </div>
          <div>
              <label htmlFor="edit-description" className="block text-sm font-medium text-gray-300">Description</label>
              <input type="text" id="edit-description" value={description} onChange={e => setDescription(e.target.value)}
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
              <label className="block text-sm font-medium text-gray-300">Type</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`w-1/2 rounded-l-md px-4 py-2 text-sm font-medium transition-colors ${type === TransactionType.EXPENSE ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Expense</button>
                <button type="button" onClick={() => setType(TransactionType.INCOME)} className={`w-1/2 rounded-r-md px-4 py-2 text-sm font-medium transition-colors ${type === TransactionType.INCOME ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Income</button>
              </div>
            </div>
            <button type="submit" className="w-full bg-brand-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-brand-700 transition-colors">Save Changes</button>
        </form>
      </Card>
    </div>
  )
}

const Transactions: React.FC<TransactionsProps> = ({ transactions, addTransaction, updateTransaction, deleteTransaction }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState(TransactionType.EXPENSE);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const { showToast } = useToast();

  const sortedTransactions = useMemo(() => {
    // Filter out shopping list and receipt transactions
    const filteredTransactions = transactions.filter(transaction => 
      !transaction.description.includes('(Shopping List:') && 
      !transaction.description.includes('(Receipt:')
    );
    return [...filteredTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

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
  };

  const handleUpdate = (updatedTransaction: Transaction) => {
    updateTransaction(updatedTransaction);
    setEditingTransaction(null);
  };
  
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Info Card */}
      <Card className="p-6 bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30">
        <h2 className="text-xl font-bold text-white mb-3">Manual Transactions</h2>
        <p className="text-gray-300 text-sm leading-relaxed">
          Add your personal income and expenses here. Manual transactions only - shopping lists and receipts 
          are tracked separately. Use the form below to record your daily financial activities.
        </p>
      </Card>

      {/* Add Transaction Form */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <span className="mr-2">Add New Transaction</span>
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
            <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-300">Amount</label>
            <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} step="0.01"
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300">Category</label>
            <input type="text" id="category" value={category} onChange={e => setCategory(e.target.value)}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`w-1/2 rounded-l-md px-4 py-2 text-sm font-medium transition-colors ${type === TransactionType.EXPENSE ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Expense</button>
            <button type="button" onClick={() => setType(TransactionType.INCOME)} className={`w-1/2 rounded-r-md px-4 py-2 text-sm font-medium transition-colors ${type === TransactionType.INCOME ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Income</button>
          </div>
          <button type="submit" className="w-full md:col-span-4 py-2 px-4 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors mt-2">Add Transaction</button>
        </form>
      </Card>

      {/* Transactions List - Responsive */}
      <div className="block md:hidden space-y-4">
        {sortedTransactions.length > 0 ? sortedTransactions.map(t => (
          <Card key={t.id} className={`p-4 flex flex-col gap-2 shadow-lg border-l-4 ${t.type === TransactionType.INCOME ? 'border-green-500' : 'border-red-500'}`}>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-lg text-white">{t.description}</span>
              <span className={`font-bold text-lg ${t.type === TransactionType.INCOME ? 'text-green-400' : 'text-red-400'}`}>{t.type === TransactionType.INCOME ? '+' : '-'}N${t.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>{t.category}</span>
              <span>{new Date(t.date).toLocaleDateString()}</span>
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={() => setEditingTransaction(t)} className="text-blue-400 hover:text-blue-300 px-2 py-1 rounded bg-blue-900/30">Edit</button>
              <button onClick={() => deleteTransaction(t.id)} className="text-red-400 hover:text-red-300 px-2 py-1 rounded bg-red-900/30">Delete</button>
            </div>
          </Card>
        )) : (
          <Card className="p-6 text-center text-gray-500">No transactions recorded.</Card>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Card className="p-6 overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
                  <tr>
                    <th className="p-3 text-sm font-semibold text-gray-300">Date</th>
                    <th className="p-3 text-sm font-semibold text-gray-300">Description</th>
                    <th className="p-3 text-sm font-semibold text-gray-300">Category</th>
                    <th className="p-3 text-sm font-semibold text-gray-300 text-right">Amount</th>
                    <th className="p-3 text-sm font-semibold text-gray-300 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
              {sortedTransactions.length > 0 ? sortedTransactions.map(t => (
                <tr key={t.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                      <td className="p-3 text-sm text-gray-400 whitespace-nowrap">{new Date(t.date).toLocaleDateString()}</td>
                      <td className="p-3 text-sm text-white">{t.description}</td>
                      <td className="p-3 text-sm text-gray-300">{t.category}</td>
                  <td className={`p-3 text-sm font-semibold text-right whitespace-nowrap ${t.type === TransactionType.INCOME ? 'text-green-400' : 'text-red-400'}`}>{t.type === TransactionType.INCOME ? '+' : '-'}N${t.amount.toFixed(2)}</td>
                      <td className="p-3 text-center">
                          <div className="flex justify-center items-center gap-2">
                      <button onClick={() => setEditingTransaction(t)} className="text-blue-400 hover:text-blue-300 p-1 rounded bg-blue-900/30">Edit</button>
                      <button onClick={() => deleteTransaction(t.id)} className="text-red-400 hover:text-red-300 p-1 rounded bg-red-900/30">Delete</button>
                          </div>
                      </td>
                    </tr>
              )) : (
                <tr><td colSpan={5} className="text-center text-gray-500 py-4">No transactions recorded.</td></tr>
              )}
                </tbody>
              </table>
          </Card>
      </div>

      {/* Edit Modal (if needed) */}
      <EditTransactionModal 
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSave={handleUpdate}
      />
    </div>
  );
};

export default Transactions;
