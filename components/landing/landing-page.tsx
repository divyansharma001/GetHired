/* eslint-disable @typescript-eslint/no-unused-vars */
// components/landing/landing-page.tsx
"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
// ... other imports
import { 
    ArrowRight, Play, Star, Check, Users, Award, Clock, Shield, Moon, Sun, 
    TrendingUp, Zap, Target, FileText as FileTextIconLucide,
    LogIn, Edit2, DownloadCloud, BarChart2, ListChecks, ShieldCheck, Briefcase, // New icons for features
    Github, Linkedin, Twitter as TwitterIcon, // Icons for Footer
    MailCheckIcon,
    MailCheck
} from 'lucide-react';
import { useTheme } from '@/context/theme-provider';
import SlidingTechStack from './sliding-techstack';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

// ======== BENTO GRID COMPONENTS (Professional Dark Theme Inspired) ========
interface BentoCardProps {
  name: string;
  className?: string;
  description: string;
  href?: string;
  ctaText?: string; // Changed from 'cta' for clarity
  backgroundContent?: React.ReactNode;
  Icon: React.ElementType;
  isDark: boolean;
  isHero?: boolean;
}

const BentoCard: React.FC<BentoCardProps> = ({
  name,
  className,
  description,
  href = "#",
  ctaText = "Learn More",
  backgroundContent,
  Icon,
  isDark,
  isHero = false,
}) => {
  const cardBaseStyle = "group relative flex flex-col justify-between overflow-hidden rounded-2xl";
  const cardTransition = "transition-all duration-300 ease-in-out";
  
  const cardThemeStyle = isDark
    ? "bg-neutral-900/80 border border-neutral-800/70 shadow-xl shadow-black/20 hover:border-neutral-700"
    : "bg-white border border-neutral-200 shadow-lg shadow-neutral-500/10 hover:border-neutral-300";

  const heroCardDarkStyle = isDark
    ? "bg-neutral-800/70 border border-neutral-700/60 shadow-2xl shadow-black/30 hover:border-neutral-600"
    : "bg-slate-50 border border-slate-200 shadow-xl shadow-slate-500/15 hover:border-slate-300";

  const titleStyle = cn(
    "font-semibold tracking-tight", 
    isHero ? "text-xl md:text-2xl lg:text-3xl" : "text-lg md:text-xl",
    isDark ? "text-neutral-100" : "text-neutral-800"
  );
  const descriptionStyle = cn(
    "leading-relaxed text-sm",
    isHero ? "md:text-base" : "md:text-sm",
    isDark ? "text-neutral-400" : "text-neutral-600"
  );
  const iconStyle = cn(
    "mb-3 md:mb-4 transition-transform duration-300 group-hover:scale-90",
    isHero ? "h-10 w-10 md:h-12 md:w-12" : "h-8 w-8 md:h-10 md:w-10",
    isDark ? "text-blue-400" : "text-blue-600"
  );
  const ctaStyle = cn(
    "pointer-events-auto text-xs font-medium group-hover:underline",
    isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
  );
  const padding = isHero ? "p-6 md:p-8" : "p-5 md:p-6";

  return (
    <div
      className={cn(
        cardBaseStyle,
        cardTransition,
        isHero ? heroCardDarkStyle : cardThemeStyle,
        className,
        "hover:-translate-y-1 hover:shadow-fuchsia-500/5"
      )}
    >
      {backgroundContent && (
        <div className="absolute inset-0 z-0 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
           <div 
            className={cn(
                "absolute inset-0 [mask-image:radial-gradient(circle_at_center,white_20%,transparent_80%)] group-hover:[mask-image:radial-gradient(circle_at_center,white_40%,transparent_70%)] transition-all duration-500 ease-out",
                 isDark ? "opacity-40 group-hover:opacity-60" : "opacity-20 group-hover:opacity-30"
            )}
           >
            {backgroundContent}
          </div>
        </div>
      )}
      <div className={cn("relative z-10 flex flex-col", padding)}>
        <Icon className={iconStyle} />
        <h3 className={titleStyle}>
          {name}
        </h3>
        <p className={descriptionStyle}>{description}</p>
      </div>
      {!isHero && href && ctaText && (
        <div className={cn("relative z-10 mt-auto p-5 md:p-6 pt-0 md:pt-1", 
                           "opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100"
        )}>
          <a href={href} className={ctaStyle}>
            {ctaText}
            <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </div>
  );
};

const BentoGrid = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return (
    <div
      className={cn(
        "grid w-full gap-5 md:gap-6",
        className,
      )}
    >
      {children}
    </div>
  );
};

const bentoFeaturesData = [
  {
    Icon: BarChart2,
    name: "Real-Time ATS Insights",
    description: "Gain instant access to your resume's ATS score with our real-time analytics. Make informed decisions with up-to-the-minute information and actionable suggestions.",
    href: "#feature-ats",
    ctaText: "Analyze My Resume",
    // MODIFIED className for responsiveness
    className: "col-span-1 md:col-span-2 lg:col-span-2 row-span-2",
    isHero: true,
    backgroundContent: (
      <div className="absolute inset-0 flex items-end justify-center p-4 md:p-8 opacity-40 group-hover:opacity-60 transition-opacity">
        <svg width="100%" height="60%" viewBox="0 0 300 100" preserveAspectRatio="none">
          <path d="M0 80 C 50 20, 100 90, 150 40 S 250 0, 300 60" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-blue-500/30 group-hover:text-blue-500/50 transition-colors duration-500"/>
          <circle cx="150" cy="40" r="5" fill="currentColor" className="text-blue-400"/>
          <text x="155" y="38" fontSize="8" fill="currentColor" className="text-neutral-400">Optimal</text>
        </svg>
      </div>
    ),
  },
  {
    Icon: ListChecks,
    name: "Automated Content Enhancement",
    description: "Categorize and monitor your resume sections with our AI. Optimize wording and bullet points without lifting a finger.",
    href: "#feature-ai",
    ctaText: "Enhance My Content",
    className: "col-span-1", // This will correctly span 1/1 on mobile, 1/2 on md, 1/3 on lg (if applicable)
    backgroundContent: (
      <div className="absolute inset-0 flex flex-col items-start justify-end p-4 md:p-6 space-y-2 opacity-30 group-hover:opacity-50">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-3 w-full rounded-full bg-neutral-700/50 group-hover:bg-neutral-600/50 transition-colors" style={{width: `${100 - i*15}%`}}></div>
        ))}
      </div>
    ),
  },
 {
    Icon: Zap,
    name: "Effortless Export & Share",
    description: "Download your ATS-optimized resume in PDF, DOCX, or TXT. Share with a unique link and track views.",
    href: "#feature-export",
    ctaText: "Download Now",
    className: "col-span-1", // This will correctly span 1/1 on mobile, 1/2 on md, 1/3 on lg (if applicable)
  backgroundContent: (
      <div className="absolute inset-0 flex items-center justify-around p-4 opacity-20 group-hover:opacity-30">
        <FileTextIconLucide className="w-12 h-12 text-purple-500/50 transform -rotate-6" />
        <FileTextIconLucide className="w-16 h-16 text-purple-500/50 transform scale-110" />
        <FileTextIconLucide className="w-12 h-12 text-purple-500/50 transform rotate-6" />
      </div>
    ),
  },
];

