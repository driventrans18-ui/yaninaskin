'use client';

import React from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';
import { Navbar1, type NavbarMenuItem } from '@/components/ui/navbar-1';
import { useLanguage, type Lang } from '@/app/context/LanguageContext';
import { t } from '@/app/translations';

const LANGS: { code: Lang; label: string }[] = [
	{ code: 'en', label: 'EN' },
	{ code: 'uk', label: 'UA' },
	{ code: 'es', label: 'ES' },
];

function LanguageSwitcher({
	lang,
	setLang,
	className,
}: {
	lang: Lang;
	setLang: (l: Lang) => void;
	className?: string;
}) {
	return (
		<div
			className={cn(
				'flex items-center rounded-full border border-border overflow-hidden',
				className,
			)}
		>
			{LANGS.map(({ code, label }) => (
				<button
					key={code}
					onClick={() => setLang(code)}
					className={cn(
						'px-2.5 py-1 text-xs font-medium transition-colors',
						lang === code
							? 'bg-foreground text-background'
							: 'text-muted-foreground hover:text-foreground',
					)}
				>
					{label}
				</button>
			))}
		</div>
	);
}

export function Header() {
	const { lang, setLang } = useLanguage();
	const tr = t[lang].nav;

	const menuItems: NavbarMenuItem[] = [
		{ label: tr.services, href: '#services' },
		{ label: tr.about,    href: '#about'    },
		{ label: tr.gallery,  href: '#gallery'  },
		{ label: tr.reviews,  href: '#reviews'  },
	];

	const logo = (
		<a href="#" aria-label="Home" className="inline-flex">
			<Image
				src="/images/skinbeautylogo.png"
				alt="Yanina Menaker"
				height={56}
				width={180}
				className="h-12 w-auto object-contain"
				priority
			/>
		</a>
	);

	return (
		<Navbar1
			logo={logo}
			menuItems={menuItems}
			ctaLabel={tr.bookNow}
			ctaHref="#book"
			desktopExtras={<LanguageSwitcher lang={lang} setLang={setLang} />}
			mobileExtras={<LanguageSwitcher lang={lang} setLang={setLang} />}
		/>
	);
}
