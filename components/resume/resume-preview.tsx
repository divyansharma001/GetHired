// components/resume/resume-preview.tsx
'use client'; // Ensure client component directive

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Eye, User, Briefcase, GraduationCap, Star as StarIcon, Wrench, Link as LinkIcon, FileText, Github } from 'lucide-react'; // Renamed Star to StarIcon, Link to LinkIcon
import { useShallowResumeSelector } from '@/hooks/useShallowResumeSelector';
import { useTheme } from '@/context/theme-provider'; // Import useTheme
import { cn } from '@/lib/utils'; // Import cn

// Define AppTheme (or import from a central config)
function getAppTheme(isDark: boolean) {
  return {
    textHeading: isDark ? 'text-neutral-100' : 'text-neutral-800',
    textSubHeading: isDark ? 'text-neutral-200' : 'text-neutral-700', // For slightly less emphasis than main heading
    textBody: isDark ? 'text-neutral-300' : 'text-neutral-600',
    textMuted: isDark ? 'text-neutral-400' : 'text-neutral-500',
    textLink: isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700',
    borderSecondary: isDark ? 'border-neutral-700/50' : 'border-neutral-200',
    iconAccentColor: isDark ? 'text-blue-400' : 'text-blue-600', // For main card icon
    sectionIconColor: isDark ? 'text-purple-400' : 'text-purple-500', // For icons next to section titles
    skillPillBg: isDark ? 'bg-purple-500/10' : 'bg-purple-100',
    skillPillText: isDark ? 'text-purple-300' : 'text-purple-700',
    previewContentBg: isDark ? 'bg-neutral-800/40' : 'bg-slate-50', // Background for the content area inside preview
  };
}

