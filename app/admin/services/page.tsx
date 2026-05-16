'use client';

import { useState, useEffect } from 'react';
import { getServices, updateService, deleteService, addService } from '../../actions/content';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AdminShell from '../_components/AdminShell';
import AdminLogin from '../_components/AdminLogin';
import StatusBanner from '../_components/StatusBanner';
import Field from '../_components/Field';
import ImageUploadField from '../_components/ImageUploadField';
import TreatmentMedia from '../../components/TreatmentMedia';
import { useAdminT } from '../_components/AdminLang';

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
  treatment_image_before: string | null;
  treatment_image_after: string | null;
};

export default function AdminServicesPage() {
  const { t } = useAdminT();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Record<string, any>>({});
  const [message, setMessage] = useState('');
  const [isAddingService, setIsAddingService] = useState(false);
  const [newService, setNewService] = useState<{
    category_title: string;
    treatment_title: string;
    treatment_price: string;
    treatment_duration: string;
    treatment_description: string;
    treatment_note: string;
    treatment_image_before: string | null;
    treatment_image_after: string | null;
  }>({
    category_title: '',
    treatment_title: '',
    treatment_price: '',
    treatment_duration: '',
    treatment_description: '',
    treatment_note: '',
    treatment_image_before: null,
    treatment_image_after: null,
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
    if (confirm(t.confirmDeleteService)) {
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
      ...(newService.treatment_image_before ? { treatment_image_before: newService.treatment_image_before } : {}),
      ...(newService.treatment_image_after ? { treatment_image_after: newService.treatment_image_after } : {}),
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
        treatment_image_before: null,
        treatment_image_after: null,
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
      <AdminLogin
        subtitle={t.subServices}
        error={loginError}
        onSubmit={(pw) => {
          if (pw === 'skinbeauty') {
            setIsAuthenticated(true);
            localStorage.setItem('admin-auth', 'true');
            setLoginError('');
            loadServices();
          } else {
            setLoginError(t.incorrectPassword);
          }
        }}
      />
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
    <AdminShell
      active="services"
      maxWidth="max-w-7xl"
      onLogout={() => {
        localStorage.removeItem('admin-auth');
        window.location.href = '/admin/reviews';
      }}
    >
      <StatusBanner message={message} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Edit Panel */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-xl">{t.editServices}</h2>
            {!isAddingService && (
              <Button size="sm" onClick={() => setIsAddingService(true)}>
                {t.addServiceBtn}
              </Button>
            )}
          </div>
          <div className="space-y-3 max-h-[80vh] overflow-y-auto pr-1">
            {isAddingService && (
              <Card className="bg-muted p-4 space-y-3">
                <h3 className="text-base font-semibold">{t.newService}</h3>
                <Field label={t.category}>
                  <Select
                    className="w-full"
                    value={newService.category_title}
                    onChange={(e) => setNewService({...newService, category_title: e.target.value})}
                  >
                    <option value="">{t.categorySelectDefault}</option>
                    {Array.from(new Set(services.map(s => s.category_title))).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Select>
                  {newService.category_title && !services.some(s => s.category_title === newService.category_title) && (
                    <p className="text-xs text-accent mt-1">✓ New category: &quot;{newService.category_title}&quot;</p>
                  )}
                </Field>
                <Input
                  inputSize="sm"
                  value={newService.category_title}
                  onChange={(e) => setNewService({...newService, category_title: e.target.value})}
                  placeholder={t.typeNewCategory}
                />
                <Input
                  inputSize="sm"
                  value={newService.treatment_title}
                  onChange={(e) => setNewService({...newService, treatment_title: e.target.value})}
                  placeholder={t.serviceTitle}
                />
                <Input
                  inputSize="sm"
                  value={newService.treatment_price}
                  onChange={(e) => setNewService({...newService, treatment_price: e.target.value})}
                  placeholder={t.pricePlaceholder}
                />
                <Input
                  inputSize="sm"
                  value={newService.treatment_duration}
                  onChange={(e) => setNewService({...newService, treatment_duration: e.target.value})}
                  placeholder={t.duration}
                />
                <Textarea
                  value={newService.treatment_description}
                  onChange={(e) => setNewService({...newService, treatment_description: e.target.value})}
                  placeholder={t.description}
                  rows={2}
                />
                <Textarea
                  value={newService.treatment_note}
                  onChange={(e) => setNewService({...newService, treatment_note: e.target.value})}
                  placeholder={t.note}
                  rows={1}
                />
                <ImageUploadField
                  label={t.beforePhoto}
                  hint={t.beforeHint}
                  value={newService.treatment_image_before}
                  onChange={(url) => setNewService({...newService, treatment_image_before: url})}
                />
                <ImageUploadField
                  label={t.afterPhoto}
                  hint={t.afterHint}
                  value={newService.treatment_image_after}
                  onChange={(url) => setNewService({...newService, treatment_image_after: url})}
                />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={handleAddService}>{t.add}</Button>
                  <Button variant="outline" size="sm" onClick={() => setIsAddingService(false)}>{t.cancel}</Button>
                </div>
              </Card>
            )}
            {isLoading ? (
              <p className="text-muted-foreground">{t.loading}</p>
            ) : services.length === 0 ? (
              <p className="text-muted-foreground">{t.noServices}</p>
            ) : (
              services.map(service => (
                <Card key={service.id} className="p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-1">{service.category_title}</p>
                  <p className="font-semibold text-foreground mb-2">{service.treatment_title}</p>

                  {editingId === service.id ? (
                    <div className="space-y-2 bg-muted p-3 rounded-lg">
                      <Input
                        inputSize="sm"
                        value={editData.treatment_title || service.treatment_title}
                        onChange={(e) => setEditData({...editData, treatment_title: e.target.value})}
                        placeholder={t.serviceTitle}
                      />
                      <Input
                        inputSize="sm"
                        value={editData.treatment_price || service.treatment_price}
                        onChange={(e) => setEditData({...editData, treatment_price: e.target.value})}
                        placeholder={t.price}
                      />
                      <Input
                        inputSize="sm"
                        value={editData.treatment_duration || service.treatment_duration || ''}
                        onChange={(e) => setEditData({...editData, treatment_duration: e.target.value})}
                        placeholder={t.duration}
                      />
                      <Textarea
                        value={editData.treatment_description || service.treatment_description || ''}
                        onChange={(e) => setEditData({...editData, treatment_description: e.target.value})}
                        placeholder={t.description}
                        rows={2}
                      />
                      <Textarea
                        value={editData.treatment_note || service.treatment_note || ''}
                        onChange={(e) => setEditData({...editData, treatment_note: e.target.value})}
                        placeholder={t.note}
                        rows={1}
                      />
                      <ImageUploadField
                        label={t.beforePhoto}
                        hint={t.beforeHint}
                        value={'treatment_image_before' in editData ? editData.treatment_image_before : service.treatment_image_before}
                        onChange={(url) => setEditData({...editData, treatment_image_before: url})}
                      />
                      <ImageUploadField
                        label={t.afterPhoto}
                        hint={t.afterHint}
                        value={'treatment_image_after' in editData ? editData.treatment_image_after : service.treatment_image_after}
                        onChange={(url) => setEditData({...editData, treatment_image_after: url})}
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => handleSave(service.id)}>{t.save}</Button>
                        <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>{t.cancel}</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="accent" size="sm" onClick={() => { setEditingId(service.id); setEditData({}); }}>{t.edit}</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(service.id)}>{t.delete}</Button>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Live Preview */}
        <div>
          <h2 className="text-xl mb-4">{t.livePreview}</h2>
          <Card className="overflow-hidden max-h-[80vh] overflow-y-auto">
            <div className="divide-y divide-border">
              {Object.entries(groupedServices).map(([catTitle, catServices]) => (
                <div key={catTitle}>
                  <div className="px-6 py-4 bg-muted">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-lg text-foreground">{catTitle}</span>
                      <span className="text-xs uppercase tracking-widest text-muted-foreground">{catServices.length}</span>
                    </div>
                  </div>
                  <div className="px-6 pb-6 pt-4">
                    <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                      {catServices.map((svc) => (
                        <div key={svc.id} className="flex flex-col gap-1.5 px-5 py-4">
                          <div className="flex items-baseline justify-between gap-4">
                            <h4 className="font-serif text-base text-foreground">{svc.treatment_title}</h4>
                            <Badge variant="default">{svc.treatment_price}</Badge>
                          </div>
                          {svc.treatment_duration && (
                            <p className="text-xs uppercase tracking-widest text-muted-foreground">{svc.treatment_duration}</p>
                          )}
                          {svc.treatment_description && (
                            <p className="text-sm text-muted-foreground">{svc.treatment_description}</p>
                          )}
                          {svc.treatment_note && (
                            <p className="text-xs italic text-muted-foreground">{svc.treatment_note}</p>
                          )}
                          <TreatmentMedia
                            before={svc.treatment_image_before ?? undefined}
                            after={svc.treatment_image_after ?? undefined}
                            title={svc.treatment_title}
                            className="mt-3"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
