import React, { useState, useEffect } from 'react';
import type { Transaction } from '../types';
import { TransactionType } from '../types';
import Card from './Card';

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
      alert('Please fill all fields.');
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
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [category, setCategory] = useState('');
  
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const sortedTransactions = [...transactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category) {
      alert('Please fill all fields.');
      return;
    }
    addTransaction({
      description,
      amount: parseFloat(amount),
      type,
      category
    });
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
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-4">
            <h2 className="text-xl font-bold text-white mb-4">All Transactions</h2>
            <div className="overflow-y-auto overflow-x-auto max-h-[70vh]">
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
                  {sortedTransactions.map(t => (
                    <tr key={t.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                      <td className="p-3 text-sm text-gray-400 whitespace-nowrap">{new Date(t.date).toLocaleDateString()}</td>
                      <td className="p-3 text-sm text-white">{t.description}</td>
                      <td className="p-3 text-sm text-gray-300">{t.category}</td>
                      <td className={`p-3 text-sm font-semibold text-right whitespace-nowrap ${t.type === TransactionType.INCOME ? 'text-green-400' : 'text-red-400'}`}>
                        {t.type === TransactionType.INCOME ? '+' : '-'}N${t.amount.toFixed(2)}
                      </td>
                      <td className="p-3 text-center">
                          <div className="flex justify-center items-center gap-2">
                              <button onClick={() => setEditingTransaction(t)} className="text-blue-400 hover:text-blue-300 p-1" aria-label={`Edit transaction ${t.description}`}>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 0 0-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 0 0 0-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 0 1 2-2h4a1 1 0 0 1 0 2H4v10h10v-4a1 1 0 1 1 2 0v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z" clipRule="evenodd" /></svg>
                              </button>
                              <button onClick={() => deleteTransaction(t.id)} className="text-red-400 hover:text-red-300 p-1" aria-label={`Delete transaction ${t.description}`}>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" /></svg>
                              </button>
                          </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
        <div>
          <Card className="p-4">
            <h2 className="text-xl font-bold text-white mb-4">Add Transaction</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
                <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)}
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-500 focus:border-brand-500" />
              </div>
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-300">Amount</label>
                <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} step="0.01"
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-500 focus:border-brand-500" />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-300">Category</label>
                <input type="text" id="category" value={category} onChange={e => setCategory(e.target.value)}
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
              <button type="submit" className="w-full bg-brand-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-brand-700 transition-colors">Add Transaction</button>
            </form>
          </Card>
        </div>
      </div>
      <EditTransactionModal 
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSave={handleUpdate}
      />
    </>
  );
};

export default Transactions;