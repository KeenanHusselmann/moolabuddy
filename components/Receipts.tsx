import React, { useState, useMemo } from 'react';
import Card from './Card';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useToast } from './ToastContext';

// Enhanced receipt interface
export interface Receipt {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  imageUrl: string;
  store: string;
  tags?: string[];
  paymentMethod?: 'cash' | 'card' | 'mobile' | 'other';
  taxAmount?: number;
  isBusinessExpense?: boolean;
  notes?: string;
  location?: string;
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
  const { showToast } = useToast();
  
  // Enhanced state management
  const [activeView, setActiveView] = useState<'dashboard' | 'analytics' | 'add' | 'detail'>('dashboard');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  
  // Form state
  const [newReceipt, setNewReceipt] = useState({
    amount: '',
    category: '',
    description: '',
    store: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'card' as 'cash' | 'card' | 'mobile' | 'other',
    taxAmount: '',
    isBusinessExpense: false,
    notes: '',
    location: '',
    tags: '' // comma-separated tags
  });
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  // Enhanced filtering and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'store' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showBusinessOnly, setShowBusinessOnly] = useState(false);

  const categories = [
    'Groceries', 'Electronics', 'Clothing', 'Home & Garden', 
    'Entertainment', 'Transportation', 'Healthcare', 'Education',
    'Personal Care', 'Sports & Fitness', 'Books & Media', 'Dining',
    'Utilities', 'Insurance', 'Other'
  ];

