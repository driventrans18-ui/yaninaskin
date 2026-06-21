'use client';

import { useState, useEffect, useRef } from 'react';
import { Trash2, Plus, ChevronDown } from 'lucide-react';
import { getServices, updateService, deleteService, addService } from '../../actions/content';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AdminShell from '../_components/AdminShell';
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
  treatment_before_position: string | null;
  treatment_after_position: string | null;
};

// Fields that can be edited inline by clicking them in the Live Preview.
type EditableField =
  | 'treatment_price'
  | 'treatment_title'
  | 'treatment_duration'
  | 'treatment_description';

export default function AdminServicesPage() {
  const { t } = useAdminT();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Record<string, any>>({});
  const [message, setMessage] = useState('');
  // Inline "click-to-edit" in the Live Preview (price / name / duration).
  const [editingCell, setEditingCell] = useState<{ id: number; field: EditableField } | null>(null);
  const [cellDraft, setCellDraft] = useState('');
  // Debounce timer for auto-saving inline edits as the owner types.
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Quick "add a service to this category" inline row in the Live Preview.
  const [addingCategory, setAddingCategory] = useState<string | null>(null);
  const [quickAdd, setQuickAdd] = useState({ treatment_title: '', treatment_price: '' });
  // Collapsible categories in the left "Edit Services" list (kept short by default).
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
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
    treatment_before_position: string | null;
    treatment_after_position: string | null;
  }>({
    category_title: '',
    treatment_title: '',
    treatment_price: '',
    treatment_duration: '',
    treatment_description: '',
    treatment_note: '',
    treatment_image_before: null,
    treatment_image_after: null,
    treatment_before_position: null,
    treatment_after_position: null,
  });

  useEffect(() => {
    loadServices();
  }, []);

  // Clear any pending auto-save timer on unmount.
  useEffect(() => () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
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

  // ── Inline cell editing (Live Preview) — auto-saves as you type ──
  const startEditCell = (svc: Service, field: EditableField) => {
    setEditingCell({ id: svc.id, field });
    setCellDraft((svc[field] as string | null) ?? '');
  };

  // Close the editor and drop any pending (unsaved) auto-save.
  const closeEditCell = () => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    setEditingCell(null);
    setCellDraft('');
  };

  // Persist a single field WITHOUT closing the editor — used by auto-save.
  const persistCell = async (id: number, field: EditableField, raw: string) => {
    const next = raw.trim();
    const current = services.find((s) => s.id === id);
    if (!current) return;
    // Price and name are required — never auto-save them empty.
    const required = field === 'treatment_price' || field === 'treatment_title';
    if (required && next === '') return;
    if (next === ((current[field] as string | null) ?? '')) return; // no change
    const value = next === '' ? null : next; // duration / description can be cleared
    // Optimistic update so the preview changes instantly without a flicker.
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
    const result = await updateService(id, { [field]: value });
    if (result.success) {
      setMessage('✓ Saved');
      setTimeout(() => setMessage(''), 1500);
    } else {
      setMessage('✗ Error: ' + (result.error || 'Failed to save'));
      loadServices(); // revert to server truth on failure
    }
  };

  // Debounced auto-save while the owner types.
  const handleCellChange = (value: string) => {
    setCellDraft(value);
    if (!editingCell) return;
    const { id, field } = editingCell;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persistCell(id, field, value), 600);
  };

  // Save right away, then close (used on blur / Enter).
  const commitAndClose = () => {
    if (!editingCell) {
      closeEditCell();
      return;
    }
    const { id, field } = editingCell;
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    persistCell(id, field, cellDraft);
    setEditingCell(null);
    setCellDraft('');
  };

  // Quick-add a service to an existing category from the Live Preview.
  const handleQuickAdd = async (categoryTitle: string) => {
    setMessage('');
    if (!quickAdd.treatment_title.trim() || !quickAdd.treatment_price.trim()) {
      setMessage('✗ ' + t.serviceTitle + ' / ' + t.price);
      return;
    }
    const sameCat = services.filter((s) => s.category_title === categoryTitle);
    const serviceToAdd = {
      category_order: sameCat[0]?.category_order ?? Math.max(...services.map((s) => s.category_order), 0) + 1,
      category_title: categoryTitle,
      category_description: sameCat[0]?.category_description ?? null,
      treatment_order: sameCat.length + 1,
      treatment_title: quickAdd.treatment_title,
      treatment_price: quickAdd.treatment_price,
      treatment_duration: null,
      treatment_description: null,
      treatment_note: null,
    };
    const result = await addService(serviceToAdd);
    if (result.success) {
      setMessage('✓ Service added!');
      setQuickAdd({ treatment_title: '', treatment_price: '' });
      setAddingCategory(null);
      loadServices();
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('✗ Error: ' + (result.error || 'Failed to add service'));
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
      ...(newService.treatment_image_before && newService.treatment_before_position ? { treatment_before_position: newService.treatment_before_position } : {}),
      ...(newService.treatment_image_after && newService.treatment_after_position ? { treatment_after_position: newService.treatment_after_position } : {}),
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
        treatment_before_position: null,
        treatment_after_position: null,
      });
      setIsAddingService(false);
      loadServices();
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('✗ Error: ' + (result.error || 'Failed to add service'));
    }
  };

  const isEditingCell = (id: number, field: EditableField) =>
    editingCell?.id === id && editingCell.field === field;

  const toggleCategory = (cat: string) =>
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });

  // Shared inline editor used for price, name, duration and description.
  // Auto-saves as the owner types (debounced) and again when they click away
  // or press Enter — no checkmark needed. Escape closes without saving the
  // latest keystroke. For multiline fields Enter inserts a newline.
  const inlineEditor = (
    widthClass: string,
    ariaLabel: string,
    multiline = false,
  ) =>
    multiline ? (
      <Textarea
        autoFocus
        rows={3}
        className={widthClass}
        value={cellDraft}
        onChange={(e) => handleCellChange(e.target.value)}
        onBlur={commitAndClose}
        onKeyDown={(e) => {
          if (e.key === 'Escape') closeEditCell();
        }}
        aria-label={ariaLabel}
      />
    ) : (
      <Input
        autoFocus
        inputSize="sm"
        className={widthClass}
        value={cellDraft}
        onChange={(e) => handleCellChange(e.target.value)}
        onBlur={commitAndClose}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commitAndClose();
          if (e.key === 'Escape') closeEditCell();
        }}
        aria-label={ariaLabel}
      />
    );

  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category_title]) {
      acc[service.category_title] = [];
    }
    acc[service.category_title].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <AdminShell active="services" maxWidth="max-w-7xl">
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
                  position={newService.treatment_before_position}
                  onPositionChange={(pos) => setNewService({...newService, treatment_before_position: pos})}
                />
                <ImageUploadField
                  label={t.afterPhoto}
                  hint={t.afterHint}
                  value={newService.treatment_image_after}
                  onChange={(url) => setNewService({...newService, treatment_image_after: url})}
                  position={newService.treatment_after_position}
                  onPositionChange={(pos) => setNewService({...newService, treatment_after_position: pos})}
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
              Object.entries(groupedServices).map(([catTitle, catServices]) => {
                const isOpen = openCategories.has(catTitle);
                return (
                  <div key={catTitle} className="overflow-hidden rounded-lg border border-border">
                    <button
                      type="button"
                      onClick={() => toggleCategory(catTitle)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-2 bg-muted px-4 py-3 text-left outline-none hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="font-medium text-foreground">{catTitle}</span>
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-xs uppercase tracking-widest">{catServices.length}</span>
                        <ChevronDown className={`size-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </span>
                    </button>
                    {isOpen && (
                      <div className="space-y-3 p-3">
                        {catServices.map(service => (
                          <Card key={service.id} className="p-4">
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
                        position={'treatment_before_position' in editData ? editData.treatment_before_position : service.treatment_before_position}
                        onPositionChange={(pos) => setEditData({...editData, treatment_before_position: pos})}
                      />
                      <ImageUploadField
                        label={t.afterPhoto}
                        hint={t.afterHint}
                        value={'treatment_image_after' in editData ? editData.treatment_image_after : service.treatment_image_after}
                        onChange={(url) => setEditData({...editData, treatment_image_after: url})}
                        position={'treatment_after_position' in editData ? editData.treatment_after_position : service.treatment_after_position}
                        onPositionChange={(pos) => setEditData({...editData, treatment_after_position: pos})}
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
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
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
                          <div className="flex items-center justify-between gap-3">
                            {/* Service name — click to edit */}
                            {isEditingCell(svc.id, 'treatment_title') ? (
                              inlineEditor('flex-1 min-w-[120px]', `${t.editName}: ${svc.treatment_title}`)
                            ) : (
                              <button
                                type="button"
                                onClick={() => startEditCell(svc, 'treatment_title')}
                                aria-label={`${t.editName}: ${svc.treatment_title}`}
                                className="-mx-1 rounded px-1 text-left outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                              >
                                <h4 className="font-serif text-base text-foreground">{svc.treatment_title}</h4>
                              </button>
                            )}
                            {/* Price — click to edit — and delete */}
                            <div className="flex shrink-0 items-center gap-2">
                              {isEditingCell(svc.id, 'treatment_price') ? (
                                inlineEditor('w-24', `${t.editPrice}: ${svc.treatment_title}`)
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => startEditCell(svc, 'treatment_price')}
                                  aria-label={`${t.editPrice}: ${svc.treatment_title}`}
                                  className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                                >
                                  <Badge variant="default" className="cursor-pointer hover:bg-primary/90">{svc.treatment_price}</Badge>
                                </button>
                              )}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleDelete(svc.id)}
                                aria-label={`${t.delete}: ${svc.treatment_title}`}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </div>
                          {/* Duration — click to edit, with an add affordance when empty */}
                          {isEditingCell(svc.id, 'treatment_duration') ? (
                            <div>{inlineEditor('w-40', `${t.editDuration}: ${svc.treatment_title}`)}</div>
                          ) : svc.treatment_duration ? (
                            <button
                              type="button"
                              onClick={() => startEditCell(svc, 'treatment_duration')}
                              aria-label={`${t.editDuration}: ${svc.treatment_title}`}
                              className="-mx-1 self-start rounded px-1 text-left outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                            >
                              <p className="text-xs uppercase tracking-widest text-muted-foreground">{svc.treatment_duration}</p>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => startEditCell(svc, 'treatment_duration')}
                              className="self-start text-xs uppercase tracking-widest text-muted-foreground/50 hover:text-muted-foreground cursor-pointer"
                            >
                              {t.addDuration}
                            </button>
                          )}
                          {/* Description — click to edit, with an add affordance when empty */}
                          {isEditingCell(svc.id, 'treatment_description') ? (
                            <div className="w-full">{inlineEditor('w-full', `${t.editDescription}: ${svc.treatment_title}`, true)}</div>
                          ) : svc.treatment_description ? (
                            <button
                              type="button"
                              onClick={() => startEditCell(svc, 'treatment_description')}
                              aria-label={`${t.editDescription}: ${svc.treatment_title}`}
                              className="-mx-1 rounded px-1 text-left outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                            >
                              <p className="text-sm text-muted-foreground">{svc.treatment_description}</p>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => startEditCell(svc, 'treatment_description')}
                              className="self-start text-sm text-muted-foreground/50 hover:text-muted-foreground cursor-pointer"
                            >
                              {t.addDescription}
                            </button>
                          )}
                          {svc.treatment_note && (
                            <p className="text-xs italic text-muted-foreground">{svc.treatment_note}</p>
                          )}
                          <TreatmentMedia
                            before={svc.treatment_image_before ?? undefined}
                            after={svc.treatment_image_after ?? undefined}
                            beforePos={svc.treatment_before_position ?? undefined}
                            afterPos={svc.treatment_after_position ?? undefined}
                            title={svc.treatment_title}
                            className="mt-3"
                          />
                        </div>
                      ))}
                      {/* Quick-add a service to this category */}
                      {addingCategory === catTitle ? (
                        <div className="flex flex-wrap items-center gap-2 bg-muted px-5 py-4">
                          <Input
                            autoFocus
                            inputSize="sm"
                            className="min-w-[140px] flex-1"
                            placeholder={t.serviceTitle}
                            value={quickAdd.treatment_title}
                            onChange={(e) => setQuickAdd({ ...quickAdd, treatment_title: e.target.value })}
                          />
                          <Input
                            inputSize="sm"
                            className="w-24"
                            placeholder={t.price}
                            value={quickAdd.treatment_price}
                            onChange={(e) => setQuickAdd({ ...quickAdd, treatment_price: e.target.value })}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleQuickAdd(catTitle); }}
                          />
                          <Button size="sm" onClick={() => handleQuickAdd(catTitle)}>{t.add}</Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setAddingCategory(null); setQuickAdd({ treatment_title: '', treatment_price: '' }); }}
                          >
                            {t.cancel}
                          </Button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { setAddingCategory(catTitle); setQuickAdd({ treatment_title: '', treatment_price: '' }); }}
                          className="flex w-full items-center gap-1.5 px-5 py-3 text-sm text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                        >
                          <Plus className="size-4" /> {t.addServiceToCategory}
                        </button>
                      )}
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
