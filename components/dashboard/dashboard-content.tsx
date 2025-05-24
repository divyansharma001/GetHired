'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Plus, FileText, Download, Calendar, Star, MoreVertical, Sparkles, Sun, Moon, Briefcase, TrendingUp, DownloadCloud, BarChart3 } from 'lucide-react';
import { useTheme } from '@/context/theme-provider'; // Assuming you have this

// Mock data - replace with actual API call and types
interface Resume {
  id: string;
  title: string;
  atsScore: number;
  updatedAt: string;
  status: 'draft' | 'completed';
}

interface DashboardContentProps {
  userId: string;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ userId }) => {
  const { theme, toggleTheme } = useTheme();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  const isDark = theme === 'dark';

  // Consistent theme classes, similar to LandingPage
  const themeClasses = {
    bg: isDark ? 'bg-gray-900' : 'bg-gray-50', // Main background
    bgAlt: isDark ? 'bg-gray-800' : 'bg-gray-100', // Slightly different bg, e.g., for header or sections
    text: isDark ? 'text-white' : 'text-gray-900',
    textMuted: isDark ? 'text-gray-300' : 'text-gray-600',
    textMuted2: isDark ? 'text-gray-400' : 'text-gray-500',
    border: isDark ? 'border-gray-700' : 'border-gray-200',
    cardBg: isDark ? 'bg-gray-800/60 backdrop-blur-md' : 'bg-white/80 backdrop-blur-md', // Card background with blur
    cardBorderHover: isDark ? 'hover:border-blue-500/70' : 'hover:border-blue-500/70',
    accentGradient: 'bg-gradient-to-r from-blue-600 to-purple-600',
    accentHover: 'hover:from-blue-700 hover:to-purple-700',
    buttonOutline: isDark ? 'border-gray-600 hover:bg-gray-700/50' : 'border-gray-300 hover:bg-gray-200/50',
    buttonGhost: isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-200/50',
    inputBg: isDark ? 'bg-gray-700/50' : 'bg-gray-100',
  };
  

  useEffect(() => {
    // Mock data fetching
    const mockResumes: Resume[] = [
      { id: '1', title: 'Software Engineer Pro', atsScore: 88, updatedAt: '2024-07-15', status: 'completed' },
      { id: '2', title: 'UX Designer Portfolio Resume', atsScore: 75, updatedAt: '2024-07-12', status: 'draft' },
      { id: '3', title: 'Marketing Manager Application', atsScore: 92, updatedAt: '2024-07-10', status: 'completed' },
    ];
    setTimeout(() => {
      setResumes(mockResumes);
      setLoading(false);
    }, 1000);
  }, [userId]);

  const getScoreColorText = (score: number) => {
    if (score >= 80) return isDark ? 'text-green-400' : 'text-green-600';
    if (score >= 60) return isDark ? 'text-yellow-400' : 'text-yellow-500';
    return isDark ? 'text-red-400' : 'text-red-500';
  };

  const getScoreBgClass = (score: number) => {
    if (score >= 80) return isDark ? 'bg-green-500/20 border-green-500/30' : 'bg-green-100 border-green-200';
    if (score >= 60) return isDark ? 'bg-yellow-500/20 border-yellow-500/30' : 'bg-yellow-100 border-yellow-200';
    return isDark ? 'bg-red-500/20 border-red-500/30' : 'bg-red-100 border-red-200';
  };
  
  const statIcons = [
    <Briefcase key="total" className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />,
    <BarChart3 key="avg" className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />,
    <DownloadCloud key="downloads" className={`w-6 h-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
  ];

  return (
    <div className={`min-h-screen ${themeClasses.bg} transition-colors duration-300`}>
      {/* New Header */}
      <header className={`${themeClasses.bgAlt} ${themeClasses.border} border-b shadow-sm sticky top-0 z-40`}>
        <div className="max-w-full mx-auto px-6 py-3.5"> {/* Adjusted padding for full width */}
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className={`text-xl font-bold ${themeClasses.text} hidden sm:inline`}>
                ResumeAI Pro
              </span>
               <span className={`text-xl font-normal ${themeClasses.textMuted2} hidden md:inline`}>/ Dashboard</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={toggleTheme}
                className={`p-2 rounded-lg ${themeClasses.textMuted} hover:${themeClasses.text} ${themeClasses.buttonGhost} transition-colors`}
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 shadow-md",
                    userButtonPopoverCard: `${themeClasses.cardBg} ${themeClasses.border} border`,
                  }
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { title: 'Total Resumes', value: resumes.length, change: '+2 this month', icon: statIcons[0] },
            { title: 'Avg. ATS Score', value: resumes.length > 0 ? Math.round(resumes.reduce((sum, r) => sum + r.atsScore, 0) / resumes.length) : 0, change: '+12% improvement', icon: statIcons[1], unit: '%' },
            { title: 'Downloads', value: 8, change: 'Last 30 days', icon: statIcons[2] }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ].map((stat, index) => (
            <div key={stat.title} className={`${themeClasses.cardBg} p-6 rounded-xl border ${themeClasses.border} ${themeClasses.cardBorderHover} transition-all duration-300 shadow-lg hover:shadow-xl`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-sm font-medium ${themeClasses.textMuted}`}>{stat.title}</h3>
                {stat.icon}
              </div>
              <p className={`text-3xl font-bold ${themeClasses.text}`}>{stat.value}{stat.unit}</p>
              <p className={`text-xs ${stat.change.startsWith('+') ? (isDark ? 'text-green-400' : 'text-green-600') : themeClasses.textMuted2} mt-1`}>
                {stat.change}
              </p>
            </div>
          ))}
        </div>

        {/* Resumes Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className={`text-3xl font-bold ${themeClasses.text}`}>Your Resumes</h2>
            <p className={`${themeClasses.textMuted} mt-1`}>Manage and create your AI-powered resumes.</p>
          </div>
          <Link href="/dashboard/create-resume" passHref>
            <button className={`${themeClasses.accentGradient} ${themeClasses.accentHover} text-white px-6 py-3 rounded-xl font-semibold flex items-center transition-all duration-200 shadow-lg hover:shadow-purple-500/30 transform hover:-translate-y-0.5`}>
              <Plus className="w-5 h-5 mr-2" />
              Create New Resume
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`${themeClasses.cardBg} p-6 rounded-xl border ${themeClasses.border} animate-pulse shadow-lg`}>
                <div className={`h-5 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded w-3/4 mb-4`}></div>
                <div className={`h-3 ${isDark ? 'bg-gray-600' : 'bg-gray-200'} rounded w-1/2 mb-6`}></div>
                <div className={`h-10 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded`}></div>
              </div>
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <div className={`${themeClasses.cardBg} text-center py-16 px-6 rounded-xl border ${themeClasses.border} shadow-xl`}>
            <FileText className={`w-16 h-16 ${themeClasses.textMuted2} mx-auto mb-6`} />
            <h3 className={`text-2xl font-semibold ${themeClasses.text} mb-3`}>No Resumes Yet</h3>
            <p className={`${themeClasses.textMuted} mb-8 max-w-md mx-auto`}>
              It looks like you haven&apos;t created any resumes. Let&apos;s build your first one and unlock your career potential!
            </p>
            <Link href="/dashboard/create-resume" passHref>
              <button className={`${themeClasses.accentGradient} ${themeClasses.accentHover} text-white px-8 py-3.5 rounded-xl font-semibold text-lg`}>
                <Plus className="w-5 h-5 mr-2 inline-block" />
                Create Your First Resume
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <div key={resume.id} className={`${themeClasses.cardBg} rounded-xl border ${themeClasses.border} ${themeClasses.cardBorderHover} transition-all duration-300 shadow-lg hover:shadow-2xl flex flex-col`}>
                <div className="p-6 flex-grow">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className={`text-lg font-semibold ${themeClasses.text} group-hover:text-purple-400 transition-colors`}>
                      {resume.title}
                    </h4>
                    {/* Simple Dropdown for More Options - to be implemented if needed */}
                    <button className={`p-1.5 rounded ${themeClasses.buttonGhost} ${themeClasses.textMuted2}`}>
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-3 mb-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getScoreBgClass(resume.atsScore)} ${getScoreColorText(resume.atsScore)}`}>
                      <Star className="w-3 h-3 mr-1.5" />
                      {resume.atsScore}% ATS Score
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                      resume.status === 'completed' 
                        ? (isDark ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-green-100 text-green-700 border-green-300')
                        : (isDark ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' : 'bg-yellow-100 text-yellow-700 border-yellow-300')
                    }`}>
                      {resume.status === 'completed' ? 'Completed' : 'Draft'}
                    </span>
                  </div>

                  <div className={`flex items-center text-xs ${themeClasses.textMuted2} space-x-1.5`}>
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Updated: {new Date(resume.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className={`border-t ${themeClasses.border} p-4 flex space-x-3`}>
                  <Link href={`/dashboard/resume/${resume.id}`} className="flex-1">
                    <button className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center ${themeClasses.text} ${themeClasses.buttonOutline} transition-colors`}>
                      <FileText className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                  </Link>
                  <button className={`px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center ${themeClasses.text} ${themeClasses.buttonOutline} transition-colors`}>
                    <Download className="w-4 h-4" />
                    {/* Consider adding text "Download" for clarity on larger screens */}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardContent;