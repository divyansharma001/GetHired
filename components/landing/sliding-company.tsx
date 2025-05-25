import React from 'react';
import { useTheme } from '@/context/theme-provider';

const SlidingCompanies = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Refined theme classes for a more professional and "black" dark mode
  const themeClasses = {
    // Dark Mode: Aiming for a deep, almost black background with subtle contrasts
    // Light Mode: Clean, high-contrast professional look
    bgAlt: isDark ? 'bg-gray-900' : 'bg-white', // Dark: pure black; Light: pure white
    border: isDark ? 'border-neutral-800' : 'border-neutral-200', // Dark: subtle dark border; Light: subtle light border
    textMuted: isDark ? 'text-neutral-400' : 'text-neutral-500', // Dark: readable muted on black; Light: standard muted
    text: isDark ? 'text-neutral-200' : 'text-neutral-800', // Dark: light gray for company names; Light: dark gray for company names
  };

  const companies = ['Google', 'Microsoft', 'Apple', 'Amazon', 'Netflix', 'Meta', 'Tesla', 'Oracle']; // Added a couple more for better visual fill
  
  return (
    <section className={`${themeClasses.bgAlt} py-16 border-y ${themeClasses.border} overflow-hidden transition-colors duration-500 ease-in-out`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <p className={`text-center ${themeClasses.textMuted} mb-10 text-sm font-medium tracking-wide transition-colors duration-500 ease-in-out`}>
          TRUSTED BY INNOVATORS AT GLOBAL LEADERS
        </p>
        
        <div className="relative">
          <div className="flex animate-slide items-center"> {/* Added items-center for vertical alignment if font sizes differ slightly */}
            {/* First set of companies */}
            {companies.map((company, index) => (
              <div 
                key={`first-${index}`} 
                className={`flex-shrink-0 mx-10 sm:mx-14 text-xl sm:text-2xl font-semibold ${themeClasses.text} hover:opacity-100 transition-all duration-300 cursor-default opacity-70 group-hover:opacity-100`}
              >
                {company}
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {companies.map((company, index) => (
              <div 
                key={`second-${index}`} 
                className={`flex-shrink-0 mx-10 sm:mx-14 text-xl sm:text-2xl font-semibold ${themeClasses.text} hover:opacity-100 transition-all duration-300 cursor-default opacity-70 group-hover:opacity-100`}
              >
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slide {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%); /* Adjust if total width of companies changes significantly */
          }
        }
        
        .animate-slide {
          animation: slide 30s linear infinite; /* Increased duration for smoother, slower scroll */
        }
        
        /* Consider pausing on hover of the entire track, not just individual items */
        .relative:hover .animate-slide { 
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default SlidingCompanies;