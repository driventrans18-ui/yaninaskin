'use client';
import React from 'react';
import Image from 'next/image';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { useScroll } from '@/components/ui/use-scroll';
import { useLanguage, type Lang } from '@/app/context/LanguageContext';
import { t } from '@/app/translations';

const LANGS: { code: Lang; label: string }[] = [
	{ code: 'en', label: 'EN' },
	{ code: 'uk', label: 'UA' },
	{ code: 'es', label: 'ES' },
];

export function Header() {
	const [open, setOpen] = React.useState(false);
	const scrolled = useScroll(10);
	const { lang, setLang } = useLanguage();
	const tr = t[lang].nav;

	const links = [
		{ label: tr.services, href: '#services' },
		{ label: tr.about,    href: '#about'    },
		{ label: tr.gallery,  href: '#gallery'  },
		{ label: tr.reviews,  href: '#reviews'  },
	];

	React.useEffect(() => {
		if (open) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	return (
		<header
			className={cn(
				'sticky top-0 z-50 mx-auto w-full max-w-5xl border-b border-transparent md:rounded-md md:border md:transition-all md:ease-out',
				{
					'bg-background/95 supports-[backdrop-filter]:bg-background/50 border-border backdrop-blur-lg md:top-4 md:max-w-4xl md:shadow':
						scrolled && !open,
					'bg-background/90': open,
				},
			)}
		>
			<nav
				className={cn(
					'flex h-14 w-full items-center justify-between px-4 md:h-12 md:transition-all md:ease-out',
					{
						'md:px-2': scrolled,
					},
				)}
			>
				<Image
					src="/images/logo main.png"
					alt="Logo"
					height={48}
					width={160}
					className="h-12 w-auto object-contain"
					priority
				/>
				<div className="hidden items-center gap-2 md:flex">
					{links.map((link, i) => (
						<a key={i} className={buttonVariants({ variant: 'ghost' })} href={link.href}>
							{link.label}
						</a>
					))}
					<a href="#book" className={buttonVariants({ variant: 'default' })}>
						{tr.bookNow}
					</a>
					{/* Language toggle */}
					<div className="ml-2 flex items-center rounded-full border border-border overflow-hidden">
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
				</div>
				<Button size="icon" variant="outline" onClick={() => setOpen(!open)} className="md:hidden">
					<MenuToggleIcon open={open} className="size-5" duration={300} />
				</Button>
			</nav>

			<div
				className={cn(
					'bg-background/90 fixed top-14 right-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden border-y md:hidden',
					open ? 'block' : 'hidden',
				)}
			>
				<div
					data-slot={open ? 'open' : 'closed'}
					className={cn(
						'data-[slot=open]:animate-in data-[slot=open]:zoom-in-95 data-[slot=closed]:animate-out data-[slot=closed]:zoom-out-95 ease-out',
						'flex h-full w-full flex-col justify-between gap-y-2 p-4',
					)}
				>
					<div className="grid gap-y-2">
						{links.map((link) => (
							<a
								key={link.label}
								className={buttonVariants({
									variant: 'ghost',
									className: 'justify-start',
								})}
								href={link.href}
							>
								{link.label}
							</a>
						))}
					</div>
					<div className="flex flex-col gap-2">
						{/* Language toggle mobile */}
						<div className="flex items-center justify-center gap-1 rounded-full border border-border p-1">
							{LANGS.map(({ code, label }) => (
								<button
									key={code}
									onClick={() => setLang(code)}
									className={cn(
										'flex-1 rounded-full py-1.5 text-xs font-medium transition-colors',
										lang === code
											? 'bg-foreground text-background'
											: 'text-muted-foreground hover:text-foreground',
									)}
								>
									{label}
								</button>
							))}
						</div>
						<a href="#book" className={buttonVariants({ variant: 'default', className: 'w-full justify-center' })}>
							{tr.bookNow}
						</a>
					</div>
				</div>
			</div>
		</header>
	);
}
