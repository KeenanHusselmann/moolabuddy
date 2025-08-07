
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
    <Card className={`p-4 ${color} hover:scale-105 transition-all duration-200`}>
        <div className="text-center">
            <h3 className="text-sm font-medium text-gray-300 mb-2">{title}</h3>
            <p className="text-xl font-bold text-white mb-1 break-words">{value}</p>
            <p className="text-xs text-gray-400">{subtitle}</p>
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
            {/* Professional Profile Header */}
            <Card className="p-6 bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30">
                <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-3xl font-bold text-white">{profile.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-white mb-1">{profile.name}</h1>
                        <p className="text-brand-300 italic text-lg">"{profile.motto}"</p>
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-400">
                            <span>Professional Finance Tracker</span>
                            <span>•</span>
                            <span>MoolaBuddy User</span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Enhanced Statistics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <StatCard 
                    title="Total Income" 
                    value={`N$${stats.totalIncome.toFixed(2)}`} 
                    subtitle="This month"
                    color="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30"
                />
                <StatCard 
                    title="Total Expenses" 
                    value={`N$${stats.totalExpenses.toFixed(2)}`} 
                    subtitle="This month"
                    color="bg-gradient-to-br from-red-500/20 to-rose-600/20 border border-red-500/30"
                />
                <StatCard 
                    title="Savings Rate" 
                    value={`${stats.savingsRate.toFixed(1)}%`} 
                    subtitle="This month"
                    color="bg-gradient-to-br from-purple-500/20 to-violet-600/20 border border-purple-500/30"
                />
                <StatCard 
                    title="Active Budgets" 
                    value={stats.budgetCount.toString()} 
                    subtitle="Categories"
                    color="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-500/30"
                />
            </div>

            {/* Professional Profile Settings */}
            <Card className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-600/50">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile Settings
                </h2>
                <form onSubmit={handleProfileSave} className="space-y-4">
                     <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                        <input type="text" id="name" value={currentProfile.name} onChange={e => setCurrentProfile({...currentProfile, name: e.target.value})}
                            className="block w-full bg-gray-700/70 border border-gray-600/50 rounded-lg shadow-sm py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200" 
                            placeholder="Enter your name" />
                    </div>
                     <div>
                        <label htmlFor="motto" className="block text-sm font-medium text-gray-300 mb-1">Financial Motto</label>
                        <input type="text" id="motto" value={currentProfile.motto} onChange={e => setCurrentProfile({...currentProfile, motto: e.target.value})}
                            className="block w-full bg-gray-700/70 border border-gray-600/50 rounded-lg shadow-sm py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200" 
                            placeholder="Your financial philosophy" />
                    </div>
                    <button type="submit" className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold rounded-lg hover:from-brand-700 hover:to-brand-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Save Profile
                    </button>
                </form>
            </Card>

            {/* Enhanced Budget Management */}
            <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 border border-blue-500/30">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Monthly Budget Planning
                </h2>
                <div className="space-y-4">
                    <form onSubmit={handleAddBudget} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                        <div className="sm:col-span-1">
                            <label htmlFor="budgetName" className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                            <input type="text" id="budgetName" value={newBudgetName} onChange={e => setNewBudgetName(e.target.value)} placeholder="e.g. Groceries"
                                className="block w-full bg-gray-700/70 border border-gray-600/50 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
                        </div>
                        <div className="sm:col-span-1">
                            <label htmlFor="budgetLimit" className="block text-sm font-medium text-gray-300 mb-1">Monthly Limit</label>
                            <input type="number" id="budgetLimit" value={newBudgetLimit} onChange={e => setNewBudgetLimit(e.target.value)} placeholder="e.g. 400"
                                className="block w-full bg-gray-700/70 border border-gray-600/50 rounded-lg py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
                        </div>
                         <button type="submit" className="w-full sm:col-span-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
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

            {/* Professional Data Management */}
             <Card className="p-6 bg-gradient-to-br from-green-500/10 to-red-500/10 border border-gray-600/50">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                    Data Management
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onClick={handleExport} className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export All Data
                    </button>
                    <button onClick={handleReset} className={`w-full px-6 py-4 font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2 ${showResetConfirm ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' : 'bg-gradient-to-r from-red-800 to-red-900 hover:from-red-700 hover:to-red-800'} text-white`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {showResetConfirm ? 'Click again to confirm' : 'Reset All Data'}
                    </button>
                </div>
                {showResetConfirm && (
                    <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                        <p className="text-red-400 text-sm text-center font-medium">⚠️ This action cannot be undone!</p>
                    </div>
                )}
            </Card>
        </div>
    )
};

export default Profile;
