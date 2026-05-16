'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type AdminLang = 'en' | 'uk';

const DICT = {
  en: {
    studioAdmin: 'Studio Admin',
    adminTitle: 'Admin',
    navReviews: 'Reviews',
    navServices: 'Services',
    navBio: 'Bio',
    navGallery: 'Gallery',
    website: '← Website',
    logout: 'Logout',

    signIn: 'Sign in',
    password: 'Password',
    passwordPlaceholder: 'Enter admin password',
    loginBtn: 'Login',
    incorrectPassword: 'Incorrect password',
    subReviews: 'Reviews Management',
    subServices: 'Services Management',
    subBio: 'Bio Management',
    subGallery: 'Gallery Management',

    loading: 'Loading…',
    save: 'Save',
    cancel: 'Cancel',
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    replace: 'Replace',
    remove: 'Remove',
    uploadImage: 'Upload image',
    uploading: 'Uploading…',
    optional: 'Optional',
    livePreview: 'Live Preview',

    reviewsInfo:
      'Auto-posting enabled: reviews are published immediately. You can delete or reply to any review below.',
    loadingReviews: 'Loading reviews…',
    noReviewsTitle: 'No reviews yet',
    noReviewsBody: 'New reviews will appear here automatically.',
    published: 'Published',
    responseFrom: 'Response from',
    replyPlaceholder: 'Write your response...',
    sendResponse: 'Send Response',
    reply: '+ Reply',
    confirmDeleteReview: 'Are you sure you want to delete this review?',

    editServices: 'Edit Services',
    addServiceBtn: '+ Add Service',
    newService: 'New Service',
    category: 'Category',
    categorySelectDefault: '-- Select or type new category --',
    typeNewCategory: 'Or type a new category',
    serviceTitle: 'Service title',
    pricePlaceholder: 'Price (e.g., $80, $100-150)',
    price: 'Price',
    duration: 'Duration',
    description: 'Description',
    note: 'Note',
    beforePhoto: 'Before photo',
    afterPhoto: 'After photo',
    beforeHint:
      'Optional. Shown on the site as a before/after slider when both are set.',
    afterHint: 'Optional.',
    noServices: 'No services yet.',
    confirmDeleteService: 'Delete this service?',

    editBio: 'Edit Bio',
    photo: 'Photo',
    dropImage: 'Drop image here or click to upload',
    dropHint: 'Max 10MB • JPEG, PNG, WebP',
    adjustPosition: 'Adjust Position & Size',
    zoom: 'Zoom',
    dragHint: 'Drag the photo to reposition',
    savedPhotos: 'Saved Photos',
    eyebrow: 'Eyebrow',
    name: 'Name',
    bioP: 'Bio Paragraph',
    badges: 'Badges',
    badgesHint: 'Separate with commas',
    contactInfo: 'Contact Info',
    address: 'Address / Location',
    phone: 'Phone',
    email: 'Email',
    instagram: 'Instagram URL',
    tiktok: 'TikTok URL',
    saveBio: 'Save Bio',
    saving: 'Saving...',
    photoPreview: 'Photo preview',
    confirmDeletePhoto: 'Delete this photo?',

    editGallery: 'Edit Gallery',
    galleryIntro:
      'Upload photos for the “The Experience” section on the website.',
    addPhotos: 'Add photos',
    noGalleryTitle: 'No gallery photos yet',
    noGalleryBody: 'Uploaded photos will appear here and on the website.',
    confirmDeleteGalleryImage: 'Delete this photo from the gallery?',
  },
  uk: {
    studioAdmin: 'Адмін студії',
    adminTitle: 'Адмін',
    navReviews: 'Відгуки',
    navServices: 'Послуги',
    navBio: 'Біо',
    navGallery: 'Галерея',
    website: '← Сайт',
    logout: 'Вийти',

    signIn: 'Вхід',
    password: 'Пароль',
    passwordPlaceholder: 'Введіть пароль адміністратора',
    loginBtn: 'Увійти',
    incorrectPassword: 'Невірний пароль',
    subReviews: 'Керування відгуками',
    subServices: 'Керування послугами',
    subBio: 'Керування біо',
    subGallery: 'Керування галереєю',

    loading: 'Завантаження…',
    save: 'Зберегти',
    cancel: 'Скасувати',
    add: 'Додати',
    edit: 'Редагувати',
    delete: 'Видалити',
    replace: 'Замінити',
    remove: 'Прибрати',
    uploadImage: 'Завантажити фото',
    uploading: 'Завантаження…',
    optional: 'Необовʼязково',
    livePreview: 'Попередній перегляд',

    reviewsInfo:
      'Автопублікація увімкнена: відгуки публікуються одразу. Нижче ви можете видалити відгук або відповісти на нього.',
    loadingReviews: 'Завантаження відгуків…',
    noReviewsTitle: 'Поки немає відгуків',
    noReviewsBody: 'Нові відгуки зʼявлятимуться тут автоматично.',
    published: 'Опубліковано',
    responseFrom: 'Відповідь від',
    replyPlaceholder: 'Напишіть вашу відповідь...',
    sendResponse: 'Надіслати відповідь',
    reply: '+ Відповісти',
    confirmDeleteReview: 'Ви впевнені, що хочете видалити цей відгук?',

    editServices: 'Редагувати послуги',
    addServiceBtn: '+ Додати послугу',
    newService: 'Нова послуга',
    category: 'Категорія',
    categorySelectDefault: '-- Оберіть або введіть нову категорію --',
    typeNewCategory: 'Або введіть нову категорію',
    serviceTitle: 'Назва послуги',
    pricePlaceholder: 'Ціна (напр., $80, $100-150)',
    price: 'Ціна',
    duration: 'Тривалість',
    description: 'Опис',
    note: 'Примітка',
    beforePhoto: 'Фото «до»',
    afterPhoto: 'Фото «після»',
    beforeHint:
      'Необовʼязково. На сайті показується як повзунок «до/після», якщо задані обидва.',
    afterHint: 'Необовʼязково.',
    noServices: 'Поки немає послуг.',
    confirmDeleteService: 'Видалити цю послугу?',

    editBio: 'Редагувати біо',
    photo: 'Фото',
    dropImage: 'Перетягніть фото сюди або натисніть, щоб завантажити',
    dropHint: 'Макс. 10MB • JPEG, PNG, WebP',
    adjustPosition: 'Налаштувати положення та розмір',
    zoom: 'Масштаб',
    dragHint: 'Перетягніть фото, щоб змінити положення',
    savedPhotos: 'Збережені фото',
    eyebrow: 'Підзаголовок',
    name: 'Імʼя',
    bioP: 'Абзац біо',
    badges: 'Бейджі',
    badgesHint: 'Розділяйте комами',
    contactInfo: 'Контактна інформація',
    address: 'Адреса / Локація',
    phone: 'Телефон',
    email: 'Email',
    instagram: 'Instagram URL',
    tiktok: 'TikTok URL',
    saveBio: 'Зберегти біо',
    saving: 'Збереження...',
    photoPreview: 'Перегляд фото',
    confirmDeletePhoto: 'Видалити це фото?',

    editGallery: 'Редагувати галерею',
    galleryIntro: 'Завантажте фото для розділу «Досвід» на сайті.',
    addPhotos: 'Додати фото',
    noGalleryTitle: 'Поки немає фото в галереї',
    noGalleryBody: 'Завантажені фото зʼявляться тут і на сайті.',
    confirmDeleteGalleryImage: 'Видалити це фото з галереї?',
  },
};

