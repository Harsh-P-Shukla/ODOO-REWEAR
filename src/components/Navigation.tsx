'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  role: string;
  avatar?: string;
}

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (response.ok) {
        setUser(null);
        setIsUserMenuOpen(false);
        // Dispatch logout event to clear cart
        window.dispatchEvent(new Event('user-logout'));
        router.push('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/browse', label: 'Browse' },
    { href: '/add-item', label: 'Add Item' },
  ];

  if (user) {
    navItems.push({ href: '/dashboard', label: 'Dashboard' });
  }

  // Add admin panel button to navbar
  navItems.push({ href: '/admin-login', label: 'Admin' });

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-lg border-b border-white/20' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center"
          >
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <span className={`font-bold text-xl ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
                ReWear
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 group ${
                    pathname === item.href
                      ? isScrolled 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-white bg-white/20'
                      : isScrolled 
                        ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50' 
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                  {pathname === item.href && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-20"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}

            {/* User Menu */}
            {!isLoading && (
              user ? (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="relative"
                >
                  <div className="flex items-center space-x-4">
                    {/* Points Display */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className={`px-4 py-2 rounded-xl font-medium ${
                        isScrolled 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-green-500/20 text-green-100'
                      }`}
                    >
                      <span className="flex items-center space-x-1">
                        <span className="text-sm">💰</span>
                        <span>{user.points} pts</span>
                      </span>
                    </motion.div>

                    {/* User Avatar & Menu */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className={`flex items-center space-x-2 p-2 rounded-xl transition-all duration-300 ${
                        isScrolled 
                          ? 'text-gray-700 hover:bg-gray-100' 
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {user.avatar || user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="hidden lg:block font-medium">{user.name}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </motion.button>

                    {/* User Dropdown Menu */}
                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                        >
                          <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                          <Link
                            href="/dashboard"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Dashboard
                          </Link>
                          <Link
                            href="/credits"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Buy Credits
                          </Link>
                          {user.role === 'admin' && (
                            <Link
                              href="/admin"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="block px-4 py-2 text-sm text-purple-700 hover:bg-purple-50"
                            >
                              Admin Panel
                            </Link>
                          )}
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Logout
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Link
                    href="/login"
                    className={`px-6 py-2 rounded-xl font-medium transition-all duration-300 ${
                      isScrolled 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    Login
                  </Link>
                </motion.div>
              )
            )}
          </div>

          {/* Mobile menu button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden p-2 rounded-xl transition-colors duration-300 ${
              isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
            }`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-2">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                        pathname === item.href
                          ? isScrolled 
                            ? 'text-blue-600 bg-blue-50' 
                            : 'text-white bg-white/20'
                          : isScrolled 
                            ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50' 
                            : 'text-white/90 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                
                {/* Mobile User Info */}
                {user && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    className="px-4 py-3 border-t border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.avatar || user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.points} points</p>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="text-red-600 hover:text-red-700"
                      >
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
} 