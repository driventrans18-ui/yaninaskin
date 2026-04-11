import type { Lang } from './context/LanguageContext';

export type Treatment = {
  title: string;
  price: string;
  duration?: string;
  description?: string;
  note?: string;
};

export type ServiceCategory = {
  title: string;
  description?: string;
  treatments: Treatment[];
};

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
      categories: [
        {
          title: 'Cleansing & Signature Facials',
          treatments: [
            {
              title: 'Ultrasound Cleaning',
              price: '$80',
              duration: '1 hour',
              description:
                'Cleansing, scrub exfoliation, warming mask, ultrasonic scrubber, non-traumatic exfoliation, mask tailored to skin type, toning, and hydration.',
            },
            {
              title: 'Combined Cleaning',
              price: '$100–120',
              duration: '1.5 hours',
              description:
                'Deep pore cleansing for blackheads, comedones, and milia. Cleansing, scrub, warming mask, ultrasonic and manual extraction, tailored mask, toning, and hydration.',
              note: 'Price depends on the level of facial impurities.',
            },
            {
              title: 'Cleansing + Peeling',
              price: '$130–160',
              description:
                'Professional cleansing followed by a peel selected during the procedure based on your skin type and concerns.',
              note: 'Price depends on the type of peeling recommended for your skin.',
            },
            {
              title: 'Diamond Glow Deluxe',
              price: '$140',
              description:
                'Dermabrasion, hydrafacial, oxygen therapy, LED therapy, and a finishing hydrogel mask.',
            },
          ],
        },
        {
          title: 'Chemical Peels',
          description:
            'A controlled skin-resurfacing procedure with therapeutic benefits. Peel is selected for your skin type and goals.',
          treatments: [
            { title: 'GlyMed Peel', price: '$80' },
            { title: 'PRX-T33 Peel', price: '$100' },
            { title: 'BioRePeel', price: '$90' },
            { title: 'Simildiet Peel', price: '$60' },
            { title: 'Innoaesthetic MCA 35 Peel', price: '$100' },
            { title: 'Retinol Peel', price: '$110' },
            { title: 'Appex Peel PDRN', price: '$90' },
          ],
        },
        {
          title: 'Hydration & Specialty Programs',
          treatments: [
            { title: 'Deep Intensive Hydration (Vitalise)', price: '$80' },
            { title: 'Enzymatic Lifting (GlyMed)', price: '$80' },
            { title: 'Enzymatic Lifting (DMK)', price: '$120' },
            { title: 'Carboxytherapy', price: '$80' },
            { title: 'Antioxidant Program with Vitamin C', price: '$80' },
            {
              title: 'Lift Up Pro',
              price: '$200',
              description:
                'Total skin tightening and rejuvenation: RF + Microneedling + LED + Pro Peeling — all in one session.',
            },
            {
              title: 'Customized Combination Treatments',
              price: 'From $90+',
              description:
                'Targeting hydration, brightening, or skin rejuvenation — built around your skin that day.',
            },
          ],
        },
        {
          title: 'Zemits VERSTAND HD Device',
          description:
            'Advanced facial treatments powered by the Zemits VERSTAND HD device.',
          treatments: [
            { title: 'HydroDiamond Facial — Single Session', price: '$175' },
            {
              title: 'HydroDiamond Facial with Serum Infusion & Cold Toning',
              price: '$220',
            },
            { title: 'VERSTAND HD Full Facial — Single Session', price: '$250–300' },
            {
              title: 'VERSTAND HD Full Facial — 4-Session Package',
              price: '$220–280',
              note: 'Per treatment.',
            },
            {
              title: 'VERSTAND HD Full Facial — 8-Session Package',
              price: '$200–260',
              note: 'Per treatment.',
            },
            {
              title: 'RF Lifting — Skin Firming',
              price: '$110',
              description: 'Non-invasive collagen and elastin stimulation.',
            },
            { title: 'Electroporation Treatment', price: '$80' },
            { title: 'Non-Invasive Mesotherapy', price: '$110' },
            { title: 'Vacuum Face Massage', price: '$60' },
            { title: 'Cryotherapy', price: '$60' },
          ],
        },
        {
          title: 'Additional Hardware Techniques',
          treatments: [
            { title: 'Darsonval Therapy', price: '$60' },
            { title: 'Microcurrent Therapy', price: '$80' },
            { title: 'LED Therapy', price: '$35–75' },
            { title: 'Microneedling', price: '$110–250' },
          ],
        },
      ] as ServiceCategory[],
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
      categories: [
        {
          title: 'Очищення та фірмові догляди',
          treatments: [
            {
              title: 'Ультразвукове чищення',
              price: '$80',
              duration: '1 година',
              description:
                'Очищення, ексфоліація скрабом, розігріваюча маска, ультразвуковий скрабер, нетравматична ексфоліація, маска під тип шкіри, тонізація та зволоження.',
            },
            {
              title: 'Комбіноване чищення',
              price: '$100–120',
              duration: '1,5 години',
              description:
                'Глибоке чищення пор від чорних крапок, комедонів та міліумів. Очищення, скраб, розігріваюча маска, ультразвукове і мануальне чищення, маска, тонізація та зволоження.',
              note: 'Ціна залежить від ступеня забруднення шкіри.',
            },
            {
              title: 'Чищення + Пілінг',
              price: '$130–160',
              description:
                'Професійне чищення з наступним пілінгом, який підбирається під час процедури з урахуванням вашого типу шкіри та її потреб.',
              note: 'Ціна залежить від типу пілінгу, рекомендованого для вашої шкіри.',
            },
            {
              title: 'Diamond Glow Deluxe',
              price: '$140',
              description:
                'Дермабразія, гідрафейшл, оксигенотерапія, LED-терапія та фінішна гідрогелева маска.',
            },
          ],
        },
        {
          title: 'Хімічні пілінги',
          description:
            'Контрольована процедура оновлення шкіри з терапевтичним ефектом. Пілінг підбирається під ваш тип шкіри та цілі.',
          treatments: [
            { title: 'Пілінг GlyMed', price: '$80' },
            { title: 'Пілінг PRX-T33', price: '$100' },
            { title: 'BioRePeel', price: '$90' },
            { title: 'Пілінг Simildiet', price: '$60' },
            { title: 'Пілінг Innoaesthetic MCA 35', price: '$100' },
            { title: 'Ретиноловий пілінг', price: '$110' },
            { title: 'Пілінг Appex PDRN', price: '$90' },
          ],
        },
        {
          title: 'Зволоження та спеціальні програми',
          treatments: [
            { title: 'Глибоке інтенсивне зволоження (Vitalise)', price: '$80' },
            { title: 'Ензимний ліфтинг (GlyMed)', price: '$80' },
            { title: 'Ензимний ліфтинг (DMK)', price: '$120' },
            { title: 'Карбокситерапія', price: '$80' },
            { title: 'Антиоксидантна програма з вітаміном C', price: '$80' },
            {
              title: 'Lift Up Pro',
              price: '$200',
              description:
                'Комплексне підтягування та омолодження шкіри: RF + мікронідлінг + LED + про-пілінг — все в одному сеансі.',
            },
            {
              title: 'Індивідуальні комбіновані процедури',
              price: 'Від $90+',
              description:
                'Спрямовані на зволоження, освітлення або омолодження шкіри — підбираються під стан шкіри в день процедури.',
            },
          ],
        },
        {
          title: 'Апарат Zemits VERSTAND HD',
          description:
            'Професійні процедури для обличчя з використанням апарата Zemits VERSTAND HD.',
          treatments: [
            { title: 'HydroDiamond Facial — один сеанс', price: '$175' },
            {
              title: 'HydroDiamond Facial з інфузією сироватки та холодним тонізуванням',
              price: '$220',
            },
            { title: 'VERSTAND HD Full Facial — один сеанс', price: '$250–300' },
            {
              title: 'VERSTAND HD Full Facial — пакет 4 сеанси',
              price: '$220–280',
              note: 'За один сеанс.',
            },
            {
              title: 'VERSTAND HD Full Facial — пакет 8 сеансів',
              price: '$200–260',
              note: 'За один сеанс.',
            },
            {
              title: 'RF-ліфтинг — зміцнення шкіри',
              price: '$110',
              description: 'Неінвазивна стимуляція вироблення колагену та еластину.',
            },
            { title: 'Електропорація', price: '$80' },
            { title: 'Неінвазивна мезотерапія', price: '$110' },
            { title: 'Вакуумний масаж обличчя', price: '$60' },
            { title: 'Кріотерапія', price: '$60' },
          ],
        },
        {
          title: 'Додаткові апаратні методики',
          treatments: [
            { title: 'Дарсонвалізація', price: '$60' },
            { title: 'Мікрострумова терапія', price: '$80' },
            { title: 'LED-терапія', price: '$35–75' },
            { title: 'Мікронідлінг', price: '$110–250' },
          ],
        },
      ] as ServiceCategory[],
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
      categories: [
        {
          title: 'Limpiezas y Faciales Insignia',
          treatments: [
            {
              title: 'Limpieza Ultrasónica',
              price: '$80',
              duration: '1 hora',
              description:
                'Limpieza, exfoliación con scrub, mascarilla tibia, scrubber ultrasónico, exfoliación no traumática, mascarilla adaptada a tu tipo de piel, tonificación e hidratación.',
            },
            {
              title: 'Limpieza Combinada',
              price: '$100–120',
              duration: '1,5 horas',
              description:
                'Limpieza profunda de poros para puntos negros, comedones y milium. Limpieza, scrub, mascarilla tibia, extracción ultrasónica y manual, mascarilla personalizada, tonificación e hidratación.',
              note: 'El precio depende del nivel de impurezas de la piel.',
            },
            {
              title: 'Limpieza + Peeling',
              price: '$130–160',
              description:
                'Limpieza profesional seguida de un peeling seleccionado durante el procedimiento según tu tipo de piel y tus necesidades.',
              note: 'El precio depende del tipo de peeling recomendado para tu piel.',
            },
            {
              title: 'Diamond Glow Deluxe',
              price: '$140',
              description:
                'Dermoabrasión, hidrafacial, oxigenoterapia, terapia LED y mascarilla de hidrogel de acabado.',
            },
          ],
        },
        {
          title: 'Peelings Químicos',
          description:
            'Procedimiento controlado de renovación cutánea con beneficios terapéuticos. El peeling se selecciona según tu tipo de piel y objetivos.',
          treatments: [
            { title: 'Peeling GlyMed', price: '$80' },
            { title: 'Peeling PRX-T33', price: '$100' },
            { title: 'BioRePeel', price: '$90' },
            { title: 'Peeling Simildiet', price: '$60' },
            { title: 'Peeling Innoaesthetic MCA 35', price: '$100' },
            { title: 'Peeling de Retinol', price: '$110' },
            { title: 'Peeling Appex PDRN', price: '$90' },
          ],
        },
        {
          title: 'Hidratación y Programas Especiales',
          treatments: [
            { title: 'Hidratación Profunda Intensiva (Vitalise)', price: '$80' },
            { title: 'Lifting Enzimático (GlyMed)', price: '$80' },
            { title: 'Lifting Enzimático (DMK)', price: '$120' },
            { title: 'Carboxiterapia', price: '$80' },
            { title: 'Programa Antioxidante con Vitamina C', price: '$80' },
            {
              title: 'Lift Up Pro',
              price: '$200',
              description:
                'Reafirmación y rejuvenecimiento total: RF + Microagujas + LED + Peeling Pro — todo en una sesión.',
            },
            {
              title: 'Tratamientos Combinados Personalizados',
              price: 'Desde $90+',
              description:
                'Orientados a hidratación, luminosidad o rejuvenecimiento — diseñados para tu piel del día.',
            },
          ],
        },
        {
          title: 'Aparato Zemits VERSTAND HD',
          description:
            'Tratamientos faciales avanzados con el aparato Zemits VERSTAND HD.',
          treatments: [
            { title: 'Facial HydroDiamond — Sesión Individual', price: '$175' },
            {
              title: 'Facial HydroDiamond con Infusión de Sérum y Tonificación Fría',
              price: '$220',
            },
            { title: 'Facial VERSTAND HD Completo — Sesión Individual', price: '$250–300' },
            {
              title: 'Facial VERSTAND HD Completo — Paquete 4 Sesiones',
              price: '$220–280',
              note: 'Por sesión.',
            },
            {
              title: 'Facial VERSTAND HD Completo — Paquete 8 Sesiones',
              price: '$200–260',
              note: 'Por sesión.',
            },
            {
              title: 'Lifting RF — Reafirmación',
              price: '$110',
              description: 'Estimulación no invasiva de colágeno y elastina.',
            },
            { title: 'Tratamiento de Electroporación', price: '$80' },
            { title: 'Mesoterapia No Invasiva', price: '$110' },
            { title: 'Masaje Facial al Vacío', price: '$60' },
            { title: 'Crioterapia', price: '$60' },
          ],
        },
        {
          title: 'Técnicas de Aparatología Adicionales',
          treatments: [
            { title: 'Terapia Darsonval', price: '$60' },
            { title: 'Terapia de Microcorrientes', price: '$80' },
            { title: 'Terapia LED', price: '$35–75' },
            { title: 'Microagujas', price: '$110–250' },
          ],
        },
      ] as ServiceCategory[],
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
