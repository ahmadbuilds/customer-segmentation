"use client"
import React, { useState, useEffect } from 'react';

interface CustomerData {
  Age: number;
  Gender: string;
  AnnualIncome: number;
  SpendingScore: number;
}

interface SegmentationResult {
  segment: number;
  description:number;
}

interface ValidationErrors {
  Age?: string;
  Gender?: string;
  AnnualIncome?: string;
  SpendingScore?: string;
}

interface FormField {
  value: string;
  touched: boolean;
}

export default function Home() {
  const [formData, setFormData] = useState<{
    Age: FormField;
    Gender: FormField;
    AnnualIncome: FormField;
    SpendingScore: FormField;
  }>({
    Age: { value: '', touched: false },
    Gender: { value: '', touched: false },
    AnnualIncome: { value: '', touched: false },
    SpendingScore: { value: '', touched: false }
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [segmentationResult, setSegmentationResult] = useState<SegmentationResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validateField = (name: keyof CustomerData, value: string): string | undefined => {
    switch (name) {
      case 'Age':
        const age = parseInt(value);
        if (!value) return 'Age is required';
        if (isNaN(age)) return 'Age must be a valid number';
        if (age < 18 || age > 100) return 'Age must be between 18 and 100';
        return undefined;
      
      case 'Gender':
        if (!value) return 'Gender is required';
        if (!['Male', 'Female'].includes(value)) return 'Please select a valid gender';
        return undefined;
      
      case 'AnnualIncome':
        const income = parseInt(value);
        if (!value) return 'Annual income is required';
        if (isNaN(income)) return 'Income must be a valid number';
        if (income < 15 || income > 500) return 'Income must be between $15k and $500k';
        return undefined;
      
      case 'SpendingScore':
        const score = parseInt(value);
        if (!value) return 'Spending score is required';
        if (isNaN(score)) return 'Score must be a valid number';
        if (score < 1 || score > 100) return 'Score must be between 1 and 100';
        return undefined;
      
      default:
        return undefined;
    }
  };

  const validateAllFields = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    Object.keys(formData).forEach((key) => {
      const fieldName = key as keyof CustomerData;
      const error = validateField(fieldName, formData[fieldName].value);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (name: keyof CustomerData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: { value, touched: true }
    }));

    // Real-time validation
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setFormData(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        updated[key as keyof typeof updated].touched = true;
      });
      return updated;
    });

    if (!validateAllFields()) return;

    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try{
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL+'/predict'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Age: parseInt(formData.Age.value), 
          Gender: formData.Gender.value,
          AnnualIncome: parseInt(formData.AnnualIncome.value),
          SpendingScore: parseInt(formData.SpendingScore.value)
        })
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      setSegmentationResult(data);
    } catch (error) {
      console.error('Error during API call:', error);
    }
    
    
    setIsSubmitting(false);
    setShowResults(true);
  };

  const getFieldIcon = (fieldName: string) => {
    const icons = {
      Age: '👤',
      Gender: '⚧',
      AnnualIncome: '💰',
      SpendingScore: '⭐'
    };
    return icons[fieldName as keyof typeof icons] || '📝';
  };

  const getClusterInfo = (clusterLabel: number) => {
    const clusterData = {
      0: {
        title: "Average Income - Average Spending",
        subtitle: "Old Customer",
        description: "Balanced spending habits with moderate income levels. Typically loyal customers with consistent purchasing patterns.",
        icon: "👴",
        color: "from-blue-500 to-cyan-500",
        bgColor: "from-blue-900/30 to-cyan-900/30",
        characteristics: ["Loyal customer base", "Consistent purchases", "Moderate spending", "Price-conscious"]
      },
      1: {
        title: "High Income - High Spending",
        subtitle: "Young Customer",
        description: "Premium segment with high disposable income and strong purchasing power. Trend-focused and brand-conscious.",
        icon: "💎",
        color: "from-purple-500 to-pink-500",
        bgColor: "from-purple-900/30 to-pink-900/30",
        characteristics: ["High purchasing power", "Premium preferences", "Brand loyal", "Early adopters"]
      },
      2: {
        title: "Low Income - Moderate Spending",
        subtitle: "Young Customer",
        description: "Budget-conscious segment that maximizes value from purchases. Price-sensitive with selective buying behavior.",
        icon: "🌱",
        color: "from-green-500 to-emerald-500",
        bgColor: "from-green-900/30 to-emerald-900/30",
        characteristics: ["Value seekers", "Budget-conscious", "Selective purchases", "Deal hunters"]
      },
      3: {
        title: "High Income - Low Spending",
        subtitle: "Mid-aged Customer",
        description: "Conservative spenders with high earning potential. Focus on essential purchases and long-term value.",
        icon: "🏛️",
        color: "from-amber-500 to-orange-500",
        bgColor: "from-amber-900/30 to-orange-900/30",
        characteristics: ["Conservative spending", "Quality focused", "Long-term value", "Essential purchases"]
      }
    };
    return clusterData[clusterLabel as keyof typeof clusterData];
  };

  const resetForm = () => {
    setShowResults(false);
    setSegmentationResult(null);
    setFormData({
      Age: { value: '', touched: false },
      Gender: { value: '', touched: false },
      AnnualIncome: { value: '', touched: false },
      SpendingScore: { value: '', touched: false }
    });
    setErrors({});
    setCurrentStep(0);
  };

  const progressPercentage = (Object.values(formData).filter(field => 
    field.value && field.touched && !errors[Object.keys(formData)[Object.values(formData).indexOf(field)] as keyof ValidationErrors]
  ).length / 4) * 100;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (showResults && segmentationResult) {
    const clusterInfo = getClusterInfo(segmentationResult.segment);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        {/* Floating Result Shapes */}
        <div className={`absolute top-10 left-10 w-40 h-40 bg-gradient-to-r ${clusterInfo.bgColor} rounded-full blur-2xl animate-bounce`}></div>
        <div className={`absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-r ${clusterInfo.bgColor} rounded-full blur-xl animate-pulse`}></div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-4xl">
            {/* Header */}
            <div className="text-center mb-8 animate-fadeInUp">
              <div className="text-8xl mb-4 animate-bounce">{clusterInfo.icon}</div>
              <h1 className={`text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${clusterInfo.color} mb-4`}>
                Customer Segment Identified!
              </h1>
              <div className={`inline-block px-6 py-2 rounded-full bg-gradient-to-r ${clusterInfo.bgColor} border border-white/20 backdrop-blur-sm`}>
                <span className="text-white font-semibold">{clusterInfo.subtitle}</span>
              </div>
            </div>

            {/* Main Result Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl mb-8 animate-fadeInUp">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Section - Cluster Info */}
                <div>
                  <h2 className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${clusterInfo.color} mb-4`}>
                    {clusterInfo.title}
                  </h2>
                  <p className="text-gray-200 text-lg mb-6 leading-relaxed">
                    {clusterInfo.description}
                  </p>

                  {/* Characteristics */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Key Characteristics</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {clusterInfo.characteristics.map((char, index) => (
                        <div 
                          key={index}
                          className="bg-white/10 rounded-lg p-3 border border-white/20 backdrop-blur-sm animate-fadeInUp"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <span className="text-sm text-gray-200">✓ {char}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Section - Customer Data Visualization */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white mb-4">Your Customer Profile</h3>
                  
                  {/* Customer Data Cards */}
                  <div className="space-y-3">
                    <div className="bg-white/10 rounded-xl p-4 border border-white/20 backdrop-blur-sm animate-fadeInUp">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">👤</span>
                          <span className="text-white font-medium">Age</span>
                        </div>
                        <span className="text-white font-bold text-lg">{formData.Age.value} years</span>
                      </div>
                    </div>

                    <div className="bg-white/10 rounded-xl p-4 border border-white/20 backdrop-blur-sm animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">⚧</span>
                          <span className="text-white font-medium">Gender</span>
                        </div>
                        <span className="text-white font-bold text-lg">{formData.Gender.value}</span>
                      </div>
                    </div>

                    <div className="bg-white/10 rounded-xl p-4 border border-white/20 backdrop-blur-sm animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">💰</span>
                          <span className="text-white font-medium">Annual Income</span>
                        </div>
                        <span className="text-white font-bold text-lg">${formData.AnnualIncome.value}k</span>
                      </div>
                    </div>

                    <div className="bg-white/10 rounded-xl p-4 border border-white/20 backdrop-blur-sm animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">⭐</span>
                          <span className="text-white font-medium">Spending Score</span>
                        </div>
                        <span className="text-white font-bold text-lg">{formData.SpendingScore.value}/100</span>
                      </div>
                      <div className="mt-3">
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div 
                            className={`bg-gradient-to-r ${clusterInfo.color} h-2 rounded-full transition-all duration-1000`}
                            style={{ width: `${formData.SpendingScore.value}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cluster Visualization */}
                  <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                    <h4 className="text-lg font-semibold text-white mb-3">Segment Distribution</h4>
                    <div className="space-y-2">
                      {[0, 1, 2, 3].map((cluster) => {
                        const info = getClusterInfo(cluster);
                        const isActive = cluster === segmentationResult.segment;
                        return (
                          <div key={cluster} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="text-lg mr-2">{info.icon}</span>
                              <span className={`text-sm ${isActive ? 'text-white font-semibold' : 'text-gray-400'}`}>
                                {info.subtitle}
                              </span>
                            </div>
                            <div className="w-24 bg-white/20 rounded-full h-1.5">
                              <div 
                                className={`bg-gradient-to-r ${info.color} h-1.5 rounded-full transition-all duration-1000 ${isActive ? 'animate-pulse' : ''}`}
                                style={{ width: isActive ? '100%' : `${Math.random() * 30 + 10}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
              <button
                onClick={resetForm}
                className="px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                🔄 Analyze Another Customer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center animate-pulse">
          <div className="text-6xl mb-4 animate-bounce">✅</div>
          <h2 className="text-3xl font-bold text-white mb-2">Success!</h2>
          <p className="text-gray-200">Customer data submitted successfully</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Floating Geometric Shapes */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-pink-500/30 to-purple-500/30 rounded-full blur-xl animate-bounce"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-1/2 left-10 w-24 h-24 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rotate-45 blur-lg animate-spin" style={{ animationDuration: '8s' }}></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8 animate-fadeInUp">
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 mb-4 animate-pulse">
              Customer Segmentation
            </h1>
            <p className="text-xl text-gray-300">Analyze customer behavior patterns</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8 bg-white/10 rounded-full h-3 overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
            </div>
          </div>

          {/* Form Container */}
          <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="grid gap-6">
              {/* Age Field */}
              <div className="group relative">
                <label className="block text-sm font-medium text-gray-200 mb-2 transition-colors">
                  <span className="mr-2 text-xl">{getFieldIcon('Age')}</span>
                  Age
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.Age.value}
                    onChange={(e) => handleInputChange('Age', e.target.value)}
                    onFocus={() => setFocusedField('Age')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-3 bg-white/5 border-2 rounded-xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none backdrop-blur-sm ${
                      errors.Age && formData.Age.touched
                        ? 'border-red-400 bg-red-500/10'
                        : focusedField === 'Age'
                        ? 'border-purple-400 bg-purple-500/10 transform scale-105'
                        : 'border-white/30 hover:border-white/50'
                    }`}
                    placeholder="Enter your age"
                  />
                  {focusedField === 'Age' && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 -z-10 blur animate-pulse"></div>
                  )}
                </div>
                {errors.Age && formData.Age.touched && (
                  <div className="mt-2 text-red-400 text-sm flex items-center animate-fadeInUp">
                    <span className="mr-1">⚠️</span>
                    {errors.Age}
                  </div>
                )}
              </div>

              {/* Gender Field */}
              <div className="group relative">
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  <span className="mr-2 text-xl">{getFieldIcon('Gender')}</span>
                  Gender
                </label>
                <div className="relative">
                  <select
                    value={formData.Gender.value}
                    title='Gender'
                    onChange={(e) => handleInputChange('Gender', e.target.value)}
                    onFocus={() => setFocusedField('Gender')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-3 bg-white/5 border-2 rounded-xl text-white transition-all duration-300 focus:outline-none backdrop-blur-sm appearance-none cursor-pointer ${
                      errors.Gender && formData.Gender.touched
                        ? 'border-red-400 bg-red-500/10'
                        : focusedField === 'Gender'
                        ? 'border-purple-400 bg-purple-500/10 transform scale-105'
                        : 'border-white/30 hover:border-white/50'
                    }`}
                  >
                    <option value="" className="bg-gray-800">Select gender</option>
                    <option value="Male" className="bg-gray-800">Male</option>
                    <option value="Female" className="bg-gray-800">Female</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 pointer-events-none">
                    ▼
                  </div>
                  {focusedField === 'Gender' && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 -z-10 blur animate-pulse"></div>
                  )}
                </div>
                {errors.Gender && formData.Gender.touched && (
                  <div className="mt-2 text-red-400 text-sm flex items-center animate-fadeInUp">
                    <span className="mr-1">⚠️</span>
                    {errors.Gender}
                  </div>
                )}
              </div>

              {/* Annual Income Field */}
              <div className="group relative">
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  <span className="mr-2 text-xl">{getFieldIcon('AnnualIncome')}</span>
                  Annual Income (k$)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.AnnualIncome.value}
                    onChange={(e) => handleInputChange('AnnualIncome', e.target.value)}
                    onFocus={() => setFocusedField('AnnualIncome')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-3 bg-white/5 border-2 rounded-xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none backdrop-blur-sm ${
                      errors.AnnualIncome && formData.AnnualIncome.touched
                        ? 'border-red-400 bg-red-500/10'
                        : focusedField === 'AnnualIncome'
                        ? 'border-purple-400 bg-purple-500/10 transform scale-105'
                        : 'border-white/30 hover:border-white/50'
                    }`}
                    placeholder="Annual income in thousands"
                  />
                  {focusedField === 'AnnualIncome' && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 -z-10 blur animate-pulse"></div>
                  )}
                </div>
                {errors.AnnualIncome && formData.AnnualIncome.touched && (
                  <div className="mt-2 text-red-400 text-sm flex items-center animate-fadeInUp">
                    <span className="mr-1">⚠️</span>
                    {errors.AnnualIncome}
                  </div>
                )}
              </div>

              {/* Spending Score Field */}
              <div className="group relative">
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  <span className="mr-2 text-xl">{getFieldIcon('SpendingScore')}</span>
                  Spending Score (1-100)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.SpendingScore.value}
                    onChange={(e) => handleInputChange('SpendingScore', e.target.value)}
                    onFocus={() => setFocusedField('SpendingScore')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-3 bg-white/5 border-2 rounded-xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none backdrop-blur-sm ${
                      errors.SpendingScore && formData.SpendingScore.touched
                        ? 'border-red-400 bg-red-500/10'
                        : focusedField === 'SpendingScore'
                        ? 'border-purple-400 bg-purple-500/10 transform scale-105'
                        : 'border-white/30 hover:border-white/50'
                    }`}
                    placeholder="Spending behavior score"
                  />
                  {formData.SpendingScore.value && (
                    <div className="mt-2">
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, parseInt(formData.SpendingScore.value) || 0))}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  {focusedField === 'SpendingScore' && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 -z-10 blur animate-pulse"></div>
                  )}
                </div>
                {errors.SpendingScore && formData.SpendingScore.touched && (
                  <div className="mt-2 text-red-400 text-sm flex items-center animate-fadeInUp">
                    <span className="mr-1">⚠️</span>
                    {errors.SpendingScore}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8">
              <button
                type="submit"
                disabled={isSubmitting || Object.keys(errors).some(key => errors[key as keyof ValidationErrors])}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 relative overflow-hidden group ${
                  isSubmitting
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 active:scale-95'
                }`}
              >
                <div className="relative z-10 flex items-center justify-center">
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white/20 border-t-white rounded-full mr-3"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">🚀</span>
                      Analyze Customer
                    </>
                  )}
                </div>
                
                {!isSubmitting && (
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}
              </button>
            </div>
          </form>

          {/* Stats Display */}
          <div className="mt-8 grid grid-cols-4 gap-4">
            {['👤', '⚧', '💰', '⭐'].map((icon, index) => (
              <div 
                key={index}
                className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border transition-all duration-500 ${
                  currentStep === index 
                    ? 'border-purple-400 bg-purple-500/20 transform scale-110' 
                    : 'border-white/20'
                }`}
              >
                <div className="text-2xl mb-2">{icon}</div>
                <div className="text-xs text-gray-300 font-medium">
                  {['Age', 'Gender', 'Income', 'Score'][index]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}