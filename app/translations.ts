import type { Lang } from './context/LanguageContext';

export const t = {
  en: {
    // Nav
    nav: {
      services: 'Services',
      about: 'About',
      gallery: 'Gallery',
      reviews: 'Reviews',
      bookNow: 'Book Now',
    },

    // Hero
    hero: {
      subtitle: 'Licensed Esthetician',
      heading: 'Your Skin Deserves This',
      body: 'Professional facials and personalized skincare treatments designed just for you.',
      bookFacial: 'Book a Facial',
      viewServices: 'View Services',
    },

    // Services
    services: {
      eyebrow: 'What I Offer',
      heading: 'Treatments',
      body: 'Every service is personalised to your skin — no two clients, no two protocols, are ever the same.',
      bookNow: 'Book Now',
      items: [
        {
          title: 'Custom Facial',
          price: 'From $95',
          description:
            'Tailored to your skin type — deep cleanse, exfoliation, steam, extractions if needed, mask, and hydration. Perfect for all skin types and great as a monthly reset.',
        },
        {
          title: 'Chemical Peel',
          price: 'From $120',
          description:
            'Resurface and renew with a professional-grade peel targeting hyperpigmentation, acne scarring, fine lines, and uneven texture. Customised strength for your skin.',
        },
        {
          title: 'Microneedling',
          price: 'From $250',
          description:
            "Collagen induction therapy using fine micro-channels to stimulate your skin's natural repair process. Results in firmer, smoother, more youthful-looking skin over time.",
        },
        {
          title: 'LED Light Therapy',
          price: 'From $65',
          description:
            'Non-invasive, relaxing treatment using targeted wavelengths to reduce inflammation, calm breakouts, and boost skin radiance. Can be added to any facial.',
        },
      ],
    },

    // Process
    process: {
      eyebrow: 'The Process',
      heading: 'Your Journey to Glowing Skin',
      steps: [
        {
          title: 'Consultation',
          description:
            'We begin with a thorough skin analysis to understand your concerns, goals, and skin history. No guesswork — just a personalised plan.',
        },
        {
          title: 'Treatment',
          description:
            'A bespoke protocol performed in a calm, serene space. Every step is intentional, from cleanse to finish.',
        },
        {
          title: 'Glow',
          description:
            "You'll leave with visible results and a curated aftercare routine to extend and protect your treatment at home.",
        },
      ],
    },

    // About
    about: {
      eyebrow: 'Meet Your Esthetician',
      name: 'Dr. Yanina Menaker',
      bio1: "I'm a licensed esthetician based in Rochester, NY, with a deep passion for helping clients feel confident and comfortable in their own skin. My approach is rooted in science, but always tailored to the individual — because your skin has a unique story, and it deserves to be treated that way.",
      bio2: "Whether you're dealing with acne, hyperpigmentation, premature aging, or simply want to invest in your skin's long-term health, I'm here to guide you with honest advice, proven techniques, and genuine care every step of the way.",
      bio3: 'Every appointment is a space for you to relax, reset, and leave glowing — not just on the outside.',
      badges: ['Licensed Esthetician', 'Rochester, NY', 'Skin Specialist'],
    },

    // Gallery
    gallery: {
      eyebrow: 'Results & Space',
      heading: 'The Experience',
      body: 'A glimpse into the treatments, the results, and the space where it all happens.',
      photoLabel: 'Photo',
    },

    // Testimonials
    testimonials: {
      eyebrow: 'Kind Words',
      heading: 'What Clients',
      headingEm: 'Say',
      swipe: 'swipe',
      items: [
        {
          name: 'Sarah M.',
          initials: 'SM',
          text: 'My skin has never looked better. Dr. Menaker really listened to my concerns and created a treatment plan that actually worked. I saw results after just two sessions.',
        },
        {
          name: 'Priya K.',
          initials: 'PK',
          text: "The microneedling series completely transformed my skin texture and faded my acne scars. I'm obsessed with my results and won't go anywhere else.",
        },
        {
          name: 'Jessica R.',
          initials: 'JR',
          text: 'Such a calming, professional experience from start to finish. I leave every single appointment glowing. Highly, highly recommend.',
        },
      ],
    },

    // Reviews
    reviews: {
      eyebrow: 'Client Reviews',
      heading: 'Leave a',
      headingEm: 'Review',
      subheading: "Had a visit with Dr. Menaker? We'd love to hear about your experience.",
      formTitle: 'Share Your Experience',
      formSubtitle: 'Your review helps others discover Dr. Yanina Menaker.',
      photoLabel: 'Profile Photo',
      photoHint: 'Optional · appears with your review',
      photoUpload: '+ Photo',
      namePlaceholder: 'e.g. Sofia M.',
      nameLabel: 'Your Name',
      ratingLabel: 'Rating',
      reviewLabel: 'Your Review',
      reviewPlaceholder: 'Tell us about your experience...',
      submit: 'Submit Review',
      thankYou: 'Thank you! ✦',
      showAll: 'Read All Reviews',
      hideAll: 'Hide Reviews',
      firstReview: 'Be the first to leave a review ✦',
      sortNewest: 'Newest First',
      sortOldest: 'Oldest First',
      sortHighest: 'Highest Rated',
      sortLowest: 'Lowest Rated',
      reviewCount: (n: number) => `${n} review${n !== 1 ? 's' : ''}`,
      emojiLabels: ['Terrible', 'Poor', 'Okay', 'Good', 'Amazing'],
    },

    // Book CTA
    book: {
      heading: 'Ready to Glow?',
      body: 'Book your appointment online. New clients always welcome in Rochester, NY.',
      cta: 'Book Your Appointment',
    },

    // Policies
    policies: {
      eyebrow: 'Before You Come In',
      heading: 'Good to Know',
      items: [
        {
          title: 'Cancellation Policy',
          body: 'Please cancel or reschedule at least 24 hours in advance. Late cancellations (under 24 hours) are subject to a 50% service fee. No-shows will be charged the full service amount. I appreciate your understanding — this allows me to accommodate other clients.',
        },
        {
          title: 'Late Arrival',
          body: 'I do my best to accommodate late arrivals, however your treatment time may be shortened to avoid affecting other scheduled appointments. Arrivals more than 15 minutes late may need to be rescheduled.',
        },
        {
          title: 'Skincare Prep',
          body: 'Please arrive with a clean face. Avoid retinoids, exfoliants, or any active acids for 3–5 days prior to chemical peels or microneedling. SPF is required post-treatment — I recommend avoiding direct sun exposure for at least 48 hours after any resurfacing service.',
        },
      ],
    },

    // Footer
    footer: {
      tagline: 'Luxury skincare in Rochester, NY.\nPersonalised treatments for your best skin.',
      quickLinks: 'Quick Links',
      followAlong: 'Follow Along',
      copyright: '© 2026 Dr. Yanina Menaker · Rochester, NY · All rights reserved',
      links: [
        ['Services', '#services'],
        ['About', '#about'],
        ['Reviews', '#reviews'],
        ['Book Now', '#book'],
        ['Policies', '#policies'],
      ] as [string, string][],
    },
  },

  // ── UKRAINIAN ──────────────────────────────────────────────────────────────
  uk: {
    nav: {
      services: 'Послуги',
      about: 'Про мене',
      gallery: 'Галерея',
      reviews: 'Відгуки',
      bookNow: 'Записатися',
    },

    hero: {
      subtitle: 'Ліцензований естетист',
      heading: 'Ваша шкіра заслуговує на це',
      body: 'Професійні догляди та персоналізовані процедури для вашої шкіри.',
      bookFacial: 'Записатися на процедуру',
      viewServices: 'Переглянути послуги',
    },

    services: {
      eyebrow: 'Що я пропоную',
      heading: 'Процедури',
      body: 'Кожна послуга персоналізована під ваш тип шкіри — жодних двох однакових протоколів.',
      bookNow: 'Записатися',
      items: [
        {
          title: 'Індивідуальний догляд',
          price: 'Від $95',
          description:
            'Підібраний під ваш тип шкіри — глибоке очищення, ексфоліація, пар, при необхідності видалення комедонів, маска та зволоження. Ідеально для всіх типів шкіри.',
        },
        {
          title: 'Хімічний пілінг',
          price: 'Від $120',
          description:
            'Оновлення шкіри за допомогою професійного пілінгу, який усуває гіперпігментацію, сліди від акне, дрібні зморщки та нерівну текстуру.',
        },
        {
          title: 'Мікронідлінг',
          price: 'Від $250',
          description:
            'Терапія індукції колагену через мікроканали, що стимулює природний процес відновлення шкіри. Результат — більш пружна, гладка та молодша шкіра.',
        },
        {
          title: 'LED-терапія',
          price: 'Від $65',
          description:
            'Неінвазивна, розслаблювальна процедура, що використовує цільові довжини хвиль для зменшення запалення, заспокоєння проблемної шкіри та підвищення її сяяння.',
        },
      ],
    },

    process: {
      eyebrow: 'Процес',
      heading: 'Ваш шлях до сяючої шкіри',
      steps: [
        {
          title: 'Консультація',
          description:
            'Починаємо з детального аналізу шкіри, щоб зрозуміти ваші потреби, цілі та історію. Без здогадок — лише персоналізований план.',
        },
        {
          title: 'Процедура',
          description:
            'Індивідуальний протокол у спокійній, затишній атмосфері. Кожен крок — з наміром, від очищення до фіналу.',
        },
        {
          title: 'Сяяння',
          description:
            'Ви підете з видимим результатом і підібраною програмою догляду, щоб підтримати та захистити результат вдома.',
        },
      ],
    },

    about: {
      eyebrow: 'Знайомтеся з вашим естетистом',
      name: 'Доктор Яніна Менакер',
      bio1: 'Я ліцензований естетист у Рочестері, штат Нью-Йорк, із глибокою пристрастю до допомоги клієнтам почуватися впевнено і комфортно у власній шкірі. Мій підхід базується на науці, але завжди адаптується до індивідуальних потреб.',
      bio2: 'Незалежно від того, чи маєте ви справу з акне, гіперпігментацією, передчасним старінням або просто хочете інвестувати в довгострокове здоров\'я шкіри — я тут, щоб скерувати вас.',
      bio3: 'Кожен прийом — це простір для відпочинку, відновлення та виходу з ним із сяянням — не лише зовні.',
      badges: ['Ліцензований естетист', 'Рочестер, Нью-Йорк', 'Спеціаліст зі шкіри'],
    },

    gallery: {
      eyebrow: 'Результати та простір',
      heading: 'Досвід',
      body: 'Погляд на процедури, результати та простір, де все це відбувається.',
      photoLabel: 'Фото',
    },

    testimonials: {
      eyebrow: 'Добрі слова',
      heading: 'Що кажуть',
      headingEm: 'клієнти',
      swipe: 'гортайте',
      items: [
        {
          name: 'Sarah M.',
          initials: 'SM',
          text: 'Моя шкіра ніколи не виглядала краще. Доктор Менакер справді прислухалася до моїх проблем і склала план лікування, який справді спрацював. Я побачила результати вже після двох сеансів.',
        },
        {
          name: 'Priya K.',
          initials: 'PK',
          text: 'Курс мікронідлінгу повністю змінив текстуру моєї шкіри і освітлив сліди від акне. Я в захваті від результатів і нікуди більше не піду.',
        },
        {
          name: 'Jessica R.',
          initials: 'JR',
          text: 'Такий спокійний, професійний досвід від початку до кінця. Я виходжу з кожного прийому з сяянням. Дуже, дуже рекомендую.',
        },
      ],
    },

    reviews: {
      eyebrow: 'Відгуки клієнтів',
      heading: 'Залишити',
      headingEm: 'відгук',
      subheading: 'Були у доктора Менакер? Ми раді почути про ваш досвід.',
      formTitle: 'Поділіться своїм досвідом',
      formSubtitle: 'Ваш відгук допомагає іншим дізнатися про доктора Яніну Менакер.',
      photoLabel: 'Фото профілю',
      photoHint: 'Необов\'язково · відображається з вашим відгуком',
      photoUpload: '+ Фото',
      namePlaceholder: 'напр. Олена М.',
      nameLabel: 'Ваше ім\'я',
      ratingLabel: 'Оцінка',
      reviewLabel: 'Ваш відгук',
      reviewPlaceholder: 'Розкажіть про ваш досвід...',
      submit: 'Надіслати відгук',
      thankYou: 'Дякуємо! ✦',
      showAll: 'Читати всі відгуки',
      hideAll: 'Приховати відгуки',
      firstReview: 'Будьте першим, хто залишить відгук ✦',
      sortNewest: 'Спочатку нові',
      sortOldest: 'Спочатку старі',
      sortHighest: 'Найвища оцінка',
      sortLowest: 'Найнижча оцінка',
      reviewCount: (n: number) => `${n} відгук${n === 1 ? '' : n >= 2 && n <= 4 ? 'и' : 'ів'}`,
      emojiLabels: ['Жахливо', 'Погано', 'Нормально', 'Добре', 'Чудово'],
    },

    book: {
      heading: 'Готові сяяти?',
      body: 'Запишіться онлайн. Нові клієнти завжди вітаються в Рочестері, Нью-Йорк.',
      cta: 'Записатися на прийом',
    },

    policies: {
      eyebrow: 'Перед відвідуванням',
      heading: 'Корисно знати',
      items: [
        {
          title: 'Політика скасування',
          body: 'Будь ласка, скасовуйте або переносьте запис щонайменше за 24 години. Пізні скасування (менше 24 годин) підлягають оплаті 50% від вартості послуги. Неявка без попередження оплачується повністю.',
        },
        {
          title: 'Запізнення',
          body: 'Я роблю все можливе, щоб прийняти клієнтів, що запізнилися, однак час процедури може бути скорочено. Запізнення більше 15 хвилин може призвести до перенесення запису.',
        },
        {
          title: 'Підготовка шкіри',
          body: 'Будь ласка, приходьте з очищеним обличчям. Уникайте ретиноїдів, ексфоліантів і активних кислот за 3–5 днів до хімічного пілінгу або мікронідлінгу. Після процедури необхідний СПФ — рекомендую уникати прямого сонця щонайменше 48 годин.',
        },
      ],
    },

    footer: {
      tagline: 'Преміальний догляд за шкірою в Рочестері, Нью-Йорк.\nПерсоналізовані процедури для вашої найкращої шкіри.',
      quickLinks: 'Швидкі посилання',
      followAlong: 'Стежте за нами',
      copyright: '© 2026 Доктор Яніна Менакер · Рочестер, Нью-Йорк · Всі права захищені',
      links: [
        ['Послуги', '#services'],
        ['Про мене', '#about'],
        ['Відгуки', '#reviews'],
        ['Записатися', '#book'],
        ['Правила', '#policies'],
      ] as [string, string][],
    },
  },

  // ── SPANISH ───────────────────────────────────────────────────────────────
  es: {
    nav: {
      services: 'Servicios',
      about: 'Sobre mí',
      gallery: 'Galería',
      reviews: 'Reseñas',
      bookNow: 'Reservar',
    },

    hero: {
      subtitle: 'Esteticista Certificada',
      heading: 'Tu Piel Merece Esto',
      body: 'Tratamientos faciales profesionales y rutinas personalizadas diseñadas especialmente para ti.',
      bookFacial: 'Reservar un Facial',
      viewServices: 'Ver Servicios',
    },

    services: {
      eyebrow: 'Lo Que Ofrezco',
      heading: 'Tratamientos',
      body: 'Cada servicio se personaliza para tu piel — no hay dos clientes ni dos protocolos iguales.',
      bookNow: 'Reservar',
      items: [
        {
          title: 'Facial Personalizado',
          price: 'Desde $95',
          description:
            'Adaptado a tu tipo de piel — limpieza profunda, exfoliación, vapor, extracción si es necesario, mascarilla e hidratación. Perfecto para todo tipo de piel.',
        },
        {
          title: 'Peeling Químico',
          price: 'Desde $120',
          description:
            'Renueva tu piel con un peeling de grado profesional que combate la hiperpigmentación, cicatrices de acné, líneas finas y textura irregular.',
        },
        {
          title: 'Microagujas',
          price: 'Desde $250',
          description:
            'Terapia de inducción de colágeno mediante microcanales que estimula el proceso natural de reparación cutánea. Resulta en una piel más firme, suave y rejuvenecida.',
        },
        {
          title: 'Terapia de Luz LED',
          price: 'Desde $65',
          description:
            'Tratamiento no invasivo y relajante con longitudes de onda específicas para reducir la inflamación, calmar el acné y potenciar la luminosidad de la piel.',
        },
      ],
    },

    process: {
      eyebrow: 'El Proceso',
      heading: 'Tu Camino hacia una Piel Radiante',
      steps: [
        {
          title: 'Consulta',
          description:
            'Comenzamos con un análisis completo de la piel para entender tus preocupaciones, objetivos e historial. Sin suposiciones — solo un plan personalizado.',
        },
        {
          title: 'Tratamiento',
          description:
            'Un protocolo a medida realizado en un espacio tranquilo y sereno. Cada paso es intencional, desde la limpieza hasta el acabado.',
        },
        {
          title: 'Brillo',
          description:
            'Saldrás con resultados visibles y una rutina de cuidado personalizada para prolongar y proteger tu tratamiento en casa.',
        },
      ],
    },

    about: {
      eyebrow: 'Conoce a tu Esteticista',
      name: 'Dra. Yanina Menaker',
      bio1: 'Soy esteticista certificada con base en Rochester, NY, con una profunda pasión por ayudar a mis clientes a sentirse seguros y cómodos en su propia piel. Mi enfoque está arraigado en la ciencia, pero siempre adaptado al individuo.',
      bio2: 'Ya sea que estés lidiando con acné, hiperpigmentación, envejecimiento prematuro o simplemente quieras invertir en la salud a largo plazo de tu piel, estoy aquí para guiarte con consejos honestos y cuidado genuino.',
      bio3: 'Cada cita es un espacio para que te relajes, te reconectes y salgas radiante — no solo por fuera.',
      badges: ['Esteticista Certificada', 'Rochester, NY', 'Especialista en Piel'],
    },

    gallery: {
      eyebrow: 'Resultados y Espacio',
      heading: 'La Experiencia',
      body: 'Un vistazo a los tratamientos, los resultados y el espacio donde todo sucede.',
      photoLabel: 'Foto',
    },

    testimonials: {
      eyebrow: 'Palabras Amables',
      heading: 'Qué Dicen',
      headingEm: 'las Clientas',
      swipe: 'desliza',
      items: [
        {
          name: 'Sarah M.',
          initials: 'SM',
          text: 'Mi piel nunca ha lucido mejor. La Dra. Menaker escuchó mis preocupaciones y creó un plan de tratamiento que realmente funcionó. Vi resultados después de solo dos sesiones.',
        },
        {
          name: 'Priya K.',
          initials: 'PK',
          text: 'La serie de microagujas transformó completamente la textura de mi piel y desvaneció mis cicatrices de acné. Estoy obsesionada con mis resultados y no iré a ningún otro lugar.',
        },
        {
          name: 'Jessica R.',
          initials: 'JR',
          text: 'Una experiencia tan tranquila y profesional de principio a fin. Salgo radiante de cada cita. Lo recomiendo muchísimo.',
        },
      ],
    },

    reviews: {
      eyebrow: 'Reseñas de Clientas',
      heading: 'Deja una',
      headingEm: 'Reseña',
      subheading: '¿Visitaste a la Dra. Menaker? Nos encantaría escuchar tu experiencia.',
      formTitle: 'Comparte tu Experiencia',
      formSubtitle: 'Tu reseña ayuda a otras personas a descubrir a la Dra. Yanina Menaker.',
      photoLabel: 'Foto de Perfil',
      photoHint: 'Opcional · aparece junto a tu reseña',
      photoUpload: '+ Foto',
      namePlaceholder: 'ej. Sofía M.',
      nameLabel: 'Tu Nombre',
      ratingLabel: 'Calificación',
      reviewLabel: 'Tu Reseña',
      reviewPlaceholder: 'Cuéntanos sobre tu experiencia...',
      submit: 'Enviar Reseña',
      thankYou: '¡Gracias! ✦',
      showAll: 'Leer Todas las Reseñas',
      hideAll: 'Ocultar Reseñas',
      firstReview: 'Sé la primera en dejar una reseña ✦',
      sortNewest: 'Más Recientes',
      sortOldest: 'Más Antiguas',
      sortHighest: 'Mayor Calificación',
      sortLowest: 'Menor Calificación',
      reviewCount: (n: number) => `${n} reseña${n !== 1 ? 's' : ''}`,
      emojiLabels: ['Terrible', 'Malo', 'Regular', 'Bueno', 'Increíble'],
    },

    book: {
      heading: '¿Lista para Brillar?',
      body: 'Reserva tu cita en línea. Nuevas clientas siempre bienvenidas en Rochester, NY.',
      cta: 'Reservar tu Cita',
    },

    policies: {
      eyebrow: 'Antes de Venir',
      heading: 'Bueno Saberlo',
      items: [
        {
          title: 'Política de Cancelación',
          body: 'Por favor cancela o reagenda con al menos 24 horas de anticipación. Las cancelaciones tardías (menos de 24 horas) están sujetas a un cargo del 50% del servicio. Las ausencias sin aviso serán cobradas en su totalidad.',
        },
        {
          title: 'Llegada Tarde',
          body: 'Hago lo posible por atender a clientas que llegan tarde, sin embargo el tiempo de tratamiento puede acortarse. Las llegadas con más de 15 minutos de retraso pueden necesitar reagendarse.',
        },
        {
          title: 'Preparación de la Piel',
          body: 'Por favor llega con el rostro limpio. Evita retinoides, exfoliantes o ácidos activos durante 3–5 días antes de peelings químicos o microagujas. Se requiere SPF después del tratamiento — recomiendo evitar la exposición solar directa durante al menos 48 horas.',
        },
      ],
    },

    footer: {
      tagline: 'Cuidado de piel de lujo en Rochester, NY.\nTratamientos personalizados para tu mejor piel.',
      quickLinks: 'Enlaces Rápidos',
      followAlong: 'Síguenos',
      copyright: '© 2026 Dra. Yanina Menaker · Rochester, NY · Todos los derechos reservados',
      links: [
        ['Servicios', '#services'],
        ['Sobre mí', '#about'],
        ['Reseñas', '#reviews'],
        ['Reservar', '#book'],
        ['Políticas', '#policies'],
      ] as [string, string][],
    },
  },
} satisfies Record<Lang, object>;

export function useT(lang: Lang) {
  return t[lang];
}
