/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Enhanced ROI Calculator with Industry Benchmarks
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, TrendingUp, Users, DollarSign, CheckCircle, AlertCircle, ArrowRight, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ROICalculatorProps {
  onClose: () => void;
  onGetStarted: () => void;
}

interface ROIData {
  monthlyBudget: string;
  industry: string;
  currentMethod: string;
  teamSize: string;
}

interface ROIResults {
  authenticReach: string;
  genuineEngagement: string;
  projectedSales: string;
  roi: number;
  savingsVsTraditional: string;
  paybackPeriod: string;
  aiInsights?: string;
  optimizations?: string[];
  recommendations?: string[];
  confidenceLevel?: string;
}

export const EnhancedROICalculator: React.FC<ROICalculatorProps> = ({ onClose, onGetStarted }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<ROIData>({
    monthlyBudget: '',
    industry: '',
    currentMethod: '',
    teamSize: ''
  });
  const [results, setResults] = useState<ROIResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const { isAdmin } = useAuth();

  const industries = [
    { value: 'ecommerce', label: 'E-commerce', avgROI: 320 },
    { value: 'saas', label: 'SaaS', avgROI: 380 },
    { value: 'cpg', label: 'CPG', avgROI: 290 },
    { value: 'fashion', label: 'Fashion & Beauty', avgROI: 410 },
    { value: 'tech', label: 'Technology', avgROI: 350 },
    { value: 'healthcare', label: 'Healthcare', avgROI: 270 },
    { value: 'finance', label: 'Finance', avgROI: 310 },
    { value: 'travel', label: 'Travel & Hospitality', avgROI: 330 }
  ];

  const currentMethods = [
    { value: 'paid-ads', label: 'Paid Social Ads', avgROI: 200 },
    { value: 'traditional-influencer', label: 'Traditional Influencer Marketing', avgROI: 180 },
    { value: 'content-marketing', label: 'Content Marketing', avgROI: 220 },
    { value: 'email-marketing', label: 'Email Marketing', avgROI: 240 },
    { value: 'seo', label: 'SEO/SEM', avgROI: 250 }
  ];

  const teamSizes = [
    { value: 'solo', label: 'Just Me', multiplier: 1.0 },
    { value: 'small', label: '2-5 People', multiplier: 1.2 },
    { value: 'medium', label: '6-20 People', multiplier: 1.5 },
    { value: 'large', label: '21+ People', multiplier: 2.0 }
  ];

  const calculateROI = async () => {
    setIsCalculating(true);

    try {
      const budget = parseFloat(data.monthlyBudget.replace(/[^0-9.]/g, '')) || 10000;
      const industryData = industries.find(i => i.value === data.industry) || industries[0];
      const teamData = teamSizes.find(t => t.value === data.teamSize) || teamSizes[0];

      // Prepare campaign parameters for AI prediction
      const campaignParams = {
        industry: data.industry,
        budget: budget,
        campaignType: 'sales_conversion' as const,
        duration: 30,
        creatorTier: teamData.value === 'solo' ? 'micro' as const :
          teamData.value === 'small' ? 'mid' as const :
            teamData.value === 'medium' ? 'macro' as const : 'mega' as const,
        totalCreators: teamData.value === 'solo' ? 3 :
          teamData.value === 'small' ? 8 :
            teamData.value === 'medium' ? 15 : 25,
        averageFollowers: 50000,
        averageEngagementRate: 4.5,
        platform: 'mixed' as const,
        targetAudience: {
          size: 100000,
          demographics: 'General consumer audience'
        }
      };

      // Call AI ROI prediction API
      // Call AI ROI prediction API only if admin
      let aiResult;
      if (isAdmin) {
        const response = await fetch('/api/ai/predict-roi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaignParameters: campaignParams })
        });

        if (response.ok) {
          aiResult = await response.json();
        }
      }

      if (aiResult && aiResult.success && aiResult.data) {
        const { projectedMetrics, predictedROI, breakdown, optimizations, recommendations, confidenceLevel } = aiResult.data;

        // Calculate savings
        const methodData = currentMethods.find(m => m.value === data.currentMethod) || currentMethods[0];
        const currentROI = methodData.avgROI;
        const savingsVsTraditional = Math.round(budget * 0.7);
        const paybackPeriod = Math.round(30 / (predictedROI / 100));

        setResults({
          authenticReach: projectedMetrics.reach.toLocaleString() + '+',
          genuineEngagement: projectedMetrics.engagement.toLocaleString() + '+',
          projectedSales: '$' + projectedMetrics.revenue.toLocaleString() + '+',
          roi: Math.round(predictedROI),
          savingsVsTraditional: '$' + savingsVsTraditional.toLocaleString(),
          paybackPeriod: paybackPeriod + ' days',
          aiInsights: `AI Confidence: ${confidenceLevel.toUpperCase()} (${aiResult.data.confidenceScore}%)`,
          optimizations: optimizations.slice(0, 3),
          recommendations: recommendations.slice(0, 3),
          confidenceLevel
        });
      } else {
        throw new Error('Invalid AI response');
      }

      setIsCalculating(false);
      setStep(3);
    } catch (error) {
      console.error('ROI calculation error:', error);
      // Fallback to basic calculation if AI fails
      const budget = parseFloat(data.monthlyBudget.replace(/[^0-9.]/g, '')) || 10000;
      const industryData = industries.find(i => i.value === data.industry) || industries[0];
      const teamData = teamSizes.find(t => t.value === data.teamSize) || teamSizes[0];
      const fluencyROI = industryData.avgROI * 2.2;

      const authenticReach = Math.round((budget * 15) * teamData.multiplier);
      const genuineEngagement = Math.round(authenticReach * 0.08);
      const projectedSales = Math.round((budget * fluencyROI) / 100);
      const savingsVsTraditional = Math.round(budget * 0.7);
      const paybackPeriod = Math.round(30 / (fluencyROI / 100));

      setResults({
        authenticReach: authenticReach.toLocaleString() + '+',
        genuineEngagement: genuineEngagement.toLocaleString() + '+',
        projectedSales: '$' + projectedSales.toLocaleString() + '+',
        roi: fluencyROI,
        savingsVsTraditional: '$' + savingsVsTraditional.toLocaleString(),
        paybackPeriod: paybackPeriod + ' days'
      });

      setIsCalculating(false);
      setStep(3);
    }
  };

  const updateData = (field: keyof ROIData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (step < 2) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return data.monthlyBudget && data.industry;
      case 2:
        return data.currentMethod && data.teamSize;
      default:
        return false;
    }
  };

  return (
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
        className="bg-white dark:bg-[#0F0F0F] rounded-2xl w-full max-w-2xl shadow-2xl border border-stone-200 dark:border-stone-800 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-stone-200 dark:border-stone-800">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-fluency-neon rounded-full flex items-center justify-center">
                <Calculator size={24} className="text-black" />
              </div>
              <div>
                <h3 className="font-sans font-bold text-2xl text-black dark:text-white">
                  ROI Calculator
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  See your potential with verified influencer marketing
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-stone-400 hover:text-black dark:hover:text-white">
              ×
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className={`flex-1 h-2 rounded-full transition-colors ${s <= step ? 'bg-fluency-neon' : 'bg-stone-200 dark:bg-stone-800'
                  }`} />
                {s < 3 && (
                  <div className={`w-2 h-2 rounded-full transition-colors ${s < step ? 'bg-fluency-neon' : 'bg-stone-200 dark:bg-stone-800'
                    }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Budget & Industry */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-bold text-black dark:text-white mb-2">
                    Monthly Campaign Budget
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-500">$</span>
                    <input
                      type="text"
                      value={data.monthlyBudget}
                      onChange={(e) => updateData('monthlyBudget', e.target.value)}
                      placeholder="10,000"
                      className="w-full pl-8 pr-4 py-3 bg-stone-50 dark:bg-black border border-stone-200 dark:border-stone-800 rounded-lg focus:border-fluency-neon outline-none text-black dark:text-white"
                    />
                  </div>
                  <p className="text-xs text-stone-500 mt-1">Enter your monthly influencer marketing budget</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-black dark:text-white mb-2">
                    Industry
                  </label>
                  <select
                    value={data.industry}
                    onChange={(e) => updateData('industry', e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 dark:bg-black border border-stone-200 dark:border-stone-800 rounded-lg focus:border-fluency-neon outline-none text-black dark:text-white"
                  >
                    <option value="">Select your industry</option>
                    {industries.map(industry => (
                      <option key={industry.value} value={industry.value}>
                        {industry.label} (Avg ROI: {industry.avgROI}%)
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-stone-500 mt-1">Industry affects typical ROI performance</p>
                </div>

                {/* Industry Insights */}
                {data.industry && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-2">
                      <TrendingUp size={16} />
                      <span className="font-medium text-sm">Industry Insight</span>
                    </div>
                    <p className="text-sm text-blue-600 dark:text-blue-300">
                      {industries.find(i => i.value === data.industry)?.label} brands typically see{' '}
                      {industries.find(i => i.value === data.industry)?.avgROI}% ROI with traditional methods.
                      With Fluency's verified creators, you could see up to{' '}
                      {Math.round((industries.find(i => i.value === data.industry)?.avgROI || 0) * 2.2)}% ROI.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Step 2: Current Method & Team */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-bold text-black dark:text-white mb-2">
                    Current Marketing Method
                  </label>
                  <select
                    value={data.currentMethod}
                    onChange={(e) => updateData('currentMethod', e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 dark:bg-black border border-stone-200 dark:border-stone-800 rounded-lg focus:border-fluency-neon outline-none text-black dark:text-white"
                  >
                    <option value="">Select your current method</option>
                    {currentMethods.map(method => (
                      <option key={method.value} value={method.value}>
                        {method.label} (Avg ROI: {method.avgROI}%)
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-stone-500 mt-1">What are you currently using for customer acquisition?</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-black dark:text-white mb-2">
                    Team Size
                  </label>
                  <select
                    value={data.teamSize}
                    onChange={(e) => updateData('teamSize', e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 dark:bg-black border border-stone-200 dark:border-stone-800 rounded-lg focus:border-fluency-neon outline-none text-black dark:text-white"
                  >
                    <option value="">Select your team size</option>
                    {teamSizes.map(size => (
                      <option key={size.value} value={size.value}>
                        {size.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-stone-500 mt-1">Larger teams can scale campaigns faster</p>
                </div>

                {/* Comparison Preview */}
                {data.currentMethod && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400 mb-2">
                      <AlertCircle size={16} />
                      <span className="font-medium text-sm">Potential Improvement</span>
                    </div>
                    <p className="text-sm text-yellow-600 dark:text-yellow-300">
                      Switching from {currentMethods.find(m => m.value === data.currentMethod)?.label} to Fluency's
                      verified creators could improve your ROI by{' '}
                      {Math.round(((industries.find(i => i.value === data.industry)?.avgROI || 320) * 2.2) / (currentMethods.find(m => m.value === data.currentMethod)?.avgROI || 200) * 100 - 100)}%.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Step 3: Results */}
            {step === 3 && results && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                {/* Main Results */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-full mb-4">
                    <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                    <span className="text-green-700 dark:text-green-400 font-bold text-sm">Your Potential Results</span>
                  </div>

                  <div className="text-5xl font-bold text-fluency-neon mb-2">
                    {results.roi}% ROI
                  </div>
                  <p className="text-stone-600 dark:text-stone-400">
                    Average return with verified influencer partnerships
                  </p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-stone-50 dark:bg-stone-900 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400 mb-2">
                      <Users size={16} />
                      <span className="text-sm font-medium">Authentic Reach</span>
                    </div>
                    <div className="text-2xl font-bold text-black dark:text-white">
                      {results.authenticReach}
                    </div>
                    <p className="text-xs text-stone-500">Real impressions from verified audiences</p>
                  </div>

                  <div className="bg-stone-50 dark:bg-stone-900 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400 mb-2">
                      <TrendingUp size={16} />
                      <span className="text-sm font-medium">Genuine Engagement</span>
                    </div>
                    <div className="text-2xl font-bold text-black dark:text-white">
                      {results.genuineEngagement}
                    </div>
                    <p className="text-xs text-stone-500">Real interactions from actual customers</p>
                  </div>

                  <div className="bg-stone-50 dark:bg-stone-900 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400 mb-2">
                      <DollarSign size={16} />
                      <span className="text-sm font-medium">Projected Monthly Sales</span>
                    </div>
                    <div className="text-2xl font-bold text-black dark:text-white">
                      {results.projectedSales}
                    </div>
                    <p className="text-xs text-stone-500">Revenue from influencer campaigns</p>
                  </div>

                  <div className="bg-stone-50 dark:bg-stone-900 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400 mb-2">
                      <Calculator size={16} />
                      <span className="text-sm font-medium">Payback Period</span>
                    </div>
                    <div className="text-2xl font-bold text-black dark:text-white">
                      {results.paybackPeriod}
                    </div>
                    <p className="text-xs text-stone-500">Time to recoup your investment</p>
                  </div>
                </div>

                {/* Savings Highlight */}
                <div className="bg-fluency-neon/10 border border-fluency-neon/20 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-stone-600 dark:text-stone-400 mb-1">Savings vs Traditional Methods</p>
                      <p className="text-2xl font-bold text-fluency-neon">
                        {results.savingsVsTraditional}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-stone-600 dark:text-stone-400 mb-1">By eliminating fake engagement</p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        70% cost reduction
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI Insights */}
                {results.aiInsights && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 mb-2">
                      <TrendingUp size={16} />
                      <span className="font-medium">AI Analysis</span>
                    </div>
                    <p className="text-sm text-purple-600 dark:text-purple-300">
                      {results.aiInsights}
                    </p>
                  </div>
                )}

                {/* AI Optimizations */}
                {results.optimizations && results.optimizations.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-2">
                      <TrendingUp size={16} />
                      <span className="font-medium">AI Recommendations</span>
                    </div>
                    <ul className="space-y-1">
                      {results.optimizations.map((opt, i) => (
                        <li key={i} className="text-sm text-blue-600 dark:text-blue-300 flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{opt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Guarantee */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle size={16} />
                    <span className="font-medium">Results Guaranteed</span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                    If you don't achieve at least 200% ROI in your first campaign, we'll refund your investment. No questions asked.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-stone-200 dark:border-stone-800">
          <div className="flex gap-4">
            {step > 1 && step < 3 && (
              <button
                onClick={prevStep}
                className="px-6 py-3 bg-stone-200 dark:bg-stone-800 text-black dark:text-white font-bold rounded-lg hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors"
              >
                Previous
              </button>
            )}

            {step < 2 && (
              <button
                onClick={nextStep}
                disabled={!isStepValid()}
                className="flex-1 px-6 py-3 bg-fluency-neon text-black font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            )}

            {step === 2 && (
              <button
                onClick={calculateROI}
                disabled={!isStepValid() || isCalculating}
                className="flex-1 px-6 py-3 bg-fluency-neon text-black font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCalculating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator size={18} />
                    Calculate My ROI
                  </>
                )}
              </button>
            )}

            {step === 3 && (
              <>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-stone-200 dark:bg-stone-800 text-black dark:text-white font-bold rounded-lg hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors"
                >
                  Calculate Different Budget
                </button>
                <button
                  onClick={onGetStarted}
                  className="flex-1 px-6 py-3 bg-fluency-neon text-black font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  Claim These Results
                  <ArrowRight size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};