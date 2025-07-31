
import React, { useState, useMemo, useEffect } from 'react';
import Card from './Card';
import type { UserProfile, Budget, Transaction } from '../types';
import { TransactionType } from '../types';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useToast } from './ToastContext';

interface ProfileProps {
    profile: UserProfile;
    setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
    budgets: Budget[];
    addBudget: (budget: Omit<Budget, 'id'>) => void;
    deleteBudget: (id: string) => void;
    transactions: Transaction[];
    exportData: () => Promise<void>;
    resetAllData: () => void;
}

const BudgetRow: React.FC<{ budget: Budget; transactions: Transaction[], onDelete: (id: string) => void }> = ({ budget, transactions, onDelete }) => {
    const spent = useMemo(() => {
        return transactions
            .filter(t => t.type === TransactionType.EXPENSE && t.category.toLowerCase() === budget.category.toLowerCase())
            .reduce((sum, t) => sum + t.amount, 0);
    }, [transactions, budget.category]);

    const progress = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
    const isOverBudget = progress > 100;
    const remaining = budget.limit - spent;

    useEffect(() => {
        if (isOverBudget) {
            LocalNotifications.schedule({
                notifications: [{
                    id: 1,
                    title: `Budget Exceeded for ${budget.category}`,
                    body: `You have exceeded your monthly budget for ${budget.category}. Spent: N$${spent.toFixed(2)}, Limit: N$${budget.limit.toFixed(2)}`,
                    schedule: { at: new Date(Date.now() + 1000) }, // Schedule for 1 second from now
                    sound: 'default',
                    attachments: [],
                    actionTypeId: '',
                    extra: { budgetId: budget.id },
                }],
            });
        }
    }, [isOverBudget, budget.category, spent, budget.limit]);

    return (
        <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600/50 hover:border-gray-500/50 transition-colors">
            <div className="flex justify-between items-center mb-3">
                <div>
                    <span className="font-semibold text-white text-lg">{budget.category}</span>
                    <p className="text-xs text-gray-400 mt-1">Monthly Budget</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <span className={`text-sm font-semibold ${isOverBudget ? 'text-red-400' : 'text-gray-300'} break-words overflow-hidden`}>
                        N${spent.toFixed(2)} / N${budget.limit.toFixed(2)}
                    </span>
                        <p className={`text-xs ${remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {remaining >= 0 ? `N$${remaining.toFixed(2)} remaining` : `N$${Math.abs(remaining).toFixed(2)} over`}
                        </p>
                    </div>
                    <button onClick={() => onDelete(budget.id)} className="text-red-500 hover:text-red-400 p-1 rounded-full hover:bg-red-500/10 transition-colors" aria-label={`Delete ${budget.category} budget`}>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-3">
                <div
                    className={`h-3 rounded-full transition-all duration-300 ${isOverBudget ? 'bg-red-500' : progress > 80 ? 'bg-yellow-500' : 'bg-brand-500'}`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
            </div>
            <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-400">Progress</span>
                <span className={`text-xs font-semibold ${isOverBudget ? 'text-red-400' : progress > 80 ? 'text-yellow-400' : 'text-brand-400'}`}>
                    {progress.toFixed(1)}%
                </span>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ title: string; value: string; subtitle: string; color: string }> = ({ title, value, subtitle, color }) => (
    <Card className={`p-4 aspect-square flex flex-col justify-center ${color}`}>
        <div className="text-center">
            <h3 className="text-sm font-medium text-gray-400 mb-2">{title}</h3>
            <p className="text-xl font-bold text-white mb-1">{value}</p>
            <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
    </Card>
);

const Profile: React.FC<ProfileProps> = ({ profile, setProfile, budgets, addBudget, deleteBudget, transactions, exportData, resetAllData }) => {
    const [currentProfile, setCurrentProfile] = useState(profile);
    const [newBudgetName, setNewBudgetName] = useState('');
    const [newBudgetLimit, setNewBudgetLimit] = useState('');
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const { showToast } = useToast();

    // Check for budget overruns and send notifications
    useEffect(() => {
        const checkBudgetOverruns = async () => {
            try {
                for (const budget of budgets) {
                    const spent = transactions
                        .filter(t => t.type === TransactionType.EXPENSE && t.category.toLowerCase() === budget.category.toLowerCase())
                        .reduce((sum, t) => sum + t.amount, 0);
                    
                    if (spent > budget.limit) {
                        console.log(`Budget overrun detected: ${budget.category} - Spent: N$${spent.toFixed(2)}, Limit: N$${budget.limit.toFixed(2)}`);
                        
                        await LocalNotifications.schedule({
                            notifications: [{
                                id: Date.now() + Math.random(),
                                title: `Budget Alert: ${budget.category}`,
                                body: `You've exceeded your ${budget.category} budget by N$${(spent - budget.limit).toFixed(2)}. You spent N$${spent.toFixed(2)} but your limit was N$${budget.limit.toFixed(2)}.`,
                                sound: 'default',
                                actionTypeId: 'OPEN_APP',
                                channelId: 'budget_alerts',
                                extra: {
                                    type: 'budget_alert',
                                    category: budget.category,
                                    overspent: spent - budget.limit
                                }
                            }],
                        });
                    }
                }
            } catch (error) {
                console.error('Error checking budget overruns:', error);
            }
        };

        if (budgets.length > 0 && transactions.length > 0) {
            checkBudgetOverruns();
        }
    }, [budgets, transactions]);

    const handleProfileSave = (e: React.FormEvent) => {
        e.preventDefault();
        setProfile(currentProfile);
        showToast('Profile updated successfully!', 'success');
    };

    const handleAddBudget = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBudgetName || !newBudgetLimit || parseFloat(newBudgetLimit) <= 0) {
            showToast('Please enter a valid category name and a positive limit.', 'error');
            return;
        }
        if (budgets.some(b => b.category.toLowerCase() === newBudgetName.toLowerCase())) {
            showToast('A budget for this category already exists.', 'error');
            return;
        }
        addBudget({ category: newBudgetName, limit: parseFloat(newBudgetLimit) });
        setNewBudgetName('');
        setNewBudgetLimit('');
        showToast(`Budget for "${newBudgetName}" added successfully!`, 'success');
    };

    const handleExport = async () => {
        if (transactions.length === 0 && budgets.length === 0) {
            showToast('No data to export. Start using the app to create some data!', 'warning');
            return;
        }
        await exportData();
        showToast('All your data has been exported successfully!', 'success');
    };

    const handleReset = () => {
        if (showResetConfirm) {
            resetAllData();
            setShowResetConfirm(false);
            showToast('All your data has been reset successfully!', 'success');
        } else {
            setShowResetConfirm(true);
            setTimeout(() => setShowResetConfirm(false), 3000);
        }
    };

    // Calculate statistics
    const stats = useMemo(() => {
        const totalIncome = transactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);
        const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
        const totalSpent = budgets.reduce((sum, b) => {
            const spent = transactions.filter(t => t.type === TransactionType.EXPENSE && t.category.toLowerCase() === b.category.toLowerCase()).reduce((s, t) => s + t.amount, 0);
            return sum + spent;
        }, 0);

        return {
            totalIncome,
            totalExpenses,
            totalBudget,
            totalSpent,
            transactionCount: transactions.length,
            budgetCount: budgets.length,
            savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0
        };
    }, [transactions, budgets]);
    
    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Profile Header */}
            <Card className="p-6 bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30">
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-brand-500 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">{profile.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
                        <p className="text-brand-300 italic">"{profile.motto}"</p>
                    </div>
                </div>
            </Card>

            {/* Statistics Cards - Square Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <StatCard 
                    title="Total Income" 
                    value={`N$${stats.totalIncome.toFixed(2)}`} 
                    subtitle="This month"
                    color="border-green-500"
                />
                <StatCard 
                    title="Total Expenses" 
                    value={`N$${stats.totalExpenses.toFixed(2)}`} 
                    subtitle="This month"
                    color="border-red-500"
                />
                <StatCard 
                    title="Savings Rate" 
                    value={`${stats.savingsRate.toFixed(1)}%`} 
                    subtitle="This month"
                    color="border-purple-500"
                />
                <StatCard 
                    title="Active Budgets" 
                    value={stats.budgetCount.toString()} 
                    subtitle="Categories"
                    color="border-blue-500"
                />
            </div>

            {/* Profile Settings */}
            <Card className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                    Profile Settings
                </h2>
                <form onSubmit={handleProfileSave} className="space-y-4">
                     <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300">Name</label>
                        <input type="text" id="name" value={currentProfile.name} onChange={e => setCurrentProfile({...currentProfile, name: e.target.value})}
                            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-500 focus:border-brand-500" />
                    </div>
                     <div>
                        <label htmlFor="motto" className="block text-sm font-medium text-gray-300">Financial Motto</label>
                        <input type="text" id="motto" value={currentProfile.motto} onChange={e => setCurrentProfile({...currentProfile, motto: e.target.value})}
                            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-500 focus:border-brand-500" />
                    </div>
                    <button type="submit" className="w-full sm:w-auto px-6 py-2 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors flex items-center justify-center">
                        Save Profile
                    </button>
                </form>
            </Card>

            {/* Budget Management */}
            <Card className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                    Monthly Budgeting
                </h2>
                <div className="space-y-4">
                    <form onSubmit={handleAddBudget} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                        <div className="sm:col-span-1">
                            <label htmlFor="budgetName" className="block text-sm font-medium text-gray-300">Category</label>
                            <input type="text" id="budgetName" value={newBudgetName} onChange={e => setNewBudgetName(e.target.value)} placeholder="e.g. Groceries"
                                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                        </div>
                        <div className="sm:col-span-1">
                            <label htmlFor="budgetLimit" className="block text-sm font-medium text-gray-300">Monthly Limit</label>
                            <input type="number" id="budgetLimit" value={newBudgetLimit} onChange={e => setNewBudgetLimit(e.target.value)} placeholder="e.g. 400"
                                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
                        </div>
                         <button type="submit" className="w-full sm:col-span-1 py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                            Add Budget
                         </button>
                    </form>
                    <div className="space-y-3 pt-4">
                        {budgets.length > 0 ? budgets.map(b => (
                            <BudgetRow key={b.id} budget={b} transactions={transactions} onDelete={deleteBudget} />
                        )) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No budgets set. Add one to start tracking!</p>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Data Management */}
             <Card className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                    Data Management
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onClick={handleExport} className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
                        Export All Data
                    </button>
                    <button onClick={handleReset} className={`w-full px-6 py-3 font-semibold rounded-lg transition-colors flex items-center justify-center ${showResetConfirm ? 'bg-red-600 hover:bg-red-700' : 'bg-red-800 hover:bg-red-700'} text-white`}>
                        {showResetConfirm ? 'Click again to confirm' : 'Reset All Data'}
                    </button>
                </div>
                {showResetConfirm && (
                    <p className="text-red-400 text-sm mt-2 text-center">This action cannot be undone!</p>
                )}
            </Card>
        </div>
    )
};

export default Profile;
