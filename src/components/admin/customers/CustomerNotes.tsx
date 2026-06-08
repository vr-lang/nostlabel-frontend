import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Calendar, User, Loader2, AlertCircle } from 'lucide-react';
import { apiClient } from '../../../services/authService';

interface Note {
  _id: string;
  note: string;
  createdAt: string;
  createdBy?: {
    name: string;
    email: string;
  };
}

interface CustomerNotesProps {
  customerId: string;
  onTimelineUpdateRequired: () => void;
}

export const CustomerNotes: React.FC<CustomerNotesProps> = ({ customerId, onTimelineUpdateRequired }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/admin/customers/${customerId}/notes`);
      if (res.data && res.data.success) {
        setNotes(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load notes:', err);
      setError(err.message || 'Notes sync failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    setActionLoading(true);
    try {
      const res = await apiClient.post(`/admin/customers/${customerId}/notes`, { note: newNoteText });
      if (res.data && res.data.success) {
        setNotes(prev => [res.data.data, ...prev]);
        setNewNoteText('');
        onTimelineUpdateRequired(); // Refresh timeline since note was created
      }
    } catch (err: any) {
      alert(err.message || 'Note submission failure');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('DELETE THIS CLIENT CRM NOTE PERMANENTLY?')) return;

    try {
      const res = await apiClient.delete(`/admin/customers/notes/${noteId}`);
      if (res.data && res.data.success) {
        setNotes(prev => prev.filter(n => n._id !== noteId));
        onTimelineUpdateRequired(); // Refresh timeline since note was deleted
      }
    } catch (err: any) {
      alert(err.message || 'Note deletion failure');
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [customerId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 space-y-2 select-none">
        <Loader2 size={16} className="animate-spin text-accent-gold" />
        <span className="text-[8px] uppercase tracking-[0.2em] text-white/30">Loading CRM notes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-sm flex items-center space-x-2 text-red-500 select-none">
        <AlertCircle size={12} />
        <span className="text-[8px] uppercase tracking-wider">Notes Fetch Failure: {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono text-left select-none">
      
      {/* Create Note Input Form */}
      <form onSubmit={handleAddNote} className="space-y-3">
        <div className="relative border border-white/5 bg-white/[0.01] hover:border-white/10 transition-colors rounded-sm overflow-hidden">
          <textarea
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            placeholder="Type confidential client details, tailoring preferences, sizing requirements, or relationship milestones..."
            rows={3}
            className="w-full bg-transparent p-4 text-[10px] text-white focus:outline-none placeholder:text-white/20 resize-none uppercase tracking-wider"
          />
        </div>
        <button
          type="submit"
          disabled={actionLoading || !newNoteText.trim()}
          className="px-4 py-2.5 bg-accent-gold disabled:opacity-30 disabled:hover:bg-accent-gold disabled:text-text-dark hover:bg-accent-gold/90 text-text-dark font-bold text-[9px] uppercase tracking-wider rounded-xs transition-all flex items-center space-x-1.5 cursor-pointer ml-auto"
        >
          {actionLoading ? <Loader2 size={10} className="animate-spin" /> : <Plus size={10} />}
          <span>Record Note</span>
        </button>
      </form>

      {/* Notes list */}
      <div className="space-y-4 pt-2">
        <h4 className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] border-b border-white/5 pb-2">
          Note Records ({notes.length})
        </h4>

        {notes.length === 0 ? (
          <p className="text-[10px] text-white/20 text-center py-4 uppercase">
            No note records found for this client.
          </p>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {notes.map((note) => (
                <motion.div
                  key={note._id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white/[0.01] border border-white/5 p-4 rounded-sm flex justify-between items-start space-x-4 hover:bg-white/[0.02] transition-colors relative group"
                >
                  <div className="space-y-2.5 flex-grow">
                    {/* Notes text */}
                    <p className="text-[10px] text-white/80 uppercase leading-relaxed tracking-wide font-light whitespace-pre-wrap">
                      {note.note}
                    </p>

                    {/* Metadata creator/time */}
                    <div className="flex flex-wrap items-center gap-3 text-[8px] text-white/30 uppercase tracking-widest font-bold">
                      <span className="flex items-center space-x-1">
                        <User size={8} className="text-white/20" />
                        <span>BY: {note.createdBy?.name || 'Director Admin'}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar size={8} className="text-white/20" />
                        <span>{new Date(note.createdAt).toLocaleString()}</span>
                      </span>
                    </div>
                  </div>

                  {/* Delete note button */}
                  <button
                    onClick={() => handleDeleteNote(note._id)}
                    className="p-1.5 border border-transparent hover:border-red-500/10 hover:bg-red-500/5 text-white/30 hover:text-red-500 rounded-xs transition-all cursor-pointer opacity-0 group-hover:opacity-100 shrink-0 self-start mt-0.5"
                    title="Delete Note"
                  >
                    <Trash2 size={11} />
                  </button>

                  {/* Corner Marks */}
                  <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-white/10 group-hover:border-white/20 transition-colors" />
                  <div className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-white/10 group-hover:border-white/20 transition-colors" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

    </div>
  );
};

export default CustomerNotes;
