
import React from 'react';
import Card from './Card';
import type { ArchiveItem, Transaction, Goal, Note, Projection, Budget, CostItem } from '../types';
import { TransactionType } from '../types';

interface HistoryProps {
    archive: ArchiveItem[];
    restoreItem: (item: ArchiveItem) => void;
    permanentlyDeleteItem: (id: string) => void;
}

const ArchivedItemDetails: React.FC<{ item: ArchiveItem }> = ({ item }) => {
    switch (item.type) {
        case 'Transaction':
            const t = item.data as Transaction;
            return (
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    <span className="text-gray-300">{t.description}:</span>
                    <span className={t.type === TransactionType.INCOME ? 'text-green-400' : 'text-red-400'}>{t.type === TransactionType.INCOME ? '+' : '-'}N${t.amount.toFixed(2)}</span>
                </div>
            );
        case 'Goal':
            const g = item.data as Goal;
            return (
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <span className="text-gray-300">{g.name}:</span>
                    <span className="text-blue-400">Target N${g.targetAmount.toLocaleString()}</span>
                </div>
            );
        case 'Note':
            const n = item.data as Note;
            return (
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                    <span className="text-gray-300 truncate">{n.content}</span>
                </div>
            );
        case 'Projection':
            const p = item.data as Projection;
            return (
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                    <span className="text-gray-300">{p.name}</span>
                </div>
            );
        case 'Budget':
            const b = item.data as Budget;
            return (
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                    <span className="text-gray-300">{b.category} Budget:</span>
                    <span className="text-pink-400">Limit N${b.limit.toFixed(2)}</span>
                </div>
            );
        case 'Cost':
            const c = item.data as CostItem;
            return (
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                    <span className="text-gray-300">{c.type} Cost - {c.name}:</span>
                    <span className="text-orange-400">N${c.amount.toFixed(2)}</span>
                </div>
            );
        default:
            return (
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    <span className="text-gray-300">Archived Item</span>
                </div>
            );
    }
};

const getTypeColor = (type: string) => {
    switch (type) {
        case 'Transaction':
            return 'border-green-500/30 bg-green-500/10';
        case 'Goal':
            return 'border-blue-500/30 bg-blue-500/10';
        case 'Note':
            return 'border-purple-500/30 bg-purple-500/10';
        case 'Projection':
            return 'border-yellow-500/30 bg-yellow-500/10';
        case 'Budget':
            return 'border-pink-500/30 bg-pink-500/10';
        case 'Cost':
            return 'border-orange-500/30 bg-orange-500/10';
        default:
            return 'border-gray-500/30 bg-gray-500/10';
    }
};

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'Transaction':
            return (
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
            );
        case 'Goal':
            return (
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
        case 'Note':
            return (
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            );
        case 'Projection':
            return (
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            );
        case 'Budget':
            return (
                <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            );
        case 'Cost':
            return (
                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
            );
        default:
            return (
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            );
    }
};

const HistoryCard: React.FC<{ item: ArchiveItem; onRestore: () => void; onDelete: () => void; }> = ({ item, onRestore, onDelete }) => {
    const cardColor = getTypeColor(item.type);
    const icon = getTypeIcon(item.type);
    
    return (
        <Card className={`p-4 border ${cardColor} transition-all duration-200 hover:scale-[1.02]`}>
            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                        {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium bg-gray-700/50 text-gray-300 px-2 py-1 rounded-md border border-gray-600/50">{item.type}</span>
                        </div>
                        <div className="text-sm">
                            <ArchivedItemDetails item={item} />
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                        onClick={onRestore}
                        className="text-blue-300 hover:text-blue-100 hover:bg-blue-600/20 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-blue-500/30"
                    >
                        Restore
                    </button>
                    <button
                        onClick={onDelete}
                        className="text-red-300 hover:text-red-100 hover:bg-red-600/20 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-red-500/30"
                    >
                        Delete Forever
                    </button>
                </div>
            </div>
            <div className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-700/50">
                Deleted on: {new Date(item.deletedAt).toLocaleString()}
            </div>
        </Card>
    );
};

const History: React.FC<HistoryProps> = ({ archive, restoreItem, permanentlyDeleteItem }) => {
    return (
        <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
            {/* Info Card */}
            <Card className="p-6 bg-gradient-to-br from-gray-500/20 to-gray-600/20 border border-gray-500/30">
                <h2 className="text-xl font-bold text-white mb-3">Deleted Items History</h2>
                <p className="text-gray-300 text-sm leading-relaxed">
                    View and manage your deleted items. You can restore items or permanently delete them from your history.
                </p>
            </Card>
            
            {archive.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                    {archive.map(item => (
                        <HistoryCard 
                            key={item.id} 
                            item={item} 
                            onRestore={() => restoreItem(item)} 
                            onDelete={() => permanentlyDeleteItem(item.id)} 
                        />
                    ))}
                </div>
            ) : (
                <Card className="p-8 text-center text-gray-300 bg-gradient-to-br from-gray-500/20 to-gray-600/20 border border-gray-500/30">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-600/30 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>
                    <p className="text-lg font-medium text-white mb-2">Your history is empty</p>
                    <p className="text-sm text-gray-400">Deleted items will appear here for you to restore or permanently delete.</p>
                </Card>
            )}
        </div>
    );
};

export default History;
