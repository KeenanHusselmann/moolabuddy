
import React, { useState, useEffect, useMemo } from 'react';
import type { Goal } from '../types';
import Card from './Card';
import { useToast } from './ToastContext';

interface GoalsProps {
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'currentAmount'>) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;
}

const EditGoalModal: React.FC<{
  goal: Goal | null;
  onClose: () => void;
  onSave: (goal: Goal) => void;
}> = ({ goal, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setTargetAmount(String(goal.targetAmount));
      setCurrentAmount(String(goal.currentAmount));
      setDeadline(goal.deadline);
    }
  }, [goal]);

  if (!goal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount || !deadline || !currentAmount) {
      showToast('Please fill all fields.', 'error');
      return;
    }
    onSave({
      ...goal,
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount),
      deadline,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <Card className="p-6 w-full max-w-md relative" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-4">Edit Goal</h2>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-goal-name" className="block text-sm font-medium text-gray-300">Goal Name</label>
            <input type="text" id="edit-goal-name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-500 focus:border-brand-500" />
          </div>
          <div>
            <label htmlFor="edit-target-amount" className="block text-sm font-medium text-gray-300">Target Amount (N$)</label>
            <input type="number" id="edit-target-amount" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-500 focus:border-brand-500" />
          </div>
           <div>
            <label htmlFor="edit-current-amount" className="block text-sm font-medium text-gray-300">Current Amount (N$)</label>
            <input type="number" id="edit-current-amount" value={currentAmount} onChange={e => setCurrentAmount(e.target.value)} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-500 focus:border-brand-500" />
          </div>
          <div>
            <label htmlFor="edit-deadline" className="block text-sm font-medium text-gray-300">Deadline</label>
            <input type="date" id="edit-deadline" value={deadline} onChange={e => setDeadline(e.target.value)} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-500 focus:border-brand-500" />
          </div>
          <button type="submit" className="w-full bg-brand-600 text-white font-semibold py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg hover:bg-brand-700 transition-colors text-sm sm:text-base">Save Changes</button>
        </form>
      </Card>
    </div>
  )
};

