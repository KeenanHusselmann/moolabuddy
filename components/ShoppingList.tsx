import React, { useState, useMemo } from 'react';
import Card from './Card';
import { useToast } from './ToastContext';

export interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  estimatedCost: number;
  quantity: number;
  isCompleted: boolean;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingItem[];
  totalEstimatedCost: number;
  createdAt: string;
  isSubmitted: boolean;
  dueDate?: string;
  budget?: number;
}

interface ShoppingListProps {
  shoppingLists: ShoppingList[];
  setShoppingLists: React.Dispatch<React.SetStateAction<ShoppingList[]>>;
  budgets: any[];
  setBudgets: React.Dispatch<React.SetStateAction<any[]>>;
  addTransaction: (transaction: any) => void;
  goBack?: () => void;
}

const ShoppingListComponent: React.FC<ShoppingListProps> = ({
  shoppingLists,
  setShoppingLists,
  budgets,
  setBudgets,
  addTransaction,
  goBack: _goBack
}) => {
  const { showToast } = useToast();
  const [activeView, setActiveView] = useState<'dashboard' | 'lists' | 'create' | 'edit' | 'analytics'>('dashboard');
  const [editingList, setEditingList] = useState<ShoppingList | null>(null);
  const [newListName, setNewListName] = useState('');
  const [newListBudget, setNewListBudget] = useState('');
  const [newListDueDate, setNewListDueDate] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemCost, setNewItemCost] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('1');
  const [newItemPriority, setNewItemPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newItemNotes, setNewItemNotes] = useState('');
  
  // Enhanced filtering and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'overdue'>('all');
  const [sortBy, setSortBy] = useState<'created' | 'name' | 'budget' | 'items' | 'dueDate'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Item filtering for edit view
  const [itemFilter, setItemFilter] = useState('all');
  const [itemSort, setItemSort] = useState('priority');

  // Item filtering for edit view
  const filteredAndSortedItems = useMemo(() => {
    if (!editingList) return [];
    
    let filtered = editingList.items;
    
    // Apply filters
    if (itemFilter !== 'all') {
      filtered = filtered.filter(item => {
        switch (itemFilter) {
          case 'high':
          case 'medium':
          case 'low':
            return item.priority === itemFilter;
          case 'completed':
            return item.isCompleted;
          case 'pending':
            return !item.isCompleted;
          default:
            return true;
        }
      });
    }
    
    // Apply sorting
    return filtered.sort((a, b) => {
      switch (itemSort) {
        case 'priority':
          const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority || 'medium'] || 2) - (priorityOrder[a.priority || 'medium'] || 2);
        case 'cost':
          return (b.estimatedCost * b.quantity) - (a.estimatedCost * a.quantity);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [editingList, itemFilter, itemSort]);

  const categories = [
    'Groceries', 'Electronics', 'Clothing', 'Home & Garden', 
    'Entertainment', 'Transportation', 'Healthcare', 'Education',
    'Personal Care', 'Sports & Fitness', 'Books & Media', 'Other'
  ];

  // Advanced analytics
  const analytics = useMemo(() => {
    const totalLists = shoppingLists.length;
    const activeLists = shoppingLists.filter(list => !list.isSubmitted).length;
    const completedLists = shoppingLists.filter(list => list.isSubmitted).length;
    const totalEstimatedCost = shoppingLists.reduce((total, list) => total + list.totalEstimatedCost, 0);
    const totalItems = shoppingLists.reduce((total, list) => total + list.items.length, 0);
    const completedItems = shoppingLists.reduce((total, list) => 
      total + list.items.filter(item => item.isCompleted).length, 0);
    
    const today = new Date();
    const overdueLists = shoppingLists.filter(list => {
      if (!list.dueDate || list.isSubmitted) return false;
      return new Date(list.dueDate) < today;
    }).length;

    const categoryBreakdown = shoppingLists.reduce((acc, list) => {
      list.items.forEach(item => {
        acc[item.category] = (acc[item.category] || 0) + (item.estimatedCost * item.quantity);
      });
      return acc;
    }, {} as Record<string, number>);

    const avgItemsPerList = totalLists > 0 ? Math.round(totalItems / totalLists) : 0;
    const completionRate = totalItems > 0 ? ((completedItems / totalItems) * 100).toFixed(1) : '0';

    return {
      totalLists,
      activeLists,
      completedLists,
      totalEstimatedCost,
      totalItems,
      completedItems,
      overdueLists,
      categoryBreakdown,
      avgItemsPerList,
      completionRate: parseFloat(completionRate)
    };
  }, [shoppingLists]);

  // Filtered and sorted lists
  const filteredAndSortedLists = useMemo(() => {
    let filtered = [...shoppingLists];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(list =>
        list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        list.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    const today = new Date();
    switch (filterStatus) {
      case 'active':
        filtered = filtered.filter(list => !list.isSubmitted);
        break;
      case 'completed':
        filtered = filtered.filter(list => list.isSubmitted);
        break;
      case 'overdue':
        filtered = filtered.filter(list => {
          if (!list.dueDate || list.isSubmitted) return false;
          return new Date(list.dueDate) < today;
        });
        break;
    }

    // Sort lists
    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'budget':
          comparison = (a.budget || 0) - (b.budget || 0);
          break;
        case 'items':
          comparison = a.items.length - b.items.length;
          break;
        case 'dueDate':
          const aDate = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          const bDate = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          comparison = aDate - bDate;
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [shoppingLists, searchTerm, filterStatus, sortBy, sortOrder]);

  const createNewList = () => {
    if (!newListName.trim()) {
      showToast('Please enter a list name', 'error');
      return;
    }
    
    const newList: ShoppingList = {
      id: crypto.randomUUID(),
      name: newListName,
      items: [],
      totalEstimatedCost: 0,
      createdAt: new Date().toISOString(),
      isSubmitted: false,
      dueDate: newListDueDate || undefined,
      budget: newListBudget ? parseFloat(newListBudget) : undefined
    };
    
    setShoppingLists(prev => [newList, ...prev]);
    setNewListName('');
    setNewListBudget('');
    setNewListDueDate('');
    setActiveView('edit');
    setEditingList(newList);
    showToast(`Shopping list "${newListName}" created!`, 'success');
  };

  const addItemToList = (listId: string) => {
    if (!newItemName.trim() || !newItemCost) {
      showToast('Please enter item name and cost', 'error');
      return;
    }
    
    const cost = parseFloat(newItemCost);
    const quantity = parseInt(newItemQuantity);
    
    if (isNaN(cost) || cost <= 0 || isNaN(quantity) || quantity <= 0) {
      showToast('Please enter valid cost and quantity', 'error');
      return;
    }
    
    const newItem: ShoppingItem = {
      id: crypto.randomUUID(),
      name: newItemName,
      category: newItemCategory || 'Other',
      estimatedCost: cost,
      quantity: quantity,
      isCompleted: false,
      priority: newItemPriority,
      notes: newItemNotes || undefined
    };
    
    setShoppingLists(prev => prev.map(list => {
      if (list.id === listId) {
        const updatedList = {
          ...list,
          items: [...list.items, newItem],
          totalEstimatedCost: list.totalEstimatedCost + (cost * quantity)
        };
        
        // Check budget warning
        if (updatedList.budget && updatedList.totalEstimatedCost > updatedList.budget) {
          showToast(`Warning: List total (N$${updatedList.totalEstimatedCost.toFixed(2)}) exceeds budget (N$${updatedList.budget.toFixed(2)})`, 'warning');
        }
        
        return updatedList;
      }
      return list;
    }));
    
    showToast(`"${newItemName}" added successfully!`, 'success');
    
    // Reset form
    setNewItemName('');
    setNewItemCategory('');
    setNewItemCost('');
    setNewItemQuantity('1');
    setNewItemPriority('medium');
    setNewItemNotes('');
  };

  const toggleItemCompletion = (listId: string, itemId: string) => {
    setShoppingLists(prev => prev.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          items: list.items.map(item => 
            item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
          )
        };
      }
      return list;
    }));
  };

  const removeItemFromList = (listId: string, itemId: string) => {
    setShoppingLists(prev => prev.map(list => {
      if (list.id === listId) {
        const itemToRemove = list.items.find(item => item.id === itemId);
        const itemCost = itemToRemove ? itemToRemove.estimatedCost * itemToRemove.quantity : 0;
        return {
          ...list,
          items: list.items.filter(item => item.id !== itemId),
          totalEstimatedCost: list.totalEstimatedCost - itemCost
        };
      }
      return list;
    }));
  };

  const submitShoppingList = (list: ShoppingList) => {
    // Create transactions for each item
    list.items.forEach(item => {
      addTransaction({
        description: `${item.name} (Shopping List: ${list.name})`,
        amount: item.estimatedCost * item.quantity,
        type: 'expense',
        category: item.category,
        date: new Date().toISOString()
      });
    });

    // Deduct from budgets based on categories
    list.items.forEach(item => {
      const budget = budgets.find(b => b.category.toLowerCase() === item.category.toLowerCase());
      if (budget) {
        setBudgets(prev => prev.map(b => {
          if (b.id === budget.id) {
            return {
              ...b,
              spent: b.spent + (item.estimatedCost * item.quantity)
            };
          }
          return b;
        }));
      }
    });

    // Mark list as submitted
    setShoppingLists(prev => prev.map(l => 
      l.id === list.id ? { ...l, isSubmitted: true } : l
    ));

    // Show success notification
    showToast(`Shopping list "${list.name}" submitted successfully!\n\n${list.items.length} items added to transactions\nTotal amount: N$ ${list.totalEstimatedCost.toFixed(2)}`);
  };

  const deleteList = (listId: string) => {
    setShoppingLists(prev => prev.filter(list => list.id !== listId));
    if (editingList?.id === listId) {
      setEditingList(null);
      setActiveView('lists');
    }
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
      'Other': 'from-gray-400/20 to-gray-600/20 border-gray-500/30'
    };
    return colors[category as keyof typeof colors] || colors['Other'];
  };

  // Dashboard view
  if (activeView === 'dashboard') {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <Card className="p-6 bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Smart Shopping Management</h1>
              <p className="text-gray-300 text-sm leading-relaxed">
                Create intelligent shopping lists with budget tracking, priority management, and expense integration.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="text-lg font-bold text-brand-400">{analytics.totalLists}</div>
                <div className="text-xs text-gray-400">Lists</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">N${analytics.totalEstimatedCost.toFixed(0)}</div>
                <div className="text-xs text-gray-400">Total</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-400">{analytics.completionRate}%</div>
                <div className="text-xs text-gray-400">Complete</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex flex-wrap gap-2">
          {(['dashboard', 'lists', 'analytics'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                activeView === view
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {view}
            </button>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{analytics.activeLists}</div>
              <div className="text-sm text-gray-300">Active Lists</div>
              <div className="text-xs text-gray-400 mt-1">In progress</div>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{analytics.completedLists}</div>
              <div className="text-sm text-gray-300">Completed</div>
              <div className="text-xs text-gray-400 mt-1">Submitted</div>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{analytics.totalItems}</div>
              <div className="text-sm text-gray-300">Total Items</div>
              <div className="text-xs text-gray-400 mt-1">All lists</div>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{analytics.overdueLists}</div>
              <div className="text-sm text-gray-300">Overdue</div>
              <div className="text-xs text-gray-400 mt-1">Past due date</div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setActiveView('create')}
                className="w-full bg-gradient-to-r from-brand-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-brand-600 hover:to-purple-700 transition-all duration-300"
              >
                + Create New List
              </button>
              <button
                onClick={() => setActiveView('lists')}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-300"
              >
                View All Lists
              </button>
              <button
                onClick={() => setActiveView('analytics')}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
              >
                View Analytics
              </button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {shoppingLists.slice(0, 3).map(list => (
                <div key={list.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div>
                    <div className="font-medium text-white text-sm">{list.name}</div>
                    <div className="text-xs text-gray-400">
                      {list.items.length} items • N${list.totalEstimatedCost.toFixed(2)}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    list.isSubmitted ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {list.isSubmitted ? 'Completed' : 'Active'}
                  </div>
                </div>
              ))}
              {shoppingLists.length === 0 && (
                <div className="text-center py-6 text-gray-400">
                  <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-gray-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 5H19M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
                    </svg>
                  </div>
                  <p className="text-sm">No shopping lists yet</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Analytics view
  if (activeView === 'analytics') {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <Card className="p-6 bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-500/30">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Shopping Analytics</h1>
              <p className="text-gray-300 text-sm">Detailed insights into your shopping patterns and spending habits.</p>
            </div>
            <button
              onClick={() => setActiveView('dashboard')}
              className="text-brand-300 hover:text-white transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </Card>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Spending by Category</h3>
            <div className="space-y-3">
              {Object.entries(analytics.categoryBreakdown)
                .sort(([,a], [,b]) => (b as number) - (a as number))
                .slice(0, 5)
                .map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-gray-300">{category}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-brand-500 rounded-full"
                          style={{ width: `${((amount as number) / Math.max(...Object.values(analytics.categoryBreakdown) as number[])) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-white font-semibold text-sm">N${(amount as number).toFixed(0)}</span>
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Completion Rate</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${analytics.completionRate}%` }}
                    ></div>
                  </div>
                  <span className="text-white font-semibold">{analytics.completionRate}%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Avg Items per List</span>
                <span className="text-white font-semibold">{analytics.avgItemsPerList}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Lists with Budget</span>
                <span className="text-white font-semibold">
                  {shoppingLists.filter(list => list.budget).length}/{analytics.totalLists}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">On-time Completion</span>
                <span className="text-white font-semibold">
                  {((analytics.completedLists / Math.max(analytics.totalLists, 1)) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Budget Analysis */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Budget Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {shoppingLists
              .filter(list => list.budget)
              .slice(0, 6)
              .map(list => (
                <div key={list.id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <h4 className="font-medium text-white mb-2 truncate">{list.name}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Budget:</span>
                      <span className="text-white">N${list.budget?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Spent:</span>
                      <span className="text-white">N${list.totalEstimatedCost.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          list.totalEstimatedCost > (list.budget || 0) ? 'bg-red-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((list.totalEstimatedCost / (list.budget || 1)) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-center">
                      <span className={list.totalEstimatedCost > (list.budget || 0) ? 'text-red-400' : 'text-green-400'}>
                        {((list.totalEstimatedCost / (list.budget || 1)) * 100).toFixed(1)}% used
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>
    );
  }

  // Lists view
  if (activeView === 'lists') {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <Card className="p-6 bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">All Shopping Lists</h1>
              <p className="text-gray-300 text-sm leading-relaxed">
                View and manage all your shopping lists with advanced filtering and sorting options.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveView('create')}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm"
              >
                + New List
              </button>
              <button
                onClick={() => setActiveView('dashboard')}
                className="text-brand-300 hover:text-white transition-colors text-sm"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </Card>

        {/* Filter and Search Controls */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Filter & Search</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search lists or items..."
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'completed' | 'overdue')}
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              >
                <option value="all">All Lists</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'created' | 'name' | 'budget' | 'items' | 'dueDate')}
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              >
                <option value="created">Created Date</option>
                <option value="name">Name</option>
                <option value="budget">Budget</option>
                <option value="items">Item Count</option>
                <option value="dueDate">Due Date</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Order</label>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white hover:bg-gray-600 transition-colors text-sm"
              >
                {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
              </button>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-300">
              Showing <span className="font-semibold text-white">{filteredAndSortedLists.length}</span> of{' '}
              <span className="font-semibold text-white">{shoppingLists.length}</span> lists
              {searchTerm && (
                <span className="text-brand-400 font-medium"> (filtered by: "{searchTerm}")</span>
              )}
            </div>
          </div>
        </Card>

        {/* Lists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedLists.length > 0 ? (
            filteredAndSortedLists.map(list => (
              <Card key={list.id} className={`p-6 bg-gradient-to-br ${
                list.isSubmitted 
                  ? 'from-gray-400/20 to-gray-600/20 border-gray-500/30' 
                  : 'from-brand-400/20 to-purple-600/20 border-brand-500/30'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-lg mb-1 ${
                      list.isSubmitted ? 'text-gray-400 line-through' : 'text-white'
                    } truncate`}>
                      {list.name}
                    </h3>
                    {list.isSubmitted && (
                      <span className="inline-block bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full border border-green-500/30">
                        Completed
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Items:</span>
                    <span className="text-white font-medium">{list.items.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Total Cost:</span>
                    <span className="text-green-400 font-medium">N${list.totalEstimatedCost.toFixed(2)}</span>
                  </div>
                  {list.budget && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Budget:</span>
                      <span className="text-blue-400 font-medium">N${list.budget.toFixed(2)}</span>
                    </div>
                  )}
                  {list.dueDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Due:</span>
                      <span className={`font-medium text-sm ${
                        new Date(list.dueDate) < new Date() && !list.isSubmitted
                          ? 'text-red-400'
                          : 'text-yellow-400'
                      }`}>
                        {new Date(list.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Created:</span>
                    <span className="text-gray-300 text-sm">{new Date(list.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Progress Bar for Budget */}
                {list.budget && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-400">Budget Usage</span>
                      <span className="text-xs text-gray-300">
                        {((list.totalEstimatedCost / list.budget) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          list.totalEstimatedCost > list.budget ? 'bg-red-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((list.totalEstimatedCost / list.budget) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {!list.isSubmitted ? (
                    <>
                      <button
                        onClick={() => {
                          setEditingList(list);
                          setActiveView('edit');
                        }}
                        className="flex-1 bg-brand-600 text-white py-2 px-3 rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => submitShoppingList(list)}
                        className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Submit
                      </button>
                    </>
                  ) : (
                    <div className="flex-1 bg-gray-600 text-gray-300 py-2 px-3 rounded-lg text-sm font-medium text-center">
                      Completed
                    </div>
                  )}
                  <button
                    onClick={() => deleteList(list.id)}
                    className="bg-red-600/80 text-white py-2 px-3 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full">
              <Card className="p-12 text-center bg-gradient-to-br from-gray-400/20 to-gray-600/20 border border-gray-500/30">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-500/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 5H19M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {shoppingLists.length === 0 ? 'No Shopping Lists' : 'No Matching Lists'}
                </h3>
                <p className="text-gray-400 mb-4">
                  {shoppingLists.length === 0 
                    ? 'Create your first shopping list to get started' 
                    : 'Try adjusting your search criteria or filters'
                  }
                </p>
                <div className="flex gap-2 justify-center">
                  {shoppingLists.length === 0 ? (
                    <button
                      onClick={() => setActiveView('create')}
                      className="bg-gradient-to-r from-brand-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-brand-600 hover:to-purple-700 transition-all duration-300"
                    >
                      Create First List
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setFilterStatus('all');
                          setSortBy('created');
                          setSortOrder('desc');
                        }}
                        className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Clear Filters
                      </button>
                      <button
                        onClick={() => setActiveView('create')}
                        className="bg-gradient-to-r from-brand-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-brand-600 hover:to-purple-700 transition-all duration-300"
                      >
                        Create New List
                      </button>
                    </>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeView === 'create') {
    return (
      <div className="max-w-4xl mx-auto p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Create Shopping List</h2>
          <button
            onClick={() => setActiveView('dashboard')}
            className="text-brand-300 hover:text-white transition-colors text-sm sm:text-base"
          >
            ← Back to Dashboard
          </button>
        </div>

        <Card className="bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30 p-4 sm:p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                List Name *
              </label>
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Enter list name..."
                className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Budget (Optional)
                </label>
                <input
                  type="number"
                  value={newListBudget}
                  onChange={(e) => setNewListBudget(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Due Date (Optional)
                </label>
                <input
                  type="date"
                  value={newListDueDate}
                  onChange={(e) => setNewListDueDate(e.target.value)}
                  className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <button
              onClick={createNewList}
              disabled={!newListName.trim()}
              className="w-full bg-gradient-to-r from-brand-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-brand-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create List
            </button>
          </div>
        </Card>
      </div>
    );
  }

  if (activeView === 'edit' && editingList) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Edit: {editingList.name}</h2>
          <button
            onClick={() => {
              setActiveView('dashboard');
              setEditingList(null);
            }}
            className="text-brand-300 hover:text-white transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* List Info */}
        <Card className="p-4 mb-6 bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-white">{editingList.items.length}</div>
              <div className="text-sm text-gray-400">Items</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">N${editingList.totalEstimatedCost.toFixed(2)}</div>
              <div className="text-sm text-gray-400">Total Cost</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-400">
                {editingList.budget ? 
                  `${((editingList.totalEstimatedCost / editingList.budget) * 100).toFixed(1)}%` : 
                  'No Budget'
                }
              </div>
              <div className="text-sm text-gray-400">Budget Used</div>
            </div>
          </div>
          
          {editingList.budget && editingList.totalEstimatedCost > editingList.budget && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-300 text-sm text-center">
                ⚠️ Over budget by N${(editingList.totalEstimatedCost - editingList.budget).toFixed(2)}
              </p>
            </div>
          )}
        </Card>

        <Card className="bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30 mb-6 p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Add Item</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Item name..."
                className="p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
                className="p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Select category...</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="number"
                value={newItemCost}
                onChange={(e) => setNewItemCost(e.target.value)}
                placeholder="Cost..."
                step="0.01"
                className="p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <input
                type="number"
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(e.target.value)}
                placeholder="Quantity"
                min="1"
                className="p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <select
                value={newItemPriority}
                onChange={(e) => setNewItemPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            
            <textarea
              value={newItemNotes}
              onChange={(e) => setNewItemNotes(e.target.value)}
              placeholder="Notes (optional)..."
              rows={2}
              className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            
            <button
              onClick={() => addItemToList(editingList.id)}
              disabled={!newItemName.trim() || !newItemCost}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Item
            </button>
          </div>
        </Card>

        {/* Items Section */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Items ({editingList.items.length})</h3>
            
            {/* Items Filter Controls */}
            <div className="flex gap-3">
              <select
                value={itemFilter}
                onChange={(e) => setItemFilter(e.target.value)}
                className="px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">All Items</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
              
              <select
                value={itemSort}
                onChange={(e) => setItemSort(e.target.value)}
                className="px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="priority">Sort by Priority</option>
                <option value="cost">Sort by Cost</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>

        <div className="space-y-3 sm:space-y-4">
          {filteredAndSortedItems.map(item => (
            <Card key={item.id} className={`bg-gradient-to-br ${getCategoryColor(item.category)} p-3 sm:p-4`}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3">
                <div className="flex items-start space-x-2 sm:space-x-3 min-w-0 flex-1">
                  <input
                    type="checkbox"
                    checked={item.isCompleted}
                    onChange={() => toggleItemCompletion(editingList.id, item.id)}
                    className="w-4 h-4 text-brand-500 rounded focus:ring-brand-500 flex-shrink-0 mt-1"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className={`font-medium text-sm sm:text-base break-words overflow-hidden ${item.isCompleted ? 'line-through text-gray-400' : 'text-white'}`}>
                        {item.name} (x{item.quantity})
                      </h4>
                      
                      {/* Priority Badge */}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.priority === 'high' 
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : item.priority === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                    
                    <p className="text-xs sm:text-sm text-gray-400 truncate mb-1">{item.category}</p>
                    
                    {item.notes && (
                      <div className="mt-2 p-2 bg-gray-700/30 rounded text-xs text-gray-300 border border-gray-600/30">
                        <div className="text-xs text-gray-400 mb-1">Notes:</div>
                        {item.notes}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                  <span className="text-white font-medium text-sm sm:text-base">
                    N$ {(item.estimatedCost * item.quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeItemFromList(editingList.id, item.id)}
                    className="text-red-400 hover:text-red-300 transition-colors text-xs sm:text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </Card>
          ))}
          
          {filteredAndSortedItems.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              {itemFilter === 'all' ? 'No items in this list yet.' : `No ${itemFilter} items.`}
            </div>
          )}
        </div>
        </Card>

        {editingList.items.length > 0 && (
          <Card className="bg-gradient-to-br from-green-400/20 to-blue-600/20 border border-green-500/30 mt-6 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-semibold text-white break-words overflow-hidden">Total Estimated Cost</h3>
                <p className="text-xl sm:text-2xl font-bold text-green-400 break-words overflow-hidden">
                  N$ {editingList.totalEstimatedCost.toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => submitShoppingList(editingList)}
                className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-300 text-sm sm:text-base"
              >
                Submit List
              </button>
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Shopping Lists</h2>
        <p className="text-gray-400">Manage your shopping lists and track expenses</p>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setActiveView('create')}
          className="w-full bg-gradient-to-r from-brand-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-brand-600 hover:to-purple-700 transition-all duration-300"
        >
          + New List
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        <Card className="bg-gradient-to-br from-blue-400/20 to-blue-600/20 border border-blue-500/30 p-4">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-2">Total Lists</h3>
          <p className="text-xl sm:text-2xl font-bold text-blue-400 break-words overflow-hidden">{shoppingLists.length}</p>
        </Card>
        <Card className="bg-gradient-to-br from-green-400/20 to-green-600/20 border border-green-500/30 p-4">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-2">Total Estimated</h3>
          <p className="text-lg sm:text-xl font-bold text-green-400 break-words overflow-hidden">N$ {shoppingLists.reduce((sum, list) => sum + (list.budget || 0), 0).toFixed(2)}</p>
        </Card>
        <Card className="bg-gradient-to-br from-purple-400/20 to-purple-600/20 border border-purple-500/30 p-4">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-2">Submitted Lists</h3>
          <p className="text-xl sm:text-2xl font-bold text-purple-400 break-words overflow-hidden">
            {shoppingLists.filter(list => list.isSubmitted).length}
          </p>
        </Card>
      </div>

      <div className="space-y-4">
        {shoppingLists.length === 0 ? (
          <Card className="bg-gradient-to-br from-gray-400/20 to-gray-600/20 border border-gray-500/30 text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 5H19M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Shopping Lists Yet</h3>
            <p className="text-gray-400 mb-4">Create your first shopping list to start tracking your purchases</p>
            <button
              onClick={() => setActiveView('create')}
              className="bg-gradient-to-r from-brand-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-brand-600 hover:to-purple-700 transition-all duration-300"
            >
              Create First List
            </button>
          </Card>
        ) : (
          shoppingLists.map(list => (
            <Card key={list.id} className={`bg-gradient-to-br ${list.isSubmitted ? 'from-gray-400/20 to-gray-600/20 border-gray-500/30' : 'from-brand-400/20 to-purple-600/20 border-brand-500/30'} p-4`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <h3 className={`text-base sm:text-lg font-semibold truncate ${list.isSubmitted ? 'text-gray-400 line-through' : 'text-white'}`}>
                      {list.name}
                    </h3>
                    {list.isSubmitted && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full self-start sm:self-auto">
                        Submitted
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400 break-words">
                    {list.items.length} items • N$ {list.totalEstimatedCost.toFixed(2)} • {new Date(list.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!list.isSubmitted && (
                    <>
                      <button
                        onClick={() => {
                          setEditingList(list);
                          setActiveView('edit');
                        }}
                        className="text-brand-300 hover:text-white transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => submitShoppingList(list)}
                        className="text-green-400 hover:text-green-300 transition-colors text-sm"
                      >
                        Submit
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => deleteList(list.id)}
                    className="text-red-400 hover:text-red-300 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ShoppingListComponent; 