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
    navBrands: 'Brands',
    navBookings: 'Bookings',
    navContact: 'Contact',
    navDomain: 'Domain',
    domainTitle: 'Domain Renewal',
    domainIntro:
      'Track when your website domain renews. Update the date here each time you renew so the reminder stays accurate.',
    domainNameLabel: 'Domain name',
    renewalDateLabel: 'Renewal date',
    domainRenewsOn: 'Renews on',
    domainInDays: 'in {n} days',
    domainDaysAgo: '{n} days ago',
    domainToday: 'Renews today',
    domainOverdue: 'Expired — renew now',
    domainNoDate: 'No renewal date set yet.',
    domainSoonNote: 'Renewal is coming up soon.',
    addOneYear: '+1 year',
    domainSaved: '✓ Domain details saved',
    domainProviderNote:
      'Your domain is registered at Wix. Renewing must be done manually at wix.com — changing the date here only updates this reminder, it does not renew the domain.',
    domainWhoRenews:
      'Yanina, Pasha, or the web developer can log in to Wix and renew before this date.',
    domainWixCta: 'Open Wix to renew →',
    domainConfirmTitle: 'Update reminder only',
    domainConfirmBody:
      'This updates the reminder date only — it does NOT renew your domain. Make sure it’s been renewed at wix.com. Continue?',
    domainConfirmCta: 'Yes, update reminder',
    domainNewDateLabel: 'New reminder date',
    website: '← Website',
    logout: 'Logout',

    signIn: 'Sign in',
    signInSubtitle: 'Authorized access only',
    emailPlaceholder: 'Email',
    password: 'Password',
    passwordPlaceholder: 'Password',
    loginBtn: 'Sign in',
    signingIn: 'Signing in…',
    incorrectPassword: 'Incorrect email or password',
    notAuthorized: 'This account is not authorized for admin access.',
    checkingSession: 'Checking session…',
    subReviews: 'Reviews Management',
    subServices: 'Services Management',
    subBio: 'Bio Management',
    subGallery: 'Gallery Management',

    loading: 'Loading…',
    storage: 'Storage',
    manageStorage: 'Manage storage',
    storageTitle: 'Manage Storage',
    storageIntro:
      'Largest files first. "Unused" files aren\'t shown anywhere on your site and are safe to delete. "In use" files are protected — remove them from their review, gallery, or bio first.',
    storageInUse: 'In use',
    storageUnused: 'Unused',
    selectUnused: 'Select all unused',
    clearSelection: 'Clear',
    deleteSelected: 'Delete selected',
    storageNoFiles: 'No files found.',
    storageDeleting: 'Deleting…',
    confirmDeleteFiles:
      'Delete the selected files? This frees storage and cannot be undone.',
    storageFreed: '✓ Files deleted',
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
    editPrice: 'Edit price',
    editName: 'Edit name',
    editDuration: 'Edit duration',
    addDuration: '+ duration',
    editDescription: 'Edit description',
    addDescription: '+ description',
    addServiceToCategory: '+ Add service here',

    editBio: 'Edit Bio',
    photo: 'Photo',
    dropImage: 'Drop image here or click to upload',
    dropHint: 'Max 10MB • JPEG, PNG, WebP',
    adjustPosition: 'Adjust Position & Size',
    zoom: 'Zoom',
    dragHint: 'Drag the photo to reposition',
    dragToReorder: 'Drag to reorder',
    moveEarlier: 'Move earlier',
    moveLater: 'Move later',
    savedPhotos: 'Saved Photos',
    eyebrow: 'Eyebrow',
    name: 'Name',
    bioP: 'Bio Paragraph',
    bioLang: 'Bio language',
    bioLangHint:
      'English is the default. UA/ES fall back to English if left blank.',
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
    editBrands: 'Edit Brands',
    brandsIntro:
      'Brands you work with. They appear in a popup from the Treatments section.',
    addBrand: 'Add brand',
    brandName: 'Brand name',
    brandNamePlaceholder: 'e.g. GlyMed Plus',
    brandLogo: 'Logo (optional)',
    noBrandsTitle: 'No brands yet',
    noBrandsBody: 'Added brands will appear here and on the website.',
    confirmDeleteBrand: 'Remove this brand?',
  },
  uk: {
    studioAdmin: 'Адмін студії',
    adminTitle: 'Адмін',
    navReviews: 'Відгуки',
    navServices: 'Послуги',
    navBio: 'Біо',
    navGallery: 'Галерея',
    navBrands: 'Бренди',
    navBookings: 'Записи',
    navContact: 'Контакти',
    navDomain: 'Домен',
    domainTitle: 'Поновлення домену',
    domainIntro:
      'Стежте за датою поновлення домену сайту. Оновлюйте дату тут після кожного поновлення, щоб нагадування було актуальним.',
    domainNameLabel: 'Назва домену',
    renewalDateLabel: 'Дата поновлення',
    domainRenewsOn: 'Поновлюється',
    domainInDays: 'через {n} дн.',
    domainDaysAgo: '{n} дн. тому',
    domainToday: 'Поновлюється сьогодні',
    domainOverdue: 'Прострочено — поновіть зараз',
    domainNoDate: 'Дату поновлення ще не вказано.',
    domainSoonNote: 'Скоро термін поновлення.',
    addOneYear: '+1 рік',
    domainSaved: '✓ Дані домену збережено',
    domainProviderNote:
      'Ваш домен зареєстровано на Wix. Поновлення потрібно робити вручну на wix.com — зміна дати тут лише оновлює нагадування, але не поновлює домен.',
    domainWhoRenews:
      'Яніна, Паша або веброзробник можуть увійти на Wix і поновити домен до цієї дати.',
    domainWixCta: 'Відкрити Wix для поновлення →',
    domainConfirmTitle: 'Лише оновити нагадування',
    domainConfirmBody:
      'Це оновлює лише дату нагадування — домен НЕ поновлюється. Переконайтеся, що домен поновлено на wix.com. Продовжити?',
    domainConfirmCta: 'Так, оновити нагадування',
    domainNewDateLabel: 'Нова дата нагадування',
    website: '← Сайт',
    logout: 'Вийти',

    signIn: 'Вхід',
    signInSubtitle: 'Доступ лише для авторизованих',
    emailPlaceholder: 'Email',
    password: 'Пароль',
    passwordPlaceholder: 'Пароль',
    loginBtn: 'Увійти',
    signingIn: 'Вхід…',
    incorrectPassword: 'Невірний email або пароль',
    notAuthorized: 'Цей акаунт не має доступу до адмінпанелі.',
    checkingSession: 'Перевірка сесії…',
    subReviews: 'Керування відгуками',
    subServices: 'Керування послугами',
    subBio: 'Керування біо',
    subGallery: 'Керування галереєю',

    loading: 'Завантаження…',
    storage: 'Сховище',
    manageStorage: 'Керувати сховищем',
    storageTitle: 'Керування сховищем',
    storageIntro:
      'Найбільші файли — першими. Файли «Не використовується» ніде не показані на сайті, їх безпечно видаляти. Файли «Використовується» захищені — спершу приберіть їх з відгуку, галереї чи біо.',
    storageInUse: 'Використовується',
    storageUnused: 'Не використовується',
    selectUnused: 'Вибрати всі невикористані',
    clearSelection: 'Очистити',
    deleteSelected: 'Видалити вибрані',
    storageNoFiles: 'Файлів не знайдено.',
    storageDeleting: 'Видалення…',
    confirmDeleteFiles:
      'Видалити вибрані файли? Це звільнить місце і не може бути скасовано.',
    storageFreed: '✓ Файли видалено',
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
    editPrice: 'Редагувати ціну',
    editName: 'Редагувати назву',
    editDuration: 'Редагувати тривалість',
    addDuration: '+ тривалість',
    editDescription: 'Редагувати опис',
    addDescription: '+ опис',
    addServiceToCategory: '+ Додати послугу сюди',

    editBio: 'Редагувати біо',
    photo: 'Фото',
    dropImage: 'Перетягніть фото сюди або натисніть, щоб завантажити',
    dropHint: 'Макс. 10MB • JPEG, PNG, WebP',
    adjustPosition: 'Налаштувати положення та розмір',
    zoom: 'Масштаб',
    dragHint: 'Перетягніть фото, щоб змінити положення',
    dragToReorder: 'Перетягніть, щоб змінити порядок',
    moveEarlier: 'Перемістити раніше',
    moveLater: 'Перемістити пізніше',
    savedPhotos: 'Збережені фото',
    eyebrow: 'Підзаголовок',
    name: 'Імʼя',
    bioP: 'Абзац біо',
    bioLang: 'Мова біо',
    bioLangHint:
      'Англійська — за замовчуванням. UA/ES повертаються до англійської, якщо порожньо.',
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
    editBrands: 'Редагувати бренди',
    brandsIntro:
      'Бренди, з якими ви працюєте. Вони показуються у спливаючому вікні з розділу «Процедури».',
    addBrand: 'Додати бренд',
    brandName: 'Назва бренду',
    brandNamePlaceholder: 'напр. GlyMed Plus',
    brandLogo: 'Логотип (необовʼязково)',
    noBrandsTitle: 'Поки немає брендів',
    noBrandsBody: 'Додані бренди зʼявляться тут і на сайті.',
    confirmDeleteBrand: 'Видалити цей бренд?',
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
