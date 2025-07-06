import React from 'react';

// Define a type for our tech stack items
interface TechStackItem {
  name: string;
  displayName?: string;
  category?: string;
}

const SlidingTechStack = () => {
  // Using a simple dark theme for demonstration
  const isDark = true;

  const themeClasses = {
    bg: isDark 
      ? 'bg-black' 
      : 'bg-white',
    textMuted: isDark ? 'text-gray-400' : 'text-gray-600',
    textPrimary: isDark ? 'text-white' : 'text-gray-900',
    cardBg: isDark ? 'bg-gray-900/50' : 'bg-gray-50',
    border: isDark ? 'border-gray-800' : 'border-gray-200',
  };

  // Define your tech stack data
  const techStack: TechStackItem[] = [
    { name: 'Next.js', displayName: 'Next.js', category: 'framework' },
    { name: 'TypeScript', displayName: 'TypeScript', category: 'language' },
    { name: 'Google Gemini', displayName: 'Gemini AI', category: 'ai' },
    { name: 'LangChain', displayName: 'LangChain', category: 'ai' },
    { name: 'NextAuth.js', displayName: 'NextAuth.js', category: 'auth' },
    { name: 'Prisma', displayName: 'Prisma', category: 'database' },
    { name: 'PostgreSQL', displayName: 'PostgreSQL', category: 'database' },
    { name: 'Tailwind CSS', displayName: 'Tailwind', category: 'styling' },
    { name: 'Zustand', displayName: 'Zustand', category: 'state' },
  ];

  return (
    <section className={`${themeClasses.bg} py-16 sm:py-20 relative overflow-hidden`}>
      {/* Subtle grid pattern background */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} 
        />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full mb-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse" />
            <span className={`text-sm font-medium ${themeClasses.textMuted}`}>
              Enterprise-Grade Technology Stack
            </span>
          </div>
          
          <p className={`text-lg max-w-3xl mx-auto leading-relaxed ${themeClasses.textMuted}`}>
            Our platform leverages cutting-edge technologies and frameworks trusted by Fortune 500 companies 
            to deliver unmatched performance, security, and scalability.
          </p>
        </div>
        
        {/* Tech stack slider - Much faster animation */}
        <div className="relative group mb-16">
          <div className="flex animate-slide-fast items-center will-change-transform">
            {[...techStack, ...techStack, ...techStack].map((tech, index) => (
              <div 
                key={`${tech.name}-${index}`} 
                title={tech.name}
                className="flex-shrink-0 mx-6 sm:mx-8 lg:mx-10 group/item cursor-pointer transition-transform duration-300 hover:scale-110"
              >
                <div className="px-6 py-3 rounded-xl transition-all duration-300 border border-transparent hover:border-blue-500/30 hover:bg-blue-500/5 backdrop-blur-sm">
                  <span className="text-xl sm:text-2xl lg:text-3xl font-semibold bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent whitespace-nowrap font-inter tracking-tight">
                    {tech.displayName || tech.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slide-fast {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%); 
          }
        }
        
        .animate-slide-fast {
          animation: slide-fast 15s linear infinite; 
        }
        
        /* Pause animation on hover */
        .relative.group:hover .animate-slide-fast { 
          animation-play-state: paused;
        }
        
        /* Performance optimizations */
        .will-change-transform {
          will-change: transform;
        }
        
        /* Smooth backdrop blur */
        .backdrop-blur-sm {
          backdrop-filter: blur(4px);
        }
      `}</style>
    </section>
  );
};

export default SlidingTechStack;