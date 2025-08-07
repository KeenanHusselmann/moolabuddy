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
  rating?: number;
  favorite?: boolean;
  tags?: string[];
}

interface StoresProps {
  stores: Store[];
  setStores: React.Dispatch<React.SetStateAction<Store[]>>;
  transactions: any[];
}

const CATEGORY_ICONS = {
  'Groceries': '🛒',
  'Electronics': '📱',
  'Clothing': '👕',
  'Home & Garden': '🏠',
  'Entertainment': '🎭',
  'Transportation': '🚗',
  'Healthcare': '⚕️',
  'Education': '📚',
  'Personal Care': '💄',
  'Sports & Fitness': '⚽',
  'Books & Media': '📖',
  'Dining': '🍽️',
  'Utilities': '⚡',
  'Insurance': '🛡️',
  'Other': '📦'
};

const StarRating: React.FC<{ rating: number; onRate?: (rating: number) => void; readonly?: boolean }> = ({ 
  rating, 
  onRate, 
  readonly = false 
}) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => !readonly && onRate && onRate(star)}
          disabled={readonly}
          className={`text-lg transition-colors ${
            star <= rating 
              ? 'text-yellow-400' 
              : 'text-gray-600'
          } ${!readonly ? 'hover:text-yellow-300 cursor-pointer' : 'cursor-default'}`}
        >
          ⭐
        </button>
      ))}
    </div>
  );
};

