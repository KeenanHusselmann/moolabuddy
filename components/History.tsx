
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
            return <p>{t.description}: <span className={t.type === TransactionType.INCOME ? 'text-green-400' : 'text-red-400'}>{t.type === TransactionType.INCOME ? '+' : '-'}N${t.amount.toFixed(2)}</span></p>;
        case 'Goal':
            const g = item.data as Goal;
            return <p>{g.name}: Target N${g.targetAmount.toLocaleString()}</p>;
        case 'Note':
            const n = item.data as Note;
            return <p className="truncate">{n.content}</p>;
        case 'Projection':
            const p = item.data as Projection;
            return <p>{p.name}</p>;
        case 'Budget':
            const b = item.data as Budget;
            return <p>{b.category} Budget: Limit N${b.limit.toFixed(2)}</p>
        case 'Cost':
            const c = item.data as CostItem;
            return <p>{c.type} Cost - {c.name}: N${c.amount.toFixed(2)}</p>
        default:
            return <p>Archived Item</p>;
    }
};

const getTypeGradient = (type: string) => {
    switch (type) {
        case 'Transaction':
            return 'from-green-400/80 to-green-600/80';
        case 'Goal':
            return 'from-blue-400/80 to-blue-600/80';
        case 'Note':
            return 'from-purple-400/80 to-purple-600/80';
        case 'Projection':
            return 'from-yellow-400/80 to-yellow-600/80';
        case 'Budget':
            return 'from-pink-400/80 to-pink-600/80';
        case 'Cost':
            return 'from-orange-400/80 to-orange-600/80';
        default:
            return 'from-gray-400/80 to-gray-600/80';
    }
};

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'Transaction':
            return '💰';
        case 'Goal':
            return '🎯';
        case 'Note':
            return '📝';
        case 'Projection':
            return '📈';
        case 'Budget':
            return '📊';
        case 'Cost':
            return '💸';
        default:
            return '📦';
    }
};

const HistoryCard: React.FC<{ item: ArchiveItem; onRestore: () => void; onDelete: () => void; }> = ({ item, onRestore, onDelete }) => {
    const gradient = getTypeGradient(item.type);
    const icon = getTypeIcon(item.type);
    
    return (
        <Card className={`p-5 bg-gradient-to-br ${gradient} shadow-lg border-0`}>
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3 flex-grow">
                    <div className="text-2xl">{icon}</div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold bg-white/20 text-white px-2 py-1 rounded-md">{item.type}</span>
                        </div>
                        <div className="text-white"><ArchivedItemDetails item={item} /></div>
                                </div>
                            </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                        onClick={onRestore}
                        className="text-blue-100 hover:text-white p-1 rounded bg-blue-900/30"
                                >
                                    Restore
                                </button>
                                <button
                        onClick={onDelete}
                        className="text-red-200 hover:text-white p-1 rounded bg-red-900/30"
                                >
                                    Delete Forever
                                </button>
                </div>
            </div>
            <div className="text-xs text-gray-200">
                Deleted on: {new Date(item.deletedAt).toLocaleString()}
                            </div>
                        </Card>
    );
};

const History: React.FC<HistoryProps> = ({ archive, restoreItem, permanentlyDeleteItem }) => {
    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-2">Deleted Items History</h2>
            
            {archive.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Card className="p-8 text-center text-gray-200 bg-gradient-to-br from-gray-400/20 to-gray-600/20 border border-gray-500/30">
                    <div className="text-4xl mb-2">🗑️</div>
                    <p>Your history is empty.</p>
                    <p className="mt-2 text-sm text-gray-300">Deleted items will appear here.</p>
                </Card>
            )}
        </div>
    );
};

export default History;
