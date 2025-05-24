// components/dashboard/dashboard-content.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { 
    Plus, FileText, Download, Calendar, Star, Sparkles, Sun, Moon, 
    Briefcase, BarChart3, DownloadCloud, Loader2, Trash2, Edit3, AlertTriangle 
} from 'lucide-react'; // Ensure AlertTriangle and Edit3 are imported
import { useTheme } from '@/context/theme-provider';
import { useResumeStore } from '@/hooks/use-resume';

interface ResumeFromApi {
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
  const [resumes, setResumes] = useState<ResumeFromApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const resetResumeInStore = useResumeStore(state => state.resetResume);

  const isDark = theme === 'dark';
  const themeClasses = { 
    bg: isDark ? 'bg-gray-900' : 'bg-gray-50',
    bgAlt: isDark ? 'bg-gray-800' : 'bg-gray-100',
    text: isDark ? 'text-white' : 'text-gray-900',
    textMuted: isDark ? 'text-gray-300' : 'text-gray-600',
    textMuted2: isDark ? 'text-gray-400' : 'text-gray-500',
    border: isDark ? 'border-gray-700' : 'border-gray-200',
    cardBg: isDark ? 'bg-gray-800/60 backdrop-blur-md' : 'bg-white/80 backdrop-blur-md',
    cardBorderHover: isDark ? 'hover:border-blue-500/70' : 'hover:border-blue-500/70',
    accentGradient: 'bg-gradient-to-r from-blue-600 to-purple-600',
    accentHover: 'hover:from-blue-700 hover:to-purple-700',
    buttonOutline: isDark ? 'border-gray-600 hover:bg-gray-700/50' : 'border-gray-300 hover:bg-gray-200/50',
    buttonGhost: isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-200/50',
  };

