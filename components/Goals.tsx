
import React, { useState, useEffect } from 'react';
import type { Goal } from '../types';
import Card from './Card';

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
      alert('Please fill all fields.');
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
          <button type="submit" className="w-full bg-brand-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-brand-700 transition-colors">Save Changes</button>
        </form>
      </Card>
    </div>
  )
};

const GoalCard: React.FC<{ goal: Goal; onEdit: () => void; onDelete: () => void; }> = ({ goal, onEdit, onDelete }) => {
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const gradient = progress >= 100
    ? 'from-green-400/80 to-green-700/80'
    : progress > 70
      ? 'from-yellow-400/80 to-yellow-700/80'
      : 'from-blue-400/80 to-blue-700/80';
  return (
    <Card className={`p-5 bg-gradient-to-br ${gradient} shadow-lg border-0 relative overflow-hidden`}>  
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          <h3 className="font-bold text-lg text-white mb-1">{goal.name}</h3>
          <p className="text-xs text-gray-200 mb-2">Deadline: {new Date(goal.deadline).toLocaleDateString()}</p>
        </div>
         <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          <button onClick={onEdit} className="text-blue-100 hover:text-white p-1 rounded bg-blue-900/30" aria-label={`Edit goal ${goal.name}`}>Edit</button>
          <button onClick={onDelete} className="text-red-200 hover:text-white p-1 rounded bg-red-900/30" aria-label={`Delete goal ${goal.name}`}>Delete</button>
        </div>
      </div>
      <div className="flex justify-between items-end mt-2">
        <div>
          <p className="text-xl font-bold text-white">N${goal.currentAmount.toLocaleString()}</p>
          <p className="text-xs text-gray-200">of N${goal.targetAmount.toLocaleString()}</p>
        </div>
        <span className={`text-xs font-semibold ${progress >= 100 ? 'text-green-200' : progress > 70 ? 'text-yellow-200' : 'text-blue-100'}`}>{progress.toFixed(1)}% Complete</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-3 mt-2">
          <div
          className={`h-3 rounded-full transition-all duration-300 ${progress >= 100 ? 'bg-green-400' : progress > 70 ? 'bg-yellow-400' : 'bg-blue-400'}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
      </div>
    </Card>
  );
};

const Goals: React.FC<GoalsProps> = ({ goals, addGoal, updateGoal, deleteGoal }) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!name || !targetAmount || !deadline) {
        alert('Please fill all fields');
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
  };

  const handleUpdate = (updatedGoal: Goal) => {
    updateGoal(updatedGoal);
    setEditingGoal(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-2">Your Financial Goals</h2>
      {/* Goals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.length > 0 ? goals.map(goal => (
          <GoalCard key={goal.id} goal={goal} onEdit={() => setEditingGoal(goal)} onDelete={() => deleteGoal(goal.id)} />
        )) : (
          <Card className="p-8 text-center text-gray-200 bg-gradient-to-br from-blue-400/20 to-blue-900/20">
            <div className="text-4xl mb-2">🎯</div>
            <p>You haven't set any goals yet. Use the form to add one!</p>
          </Card>
        )}
      </div>
      {/* Add Goal Form */}
      <Card className="p-6 bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30">
          <h2 className="text-xl font-bold text-white mb-4">Set a New Goal</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label htmlFor="goal-name" className="block text-sm font-medium text-gray-300">Goal Name</label>
              <input type="text" id="goal-name" value={name} onChange={e => setName(e.target.value)}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
            </div>
            <div>
              <label htmlFor="target-amount" className="block text-sm font-medium text-gray-300">Target Amount (N$)</label>
              <input type="number" id="target-amount" value={targetAmount} onChange={e => setTargetAmount(e.target.value)}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
            </div>
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-300">Deadline</label>
              <input type="date" id="deadline" value={deadline} onChange={e => setDeadline(e.target.value)}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
            </div>
          <button type="submit" className="w-full md:col-span-3 py-2 px-4 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors mt-2">Add Goal</button>
          </form>
        </Card>
      <EditGoalModal goal={editingGoal} onClose={() => setEditingGoal(null)} onSave={handleUpdate} />
    </div>
  );
};

export default Goals;
