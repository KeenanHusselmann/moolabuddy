import React, { useState, useMemo } from 'react';
import Card from './Card';

export interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  estimatedCost: number;
  quantity: number;
  isCompleted: boolean;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingItem[];
  totalEstimatedCost: number;
  createdAt: string;
  isSubmitted: boolean;
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
  goBack
}) => {
  const [activeView, setActiveView] = useState<'lists' | 'create' | 'edit'>('lists');
  const [editingList, setEditingList] = useState<ShoppingList | null>(null);
  const [newListName, setNewListName] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemCost, setNewItemCost] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('1');

  const categories = [
    'Groceries', 'Electronics', 'Clothing', 'Home & Garden', 
    'Entertainment', 'Transportation', 'Healthcare', 'Education',
    'Personal Care', 'Sports & Fitness', 'Books & Media', 'Other'
  ];

  const totalEstimatedCost = useMemo(() => {
    return shoppingLists.reduce((total, list) => total + list.totalEstimatedCost, 0);
  }, [shoppingLists]);

  const createNewList = () => {
    if (!newListName.trim()) return;
    
    const newList: ShoppingList = {
      id: crypto.randomUUID(),
      name: newListName,
      items: [],
      totalEstimatedCost: 0,
      createdAt: new Date().toISOString(),
      isSubmitted: false
    };
    
    setShoppingLists(prev => [newList, ...prev]);
    setNewListName('');
    setActiveView('edit');
    setEditingList(newList);
  };

  const addItemToList = (listId: string) => {
    if (!newItemName.trim() || !newItemCost) return;
    
    const cost = parseFloat(newItemCost);
    const quantity = parseInt(newItemQuantity);
    
    if (isNaN(cost) || cost <= 0 || isNaN(quantity) || quantity <= 0) return;
    
    const newItem: ShoppingItem = {
      id: crypto.randomUUID(),
      name: newItemName,
      category: newItemCategory || 'Other',
      estimatedCost: cost,
      quantity: quantity,
      isCompleted: false
    };
    
    setShoppingLists(prev => prev.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          items: [...list.items, newItem],
          totalEstimatedCost: list.totalEstimatedCost + (cost * quantity)
        };
      }
      return list;
    }));
    
    // Show success notification
    alert(`✅ Item "${newItemName}" added to shopping list!\n\n💰 Cost: N$ ${(cost * quantity).toFixed(2)}\n📦 Quantity: ${quantity}\n🏷️ Category: ${newItemCategory || 'Other'}`);
    
    setNewItemName('');
    setNewItemCategory('');
    setNewItemCost('');
    setNewItemQuantity('1');
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
    alert(`✅ Shopping list "${list.name}" submitted successfully!\n\n📋 ${list.items.length} items added to transactions\n💰 Total amount: N$ ${list.totalEstimatedCost.toFixed(2)}`);
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

  if (activeView === 'create') {
    return (
      <div className="max-w-4xl mx-auto p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Create Shopping List</h2>
          <button
            onClick={() => {
              if (goBack) {
                goBack();
              } else {
                setActiveView('lists');
              }
            }}
            className="text-brand-300 hover:text-white transition-colors text-sm sm:text-base"
          >
            ← Back to Lists
          </button>
        </div>

        <Card className="bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30 p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                List Name
              </label>
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Enter list name..."
                className="w-full p-2.5 sm:p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm sm:text-base"
              />
            </div>
            <button
              onClick={createNewList}
              disabled={!newListName.trim()}
              className="w-full bg-gradient-to-r from-brand-500 to-purple-600 text-white py-2.5 sm:py-3 px-6 rounded-lg font-medium hover:from-brand-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
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
              if (goBack) {
                goBack();
              } else {
                setActiveView('lists');
                setEditingList(null);
              }
            }}
            className="text-brand-300 hover:text-white transition-colors"
          >
            ← Back to Lists
          </button>
        </div>

        <Card className="bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30 mb-6 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Add Item</h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Item name..."
                className="p-2.5 sm:p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm sm:text-base break-words overflow-hidden"
              />
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
                className="p-2.5 sm:p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm sm:text-base"
              >
                <option value="">Select category...</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <input
                type="number"
                value={newItemCost}
                onChange={(e) => setNewItemCost(e.target.value)}
                placeholder="Cost..."
                className="p-2.5 sm:p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm sm:text-base"
              />
              <input
                type="number"
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(e.target.value)}
                placeholder="Qty"
                min="1"
                className="p-2.5 sm:p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm sm:text-base"
              />
            </div>
            <button
              onClick={() => addItemToList(editingList.id)}
              disabled={!newItemName.trim() || !newItemCost}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              Add Item
            </button>
          </div>
        </Card>

        <div className="space-y-3 sm:space-y-4">
          {editingList.items.map(item => (
            <Card key={item.id} className={`bg-gradient-to-br ${getCategoryColor(item.category)} p-3 sm:p-4`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  <input
                    type="checkbox"
                    checked={item.isCompleted}
                    onChange={() => toggleItemCompletion(editingList.id, item.id)}
                    className="w-4 h-4 text-brand-500 rounded focus:ring-brand-500 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className={`font-medium text-sm sm:text-base break-words overflow-hidden ${item.isCompleted ? 'line-through text-gray-400' : 'text-white'}`}>
                      {item.name} (x{item.quantity})
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-400 truncate">{item.category}</p>
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
        </div>

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
          <p className="text-lg sm:text-xl font-bold text-green-400 break-words overflow-hidden">N$ {totalEstimatedCost.toFixed(2)}</p>
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
            <div className="text-6xl mb-4">🛒</div>
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