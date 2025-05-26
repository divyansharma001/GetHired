import React from 'react';
import { useTheme } from '@/context/theme-provider';
import { cn } from '@/lib/utils';

// Define a type for our tech stack items
interface TechStackItem {
  name: string;
  displayName?: string;
  category?: string;
}

const SlidingTechStack = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
    { name: 'Clerk', displayName: 'Clerk', category: 'auth' },
    { name: 'Prisma', displayName: 'Prisma', category: 'database' },
    { name: 'PostgreSQL', displayName: 'PostgreSQL', category: 'database' },
    { name: 'Tailwind CSS', displayName: 'Tailwind', category: 'styling' },
    { name: 'Zustand', displayName: 'Zustand', category: 'state' },
  ];

  return (
    <section className={cn(
        themeClasses.bg,
        "py-16 sm:py-20 relative overflow-hidden"
      )}
    >
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
        {/* Header section matching your landing page style */}
        <div className="text-center mb-16">
          <div className={cn(
            "inline-flex items-center px-4 py-2 rounded-full mb-6",
            "bg-gradient-to-r from-blue-500/10 to-purple-500/10",
            "border border-blue-500/20 backdrop-blur-sm"
          )}>
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse" />
            <span className={cn(
              "text-sm font-medium",
              themeClasses.textMuted
            )}>
              Enterprise-Grade Technology Stack
            </span>
          </div>
          
          {/* <h2 className={cn(
            "text-3xl sm:text-4xl lg:text-5xl font-bold mb-6",
            themeClasses.textPrimary
          )}>
            Built with technologies that{' '}
            <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
              power enterprise solutions
            </span>
          </h2> */}
          
          <p className={cn(
            "text-lg max-w-3xl mx-auto leading-relaxed",
            themeClasses.textMuted
          )}>
            Our platform leverages cutting-edge technologies and frameworks trusted by Fortune 500 companies 
            to deliver unmatched performance, security, and scalability.
          </p>
        </div>
        
        {/* Tech stack slider */}
        <div className="relative group mb-16">
          <div className="flex animate-slide items-center">
            {[...techStack, ...techStack].map((tech, index) => (
              <div 
                key={`${tech.name}-${index}`} 
                title={tech.name}
                className={cn(
                  "flex-shrink-0 mx-8 sm:mx-10 lg:mx-12",
                  "group/item cursor-pointer transition-all duration-500",
                  "hover:scale-110"
                )}
              >
                <div className={cn(
                  "px-6 py-3 rounded-xl transition-all duration-500",
                  "border border-transparent",
                  "hover:border-blue-500/30 hover:bg-blue-500/5",
                  "backdrop-blur-sm"
                )}>
                  <span className={cn(
                    "text-xl sm:text-2xl lg:text-3xl font-semibold",
                    "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent",
                    "transition-all duration-500",
                    "whitespace-nowrap font-inter tracking-tight",
                    "group-hover/item:tracking-wide"
                  )}>
                    {tech.displayName || tech.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Stats section similar to your landing page */}
        {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { 
              value: "99.9%", 
              label: "Uptime", 
              icon: "📈",
              color: "text-green-400"
            },
            { 
              value: "50ms", 
              label: "Response Time", 
              icon: "⚡",
              color: "text-blue-400"
            },
            { 
              value: "10M+", 
              label: "Requests/Day", 
              icon: "🚀",
              color: "text-purple-400"
            },
            { 
              value: "A+", 
              label: "Security Grade", 
              icon: "🛡️",
              color: "text-yellow-400"
            }
          ].map((stat, index) => (
            <div 
              key={index}
              className={cn(
                "text-center p-6 rounded-2xl",
                themeClasses.cardBg,
                themeClasses.border,
                "border transition-all duration-300",
                "hover:border-blue-500/30 hover:bg-blue-500/5"
              )}
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className={cn(
                "text-2xl sm:text-3xl font-bold mb-1",
                stat.color
              )}>
                {stat.value}
              </div>
              <div className={cn(
                "text-sm font-medium",
                themeClasses.textMuted
              )}>
                {stat.label}
              </div>
            </div>
          ))}
        </div> */}
      </div>
      
      <style jsx>{`
        @keyframes slide {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%); 
          }
        }
        
        .animate-slide {
          animation: slide 50s linear infinite; 
        }
        
        /* Pause animation on hover */
        .relative.group:hover .animate-slide { 
          animation-play-state: paused;
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