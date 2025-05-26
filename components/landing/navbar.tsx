import React, { useState } from 'react';
import { MailCheck, Sun, Moon, Menu, X } from 'lucide-react';
import Link from 'next/link';

const ModernNavbar = () => {
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleTheme = () => setIsDark(!isDark);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const themeClasses = {
    bg: isDark ? 'bg-gray-950/95' : 'bg-white/95',
    text: isDark ? 'text-gray-100' : 'text-gray-900',
    textMuted: isDark ? 'text-gray-400' : 'text-gray-600',
    border: isDark ? 'border-gray-800' : 'border-gray-200',
    hover: isDark ? 'hover:text-gray-100 hover:bg-gray-800/50' : 'hover:text-gray-900 hover:bg-gray-50',
    mobileMenu: isDark ? 'bg-gray-950/98' : 'bg-white/98',
    buttonHover: isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
  };

  const NavigationItems = ({ mobile = false }) => (
    <>
      <a 
        href="#features" 
        className={`${themeClasses.textMuted} ${themeClasses.hover} transition-all duration-200 text-sm font-medium ${mobile ? 'block px-3 py-2 rounded-md' : ''}`}
      >
        Features
      </a>
      <a 
        href="#pricing" 
        className={`${themeClasses.textMuted} ${themeClasses.hover} transition-all duration-200 text-sm font-medium ${mobile ? 'block px-3 py-2 rounded-md' : ''}`}
      >
        Pricing
      </a>
      <a 
        href="#examples" 
        className={`${themeClasses.textMuted} ${themeClasses.hover} transition-all duration-200 text-sm font-medium ${mobile ? 'block px-3 py-2 rounded-md' : ''}`}
      >
        Examples
      </a>
      <a 
        href="#testimonials" 
        className={`${themeClasses.textMuted} ${themeClasses.hover} transition-all duration-200 text-sm font-medium ${mobile ? 'block px-3 py-2 rounded-md' : ''}`}
      >
        Reviews
      </a>
    </>
  );

  return (
    <div className={`${isDark ? 'dark' : ''}`}>
      <nav className={`${themeClasses.bg} ${themeClasses.border} backdrop-blur-md sticky top-0 z-50 border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105">
                    <MailCheck className="w-5 h-5 text-white" />
                  </div>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  GetHired
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <NavigationItems />
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className={`${themeClasses.textMuted} ${themeClasses.buttonHover} p-2 rounded-lg transition-all duration-200`}
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              
              <Link
                href="/sign-in"
                className={`${themeClasses.textMuted} ${themeClasses.hover} px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200`}
              >
                Sign in
              </Link>
              
              <Link
                href="/sign-up"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className={`${themeClasses.textMuted} ${themeClasses.buttonHover} p-2 rounded-lg transition-all duration-200`}
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              
              <button
                onClick={toggleMobileMenu}
                className={`${themeClasses.text} ${themeClasses.buttonHover} p-2 rounded-lg transition-all duration-200`}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className={`md:hidden ${themeClasses.mobileMenu} ${themeClasses.border} backdrop-blur-md border-t`}>
            <div className="px-4 pt-2 pb-4 space-y-1">
              <NavigationItems mobile />
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <Link
                  href="/sign-in"
                  className={`${themeClasses.textMuted} ${themeClasses.hover} block px-3 py-2 rounded-md text-sm font-medium transition-all duration-200`}
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white block px-3 py-2 rounded-md text-sm font-semibold transition-all duration-200 shadow-md"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default ModernNavbar;