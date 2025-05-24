/* eslint-disable @typescript-eslint/no-unused-vars */
// components/resume/resume-preview.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Eye, User, Briefcase, GraduationCap, Star, Wrench } from 'lucide-react';
import { useResumeStore } from '@/hooks/use-resume';
import { PersonalInfo, EducationEntry, ExperienceEntry, SkillEntry, ProjectEntry } from '@/types/resume';

const ResumePreview: React.FC = () => {
  const {
    title,
    personalInfo,
    education,
    experience,
    skills,
    projects,
  } = useResumeStore(state => ({
    title: state.title,
    personalInfo: state.personalInfo,
    education: state.education,
    experience: state.experience,
    skills: state.skills,
    projects: state.projects,
  }));

  const SectionTitle: React.FC<{ icon: React.ElementType, title: string, className?: string }> = ({ icon: Icon, title, className }) => (
    <div className={`flex items-center mt-5 mb-2 border-b border-slate-700 pb-1.5 ${className}`}>
      <Icon className="w-4 h-4 mr-2 text-purple-400" />
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">{title}</h3>
    </div>
  );

  return (
    <Card className="bg-slate-800/50 border border-slate-700 backdrop-blur-sm shadow-xl">
      <CardHeader className="pb-2">
         <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-white">
            Live Preview
            </CardTitle>
            <Eye className="h-6 w-6 text-blue-400" />
        </div>
        <CardDescription className="text-xs text-gray-400 pt-1">
            A simplified view of your resume as you build it.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-xs text-gray-400 max-h-[70vh] overflow-y-auto p-4 styled-scrollbar">
        {/* Basic Resume Structure */}
        <div className="p-3 bg-slate-900/30 rounded-md">
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-xl font-bold text-white">
              {personalInfo.firstName || "[First Name]"}{" "}
              {personalInfo.lastName || "[Last Name]"}
            </h1>
            <p className="text-xs text-gray-300">
              {personalInfo.location || "[Location]"} |{" "}
              {personalInfo.phone || "[Phone]"} |{" "}
              {personalInfo.email || "[Email]"}
            </p>
            {personalInfo.linkedin && (
              <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">
                LinkedIn
              </a>
            )}
            {personalInfo.website && (
              <span className="text-xs text-gray-300">
                {" "}|{" "}
                <a href={personalInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                  Portfolio
                </a>
              </span>
            )}
          </div>

          {/* Summary */}
          {personalInfo.summary && (
            <>
              <SectionTitle icon={User} title="Summary" />
              <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                {personalInfo.summary}
              </p>
            </>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <>
              <SectionTitle icon={Briefcase} title="Experience" />
              {experience.map((exp) => (
                <div key={exp.id} className="mb-3">
                  <h4 className="text-sm font-semibold text-gray-200">{exp.position || "[Position]"}</h4>
                  <p className="text-xs font-medium text-gray-300">{exp.company || "[Company]"}</p>
                  <p className="text-xs text-gray-400 mb-1">
                    {exp.startDate || "[Start Date]"} - {exp.endDate || "[End Date]"}
                  </p>
                  <p className="text-xs text-gray-300 whitespace-pre-line">{exp.description || "[Description..."}</p>
                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul className="list-disc list-inside ml-2 text-xs text-gray-300">
                        {exp.achievements.map((ach, i) => ach && <li key={i}>{ach}</li>)}
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
                <div key={edu.id} className="mb-2.5">
                  <h4 className="text-sm font-semibold text-gray-200">{edu.degree || "[Degree]"} <span className="font-normal">in</span> {edu.field || "[Field of Study]"}</h4>
                  <p className="text-xs font-medium text-gray-300">{edu.institution || "[Institution]"}</p>
                  <p className="text-xs text-gray-400 mb-0.5">
                    {edu.startDate || "[Start]"} - {edu.endDate || "[End]"}
                    {edu.gpa && ` | GPA: ${edu.gpa}`}
                  </p>
                   {edu.achievements && edu.achievements.length > 0 && (
                    <ul className="list-disc list-inside ml-2 text-xs text-gray-300">
                        {edu.achievements.map((ach, i) => ach && <li key={i}>{ach}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <>
              <SectionTitle icon={Star} title="Skills" />
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  skill.name && <span key={skill.id} className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-xs">
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
                    <div key={proj.id} className="mb-3">
                        <h4 className="text-sm font-semibold text-gray-200">{proj.name || "[Project Name]"}</h4>
                        <p className="text-xs text-gray-300 whitespace-pre-line mb-0.5">{proj.description || "[Description...]"}</p>
                        {proj.technologies && proj.technologies.length > 0 && (
                            <p className="text-xs text-gray-400">
                                <span className="font-medium text-gray-300">Tech: </span>{proj.technologies.join(', ')}
                            </p>
                        )}
                         {(proj.url || proj.github) && (
                            <p className="text-xs">
                                {proj.url && <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline mr-2">Live Demo</a>}
                                {proj.github && <a href={proj.github} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">GitHub</a>}
                            </p>
                         )}
                    </div>
                ))}
            </>
          )}

        </div>
        { (personalInfo.summary === '' && experience.length === 0 && education.length === 0 && skills.length === 0 && projects.length === 0) &&
            <p className="italic text-center text-gray-500 mt-6">Your resume preview will appear here as you fill in the details.</p>
        }
      </CardContent>
    </Card>
  );
};

export default ResumePreview;