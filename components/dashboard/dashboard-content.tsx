// components/dashboard/dashboard-content.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { 
    Plus, FileText, Download, Calendar, Star, Sparkles, Sun, Moon, 
    Briefcase, BarChart3, DownloadCloud, Loader2, Trash2, Edit3, AlertTriangle 
} from 'lucide-react';
import { useTheme } from '@/context/theme-provider';
import { useResumeStore } from '@/hooks/use-resume';
import { Button } from '@/components/ui/button';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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

  // Theme classes derived from the current theme state
  // In a larger app, this logic might be part of a more centralized theme configuration utility
  const appTheme = {
    pageBg: isDark ? 'bg-neutral-950' : 'bg-slate-100',
    headerBg: isDark ? 'bg-neutral-900/80 backdrop-blur-md' : 'bg-white/80 backdrop-blur-md',
    textHeading: isDark ? 'text-neutral-100' : 'text-neutral-800',
    textBody: isDark ? 'text-neutral-300' : 'text-neutral-700', // Slightly softer than heading
    textMuted: isDark ? 'text-neutral-400' : 'text-neutral-500',
    textMuted2: isDark ? 'text-neutral-500' : 'text-neutral-400',
    borderPrimary: isDark ? 'border-neutral-700' : 'border-neutral-300',
    borderSecondary: isDark ? 'border-neutral-800' : 'border-neutral-200/70',
    iconColor: isDark ? 'text-neutral-400' : 'text-neutral-500',
    iconAccentColor: isDark ? 'text-blue-400' : 'text-blue-600',
    // Specific button text colors (if not covered by Button variants)
    buttonGhostText: isDark ? 'text-neutral-400 hover:text-neutral-100' : 'text-neutral-500 hover:text-neutral-900',
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
    if (userId) {
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
        let errorMsg = `Failed to delete resume: ${response.statusText}`;
        try {
            const errorData = await response.json();
            if (errorData && errorData.message) {
                errorMsg = errorData.message;
            }
        } catch (e) { console.error("Failed to parse error response:", e); }
        throw new Error(errorMsg);
      }
      setResumes(prevResumes => prevResumes.filter(r => r.id !== resumeId));
      // TODO: Replace with a toast notification
      alert('Resume deleted successfully.'); 
    } catch (err) {
      console.error("Error deleting resume:", err);
      alert(`Error deleting resume: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  const getScoreColorText = (score: number) => {
    if (score >= 80) return isDark ? 'text-green-400' : 'text-green-600';
    if (score >= 60) return isDark ? 'text-yellow-400' : 'text-yellow-500';
    return isDark ? 'text-red-400' : 'text-red-500';
  };

  const getScoreBgClass = (score: number) => {
    if (score >= 80) return isDark ? 'bg-green-500/10 border-green-500/20' : 'bg-green-100 border-green-200';
    if (score >= 60) return isDark ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-yellow-100 border-yellow-200';
    return isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-100 border-red-200';
  };

  const statIcons = [
    <Briefcase key="total" className={`w-6 h-6 ${appTheme.iconAccentColor}`} />,
    <BarChart3 key="avg" className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />,
    <DownloadCloud key="downloads" className={`w-6 h-6 ${isDark ? 'text-teal-400' : 'text-teal-500'}`} />
  ];

  const StatCard: React.FC<{title: string, value: string | number, change: string, icon: React.ReactNode, unit?: string}> = ({ title, value, change, icon, unit }) => (
    <Card className="p-5 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"> {/* Uses themed Card */}
      <CardHeader className="p-0 mb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className={cn("text-sm font-medium", appTheme.textMuted)}>{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="p-0">
        <div className={cn("text-2xl sm:text-3xl font-bold", appTheme.textHeading)}>{value}{unit || ''}</div>
        <p className={cn(`text-xs mt-1`, change.startsWith('+') || change.includes('current') ? (isDark ? 'text-green-400' : 'text-green-600') : appTheme.textMuted2)}>
          {change}
        </p>
      </CardContent>
    </Card>
  );

  // Loading State
  if (loading) {
    return (
      <div className={cn("min-h-screen flex flex-col", appTheme.pageBg)}>
        <header className={cn("sticky top-0 z-40 border-b shadow-sm", appTheme.headerBg, appTheme.borderPrimary)}>
            <div className="max-w-full mx-auto px-4 sm:px-6 py-3.5">
                <div className="flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-primary-gradient rounded-lg flex items-center justify-center shadow-md">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className={cn("text-lg sm:text-xl font-bold hidden sm:inline", appTheme.textHeading)}>GetHired</span>
                        <span className={cn("text-lg sm:text-xl font-normal hidden md:inline", appTheme.textMuted2)}>/ Dashboard</span>
                    </Link>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className={appTheme.buttonGhostText}>
                            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </Button>
                        <UserButton appearance={{elements: {avatarBox: "w-8 h-8 sm:w-9 sm:h-9 shadow-md", userButtonPopoverCard: `bg-card border-border shadow-xl rounded-xl`}}}/>
                    </div>
                </div>
            </div>
        </header>
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className={cn("w-10 h-10 sm:w-12 sm:h-12 animate-spin", appTheme.textHeading)} />
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
        <div className={cn("min-h-screen flex flex-col", appTheme.pageBg)}>
            <header className={cn("sticky top-0 z-40 border-b shadow-sm", appTheme.headerBg, appTheme.borderPrimary)}>
                 <div className="max-w-full mx-auto px-4 sm:px-6 py-3.5"> {/* Consistent Header Structure */}
                    <div className="flex items-center justify-between">
                        <Link href="/dashboard" className="flex items-center space-x-2 sm:space-x-3">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-primary-gradient rounded-lg flex items-center justify-center shadow-md">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <span className={cn("text-lg sm:text-xl font-bold hidden sm:inline", appTheme.textHeading)}>GetHired</span>
                             <span className={cn("text-lg sm:text-xl font-normal hidden md:inline", appTheme.textMuted2)}>/ Dashboard</span>
                        </Link>
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className={appTheme.buttonGhostText}>
                                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </Button>
                            <UserButton appearance={{elements: {avatarBox: "w-8 h-8 sm:w-9 sm:h-9 shadow-md", userButtonPopoverCard: `bg-card border-border shadow-xl rounded-xl`}}}/>
                        </div>
                    </div>
                </div>
            </header>
            <div className="flex-grow flex flex-col items-center justify-center text-center px-4 py-8">
                <AlertTriangle className={cn("w-12 h-12 sm:w-16 sm:h-16 mb-4", isDark ? 'text-red-400' : 'text-red-500')} />
                <h2 className={cn("text-xl sm:text-2xl font-semibold mb-2", appTheme.textHeading)}>Oops! Something went wrong.</h2>
                <p className={cn("mb-6 text-sm sm:text-base", appTheme.textMuted)}>{error}</p>
                <Button onClick={fetchResumes} size="lg">Try Again</Button>
            </div>
        </div>
    );
  }

  // Main Dashboard Content
  return (
    <div className={cn("min-h-screen transition-colors duration-300", appTheme.pageBg)}>
      <header className={cn("sticky top-0 z-40 border-b shadow-sm", appTheme.headerBg, appTheme.borderPrimary)}>
        <div className="max-w-full mx-auto px-4 sm:px-6 py-3.5">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-primary-gradient rounded-lg flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className={cn("text-lg sm:text-xl font-bold hidden sm:inline", appTheme.textHeading)}>GetHired</span>
               <span className={cn("text-lg sm:text-xl font-normal hidden md:inline", appTheme.textMuted2)}>/ Dashboard</span>
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className={appTheme.buttonGhostText}>
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              <UserButton 
                appearance={{
                    elements: {
                        avatarBox: "w-8 h-8 sm:w-9 sm:h-9 shadow-md", 
                        userButtonPopoverCard: `bg-card border-border shadow-xl rounded-xl`,
                        userButtonPopoverMain: 'font-sans', // Ensure font consistency
                        userButtonPopoverFooter: 'hidden', // Example: hide footer if not needed
                        userButtonPopoverActionButtonText__manageAccount: 'text-foreground',
                        userButtonPopoverActionButtonIcon__manageAccount: 'text-foreground',
                        userButtonPopoverActionButton__signOut: `${isDark ? 'text-red-400' : 'text-red-500'}`,
                        userButtonPopoverActionButtonIcon__signOut: `${isDark ? 'text-red-400' : 'text-red-500'}`,
                    }
                }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-10 md:mb-12">
          {[
            { title: 'Total Resumes', value: resumes.length, change: `+${resumes.filter(r => new Date(r.updatedAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000).length} this month`, icon: statIcons[0] },
            { title: 'Avg. ATS Score', value: resumes.length > 0 ? Math.round(resumes.reduce((sum, r) => sum + r.atsScore, 0) / resumes.length) : 0, change: resumes.length > 0 ? 'Based on current' : 'N/A', icon: statIcons[1], unit: '%' },
            { title: 'Mock Downloads', value: 0, change: 'Feature in dev', icon: statIcons[2] }
          ].map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 md:mb-10">
          <div>
            <h2 className={cn("text-2xl sm:text-3xl font-bold", appTheme.textHeading)}>Your Resumes</h2>
            <p className={cn("mt-1 sm:mt-1.5 text-sm", appTheme.textMuted)}>Manage and create your AI-powered resumes.</p>
          </div>
          <Link href="/dashboard/create-resume" passHref className="mt-4 sm:mt-0 w-full sm:w-auto">
            <Button size="lg" onClick={handleCreateNewClick} className="w-full sm:w-auto shadow-lg hover:shadow-xl transform transition-all hover:-translate-y-px duration-200">
              <Plus className="w-5 h-5 mr-2" /> Create New Resume
            </Button>
          </Link>
        </div>

        {resumes.length === 0 ? (
          <Card className="text-center py-12 sm:py-16 px-6 shadow-xl">
            <CardContent className="p-0 flex flex-col items-center">
              <FileText className={cn("w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-6", appTheme.iconColor)} />
              <h3 className={cn("text-xl sm:text-2xl font-semibold mb-3", appTheme.textHeading)}>No Resumes Yet</h3>
              <p className={cn("mb-8 max-w-md mx-auto text-sm sm:text-base", appTheme.textMuted)}>
                It looks like you haven&apos;t created any resumes. Let&apos;s build your first one!
              </p>
              <Link href="/dashboard/create-resume" passHref>
                <Button size="lg" onClick={handleCreateNewClick} className="shadow-lg hover:shadow-xl">
                  <Plus className="w-5 h-5 mr-2 inline-block" />Create Your First Resume
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {resumes.map((resume) => (
              <Card key={resume.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                <CardContent className="p-5 sm:p-6 flex-grow">
                  <div className="flex items-start justify-between mb-3">
                    <Link href={`/dashboard/create-resume?resumeId=${resume.id}`} className="block flex-1 min-w-0">
                        <h4 className={cn("text-base sm:text-lg font-semibold group-hover:text-primary transition-colors truncate", appTheme.textHeading)}>
                        {resume.title}
                        </h4>
                    </Link>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteResume(resume.id, resume.title)}
                        title="Delete Resume"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-7 w-7 sm:h-8 sm:w-8 ml-2 flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center flex-wrap gap-2 mb-4">
                    <span className={cn(`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border`, getScoreBgClass(resume.atsScore), getScoreColorText(resume.atsScore))}>
                      <Star className="w-3 h-3 mr-1.5" /> {resume.atsScore}% ATS
                    </span>
                    <span className={cn(`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border`, resume.status === 'completed' ? (isDark ? 'bg-green-500/10 text-green-300 border-green-500/20' : 'bg-green-100 text-green-700 border-green-200') : (isDark ? 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20' : 'bg-yellow-100 text-yellow-700 border-yellow-200'))}>
                      {resume.status.charAt(0).toUpperCase() + resume.status.slice(1)}
                    </span>
                  </div>
                  <div className={cn("flex items-center text-xs space-x-1.5", appTheme.textMuted2)}>
                    <Calendar className="w-3.5 h-3.5" /> <span>Updated: {new Date(resume.updatedAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
                <CardFooter className={cn("p-4 border-t", appTheme.borderSecondary)}>
                  <div className="flex space-x-2 sm:space-x-3 w-full">
                    <Link href={`/dashboard/create-resume?resumeId=${resume.id}`} className="flex-1"> 
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit3 className="w-4 h-4 mr-1.5 sm:mr-2" /> Edit
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" title="Download PDF (coming soon)" disabled className="px-3"> {/* Icon only or smaller */}
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardContent;