"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { Menu, X } from "lucide-react"

import { cn } from "@/lib/utils"

export interface NavbarMenuItem {
  label: string
  href: string
}

export interface Navbar1Props {
  logo?: React.ReactNode
  menuItems?: NavbarMenuItem[]
  ctaLabel?: string
  ctaHref?: string
  /** Extras rendered inline on desktop next to the CTA (e.g. language switcher). */
  desktopExtras?: React.ReactNode
  /** Extras rendered at the bottom of the mobile overlay (e.g. language switcher). */
  mobileExtras?: React.ReactNode
  className?: string
}

const Navbar1: React.FC<Navbar1Props> = ({
  logo,
  menuItems = [],
  ctaLabel,
  ctaHref = "#",
  desktopExtras,
  mobileExtras,
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(false)

  const toggleMenu = () => setIsOpen((v) => !v)
  const closeMenu = () => setIsOpen(false)

  // Lock scroll while mobile menu is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  return (
    <div className={cn("flex justify-center w-full py-6 px-4", className)}>
      <div className="flex items-center justify-between px-6 py-3 bg-background rounded-full shadow-lg w-full max-w-4xl relative z-10 border border-border">
        <div className="flex items-center">
          <motion.div
            className="flex items-center"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
          >
            {logo}
          </motion.div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {menuItems.map((item) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              <a
                href={item.href}
                className="text-sm text-foreground hover:text-accent transition-colors font-medium"
              >
                {item.label}
              </a>
            </motion.div>
          ))}
        </nav>

        {/* Desktop CTA + extras */}
        <div className="hidden md:flex items-center gap-3">
          {desktopExtras}
          {ctaLabel && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              <a
                href={ctaHref}
                className="inline-flex items-center justify-center px-5 py-2 text-sm text-background bg-foreground rounded-full hover:bg-foreground/85 transition-colors"
              >
                {ctaLabel}
              </a>
            </motion.div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          className="md:hidden flex items-center"
          onClick={toggleMenu}
          aria-label="Open menu"
          whileTap={{ scale: 0.9 }}
        >
          <Menu className="h-6 w-6 text-foreground" />
        </motion.button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-background z-50 pt-24 px-6 md:hidden"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <motion.button
              className="absolute top-6 right-6 p-2"
              onClick={closeMenu}
              aria-label="Close menu"
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <X className="h-6 w-6 text-foreground" />
            </motion.button>
            <div className="flex flex-col space-y-6">
              {menuItems.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.1 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <a
                    href={item.href}
                    className="text-base text-foreground font-medium"
                    onClick={closeMenu}
                  >
                    {item.label}
                  </a>
                </motion.div>
              ))}

              {ctaLabel && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="pt-6"
                >
                  <a
                    href={ctaHref}
                    onClick={closeMenu}
                    className="inline-flex items-center justify-center w-full px-5 py-3 text-base text-background bg-foreground rounded-full hover:bg-foreground/85 transition-colors"
                  >
                    {ctaLabel}
                  </a>
                </motion.div>
              )}

              {mobileExtras && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="pt-2 flex flex-col items-center gap-3"
                >
                  {mobileExtras}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { Navbar1 }
