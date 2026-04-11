'use client';

import React from 'react';
import Image from 'next/image';
import { Sparkles, User, Images, Star, Calendar } from 'lucide-react';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import {
	ScrollNavigationMenu,
	type ScrollNavMenuItem,
} from '@/components/ui/scroll-navigation-menu';
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

	const menuItems: ScrollNavMenuItem[] = [
		{ id: 'services', title: tr.services, url: '#services', icon: <Sparkles className="w-5 h-5" /> },
		{ id: 'about',    title: tr.about,    url: '#about',    icon: <User className="w-5 h-5" /> },
		{ id: 'gallery',  title: tr.gallery,  url: '#gallery',  icon: <Images className="w-5 h-5" /> },
		{ id: 'reviews',  title: tr.reviews,  url: '#reviews',  icon: <Star className="w-5 h-5" /> },
		{ id: 'book',     title: tr.bookNow,  url: '#book',     icon: <Calendar className="w-5 h-5" /> },
	];

	const logo = (
		<a href="#" aria-label="Home" className="inline-flex">
			<Image
				src="/images/newlogo.png"
				alt="Yanina Menaker"
				height={48}
				width={160}
				className="h-10 w-auto object-contain"
				priority
			/>
		</a>
	);

	const actions = (
		<>
			<LanguageSwitcher lang={lang} setLang={setLang} className="mr-1" />
			<a
				href="#book"
				className={buttonVariants({ variant: 'default', size: 'sm' })}
			>
				{tr.bookNow}
			</a>
		</>
	);

	const popupFooter = (
		<>
			<LanguageSwitcher
				lang={lang}
				setLang={setLang}
				className="self-center"
			/>
			<a
				href="#book"
				className={buttonVariants({
					variant: 'default',
					className: 'w-full justify-center',
				})}
			>
				{tr.bookNow}
			</a>
		</>
	);

	return (
		<ScrollNavigationMenu
			menuItems={menuItems}
			logo={logo}
			actions={actions}
			popupFooter={popupFooter}
		/>
	);
}
