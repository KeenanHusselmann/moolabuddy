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

// Achievement system
const ACHIEVEMENTS = [
    { id: 'first_transaction', name: 'First Step', description: 'Added your first transaction', icon: '🎯', color: 'from-green-500 to-emerald-600' },
    { id: 'budget_master', name: 'Budget Master', description: 'Created 5 budgets', icon: '💼', color: 'from-blue-500 to-indigo-600' },
    { id: 'saver', name: 'Super Saver', description: 'Saved 20% of income', icon: '💰', color: 'from-purple-500 to-violet-600' },
    { id: 'consistent', name: 'Consistency King', description: 'Used app for 30 days', icon: '⭐', color: 'from-yellow-500 to-orange-600' },
    { id: 'goal_setter', name: 'Goal Setter', description: 'Set your first financial goal', icon: '🎊', color: 'from-pink-500 to-rose-600' },
    { id: 'budget_keeper', name: 'Budget Keeper', description: 'Stayed under budget for 3 months', icon: '🏆', color: 'from-cyan-500 to-teal-600' },
];

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
                    schedule: { at: new Date(Date.now() + 1000) },
                    sound: 'default',
                    attachments: [],
                    actionTypeId: '',
                    extra: { budgetId: budget.id },
                }],
            });
        }
    }, [isOverBudget, budget.category, spent, budget.limit]);

    return (
        <div className="p-4 bg-gradient-to-r from-gray-800/80 to-gray-900/80 rounded-xl border border-gray-600/50 hover:border-gray-500/50 transition-all duration-300 backdrop-blur-sm group hover:scale-[1.02]">
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
                    <button 
                        onClick={() => onDelete(budget.id)} 
                        className="text-red-500 hover:text-red-400 p-2 rounded-full hover:bg-red-500/20 transition-all duration-200 opacity-0 group-hover:opacity-100" 
                        aria-label={`Delete ${budget.category} budget`}
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                    className={`h-3 rounded-full transition-all duration-500 ${isOverBudget ? 'bg-gradient-to-r from-red-500 to-red-600' : progress > 80 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-brand-500 to-brand-600'}`}
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

const StatCard: React.FC<{ title: string; value: string; subtitle: string; color: string; icon?: string }> = ({ title, value, subtitle, color, icon }) => (
    <Card className={`p-4 ${color} hover:scale-105 transition-all duration-300 group relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="text-center relative z-10">
            {icon && <div className="text-2xl mb-2">{icon}</div>}
            <h3 className="text-sm font-medium text-gray-300 mb-2">{title}</h3>
            <p className="text-xl font-bold text-white mb-1 break-words">{value}</p>
            <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
    </Card>
);

const AchievementCard: React.FC<{ achievement: any; unlocked: boolean }> = ({ achievement, unlocked }) => (
    <div className={`p-4 rounded-xl border transition-all duration-300 ${
        unlocked 
            ? `bg-gradient-to-br ${achievement.color}/20 border-white/30 hover:scale-105` 
            : 'bg-gray-800/50 border-gray-700/50 opacity-60'
    }`}>
        <div className="text-center">
            <div className={`text-3xl mb-2 ${unlocked ? 'animate-pulse' : 'grayscale'}`}>
                {achievement.icon}
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">{achievement.name}</h3>
            <p className="text-xs text-gray-400">{achievement.description}</p>
            {unlocked && (
                <div className="mt-2">
                    <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                        Unlocked!
                    </span>
                </div>
            )}
        </div>
    </div>
);

const Profile: React.FC<ProfileProps> = ({ profile, setProfile, budgets, addBudget, deleteBudget, transactions, exportData, resetAllData }) => {
    const [currentProfile, setCurrentProfile] = useState(profile);
    const [newBudgetName, setNewBudgetName] = useState('');
    const [newBudgetLimit, setNewBudgetLimit] = useState('');
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
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

    // Calculate statistics and achievements
    const stats = useMemo(() => {
        const totalIncome = transactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);
        const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
        const totalSpent = budgets.reduce((sum, b) => {
            const spent = transactions.filter(t => t.type === TransactionType.EXPENSE && t.category.toLowerCase() === b.category.toLowerCase()).reduce((s, t) => s + t.amount, 0);
            return sum + spent;
        }, 0);

        const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
        
        // Calculate achievements
        const unlockedAchievements = ACHIEVEMENTS.filter(achievement => {
            switch (achievement.id) {
                case 'first_transaction':
                    return transactions.length > 0;
                case 'budget_master':
                    return budgets.length >= 5;
                case 'saver':
                    return savingsRate >= 20;
                case 'consistent':
                    return transactions.length >= 10; // Simplified
                case 'goal_setter':
                    return budgets.length > 0;
                case 'budget_keeper':
                    return budgets.length >= 3 && savingsRate > 0;
                default:
                    return false;
            }
        });

        return {
            totalIncome,
            totalExpenses,
            totalBudget,
            totalSpent,
            transactionCount: transactions.length,
            budgetCount: budgets.length,
            savingsRate,
            unlockedAchievements,
            achievementProgress: (unlockedAchievements.length / ACHIEVEMENTS.length) * 100
        };
    }, [transactions, budgets]);

    const tabs = [
        { id: 'overview', name: 'Overview', icon: '📊' },
        { id: 'achievements', name: 'Achievements', icon: '🏆' },
        { id: 'budgets', name: 'Budgets', icon: '💼' },
        { id: 'settings', name: 'Settings', icon: '⚙️' }
    ];
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Enhanced Header */}
                <div className="text-center mb-8">
                    <div className="relative inline-block">
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
                            Profile Center
                        </h1>
                        <div className="absolute -inset-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-lg blur opacity-30 animate-pulse"></div>
                    </div>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                        Manage your financial profile, track achievements, and customize your experience
                    </p>
                </div>

                {/* Professional Profile Header */}
                <Card className="p-8 bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-600/10 to-purple-600/10"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                        <div className="relative">
                            <div className="w-24 h-24 bg-gradient-to-br from-brand-500 to-purple-500 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20">
                                <span className="text-4xl font-bold text-white">{profile.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-gray-900 flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-4xl font-bold text-white mb-2">{profile.name}</h1>
                            <p className="text-brand-300 italic text-xl mb-3">"{profile.motto}"</p>
                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-sm text-gray-400">
                                <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    Verified User
                                </span>
                                <span>•</span>
                                <span>{stats.unlockedAchievements.length}/{ACHIEVEMENTS.length} Achievements</span>
                                <span>•</span>
                                <span>Level {Math.floor(stats.achievementProgress / 20) + 1}</span>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white">{stats.achievementProgress.toFixed(0)}%</div>
                            <div className="text-sm text-gray-400">Profile Complete</div>
                            <div className="w-20 bg-gray-700 rounded-full h-2 mt-2">
                                <div 
                                    className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${stats.achievementProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Enhanced Tab Navigation */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                                activeTab === tab.id
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-2xl shadow-blue-500/25 border-2 border-blue-400'
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white border-2 border-transparent hover:border-white/30 backdrop-blur-sm'
                            }`}
                        >
                            <span>{tab.icon}</span>
                            {tab.name}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Enhanced Statistics Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <StatCard 
                                title="Total Income" 
                                value={`N$${stats.totalIncome.toFixed(2)}`} 
                                subtitle="This month"
                                color="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30"
                                icon="💰"
                            />
                            <StatCard 
                                title="Total Expenses" 
                                value={`N$${stats.totalExpenses.toFixed(2)}`} 
                                subtitle="This month"
                                color="bg-gradient-to-br from-red-500/20 to-rose-600/20 border border-red-500/30"
                                icon="💸"
                            />
                            <StatCard 
                                title="Savings Rate" 
                                value={`${stats.savingsRate.toFixed(1)}%`} 
                                subtitle="This month"
                                color="bg-gradient-to-br from-purple-500/20 to-violet-600/20 border border-purple-500/30"
                                icon="📈"
                            />
                            <StatCard 
                                title="Active Budgets" 
                                value={stats.budgetCount.toString()} 
                                subtitle="Categories"
                                color="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-500/30"
                                icon="📊"
                            />
                        </div>

                        {/* Quick Actions */}
                        <Card className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-600/50">
                            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 rounded-xl hover:scale-105 transition-all duration-300 group">
                                    <div className="text-center">
                                        <div className="text-3xl mb-2 group-hover:animate-bounce">💰</div>
                                        <h3 className="font-semibold text-white">Add Income</h3>
                                        <p className="text-xs text-gray-400">Record new income</p>
                                    </div>
                                </button>
                                <button className="p-4 bg-gradient-to-br from-red-500/20 to-rose-600/20 border border-red-500/30 rounded-xl hover:scale-105 transition-all duration-300 group">
                                    <div className="text-center">
                                        <div className="text-3xl mb-2 group-hover:animate-bounce">💸</div>
                                        <h3 className="font-semibold text-white">Track Expense</h3>
                                        <p className="text-xs text-gray-400">Log new expense</p>
                                    </div>
                                </button>
                                <button className="p-4 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-500/30 rounded-xl hover:scale-105 transition-all duration-300 group">
                                    <div className="text-center">
                                        <div className="text-3xl mb-2 group-hover:animate-bounce">🎯</div>
                                        <h3 className="font-semibold text-white">Set Goal</h3>
                                        <p className="text-xs text-gray-400">Create financial goal</p>
                                    </div>
                                </button>
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'achievements' && (
                    <div className="space-y-6">
                        <Card className="p-6 bg-gradient-to-br from-yellow-500/20 to-orange-600/20 border border-yellow-500/30">
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                <span className="text-2xl">🏆</span>
                                Achievements & Milestones
                            </h2>
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-white font-medium">Progress</span>
                                    <span className="text-yellow-400 font-bold">{stats.unlockedAchievements.length}/{ACHIEVEMENTS.length}</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-3">
                                    <div 
                                        className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${stats.achievementProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {ACHIEVEMENTS.map((achievement) => {
                                    const isUnlocked = stats.unlockedAchievements.some(a => a.id === achievement.id);
                                    return (
                                        <AchievementCard 
                                            key={achievement.id} 
                                            achievement={achievement} 
                                            unlocked={isUnlocked} 
                                        />
                                    );
                                })}
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'budgets' && (
                    <div className="space-y-6">
                        {/* Enhanced Budget Management */}
                        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 border border-blue-500/30">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="text-2xl">💼</span>
                                Monthly Budget Planning
                            </h2>
                            <div className="space-y-6">
                                <form onSubmit={handleAddBudget} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                                    <div className="sm:col-span-1">
                                        <label htmlFor="budgetName" className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                                        <input 
                                            type="text" 
                                            id="budgetName" 
                                            value={newBudgetName} 
                                            onChange={e => setNewBudgetName(e.target.value)} 
                                            placeholder="e.g. Groceries"
                                            className="block w-full bg-gray-700/70 border border-gray-600/50 rounded-xl py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                                        />
                                    </div>
                                    <div className="sm:col-span-1">
                                        <label htmlFor="budgetLimit" className="block text-sm font-medium text-gray-300 mb-2">Monthly Limit</label>
                                        <input 
                                            type="number" 
                                            id="budgetLimit" 
                                            value={newBudgetLimit} 
                                            onChange={e => setNewBudgetLimit(e.target.value)} 
                                            placeholder="e.g. 400"
                                            className="block w-full bg-gray-700/70 border border-gray-600/50 rounded-xl py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                                        />
                                    </div>
                                    <button 
                                        type="submit" 
                                        className="w-full sm:col-span-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                                    >
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Add Budget
                                    </button>
                                </form>
                                <div className="space-y-4 pt-4">
                                    {budgets.length > 0 ? budgets.map(b => (
                                        <BudgetRow key={b.id} budget={b} transactions={transactions} onDelete={deleteBudget} />
                                    )) : (
                                        <div className="text-center py-12">
                                            <div className="text-6xl mb-4">💼</div>
                                            <p className="text-gray-400 text-lg">No budgets set yet</p>
                                            <p className="text-gray-500 text-sm">Add your first budget to start tracking your spending!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        {/* Professional Profile Settings */}
                        <Card className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-600/50">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="text-2xl">⚙️</span>
                                Profile Settings
                            </h2>
                            <form onSubmit={handleProfileSave} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                                    <input 
                                        type="text" 
                                        id="name" 
                                        value={currentProfile.name} 
                                        onChange={e => setCurrentProfile({...currentProfile, name: e.target.value})}
                                        className="block w-full bg-gray-700/70 border border-gray-600/50 rounded-xl shadow-sm py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200" 
                                        placeholder="Enter your name" 
                                    />
                                </div>
                                <div>
                                    <label htmlFor="motto" className="block text-sm font-medium text-gray-300 mb-2">Financial Motto</label>
                                    <input 
                                        type="text" 
                                        id="motto" 
                                        value={currentProfile.motto} 
                                        onChange={e => setCurrentProfile({...currentProfile, motto: e.target.value})}
                                        className="block w-full bg-gray-700/70 border border-gray-600/50 rounded-xl shadow-sm py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200" 
                                        placeholder="Your financial philosophy" 
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Save Profile
                                </button>
                            </form>
                        </Card>

                        {/* Professional Data Management */}
                        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-red-500/10 border border-gray-600/50">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="text-2xl">🗃️</span>
                                Data Management
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button 
                                    onClick={handleExport} 
                                    className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Export All Data
                                </button>
                                <button 
                                    onClick={handleReset} 
                                    className={`w-full px-6 py-4 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2 ${
                                        showResetConfirm 
                                            ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' 
                                            : 'bg-gradient-to-r from-red-800 to-red-900 hover:from-red-700 hover:to-red-800'
                                    } text-white`}
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    {showResetConfirm ? 'Click again to confirm' : 'Reset All Data'}
                                </button>
                            </div>
                            {showResetConfirm && (
                                <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
                                    <p className="text-red-400 text-sm text-center font-medium">⚠️ This action cannot be undone!</p>
                                </div>
                            )}
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
};

export default Profile;