const Goals: React.FC<GoalsProps> = ({ goals, addGoal, updateGoal, deleteGoal }) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const { showToast } = useToast();

  // Enhanced state for filtering and analytics
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in-progress' | 'overdue'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'deadline' | 'amount'>('deadline');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Goals analytics
  const analytics = useMemo(() => {
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.currentAmount >= g.targetAmount).length;
    const totalTargetAmount = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalCurrentAmount = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const averageProgress = totalGoals > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;
    
    // Get overdue goals
    const today = new Date();
    const overdueGoals = goals.filter(g => {
      const deadline = new Date(g.deadline);
      return deadline < today && g.currentAmount < g.targetAmount;
    }).length;

    // Get goals by status
    const inProgressGoals = goals.filter(g => {
      const deadline = new Date(g.deadline);
      return g.currentAmount < g.targetAmount && deadline >= today;
    }).length;

    return {
      totalGoals,
      completedGoals,
      inProgressGoals,
      overdueGoals,
      totalTargetAmount,
      totalCurrentAmount,
      averageProgress,
      completionRate: totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0
    };
  }, [goals]);

  // Filtered and sorted goals
  const filteredAndSortedGoals = useMemo(() => {
    let filtered = [...goals];
    const today = new Date();

    // Apply status filter
    switch (statusFilter) {
      case 'completed':
        filtered = filtered.filter(g => g.currentAmount >= g.targetAmount);
        break;
      case 'in-progress':
        filtered = filtered.filter(g => {
          const deadline = new Date(g.deadline);
          return g.currentAmount < g.targetAmount && deadline >= today;
        });
        break;
      case 'overdue':
        filtered = filtered.filter(g => {
          const deadline = new Date(g.deadline);
          return g.currentAmount < g.targetAmount && deadline < today;
        });
        break;
    }

    // Sort goals
    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'progress':
          const progressA = (a.currentAmount / a.targetAmount) * 100;
          const progressB = (b.currentAmount / b.targetAmount) * 100;
          comparison = progressA - progressB;
          break;
        case 'deadline':
          comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          break;
        case 'amount':
          comparison = a.targetAmount - b.targetAmount;
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [goals, statusFilter, sortBy, sortOrder]);

  const clearFilters = () => {
    setStatusFilter('all');
    setSortBy('deadline');
    setSortOrder('asc');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!name || !targetAmount || !deadline) {
        showToast('Please fill all fields', 'error');
        return;
    }
    addGoal({
        name,
        targetAmount: parseFloat(targetAmount),
        deadline
    });
    setName('');
    setTargetAmount('');
    setDeadline('');
    showToast('Goal added successfully!', 'success');
  };

  const handleUpdate = (updatedGoal: Goal) => {
    updateGoal(updatedGoal);
    setEditingGoal(null);
    showToast('Goal updated successfully!', 'success');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      deleteGoal(id);
      showToast('Goal deleted successfully!', 'success');
    }
  };

  const getStatusColor = (goal: Goal) => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    const deadline = new Date(goal.deadline);
    const today = new Date();
    
    if (progress >= 100) return 'border-green-500';
    if (deadline < today) return 'border-red-500';
    return 'border-yellow-500';
  };

  const getStatusText = (goal: Goal) => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    const deadline = new Date(goal.deadline);
    const today = new Date();
    
    if (progress >= 100) return 'Completed';
    if (deadline < today) return 'Overdue';
    return 'In Progress';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Info Card */}
      <Card className="p-6 bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30">
        <h2 className="text-xl font-bold text-white mb-3">Smart Goal Management</h2>
        <p className="text-gray-300 text-sm leading-relaxed">
          Set, track, and achieve your financial goals with advanced analytics. Monitor your progress, 
          get insights, and stay motivated on your journey to financial success.
        </p>
      </Card>

      {/* Analytics Summary */}
      {showAnalytics && (
        <Card className="p-6 bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-500/30">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Goal Analytics</h3>
            <button
              onClick={() => setShowAnalytics(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-400">{analytics.totalGoals}</div>
              <div className="text-sm text-gray-400">Total Goals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{analytics.completedGoals}</div>
              <div className="text-sm text-gray-400">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{analytics.inProgressGoals}</div>
              <div className="text-sm text-gray-400">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{analytics.overdueGoals}</div>
              <div className="text-sm text-gray-400">Overdue</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <div className="text-sm text-gray-400 mb-1">Total Target Amount</div>
              <div className="text-lg font-bold text-white">N${analytics.totalTargetAmount.toFixed(2)}</div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <div className="text-sm text-gray-400 mb-1">Total Saved</div>
              <div className="text-lg font-bold text-green-400">N${analytics.totalCurrentAmount.toFixed(2)}</div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <div className="text-sm text-gray-400 mb-1">Average Progress</div>
              <div className="text-lg font-bold text-brand-400">{analytics.averageProgress.toFixed(1)}%</div>
            </div>
          </div>
        </Card>
      )}

      {/* Enhanced Filter Controls */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Goal Management</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="px-2 sm:px-4 py-1.5 sm:py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-xs sm:text-sm"
            >
              {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
            </button>
            <button
              onClick={clearFilters}
              className="px-2 sm:px-4 py-1.5 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs sm:text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Filter and Sort Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'completed' | 'in-progress' | 'overdue')}
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            >
              <option value="all">All Goals</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Sort By</label>
            <div className="flex gap-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'progress' | 'deadline' | 'amount')}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-md py-2 px-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              >
                <option value="deadline">Deadline</option>
                <option value="progress">Progress</option>
                <option value="name">Name</option>
                <option value="amount">Amount</option>
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

          {/* Results Summary */}
          <div className="flex items-end">
            <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 w-full">
              <div className="text-sm text-gray-300">
                Showing <span className="font-semibold text-white">{filteredAndSortedGoals.length}</span> of{' '}
                <span className="font-semibold text-white">{goals.length}</span> goals
                {statusFilter !== 'all' && (
                  <span className="text-brand-400 font-medium"> (filtered)</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Goals List */}
        <div className="lg:col-span-2">
          <Card className="p-4">
            <h2 className="text-xl font-bold text-white mb-4">Your Goals</h2>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              {filteredAndSortedGoals.length > 0 ? filteredAndSortedGoals.map(goal => {
                const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                const deadline = new Date(goal.deadline);
                const today = new Date();
                const daysRemaining = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <Card key={goal.id} className={`p-6 border-l-4 ${getStatusColor(goal)}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{goal.name}</h3>
                        <div className={`text-sm font-medium ${
                          getStatusText(goal) === 'Completed' ? 'text-green-400' :
                          getStatusText(goal) === 'Overdue' ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {getStatusText(goal)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setEditingGoal(goal)}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(goal.id)}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white font-medium">{progress.toFixed(1)}%</span>
                      </div>
                      
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${
                            progress >= 100 ? 'bg-green-500' : 
                            progress >= 75 ? 'bg-blue-500' : 
                            progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Current: </span>
                          <span className="text-green-400 font-medium">N${goal.currentAmount.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Target: </span>
                          <span className="text-white font-medium">N${goal.targetAmount.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="flex justify-between text-sm">
                        <div>
                          <span className="text-gray-400">Deadline: </span>
                          <span className="text-white">{deadline.toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">
                            {daysRemaining > 0 ? `${daysRemaining} days left` : 
                             daysRemaining === 0 ? 'Due today' : 
                             `${Math.abs(daysRemaining)} days overdue`}
                          </span>
                        </div>
                      </div>

                      <div className="text-sm">
                        <span className="text-gray-400">Remaining: </span>
                        <span className="text-brand-400 font-medium">
                          N${Math.max(goal.targetAmount - goal.currentAmount, 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              }) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎯</div>
                  <div className="text-gray-400 text-lg">No goals found matching your criteria</div>
                  <div className="text-gray-500 text-sm mt-2">
                    {goals.length === 0 ? 'Add your first financial goal to get started!' : 'Try adjusting your filters'}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Add Goal Form */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Add New Goal</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Goal Name</label>
                <input 
                  type="text" 
                  id="name" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g., Emergency Fund, New Car"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              
              <div>
                <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-300 mb-1">Target Amount (N$)</label>
                <input 
                  type="number" 
                  id="targetAmount" 
                  value={targetAmount} 
                  onChange={e => setTargetAmount(e.target.value)} 
                  step="0.01"
                  placeholder="0.00"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-300 mb-1">Target Date</label>
                <input 
                  type="date" 
                  id="deadline" 
                  value={deadline} 
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-brand-600 text-white py-1.5 sm:py-2 px-3 sm:px-4 rounded-md hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors font-medium text-sm sm:text-base"
              >
                Add Goal
              </button>
            </form>

            {/* Quick Tips */}
            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium text-white mb-2">💡 Goal Setting Tips</h3>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Set specific and measurable targets</li>
                <li>• Choose realistic deadlines</li>
                <li>• Break large goals into smaller milestones</li>
                <li>• Review and update progress regularly</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Goal Modal */}
      <EditGoalModal 
        goal={editingGoal}
        onClose={() => setEditingGoal(null)}
        onSave={handleUpdate}
      />
    </div>
  );
};

export default Goals;
