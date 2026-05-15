'use client';

import { useState, useEffect, useRef } from 'react';
import { getAboutContent, updateAboutContent } from '../../actions/content';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { createClient } from '@supabase/supabase-js';
import imageCompression from 'browser-image-compression';

type AboutData = {
  eyebrow?: string;
  name?: string;
  bio1?: string;
  bio2?: string;
  bio3?: string;
  bio4?: string;
  badges?: string[];
  photo_url?: string;
  photo_position?: string;
  phone?: string;
  email?: string;
  address?: string;
  instagram_url?: string;
  tiktok_url?: string;
};

type PhotoItem = {
  name: string;
  url: string;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function AdminAboutPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [about, setAbout] = useState<AboutData>({});
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(50);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('admin-auth');
    if (stored === 'true') {
      setIsAuthenticated(true);
      loadAbout();
      loadPhotos();
    }
  }, []);

  const loadAbout = async () => {
    const result = await getAboutContent();
    if (result.data) {
      setAbout(result.data);
      if (result.data.photo_position) {
        const parts = result.data.photo_position.split(' ');
        const x = parseFloat(parts[0]);
        const y = parseFloat(parts[1]);
        setPosX(x);
        setPosY(y);
      }
    }
  };

  const loadPhotos = async () => {
    setLoadingPhotos(true);
    try {
      const { data, error } = await supabase.storage
        .from('about-photos')
        .list();

      if (error) {
        console.warn('Storage bucket not ready:', error);
        setPhotos([]);
        return;
      }

      if (!data) {
        setPhotos([]);
        return;
      }

      const photoList: PhotoItem[] = data.map((file) => {
        const { data: { publicUrl } } = supabase.storage
          .from('about-photos')
          .getPublicUrl(file.name);
        return { name: file.name, url: publicUrl };
      });

      setPhotos(photoList);
    } catch (err) {
      console.warn('Error loading photos (bucket may not exist):', err);
      setPhotos([]);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const deletePhoto = async (fileName: string) => {
    if (!confirm('Delete this photo?')) return;

    try {
      const { error } = await supabase.storage
        .from('about-photos')
        .remove([fileName]);

      if (error) throw error;

      setMessage('✓ Photo deleted');
      if (about.photo_url?.includes(fileName)) {
        setAbout({...about, photo_url: undefined});
      }
      loadPhotos();
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage('✗ Error deleting photo: ' + (err instanceof Error ? err.message : 'Unknown error'));
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

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setMessage('✗ Please select an image file');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      setMessage('⏳ Compressing image...');

      let fileToUpload = file;

      if (file.size > 4 * 1024 * 1024) {
        const options = {
          maxSizeMB: 3.5,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        fileToUpload = await imageCompression(file, options);
      }

      setMessage('⏳ Uploading...');

      const formData = new FormData();
      formData.append('file', fileToUpload);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const text = await response.text();

      if (!response.ok) {
        let errorMsg = 'Upload failed';
        try {
          const data = JSON.parse(text);
          errorMsg = data.error || 'Upload failed';
        } catch {
          errorMsg = text || response.statusText || 'Upload failed';
        }
        throw new Error(errorMsg);
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error('Invalid server response');
      }

      setAbout({...about, photo_url: data.url});
      loadPhotos();
      setMessage('✓ Photo uploaded!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('✗ ' + (err instanceof Error ? err.message : 'Upload failed'));
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingImage || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    setPosX(clampedX);
    setPosY(clampedY);
    setAbout({...about, photo_position: `${clampedX}% ${clampedY}%`});
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
      <div className="max-w-7xl mx-auto">
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

        {message && (
          <div className={`mb-6 p-3 rounded-lg text-sm ${message.startsWith('✓') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-2 gap-8">
          {/* Edit Panel */}
          <div className="bg-white rounded-lg p-8 space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Edit Bio</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Photo</label>

              {/* Upload Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors mb-4 ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50'
                } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                  className="hidden"
                />
                <div className="space-y-2">
                  <div className="text-2xl">📸</div>
                  <p className="font-medium text-slate-900 text-sm">
                    {uploading ? 'Uploading...' : 'Drop image here or click to upload'}
                  </p>
                  <p className="text-xs text-slate-500">Max 10MB • JPEG, PNG, WebP</p>
                </div>
              </div>

              {/* Image Preview with Position and Zoom Control */}
              {about.photo_url && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium text-slate-700">Adjust Position & Size</div>
                    <div className="text-xs text-slate-500">Zoom: {zoom}%</div>
                  </div>
                  <div
                    ref={containerRef}
                    onMouseDown={() => setIsDraggingImage(true)}
                    onMouseUp={() => setIsDraggingImage(false)}
                    onMouseLeave={() => setIsDraggingImage(false)}
                    onMouseMove={handleImageMouseMove}
                    className={`relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-200 border border-slate-300 ${
                      isDraggingImage ? 'cursor-grabbing' : 'cursor-grab'
                    }`}
                  >
                    <img
                      src={about.photo_url}
                      alt="Preview"
                      className="w-full h-full object-cover transition-transform"
                      style={{
                        objectPosition: `${posX}% ${posY}%`,
                        transform: `scale(${zoom / 100})`,
                      }}
                    />
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-0 left-0 w-full h-full border-2 border-dashed border-white/30" />
                      <div className="absolute top-1/3 left-0 w-full h-px bg-white/20" />
                      <div className="absolute top-2/3 left-0 w-full h-px bg-white/20" />
                      <div className="absolute left-1/3 top-0 h-full w-px bg-white/20" />
                      <div className="absolute left-2/3 top-0 h-full w-px bg-white/20" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">100%</span>
                      <input
                        type="range"
                        min="100"
                        max="200"
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-xs text-slate-500">200%</span>
                    </div>
                    <p className="text-xs text-slate-500 text-center">
                      Drag to adjust position • X: {Math.round(posX)}%, Y: {Math.round(posY)}%
                    </p>
                  </div>
                </div>
              )}

              {/* Photo Gallery Browser */}
              {photos.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-slate-700 mb-2">Saved Photos</div>
                  <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50">
                    {photos.map((photo) => (
                      <div key={photo.name} className="relative group">
                        <img
                          src={photo.url}
                          alt={photo.name}
                          className={`w-full h-24 object-cover rounded cursor-pointer transition-opacity ${
                            about.photo_url?.includes(photo.name) ? 'ring-2 ring-blue-500' : ''
                          }`}
                          onClick={() => setAbout({...about, photo_url: photo.url})}
                        />
                        <button
                          onClick={() => deletePhoto(photo.name)}
                          className="absolute top-1 right-1 bg-red-600 text-white px-1.5 py-0.5 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

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
              <label className="block text-sm font-medium text-slate-700 mb-2">Bio Paragraph 4 <span className="text-slate-400 font-normal">(optional)</span></label>
              <Textarea
                value={about.bio4 || ''}
                onChange={(e) => setAbout({...about, bio4: e.target.value})}
                placeholder="Fourth bio paragraph (optional)..."
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

            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-base font-semibold text-slate-900 mb-4">Contact Info</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Address / Location</label>
                  <Input
                    value={about.address || ''}
                    onChange={(e) => setAbout({...about, address: e.target.value})}
                    placeholder="e.g. Rochester, NY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                  <Input
                    value={about.phone || ''}
                    onChange={(e) => setAbout({...about, phone: e.target.value})}
                    placeholder="e.g. (585) 555-0123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <Input
                    value={about.email || ''}
                    onChange={(e) => setAbout({...about, email: e.target.value})}
                    placeholder="e.g. hello@yaninaskin.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Instagram URL</label>
                  <Input
                    value={about.instagram_url || ''}
                    onChange={(e) => setAbout({...about, instagram_url: e.target.value})}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">TikTok URL</label>
                  <Input
                    value={about.tiktok_url || ''}
                    onChange={(e) => setAbout({...about, tiktok_url: e.target.value})}
                    placeholder="https://tiktok.com/@..."
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Bio'}
            </button>
          </div>

          {/* Live Preview */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Live Preview</h2>
            <div className="bg-white rounded-lg p-8">
              <div className="grid gap-8 md:grid-cols-2 md:items-center">
                {/* Photo */}
                <div className="relative aspect-[3/4] w-full max-w-sm mx-auto md:mx-0 rounded-2xl overflow-hidden bg-slate-200">
                  {about.photo_url ? (
                    <img
                      src={about.photo_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      style={{
                        objectPosition: about.photo_position || '50% 50%',
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <span>Photo preview</span>
                    </div>
                  )}
                </div>
                {/* Bio */}
                <div>
                  <p className="text-sm text-slate-500 mb-2">{about.eyebrow || 'EYEBROW'}</p>
                  <h2 className="text-3xl font-serif mb-4 text-slate-900">{about.name || 'Name'}</h2>
                  <p className="mb-3 text-slate-700 text-sm leading-relaxed">{about.bio1 || 'Bio paragraph 1...'}</p>
                  <p className="mb-3 text-slate-700 text-sm leading-relaxed">{about.bio2 || 'Bio paragraph 2...'}</p>
                  <p className="mb-6 text-slate-700 text-sm leading-relaxed">{about.bio3 || 'Bio paragraph 3...'}</p>
                  <div className="flex flex-wrap gap-2">
                    {(about.badges || []).map((badge) => (
                      badge && (
                        <span key={badge} className="border border-slate-300 rounded-full px-3 py-1 text-xs text-slate-700">
                          {badge}
                        </span>
                      )
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
