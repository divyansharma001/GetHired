'use client';

import React, { useState, useEffect } from 'react';
import { Plus, FileText, Download, Calendar, Star, MoreVertical, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';

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
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for now - replace with actual API call
  useEffect(() => {
    const mockResumes: Resume[] = [
      {
        id: '1',
        title: 'Software Engineer Resume',
        atsScore: 85,
        updatedAt: '2024-05-20',
        status: 'completed'
      },
      {
        id: '2',
        title: 'Frontend Developer Resume',
        atsScore: 72,
        updatedAt: '2024-05-18',
        status: 'draft'
      }
    ];
    
    setTimeout(() => {
      setResumes(mockResumes);
      setLoading(false);
    }, 1000);
  }, [userId]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-400/20 border-green-400/30';
    if (score >= 60) return 'bg-yellow-400/20 border-yellow-400/30';
    return 'bg-red-400/20 border-red-400/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">ResumeAI</span>
              </div>
              <div className="h-6 w-px bg-white/20" />
              <h1 className="text-xl font-semibold text-white">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10"
                  }
                }}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Total Resumes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{resumes.length}</p>
              <p className="text-sm text-gray-400 mt-1">+2 this month</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Average ATS Score</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">
                {resumes.length > 0 ? Math.round(resumes.reduce((sum, r) => sum + r.atsScore, 0) / resumes.length) : 0}
              </p>
              <p className="text-sm text-green-400 mt-1">+12% improvement</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Downloads</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">8</p>
              <p className="text-sm text-gray-400 mt-1">Last 30 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Your Resumes</h2>
            <p className="text-gray-400">Manage and create your AI-powered resumes</p>
          </div>
          <Link href="/dashboard/create-resume">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Create New Resume
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-white/5 border-white/10 backdrop-blur-sm animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  <div className="h-3 bg-white/10 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-white/10 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No resumes yet</h3>
              <p className="text-gray-400 mb-6">Create your first AI-powered resume to get started</p>
              <Link href="/dashboard/create-resume">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Resume
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <Card key={resume.id} className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                        {resume.title}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getScoreBg(resume.atsScore)}`}>
                          <Star className="w-3 h-3 mr-1" />
                          <span className={getScoreColor(resume.atsScore)}>
                            {resume.atsScore}% ATS
                          </span>
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          resume.status === 'completed' 
                            ? 'bg-green-400/20 text-green-400 border border-green-400/30' 
                            : 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30'
                        }`}>
                          {resume.status === 'completed' ? 'Completed' : 'Draft'}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Updated {new Date(resume.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link href={`/dashboard/resume/${resume.id}`} className="flex-1">
                      <Button variant="outline" className="w-full text-white border-white/20 hover:bg-white/10">
                        <FileText className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <Button variant="outline" className="text-white border-white/20 hover:bg-white/10">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardContent;
