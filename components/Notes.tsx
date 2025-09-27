
import React, { useState, useEffect, useMemo } from 'react';
import type { Note } from '../types';
import Card from './Card';
import { useToast } from './ToastContext';

interface NotesProps {
  notes: Note[];
  saveNote: (noteData: { 
    content: string, 
    reminderAt: string | null,
    isRecurring?: boolean,
    recurringType?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null,
    recurringDay?: number | null
  }) => void;
  deleteNote: (id: string) => void;
  updateNote: (id: string, content: string, reminderAt: string | null, isRecurring?: boolean, recurringType?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null, recurringDay?: number | null) => void;
}

const EditNoteModal: React.FC<{
  note: Note | null;
  onClose: () => void;
  onSave: (id: string, content: string, reminderAt: string | null, isRecurring?: boolean, recurringType?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null, recurringDay?: number | null) => void;
}> = ({ note, onClose, onSave }) => {
  const [content, setContent] = useState('');
  const [showReminder, setShowReminder] = useState(false);
  const [reminderDateTime, setReminderDateTime] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');
  const [recurringDay, setRecurringDay] = useState<number>(1); // Monday by default
  const { showToast } = useToast();

  const formatDateTimeForInput = (isoString?: string | null) => {
      if (!isoString) return '';
      const date = new Date(isoString);
      // Format to YYYY-MM-DDTHH:mm
      return date.getFullYear() +
          '-' + ('0' + (date.getMonth() + 1)).slice(-2) +
          '-' + ('0' + date.getDate()).slice(-2) +
          'T' + ('0' + date.getHours()).slice(-2) +
          ':' + ('0' + date.getMinutes()).slice(-2);
  };

  useEffect(() => {
    if (note) {
      setContent(note.content);
      setShowReminder(!!note.reminderAt);
      setReminderDateTime(formatDateTimeForInput(note.reminderAt));
      setIsRecurring(!!note.isRecurring);
      setRecurringType(note.recurringType || 'weekly');
      setRecurringDay(note.recurringDay || 1);
    }
  }, [note]);

  if (!note) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      showToast("Note content cannot be empty.", "error");
      return;
    }
    const finalReminder = showReminder && reminderDateTime ? new Date(reminderDateTime).toISOString() : null;
    onSave(note.id, content, finalReminder, isRecurring, isRecurring ? recurringType : null, isRecurring ? recurringDay : null);
  };

  const getDayName = (day: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <Card className="p-6 w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-4">Edit Note</h2>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-48 bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <div className="flex items-center justify-between">
            <label htmlFor="reminder-toggle-edit" className="flex items-center cursor-pointer">
              <span className="text-gray-300 mr-3">Set Reminder</span>
              <div className="relative">
                <input type="checkbox" id="reminder-toggle-edit" className="sr-only" checked={showReminder} onChange={() => setShowReminder(!showReminder)} />
                <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${showReminder ? 'transform translate-x-full bg-brand-500' : ''}`}></div>
              </div>
            </label>
          </div>
          {showReminder && (
            <div className="space-y-4">
              <div>
                <label htmlFor="reminder-datetime-edit" className="block text-sm font-medium text-gray-300">Reminder Time</label>
                <input 
                  type="datetime-local" 
                  id="reminder-datetime-edit"
                  value={reminderDateTime}
                  onChange={e => setReminderDateTime(e.target.value)}
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label htmlFor="recurring-toggle-edit" className="flex items-center cursor-pointer">
                  <span className="text-gray-300 mr-3">Repeat Reminder</span>
                  <div className="relative">
                    <input type="checkbox" id="recurring-toggle-edit" className="sr-only" checked={isRecurring} onChange={() => setIsRecurring(!isRecurring)} />
                    <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${isRecurring ? 'transform translate-x-full bg-brand-500' : ''}`}></div>
                  </div>
                </label>
              </div>

              {isRecurring && (
                <div className="space-y-3">
                  <div>
                    <label htmlFor="recurring-type-edit" className="block text-sm font-medium text-gray-300">Repeat Frequency</label>
                    <select 
                      id="recurring-type-edit"
                      value={recurringType}
                      onChange={e => setRecurringType(e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly')}
                      className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>

                  {recurringType === 'weekly' && (
                    <div>
                      <label htmlFor="recurring-day-edit" className="block text-sm font-medium text-gray-300">Day of Week</label>
                      <select 
                        id="recurring-day-edit"
                        value={recurringDay}
                        onChange={e => setRecurringDay(parseInt(e.target.value))}
                        className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                      >
                        <option value={0}>Sunday</option>
                        <option value={1}>Monday</option>
                        <option value={2}>Tuesday</option>
                        <option value={3}>Wednesday</option>
                        <option value={4}>Thursday</option>
                        <option value={5}>Friday</option>
                        <option value={6}>Saturday</option>
                      </select>
                    </div>
                  )}

                  {recurringType === 'monthly' && (
                    <div>
                      <label htmlFor="recurring-day-monthly-edit" className="block text-sm font-medium text-gray-300">Day of Month</label>
                      <input 
                        type="number" 
                        id="recurring-day-monthly-edit"
                        min="1" 
                        max="31"
                        value={recurringDay}
                        onChange={e => setRecurringDay(parseInt(e.target.value))}
                        className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                      />
                    </div>
                  )}

                  <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <p className="text-xs text-blue-300">
                      {recurringType === 'daily' && 'Reminder will repeat every day at the specified time.'}
                      {recurringType === 'weekly' && `Reminder will repeat every ${getDayName(recurringDay)} at the specified time.`}
                      {recurringType === 'monthly' && `Reminder will repeat on the ${recurringDay}${recurringDay === 1 ? 'st' : recurringDay === 2 ? 'nd' : recurringDay === 3 ? 'rd' : 'th'} of each month.`}
                      {recurringType === 'yearly' && 'Reminder will repeat annually on the same date and time.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          <button type="submit" className="w-full bg-brand-600 text-white font-semibold py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg hover:bg-brand-700 transition-colors text-sm sm:text-base">
            Save Changes
          </button>
        </form>
      </Card>
    </div>
  );
};

const Notes: React.FC<NotesProps> = ({ notes, saveNote, deleteNote, updateNote }) => {
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showReminder, setShowReminder] = useState(false);
  const [reminderDateTime, setReminderDateTime] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');
  const [recurringDay, setRecurringDay] = useState<number>(1); // Monday by default
  const { showToast } = useToast();

  // Enhanced state for filtering and analytics
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'reminders' | 'no-reminders' | 'recurring' | 'overdue'>('all');
  const [sortBy, setSortBy] = useState<'created' | 'reminder' | 'content'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Notes analytics
  const analytics = useMemo(() => {
    const totalNotes = notes.length;
    const notesWithReminders = notes.filter(n => n.reminderAt).length;
    const recurringNotes = notes.filter(n => n.isRecurring).length;
    const today = new Date();
    const overdueReminders = notes.filter(n => {
      if (!n.reminderAt) return false;
      return new Date(n.reminderAt) < today;
    }).length;
    const upcomingReminders = notes.filter(n => {
      if (!n.reminderAt) return false;
      const reminderDate = new Date(n.reminderAt);
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      return reminderDate >= today && reminderDate <= nextWeek;
    }).length;

    return {
      totalNotes,
      notesWithReminders,
      recurringNotes,
      overdueReminders,
      upcomingReminders,
      notesWithoutReminders: totalNotes - notesWithReminders
    };
  }, [notes]);

  // Filtered and sorted notes
  const filteredAndSortedNotes = useMemo(() => {
    let filtered = [...notes];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(note =>
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    const today = new Date();
    switch (filterType) {
      case 'reminders':
        filtered = filtered.filter(n => n.reminderAt);
        break;
      case 'no-reminders':
        filtered = filtered.filter(n => !n.reminderAt);
        break;
      case 'recurring':
        filtered = filtered.filter(n => n.isRecurring);
        break;
      case 'overdue':
        filtered = filtered.filter(n => {
          if (!n.reminderAt) return false;
          return new Date(n.reminderAt) < today;
        });
        break;
    }

    // Sort notes
    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'reminder':
          const aReminder = a.reminderAt ? new Date(a.reminderAt).getTime() : 0;
          const bReminder = b.reminderAt ? new Date(b.reminderAt).getTime() : 0;
          comparison = aReminder - bReminder;
          break;
        case 'content':
          comparison = a.content.localeCompare(b.content);
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [notes, searchTerm, filterType, sortBy, sortOrder]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setSortBy('created');
    setSortOrder('desc');
  };

  const handleSave = () => {
    if (!newNote.trim()) {
      showToast('Please enter note content.', 'error');
      return;
    }
    const reminderAt = showReminder && reminderDateTime ? new Date(reminderDateTime).toISOString() : null;
    saveNote({ 
      content: newNote, 
      reminderAt,
      isRecurring: isRecurring,
      recurringType: isRecurring ? recurringType : null,
      recurringDay: isRecurring ? recurringDay : null
    });
    setNewNote('');
    setShowReminder(false);
    setReminderDateTime('');
    setIsRecurring(false);
    setRecurringType('weekly');
    setRecurringDay(1);
    showToast('Note saved successfully!', 'success');
  };

  const handleUpdate = (id: string, content: string, reminderAt: string | null, isRecurring?: boolean, recurringType?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null, recurringDay?: number | null) => {
    updateNote(id, content, reminderAt, isRecurring, recurringType, recurringDay);
    setEditingNote(null);
    showToast('Note updated successfully!', 'success');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteNote(id);
      showToast('Note deleted successfully!', 'success');
    }
  };

  const formatReminderText = (note: Note) => {
    if (!note.reminderAt) return '';
    const reminderDate = new Date(note.reminderAt);
    const now = new Date();
    const diffMs = reminderDate.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0) {
      return 'Overdue';
    } else if (diffMins < 60) {
      return `In ${diffMins} minutes`;
    } else if (diffHours < 24) {
      return `In ${diffHours} hours`;
    } else {
      return `In ${diffDays} days`;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Enhanced Header Card */}
      <Card className="p-6 bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Smart Notes & Reminders</h1>
            <p className="text-gray-300 text-sm leading-relaxed">
              Create intelligent notes with advanced reminders, recurring notifications, and powerful organization tools.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-brand-400">{analytics.totalNotes}</div>
              <div className="text-xs text-gray-400">Total</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-400">{analytics.upcomingReminders}</div>
              <div className="text-xs text-gray-400">Upcoming</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-400">{analytics.overdueReminders}</div>
              <div className="text-xs text-gray-400">Overdue</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Stats & Analytics Toggle */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{analytics.totalNotes}</div>
            <div className="text-sm text-gray-300">Total Notes</div>
            <div className="text-xs text-gray-400 mt-1">All time</div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{analytics.notesWithReminders}</div>
            <div className="text-sm text-gray-300">With Reminders</div>
            <div className="text-xs text-gray-400 mt-1">Active alerts</div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{analytics.recurringNotes}</div>
            <div className="text-sm text-gray-300">Recurring</div>
            <div className="text-xs text-gray-400 mt-1">Auto-repeat</div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{analytics.overdueReminders}</div>
            <div className="text-sm text-gray-300">Overdue</div>
            <div className="text-xs text-gray-400 mt-1">Need attention</div>
          </div>
        </Card>
      </div>

      {/* Detailed Analytics Dashboard */}
      {showAnalytics && (
        <Card className="p-6 bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-500/30">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">Advanced Analytics</h3>
            <button
              onClick={() => setShowAnalytics(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{analytics.upcomingReminders}</div>
                <div className="text-sm text-gray-400">Upcoming (7 days)</div>
                <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-400 h-2 rounded-full" 
                    style={{ width: `${Math.min((analytics.upcomingReminders / Math.max(analytics.notesWithReminders, 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-400">{analytics.notesWithoutReminders}</div>
                <div className="text-sm text-gray-400">Simple Notes</div>
                <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gray-400 h-2 rounded-full" 
                    style={{ width: `${Math.min((analytics.notesWithoutReminders / Math.max(analytics.totalNotes, 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{((analytics.notesWithReminders / Math.max(analytics.totalNotes, 1)) * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-400">Reminder Rate</div>
                <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-400 h-2 rounded-full" 
                    style={{ width: `${(analytics.notesWithReminders / Math.max(analytics.totalNotes, 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{((analytics.recurringNotes / Math.max(analytics.notesWithReminders, 1)) * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-400">Recurring Rate</div>
                <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-400 h-2 rounded-full" 
                    style={{ width: `${(analytics.recurringNotes / Math.max(analytics.notesWithReminders, 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Productivity Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
              <h4 className="font-semibold text-white mb-3">Productivity Score</h4>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${
                        analytics.totalNotes > 10 ? 'bg-green-500' : 
                        analytics.totalNotes > 5 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min((analytics.totalNotes / 20) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <span className="font-bold text-white">
                  {analytics.totalNotes > 10 ? 'High' : analytics.totalNotes > 5 ? 'Medium' : 'Low'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Based on note activity and reminder usage
              </p>
            </div>

            <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
              <h4 className="font-semibold text-white mb-3">Organization Level</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Reminders Set</span>
                  <span className="text-white">{analytics.notesWithReminders}/{analytics.totalNotes}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Recurring Setup</span>
                  <span className="text-white">{analytics.recurringNotes}/{analytics.notesWithReminders}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">On Time</span>
                  <span className="text-white">{analytics.notesWithReminders - analytics.overdueReminders}/{analytics.notesWithReminders}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Enhanced Filter Controls */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Note Management</h2>
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

        {/* Search and Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search note content..."
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Filter</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'reminders' | 'no-reminders' | 'recurring' | 'overdue')}
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            >
              <option value="all">All Notes</option>
              <option value="reminders">With Reminders</option>
              <option value="no-reminders">Without Reminders</option>
              <option value="recurring">Recurring</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Sort By</label>
            <div className="flex gap-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'created' | 'reminder' | 'content')}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-md py-2 px-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              >
                <option value="created">Created Date</option>
                <option value="reminder">Reminder Date</option>
                <option value="content">Content</option>
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
                Showing <span className="font-semibold text-white">{filteredAndSortedNotes.length}</span> of{' '}
                <span className="font-semibold text-white">{notes.length}</span> notes
                {(searchTerm || filterType !== 'all') && (
                  <span className="text-brand-400 font-medium"> (filtered)</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Add Note Form */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-white mb-4">Add New Note</h3>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Write your note here..."
          className="w-full h-32 bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-gray-400"
        />
        <div className="mt-4 space-y-4">
           <div className="flex items-center justify-between">
            <label htmlFor="reminder-toggle-new" className="flex items-center cursor-pointer">
              <span className="text-gray-300 mr-3">Set Reminder</span>
              <div className="relative">
                <input type="checkbox" id="reminder-toggle-new" className="sr-only" checked={showReminder} onChange={() => setShowReminder(!showReminder)} />
                <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${showReminder ? 'transform translate-x-full bg-brand-500' : ''}`}></div>
              </div>
            </label>
          </div>
          {showReminder && (
            <div className="space-y-4">
              <div>
                <label htmlFor="reminder-datetime-new" className="block text-sm font-medium text-gray-300">Reminder Time</label>
                <input 
                  type="datetime-local" 
                  id="reminder-datetime-new"
                  value={reminderDateTime}
                  onChange={e => setReminderDateTime(e.target.value)}
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label htmlFor="recurring-toggle-new" className="flex items-center cursor-pointer">
                  <span className="text-gray-300 mr-3">Repeat Reminder</span>
                  <div className="relative">
                    <input type="checkbox" id="recurring-toggle-new" className="sr-only" checked={isRecurring} onChange={() => setIsRecurring(!isRecurring)} />
                    <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${isRecurring ? 'transform translate-x-full bg-brand-500' : ''}`}></div>
                  </div>
                </label>
              </div>

              {isRecurring && (
                <div className="space-y-3">
                  <div>
                    <label htmlFor="recurring-type-new" className="block text-sm font-medium text-gray-300">Repeat Frequency</label>
                    <select 
                      id="recurring-type-new"
                      value={recurringType}
                      onChange={e => setRecurringType(e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly')}
                      className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>

                  {recurringType === 'weekly' && (
                    <div>
                      <label htmlFor="recurring-day-new" className="block text-sm font-medium text-gray-300">Day of Week</label>
                      <select 
                        id="recurring-day-new"
                        value={recurringDay}
                        onChange={e => setRecurringDay(parseInt(e.target.value))}
                        className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                      >
                        <option value={0}>Sunday</option>
                        <option value={1}>Monday</option>
                        <option value={2}>Tuesday</option>
                        <option value={3}>Wednesday</option>
                        <option value={4}>Thursday</option>
                        <option value={5}>Friday</option>
                        <option value={6}>Saturday</option>
                      </select>
                    </div>
                  )}

                  {recurringType === 'monthly' && (
                    <div>
                      <label htmlFor="recurring-day-monthly-new" className="block text-sm font-medium text-gray-300">Day of Month</label>
                      <input 
                        type="number" 
                        id="recurring-day-monthly-new"
                        min="1" 
                        max="31"
                        value={recurringDay}
                        onChange={e => setRecurringDay(parseInt(e.target.value))}
                        className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white"
                      />
                    </div>
                  )}

                  <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <p className="text-xs text-blue-300">
                      {recurringType === 'daily' && 'Reminder will repeat every day at the specified time.'}
                      {recurringType === 'weekly' && `Reminder will repeat every ${getDayName(recurringDay)} at the specified time.`}
                      {recurringType === 'monthly' && `Reminder will repeat on the ${recurringDay}${recurringDay === 1 ? 'st' : recurringDay === 2 ? 'nd' : recurringDay === 3 ? 'rd' : 'th'} of each month.`}
                      {recurringType === 'yearly' && 'Reminder will repeat annually on the same date and time.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={!newNote.trim()}
          className="mt-4 w-full bg-brand-600 text-white font-semibold py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg hover:bg-brand-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          Save Note
        </button>
      </Card>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedNotes.length > 0 ? (
          filteredAndSortedNotes.map(note => (
            <Card key={note.id} className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-white text-sm leading-relaxed break-words">{note.content}</p>
                  </div>
                  <div className="flex gap-2 ml-3">
                    <button
                      onClick={() => setEditingNote(note)}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                      title="Edit note"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Delete note"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Note metadata */}
                <div className="space-y-2 text-xs">
                  <div className="text-gray-400">
                    Created: {new Date(note.createdAt).toLocaleDateString()}
                  </div>
                  
                  {note.reminderAt && (
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400">⏰</span>
                      <div>
                        <div className="text-yellow-400">
                          {new Date(note.reminderAt).toLocaleString()}
                        </div>
                        <div className={`text-xs ${
                          new Date(note.reminderAt) < new Date() ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {formatReminderText(note)}
                        </div>
                      </div>
                    </div>
                  )}

                  {note.isRecurring && (
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400">🔄</span>
                      <span className="text-blue-400 capitalize">
                        {note.recurringType}
                        {note.recurringType === 'weekly' && note.recurringDay !== null && note.recurringDay !== undefined && ` (${getDayName(note.recurringDay)})`}
                        {note.recurringType === 'monthly' && note.recurringDay && ` (${note.recurringDay}${note.recurringDay === 1 ? 'st' : note.recurringDay === 2 ? 'nd' : note.recurringDay === 3 ? 'rd' : 'th'})`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center col-span-full">
            <div className="text-4xl mb-4 opacity-50">📝</div>
            <p className="text-gray-400 mb-2">
              {searchTerm || filterType !== 'all' ? 'No notes match your current filters' : 'No notes yet'}
            </p>
            {(searchTerm || filterType !== 'all') && (
              <button
                onClick={clearFilters}
                className="text-brand-400 hover:text-brand-300 transition-colors text-sm"
              >
                Clear filters to see all notes
              </button>
            )}
          </Card>
        )}
      </div>

      {/* Edit Note Modal */}
      {editingNote && (
        <EditNoteModal 
          note={editingNote} 
          onClose={() => setEditingNote(null)} 
          onSave={handleUpdate} 
        />
      )}
    </div>
  );

  function getDayName(day: number) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  }
};

export default Notes;