export type AdminDict = (typeof DICT)['en'];

const AdminLangContext = createContext<{
  lang: AdminLang;
  setLang: (l: AdminLang) => void;
  t: AdminDict;
}>({ lang: 'uk', setLang: () => {}, t: DICT.uk });

export function AdminLangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<AdminLang>('uk');

  useEffect(() => {
    const stored = localStorage.getItem('admin-lang');
    if (stored === 'en' || stored === 'uk') setLangState(stored);
  }, []);

  const setLang = (l: AdminLang) => {
    setLangState(l);
    localStorage.setItem('admin-lang', l);
  };

  return (
    <AdminLangContext.Provider value={{ lang, setLang, t: DICT[lang] }}>
      {children}
    </AdminLangContext.Provider>
  );
}

export function useAdminT() {
  return useContext(AdminLangContext);
}

export function AdminLangToggle({ className }: { className?: string }) {
  const { lang, setLang } = useAdminT();
  const base =
    'px-2.5 py-1 text-xs font-medium rounded-md transition-colors';
  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-lg border border-border p-0.5 ${className ?? ''}`}
      role="group"
      aria-label="Admin language"
    >
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`${base} ${lang === 'en' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang('uk')}
        className={`${base} ${lang === 'uk' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
      >
        UA
      </button>
    </div>
  );
}
