import type { Lang } from './context/LanguageContext';

export type Treatment = {
  title: string;
  price: string;
  duration?: string;
  description?: string;
  note?: string;
  imageBefore?: string;
  imageAfter?: string;
  imageBeforePos?: string;
  imageAfterPos?: string;
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
      contact: 'Contact',
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
      brandsCta: 'Brands I work with',
      brandsTitle: 'Brands I work with',
      brandsClose: 'Close',
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
      name: 'Yanina Menaker',
      bio1: 'With over 5 years of experience and 1000+ satisfied clients, I bring a results-driven, clinical approach to modern aesthetics.',
      bio2: 'I am a New York State licensed esthetician with a medical background from Ukraine, which allows me to understand the skin far beyond surface-level treatments.',
      bio3: "I don't believe in one-size-fits-all facials. Every protocol is carefully designed based on your skin condition, concerns, and long-term goals.",
      badges: ['Licensed Esthetician', 'Rochester, NY', 'Skin Specialist'],
    },

    // Gallery
    gallery: {
      eyebrow: 'Results & Space',
      heading: 'The Experience',
      body: 'A glimpse into the treatments, the results, and the space where it all happens.',
      photoLabel: 'Photo',
      instagramCta: 'View more on Instagram',
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
          text: 'My skin has never looked better. Yanina really listened to my concerns and created a treatment plan that actually worked. I saw results after just two sessions.',
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
      subheading: "Had a visit with Yanina? We'd love to hear about your experience.",
      formTitle: 'Share Your Experience',
      formSubtitle: 'Your review helps others discover Yanina Menaker.',
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

    // Contact
    contact: {
      eyebrow: 'Find Me',
      heading: 'Get In Touch',
      addressLabel: 'Location',
      phoneLabel: 'Phone',
      emailLabel: 'Email',
      addressDefault: 'Rochester, NY',
    },

    // Policies
    policies: {
      eyebrow: 'Before You Come In',
      heading: 'Good to Know',
      sections: [
        {
          heading: 'Studio Policies',
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
        {
          heading: 'FAQ',
          items: [
            {
              title: 'What should I expect at my first appointment?',
              body: 'We start with a thorough skin consultation so I can understand your concerns, skin history, and goals. From there I design a personalized treatment — no two protocols are the same. Plan for about 60–90 minutes for your first visit.',
            },
            {
              title: 'How often should I get a facial?',
              body: 'For most skin types, every 4–6 weeks is ideal — this aligns with your skin\'s natural cell turnover cycle. If you\'re targeting a specific concern like acne or hyperpigmentation, a closer series of treatments may be recommended.',
            },
            {
              title: 'Can I wear makeup after my appointment?',
              body: 'I recommend skipping makeup for at least 12–24 hours post-treatment to let your skin breathe and fully absorb the products. After resurfacing treatments like peels or microneedling, wait 24–48 hours.',
            },
            {
              title: 'How long until I see results?',
              body: 'Many clients notice an immediate glow after their first session. For deeper concerns — texture, pigmentation, fine lines — the best results come after a series of treatments (typically 4–6 sessions).',
            },
            {
              title: 'Are the treatments painful?',
              body: 'Most treatments are comfortable and relaxing. Some procedures like microneedling or certain peels may cause mild tingling or sensitivity, but nothing that should cause significant discomfort. I always check in with you throughout.',
            },
          ],
        },
      ],
    },

    // Footer
    footer: {
      tagline: 'Luxury skincare in Rochester, NY.\nPersonalised treatments for your best skin.',
      quickLinks: 'Quick Links',
      followAlong: 'Follow Along',
      copyright: '© 2026 Yanina Menaker · Rochester, NY · All rights reserved',
      links: [
        ['Services', '#services'],
        ['About', '#about'],
        ['Reviews', '#reviews'],
        ['Contact', '#contact'],
        ['Book Now', '#book'],
        ['Good to Know', '#policies'],
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
      contact: 'Контакти',
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
      brandsCta: 'Бренди, з якими я працюю',
      brandsTitle: 'Бренди, з якими я працюю',
      brandsClose: 'Закрити',
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
      name: 'Яніна Менакер',
      bio1: 'Маючи понад 5 років досвіду та 1000+ задоволених клієнтів, я привношу результативний, клінічний підхід до сучасної естетичної косметології.',
      bio2: 'Я ліцензований естетист штату Нью-Йорк із медичною освітою, здобутою в Україні, що дозволяє мені розуміти шкіру набагато глибше за поверхневі процедури.',
      bio3: 'Я не вірю в універсальні догляди. Кожен протокол ретельно розроблений з урахуванням стану вашої шкіри, ваших проблем і довгострокових цілей.',
      badges: ['Ліцензований естетист', 'Рочестер, Нью-Йорк', 'Спеціаліст зі шкіри'],
    },

    gallery: {
      eyebrow: 'Результати та простір',
      heading: 'Досвід',
      body: 'Погляд на процедури, результати та простір, де все це відбувається.',
      photoLabel: 'Фото',
      instagramCta: 'Більше в Instagram',
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
          text: 'Моя шкіра ніколи не виглядала краще. Яніна справді прислухалася до моїх проблем і склала план лікування, який справді спрацював. Я побачила результати вже після двох сеансів.',
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
      subheading: 'Були у Яніни? Ми раді почути про ваш досвід.',
      formTitle: 'Поділіться своїм досвідом',
      formSubtitle: 'Ваш відгук допомагає іншим дізнатися про Яніну Менакер.',
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

    contact: {
      eyebrow: 'Знайдіть мене',
      heading: 'Зв\'яжіться зі мною',
      addressLabel: 'Адреса',
      phoneLabel: 'Телефон',
      emailLabel: 'Email',
      addressDefault: 'Рочестер, Нью-Йорк',
    },

    policies: {
      eyebrow: 'Перед відвідуванням',
      heading: 'Корисно знати',
      sections: [
        {
          heading: 'Правила студії',
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
        {
          heading: 'FAQ',
          items: [
            {
              title: 'Чого очікувати на першому прийомі?',
              body: 'Починаємо з детальної консультації, щоб зрозуміти ваші потреби та стан шкіри. Далі складаємо персоналізований протокол. Перший візит займає близько 60–90 хвилин.',
            },
            {
              title: 'Як часто потрібно робити процедури?',
              body: 'Для більшості типів шкіри оптимально — раз на 4–6 тижнів. При роботі з акне, пігментацією або іншими проблемами може бути рекомендовано більш інтенсивний курс.',
            },
            {
              title: 'Чи можна наносити макіяж після процедури?',
              body: 'Рекомендую утриматись від макіяжу щонайменше 12–24 години після процедури. Після пілінгів або мікронідлінгу — 24–48 годин.',
            },
            {
              title: 'Коли з\'являться результати?',
              body: 'Більшість клієнтів помічають сяяння вже після першого сеансу. Для глибших змін — текстури, пігментації, зморщок — потрібен курс із 4–6 процедур.',
            },
            {
              title: 'Чи болісні процедури?',
              body: 'Більшість процедур комфортні та розслаблюючі. Деякі, як мікронідлінг або певні пілінги, можуть давати легке поколювання. Я завжди слідкую за вашим самопочуттям.',
            },
          ],
        },
      ],
    },

    footer: {
      tagline: 'Преміальний догляд за шкірою в Рочестері, Нью-Йорк.\nПерсоналізовані процедури для вашої найкращої шкіри.',
      quickLinks: 'Швидкі посилання',
      followAlong: 'Стежте за нами',
      copyright: '© 2026 Яніна Менакер · Рочестер, Нью-Йорк · Всі права захищені',
      links: [
        ['Послуги', '#services'],
        ['Про мене', '#about'],
        ['Відгуки', '#reviews'],
        ['Контакти', '#contact'],
        ['Записатися', '#book'],
        ['Корисно знати', '#policies'],
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
      contact: 'Contacto',
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
      brandsCta: 'Marcas con las que trabajo',
      brandsTitle: 'Marcas con las que trabajo',
      brandsClose: 'Cerrar',
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
      name: 'Yanina Menaker',
      bio1: 'Con más de 5 años de experiencia y más de 1000 clientas satisfechas, aporto un enfoque clínico y orientado a resultados a la estética moderna.',
      bio2: 'Soy esteticista licenciada por el Estado de Nueva York, con formación médica en Ucrania, lo que me permite entender la piel mucho más allá de los tratamientos superficiales.',
      bio3: 'No creo en los faciales de talla única. Cada protocolo se diseña cuidadosamente según el estado de tu piel, tus preocupaciones y tus objetivos a largo plazo.',
      badges: ['Esteticista Certificada', 'Rochester, NY', 'Especialista en Piel'],
    },

    gallery: {
      eyebrow: 'Resultados y Espacio',
      heading: 'La Experiencia',
      body: 'Un vistazo a los tratamientos, los resultados y el espacio donde todo sucede.',
      photoLabel: 'Foto',
      instagramCta: 'Ver más en Instagram',
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
          text: 'Mi piel nunca ha lucido mejor. Yanina escuchó mis preocupaciones y creó un plan de tratamiento que realmente funcionó. Vi resultados después de solo dos sesiones.',
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
      subheading: '¿Visitaste a Yanina? Nos encantaría escuchar tu experiencia.',
      formTitle: 'Comparte tu Experiencia',
      formSubtitle: 'Tu reseña ayuda a otras personas a descubrir a Yanina Menaker.',
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

    contact: {
      eyebrow: 'Encuéntrame',
      heading: 'Contáctame',
      addressLabel: 'Ubicación',
      phoneLabel: 'Teléfono',
      emailLabel: 'Email',
      addressDefault: 'Rochester, NY',
    },

    policies: {
      eyebrow: 'Antes de Venir',
      heading: 'Bueno Saberlo',
      sections: [
        {
          heading: 'Políticas del Estudio',
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
        {
          heading: 'Preguntas Frecuentes',
          items: [
            {
              title: '¿Qué debo esperar en mi primera cita?',
              body: 'Comenzamos con una consulta detallada para entender tus necesidades, historial de piel y objetivos. Luego diseño un tratamiento personalizado. Reserva entre 60 y 90 minutos para tu primera visita.',
            },
            {
              title: '¿Con qué frecuencia debo hacerme un facial?',
              body: 'Para la mayoría de los tipos de piel, cada 4–6 semanas es ideal. Si estás tratando una preocupación específica como acné o hiperpigmentación, puede recomendarse una serie más cercana de tratamientos.',
            },
            {
              title: '¿Puedo usar maquillaje después del tratamiento?',
              body: 'Recomiendo evitar el maquillaje durante al menos 12–24 horas después del tratamiento. Después de peelings o microagujas, espera 24–48 horas.',
            },
            {
              title: '¿Cuándo veré resultados?',
              body: 'Muchas clientas notan un brillo inmediato después de la primera sesión. Para preocupaciones más profundas — textura, pigmentación, líneas — los mejores resultados llegan tras una serie de 4–6 sesiones.',
            },
            {
              title: '¿Son dolorosos los tratamientos?',
              body: 'La mayoría de los tratamientos son cómodos y relajantes. Algunos como las microagujas o ciertos peelings pueden causar un leve hormigueo. Siempre estoy pendiente de tu bienestar durante la sesión.',
            },
          ],
        },
      ],
    },

    footer: {
      tagline: 'Cuidado de piel de lujo en Rochester, NY.\nTratamientos personalizados para tu mejor piel.',
      quickLinks: 'Enlaces Rápidos',
      followAlong: 'Síguenos',
      copyright: '© 2026 Yanina Menaker · Rochester, NY · Todos los derechos reservados',
      links: [
        ['Servicios', '#services'],
        ['Sobre mí', '#about'],
        ['Reseñas', '#reviews'],
        ['Contacto', '#contact'],
        ['Reservar', '#book'],
        ['Bueno Saberlo', '#policies'],
      ] as [string, string][],
    },
  },
} satisfies Record<Lang, object>;

export function useT(lang: Lang) {
  return t[lang];
}
