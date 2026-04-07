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
				'sticky top-0 z-50 w-full transition-all duration-[330ms]',
				scrolled && !open
					? 'bg-white/75 supports-[backdrop-filter]:backdrop-blur-lg'
					: 'bg-transparent',
			)}
		>
			<nav className="flex h-14 w-full items-center justify-between px-6 md:px-10">
				<Image
					src="/images/logo main.png"
					alt="Logo"
					height={40}
					width={140}
					className="h-10 w-auto object-contain"
					priority
				/>
				<div className="hidden items-center gap-1 md:flex">
					{links.map((link, i) => (
						<a
							key={i}
							className={cn(
								buttonVariants({ variant: 'ghost', size: 'sm' }),
								'text-[14px] font-medium text-[#171A20]',
							)}
							href={link.href}
						>
							{link.label}
						</a>
					))}
					<a
						href="#book"
						className={cn(
							buttonVariants({ variant: 'default', size: 'sm' }),
							'ml-2',
						)}
					>
						{tr.bookNow}
					</a>
					{/* Language toggle */}
					<div className="ml-3 flex items-center rounded-[4px] border border-border overflow-hidden">
						{LANGS.map(({ code, label }) => (
							<button
								key={code}
								onClick={() => setLang(code)}
								className={cn(
									'px-2.5 py-1 text-xs font-medium transition-colors duration-[330ms]',
									lang === code
										? 'bg-[#171A20] text-white'
										: 'text-[#5C5E62] hover:text-[#171A20]',
								)}
							>
								{label}
							</button>
						))}
					</div>
				</div>
				<Button size="icon" variant="outline" onClick={() => setOpen(!open)} className="md:hidden">
					<MenuToggleIcon open={open} className="size-5" duration={330} />
				</Button>
			</nav>

			<div
				className={cn(
					'bg-white fixed top-14 right-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden md:hidden',
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
									className: 'justify-start text-[14px] font-medium',
								})}
								href={link.href}
							>
								{link.label}
							</a>
						))}
					</div>
					<div className="flex flex-col gap-2">
						{/* Language toggle mobile */}
						<div className="flex items-center justify-center gap-1 rounded-[4px] border border-border p-1">
							{LANGS.map(({ code, label }) => (
								<button
									key={code}
									onClick={() => setLang(code)}
									className={cn(
										'flex-1 rounded-[4px] py-1.5 text-xs font-medium transition-colors duration-[330ms]',
										lang === code
											? 'bg-[#171A20] text-white'
											: 'text-[#5C5E62] hover:text-[#171A20]',
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
