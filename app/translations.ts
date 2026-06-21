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
      brandsMore: '…and more',
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
      before: 'Before',
      after: 'After',
      enlarge: 'Enlarge',
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

    // Booking popup (opens the visitor's text-message app pre-filled)
    booking: {
      title: 'Book an Appointment',
      subtitle: 'Pick a treatment (or choose “Something else”), add your name, then send by text or DM on Instagram — whichever you prefer.',
      nameLabel: 'Your name',
      namePlaceholder: 'Jane Doe',
      serviceLabel: 'Treatment',
      servicePlaceholder: 'Select a treatment…',
      otherOption: 'Something else / not sure',
      detailsLabel: 'Details (optional)',
      detailsPlaceholder: 'Anything else you’d like us to know',
      detailsLabelOther: 'What would you like?',
      detailsPlaceholderOther: 'Tell us what you’re looking for',
      dateLabel: 'Preferred date',
      timeLabel: 'Preferred time',
      timePlaceholder: 'Select a time…',
      weekendClosed: 'Weekends are closed — please pick a weekday.',
      preferredPrefix: 'Preferred',
      atWord: 'at',
      disclaimer: 'This is a request — your appointment isn’t confirmed until Yanina texts you back to confirm the date and time.',
      send: 'Send Text',
      sendInstagram: 'DM on Instagram',
      instagramNotice: 'We copied your message — just paste it into the Instagram chat that opened and hit send.',
      cancel: 'Cancel',
      nameRequired: 'Please enter your name.',
      serviceRequired: 'Please select a treatment or choose “Something else”.',
      detailsRequired: 'Please tell us what you’d like to book.',
      noPhone: 'Online booking isn’t available right now. Please use the contact form below.',
      // {name} and {request} are replaced with what the visitor typed
      messageTemplate: 'Hi, I’m {name}. I’d like to request an appointment: {request}',
    },

    // Contact
    contact: {
      eyebrow: 'Find Me',
      heading: 'Get In Touch',
      addressLabel: 'Location',
      phoneLabel: 'Phone',
      emailLabel: 'Email',
      addressDefault: 'Rochester, NY',
      form: {
        title: 'Send a Message',
        namePlaceholder: 'Your Name',
        phonePlaceholder: 'Your Phone',
        emailPlaceholder: 'Your Email',
        messagePlaceholder: 'What would you like to know?',
        submit: 'Send Message',
        submitting: 'Sending…',
        thankYou: 'Message sent! I\'ll be in touch soon ✦',
        errorMsg: 'Something went wrong. Please try again.',
        nameRequired: 'Name is required',
        phoneRequired: 'Phone is required',
        emailRequired: 'Email is required',
        emailInvalid: 'Please enter a valid email',
        messageRequired: 'Message is required',
      },
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
      privacyLink: 'Privacy Policy',
      termsLink: 'Terms of Service',
      links: [
        ['Services', '#services'],
        ['About', '#about'],
        ['Reviews', '#reviews'],
        ['Contact', '#contact'],
        ['Book Now', '#book'],
        ['Good to Know', '#policies'],
      ] as [string, string][],
    },

    legal: {
      backHome: '← Back to Home',
      privacy: {
        title: 'Privacy Policy',
        effectiveDate: 'Effective Date: May 20, 2026',
        sections: [
          {
            heading: 'Introduction',
            body: 'This Privacy Policy explains how Yanina Menaker ("we," "us," "our") collects, uses, and protects your personal information when you visit skinbeautybyyaninaomenaker.com. By using this website you agree to the practices described here.',
          },
          {
            heading: 'Information We Collect',
            body: 'We only collect information you voluntarily provide. When you submit a review through our website form, we collect your name and the text of your review. We do not collect email addresses, phone numbers, payment information, or any other personal data from public visitors.',
          },
          {
            heading: 'How We Use Your Information',
            body: 'Your name and review text are used solely to display approved client testimonials on this website and to allow our team to moderate and respond to submissions. We do not use your information for marketing, advertising, or any other commercial purpose.',
          },
          {
            heading: 'Third-Party Services',
            body: 'We use Supabase (supabase.com) to store review data and website content in a secure database hosted in the United States. We use Google Fonts to load typography for this site — Google may log font requests, but no personal information from this website is transmitted. Neither service is used to track or profile visitors.',
          },
          {
            heading: 'Cookies & Local Storage',
            body: 'This website does not use tracking cookies, advertising cookies, or analytics cookies. The site uses browser localStorage solely to remember language preferences within the admin interface. No personal data is stored in cookies or local storage for public visitors.',
          },
          {
            heading: 'Data Retention & Your Rights',
            body: 'Review submissions are retained for as long as the website is active. If you submitted a review and would like it removed, or if you wish to access, correct, or delete any personal data we hold about you, please contact us at the email below. We will respond within 30 days. If you are located in the European Economic Area, you have additional rights under GDPR, including the right to lodge a complaint with your local supervisory authority.',
          },
          {
            heading: "Children's Privacy",
            body: 'This website is not directed to children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has submitted personal data to this site, please contact us and we will promptly delete it.',
          },
          {
            heading: 'Changes to This Policy',
            body: 'We may update this Privacy Policy from time to time. Changes will be posted on this page with a revised effective date. Continued use of the website after any update constitutes acceptance of the revised policy.',
          },
          {
            heading: 'Contact',
            body: 'For any privacy-related questions or data requests, please email us directly via the contact information on our website.',
          },
        ],
      },
      terms: {
        title: 'Terms of Service',
        effectiveDate: 'Effective Date: May 20, 2026',
        sections: [
          {
            heading: 'Acceptance of Terms',
            body: 'By accessing or using this website, you agree to be bound by these Terms of Service. If you do not agree, please do not use the site. We reserve the right to update these terms at any time; continued use of the site constitutes acceptance of any changes.',
          },
          {
            heading: 'Site Purpose',
            body: 'This website is operated by Yanina Menaker, a licensed esthetician in Rochester, NY. The site is provided for informational purposes — to showcase services, share client testimonials, and facilitate booking inquiries. Nothing on this site constitutes a binding service contract until confirmed directly with us.',
          },
          {
            heading: 'User-Submitted Content',
            body: 'When you submit a review, you grant us a non-exclusive, royalty-free license to display that review on this website. You represent that your submission is truthful, based on a genuine experience, and does not contain offensive, defamatory, or unlawful content. We reserve the right to moderate, edit, or remove any submission at our sole discretion.',
          },
          {
            heading: 'Medical & Aesthetic Disclaimer',
            body: 'All skincare services and information provided on this website are for aesthetic and cosmetic purposes only. They are NOT a substitute for professional medical advice, diagnosis, or treatment. Individual results vary and cannot be guaranteed. If you have a skin condition, allergy, or medical concern, please consult a licensed physician before undergoing any aesthetic treatment.',
          },
          {
            heading: 'Intellectual Property',
            body: 'All content on this website — including text, images, logos, and before/after photographs — is the property of Yanina Menaker or used with permission. Before/after photos are used with client consent. You may not reproduce, distribute, or use any content from this site without our prior written permission.',
          },
          {
            heading: 'Disclaimer of Warranties',
            body: 'This website is provided "as is" without warranties of any kind, express or implied. We do not warrant that the site will be uninterrupted, error-free, or free of viruses. We make no guarantees regarding the accuracy, completeness, or suitability of any information on the site.',
          },
          {
            heading: 'Limitation of Liability',
            body: 'To the fullest extent permitted by law, Yanina Menaker shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of this website or reliance on any information provided herein.',
          },
          {
            heading: 'Governing Law',
            body: 'These Terms of Service are governed by and construed in accordance with the laws of the State of New York, United States, without regard to its conflict of law provisions. Any disputes shall be resolved in the courts of Monroe County, New York.',
          },
          {
            heading: 'Contact',
            body: 'If you have any questions about these Terms of Service, please reach out via the contact information on our website.',
          },
        ],
      },
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
      brandsMore: '…та інші',
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
      before: 'До',
      after: 'Після',
      enlarge: 'Збільшити',
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

    // Booking popup (opens the visitor's text-message app pre-filled)
    booking: {
      title: 'Записатися на прийом',
      subtitle: 'Оберіть процедуру (або «Щось інше»), вкажіть ім’я — і надішліть SMS або напишіть у Direct в Instagram, як вам зручніше.',
      nameLabel: 'Ваше ім’я',
      namePlaceholder: 'Олена Коваленко',
      serviceLabel: 'Процедура',
      servicePlaceholder: 'Оберіть процедуру…',
      otherOption: 'Щось інше / не впевнена',
      detailsLabel: 'Деталі (необов’язково)',
      detailsPlaceholder: 'Що ще варто знати',
      detailsLabelOther: 'Що бажаєте?',
      detailsPlaceholderOther: 'Опишіть, що вас цікавить',
      dateLabel: 'Бажана дата',
      timeLabel: 'Бажаний час',
      timePlaceholder: 'Оберіть час…',
      weekendClosed: 'У вихідні зачинено — оберіть, будь ласка, будній день.',
      preferredPrefix: 'Бажано',
      atWord: 'о',
      disclaimer: 'Це запит — ваш запис не підтверджено, доки Яніна не напише вам, щоб підтвердити дату й час.',
      send: 'Надіслати',
      sendInstagram: 'Написати в Instagram',
      instagramNotice: 'Ми скопіювали ваше повідомлення — просто вставте його в чат Instagram, що відкрився, і надішліть.',
      cancel: 'Скасувати',
      nameRequired: 'Будь ласка, вкажіть своє ім’я.',
      serviceRequired: 'Будь ласка, оберіть процедуру або «Щось інше».',
      detailsRequired: 'Будь ласка, вкажіть, що ви хочете записатися.',
      noPhone: 'Онлайн-запис зараз недоступний. Скористайтеся формою нижче.',
      messageTemplate: 'Вітаю, мене звати {name}. Хочу записатися: {request}',
    },

    contact: {
      eyebrow: 'Знайдіть мене',
      heading: 'Зв\'яжіться зі мною',
      addressLabel: 'Адреса',
      phoneLabel: 'Телефон',
      emailLabel: 'Email',
      addressDefault: 'Рочестер, Нью-Йорк',
      form: {
        title: 'Написати повідомлення',
        namePlaceholder: 'Ваше ім\'я',
        phonePlaceholder: 'Ваш телефон',
        emailPlaceholder: 'Ваш email',
        messagePlaceholder: 'Що вас цікавить?',
        submit: 'Надіслати',
        submitting: 'Надсилання…',
        thankYou: 'Повідомлення надіслано! Зв\'яжуся з вами найближчим часом ✦',
        errorMsg: 'Щось пішло не так. Спробуйте ще раз.',
        nameRequired: 'Вкажіть ім\'я',
        phoneRequired: 'Вкажіть телефон',
        emailRequired: 'Вкажіть email',
        emailInvalid: 'Введіть дійсний email',
        messageRequired: 'Напишіть повідомлення',
      },
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
      privacyLink: 'Політика конфіденційності',
      termsLink: 'Умови використання',
      links: [
        ['Послуги', '#services'],
        ['Про мене', '#about'],
        ['Відгуки', '#reviews'],
        ['Контакти', '#contact'],
        ['Записатися', '#book'],
        ['Корисно знати', '#policies'],
      ] as [string, string][],
    },

    legal: {
      backHome: '← На головну',
      privacy: {
        title: 'Політика конфіденційності',
        effectiveDate: 'Дата набрання чинності: 20 травня 2026 р.',
        sections: [
          {
            heading: 'Вступ',
            body: 'Ця Політика конфіденційності пояснює, як Яніна Менакер ("ми", "нас", "наш") збирає, використовує та захищає вашу особисту інформацію під час відвідування нашого сайту. Використовуючи цей сайт, ви погоджуєтеся з практиками, описаними тут.',
          },
          {
            heading: 'Яку інформацію ми збираємо',
            body: 'Ми збираємо лише ту інформацію, яку ви надаєте добровільно. Під час надсилання відгуку через форму на сайті ми отримуємо ваше ім\'я та текст відгуку. Ми не збираємо адреси електронної пошти, номери телефонів, платіжні дані або будь-яку іншу особисту інформацію від публічних відвідувачів.',
          },
          {
            heading: 'Як ми використовуємо вашу інформацію',
            body: 'Ваше ім\'я та текст відгуку використовуються виключно для відображення схвалених відгуків клієнтів на цьому сайті та для модерації. Ми не використовуємо вашу інформацію для маркетингу чи реклами.',
          },
          {
            heading: 'Сторонні сервіси',
            body: 'Ми використовуємо Supabase (supabase.com) для безпечного зберігання даних відгуків та контенту сайту на серверах у США. Ми використовуємо Google Fonts для завантаження шрифтів — Google може фіксувати запити шрифтів, але жодна особиста інформація не передається. Ці сервіси не використовуються для відстеження відвідувачів.',
          },
          {
            heading: 'Файли cookie та localStorage',
            body: 'Цей сайт не використовує файли cookie для відстеження, реклами або аналітики. localStorage браузера використовується виключно для запам\'ятовування мовних налаштувань в адміністративному інтерфейсі. Для публічних відвідувачів особисті дані в cookie або localStorage не зберігаються.',
          },
          {
            heading: 'Зберігання даних та ваші права',
            body: 'Відгуки зберігаються протягом усього часу роботи сайту. Якщо ви хочете видалити свій відгук або отримати, виправити чи видалити будь-які особисті дані, зв\'яжіться з нами за контактами, вказаними на сайті. Ми відповімо протягом 30 днів. Якщо ви знаходитесь у ЄЕА, ви маєте додаткові права відповідно до GDPR, включно з правом подати скаргу до наглядового органу.',
          },
          {
            heading: 'Конфіденційність дітей',
            body: 'Цей сайт не призначений для дітей віком до 13 років. Ми свідомо не збираємо особисту інформацію від дітей. Якщо ви вважаєте, що дитина надіслала особисті дані на цей сайт, зв\'яжіться з нами, і ми негайно їх видалимо.',
          },
          {
            heading: 'Зміни до цієї Політики',
            body: 'Ми можемо оновлювати цю Політику конфіденційності час від часу. Зміни будуть опубліковані на цій сторінці із зазначенням нової дати набрання чинності. Продовження використання сайту після будь-якого оновлення означає прийняття переглянутої політики.',
          },
          {
            heading: 'Контакти',
            body: 'З питань конфіденційності або запитами щодо даних, будь ласка, зв\'яжіться з нами через контактну інформацію на нашому сайті.',
          },
        ],
      },
      terms: {
        title: 'Умови використання',
        effectiveDate: 'Дата набрання чинності: 20 травня 2026 р.',
        sections: [
          {
            heading: 'Прийняття умов',
            body: 'Отримуючи доступ до цього сайту або використовуючи його, ви погоджуєтеся дотримуватись цих Умов використання. Якщо ви не згодні, будь ласка, не користуйтеся сайтом. Ми залишаємо за собою право оновлювати ці умови в будь-який час; продовження використання сайту означає прийняття будь-яких змін.',
          },
          {
            heading: 'Призначення сайту',
            body: 'Цей сайт належить Яніні Менакер — ліцензованому естетисту в Рочестері, Нью-Йорк. Сайт надається з інформаційною метою: для демонстрації послуг, відображення відгуків клієнтів та полегшення записів. Жодна інформація на цьому сайті не є обов\'язковим договором на надання послуг до безпосереднього підтвердження з нами.',
          },
          {
            heading: 'Контент від користувачів',
            body: 'Надсилаючи відгук, ви надаєте нам невиключну безоплатну ліцензію на його відображення на цьому сайті. Ви підтверджуєте, що ваш відгук є правдивим, ґрунтується на реальному досвіді та не містить образливого, наклепницького або незаконного контенту. Ми залишаємо за собою право модерувати, редагувати або видаляти будь-який контент на власний розсуд.',
          },
          {
            heading: 'Медична та естетична відмова від відповідальності',
            body: 'Усі косметичні послуги та інформація на цьому сайті призначені виключно для естетичних та косметичних цілей. Вони НЕ є замінником професійної медичної консультації, діагностики або лікування. Індивідуальні результати відрізняються і не можуть бути гарантовані. Якщо у вас є захворювання шкіри, алергія або медичні проблеми, будь ласка, проконсультуйтеся з ліцензованим лікарем перед будь-якою естетичною процедурою.',
          },
          {
            heading: 'Інтелектуальна власність',
            body: 'Весь контент сайту — тексти, зображення, логотипи та фотографії до/після — є власністю Яніни Менакер або використовується з дозволу. Фотографії до/після використовуються за згодою клієнтів. Відтворення, розповсюдження або використання будь-якого контенту без нашого письмового дозволу заборонено.',
          },
          {
            heading: 'Відмова від гарантій',
            body: 'Цей сайт надається "як є" без будь-яких гарантій. Ми не гарантуємо безперебійну або безпомилкову роботу сайту, а також точність, повноту або придатність будь-якої інформації, розміщеної на ньому.',
          },
          {
            heading: 'Обмеження відповідальності',
            body: 'У максимально дозволеному законом обсязі Яніна Менакер не несе відповідальності за будь-які непрямі, випадкові, спеціальні або непередбачені збитки, що виникли внаслідок використання цього сайту або довіри до будь-якої інформації на ньому.',
          },
          {
            heading: 'Застосовне право',
            body: 'Ці Умови використання регулюються законодавством штату Нью-Йорк, США. Будь-які спори вирішуватимуться в судах округу Монро, Нью-Йорк.',
          },
          {
            heading: 'Контакти',
            body: 'Якщо у вас є запитання щодо цих Умов використання, зв\'яжіться з нами через контактну інформацію на нашому сайті.',
          },
        ],
      },
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
      brandsMore: '…y más',
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
      before: 'Antes',
      after: 'Después',
      enlarge: 'Ampliar',
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

    // Booking popup (opens the visitor's text-message app pre-filled)
    booking: {
      title: 'Reservar una Cita',
      subtitle: 'Elige un tratamiento (o «Otra cosa»), pon tu nombre y envía por mensaje de texto o por DM en Instagram, lo que prefieras.',
      nameLabel: 'Tu nombre',
      namePlaceholder: 'María García',
      serviceLabel: 'Tratamiento',
      servicePlaceholder: 'Selecciona un tratamiento…',
      otherOption: 'Otra cosa / no estoy segura',
      detailsLabel: 'Detalles (opcional)',
      detailsPlaceholder: 'Cualquier cosa que debamos saber',
      detailsLabelOther: '¿Qué te gustaría?',
      detailsPlaceholderOther: 'Cuéntanos qué buscas',
      dateLabel: 'Fecha preferida',
      timeLabel: 'Hora preferida',
      timePlaceholder: 'Selecciona una hora…',
      weekendClosed: 'Los fines de semana está cerrado — elige un día entre semana.',
      preferredPrefix: 'Preferencia',
      atWord: 'a las',
      disclaimer: 'Esto es una solicitud — tu cita no está confirmada hasta que Yanina te escriba para confirmar la fecha y la hora.',
      send: 'Enviar Mensaje',
      sendInstagram: 'Enviar DM en Instagram',
      instagramNotice: 'Copiamos tu mensaje — solo pégalo en el chat de Instagram que se abrió y envíalo.',
      cancel: 'Cancelar',
      nameRequired: 'Por favor, introduce tu nombre.',
      serviceRequired: 'Por favor, selecciona un tratamiento o elige «Otra cosa».',
      detailsRequired: 'Por favor, dinos qué te gustaría reservar.',
      noPhone: 'La reserva en línea no está disponible ahora. Usa el formulario de contacto abajo.',
      messageTemplate: 'Hola, soy {name}. Me gustaría solicitar una cita: {request}',
    },

    contact: {
      eyebrow: 'Encuéntrame',
      heading: 'Contáctame',
      addressLabel: 'Ubicación',
      phoneLabel: 'Teléfono',
      emailLabel: 'Email',
      addressDefault: 'Rochester, NY',
      form: {
        title: 'Enviar un Mensaje',
        namePlaceholder: 'Tu Nombre',
        phonePlaceholder: 'Tu Teléfono',
        emailPlaceholder: 'Tu Email',
        messagePlaceholder: '¿En qué puedo ayudarte?',
        submit: 'Enviar Mensaje',
        submitting: 'Enviando…',
        thankYou: '¡Mensaje enviado! Me pondré en contacto contigo pronto ✦',
        errorMsg: 'Algo salió mal. Por favor inténtalo de nuevo.',
        nameRequired: 'El nombre es obligatorio',
        phoneRequired: 'El teléfono es obligatorio',
        emailRequired: 'El email es obligatorio',
        emailInvalid: 'Ingresa un email válido',
        messageRequired: 'El mensaje es obligatorio',
      },
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
      privacyLink: 'Política de Privacidad',
      termsLink: 'Términos de Servicio',
      links: [
        ['Servicios', '#services'],
        ['Sobre mí', '#about'],
        ['Reseñas', '#reviews'],
        ['Contacto', '#contact'],
        ['Reservar', '#book'],
        ['Bueno Saberlo', '#policies'],
      ] as [string, string][],
    },

    legal: {
      backHome: '← Volver al Inicio',
      privacy: {
        title: 'Política de Privacidad',
        effectiveDate: 'Fecha de vigencia: 20 de mayo de 2026',
        sections: [
          {
            heading: 'Introducción',
            body: 'Esta Política de Privacidad explica cómo Yanina Menaker ("nosotros", "nos", "nuestro") recopila, utiliza y protege tu información personal cuando visitas nuestro sitio web. Al usar este sitio, aceptas las prácticas descritas aquí.',
          },
          {
            heading: 'Información que Recopilamos',
            body: 'Solo recopilamos la información que proporcionas voluntariamente. Cuando envías una reseña a través del formulario del sitio web, recopilamos tu nombre y el texto de tu reseña. No recopilamos direcciones de correo electrónico, números de teléfono, información de pago ni ningún otro dato personal de los visitantes públicos.',
          },
          {
            heading: 'Cómo Usamos tu Información',
            body: 'Tu nombre y el texto de tu reseña se utilizan únicamente para mostrar testimonios aprobados de clientes en este sitio y para moderar las publicaciones. No utilizamos tu información para marketing, publicidad ni ningún otro fin comercial.',
          },
          {
            heading: 'Servicios de Terceros',
            body: 'Utilizamos Supabase (supabase.com) para almacenar datos de reseñas y contenido del sitio de forma segura en servidores ubicados en Estados Unidos. Utilizamos Google Fonts para cargar tipografía — Google puede registrar solicitudes de fuentes, pero no se transmite información personal. Ninguno de estos servicios se utiliza para rastrear visitantes.',
          },
          {
            heading: 'Cookies y Almacenamiento Local',
            body: 'Este sitio web no utiliza cookies de seguimiento, publicidad ni análisis. El almacenamiento local (localStorage) del navegador se usa únicamente para recordar preferencias de idioma en la interfaz administrativa. No se almacenan datos personales en cookies ni en localStorage para los visitantes públicos.',
          },
          {
            heading: 'Retención de Datos y tus Derechos',
            body: 'Las reseñas se conservan mientras el sitio esté activo. Si deseas eliminar tu reseña o acceder, corregir o suprimir cualquier dato personal que tengamos sobre ti, contáctanos a través de la información de contacto del sitio. Responderemos en un plazo de 30 días. Si te encuentras en el EEE, tienes derechos adicionales bajo el RGPD, incluido el derecho a presentar una reclamación ante tu autoridad supervisora local.',
          },
          {
            heading: 'Privacidad de Menores',
            body: 'Este sitio web no está dirigido a menores de 13 años. No recopilamos conscientemente información personal de niños. Si crees que un menor ha enviado datos personales a este sitio, contáctanos y los eliminaremos de inmediato.',
          },
          {
            heading: 'Cambios a esta Política',
            body: 'Podemos actualizar esta Política de Privacidad de vez en cuando. Los cambios se publicarán en esta página con una fecha de vigencia revisada. El uso continuado del sitio web después de cualquier actualización constituye la aceptación de la política revisada.',
          },
          {
            heading: 'Contacto',
            body: 'Para cualquier pregunta relacionada con la privacidad o solicitudes de datos, comunícate con nosotros a través de la información de contacto en nuestro sitio web.',
          },
        ],
      },
      terms: {
        title: 'Términos de Servicio',
        effectiveDate: 'Fecha de vigencia: 20 de mayo de 2026',
        sections: [
          {
            heading: 'Aceptación de los Términos',
            body: 'Al acceder o usar este sitio web, aceptas quedar sujeto a estos Términos de Servicio. Si no estás de acuerdo, por favor no uses el sitio. Nos reservamos el derecho de actualizar estos términos en cualquier momento; el uso continuado del sitio constituye la aceptación de cualquier cambio.',
          },
          {
            heading: 'Propósito del Sitio',
            body: 'Este sitio web es operado por Yanina Menaker, esteticista certificada en Rochester, NY. El sitio se proporciona con fines informativos — para presentar servicios, compartir testimonios de clientes y facilitar consultas de reserva. Nada en este sitio constituye un contrato vinculante de servicios hasta que se confirme directamente con nosotros.',
          },
          {
            heading: 'Contenido Enviado por Usuarios',
            body: 'Al enviar una reseña, nos otorgas una licencia no exclusiva y libre de regalías para mostrar esa reseña en este sitio web. Declaras que tu envío es verídico, basado en una experiencia genuina y no contiene contenido ofensivo, difamatorio o ilegal. Nos reservamos el derecho de moderar, editar o eliminar cualquier envío a nuestra entera discreción.',
          },
          {
            heading: 'Descargo de Responsabilidad Médica y Estética',
            body: 'Todos los servicios de cuidado de la piel e información proporcionados en este sitio son exclusivamente para fines estéticos y cosméticos. NO son un sustituto del consejo médico profesional, diagnóstico o tratamiento. Los resultados individuales varían y no pueden garantizarse. Si tienes una afección cutánea, alergia o preocupación médica, consulta a un médico autorizado antes de someterte a cualquier tratamiento estético.',
          },
          {
            heading: 'Propiedad Intelectual',
            body: 'Todo el contenido de este sitio web — incluidos textos, imágenes, logotipos y fotografías de antes/después — es propiedad de Yanina Menaker o se usa con permiso. Las fotos de antes/después se usan con el consentimiento de las clientas. No puedes reproducir, distribuir ni usar ningún contenido de este sitio sin nuestro permiso previo por escrito.',
          },
          {
            heading: 'Renuncia de Garantías',
            body: 'Este sitio web se proporciona "tal cual" sin garantías de ningún tipo. No garantizamos que el sitio sea ininterrumpido o libre de errores. No realizamos ninguna garantía sobre la exactitud, integridad o idoneidad de la información en el sitio.',
          },
          {
            heading: 'Limitación de Responsabilidad',
            body: 'En la máxima medida permitida por la ley, Yanina Menaker no será responsable de ningún daño indirecto, incidental, especial o consecuente que surja del uso de este sitio web o de la confianza en cualquier información proporcionada en él.',
          },
          {
            heading: 'Ley Aplicable',
            body: 'Estos Términos de Servicio se rigen por las leyes del Estado de Nueva York, Estados Unidos. Cualquier disputa se resolverá en los tribunales del Condado de Monroe, Nueva York.',
          },
          {
            heading: 'Contacto',
            body: 'Si tienes preguntas sobre estos Términos de Servicio, comunícate con nosotros a través de la información de contacto en nuestro sitio web.',
          },
        ],
      },
    },
  },
} satisfies Record<Lang, object>;

export function useT(lang: Lang) {
  return t[lang];
}