  // Enhanced analytics calculations
  const analytics = useMemo(() => {
    const totalAmount = receipts.reduce((sum, receipt) => sum + receipt.amount, 0);
    const totalTax = receipts.reduce((sum, receipt) => sum + (receipt.taxAmount || 0), 0);
    const businessExpenses = receipts.filter(r => r.isBusinessExpense).reduce((sum, r) => sum + r.amount, 0);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const thisMonth = receipts
      .filter(r => {
        const date = new Date(r.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, r) => sum + r.amount, 0);
    
    const lastMonthAmount = receipts
      .filter(r => {
        const date = new Date(r.date);
        return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
      })
      .reduce((sum, r) => sum + r.amount, 0);
    
    const monthlyGrowth = lastMonthAmount === 0 ? 0 : ((thisMonth - lastMonthAmount) / lastMonthAmount) * 100;
    
    // Category breakdown
    const categoryBreakdown = categories.map(category => {
      const categoryReceipts = receipts.filter(r => r.category === category);
      const total = categoryReceipts.reduce((sum, r) => sum + r.amount, 0);
      const count = categoryReceipts.length;
      const percentage = totalAmount === 0 ? 0 : (total / totalAmount) * 100;
      
      return {
        category,
        total,
        count,
        percentage,
        averageAmount: count === 0 ? 0 : total / count
      };
    }).filter(item => item.total > 0).sort((a, b) => b.total - a.total);
    
    // Store analysis
    const storeBreakdown = receipts.reduce((acc, receipt) => {
      if (!receipt.store) return acc;
      
      if (!acc[receipt.store]) {
        acc[receipt.store] = { total: 0, count: 0, receipts: [] };
      }
      
      acc[receipt.store].total += receipt.amount;
      acc[receipt.store].count += 1;
      acc[receipt.store].receipts.push(receipt);
      
      return acc;
    }, {} as Record<string, { total: number; count: number; receipts: Receipt[] }>);
    
    const topStores = Object.entries(storeBreakdown)
      .map(([store, data]) => ({
        store,
        total: data.total,
        count: data.count,
        averageAmount: data.total / data.count,
        percentage: totalAmount === 0 ? 0 : (data.total / totalAmount) * 100
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
    
    // Payment method analysis
    const paymentMethods = receipts.reduce((acc, receipt) => {
      const method = receipt.paymentMethod || 'other';
      acc[method] = (acc[method] || 0) + receipt.amount;
      return acc;
    }, {} as Record<string, number>);
    
    // Weekly spending trend
    const weeklySpending = Array.from({ length: 12 }, (_, i) => {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const weekTotal = receipts
        .filter(r => {
          const receiptDate = new Date(r.date);
          return receiptDate >= weekStart && receiptDate <= weekEnd;
        })
        .reduce((sum, r) => sum + r.amount, 0);
      
      return {
        week: `Week ${12 - i}`,
        total: weekTotal,
        average: weekTotal / 7
      };
    }).reverse();
    
    return {
      totalAmount,
      totalTax,
      businessExpenses,
      thisMonth,
      lastMonthAmount,
      monthlyGrowth,
      categoryBreakdown,
      topStores,
      paymentMethods,
      weeklySpending,
      averageReceiptAmount: receipts.length === 0 ? 0 : totalAmount / receipts.length,
      receiptCount: receipts.length
    };
  }, [receipts, categories]);

  // Enhanced OCR functionality
  const extractTextFromImage = async (imageDataUrl: string): Promise<{ 
    amount?: number; 
    store?: string; 
    taxAmount?: number;
    date?: string;
    items?: string[];
  }> => {
    try {
      // Simulate OCR processing with better detection
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate more sophisticated OCR results
      const mockResults = [
        { amount: 25.99, store: 'FreshMart', taxAmount: 3.12, items: ['Bread', 'Milk', 'Eggs'] },
        { amount: 89.50, store: 'TechWorld', taxAmount: 10.74, items: ['USB Cable', 'Mouse Pad'] },
        { amount: 45.75, store: 'Fashion Plaza', taxAmount: 5.49, items: ['T-Shirt', 'Socks'] },
        { amount: 15.20, store: 'Coffee Corner', taxAmount: 1.82, items: ['Latte', 'Sandwich'] }
      ];
      
      // Return a random result for demonstration
      const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
      
      return {
        amount: randomResult.amount,
        store: randomResult.store,
        taxAmount: randomResult.taxAmount,
        date: new Date().toISOString().split('T')[0],
        items: randomResult.items
      };
    } catch (error) {
      console.error('Error extracting text from image:', error);
      return {};
    }
  };

  // Enhanced filtering logic
  const filteredAndSortedReceipts = useMemo(() => {
    let filtered = receipts;

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(receipt =>
        receipt.description.toLowerCase().includes(search) ||
        receipt.store.toLowerCase().includes(search) ||
        receipt.category.toLowerCase().includes(search) ||
        (receipt.notes && receipt.notes.toLowerCase().includes(search)) ||
        (receipt.tags && receipt.tags.some(tag => tag.toLowerCase().includes(search)))
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(receipt => receipt.category === filterCategory);
    }

    // Payment method filter
    if (filterPaymentMethod !== 'all') {
      filtered = filtered.filter(receipt => receipt.paymentMethod === filterPaymentMethod);
    }

    // Business expense filter
    if (showBusinessOnly) {
      filtered = filtered.filter(receipt => receipt.isBusinessExpense);
    }

    // Date range filter
    if (filterDateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();

      switch (filterDateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(receipt => new Date(receipt.date) >= startDate);
    }

    // Sort
    return filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'store':
          comparison = a.store.localeCompare(b.store);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [receipts, searchTerm, filterCategory, filterPaymentMethod, filterDateRange, showBusinessOnly, sortBy, sortOrder]);

  const processCapturedImage = async (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
    
    showToast('Processing receipt image...', 'info');
    
    try {
      const extractedData = await extractTextFromImage(imageDataUrl);
      
      if (extractedData.amount) {
        setNewReceipt(prev => ({ ...prev, amount: extractedData.amount!.toString() }));
        showToast(`Amount detected: N$${extractedData.amount.toFixed(2)}`, 'success');
      }
      
      if (extractedData.store) {
        setNewReceipt(prev => ({ ...prev, store: extractedData.store! }));
        showToast(`Store detected: ${extractedData.store}`, 'success');
      }
      
      if (extractedData.taxAmount) {
        setNewReceipt(prev => ({ ...prev, taxAmount: extractedData.taxAmount!.toString() }));
        showToast(`Tax amount detected: N$${extractedData.taxAmount.toFixed(2)}`, 'info');
      }
      
      if (extractedData.date) {
        setNewReceipt(prev => ({ ...prev, date: extractedData.date! }));
      }
      
      if (!extractedData.amount && !extractedData.store) {
        showToast('Could not extract data from image. Please enter manually.', 'warning');
      }
    } catch (error) {
      console.error('Error processing image:', error);
      showToast('Error processing image. Please enter data manually.', 'error');
    }
  };

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
        await processCapturedImage(image.dataUrl);
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
        await processCapturedImage(image.dataUrl);
      }
    } catch (error) {
      console.error('Error accessing gallery:', error);
    }
  };



  const saveReceipt = () => {
    if (!capturedImage || !newReceipt.amount || !newReceipt.description) {
      showToast('Please fill in all required fields and capture/upload an image', 'error');
      return;
    }

    const amount = parseFloat(newReceipt.amount);
    const taxAmount = newReceipt.taxAmount ? parseFloat(newReceipt.taxAmount) : undefined;
    
    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    if (taxAmount && (isNaN(taxAmount) || taxAmount < 0)) {
      showToast('Please enter a valid tax amount', 'error');
      return;
    }

    const tags = newReceipt.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const receipt: Receipt = {
      id: crypto.randomUUID(),
      amount: amount,
      category: newReceipt.category || 'Other',
      description: newReceipt.description,
      date: newReceipt.date,
      imageUrl: capturedImage,
      store: newReceipt.store,
      paymentMethod: newReceipt.paymentMethod,
      taxAmount: taxAmount,
      isBusinessExpense: newReceipt.isBusinessExpense,
      notes: newReceipt.notes || undefined,
      location: newReceipt.location || undefined,
      tags: tags.length > 0 ? tags : undefined
    };

    setReceipts(prev => [receipt, ...prev]);
    
    // Add to transactions
    addTransaction({
      type: 'EXPENSE',
      amount: amount,
      description: newReceipt.description,
      category: newReceipt.category || 'Other',
      date: newReceipt.date
    });

    // Reset form
    setNewReceipt({
      amount: '',
      category: '',
      description: '',
      store: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'card',
      taxAmount: '',
      isBusinessExpense: false,
      notes: '',
      location: '',
      tags: ''
    });
    setCapturedImage(null);
    setActiveView('dashboard');

    showToast(`Receipt saved successfully! Amount: N$${amount.toFixed(2)}`, 'success');
  };

  const deleteReceipt = (id: string) => {
    setReceipts(prev => prev.filter(receipt => receipt.id !== id));
  };

  // Analytics dashboard view
  if (activeView === 'analytics') {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Receipt Analytics</h2>
            <p className="text-gray-400">Detailed insights into your spending patterns</p>
          </div>
          <button
            onClick={() => setActiveView('dashboard')}
            className="text-brand-300 hover:text-white transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Total Spent</h3>
            <p className="text-3xl font-bold text-blue-400">N${analytics.totalAmount.toFixed(2)}</p>
            <div className="mt-2 text-sm text-gray-400">
              {analytics.receiptCount} receipts
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-teal-500/20 border border-green-500/30 p-6">
            <h3 className="text-lg font-semibold text-white mb-2">This Month</h3>
            <p className="text-3xl font-bold text-green-400">N${analytics.thisMonth.toFixed(2)}</p>
            <div className={`mt-2 text-sm ${analytics.monthlyGrowth >= 0 ? 'text-red-400' : 'text-green-400'}`}>
              {analytics.monthlyGrowth >= 0 ? '↑' : '↓'} {Math.abs(analytics.monthlyGrowth).toFixed(1)}% vs last month
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Average Receipt</h3>
            <p className="text-3xl font-bold text-purple-400">N${analytics.averageReceiptAmount.toFixed(2)}</p>
            <div className="mt-2 text-sm text-gray-400">
              Per transaction
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Business Expenses</h3>
            <p className="text-3xl font-bold text-yellow-400">N${analytics.businessExpenses.toFixed(2)}</p>
            <div className="mt-2 text-sm text-gray-400">
              Tax deductible
            </div>
          </Card>
        </div>

        {/* Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Spending by Category</h3>
            <div className="space-y-3">
              {analytics.categoryBreakdown.slice(0, 8).map((item, index) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: `hsl(${index * 45}, 70%, 60%)` }}
                    ></div>
                    <span className="text-white text-sm">{item.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">N${item.total.toFixed(2)}</div>
                    <div className="text-xs text-gray-400">{item.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Top Stores</h3>
            <div className="space-y-3">
              {analytics.topStores.slice(0, 8).map((store, index) => (
                <div key={store.store} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">{store.store}</div>
                      <div className="text-xs text-gray-400">{store.count} visits</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">N${store.total.toFixed(2)}</div>
                    <div className="text-xs text-gray-400">N${store.averageAmount.toFixed(2)} avg</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Payment Methods & Weekly Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Payment Methods</h3>
            <div className="space-y-4">
              {Object.entries(analytics.paymentMethods).map(([method, amount]) => {
                const percentage = analytics.totalAmount === 0 ? 0 : (amount / analytics.totalAmount) * 100;
                return (
                  <div key={method} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white capitalize">{method}</span>
                      <span className="text-gray-400">N${amount.toFixed(2)} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-brand-500 to-purple-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Weekly Spending Trend</h3>
            <div className="space-y-3">
              {analytics.weeklySpending.slice(-6).map((week, index) => (
                <div key={week.week} className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">{week.week}</span>
                  <div className="flex items-center space-x-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${Math.max((week.total / Math.max(...analytics.weeklySpending.map(w => w.total))) * 100, 5)}px` }}
                    ></div>
                    <span className="text-white text-sm font-medium">N${week.total.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

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

  // Main dashboard view
  if (activeView === 'dashboard') {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Receipts Dashboard</h2>
          <p className="text-gray-400">Capture, organize, and analyze your receipts</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-800/30 p-1 rounded-lg mb-6">
          <button
            onClick={() => setActiveView('dashboard')}
            className="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 bg-brand-500/20 text-brand-300 border border-brand-500/30"
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveView('analytics')}
            className="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 text-gray-400 hover:text-white hover:bg-gray-700/30"
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveView('add')}
            className="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 text-gray-400 hover:text-white hover:bg-gray-700/30"
          >
            📷 Add Receipt
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 p-4">
            <h3 className="text-sm font-semibold text-white mb-2">Total Receipts</h3>
            <p className="text-2xl font-bold text-blue-400">{analytics.receiptCount}</p>
            <div className="mt-1 text-xs text-gray-400">
              N${analytics.averageReceiptAmount.toFixed(2)} average
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-teal-500/20 border border-green-500/30 p-4">
            <h3 className="text-sm font-semibold text-white mb-2">Total Amount</h3>
            <p className="text-2xl font-bold text-green-400">N${analytics.totalAmount.toFixed(2)}</p>
            <div className="mt-1 text-xs text-gray-400">
              N${analytics.totalTax.toFixed(2)} tax included
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 p-4">
            <h3 className="text-sm font-semibold text-white mb-2">This Month</h3>
            <p className="text-2xl font-bold text-purple-400">N${analytics.thisMonth.toFixed(2)}</p>
            <div className={`mt-1 text-xs ${analytics.monthlyGrowth >= 0 ? 'text-red-400' : 'text-green-400'}`}>
              {analytics.monthlyGrowth >= 0 ? '↑' : '↓'} {Math.abs(analytics.monthlyGrowth).toFixed(1)}%
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 p-4">
            <h3 className="text-sm font-semibold text-white mb-2">Business</h3>
            <p className="text-2xl font-bold text-yellow-400">N${analytics.businessExpenses.toFixed(2)}</p>
            <div className="mt-1 text-xs text-gray-400">
              Tax deductible
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <input
              type="text"
              placeholder="Search receipts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="lg:col-span-2 p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value)}
              className="p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-');
                setSortBy(newSortBy as any);
                setSortOrder(newSortOrder as any);
              }}
              className="p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
              <option value="store-asc">Store A-Z</option>
              <option value="category-asc">Category A-Z</option>
            </select>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="businessOnly"
                checked={showBusinessOnly}
                onChange={(e) => setShowBusinessOnly(e.target.checked)}
                className="w-4 h-4 text-brand-500 bg-gray-700 border-gray-600 rounded focus:ring-brand-500"
              />
              <label htmlFor="businessOnly" className="text-sm text-gray-300">Business Only</label>
            </div>
          </div>
        </Card>

        {/* Receipts Grid */}
        <div className="space-y-4">
          {filteredAndSortedReceipts.length === 0 ? (
            <Card className="bg-gradient-to-br from-gray-400/20 to-gray-600/20 border border-gray-500/30 text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchTerm || filterCategory !== 'all' || filterDateRange !== 'all' 
                  ? 'No receipts match your filters' 
                  : 'No Receipts Yet'
                }
              </h3>
              <p className="text-gray-400 mb-4">
                {searchTerm || filterCategory !== 'all' || filterDateRange !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Start capturing your receipts to track your expenses'
                }
              </p>
              <button
                onClick={() => setActiveView('add')}
                className="bg-gradient-to-r from-brand-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-brand-600 hover:to-purple-700 transition-all duration-300"
              >
                📷 Add First Receipt
              </button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedReceipts.map(receipt => (
                <Card key={receipt.id} className={`bg-gradient-to-br ${getCategoryColor(receipt.category)} p-4 cursor-pointer hover:scale-[1.02] transition-transform`}
                  onClick={() => {
                    setSelectedReceipt(receipt);
                    setActiveView('detail');
                  }}
                >
                  <div className="space-y-3">
                    <div className="relative">
                      <img
                        src={receipt.imageUrl}
                        alt="Receipt"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      {receipt.isBusinessExpense && (
                        <div className="absolute top-2 right-2 bg-yellow-500/90 text-black text-xs px-2 py-1 rounded-full font-medium">
                          Business
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-semibold text-white truncate">{receipt.description}</h3>
                      {receipt.store && (
                        <p className="text-sm text-gray-400 truncate">📍 {receipt.store}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-green-400">
                          N${receipt.amount.toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(receipt.date).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded truncate">
                          {receipt.category}
                        </span>
                        <div className="flex items-center space-x-2">
                          {receipt.paymentMethod && (
                            <span className="text-xs text-gray-400 capitalize">
                              💳 {receipt.paymentMethod}
                            </span>
                          )}
                          {receipt.tags && receipt.tags.length > 0 && (
                            <span className="text-xs text-purple-400">
                              🏷️ {receipt.tags.length}
                            </span>
                          )}
                        </div>
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
  }

  if (activeView === 'add') {
    return (
      <div className="max-w-4xl mx-auto p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Add Receipt</h2>
          <button
            onClick={() => {
              setActiveView('dashboard');
              setCapturedImage(null);
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
                    Required: Please capture or select a receipt image
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
                    Choose from Gallery
                  </button>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <p className="text-xs text-blue-300 text-center">
                      Tip: Camera will open the native camera app. Gallery will let you choose existing photos.
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
          <p className="text-lg sm:text-xl font-bold text-green-400 break-words overflow-hidden">N$ {receipts.reduce((sum, receipt) => sum + receipt.amount, 0).toFixed(2)}</p>
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
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
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