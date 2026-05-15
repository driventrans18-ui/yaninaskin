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
  const [message, setMessage] = useState('');
  const [isAddingService, setIsAddingService] = useState(false);
  const [newService, setNewService] = useState({
    category_title: '',
    treatment_title: '',
    treatment_price: '',
    treatment_duration: '',
    treatment_description: '',
    treatment_note: '',
  });

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
    setMessage('');
    const result = await updateService(id, editData);
    if (result.success) {
      setMessage('✓ Service saved!');
      setEditingId(null);
      setEditData({});
      loadServices();
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('✗ Error: ' + (result.error || 'Failed to save'));
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this service?')) {
      await deleteService(id);
      loadServices();
    }
  };

  const handleAddService = async () => {
    setMessage('');

    if (!newService.category_title.trim() || !newService.treatment_title.trim() || !newService.treatment_price.trim()) {
      setMessage('✗ Category, title, and price are required');
      return;
    }

    const serviceToAdd = {
      category_order: Math.max(...services.map(s => s.category_order), 0) + 1,
      category_title: newService.category_title,
      category_description: null,
      treatment_order: services.filter(s => s.category_title === newService.category_title).length + 1,
      treatment_title: newService.treatment_title,
      treatment_price: newService.treatment_price,
      treatment_duration: newService.treatment_duration || null,
      treatment_description: newService.treatment_description || null,
      treatment_note: newService.treatment_note || null,
    };

    const result = await addService(serviceToAdd);
    if (result.success) {
      setMessage('✓ Service added!');
      setNewService({
        category_title: '',
        treatment_title: '',
        treatment_price: '',
        treatment_duration: '',
        treatment_description: '',
        treatment_note: '',
      });
      setIsAddingService(false);
      loadServices();
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('✗ Error: ' + (result.error || 'Failed to add service'));
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

  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category_title]) {
      acc[service.category_title] = [];
    }
    acc[service.category_title].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
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

        {message && (
          <div className={`mb-6 p-3 rounded-lg text-sm ${message.startsWith('✓') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-2 gap-8">
          {/* Edit Panel */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Edit Services</h2>
              {!isAddingService && (
                <button
                  onClick={() => setIsAddingService(true)}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  + Add Service
                </button>
              )}
            </div>
            <div className="space-y-3 max-h-[80vh] overflow-y-auto">
              {isAddingService && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-slate-900">New Service</h3>
                  <input
                    type="text"
                    value={newService.category_title}
                    onChange={(e) => setNewService({...newService, category_title: e.target.value})}
                    placeholder="Category (e.g., Chemical Peels)"
                    className="w-full px-2 py-1 text-sm border rounded"
                  />
                  <input
                    type="text"
                    value={newService.treatment_title}
                    onChange={(e) => setNewService({...newService, treatment_title: e.target.value})}
                    placeholder="Service title"
                    className="w-full px-2 py-1 text-sm border rounded"
                  />
                  <input
                    type="text"
                    value={newService.treatment_price}
                    onChange={(e) => setNewService({...newService, treatment_price: e.target.value})}
                    placeholder="Price (e.g., $80, $100-150)"
                    className="w-full px-2 py-1 text-sm border rounded"
                  />
                  <input
                    type="text"
                    value={newService.treatment_duration}
                    onChange={(e) => setNewService({...newService, treatment_duration: e.target.value})}
                    placeholder="Duration"
                    className="w-full px-2 py-1 text-sm border rounded"
                  />
                  <textarea
                    value={newService.treatment_description}
                    onChange={(e) => setNewService({...newService, treatment_description: e.target.value})}
                    placeholder="Description"
                    rows={2}
                    className="w-full px-2 py-1 text-sm border rounded"
                  />
                  <textarea
                    value={newService.treatment_note}
                    onChange={(e) => setNewService({...newService, treatment_note: e.target.value})}
                    placeholder="Note"
                    rows={1}
                    className="w-full px-2 py-1 text-sm border rounded"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleAddService} className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">Add</button>
                    <button onClick={() => setIsAddingService(false)} className="px-3 py-1 text-sm border rounded hover:bg-slate-50">Cancel</button>
                  </div>
                </div>
              )}
              {isLoading ? (
                <p>Loading...</p>
              ) : services.length === 0 ? (
                <p className="text-slate-600">No services yet.</p>
              ) : (
                services.map(service => (
                  <div key={service.id} className="bg-white rounded-lg p-4 border border-slate-200">
                    <p className="text-xs font-medium text-slate-500 mb-1">{service.category_title}</p>
                    <p className="font-semibold text-slate-900 mb-2">{service.treatment_title}</p>

                    {editingId === service.id ? (
                      <div className="space-y-2 bg-slate-50 p-3 rounded">
                        <input
                          type="text"
                          value={editData.treatment_title || service.treatment_title}
                          onChange={(e) => setEditData({...editData, treatment_title: e.target.value})}
                          placeholder="Service title"
                          className="w-full px-2 py-1 text-sm border rounded"
                        />
                        <input
                          type="text"
                          value={editData.treatment_price || service.treatment_price}
                          onChange={(e) => setEditData({...editData, treatment_price: e.target.value})}
                          placeholder="Price"
                          className="w-full px-2 py-1 text-sm border rounded"
                        />
                        <input
                          type="text"
                          value={editData.treatment_duration || service.treatment_duration || ''}
                          onChange={(e) => setEditData({...editData, treatment_duration: e.target.value})}
                          placeholder="Duration"
                          className="w-full px-2 py-1 text-sm border rounded"
                        />
                        <textarea
                          value={editData.treatment_description || service.treatment_description || ''}
                          onChange={(e) => setEditData({...editData, treatment_description: e.target.value})}
                          placeholder="Description"
                          rows={2}
                          className="w-full px-2 py-1 text-sm border rounded"
                        />
                        <textarea
                          value={editData.treatment_note || service.treatment_note || ''}
                          onChange={(e) => setEditData({...editData, treatment_note: e.target.value})}
                          placeholder="Note"
                          rows={1}
                          className="w-full px-2 py-1 text-sm border rounded"
                        />
                        <div className="flex gap-2">
                          <button onClick={() => handleSave(service.id)} className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">Save</button>
                          <button onClick={() => setEditingId(null)} className="px-3 py-1 text-sm border rounded hover:bg-slate-50">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingId(service.id); setEditData({}); }} className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">Edit</button>
                        <button onClick={() => handleDelete(service.id)} className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Live Preview */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Live Preview</h2>
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 max-h-[80vh] overflow-y-auto">
              <div className="divide-y divide-slate-200">
                {Object.entries(groupedServices).map(([catTitle, catServices]) => (
                  <div key={catTitle}>
                    <div className="px-6 py-4 bg-slate-50 hover:bg-slate-100 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-lg text-slate-900">{catTitle}</span>
                        <span className="text-xs uppercase tracking-widest text-slate-500">{catServices.length}</span>
                      </div>
                    </div>
                    <div className="px-6 pb-6 bg-white">
                      <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 overflow-hidden">
                        {catServices.map((svc, idx) => (
                          <div key={svc.id} className="flex flex-col gap-1.5 px-5 py-4">
                            <div className="flex items-baseline justify-between gap-4">
                              <h4 className="font-serif text-base text-slate-900">{svc.treatment_title}</h4>
                              <span className="bg-slate-900 text-white px-3 py-1 rounded text-sm">{svc.treatment_price}</span>
                            </div>
                            {svc.treatment_duration && (
                              <p className="text-xs uppercase tracking-widest text-slate-600">{svc.treatment_duration}</p>
                            )}
                            {svc.treatment_description && (
                              <p className="text-sm text-slate-700">{svc.treatment_description}</p>
                            )}
                            {svc.treatment_note && (
                              <p className="text-xs italic text-slate-600">{svc.treatment_note}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
