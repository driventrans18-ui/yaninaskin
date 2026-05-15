'use client';

import { useState, useEffect } from 'react';
import { getServices, updateService, deleteService, addService } from '../../actions/content';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type Service = {
  id: number;
  category_order: number;
  category_title: string;
  category_description: string | null;
  treatment_order: number;
  treatment_title: string;
  treatment_price: string;
  treatment_duration: string | null;
  treatment_description: string | null;
  treatment_note: string | null;
};

export default function AdminServicesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Record<string, any>>({});

  useEffect(() => {
    const stored = localStorage.getItem('admin-auth');
    if (stored === 'true') {
      setIsAuthenticated(true);
      loadServices();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadServices = async () => {
    const result = await getServices();
    if (result.success) {
      setServices(result.data);
    }
    setIsLoading(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'skinbeauty') {
      setIsAuthenticated(true);
      localStorage.setItem('admin-auth', 'true');
      loadServices();
    } else {
      alert('Incorrect password');
    }
  };

  const handleSave = async (id: number) => {
    await updateService(id, editData);
    setEditingId(null);
    setEditData({});
    loadServices();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this service?')) {
      await deleteService(id);
      loadServices();
    }
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Admin Panel</h1>
            <div className="flex gap-4">
              <a href="/admin/reviews" className="text-sm font-medium px-3 py-1 text-slate-600 hover:text-slate-900">Reviews</a>
              <a href="/admin/services" className="text-sm font-medium px-3 py-1 bg-slate-900 text-white rounded">Services</a>
              <a href="/admin/about" className="text-sm font-medium px-3 py-1 text-slate-600 hover:text-slate-900">Bio</a>
            </div>
          </div>
          <div className="flex gap-2">
            <a href="/" className="px-4 py-2 bg-slate-600 text-white rounded-lg font-medium hover:bg-slate-700">← Back</a>
            <button onClick={() => { localStorage.removeItem('admin-auth'); window.location.href = '/admin/reviews'; }} className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">Logout</button>
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <p>Loading...</p>
          ) : services.length === 0 ? (
            <p className="text-slate-600">No services yet. Add one below.</p>
          ) : (
            services.map(service => (
              <div key={service.id} className="bg-white border-l-4 border-slate-400 rounded-lg p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600">Category</label>
                    <p className="font-semibold">{service.category_title}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">Service</label>
                    <p className="font-semibold">{service.treatment_title}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">Price</label>
                    <p>{service.treatment_price}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">Duration</label>
                    <p>{service.treatment_duration || '-'}</p>
                  </div>
                </div>

                {editingId === service.id ? (
                  <div className="space-y-3 bg-slate-50 p-4 rounded mb-4">
                    <input
                      type="text"
                      value={editData.treatment_title || service.treatment_title}
                      onChange={(e) => setEditData({...editData, treatment_title: e.target.value})}
                      placeholder="Service title"
                      className="w-full px-3 py-2 border rounded"
                    />
                    <input
                      type="text"
                      value={editData.treatment_price || service.treatment_price}
                      onChange={(e) => setEditData({...editData, treatment_price: e.target.value})}
                      placeholder="Price"
                      className="w-full px-3 py-2 border rounded"
                    />
                    <input
                      type="text"
                      value={editData.treatment_duration || service.treatment_duration || ''}
                      onChange={(e) => setEditData({...editData, treatment_duration: e.target.value})}
                      placeholder="Duration"
                      className="w-full px-3 py-2 border rounded"
                    />
                    <textarea
                      value={editData.treatment_description || service.treatment_description || ''}
                      onChange={(e) => setEditData({...editData, treatment_description: e.target.value})}
                      placeholder="Description"
                      rows={3}
                      className="w-full px-3 py-2 border rounded"
                    />
                    <textarea
                      value={editData.treatment_note || service.treatment_note || ''}
                      onChange={(e) => setEditData({...editData, treatment_note: e.target.value})}
                      placeholder="Note"
                      rows={2}
                      className="w-full px-3 py-2 border rounded"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => handleSave(service.id)} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Save</button>
                      <button onClick={() => setEditingId(null)} className="px-4 py-2 border rounded hover:bg-slate-50">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingId(service.id); setEditData({}); }} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">Edit</button>
                    <button onClick={() => handleDelete(service.id)} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Delete</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
