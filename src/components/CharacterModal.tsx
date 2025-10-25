import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { useMutation } from '@apollo/client/react';
import { supabaseClient } from '@/lib/supabaseClient';
import { GET_CHARACTER_NOTES, ADD_NOTE, DELETE_NOTE } from '@/graphql/notesQueries';

interface Character {
  id: string;
  name: string;
  species: string;
  status: string;
  image: string;
}

interface Note {
  id: string;
  character_id: string;
  character_name: string;
  content: string;
  type: string;
  created_at: string;
}

interface NotesData {
  notesCollection: {
    edges: Array<{
      node: Note;
    }>;
  };
}

interface CharacterModalProps {
  character: Character;
  onClose: () => void;
}

export default function CharacterModal({ character, onClose }: CharacterModalProps) {
  const [newNote, setNewNote] = useState('');
  const [generatingInsight, setGeneratingInsight] = useState(false);

  const { data, loading, refetch } = useQuery<NotesData>(GET_CHARACTER_NOTES, {
    client: supabaseClient,
    variables: { characterId: character.id },
  });

  const [addNoteMutation, { loading: adding }] = useMutation(ADD_NOTE, {
    client: supabaseClient,
    onCompleted: () => {
      setNewNote('');
      refetch();
    },
  });

  const [deleteNoteMutation] = useMutation(DELETE_NOTE, {
    client: supabaseClient,
    onCompleted: () => refetch(),
  });

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    addNoteMutation({
      variables: {
        characterId: character.id,
        characterName: character.name,
        content: newNote,
        type: 'user',
      },
    });
  };

  const handleDeleteNote = (noteId: string) => {
    if (confirm('Delete this note?')) {
      deleteNoteMutation({ variables: { id: noteId } });
    }
  };

  const handleGenerateInsight = async () => {
    setGeneratingInsight(true);
    try {
      const res = await fetch('/api/generate/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ character }),
      });

      const json = await res.json();

      if (res.ok) {
        await addNoteMutation({
          variables: {
            characterId: character.id,
            characterName: character.name,
            content: json.insight,
            type: 'ai-insight',
          },
        });
      } else {
        alert(json.error || 'Failed to generate insight');
      }
    } catch (err) {
      alert('Failed to generate insight. Make sure your API key is configured.');
    } finally {
      setGeneratingInsight(false);
    }
  };

  const notes = data?.notesCollection?.edges?.map((edge) => edge.node) || [];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl border border-gray-200 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex gap-4 mb-6">
          <img
            src={character.image}
            alt={character.name}
            className="w-24 h-24 rounded-full border-4 border-blue-100"
          />
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{character.name}</h2>
            <p className="text-gray-600 text-lg">{character.species}</p>
            <p className={`text-sm font-semibold ${
              character.status === 'Alive' ? 'text-green-600' :
              character.status === 'Dead' ? 'text-red-600' :
              'text-gray-500'
            }`}>
              {character.status}
            </p>
          </div>
        </div>

        <div className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Add Note</h3>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Write your observations about this character..."
            className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
            rows={3}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleAddNote}
              disabled={adding || !newNote.trim()}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding ? 'Adding...' : 'Add Note'}
            </button>
            <button
              onClick={handleGenerateInsight}
              disabled={generatingInsight}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              title="Generate AI-powered character insight"
            >
              {generatingInsight ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                  Generating...
                </>
              ) : (
                'AI Insight'
              )}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Notes ({notes.length})
            </h3>
            {loading && (
              <span className="text-sm text-gray-500 flex items-center gap-2">
                <span className="inline-block animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-blue-600"></span>
                Loading...
              </span>
            )}
          </div>

          {notes.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
              <p className="text-lg">📝</p>
              <p className="mt-2">No notes yet. Add your first observation!</p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors group"
              >
                <div className="flex justify-between items-start gap-2">
                  <p className="text-gray-900 flex-1">{note.content}</p>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete note"
                  >
                    ×
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-1 rounded font-medium ${
                    note.type === 'ai-insight' 
                      ? 'bg-gray-100 text-gray-700'
                      : note.type === 'narration'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-green-50 text-green-700'
                  }`}>
                    {note.type}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(note.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