const ResumePreview: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const appTheme = getAppTheme(isDark);

  const {
    title: resumeTitle, // Renamed for clarity, as 'title' is also used for section titles
    personalInfo,
    education,
    experience,
    skills,
    projects,
  } = useShallowResumeSelector();

  const SectionTitle: React.FC<{ icon: React.ElementType, title: string, className?: string }> = ({ icon: Icon, title, className }) => (
    <div className={cn("flex items-center mt-5 mb-2.5 border-b pb-1.5", appTheme.borderSecondary, className)}>
      <Icon className={cn("w-4 h-4 mr-2.5 shrink-0", appTheme.sectionIconColor)} />
      <h3 className={cn("text-xs font-semibold uppercase tracking-wider", appTheme.textSubHeading)}>{title}</h3>
    </div>
  );

  const isEmpty = 
    (!personalInfo.firstName && !personalInfo.summary) &&
    education.length === 0 &&
    experience.length === 0 &&
    skills.length === 0 &&
    projects.length === 0;

  return (
    <Card className="shadow-xl"> {/* Uses themed Card */}
      <CardHeader className="pb-2 sm:pb-3">
         <div className="flex items-center justify-between">
            <CardTitle className={cn("text-base sm:text-lg font-semibold", appTheme.textHeading)}>
              Live Preview
            </CardTitle>
            <Eye className={cn("h-5 w-5 sm:h-6 sm:w-6", appTheme.iconAccentColor)} />
        </div>
        {resumeTitle && resumeTitle !== "Untitled Resume" && (
            <CardDescription className={cn("text-xs pt-1", appTheme.textMuted)}>
                {resumeTitle}
            </CardDescription>
        )}
      </CardHeader>
      <CardContent className="text-xs max-h-[65vh] sm:max-h-[70vh] overflow-y-auto p-3 sm:p-4 styled-scrollbar">
        {isEmpty ? (
            <div className={cn("text-center py-10 px-4 rounded-md", appTheme.previewContentBg)}>
                <FileText className={cn("w-12 h-12 mx-auto mb-4", appTheme.textMuted)} />
                <p className={cn("font-medium", appTheme.textSubHeading)}>Your resume preview will appear here.</p>
                <p className={cn("text-xs mt-1", appTheme.textMuted)}>Start filling in your details on the left.</p>
            </div>
        ) : (
            <div className={cn("p-3 sm:p-4 rounded-md", appTheme.previewContentBg)}> {/* Inner container for preview content styling */}
            {/* Header */}
            {(personalInfo.firstName || personalInfo.lastName) && (
                <div className="text-center mb-4">
                    <h1 className={cn("text-lg sm:text-xl font-bold", appTheme.textHeading)}>
                    {personalInfo.firstName || "[First Name]"}{" "}
                    {personalInfo.lastName || "[Last Name]"}
                    </h1>
                    <p className={cn("text-xs", appTheme.textBody)}>
                    {personalInfo.location || "[Location]"}{personalInfo.location && (personalInfo.phone || personalInfo.email) ? " | " : ""}
                    {personalInfo.phone || "[Phone]"}{personalInfo.phone && personalInfo.email ? " | " : ""}
                    {personalInfo.email || "[Email]"}
                    </p>
                    <div className="mt-1 space-x-2">
                        {personalInfo.linkedin && (
                        <a href={personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://${personalInfo.linkedin}`} target="_blank" rel="noopener noreferrer" className={cn("text-xs", appTheme.textLink)}>
                            LinkedIn
                        </a>
                        )}
                        {personalInfo.website && personalInfo.linkedin && (<span className={appTheme.textMuted}>|</span>)}
                        {personalInfo.website && (
                        <a href={personalInfo.website.startsWith('http') ? personalInfo.website : `https://${personalInfo.website}`} target="_blank" rel="noopener noreferrer" className={cn("text-xs", appTheme.textLink)}>
                            Portfolio
                        </a>
                        )}
                    </div>
                </div>
            )}

            {/* Summary */}
            {personalInfo.summary && (
                <>
                <SectionTitle icon={User} title="Summary" />
                <p className={cn("text-xs leading-relaxed whitespace-pre-line", appTheme.textBody)}>
                    {personalInfo.summary}
                </p>
                </>
            )}

            {/* Experience */}
            {experience.length > 0 && (
                <>
                <SectionTitle icon={Briefcase} title="Experience" />
                {experience.map((exp) => (
                    <div key={exp.id} className="mb-3 last:mb-0">
                    <h4 className={cn("text-sm font-semibold", appTheme.textSubHeading)}>{exp.position || "[Position]"}</h4>
                    <p className={cn("text-xs font-medium", appTheme.textBody)}>{exp.company || "[Company]"}</p>
                    <p className={cn("text-xs mb-0.5", appTheme.textMuted)}>
                        {exp.startDate || "[Start Date]"} - {exp.endDate || "[End Date]"}
                    </p>
                    {exp.description && <p className={cn("text-xs whitespace-pre-line", appTheme.textBody)}>{exp.description}</p>}
                    {exp.achievements && exp.achievements.length > 0 && (
                        <ul className="list-disc list-inside ml-1 mt-0.5 text-xs space-y-px">
                            {exp.achievements.map((ach, i) => ach && <li key={i} className={appTheme.textBody}>{ach}</li>)}
                        </ul>
                    )}
                    </div>
                ))}
                </>
            )}

            {/* Education */}
            {education.length > 0 && (
                <>
                <SectionTitle icon={GraduationCap} title="Education" />
                {education.map((edu) => (
                    <div key={edu.id} className="mb-2.5 last:mb-0">
                    <h4 className={cn("text-sm font-semibold", appTheme.textSubHeading)}>{edu.degree || "[Degree]"} <span className={cn("font-normal", appTheme.textBody)}>in</span> {edu.field || "[Field of Study]"}</h4>
                    <p className={cn("text-xs font-medium", appTheme.textBody)}>{edu.institution || "[Institution]"}</p>
                    <p className={cn("text-xs mb-0.5", appTheme.textMuted)}>
                        {edu.startDate || "[Start]"} - {edu.endDate || "[End]"}
                        {edu.gpa && ` | GPA: ${edu.gpa}`}
                    </p>
                    {edu.achievements && edu.achievements.length > 0 && (
                        <ul className="list-disc list-inside ml-1 mt-0.5 text-xs space-y-px">
                            {edu.achievements.map((ach, i) => ach && <li key={i} className={appTheme.textBody}>{ach}</li>)}
                        </ul>
                    )}
                    </div>
                ))}
                </>
            )}

            {/* Skills */}
            {skills.length > 0 && (
                <>
                <SectionTitle icon={StarIcon} title="Skills" />
                <div className="flex flex-wrap gap-1.5">
                    {skills.map((skill) => (
                    skill.name && <span key={skill.id} className={cn("px-2 py-0.5 rounded text-xs font-medium border", appTheme.skillPillBg, appTheme.skillPillText, isDark ? 'border-purple-500/20' : 'border-purple-300')}>
                        {skill.name}
                    </span>
                    ))}
                </div>
                </>
            )}

            {/* Projects */}
            {projects.length > 0 && (
                <>
                    <SectionTitle icon={Wrench} title="Projects"/>
                    {projects.map(proj => (
                        <div key={proj.id} className="mb-3 last:mb-0">
                            <h4 className={cn("text-sm font-semibold", appTheme.textSubHeading)}>{proj.name || "[Project Name]"}</h4>
                            {proj.description && <p className={cn("text-xs whitespace-pre-line mb-0.5", appTheme.textBody)}>{proj.description}</p>}
                            {proj.technologies && proj.technologies.length > 0 && (
                                <p className={cn("text-xs", appTheme.textMuted)}>
                                    <span className={cn("font-medium", appTheme.textBody)}>Tech: </span>{proj.technologies.join(', ')}
                                </p>
                            )}
                            {(proj.url || proj.github) && (
                                <div className="text-xs mt-0.5 space-x-2">
                                    {proj.url && <a href={proj.url.startsWith('http') ? proj.url : `https://${proj.url}`} target="_blank" rel="noopener noreferrer" className={appTheme.textLink}><LinkIcon size={12} className="inline mr-0.5"/>Demo</a>}
                                    {proj.github && <a href={proj.github.startsWith('http') ? proj.github : `https://${proj.github}`} target="_blank" rel="noopener noreferrer" className={appTheme.textLink}><Github size={12} className="inline mr-0.5"/>Code</a>}
                                </div>
                            )}
                        </div>
                    ))}
                </>
            )}
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumePreview;