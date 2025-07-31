import React, { useState, useMemo } from 'react';
import Card from './Card';

export interface Store {
  id: string;
  name: string;
  category: string;
  address: string;
  phone: string;
  website: string;
  totalSpent: number;
  visitCount: number;
  lastVisit: string;
  notes: string;
  createdAt: string;
}

interface StoresProps {
  stores: Store[];
  setStores: React.Dispatch<React.SetStateAction<Store[]>>;
  transactions: any[];
}

const StoresComponent: React.FC<StoresProps> = ({
  stores,
  setStores,
  transactions
}) => {
  const [activeView, setActiveView] = useState<'list' | 'add' | 'edit'>('list');
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [newStore, setNewStore] = useState({
    name: '',
    category: '',
    address: '',
    phone: '',
    website: '',
    notes: ''
  });

  const categories = [
    'Groceries', 'Electronics', 'Clothing', 'Home & Garden', 
    'Entertainment', 'Transportation', 'Healthcare', 'Education',
    'Personal Care', 'Sports & Fitness', 'Books & Media', 'Dining',
    'Utilities', 'Insurance', 'Other'
  ];

  const totalSpent = stores.reduce((sum, store) => sum + store.totalSpent, 0);
  const totalVisits = stores.reduce((sum, store) => sum + store.visitCount, 0);

  const createNewStore = () => {
    if (!newStore.name.trim()) return;
    
    const store: Store = {
      id: crypto.randomUUID(),
      name: newStore.name,
      category: newStore.category || 'Other',
      address: newStore.address,
      phone: newStore.phone,
      website: newStore.website,
      totalSpent: 0,
      visitCount: 0,
      lastVisit: '',
      notes: newStore.notes,
      createdAt: new Date().toISOString()
    };
    
    setStores(prev => [store, ...prev]);
    setNewStore({
      name: '',
      category: '',
      address: '',
      phone: '',
      website: '',
      notes: ''
    });
    setActiveView('list');
  };

  const updateStore = () => {
    if (!editingStore || !editingStore.name.trim()) return;
    
    setStores(prev => prev.map(store => 
      store.id === editingStore.id ? editingStore : store
    ));
    setEditingStore(null);
    setActiveView('list');
  };

  const deleteStore = (id: string) => {
    setStores(prev => prev.filter(store => store.id !== id));
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Groceries': 'from-green-400/20 to-green-600/20 border-green-500/30',
      'Electronics': 'from-blue-400/20 to-blue-600/20 border-blue-500/30',
      'Clothing': 'from-purple-400/20 to-purple-600/20 border-purple-500/30',
      'Home & Garden': 'from-yellow-400/20 to-yellow-600/20 border-yellow-500/30',
      'Entertainment': 'from-pink-400/20 to-pink-600/20 border-pink-500/30',
      'Transportation': 'from-orange-400/20 to-orange-600/20 border-orange-500/30',
      'Healthcare': 'from-red-400/20 to-red-600/20 border-red-500/30',
      'Education': 'from-indigo-400/20 to-indigo-600/20 border-indigo-500/30',
      'Personal Care': 'from-teal-400/20 to-teal-600/20 border-teal-500/30',
      'Sports & Fitness': 'from-cyan-400/20 to-cyan-600/20 border-cyan-500/30',
      'Books & Media': 'from-emerald-400/20 to-emerald-600/20 border-emerald-500/30',
      'Dining': 'from-amber-400/20 to-amber-600/20 border-amber-500/30',
      'Utilities': 'from-slate-400/20 to-slate-600/20 border-slate-500/30',
      'Insurance': 'from-violet-400/20 to-violet-600/20 border-violet-500/30',
      'Other': 'from-gray-400/20 to-gray-600/20 border-gray-500/30'
    };
    return colors[category as keyof typeof colors] || colors['Other'];
  };

  if (activeView === 'add') {
    return (
      <div className="max-w-4xl mx-auto p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Add New Store</h2>
          <button
            onClick={() => setActiveView('list')}
            className="text-brand-300 hover:text-white transition-colors text-sm sm:text-base"
          >
            ← Back to Stores
          </button>
        </div>

        <Card className="bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30 p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  Store Name *
                </label>
                <input
                  type="text"
                  value={newStore.name}
                  onChange={(e) => setNewStore(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Store name..."
                  className="w-full p-2.5 sm:p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  Category
                </label>
                <select
                  value={newStore.category}
                  onChange={(e) => setNewStore(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2.5 sm:p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm sm:text-base"
                >
                  <option value="">Select category...</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Address
              </label>
              <input
                type="text"
                value={newStore.address}
                onChange={(e) => setNewStore(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Store address..."
                className="w-full p-2.5 sm:p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm sm:text-base"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={newStore.phone}
                  onChange={(e) => setNewStore(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Phone number..."
                  className="w-full p-2.5 sm:p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={newStore.website}
                  onChange={(e) => setNewStore(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="Website URL..."
                  className="w-full p-2.5 sm:p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm sm:text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Notes
              </label>
              <textarea
                value={newStore.notes}
                onChange={(e) => setNewStore(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes..."
                rows={3}
                className="w-full p-2.5 sm:p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm sm:text-base resize-none"
              />
            </div>

            <button
              onClick={createNewStore}
              disabled={!newStore.name.trim()}
              className="w-full bg-gradient-to-r from-brand-500 to-purple-600 text-white py-2.5 sm:py-3 px-6 rounded-lg font-medium hover:from-brand-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              Add Store
            </button>
          </div>
        </Card>
      </div>
    );
  }

  if (activeView === 'edit' && editingStore) {
    return (
      <div className="max-w-4xl mx-auto p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Edit Store</h2>
          <button
            onClick={() => {
              setActiveView('list');
              setEditingStore(null);
            }}
            className="text-brand-300 hover:text-white transition-colors text-sm sm:text-base"
          >
            ← Back to Stores
          </button>
        </div>

        <Card className="bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30 p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  Store Name *
                </label>
                <input
                  type="text"
                  value={editingStore.name}
                  onChange={(e) => setEditingStore(prev => prev ? { ...prev, name: e.target.value } : null)}
                  placeholder="Store name..."
                  className="w-full p-2.5 sm:p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  Category
                </label>
                <select
                  value={editingStore.category}
                  onChange={(e) => setEditingStore(prev => prev ? { ...prev, category: e.target.value } : null)}
                  className="w-full p-2.5 sm:p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm sm:text-base"
                >
                  <option value="">Select category...</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Address
              </label>
              <input
                type="text"
                value={editingStore.address}
                onChange={(e) => setEditingStore(prev => prev ? { ...prev, address: e.target.value } : null)}
                placeholder="Store address..."
                className="w-full p-2.5 sm:p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm sm:text-base"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={editingStore.phone}
                  onChange={(e) => setEditingStore(prev => prev ? { ...prev, phone: e.target.value } : null)}
                  placeholder="Phone number..."
                  className="w-full p-2.5 sm:p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={editingStore.website}
                  onChange={(e) => setEditingStore(prev => prev ? { ...prev, website: e.target.value } : null)}
                  placeholder="Website URL..."
                  className="w-full p-2.5 sm:p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm sm:text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Notes
              </label>
              <textarea
                value={editingStore.notes}
                onChange={(e) => setEditingStore(prev => prev ? { ...prev, notes: e.target.value } : null)}
                placeholder="Additional notes..."
                rows={3}
                className="w-full p-2.5 sm:p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm sm:text-base resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={updateStore}
                disabled={!editingStore.name.trim()}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 sm:py-3 px-6 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                Update Store
              </button>
              <button
                onClick={() => {
                  setActiveView('list');
                  setEditingStore(null);
                }}
                className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-2.5 sm:py-3 px-6 rounded-lg font-medium hover:from-gray-600 hover:to-gray-700 transition-all duration-300 text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Stores</h1>
        <button
          onClick={() => setActiveView('add')}
          className="w-full sm:w-auto bg-gradient-to-r from-brand-500 to-purple-600 text-white py-2.5 sm:py-3 px-6 rounded-lg font-medium hover:from-brand-600 hover:to-purple-700 transition-all duration-300 text-sm sm:text-base"
        >
          + Add Store
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <Card className="p-4 bg-gradient-to-br from-blue-400/20 to-blue-600/20 border border-blue-500/30">
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-blue-400 break-words overflow-hidden">
              {stores.length}
            </p>
            <p className="text-sm sm:text-base text-gray-300">Total Stores</p>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-400/20 to-green-600/20 border border-green-500/30">
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-green-400 break-words overflow-hidden">
              N$ {totalSpent.toFixed(2)}
            </p>
            <p className="text-sm sm:text-base text-gray-300">Total Spent</p>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-400/20 to-purple-600/20 border border-purple-500/30">
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-purple-400 break-words overflow-hidden">
              {totalVisits}
            </p>
            <p className="text-sm sm:text-base text-gray-300">Total Visits</p>
          </div>
        </Card>
      </div>

      {/* Stores List */}
      <div className="space-y-3 sm:space-y-4">
        {stores.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-400 text-lg">No stores added yet.</p>
            <p className="text-gray-500 text-sm mt-2">Add your favorite stores to track your spending!</p>
          </Card>
        ) : (
          stores.map(store => (
            <Card key={store.id} className={`bg-gradient-to-br ${getCategoryColor(store.category)} p-3 sm:p-4`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg sm:text-xl font-semibold text-white break-words overflow-hidden">
                      {store.name}
                    </h3>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        onClick={() => {
                          setEditingStore(store);
                          setActiveView('edit');
                        }}
                        className="text-blue-400 hover:text-blue-300 transition-colors text-xs sm:text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteStore(store.id)}
                        className="text-red-400 hover:text-red-300 transition-colors text-xs sm:text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs sm:text-sm">Category: <span className="text-white">{store.category}</span></p>
                      {store.address && (
                        <p className="text-gray-400 text-xs sm:text-sm">Address: <span className="text-white break-words overflow-hidden">{store.address}</span></p>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs sm:text-sm">Total Spent: <span className="text-green-400 font-medium">N$ {store.totalSpent.toFixed(2)}</span></p>
                      <p className="text-gray-400 text-xs sm:text-sm">Visits: <span className="text-white">{store.visitCount}</span></p>
                    </div>
                  </div>
                  
                  {(store.phone || store.website) && (
                    <div className="mt-2 text-xs sm:text-sm">
                      {store.phone && (
                        <p className="text-gray-400">Phone: <span className="text-white">{store.phone}</span></p>
                      )}
                      {store.website && (
                        <p className="text-gray-400">Website: <span className="text-blue-400 hover:text-blue-300 cursor-pointer">{store.website}</span></p>
                      )}
                    </div>
                  )}
                  
                  {store.notes && (
                    <div className="mt-2">
                      <p className="text-gray-400 text-xs sm:text-sm">Notes: <span className="text-white break-words overflow-hidden">{store.notes}</span></p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default StoresComponent; 