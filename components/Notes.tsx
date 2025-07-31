
import React, { useState, useEffect } from 'react';
import type { Note } from '../types';
import Card from './Card';
import AlarmClockIcon from './icons/AlarmClockIcon';

interface NotesProps {
  notes: Note[];
  saveNote: (noteData: { content: string, reminderAt: string | null }) => void;
  deleteNote: (id: string) => void;
  updateNote: (id: string, content: string, reminderAt: string | null) => void;
}

const EditNoteModal: React.FC<{
  note: Note | null;
  onClose: () => void;
  onSave: (id: string, content: string, reminderAt: string | null) => void;
}> = ({ note, onClose, onSave }) => {
  const [content, setContent] = useState('');
  const [showReminder, setShowReminder] = useState(false);
  const [reminderDateTime, setReminderDateTime] = useState('');

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
    }
  }, [note]);

  if (!note) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      alert("Note content cannot be empty.");
      return;
    }
    const finalReminder = showReminder && reminderDateTime ? new Date(reminderDateTime).toISOString() : null;
    onSave(note.id, content, finalReminder);
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
          )}
          <button type="submit" className="w-full bg-brand-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-brand-700 transition-colors">
            Save Changes
          </button>
        </form>
      </Card>
    </div>
  );
};

const NoteCard: React.FC<{ note: Note; onEdit: () => void; onDelete: () => void; }> = ({ note, onEdit, onDelete }) => {
  const hasReminder = !!note.reminderAt;
  const gradient = hasReminder 
    ? 'from-amber-400/80 to-orange-600/80' 
    : 'from-blue-400/80 to-purple-600/80';

  return (
    <Card className={`p-5 bg-gradient-to-br ${gradient} shadow-lg border-0 relative overflow-hidden`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-grow">
          <p className="text-white whitespace-pre-wrap text-sm leading-relaxed">{note.content}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          <button onClick={onEdit} className="text-blue-100 hover:text-white p-1 rounded bg-blue-900/30">Edit</button>
          <button onClick={onDelete} className="text-red-200 hover:text-white p-1 rounded bg-red-900/30">Delete</button>
        </div>
      </div>
      <div className="text-xs text-gray-200 space-y-1">
        <p>Saved on: {new Date(note.createdAt).toLocaleDateString()}</p>
        {hasReminder && (
          <div className="flex items-center gap-1.5 text-amber-200">
            <AlarmClockIcon className="w-4 h-4" />
            <span>Reminder: {new Date(note.reminderAt!).toLocaleString()}</span>
          </div>
        )}
      </div>
    </Card>
  );
};

const Notes: React.FC<NotesProps> = ({ notes, saveNote, deleteNote, updateNote }) => {
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showReminder, setShowReminder] = useState(false);
  const [reminderDateTime, setReminderDateTime] = useState('');

  const handleSave = () => {
    const reminderAt = showReminder && reminderDateTime ? new Date(reminderDateTime).toISOString() : null;
    saveNote({ content: newNote, reminderAt });
    setNewNote('');
    setShowReminder(false);
    setReminderDateTime('');
  };

  const handleUpdate = (id: string, content: string, reminderAt: string | null) => {
    updateNote(id, content, reminderAt);
    setEditingNote(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Info Card */}
      <Card className="p-6 bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30">
        <h2 className="text-xl font-bold text-white mb-3">Financial Notes & Reminders</h2>
        <p className="text-gray-300 text-sm leading-relaxed">
          Keep track of your financial thoughts, goals, and reminders. Create notes with optional 
          notifications for investment ideas, budget plans, or payment reminders.
        </p>
      </Card>
      
      {/* Add Note Form */}
      <Card className="p-6 bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30">
        <h3 className="text-xl font-bold text-white mb-4">New Note</h3>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Jot down your financial thoughts, ideas, or reminders..."
          className="w-full h-32 bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
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
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={!newNote.trim()}
          className="mt-4 w-full bg-brand-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-brand-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          Save Note
        </button>
      </Card>
      
      {/* Notes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.length > 0 ? notes.map(note => (
          <NoteCard key={note.id} note={note} onEdit={() => setEditingNote(note)} onDelete={() => deleteNote(note.id)} />
        )) : (
          <Card className="p-8 text-center text-gray-200 bg-gradient-to-br from-blue-400/20 to-blue-900/20 col-span-full">
            <div className="text-4xl mb-2">📝</div>
                <p>You have no saved notes.</p>
            </Card>
        )}
      </div>
      
      <EditNoteModal note={editingNote} onClose={() => setEditingNote(null)} onSave={handleUpdate} />
    </div>
  );
};

export default Notes;