const StoreCard: React.FC<{ 
  store: Store; 
  onEdit: () => void; 
  onDelete: () => void; 
  onToggleFavorite: () => void;
  onRate: (rating: number) => void;
  getCategoryColor: (category: string) => string;
}> = ({ store, onEdit, onDelete, onToggleFavorite, onRate, getCategoryColor }) => {
  return (
    <Card className={`bg-gradient-to-br ${getCategoryColor(store.category)} p-4 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300`}>
      {/* Background animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Favorite badge */}
      {store.favorite && (
        <div className="absolute top-4 right-4 bg-yellow-500/20 rounded-full p-2 border border-yellow-500/30">
          <span className="text-yellow-400 text-sm">❤️</span>
        </div>
      )}
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-2xl">
              {CATEGORY_ICONS[store.category as keyof typeof CATEGORY_ICONS] || '📦'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-yellow-300 transition-colors">
                {store.name}
              </h3>
              <p className="text-sm text-gray-300">{store.category}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={onToggleFavorite}
              className={`p-2 rounded-full transition-all duration-200 ${
                store.favorite 
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                  : 'bg-gray-700/50 text-gray-400 hover:bg-yellow-500/20 hover:text-yellow-400'
              }`}
              title={store.favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
              </svg>
            </button>
            <button
              onClick={onEdit}
              className="p-2 bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500/30 transition-all duration-200 border border-blue-500/30"
              title="Edit store"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={onDelete}
              className="p-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30 transition-all duration-200 border border-red-500/30"
              title="Delete store"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Rating */}
        <div className="mb-4">
          <StarRating 
            rating={store.rating || 0} 
            onRate={onRate}
          />
        </div>

        {/* Store Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-400">N${store.totalSpent.toFixed(2)}</div>
            <div className="text-sm text-gray-300">Total Spent</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-400">{store.visitCount}</div>
            <div className="text-sm text-gray-300">Visits</div>
          </div>
        </div>

        {/* Store Details */}
        <div className="space-y-2 text-sm">
          {store.address && (
            <div className="flex items-center gap-2 text-gray-300">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{store.address}</span>
            </div>
          )}
          
          {store.phone && (
            <div className="flex items-center gap-2 text-gray-300">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{store.phone}</span>
            </div>
          )}
          
          {store.website && (
            <div className="flex items-center gap-2 text-blue-400 hover:text-blue-300 cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <a href={store.website} target="_blank" rel="noopener noreferrer" className="truncate">
                {store.website}
              </a>
            </div>
          )}
          
          {store.lastVisit && (
            <div className="flex items-center gap-2 text-gray-300">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Last visit: {new Date(store.lastVisit).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {store.tags && store.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {store.tags.map((tag, index) => (
              <span 
                key={index} 
                className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded-full border border-white/20"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {store.notes && (
          <div className="mt-4 p-3 bg-white/5 rounded-lg">
            <p className="text-sm text-gray-300">{store.notes}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

const StoresComponent: React.FC<StoresProps> = ({
  stores,
  setStores,
  transactions
}) => {
  const [activeView, setActiveView] = useState<'list' | 'add' | 'edit'>('list');
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'spent' | 'visits' | 'rating' | 'recent'>('name');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [newStore, setNewStore] = useState({
    name: '',
    category: '',
    address: '',
    phone: '',
    website: '',
    notes: '',
    rating: 0,
    tags: [] as string[]
  });

  const categories = [
    'Groceries', 'Electronics', 'Clothing', 'Home & Garden', 
    'Entertainment', 'Transportation', 'Healthcare', 'Education',
    'Personal Care', 'Sports & Fitness', 'Books & Media', 'Dining',
    'Utilities', 'Insurance', 'Other'
  ];

  const filteredAndSortedStores = useMemo(() => {
    let filtered = stores.filter(store => {
      const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           store.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           store.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || store.category === filterCategory;
      const matchesFavorites = !showFavoritesOnly || store.favorite;
      
      return matchesSearch && matchesCategory && matchesFavorites;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'spent':
          return b.totalSpent - a.totalSpent;
        case 'visits':
          return b.visitCount - a.visitCount;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'recent':
          return new Date(b.lastVisit || b.createdAt).getTime() - new Date(a.lastVisit || a.createdAt).getTime();
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [stores, searchTerm, filterCategory, showFavoritesOnly, sortBy]);

  const stats = useMemo(() => {
    const totalSpent = stores.reduce((sum, store) => sum + store.totalSpent, 0);
    const totalVisits = stores.reduce((sum, store) => sum + store.visitCount, 0);
    const favoriteStores = stores.filter(store => store.favorite).length;
    const avgRating = stores.length > 0 
      ? stores.reduce((sum, store) => sum + (store.rating || 0), 0) / stores.length 
      : 0;
    const topCategory = stores.length > 0 
      ? Object.entries(
          stores.reduce((acc, store) => {
            acc[store.category] = (acc[store.category] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'
      : 'None';

    return {
      totalSpent,
      totalVisits,
      favoriteStores,
      avgRating,
      topCategory,
      totalStores: stores.length
    };
  }, [stores]);

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
      createdAt: new Date().toISOString(),
      rating: newStore.rating,
      favorite: false,
      tags: newStore.tags
    };
    
    setStores(prev => [store, ...prev]);
    setNewStore({
      name: '',
      category: '',
      address: '',
      phone: '',
      website: '',
      notes: '',
      rating: 0,
      tags: []
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

  const toggleFavorite = (id: string) => {
    setStores(prev => prev.map(store => 
      store.id === id ? { ...store, favorite: !store.favorite } : store
    ));
  };

  const rateStore = (id: string, rating: number) => {
    setStores(prev => prev.map(store => 
      store.id === id ? { ...store, rating } : store
    ));
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
              Add New Store
            </h2>
            <button
              onClick={() => setActiveView('list')}
              className="text-blue-300 hover:text-white transition-colors flex items-center gap-2 mx-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Stores
            </button>
          </div>

          <Card className="bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30 p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Store Name *
                  </label>
                  <input
                    type="text"
                    value={newStore.name}
                    onChange={(e) => setNewStore(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter store name..."
                    className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={newStore.category}
                    onChange={(e) => setNewStore(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="">Select category...</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]} {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rating
                </label>
                <StarRating 
                  rating={newStore.rating} 
                  onRate={(rating) => setNewStore(prev => ({ ...prev, rating }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={newStore.address}
                  onChange={(e) => setNewStore(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Store address..."
                  className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={newStore.phone}
                    onChange={(e) => setNewStore(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Phone number..."
                    className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={newStore.website}
                    onChange={(e) => setNewStore(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="Website URL..."
                    className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={newStore.notes}
                  onChange={(e) => setNewStore(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes..."
                  rows={3}
                  className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>

              <button
                onClick={createNewStore}
                disabled={!newStore.name.trim()}
                className="w-full bg-gradient-to-r from-brand-500 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-brand-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
              >
                Add Store
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (activeView === 'edit' && editingStore) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
              Edit Store
            </h2>
            <button
              onClick={() => {
                setActiveView('list');
                setEditingStore(null);
              }}
              className="text-blue-300 hover:text-white transition-colors flex items-center gap-2 mx-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Stores
            </button>
          </div>

          <Card className="bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30 p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Store Name *
                  </label>
                  <input
                    type="text"
                    value={editingStore.name}
                    onChange={(e) => setEditingStore(prev => prev ? { ...prev, name: e.target.value } : null)}
                    placeholder="Store name..."
                    className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={editingStore.category}
                    onChange={(e) => setEditingStore(prev => prev ? { ...prev, category: e.target.value } : null)}
                    className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="">Select category...</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]} {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rating
                </label>
                <StarRating 
                  rating={editingStore.rating || 0} 
                  onRate={(rating) => setEditingStore(prev => prev ? { ...prev, rating } : null)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={editingStore.address}
                  onChange={(e) => setEditingStore(prev => prev ? { ...prev, address: e.target.value } : null)}
                  placeholder="Store address..."
                  className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editingStore.phone}
                    onChange={(e) => setEditingStore(prev => prev ? { ...prev, phone: e.target.value } : null)}
                    placeholder="Phone number..."
                    className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={editingStore.website}
                    onChange={(e) => setEditingStore(prev => prev ? { ...prev, website: e.target.value } : null)}
                    placeholder="Website URL..."
                    className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={editingStore.notes}
                  onChange={(e) => setEditingStore(prev => prev ? { ...prev, notes: e.target.value } : null)}
                  placeholder="Additional notes..."
                  rows={3}
                  className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={updateStore}
                  disabled={!editingStore.name.trim()}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                >
                  Update Store
                </button>
                <button
                  onClick={() => {
                    setActiveView('list');
                    setEditingStore(null);
                  }}
                  className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 px-6 rounded-xl font-medium hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
              My Stores
            </h1>
            <div className="absolute -inset-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-lg blur opacity-30 animate-pulse"></div>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Track your favorite stores, manage ratings, and monitor your spending patterns
          </p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 hover:scale-105 transition-all duration-300">
            <div className="text-center">
              <div className="text-2xl mb-2">🏪</div>
              <p className="text-2xl font-bold text-blue-400">{stats.totalStores}</p>
              <p className="text-sm text-gray-300">Total Stores</p>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 hover:scale-105 transition-all duration-300">
            <div className="text-center">
              <div className="text-2xl mb-2">💰</div>
              <p className="text-2xl font-bold text-green-400">N${stats.totalSpent.toFixed(0)}</p>
              <p className="text-sm text-gray-300">Total Spent</p>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 hover:scale-105 transition-all duration-300">
            <div className="text-center">
              <div className="text-2xl mb-2">👥</div>
              <p className="text-2xl font-bold text-purple-400">{stats.totalVisits}</p>
              <p className="text-sm text-gray-300">Total Visits</p>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 hover:scale-105 transition-all duration-300">
            <div className="text-center">
              <div className="text-2xl mb-2">❤️</div>
              <p className="text-2xl font-bold text-yellow-400">{stats.favoriteStores}</p>
              <p className="text-sm text-gray-300">Favorites</p>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 hover:scale-105 transition-all duration-300">
            <div className="text-center">
              <div className="text-2xl mb-2">⭐</div>
              <p className="text-2xl font-bold text-orange-400">{stats.avgRating.toFixed(1)}</p>
              <p className="text-sm text-gray-300">Avg Rating</p>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-pink-500/20 to-pink-600/20 border border-pink-500/30 hover:scale-105 transition-all duration-300">
            <div className="text-center">
              <div className="text-2xl mb-2">{CATEGORY_ICONS[stats.topCategory as keyof typeof CATEGORY_ICONS] || '📦'}</div>
              <p className="text-xl font-bold text-pink-400">{stats.topCategory}</p>
              <p className="text-sm text-gray-300">Top Category</p>
            </div>
          </Card>
        </div>

        {/* Enhanced Controls */}
        <Card className="p-6 mb-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-600/50">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-center flex-1">
              {/* Search */}
              <div className="relative flex-1 min-w-0">
                <input
                  type="text"
                  placeholder="Search stores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 pl-10 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Filters */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="p-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]} {category}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="p-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="name">Sort by Name</option>
                <option value="spent">Sort by Spent</option>
                <option value="visits">Sort by Visits</option>
                <option value="rating">Sort by Rating</option>
                <option value="recent">Sort by Recent</option>
              </select>
            </div>

            <div className="flex gap-2 items-center">
              {/* Favorites Toggle */}
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  showFavoritesOnly 
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                    : 'bg-gray-700/50 text-gray-400 hover:bg-yellow-500/20 hover:text-yellow-400'
                }`}
                title="Show favorites only"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
                </svg>
              </button>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-700/50 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'grid' ? 'bg-brand-500 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'list' ? 'bg-brand-500 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>

              {/* Add Store Button */}
              <button
                onClick={() => setActiveView('add')}
                className="bg-gradient-to-r from-brand-500 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-brand-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Store
              </button>
            </div>
          </div>
        </Card>

        {/* Stores Display */}
        {filteredAndSortedStores.length === 0 ? (
          <Card className="p-12 text-center bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-600/50">
            <div className="text-6xl mb-4">🏪</div>
            <p className="text-gray-400 text-xl mb-2">
              {stores.length === 0 ? 'No stores added yet' : 'No stores match your filters'}
            </p>
            <p className="text-gray-500 mb-6">
              {stores.length === 0 
                ? 'Add your favorite stores to start tracking your spending!' 
                : 'Try adjusting your search or filters'
              }
            </p>
            {stores.length === 0 && (
              <button
                onClick={() => setActiveView('add')}
                className="bg-gradient-to-r from-brand-500 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-brand-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
              >
                Add Your First Store
              </button>
            )}
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
            : 'space-y-4'
          }>
            {filteredAndSortedStores.map(store => (
              <StoreCard
                key={store.id}
                store={store}
                onEdit={() => {
                  setEditingStore(store);
                  setActiveView('edit');
                }}
                onDelete={() => deleteStore(store.id)}
                onToggleFavorite={() => toggleFavorite(store.id)}
                onRate={(rating) => rateStore(store.id, rating)}
                getCategoryColor={getCategoryColor}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoresComponent;
