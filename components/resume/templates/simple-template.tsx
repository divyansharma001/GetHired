// components/resume/templates/simple-template.tsx
import React from 'react';
import { ResumeData } from '@/types/resume';

interface SimpleTemplateProps {
  resumeData: ResumeData;
  isPreview?: boolean; // To slightly adjust styles if used for on-page preview vs PDF capture
}

// Basic inline styles - for PDF generation, external CSS is harder to manage with html2canvas
const styles = {
  container: { fontFamily: 'Arial, sans-serif', padding: '40px', color: '#333', width: '210mm', minHeight: '297mm', backgroundColor: '#fff' }, // A4 size approx
  header: { textAlign: 'center' as const, marginBottom: '30px' },
  name: { fontSize: '28px', fontWeight: 'bold' as const, marginBottom: '5px' },
  contact: { fontSize: '12px', marginBottom: '20px' },
  section: { marginBottom: '20px' },
  sectionTitle: { fontSize: '18px', fontWeight: 'bold' as const, borderBottom: '2px solid #333', paddingBottom: '5px', marginBottom: '10px' },
  subHeader: { fontSize: '14px', fontWeight: 'bold' as const, marginBottom: '3px' },
  dateRange: { fontSize: '12px', fontStyle: 'italic' as const, color: '#555', marginBottom: '5px' },
  listItem: { marginBottom: '8px', fontSize: '12px', lineHeight: '1.4' },
  bullet: { listStyleType: 'disc' as const, marginLeft: '20px', paddingLeft: '5px'},
  paragraph: { fontSize: '12px', lineHeight: '1.4', marginBottom: '10px', whiteSpace: 'pre-line' as const },
  skillItem: { display: 'inline-block', marginRight: '10px', marginBottom: '5px', fontSize: '12px', padding: '3px 6px', backgroundColor: '#f0f0f0', borderRadius: '3px'}
};

const SimpleTemplate: React.FC<SimpleTemplateProps> = ({ resumeData }) => {
  if (!resumeData || !resumeData.personalInfo) {
    return <div style={styles.container}><p>Loading resume data...</p></div>;
  }
  const { personalInfo, experience, education, skills, projects } = resumeData;

  return (
    <div id="resume-content-for-pdf" style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.name}>{personalInfo.firstName} {personalInfo.lastName}</h1>
        <p style={styles.contact}>
          {personalInfo.location} | {personalInfo.phone} | {personalInfo.email}
          {personalInfo.linkedin && ` | ${personalInfo.linkedin}`}
          {personalInfo.website && ` | ${personalInfo.website}`}
        </p>
      </div>

      {personalInfo.summary && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Summary</h2>
          <p style={styles.paragraph}>{personalInfo.summary}</p>
        </div>
      )}

      {experience && experience.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Experience</h2>
          {experience.map((exp, index) => (
            <div key={`exp-${exp.id || index}`} style={styles.listItem}>
              <h3 style={styles.subHeader}>{exp.position} - {exp.company}</h3>
              <p style={styles.dateRange}>{exp.startDate} - {exp.endDate}</p>
              <p style={styles.paragraph}>{exp.description}</p>
              {exp.achievements && exp.achievements.length > 0 && (
                <ul style={styles.bullet}>
                  {exp.achievements.map((ach, i) => ach && <li key={i}>{ach}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {education && education.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Education</h2>
          {education.map((edu, index) => (
            <div key={`edu-${edu.id || index}`} style={styles.listItem}>
              <h3 style={styles.subHeader}>{edu.degree} in {edu.field}</h3>
              <p>{edu.institution}</p>
              <p style={styles.dateRange}>{edu.startDate} - {edu.endDate} {edu.gpa && `| GPA: ${edu.gpa}`}</p>
              {edu.achievements && edu.achievements.length > 0 && (
                <ul style={styles.bullet}>
                  {edu.achievements.map((ach, i) => ach && <li key={i}>{ach}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {skills && skills.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Skills</h2>
          <div>
            {skills.map((skill, index) => (
              skill.name && <span key={`skill-${skill.id || index}`} style={styles.skillItem}>{skill.name}</span>
            ))}
          </div>
        </div>
      )}

      {projects && projects.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Projects</h2>
          {projects.map((proj, index) => (
            <div key={`proj-${proj.id || index}`} style={styles.listItem}>
              <h3 style={styles.subHeader}>{proj.name}</h3>
              <p style={styles.paragraph}>{proj.description}</p>
              {proj.technologies && proj.technologies.length > 0 && <p style={{fontSize: '11px', color: '#444'}}><em>Technologies: {proj.technologies.join(', ')}</em></p>}
              {proj.url && <p style={{fontSize: '11px'}}><a href={proj.url} target="_blank" rel="noopener noreferrer">Project Link</a></p>}
              {proj.github && <p style={{fontSize: '11px'}}><a href={proj.github} target="_blank" rel="noopener noreferrer">GitHub Repo</a></p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimpleTemplate;  