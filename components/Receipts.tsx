import React, { useState, useRef } from 'react';
import Card from './Card';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export interface Receipt {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  imageUrl: string;
  store: string;
}

interface ReceiptsProps {
  receipts: Receipt[];
  setReceipts: React.Dispatch<React.SetStateAction<Receipt[]>>;
  addTransaction: (transaction: any) => void;
  goBack?: () => void;
  stores?: any[];
  setStores?: React.Dispatch<React.SetStateAction<any[]>>;
}

const ReceiptsComponent: React.FC<ReceiptsProps> = ({
  receipts,
  setReceipts,
  addTransaction,
  goBack,
  stores = [],
  setStores
}) => {
  const [activeView, setActiveView] = useState<'list' | 'add'>('list');
  const [newReceipt, setNewReceipt] = useState({
    amount: '',
    category: '',
    description: '',
    store: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const categories = [
    'Groceries', 'Electronics', 'Clothing', 'Home & Garden', 
    'Entertainment', 'Transportation', 'Healthcare', 'Education',
    'Personal Care', 'Sports & Fitness', 'Books & Media', 'Dining',
    'Utilities', 'Insurance', 'Other'
  ];

  const totalAmount = receipts.reduce((sum, receipt) => sum + receipt.amount, 0);

  const startCamera = async () => {
    try {
      // Use Capacitor Camera plugin for native camera access
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      if (image.dataUrl) {
        setCapturedImage(image.dataUrl);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      
      // Fallback to gallery if camera fails
      console.log('Camera access failed, opening gallery as fallback');
      setTimeout(() => {
        openGallery();
      }, 500);
    }
  };

  const openGallery = async () => {
    try {
      // Use Capacitor Camera plugin to open gallery
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      });

      if (image.dataUrl) {
        setCapturedImage(image.dataUrl);
      }
    } catch (error) {
      console.error('Error accessing gallery:', error);
    }
  };



  const saveReceipt = () => {
    if (!capturedImage || !newReceipt.amount || !newReceipt.description) {
      alert('Please fill in all required fields and capture/upload an image');
      return;
    }

    const amount = parseFloat(newReceipt.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const receipt: Receipt = {
      id: crypto.randomUUID(),
      amount: amount,
      category: newReceipt.category || 'Other',
      description: newReceipt.description,
      date: newReceipt.date,
      imageUrl: capturedImage,
      store: newReceipt.store
    };

    setReceipts(prev => [receipt, ...prev]);
    
    // Also add as transaction
    addTransaction({
      description: `${newReceipt.description} (Receipt: ${newReceipt.store})`,
      amount: amount,
      type: 'expense',
      category: newReceipt.category || 'Other',
      date: newReceipt.date
    });

    // Update store spending if store name is provided
    if (newReceipt.store && setStores) {
      const existingStore = stores.find(store => 
        store.name.toLowerCase() === newReceipt.store.toLowerCase()
      );
      
      if (existingStore) {
        setStores(prev => prev.map(store => 
          store.id === existingStore.id 
            ? { 
                ...store, 
                totalSpent: store.totalSpent + amount,
                visitCount: store.visitCount + 1,
                lastVisit: new Date().toISOString()
              }
            : store
        ));
      }
    }

    // Show success notification
    alert(`✅ Receipt saved successfully!\n\n💰 Amount: N$ ${amount.toFixed(2)}\n🏪 Store: ${newReceipt.store || 'Not specified'}\n📝 Description: ${newReceipt.description}`);

    // Reset form
    setNewReceipt({
      amount: '',
      category: '',
      description: '',
      store: '',
      date: new Date().toISOString().split('T')[0]
    });
    setCapturedImage(null);
    setActiveView('list');
  };

  const deleteReceipt = (id: string) => {
    setReceipts(prev => prev.filter(receipt => receipt.id !== id));
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
          <h2 className="text-xl sm:text-2xl font-bold text-white">Add Receipt</h2>
          <button
            onClick={() => {
              if (goBack) {
                goBack();
              } else {
                setActiveView('list');
                setCapturedImage(null);
              }
            }}
            className="text-brand-300 hover:text-white transition-colors text-sm sm:text-base"
          >
            ← Back to Receipts
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Camera/Image Section */}
          <Card className="bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Capture Receipt *</h3>
            
            {!capturedImage ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mb-3">
                  <p className="text-xs text-orange-300 text-center">
                    📸 Required: Please capture or select a receipt image
                  </p>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={startCamera}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm sm:text-base"
                  >
                    📷 Open Camera
                  </button>
                  <div className="text-center text-gray-400 text-xs sm:text-sm">or</div>
                  <button
                    onClick={openGallery}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-300 text-sm sm:text-base"
                  >
                    📁 Choose from Gallery
                  </button>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <p className="text-xs text-blue-300 text-center">
                      💡 Tip: Camera will open the native camera app. Gallery will let you choose existing photos.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <img
                  src={capturedImage}
                  alt="Captured receipt"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  onClick={() => setCapturedImage(null)}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300"
                >
                  🔄 Retake Photo
                </button>
              </div>
            )}
          </Card>

          {/* Form Section */}
          <Card className="bg-gradient-to-br from-green-400/20 to-blue-600/20 border border-green-500/30 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Receipt Details</h3>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  Amount *
                </label>
                <input
                  type="number"
                  value={newReceipt.amount}
                  onChange={(e) => setNewReceipt(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full p-2.5 sm:p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  Description *
                </label>
                <input
                  type="text"
                  value={newReceipt.description}
                  onChange={(e) => setNewReceipt(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What did you buy?"
                  className="w-full p-2.5 sm:p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  Store
                </label>
                <input
                  type="text"
                  value={newReceipt.store}
                  onChange={(e) => setNewReceipt(prev => ({ ...prev, store: e.target.value }))}
                  placeholder="Store name"
                  className="w-full p-2.5 sm:p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  Category
                </label>
                <select
                  value={newReceipt.category}
                  onChange={(e) => setNewReceipt(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2.5 sm:p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm sm:text-base"
                >
                  <option value="">Select category...</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={newReceipt.date}
                  onChange={(e) => setNewReceipt(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full p-2.5 sm:p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm sm:text-base"
                />
              </div>

              {!capturedImage && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-3">
                  <p className="text-xs text-yellow-300 text-center">
                    ⚠️ Please capture or select a receipt image first
                  </p>
                </div>
              )}
              <button
                onClick={saveReceipt}
                disabled={!capturedImage || !newReceipt.amount || !newReceipt.description}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 sm:py-3 px-6 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                💾 Save Receipt
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Receipts</h2>
        <p className="text-gray-400">Capture and organize your receipts</p>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setActiveView('add')}
          className="w-full bg-gradient-to-r from-brand-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-brand-600 hover:to-purple-700 transition-all duration-300"
        >
          📷 Add Receipt
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        <Card className="bg-gradient-to-br from-blue-400/20 to-blue-600/20 border border-blue-500/30 p-4">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-2">Total Receipts</h3>
          <p className="text-xl sm:text-2xl font-bold text-blue-400 break-words overflow-hidden">{receipts.length}</p>
        </Card>
        <Card className="bg-gradient-to-br from-green-400/20 to-green-600/20 border border-green-500/30 p-4">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-2">Total Amount</h3>
          <p className="text-lg sm:text-xl font-bold text-green-400 break-words overflow-hidden">N$ {totalAmount.toFixed(2)}</p>
        </Card>
        <Card className="bg-gradient-to-br from-purple-400/20 to-purple-600/20 border border-purple-500/30 p-4">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-2">This Month</h3>
          <p className="text-lg sm:text-xl font-bold text-purple-400 break-words overflow-hidden">
            N$ {receipts
              .filter(r => new Date(r.date).getMonth() === new Date().getMonth())
              .reduce((sum, r) => sum + r.amount, 0)
              .toFixed(2)}
          </p>
        </Card>
      </div>

      <div className="space-y-4">
        {receipts.length === 0 ? (
          <Card className="bg-gradient-to-br from-gray-400/20 to-gray-600/20 border border-gray-500/30 text-center py-12">
            <div className="text-6xl mb-4">🧾</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Receipts Yet</h3>
            <p className="text-gray-400 mb-4">Start capturing your receipts to track your expenses</p>
            <button
              onClick={() => setActiveView('add')}
              className="bg-gradient-to-r from-brand-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-brand-600 hover:to-purple-700 transition-all duration-300"
            >
              📷 Add First Receipt
            </button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {receipts.map(receipt => (
              <Card key={receipt.id} className={`bg-gradient-to-br ${getCategoryColor(receipt.category)} p-4`}>
                <div className="space-y-3">
                  <img
                    src={receipt.imageUrl}
                    alt="Receipt"
                    className="w-full h-24 sm:h-32 object-cover rounded-lg"
                  />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-white truncate text-sm sm:text-base">{receipt.description}</h3>
                    {receipt.store && (
                      <p className="text-xs sm:text-sm text-gray-400 truncate">{receipt.store}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-base sm:text-lg font-bold text-green-400">
                        N$ {receipt.amount.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(receipt.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded truncate">
                        {receipt.category}
                      </span>
                      <button
                        onClick={() => deleteReceipt(receipt.id)}
                        className="text-red-400 hover:text-red-300 transition-colors text-xs sm:text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptsComponent; 