const LandingPageContent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isDark = theme === 'dark';

  const themeClasses = {
    bg: isDark ? 'bg-neutral-950' : 'bg-slate-50',
    bgAlt: isDark ? 'bg-neutral-900' : 'bg-white',
    text: isDark ? 'text-neutral-100' : 'text-neutral-900',
    textMuted: isDark ? 'text-neutral-400' : 'text-neutral-500',
    textMuted2: isDark ? 'text-neutral-500' : 'text-neutral-400',
    border: isDark ? 'border-neutral-800' : 'border-neutral-200',
    accent: isDark ? 'text-blue-400' : 'text-blue-600',
    accentGradient: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    accentHover: 'hover:from-blue-600 hover:to-indigo-600',
    footerBg: isDark ? 'bg-neutral-900' : 'bg-white',
    footerTextTitle: isDark ? 'text-neutral-300' : 'text-neutral-700',
    footerTextLink: isDark ? 'text-neutral-400 hover:text-blue-400' : 'text-neutral-500 hover:text-blue-600',
    footerTextCopyright: isDark ? 'text-neutral-500' : 'text-neutral-400',
  };
  
  const finalCtaThemeClasses = { 
    sectionBgGradient: isDark ? 'bg-gradient-to-br from-neutral-900 via-black to-indigo-950' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50', headlineText: isDark ? 'text-white' : 'text-neutral-900', subHeadlineText: isDark ? 'text-neutral-300' : 'text-neutral-600', secondaryButtonBorder: isDark ? 'border-neutral-600' : 'border-blue-500', secondaryButtonText: isDark ? 'text-neutral-200' : 'text-blue-600', secondaryButtonHoverBg: isDark ? 'hover:bg-neutral-800' : 'hover:bg-blue-100', secondaryButtonHoverText: isDark ? 'hover:text-white' : 'hover:text-blue-700', smallPrintText: isDark ? 'text-neutral-500' : 'text-blue-700 opacity-80', animatedBlur1: isDark ? 'bg-indigo-700/10' : 'bg-blue-300/20', animatedBlur2: isDark ? 'bg-purple-700/5' : 'bg-indigo-300/10',
  };

  const handleWatchDemo = () => { alert("Watch Demo functionality to be implemented!"); };
  const threeStepsData = [ 
    { step: '01', Icon: LogIn, title: 'Upload or Start Fresh', description: 'Easily import data from an existing resume or LinkedIn, or begin with a clean, professional template.' }, { step: '02', Icon: Edit2, title: 'AI-Powered Refinement', description: 'Our intelligent assistant helps you craft compelling content, suggests keywords, and optimizes for ATS.' }, { step: '03', Icon: DownloadCloud, title: 'Download & Apply', description: 'Export your perfectly polished resume in multiple formats and confidently apply to your dream roles.' }
  ];
  
  const displayedBentoFeatures = bentoFeaturesData;

  const ctaButtonBaseGradient = isDark
    ? "from-blue-500 via-indigo-500 to-purple-600"
    : "from-blue-600 via-indigo-600 to-purple-700";
  const ctaAnimatedBgGradient = isDark
    ? "from-blue-600 via-indigo-600 to-purple-700"
    : "from-blue-700 via-indigo-700 to-purple-800";
  const ctaShineViaColor = isDark ? "via-white/20" : "via-black/10";

  const footerLinks = [
    {
      title: 'Product',
      links: [
        { name: 'Features', href: '#features' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'Examples', href: '#examples' },
        { name: 'How it Works', href: '#how-it-works' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Contact Us', href: '/contact' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'ATS Guide', href: '/guides/ats-resume' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
      ],
    },
  ];

  const socialMediaLinks = [
    { name: 'GitHub', href: 'https://github.com/divyansharma001/gethired', Icon: Github, ariaLabel: "GitHub Profile" },
    { name: 'LinkedIn', href: 'https://linkedin.com/in/divyansharma001', Icon: Linkedin, ariaLabel: "LinkedIn Profile" },
    { name: 'Twitter', href: 'https://twitter.com/divyansharma001', Icon: TwitterIcon, ariaLabel: "Twitter Profile" },
  ];

  return (
    <div 
        className={`${themeClasses.bg} transition-colors duration-300 font-sans`}
        style={{
            '--bento-analytics-stroke': isDark ? 'rgba(59, 130, 246, 0.4)' : 'rgba(37, 99, 235, 0.5)',
            '--bento-card-detail-bg-start': isDark ? 'rgba(129, 140, 248, 0.02)' : 'rgba(199, 210, 254, 0.05)',
            '--bento-card-detail-bg-hover': isDark ? 'rgba(129, 140, 248, 0.05)' : 'rgba(199, 210, 254, 0.1)',
        } as React.CSSProperties}
    >
        <nav className={`flex items-center justify-between px-4 sm:px-6 py-3 max-w-7xl mx-auto ${isDark ? 'bg-neutral-950/80' : 'bg-slate-50/80'} backdrop-blur-md sticky top-0 z-50 border-b ${themeClasses.border}`}>
          <Link href="/" className="flex items-center space-x-2"> <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-md"> <MailCheck className="w-4 h-4 text-white" /> </div> <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent"> GetHired </span> </Link>
          {/* <div className="hidden md:flex items-center space-x-6"> <a href="#features" className={`${themeClasses.textMuted} hover:${themeClasses.text} transition-colors text-sm font-medium`}>Features</a> <a href="#pricing" className={`${themeClasses.textMuted} hover:${themeClasses.text} transition-colors text-sm font-medium`}>Pricing</a> <a href="#examples" className={`${themeClasses.textMuted} hover:${themeClasses.text} transition-colors text-sm font-medium`}>Examples</a> <a href="#testimonials" className={`${themeClasses.textMuted} hover:${themeClasses.text} transition-colors text-sm font-medium`}>Reviews</a> </div> */}
          <div className="flex items-center space-x-3"> <button onClick={toggleTheme} className={`p-2 rounded-md ${themeClasses.textMuted} hover:${themeClasses.text} transition-colors`} aria-label="Toggle theme"> {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />} </button> <Link href="/sign-in" className={`${themeClasses.textMuted} hover:${themeClasses.text} text-sm font-medium transition-colors`}> Sign in </Link> <Link href="/sign-up" className={`${themeClasses.accentGradient} ${themeClasses.accentHover} text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5`}> Get Started </Link> </div>
        </nav>
      
      {/* ======== NEW HERO SECTION START ======== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-24 relative overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 overflow-hidden -z-20">
          {/* Gradient Orbs */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
          
          {/* Additional Floating Elements */}
          <div className="absolute top-20 right-1/4 w-32 h-32 bg-purple-500/3 rounded-full blur-2xl animate-float"></div>
          <div className="absolute bottom-32 left-1/3 w-24 h-24 bg-cyan-500/4 rounded-full blur-2xl animate-float-delayed"></div>
          
          {/* Shiny Particles */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-60"></div>
          <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse opacity-40" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-1/4 left-1/5 w-1 h-1 bg-cyan-400 rounded-full animate-pulse opacity-50" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 right-1/5 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse opacity-30" style={{animationDelay: '0.5s'}}></div>
          
          {/* Geometric Shapes */}
          <div className="absolute top-16 left-1/6 w-4 h-4 border border-blue-300/20 rotate-45 animate-spin-slow"></div>
          <div className="absolute bottom-20 right-1/6 w-6 h-6 border border-purple-300/15 rotate-12 animate-pulse"></div>
        </div>

        {/* Grid Pattern Overlay */}
        {isDark && (
          <div className="absolute inset-0 -z-10 opacity-[0.03]">
            <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
              <defs>
                <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M0 40V0h40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hero-grid)"/>
            </svg>
          </div>
        )}

        {/* Radial Gradient Spotlight */}
        <div className="absolute inset-0 -z-15">
          <div className={`absolute inset-0 ${isDark 
            ? '[background:radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_50%)]' 
            : '[background:radial-gradient(circle_at_center,rgba(59,130,246,0.03)_0%,transparent_60%)]'
          }`}></div>
        </div>

        {/* Animated Lines */}
        <div className="absolute inset-0 -z-10 opacity-20">
          <div className={`absolute top-1/4 left-0 w-full h-px ${isDark ? 'bg-gradient-to-r from-transparent via-blue-400/20 to-transparent' : 'bg-gradient-to-r from-transparent via-blue-500/15 to-transparent'} animate-pulse`}></div>
          <div className={`absolute bottom-1/3 left-0 w-full h-px ${isDark ? 'bg-gradient-to-r from-transparent via-purple-400/15 to-transparent' : 'bg-gradient-to-r from-transparent via-purple-500/10 to-transparent'} animate-pulse`} style={{animationDelay: '1.5s'}}></div>
        </div>

        <div className={`text-center transition-all duration-1000 relative z-10 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className={`inline-flex items-center ${isDark ? 'bg-emerald-800/30 text-emerald-300 border border-emerald-700/40' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'} px-3 py-1.5 rounded-full text-xs font-medium mb-8 backdrop-blur-sm animate-fade-in-up`} style={{animationDelay: '0.2s'}}> 
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2 animate-pulse"></div> 
            AI-Powered to Pass ATS, Designed to Impress Humans.
          </div>
          
          <div className="animate-fade-in-up" style={{animationDelay: '0.4s'}}> 
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold ${themeClasses.text} mb-6 leading-tight tracking-tight`}> 
              <span className="font-sans">Build resumes that</span>{' '}
              <span className="block  bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent animate-gradient-x "> 
                <span className=' italic'>dominate</span> ATS systems 
              </span>   
            </h1> 
          </div>
          
          <div className="animate-fade-in-up" style={{animationDelay: '0.6s'}}> 
            <p className={`text-lg sm:text-xl ${themeClasses.textMuted} mb-10 max-w-2xl mx-auto leading-relaxed`}> 
              AI-powered resume builder with advanced ATS optimization, real-time scoring, and templates designed by industry experts. Land interviews 3x faster. 
            </p> 
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-16 animate-fade-in-up" style={{animationDelay: '0.8s'}}> 
            <Link href="/sign-up" className={`relative overflow-hidden ${themeClasses.accentGradient} ${themeClasses.accentHover} text-white px-8 py-3.5 rounded-lg font-semibold flex items-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 group`}> 
              {/* Button Shine Effect */}
              <div className="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
              <span className="relative z-10">Create Professional Resume</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform relative z-10" /> 
            </Link> 
            
            <button onClick={handleWatchDemo} className={`flex items-center ${themeClasses.textMuted} hover:${themeClasses.text} font-medium transition-colors group`} > 
              <div className={`relative p-2.5 rounded-full ${isDark ? 'bg-white/5' : 'bg-slate-100'} backdrop-blur-sm mr-3 group-hover:bg-blue-500/10 transition-colors overflow-hidden`}> 
                {/* Play Button Glow */}
                <div className="absolute inset-0 rounded-full bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors duration-300"></div>
                <Play className="w-4 h-4 relative z-10" /> 
              </div> 
              Watch Demo (2 min) 
            </button> 
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto animate-fade-in-up" style={{animationDelay: '1s'}}> 
            {[
              { value: '90%', label: 'Interview Rate', icon: TrendingUp, color: 'text-emerald-400' }, 
              { value: '50+', label: 'Resumes Created', icon: Users, color: 'text-blue-400' }, 
              { value: '4.9/5', label: 'User Rating', icon: Star, color: 'text-yellow-400' }, 
              { value: '90s', label: 'Build Time', icon: Zap, color: 'text-purple-400' }
            ].map((stat, index) => ( 
              <div key={index} className={`relative text-center p-4 sm:p-6 rounded-xl ${isDark ? 'bg-neutral-800/50' : 'bg-white/70'} backdrop-blur-sm border ${themeClasses.border} hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1 group overflow-hidden`}> 
                {/* Card Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                
                <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-2 group-hover:scale-110 transition-transform relative z-10`} /> 
                <div className={`text-2xl sm:text-3xl font-bold ${stat.color} mb-1 relative z-10`}> 
                  {stat.value} 
                </div> 
                <div className={`text-xs sm:text-sm ${themeClasses.textMuted2} font-medium relative z-10`}> 
                  {stat.label} 
                </div> 
              </div> 
            ))} 
          </div>
        </div>
      </section>
      {/* ======== NEW HERO SECTION END ======== */}

      <SlidingTechStack />

      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">
        <div className="text-center mb-16 sm:mb-20 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <span className={`inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider rounded-full ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
            FEATURES
          </span>
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${themeClasses.text} mb-4 tracking-tight`}>
            Essential Tools for Your Career Growth
          </h2>
          <p className={`text-lg ${themeClasses.textMuted} max-w-xl mx-auto`}>
            Unlock your potential with GetHired&apos;s powerful suite of tools designed for your success.
          </p>
        </div>
        
        <BentoGrid 
          // MODIFIED className for responsiveness: md:grid-cols-2 instead of md:grid-cols-3
          className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-[18rem] sm:auto-rows-[19rem] md:auto-rows-[20rem]"
        >
          {displayedBentoFeatures.map((feature, idx) => (
            <BentoCard 
              key={idx} 
              {...feature} 
              isDark={isDark}
              isHero={feature.isHero}
            />
          ))}
        </BentoGrid>
      </section>

      <section id="how-it-works" className={`${themeClasses.bgAlt} py-20 sm:py-32 transition-colors duration-300 overflow-hidden relative`}>
        <div className="absolute inset-0 overflow-hidden -z-10">
            <div className={`absolute top-1/4 left-1/4 w-72 h-72 ${isDark ? 'bg-blue-500/5' : 'bg-blue-300/10'} rounded-full blur-3xl animate-float`} />
            <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 ${isDark ? 'bg-indigo-500/5' : 'bg-indigo-300/10'} rounded-full blur-3xl animate-float-delayed`} />
            {isDark && (
            <div className="absolute inset-0 opacity-[0.02]">
                <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
                <defs>
                    <pattern id="grid-pattern" width="32" height="32" patternUnits="userSpaceOnUse">
                    <path d="M0 32V0h32" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-pattern)"/>
                </svg>
            </div>
            )}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center mb-20 sm:mb-24 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <div className={`inline-flex items-center px-4 py-2 mb-6 text-sm font-semibold tracking-wider rounded-full ${isDark ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-indigo-100 text-indigo-700 border border-indigo-200'} backdrop-blur-sm`}>
                <Target className="w-4 h-4 mr-2" />
                HOW IT WORKS
            </div>
            <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-bold ${themeClasses.text} mb-6 tracking-tight leading-tight`}>
                From Upload to 
                <span className="block bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-x">
                Dream Job
                </span>
            </h2>
            <p className={`text-xl sm:text-2xl ${themeClasses.textMuted} max-w-3xl mx-auto leading-relaxed`}>
                Our AI-powered platform transforms your career story into a compelling resume that gets results
            </p>
            </div>

            <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 -z-10">
                <div className={`h-full bg-gradient-to-r ${isDark ? 'from-transparent via-neutral-700/50 to-transparent' : 'from-transparent via-neutral-300/70 to-transparent'}`} />
                <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/20 via-indigo-500/30 to-purple-500/20 animate-pulse-gentle`} />
            </div>
            
            <div className="hidden lg:block absolute top-1/2 left-1/3 w-2 h-2 -translate-y-1/2 -translate-x-1/2">
                <div className={`w-full h-full rounded-full ${isDark ? 'bg-blue-400' : 'bg-blue-500'} animate-ping`} />
                <div className={`absolute inset-0 w-full h-full rounded-full ${isDark ? 'bg-blue-400' : 'bg-blue-500'}`} />
            </div>
            <div className="hidden lg:block absolute top-1/2 right-1/3 w-2 h-2 -translate-y-1/2 translate-x-1/2">
                <div className={`w-full h-full rounded-full ${isDark ? 'bg-indigo-400' : 'bg-indigo-500'} animate-ping animation-delay-1000`} />
                <div className={`absolute inset-0 w-full h-full rounded-full ${isDark ? 'bg-indigo-400' : 'bg-indigo-500'}`} />
            </div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                {threeStepsData.map((item, index) => (
                <div 
                    key={index} 
                    className="group animate-fade-in-up hover:animate-none" 
                    style={{ animationDelay: `${0.2 + index * 0.15}s` }}
                >
                    <div className={cn(
                    "relative p-8 sm:p-10 rounded-3xl transition-all duration-500 ease-out",
                    "hover:-translate-y-3 hover:scale-[1.02]",
                    isDark 
                        ? "bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 border border-neutral-700/50 hover:border-neutral-600/70 shadow-2xl shadow-black/20 hover:shadow-black/40" 
                        : "bg-gradient-to-br from-white to-gray-50/50 border border-gray-200/70 hover:border-gray-300 shadow-xl shadow-gray-500/10 hover:shadow-gray-500/20"
                    )}>
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5" />
                    
                    <div className="absolute -top-4 left-8">
                        <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                        "shadow-lg group-hover:shadow-xl group-hover:scale-110",
                        isDark 
                            ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white" 
                            : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                        )}>
                        {item.step}
                        </div>
                    </div>

                    <div className="relative mb-8 flex justify-center">
                        <div className={cn(
                        "w-24 h-24 rounded-2xl flex items-center justify-center transition-all duration-500 ease-out",
                        "group-hover:scale-110 group-hover:rotate-3",
                        "shadow-lg group-hover:shadow-2xl",
                        isDark 
                            ? "bg-gradient-to-br from-neutral-700/50 to-neutral-800/50 border border-neutral-600/50 group-hover:border-neutral-500" 
                            : "bg-gradient-to-br from-gray-50 to-white border border-gray-200 group-hover:border-gray-300"
                        )}>
                        <div className={cn(
                            "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                            "bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10"
                        )} />
                        
                        <item.Icon className={cn(
                            "w-12 h-12 transition-all duration-500 relative z-10",
                            "group-hover:scale-110",
                            index === 0 && (isDark ? "text-emerald-400 group-hover:text-emerald-300" : "text-emerald-500 group-hover:text-emerald-600"),
                            index === 1 && (isDark ? "text-blue-400 group-hover:text-blue-300" : "text-blue-500 group-hover:text-blue-600"),
                            index === 2 && (isDark ? "text-purple-400 group-hover:text-purple-300" : "text-purple-500 group-hover:text-purple-600")
                        )} />
                        
                        <div className={cn(
                            "absolute inset-0 rounded-2xl border-2 opacity-0 group-hover:opacity-100 transition-all duration-500",
                            "border-gradient-to-r animate-spin-slow", // This will now use the 8s duration from new hero
                            index === 0 && "border-emerald-500/30",
                            index === 1 && "border-blue-500/30", 
                            index === 2 && "border-purple-500/30"
                        )} />
                        </div>
                    </div>

                    <div className="text-center relative z-10">
                        <h3 className={cn(
                        "text-2xl sm:text-3xl font-bold mb-4 transition-colors duration-300",
                        themeClasses.text,
                        "group-hover:bg-gradient-to-r group-hover:from-indigo-500 group-hover:to-purple-500 group-hover:bg-clip-text group-hover:text-transparent"
                        )}>
                        {item.title}
                        </h3>
                        
                        <p className={cn(
                        "text-base sm:text-lg leading-relaxed transition-colors duration-300",
                        themeClasses.textMuted,
                        isDark ? "group-hover:text-neutral-300" : "group-hover:text-neutral-600"
                        )}>
                        {item.description}
                        </p>
                    </div>

                    <div className={cn(
                        "absolute bottom-0 left-8 right-8 h-1 rounded-full transition-all duration-500",
                        "opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0",
                        index === 0 && "bg-gradient-to-r from-emerald-500 to-teal-500",
                        index === 1 && "bg-gradient-to-r from-blue-500 to-indigo-500",
                        index === 2 && "bg-gradient-to-r from-purple-500 to-pink-500"
                    )} />
                    </div>

                    {index < threeStepsData.length - 1 && (
                    <div className="md:hidden flex justify-center mt-8 mb-4">
                        <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                        isDark 
                            ? "bg-neutral-800/50 border border-neutral-700/50" 
                            : "bg-white border border-gray-200 shadow-md"
                        )}>
                        <ArrowRight className={cn(
                            "w-5 h-5 transition-colors duration-300",
                            isDark ? "text-neutral-400" : "text-neutral-500"
                        )} />
                        </div>
                    </div>
                    )}
                </div>
                ))}
            </div>
            </div>

                <div className="text-center mt-20 sm:mt-24 animate-fade-in-up" style={{animationDelay: '0.8s'}}>
              {/* CORRECTED LINK COMPONENT BELOW */}
              <Link href="/sign-up" legacyBehavior passHref>
                <a 
                  className={cn(
                      "group relative inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 overflow-hidden text-white",
                      `bg-gradient-to-r ${ctaButtonBaseGradient}`,
                      "shadow-xl hover:shadow-2xl transform hover:-translate-y-1",
                      "focus:outline-none focus:ring-4",
                      isDark ? "focus:ring-purple-500/50" : "focus:ring-purple-600/40"
                  )}
                >
                  <div className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                      `bg-gradient-to-r ${ctaAnimatedBgGradient}`
                  )} />
                  
                  <span className="relative z-10 flex items-center">
                      Start Your Success Story
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  
                  <div className={cn(
                      "absolute inset-0 -top-2 -bottom-2 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out z-20",
                      `bg-gradient-to-r from-transparent ${ctaShineViaColor} to-transparent`
                  )} />
                </a>
              </Link>
            
              <p className={cn(
                  "mt-4 text-sm transition-colors duration-300",
                  themeClasses.textMuted
              )}>
                  Beat the Bots, Get the Job.
              </p>
            </div>
        </div>
      </section>

      {/* ======== PROFESSIONAL FOOTER ======== */}
      <footer className={cn(themeClasses.footerBg, "border-t", themeClasses.border, "transition-colors duration-300")}>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-8 xl:gap-12">
            {/* <div className="col-span-full lg:col-span-3 mb-6 lg:mb-0">
              <Link href="/" className="flex items-center space-x-2 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                  <MailCheckIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                  GetHired
                </span>
              </Link>
              <p className={cn("text-sm", themeClasses.textMuted, "mt-2 max-w-xs")}>
                Build resumes that dominate ATS systems and land your dream job faster.
              </p>
            </div> */}

            {/* {footerLinks.map((section, sectionIdx) => (
              <div key={section.title} className={cn(
                  "col-span-1", 
                  sectionIdx === 0 && "md:col-span-1 lg:col-span-2", // Product
                  sectionIdx === 1 && "md:col-span-1 lg:col-span-2", // Company
                  sectionIdx === 2 && "md:col-span-1 lg:col-span-2", // Resources
                  sectionIdx === 3 && "md:col-span-1 lg:col-span-2"  // Legal
                )}>
                <h3 className={cn("text-sm font-semibold tracking-wider uppercase", themeClasses.footerTextTitle)}>
                  {section.title}
                </h3>
                <ul role="list" className="mt-4 space-y-3">
                  {section.links.map((item) => (
                    <li key={item.name}>
                      <Link 
                        href={item.href} 
                        className={cn("text-sm", themeClasses.footerTextLink, "transition-colors duration-200")}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))} */}
          </div>

          <div className={cn("mt-10 pt-8 border-t", themeClasses.border, "md:flex md:items-center md:justify-between transition-colors duration-300")}>
            <div className="flex space-x-6 md:order-2">
              {socialMediaLinks.map((item) => (
                <a key={item.name} href={item.href} target="_blank" rel="noopener noreferrer" aria-label={item.ariaLabel}
                   className={cn(themeClasses.footerTextLink, "transition-colors duration-200")}>
                  <span className="sr-only">{item.name}</span>
                  <item.Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
            <p className={cn("mt-8 text-sm md:mt-0 md:order-1", themeClasses.footerTextCopyright)}>
              © {new Date().getFullYear()} GetHired. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

<style jsx>{`
  /* Styles from new hero section */
  @keyframes float { 
    0%, 100% { transform: translateY(0px) rotate(0deg); } 
    33% { transform: translateY(-8px) rotate(1deg); } 
    66% { transform: translateY(4px) rotate(-1deg); } 
  }
  @keyframes float-delayed { 
    0%, 100% { transform: translateY(0px) rotate(0deg); } 
    33% { transform: translateY(6px) rotate(-1deg); } 
    66% { transform: translateY(-10px) rotate(1deg); } 
  }
  @keyframes spin-slow { 
    from { transform: rotate(0deg); } 
    to { transform: rotate(360deg); } 
  }
  .animate-float { animation: float 6s ease-in-out infinite; }
  .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; animation-delay: 1s; }
  .animate-spin-slow { animation: spin-slow 8s linear infinite; } /* Updated duration from new hero */
  
  @keyframes gradient-x { 
    0%, 100% { background-position: 0% 50%; } 
    50% { background-position: 100% 50%; } 
  }
  .animate-gradient-x { 
    background-size: 200% 200%; 
    animation: gradient-x 3s ease infinite; 
  }
  @keyframes fade-in-up { 
    from { opacity: 0; transform: translateY(20px); } 
    to { opacity: 1; transform: translateY(0); } 
  }
  .animate-fade-in-up { 
    animation: fade-in-up 0.6s ease-out forwards; 
  }

  /* Preserved styles from original that were not in the new hero's specific style block */
  @keyframes pulse-gentle { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } }
  .animate-pulse-gentle { animation: pulse-gentle 3s ease-in-out infinite; }

  @keyframes gradient-shift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
  .animate-gradient-shift { background-size: 200% 200%; animation: gradient-shift 4s ease infinite; }
  
  .group:hover .animate-ping { animation-duration: 0.5s; }

  /* Utility class, definition is the same in both, kept for clarity */
  .animation-delay-1000 { animation-delay: 1s; }
`}</style>
    </div>
  );
};

export default LandingPageContent;