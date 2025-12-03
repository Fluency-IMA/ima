import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedHero } from '../components/EnhancedHero';
import { EnhancedROICalculator } from '../components/EnhancedROICalculator';
import { Testimonials } from '../components/Testimonials';
import { TrustedBy } from '../components/TrustedBy';
import { FeatureBlocks } from '../components/FeatureBlocks';
import { ComparisonTable } from '../components/ComparisonTable';
import { CreatorSpotlight } from '../components/CreatorSpotlight';

export default function HomePage() {
  const { user, loading: isLoading, loginWithGoogle } = useAuth();
  const [showCalculator, setShowCalculator] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Hero Section */}
      <EnhancedHero
        onROIClick={() => setShowCalculator(true)}
        onAuthClick={() => loginWithGoogle()}
      />

      {/* Trust Bar */}
      <TrustedBy />

      {/* Feature Blocks (Visual Breakdown) */}
      <FeatureBlocks />

      {/* Comparison Table */}
      <ComparisonTable />

      {/* Creator Spotlight */}
      <CreatorSpotlight />

      {/* Social Proof Section */}
      <Testimonials />

      {/* ROI Calculator Modal */}
      <AnimatePresence>
        {showCalculator && (
          <EnhancedROICalculator
            onClose={() => setShowCalculator(false)}
            onGetStarted={() => loginWithGoogle()}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="py-12 border-t border-stone-800 bg-[#0A0A0A]">
        <div className="container mx-auto px-4 text-center text-stone-500">
          <p>&copy; {new Date().getFullYear()} Fluency AIM Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}