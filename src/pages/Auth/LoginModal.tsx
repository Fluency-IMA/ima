import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, ShieldCheck, AlertTriangle, ArrowRight, User, Building } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => void;
  onAdminAccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin, onAdminAccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'partner'>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    companyName: '',
    userType: 'brand' as 'brand' | 'creator'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Admin backdoor detection
    if (formData.password === 'PLEASE') {
      setLoading(false);
      onAdminAccess();
      return;
    }

    // Simulate API call
    setTimeout(() => {
      if (formData.email.includes('@')) {
        onLogin(formData.email, formData.password);
      } else {
        setError('Invalid email address');
      }
      setLoading(false);
    }, 1500);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error on input
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="bg-white dark:bg-[#0F0F0F] p-0 rounded-2xl w-full max-w-md shadow-2xl border border-stone-200 dark:border-stone-800 relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center bg-stone-50 dark:bg-[#141414]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-fluency-neon rounded-full flex items-center justify-center text-black font-bold text-sm">F</div>
              <span className="font-bold text-black dark:text-white">FLUENCY</span>
            </div>
            <button onClick={onClose} className="text-stone-400 hover:text-black dark:hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-stone-200 dark:border-stone-800">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'login'
                  ? 'text-fluency-neon bg-stone-100 dark:bg-white/5 border-b-2 border-fluency-neon'
                  : 'text-stone-500 hover:text-black dark:hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab('partner')}
              className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'partner'
                  ? 'text-fluency-neon bg-stone-100 dark:bg-white/5 border-b-2 border-fluency-neon'
                  : 'text-stone-500 hover:text-black dark:hover:text-white'
              }`}
            >
              Partner Application
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded flex items-center gap-2 mb-4">
                <AlertTriangle size={14} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'partner' && (
                <>
                  {/* User Type Selection */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                      type="button"
                      onClick={() => handleInputChange('userType', 'brand')}
                      className={`p-3 rounded-lg border text-sm font-bold transition-all ${
                        formData.userType === 'brand'
                          ? 'border-fluency-neon bg-fluency-neon/10 text-black dark:text-white'
                          : 'border-stone-300 dark:border-stone-800 text-stone-500'
                      }`}
                    >
                      <Building size={16} className="mx-auto mb-1" />
                      Brand / Agency
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange('userType', 'creator')}
                      className={`p-3 rounded-lg border text-sm font-bold transition-all ${
                        formData.userType === 'creator'
                          ? 'border-fluency-neon bg-fluency-neon/10 text-black dark:text-white'
                          : 'border-stone-300 dark:border-stone-800 text-stone-500'
                      }`}
                    >
                      <User size={16} className="mx-auto mb-1" />
                      Creator / Talent
                    </button>
                  </div>

                  {/* Company Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                      {formData.userType === 'brand' ? 'Business Name' : 'Creator Handle'}
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      className="w-full px-4 py-3 bg-stone-50 dark:bg-black border border-stone-200 dark:border-stone-800 rounded-lg focus:border-fluency-neon outline-none text-black dark:text-white transition-colors"
                      placeholder={formData.userType === 'brand' ? 'e.g. Acme Corp' : '@username'}
                    />
                  </div>
                </>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-3.5 text-stone-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 dark:bg-black border border-stone-200 dark:border-stone-800 rounded-lg focus:border-fluency-neon outline-none text-black dark:text-white transition-colors"
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-3.5 text-stone-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 dark:bg-black border border-stone-200 dark:border-stone-800 rounded-lg focus:border-fluency-neon outline-none text-black dark:text-white transition-colors"
                    placeholder="•••••••"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-bold rounded-lg hover:bg-fluency-neon dark:hover:bg-fluency-neon hover:text-black dark:hover:text-black transition-all mt-4 flex justify-center items-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-fluency-neon border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {activeTab === 'login' ? 'Access Portal' : 'Submit Application'}
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </form>

            {/* Admin Hint */}
            {activeTab === 'login' && (
              <div className="mt-4 text-center">
                <p className="text-xs text-stone-500">
                  Admin access available
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-stone-100 dark:bg-stone-900 text-center">
            <p className="text-xs text-stone-500">Secured by Fluency Risk Engine™</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};