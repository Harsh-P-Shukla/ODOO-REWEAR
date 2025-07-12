'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Navigation as SwiperNavigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import Navigation from '@/components/Navigation';

// Placeholder data
const featuredItems = [
  {
    id: '1',
    title: 'Vintage Denim Jacket',
    image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&h=400&fit=crop',
    points: 150,
    category: 'clothing',
    brand: 'Levi\'s',
    condition: 'vintage',
  },
  {
    id: '2',
    title: 'Leather Crossbody Bag',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop',
    points: 200,
    category: 'bags',
    brand: 'Coach',
    condition: 'gently_used',
  },
  {
    id: '3',
    title: 'Classic White Sneakers',
    image: 'https://images.unsplash.com/photo-1549298916-b41d114d2c9d?w=400&h=400&fit=crop',
    points: 180,
    category: 'shoes',
    brand: 'Nike',
    condition: 'like_new',
  },
  {
    id: '4',
    title: 'Silk Scarf Collection',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    points: 80,
    category: 'accessories',
    brand: 'Hermès',
    condition: 'new',
  },
];

const categories = [
  { id: 'clothing', name: 'Clothing', icon: '👕', color: 'from-blue-500 to-cyan-500', gradient: 'bg-gradient-to-r from-blue-500 to-cyan-500' },
  { id: 'accessories', name: 'Accessories', icon: '👜', color: 'from-purple-500 to-pink-500', gradient: 'bg-gradient-to-r from-purple-500 to-pink-500' },
  { id: 'shoes', name: 'Shoes', icon: '👟', color: 'from-green-500 to-emerald-500', gradient: 'bg-gradient-to-r from-green-500 to-emerald-500' },
  { id: 'bags', name: 'Bags', icon: '🛍️', color: 'from-pink-500 to-rose-500', gradient: 'bg-gradient-to-r from-pink-500 to-rose-500' },
  { id: 'jewelry', name: 'Jewelry', icon: '💍', color: 'from-yellow-500 to-orange-500', gradient: 'bg-gradient-to-r from-yellow-500 to-orange-500' },
];

const stats = [
  { number: '10K+', label: 'Items Swapped', icon: '🔄' },
  { number: '5K+', label: 'Happy Users', icon: '😊' },
  { number: '50K+', label: 'Points Exchanged', icon: '⭐' },
  { number: '100%', label: 'Sustainable', icon: '🌱' },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
          <div className="absolute inset-0 bg-black/20"></div>
          <motion.div
            className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center text-white"
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-8 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Sustainable Fashion
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Community Exchange
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Join thousands of fashion enthusiasts in the ultimate sustainable clothing exchange. 
              Swap, share, and discover amazing pieces while building a greener future.
            </motion.p>
            
            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="max-w-md mx-auto mb-12"
            >
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search for items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 pl-14 text-gray-900 rounded-2xl focus:outline-none focus:ring-4 focus:ring-yellow-300/50 bg-white/90 backdrop-blur-sm border-0 shadow-2xl transition-all duration-300 group-hover:bg-white group-hover:shadow-3xl"
                />
                <svg
                  className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </motion.div>
            
            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/browse"
                  className="inline-block bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-bold py-4 px-8 rounded-2xl hover:from-yellow-300 hover:to-orange-300 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
                >
                  Start Swapping
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/add-item"
                  className="inline-block bg-white/20 backdrop-blur-sm border-2 border-white text-white font-bold py-4 px-8 rounded-2xl hover:bg-white hover:text-gray-900 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  List an Item
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Items Carousel */}
      <section className="py-20 bg-gradient-to-br from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Items</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover amazing pieces from our community of fashion enthusiasts
            </p>
          </motion.div>
          
          <Swiper
            modules={[Pagination, Autoplay, SwiperNavigation]}
            spaceBetween={30}
            slidesPerView={1}
            pagination={{ clickable: true }}
            navigation={true}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
            }}
            className="featured-swiper"
          >
            {featuredItems.map((item, index) => (
              <SwiperSlide key={item.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="card p-6 h-full"
                >
                  <div className="aspect-square mb-6 overflow-hidden rounded-2xl">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{item.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-600 font-bold text-lg">{item.points} points</span>
                      <span className="badge badge-info">{item.category}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{item.brand}</span>
                      <span className="capitalize">{item.condition.replace('_', ' ')}</span>
                    </div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Browse Categories</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find exactly what you're looking for in our curated categories
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.05 }}
                className="group"
              >
                <Link href={`/browse?category=${category.id}`}>
                  <div className={`${category.gradient} p-8 rounded-3xl text-center text-white shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105`}>
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {category.icon}
                    </div>
                    <h3 className="font-bold text-lg">{category.name}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join our community in just a few simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'List Your Items', description: 'Upload photos and details of items you want to swap', icon: '📸' },
              { step: '2', title: 'Browse & Connect', description: 'Find items you love and send swap requests', icon: '🔍' },
              { step: '3', title: 'Swap & Share', description: 'Meet up or ship items and build connections', icon: '🤝' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
} 