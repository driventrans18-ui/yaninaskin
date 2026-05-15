'use client';

import { useState, useEffect } from 'react';
import { getAboutContent, updateAboutContent } from '../../actions/content';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { AdminSetupWarning } from '@/components/AdminSetupWarning';

type AboutData = {
  eyebrow?: string;
  name?: string;
  bio1?: string;
  bio2?: string;
  bio3?: string;
  badges?: string[];
};

export default function AdminAboutPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [about, setAbout] = useState<AboutData>({});
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('admin-auth');
    if (stored === 'true') {
      setIsAuthenticated(true);
      loadAbout();
    }
  }, []);

  const loadAbout = async () => {
    const result = await getAboutContent();
    if (result.data) {
      setAbout(result.data);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'skinbeauty') {
      setIsAuthenticated(true);
      localStorage.setItem('admin-auth', 'true');
      loadAbout();
    } else {
      alert('Incorrect password');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');
    try {
      const result = await updateAboutContent(about);
      if (result.success) {
        setMessage('✓ Bio saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('✗ Error saving bio: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      setMessage('✗ Error: ' + String(error));
    }
    setIsSaving(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-2 text-slate-900">Admin Panel</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
            <button
              type="submit"
              className="w-full bg-slate-900 text-white py-2 rounded-lg font-medium hover:bg-slate-800"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Admin Panel</h1>
            <div className="flex gap-4">
              <a href="/admin/reviews" className="text-sm font-medium px-3 py-1 text-slate-600 hover:text-slate-900">Reviews</a>
              <a href="/admin/services" className="text-sm font-medium px-3 py-1 text-slate-600 hover:text-slate-900">Services</a>
              <a href="/admin/about" className="text-sm font-medium px-3 py-1 bg-slate-900 text-white rounded">Bio</a>
            </div>
          </div>
          <div className="flex gap-2">
            <a href="/" className="px-4 py-2 bg-slate-600 text-white rounded-lg font-medium hover:bg-slate-700">← Back</a>
            <button onClick={() => { localStorage.removeItem('admin-auth'); window.location.href = '/admin/reviews'; }} className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">Logout</button>
          </div>
        </div>

        <AdminSetupWarning />

        <div className="bg-white rounded-lg p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Eyebrow</label>
            <Input
              value={about.eyebrow || ''}
              onChange={(e) => setAbout({...about, eyebrow: e.target.value})}
              placeholder="e.g., Meet Your Esthetician"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
            <Input
              value={about.name || ''}
              onChange={(e) => setAbout({...about, name: e.target.value})}
              placeholder="Full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Bio Paragraph 1</label>
            <Textarea
              value={about.bio1 || ''}
              onChange={(e) => setAbout({...about, bio1: e.target.value})}
              placeholder="First bio paragraph..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Bio Paragraph 2</label>
            <Textarea
              value={about.bio2 || ''}
              onChange={(e) => setAbout({...about, bio2: e.target.value})}
              placeholder="Second bio paragraph..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Bio Paragraph 3</label>
            <Textarea
              value={about.bio3 || ''}
              onChange={(e) => setAbout({...about, bio3: e.target.value})}
              placeholder="Third bio paragraph..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Badges (comma-separated)</label>
            <Input
              value={(about.badges || []).join(', ')}
              onChange={(e) => setAbout({...about, badges: e.target.value.split(',').map(b => b.trim())})}
              placeholder="Licensed Esthetician, Rochester NY, Skin Specialist"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Bio'}
          </button>

          {message && (
            <div className={`p-3 rounded-lg text-sm whitespace-pre-wrap ${message.startsWith('✓') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message}
              {message.includes('missing') && (
                <p className="text-xs mt-2 opacity-75">
                  Note: Missing SUPABASE_SERVICE_ROLE_KEY environment variable. Check your deployment settings.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
