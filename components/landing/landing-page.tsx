/* eslint-disable @typescript-eslint/no-unused-vars */
// components/landing/landing-page.tsx
"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link'; // Import Link
import { useRouter } from 'next/navigation'; // Import useRouter for programmatic navigation if needed
import { ArrowRight, Play, Star, Check, Users, Award, Clock, Shield, Moon, Sun, Sparkles } from 'lucide-react';
import { useTheme } from '@/context/theme-provider'; // Assuming you created this

const LandingPageContent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { theme, toggleTheme } = useTheme(); // Use your theme context
  const router = useRouter(); // Initialize router

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const isDark = theme === 'dark';

  const themeClasses = {
    bg: isDark ? 'bg-gray-900' : 'bg-white',
    bgAlt: isDark ? 'bg-gray-800' : 'bg-gray-50',
    text: isDark ? 'text-white' : 'text-gray-900',
    textMuted: isDark ? 'text-gray-300' : 'text-gray-600',
    textMuted2: isDark ? 'text-gray-400' : 'text-gray-500',
    border: isDark ? 'border-gray-700' : 'border-gray-200',
    cardBg: isDark ? 'bg-gray-800/50' : 'bg-white', // Note: opacity might behave differently on light bg
    accent: 'bg-gradient-to-r from-blue-600 to-purple-600',
    accentHover: 'hover:from-blue-700 hover:to-purple-700'
  };

  // Placeholder for demo video click
  const handleWatchDemo = () => {
    alert("Watch Demo functionality to be implemented!");
    // Example: router.push('/demo'); or open a modal
  };

  return (
    <div className={`${themeClasses.bg} transition-colors duration-300`}>
      {/* Navigation */}
      <nav className={`flex items-center justify-between px-6 py-4 max-w-7xl mx-auto ${themeClasses.bg} backdrop-blur-md bg-opacity-80 sticky top-0 z-50`}>
        <Link href="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className={`text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent`}>
            GetHired
          </span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className={`${themeClasses.textMuted} hover:${themeClasses.text} transition-colors font-medium`}>Features</a>
          <a href="#pricing" className={`${themeClasses.textMuted} hover:${themeClasses.text} transition-colors font-medium`}>Pricing</a>
          <a href="#examples" className={`${themeClasses.textMuted} hover:${themeClasses.text} transition-colors font-medium`}>Examples</a>
          <a href="#testimonials" className={`${themeClasses.textMuted} hover:${themeClasses.text} transition-colors font-medium`}>Reviews</a>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-lg ${themeClasses.textMuted} hover:${themeClasses.text} transition-colors`}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <Link href="/sign-in" passHref>
            <button className={`${themeClasses.textMuted} hover:${themeClasses.text} font-medium transition-colors`}>
              Sign in
            </button>
          </Link>
          <Link href="/sign-up" passHref>
            <button className={`${themeClasses.accent} ${themeClasses.accentHover} text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}>
              Get Started
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-transparent rounded-3xl"></div>
        
        <div className={`text-center transition-all duration-1000 relative z-10 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className={`inline-flex items-center ${isDark ? 'bg-blue-900/30 text-blue-300 border border-blue-700/30' : 'bg-blue-50 text-blue-700'} px-4 py-2 rounded-full text-sm font-semibold mb-8 backdrop-blur-sm`}>
            <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
            Trusted by 150,000+ professionals worldwide
          </div>
          
          <h1 className={`text-5xl md:text-7xl font-bold ${themeClasses.text} mb-8 leading-tight`}>
            Build resumes that
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent block">
              dominate ATS systems
            </span>
          </h1>
          
          <p className={`text-xl md:text-2xl ${themeClasses.textMuted} mb-12 max-w-3xl mx-auto leading-relaxed`}>
            AI-powered resume builder with advanced ATS optimization, real-time scoring, and templates designed by industry experts. Land interviews 3x faster.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-20">
            <Link href="/sign-up" passHref> {/* Main CTA to sign-up */}
              <button className={`${themeClasses.accent} ${themeClasses.accentHover} text-white px-10 py-4 rounded-xl font-semibold text-lg flex items-center transition-all duration-200 shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-1`}>
                Create Professional Resume
                <ArrowRight className="w-5 h-5 ml-3" />
              </button>
            </Link>
            <button 
              onClick={handleWatchDemo}
              className={`flex items-center ${themeClasses.textMuted} hover:${themeClasses.text} font-semibold text-lg transition-colors group`}
            >
              <div className="p-3 rounded-full bg-white/10 backdrop-blur-sm mr-3 group-hover:bg-white/20 transition-colors">
                <Play className="w-5 h-5" />
              </div>
              Watch Demo (2 min)
            </button>
          </div>

          {/* Enhanced Stats (no changes needed here for button functionality) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { value: '97%', label: 'Interview Rate', color: 'text-green-400' },
              { value: '150K+', label: 'Resumes Created', color: 'text-blue-400' },
              { value: '4.9/5', label: 'User Rating', color: 'text-yellow-400' },
              { value: '90 sec', label: 'Average Build Time', color: 'text-purple-400' }
            ].map((stat, index) => (
              <div key={index} className={`text-center p-6 rounded-2xl ${themeClasses.cardBg} backdrop-blur-sm border ${themeClasses.border} hover:border-blue-500/30 transition-all duration-300`}>
                <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                  {stat.value}
                </div>
                <div className={`text-sm ${themeClasses.textMuted2} font-medium`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof (no changes needed here for button functionality) */}
      <section className={`${themeClasses.bgAlt} py-20`}>
        <div className="max-w-7xl mx-auto px-6">
          <p className={`text-center ${themeClasses.textMuted} mb-12 font-medium`}>
            Trusted by professionals at leading companies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-4 opacity-70"> {/* Added flex-wrap and gap-y for responsiveness */}
            {['Google', 'Microsoft', 'Apple', 'Amazon', 'Netflix', 'Meta'].map((company) => (
              <div key={company} className={`text-2xl font-bold ${themeClasses.text} hover:opacity-100 transition-opacity`}>
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features (no changes needed here for button functionality) */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-20">
          <h2 className={`text-4xl md:text-5xl font-bold ${themeClasses.text} mb-6`}>
            Advanced Features for Modern Job Seekers
          </h2>
          <p className={`text-xl ${themeClasses.textMuted} max-w-3xl mx-auto`}>
            Enterprise-grade tools that give you the competitive edge in today&apos;s job market
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Users,
              title: 'Advanced ATS Optimization',
              description: 'Bypass 99% of ATS filters with our proprietary scanning technology and keyword optimization engine.',
              color: 'blue' // Keep these as strings for Tailwind JIT
            },
            {
              icon: Award,
              title: 'AI Content Generation',
              description: 'Generate compelling bullet points and achievements using GPT-powered writing assistance.',
              color: 'green'
            },
            {
              icon: Clock,
              title: 'Premium Templates',
              description: 'Access 50+ executive-level templates designed by Fortune 500 hiring managers.',
              color: 'purple'
            },
            {
              icon: Shield,
              title: 'Real-Time Analytics',
              description: 'Live scoring system with detailed feedback on keyword density, formatting, and impact.',
              color: 'orange'
            },
            {
              icon: Check,
              title: 'Multi-Format Export',
              description: 'Export to PDF, Word, LinkedIn, and share via custom branded links with tracking.',
              color: 'red'
            },
            {
              icon: Star,
              title: 'Cover Letter Suite',
              description: 'AI-generated cover letters that perfectly complement your resume with consistent branding.',
              color: 'yellow'
            }
          ].map((feature, index) => (
            <div key={index} className={`p-8 rounded-2xl ${themeClasses.cardBg} border ${themeClasses.border} hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group`}>
              <div className={`w-14 h-14 bg-${feature.color}-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {/* Feature icon color needs to be handled carefully with dynamic class names. 
                    Consider mapping 'color' to specific Tailwind classes or using inline styles if JIT issues arise.
                    For simplicity with Tailwind JIT, ensure full class names are present or use a mapping.
                    Example: text-blue-600, text-green-600 etc.
                */}
                <feature.icon className={`w-7 h-7 text-${feature.color}-600`} />
              </div>
              <h3 className={`text-xl font-bold ${themeClasses.text} mb-4`}>
                {feature.title}
              </h3>
              <p className={`${themeClasses.textMuted} leading-relaxed`}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works (no changes needed here for button functionality) */}
      <section className={`${themeClasses.bgAlt} py-32`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className={`text-4xl md:text-5xl font-bold ${themeClasses.text} mb-6`}>
              Three Steps to Success
            </h2>
            <p className={`text-xl ${themeClasses.textMuted}`}>
              Professional results in under 3 minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: '01',
                title: 'Import Your Data',
                description: 'Upload your existing resume or LinkedIn profile. Our AI extracts and optimizes your information automatically.'
              },
              {
                step: '02',
                title: 'AI Enhancement',
                description: 'Choose from premium templates while our AI suggests improvements, keywords, and quantified achievements.'
              },
              {
                step: '03',
                title: 'Deploy & Track',
                description: 'Download your ATS-optimized resume and track application performance with built-in analytics.'
              }
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-8">
                  <div className={`w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-3xl flex items-center justify-center text-xl font-bold mx-auto shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                    {item.step}
                  </div>
                  {index < 2 && (
                    <div className={`hidden md:block absolute top-10 left-full w-full h-0.5 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                  )}
                </div>
                <h3 className={`text-2xl font-bold ${themeClasses.text} mb-4`}>
                  {item.title}
                </h3>
                <p className={`${themeClasses.textMuted} text-lg leading-relaxed`}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials (no changes needed here for button functionality) */}
      <section id="testimonials" className="max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-20">
          <h2 className={`text-4xl md:text-5xl font-bold ${themeClasses.text} mb-6`}>
            Success Stories
          </h2>
          <p className={`text-xl ${themeClasses.textMuted}`}>
            Real results from real professionals
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: 'Sarah Chen',
              role: 'Senior Software Engineer',
              company: 'Google',
              content: 'Landed 5 FAANG interviews in two weeks. The ATS optimization is incredible - my resume now ranks in the top 2% of applicants.',
              rating: 5
            },
            {
              name: 'Marcus Johnson',
              role: 'VP of Marketing',
              company: 'Stripe',
              content: 'The AI writing assistant transformed my achievements into compelling stories. Increased my interview rate by 400%.',
              rating: 5
            },
            {
              name: 'Emily Rodriguez',
              role: 'Lead Product Designer',
              company: 'Airbnb',
              content: 'Professional, modern, and effective. Got my dream role at a unicorn startup thanks to the premium templates.',
              rating: 5
            }
          ].map((testimonial, index) => (
            <div key={index} className={`p-8 rounded-2xl ${themeClasses.cardBg} border ${themeClasses.border} hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl`}>
              <div className="flex mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className={`${themeClasses.textMuted} text-lg mb-6 leading-relaxed italic`}>
                &quot;{testimonial.content}&quot;
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mr-4 flex items-center justify-center text-white font-bold">
                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className={`font-bold ${themeClasses.text}`}>
                    {testimonial.name}
                  </div>
                  <div className={`text-sm ${themeClasses.textMuted2}`}>
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Join 150,000+ professionals who&apos;ve accelerated their careers with AI-powered resumes
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link href="/sign-up" passHref> {/* CTA to sign-up */}
              <button className="bg-white text-gray-900 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-200 shadow-2xl transform hover:-translate-y-1">
                Start Building Now - Free
              </button>
            </Link>
            <button 
              onClick={handleWatchDemo}
              className="border-2 border-white text-white px-10 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-gray-900 transition-all duration-200"
            >
              View Live Demo
            </button>
          </div>
          <p className="text-blue-200 text-sm mt-6">
            No credit card required • 7-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className={`${themeClasses.bgAlt} border-t ${themeClasses.border}`}>
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <Link href="/" className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className={`text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent`}>
                GetHired
              </span>
            </Link>
            <div className="flex flex-wrap justify-center space-x-8"> {/* Added flex-wrap and justify-center */}
              {['Privacy Policy', 'Terms of Service', 'Support Center', 'API Documentation'].map((link) => (
                <a key={link} href="#" className={`${themeClasses.textMuted} hover:${themeClasses.text} transition-colors font-medium`}>
                  {link}
                </a>
              ))}
            </div>
          </div>
          <div className={`border-t ${themeClasses.border} pt-8 text-center ${themeClasses.textMuted2}`}>
            <p>© 2024 GetHired. All rights reserved. Built with cutting-edge AI technology.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageContent;