'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface CreditPackage {
  id: string;
  name: string;
  points: number;
  price: number;
  popular?: boolean;
  savings?: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  points: number;
}

export default function CreditsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string>('popular');
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');
  const [isLoading, setIsLoading] = useState(false);
  const [billingDetails, setBillingDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
    },
  });
  const router = useRouter();

  const creditPackages: CreditPackage[] = [
    { id: 'starter', name: 'Starter', points: 50, price: 4.99 },
    { id: 'basic', name: 'Basic', points: 100, price: 8.99 },
    { id: 'popular', name: 'Popular', points: 250, price: 19.99, popular: true, savings: 20 },
    { id: 'premium', name: 'Premium', points: 500, price: 34.99, savings: 30 },
    { id: 'ultimate', name: 'Ultimate', points: 1000, price: 59.99, savings: 40 },
  ];

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setBillingDetails(prev => ({
            ...prev,
            firstName: data.user.name.split(' ')[0] || '',
            lastName: data.user.name.split(' ').slice(1).join(' ') || '',
            email: data.user.email,
          }));
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const handlePurchase = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: selectedPackage,
          paymentMethod,
          billingDetails,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update user points
        setUser(prev => prev ? { ...prev, points: data.user.points } : null);
        
        // Show success message
        alert('Payment successful! Your credits have been added to your account.');
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        alert(data.error || 'Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPackageData = creditPackages.find(pkg => pkg.id === selectedPackage);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Buy Credits
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Purchase credits to swap items and participate in the ReWear community
          </p>
          
          {/* Current Balance */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 inline-block bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">💰</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Balance</p>
                <p className="text-2xl font-bold text-gray-900">{user.points} points</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Credit Packages */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose a Package</h2>
            
            <div className="grid gap-4">
              {creditPackages.map((pkg, index) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                    selectedPackage === pkg.id
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                  }`}
                  onClick={() => setSelectedPackage(pkg.id)}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
                      <p className="text-gray-600">{pkg.points} points</p>
                      {pkg.savings && (
                        <p className="text-green-600 text-sm font-medium">
                          Save {pkg.savings}%
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">${pkg.price}</p>
                      <p className="text-sm text-gray-500">
                        ${(pkg.price / pkg.points * 100).toFixed(2)} per 100 points
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Payment Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Details</h2>
            
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              {/* Payment Method */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'credit_card', label: 'Credit Card', icon: '💳' },
                    { id: 'debit_card', label: 'Debit Card', icon: '💳' },
                    { id: 'paypal', label: 'PayPal', icon: '🔗' },
                    { id: 'stripe', label: 'Stripe', icon: '💳' },
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        paymentMethod === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{method.icon}</span>
                        <span className="font-medium">{method.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Billing Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Billing Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={billingDetails.firstName}
                      onChange={(e) => setBillingDetails(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={billingDetails.lastName}
                      onChange={(e) => setBillingDetails(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={billingDetails.email}
                    onChange={(e) => setBillingDetails(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={billingDetails.phone}
                    onChange={(e) => setBillingDetails(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    value={billingDetails.address.line1}
                    onChange={(e) => setBillingDetails(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, line1: e.target.value }
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={billingDetails.address.city}
                      onChange={(e) => setBillingDetails(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, city: e.target.value }
                      }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={billingDetails.address.state}
                      onChange={(e) => setBillingDetails(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, state: e.target.value }
                      }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP
                    </label>
                    <input
                      type="text"
                      value={billingDetails.address.postalCode}
                      onChange={(e) => setBillingDetails(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, postalCode: e.target.value }
                      }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              {selectedPackageData && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 p-4 bg-gray-50 rounded-xl"
                >
                  <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{selectedPackageData.name} Package</span>
                      <span className="font-medium">{selectedPackageData.points} points</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total</span>
                      <span className="font-bold text-lg">${selectedPackageData.price}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Purchase Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePurchase}
                disabled={isLoading || !selectedPackageData}
                className={`w-full mt-6 py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 ${
                  isLoading || !selectedPackageData
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  `Purchase ${selectedPackageData?.points || 0} Points - $${selectedPackageData?.price || 0}`
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 