  const fetchResumes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/resumes');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to fetch resumes: ${response.statusText}`);
      }
      const data: ResumeFromApi[] = await response.json();
      setResumes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching resumes.');
      setResumes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) { // Only fetch if userId is available
        fetchResumes();
    }
  }, [userId, fetchResumes]);

  const handleCreateNewClick = () => {
    if (userId) {
      resetResumeInStore(userId);
    }
  };

  const handleDeleteResume = async (resumeId: string, resumeTitle: string) => {
    if (!confirm(`Are you sure you want to delete the resume titled "${resumeTitle}"? This action cannot be undone.`)) {
      return;
    }
    try {
      const response = await fetch(`/api/resumes/${resumeId}`, { method: 'DELETE' });
      if (!response.ok) {
        // Try to parse error message from backend if available
        let errorMsg = `Failed to delete resume: ${response.statusText}`;
        try {
            const errorData = await response.json();
            if (errorData && errorData.message) {
                errorMsg = errorData.message;
            }
        } catch (e) {
          console.error("Failed to parse error response:", e);
            // Ignore if parsing error response fails, use default message
        }
        throw new Error(errorMsg);
      }
      // Update UI: Filter out the deleted resume from the local state
      setResumes(prevResumes => prevResumes.filter(r => r.id !== resumeId));
      alert('Resume deleted successfully.'); // Replace with a more subtle toast notification
    } catch (err) {
      console.error("Error deleting resume:", err);
      alert(`Error deleting resume: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const getScoreColorText = (score: number) => { /* ... */ 
    if (score >= 80) return isDark ? 'text-green-400' : 'text-green-600';
    if (score >= 60) return isDark ? 'text-yellow-400' : 'text-yellow-500';
    return isDark ? 'text-red-400' : 'text-red-500';
  };
  const getScoreBgClass = (score: number) => { /* ... */ 
    if (score >= 80) return isDark ? 'bg-green-500/20 border-green-500/30' : 'bg-green-100 border-green-200';
    if (score >= 60) return isDark ? 'bg-yellow-500/20 border-yellow-500/30' : 'bg-yellow-100 border-yellow-200';
    return isDark ? 'bg-red-500/20 border-red-500/30' : 'bg-red-100 border-red-200';
  };
  const statIcons = [ /* ... */ 
    <Briefcase key="total" className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />,
    <BarChart3 key="avg" className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />,
    <DownloadCloud key="downloads" className={`w-6 h-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
  ];

  // Loading and Error States (condensed for brevity, keep your full versions)
  if (loading) {
    return (
      <div className={`min-h-screen ${themeClasses.bg} flex flex-col`}>
        <header className={`${themeClasses.bgAlt} ${themeClasses.border} border-b shadow-sm sticky top-0 z-40`}> {/* Header */}
            <div className="max-w-full mx-auto px-6 py-3.5"><div className="flex items-center justify-between"><Link href="/dashboard" className="flex items-center space-x-3"><div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md"><Sparkles className="w-4 h-4 text-white" /></div><span className={`text-xl font-bold ${themeClasses.text} hidden sm:inline`}>ResumeAI Pro</span><span className={`text-xl font-normal ${themeClasses.textMuted2} hidden md:inline`}>/ Dashboard</span></Link><div className="flex items-center space-x-4"><button onClick={toggleTheme} className={`p-2 rounded-lg ${themeClasses.textMuted} hover:${themeClasses.text} ${themeClasses.buttonGhost} transition-colors`} aria-label="Toggle theme">{isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button><UserButton appearance={{elements: {avatarBox: "w-9 h-9 shadow-md", userButtonPopoverCard: `${themeClasses.cardBg} ${themeClasses.border} border`}}}/></div></div></div>
        </header>
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className={`w-12 h-12 ${themeClasses.text} animate-spin`} />
        </div>
      </div>
    );
  }
  if (error) {
    return (
        <div className={`min-h-screen ${themeClasses.bg} flex flex-col`}>
            <header className={`${themeClasses.bgAlt} ${themeClasses.border} border-b shadow-sm sticky top-0 z-40`}> {/* Header */}
                <div className="max-w-full mx-auto px-6 py-3.5"><div className="flex items-center justify-between"><Link href="/dashboard" className="flex items-center space-x-3"><div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md"><Sparkles className="w-4 h-4 text-white" /></div><span className={`text-xl font-bold ${themeClasses.text} hidden sm:inline`}>ResumeAI Pro</span><span className={`text-xl font-normal ${themeClasses.textMuted2} hidden md:inline`}>/ Dashboard</span></Link><div className="flex items-center space-x-4"><button onClick={toggleTheme} className={`p-2 rounded-lg ${themeClasses.textMuted} hover:${themeClasses.text} ${themeClasses.buttonGhost} transition-colors`} aria-label="Toggle theme">{isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button><UserButton appearance={{elements: {avatarBox: "w-9 h-9 shadow-md", userButtonPopoverCard: `${themeClasses.cardBg} ${themeClasses.border} border`}}}/></div></div></div>
            </header>
            <div className="flex-grow flex flex-col items-center justify-center text-center px-4">
                <AlertTriangle className={`w-16 h-16 ${isDark ? 'text-red-400' : 'text-red-500'} mb-4`} />
                <h2 className={`text-2xl font-semibold ${themeClasses.text} mb-2`}>Oops! Something went wrong.</h2>
                <p className={`${themeClasses.textMuted} mb-6`}>{error}</p>
                <button onClick={fetchResumes} className={`${themeClasses.accentGradient} ${themeClasses.accentHover} text-white px-6 py-2.5 rounded-xl font-semibold`}>Try Again</button>
            </div>
        </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeClasses.bg} transition-colors duration-300`}>
      {/* Header ... (same as above) */}
      <header className={`${themeClasses.bgAlt} ${themeClasses.border} border-b shadow-sm sticky top-0 z-40`}>
        <div className="max-w-full mx-auto px-6 py-3.5">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className={`text-xl font-bold ${themeClasses.text} hidden sm:inline`}>ResumeAI Pro</span>
               <span className={`text-xl font-normal ${themeClasses.textMuted2} hidden md:inline`}>/ Dashboard</span>
            </Link>
            <div className="flex items-center space-x-4">
              <button onClick={toggleTheme} className={`p-2 rounded-lg ${themeClasses.textMuted} hover:${themeClasses.text} ${themeClasses.buttonGhost} transition-colors`} aria-label="Toggle theme">
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <UserButton appearance={{elements: {avatarBox: "w-9 h-9 shadow-md", userButtonPopoverCard: `${themeClasses.cardBg} ${themeClasses.border} border`}}}/>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards ... (same as before, ensure values are dynamic) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { title: 'Total Resumes', value: resumes.length, change: `+${resumes.filter(r => new Date(r.updatedAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000).length} this month`, icon: statIcons[0] },
            { title: 'Avg. ATS Score', value: resumes.length > 0 ? Math.round(resumes.reduce((sum, r) => sum + r.atsScore, 0) / resumes.length) : 0, change: resumes.length > 0 ? 'Based on current' : 'N/A', icon: statIcons[1], unit: '%' },
            { title: 'Downloads', value: 0, change: 'Feature pending', icon: statIcons[2] }
          ].map((stat) => (
            <div key={stat.title} className={`${themeClasses.cardBg} p-6 rounded-xl border ${themeClasses.border} ${themeClasses.cardBorderHover} transition-all duration-300 shadow-lg hover:shadow-xl`}>
              <div className="flex items-center justify-between mb-3"> <h3 className={`text-sm font-medium ${themeClasses.textMuted}`}>{stat.title}</h3> {stat.icon} </div>
              <p className={`text-3xl font-bold ${themeClasses.text}`}>{stat.value}{stat.unit || ''}</p>
              <p className={`text-xs ${stat.change.startsWith('+') || stat.change.includes('current') ? (isDark ? 'text-green-400' : 'text-green-600') : themeClasses.textMuted2} mt-1`}>{stat.change}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-8">
          <div> <h2 className={`text-3xl font-bold ${themeClasses.text}`}>Your Resumes</h2> <p className={`${themeClasses.textMuted} mt-1`}>Manage and create your AI-powered resumes.</p> </div>
          <Link href="/dashboard/create-resume" passHref>
            <button onClick={handleCreateNewClick} className={`${themeClasses.accentGradient} ${themeClasses.accentHover} text-white px-6 py-3 rounded-xl font-semibold flex items-center transition-all duration-200 shadow-lg hover:shadow-purple-500/30 transform hover:-translate-y-0.5`}>
              <Plus className="w-5 h-5 mr-2" /> Create New Resume
            </button>
          </Link>
        </div>

        {resumes.length === 0 ? ( /* Empty state ... (same as before) */ 
          <div className={`${themeClasses.cardBg} text-center py-16 px-6 rounded-xl border ${themeClasses.border} shadow-xl`}>
            <FileText className={`w-16 h-16 ${themeClasses.textMuted2} mx-auto mb-6`} />
            <h3 className={`text-2xl font-semibold ${themeClasses.text} mb-3`}>No Resumes Yet</h3>
            <p className={`${themeClasses.textMuted} mb-8 max-w-md mx-auto`}>It looks like you haven&apos;t created any resumes. Let&apos;s build your first one and unlock your career potential!</p>
            <Link href="/dashboard/create-resume" passHref><button onClick={handleCreateNewClick} className={`${themeClasses.accentGradient} ${themeClasses.accentHover} text-white px-8 py-3.5 rounded-xl font-semibold text-lg`}><Plus className="w-5 h-5 mr-2 inline-block" />Create Your First Resume</button></Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <div key={resume.id} className={`${themeClasses.cardBg} rounded-xl border ${themeClasses.border} ${themeClasses.cardBorderHover} transition-all duration-300 shadow-lg hover:shadow-2xl flex flex-col`}>
                <div className="p-6 flex-grow">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className={`text-lg font-semibold ${themeClasses.text} group-hover:text-purple-400 transition-colors truncate`}>
                      {resume.title}
                    </h4>
                    {/* Delete Button */}
                    <button 
                        onClick={() => handleDeleteResume(resume.id, resume.title)} // Pass resume.title for confirm dialog
                        title="Delete Resume"
                        className={`p-1.5 rounded ${themeClasses.buttonGhost} text-red-500/70 hover:text-red-500 hover:bg-red-500/10`} // Specific styling for delete
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {/* ... (ATS Score and Status badges remain the same) ... */}
                  <div className="flex items-center space-x-3 mb-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getScoreBgClass(resume.atsScore)} ${getScoreColorText(resume.atsScore)}`}>
                      <Star className="w-3 h-3 mr-1.5" /> {resume.atsScore}% ATS
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${resume.status === 'completed' ? (isDark ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-green-100 text-green-700 border-green-300') : (isDark ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' : 'bg-yellow-100 text-yellow-700 border-yellow-300')}`}>
                      {resume.status.charAt(0).toUpperCase() + resume.status.slice(1)}
                    </span>
                  </div>
                  <div className={`flex items-center text-xs ${themeClasses.textMuted2} space-x-1.5`}>
                    <Calendar className="w-3.5 h-3.5" /> <span>Updated: {new Date(resume.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className={`border-t ${themeClasses.border} p-4 flex space-x-3`}>
                  <Link href={`/dashboard/create-resume?resumeId=${resume.id}`} className="flex-1"> 
                    <button className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center ${themeClasses.text} ${themeClasses.buttonOutline} transition-colors`}>
                      <Edit3 className="w-4 h-4 mr-2" /> Edit
                    </button>
                  </Link>
                  <button title="Download PDF (coming soon)" disabled className={`px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center ${themeClasses.text} ${themeClasses.buttonOutline} transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}>
                    <Download className="w-4 h-4" />
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