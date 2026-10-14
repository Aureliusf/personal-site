import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from '@react-pdf/renderer';
import type { Basics, BasicsField, Resume } from './types';
import { formatDateRange } from './date-utils';

const BASIC_FIELDS: BasicsField[] = ['email', 'phone', 'location', 'website', 'linkedin', 'github'];

function getVisibleBasicsValues(basics: Basics): string[] {
  return BASIC_FIELDS.flatMap((field) => {
    const value = basics[field];
    if (typeof value !== 'string' || value.trim() === '' || basics.hiddenFields?.includes(field)) {
      return [];
    }
    return [value.trim()];
  });
}

// Register Times Roman font (built into react-pdf)
// Times-Roman is available by default

interface PDFDocumentProps {
  resume: Resume;
  selectedBullets: Map<string, string[]>;
}

// Create styles that match Jake's Resume template
const styles = StyleSheet.create({
  page: {
    paddingTop: 18,
    paddingHorizontal: 36,
    paddingBottom: 36,
    fontFamily: 'Times-Roman',
    fontSize: 10.5,
    lineHeight: 1.25,
    backgroundColor: '#ffffff',
  },
  header: {
    textAlign: 'center',
    marginBottom: 5.25,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.9,
    marginBottom: 10.8,
    textTransform: 'uppercase',
  },
  contact: {
    fontSize: 9,
    fontStyle: 'italic',
    color: '#333333',
  },
  section: {
    marginTop: 5.25,
    marginBottom: 4.2,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingBottom: 2,
    marginBottom: 5.25,
    textTransform: 'uppercase',
  },
  educationEntry: {
    marginBottom: 6.3,
  },
  experienceEntry: {
    marginBottom: 8.4,
  },
  projectEntry: {
    marginBottom: 6.3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  rowLeft: {
    flex: 1,
  },
  rowRight: {
    textAlign: 'right',
  },
  school: {
    fontWeight: 'bold',
  },
  location: {
    fontWeight: 'normal',
  },
  degree: {
    fontStyle: 'italic',
  },
  dates: {
    fontStyle: 'italic',
    fontSize: 9.5,
  },
  role: {
    fontWeight: 'bold',
  },
  company: {
    fontStyle: 'italic',
  },
  projectName: {
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  bullets: {
    marginTop: 3,
    marginLeft: 13,
  },
  bullet: {
    flex: 1,
    fontSize: 10,
    marginBottom: 1.5,
  },
  bulletBullet: {
    width: 7,
    marginRight: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  skillRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  skillCategory: {
    fontWeight: 'bold',
  },
  skillItems: {
    fontWeight: 'normal',
  },
});

export function PDFDocument({ resume, selectedBullets }: PDFDocumentProps) {
  const getSelectedBullets = (parentId: string, bullets: { id: string; text: string; selected?: boolean }[]) => {
    const selectedIds = selectedBullets.get(parentId);

    // If we have selection state in the Map, use it
    if (selectedIds !== undefined) {
      return bullets.filter((b) => selectedIds.includes(b.id));
    }

    // Otherwise, fall back to the bullet's own selected field (defaults to true)
    return bullets.filter((b) => b.selected !== false);
  };

  // Build contact line
  const contactItems = getVisibleBasicsValues(resume.basics);
  const visibleEducation = resume.education.filter((entry) => entry.selected !== false);
  const visibleProjects = resume.projects.filter((entry) => entry.selected !== false);
  const visibleSkills = resume.skills.filter((skill) => skill.selected !== false);

  return (
    <Document creationDate={new Date(resume.updatedAt)}>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{resume.basics.name}</Text>
          <Text style={styles.contact}>
            {contactItems.join(' | ')}
          </Text>
        </View>

        {/* Education */}
        {visibleEducation.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {visibleEducation.map((edu) => {
              const selected = getSelectedBullets(edu.id, edu.bullets);
              return (
                <View key={edu.id} style={styles.educationEntry}>
                  <View style={styles.row}>
                    <View style={styles.rowLeft}>
                      <Text>
                        <Text style={styles.school}>{edu.school}</Text>
                        <Text style={styles.location}> | {edu.location}</Text>
                      </Text>
                    </View>
                  </View>
                  <View style={styles.row}>
                    <Text style={[styles.rowLeft, styles.degree]}>{edu.degree}</Text>
                    <Text style={[styles.rowRight, styles.dates]}>{edu.dates}</Text>
                  </View>
                  {selected.length > 0 && (
                    <View style={styles.bullets}>
                      {selected.map((bullet) => (
                        <View key={bullet.id} style={styles.bulletRow}>
                          <Text style={styles.bulletBullet}>•</Text>
                          <Text style={styles.bullet}>{bullet.text}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Experience */}
        {resume.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {resume.experience.map((exp) => {
              const selected = getSelectedBullets(exp.id, exp.bullets);
              if (selected.length === 0) return null;
              const experienceMeta = [exp.location, formatDateRange(exp.startDate, exp.endDate)]
                .filter(Boolean)
                .join(' | ');

              return (
                <View key={exp.id} style={styles.experienceEntry}>
                  <View style={styles.row}>
                    <Text style={[styles.rowLeft, styles.role]}>{exp.role}</Text>
                    <Text style={[styles.rowRight, styles.dates]}>{experienceMeta}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={[styles.rowLeft, styles.company]}>{exp.company}</Text>
                  </View>
                  <View style={styles.bullets}>
                    {selected.map((bullet) => (
                      <View key={bullet.id} style={styles.bulletRow}>
                        <Text style={styles.bulletBullet}>•</Text>
                        <Text style={styles.bullet}>{bullet.text}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Projects */}
        {visibleProjects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {visibleProjects.map((proj) => {
              const selected = getSelectedBullets(proj.id, proj.bullets);
              if (selected.length === 0) return null;

              return (
                <View key={proj.id} style={styles.projectEntry}>
                  <View style={styles.row}>
                    <View style={styles.rowLeft}>
                      <Text>
                        <Text style={styles.projectName}>{proj.name}</Text>
                        {proj.technologies.length > 0 && (
                          <Text> | {proj.technologies.join(', ')}</Text>
                        )}
                      </Text>
                    </View>
                    <Text style={[styles.rowRight, styles.dates]}>
                      {formatDateRange(proj.startDate, proj.endDate)}
                    </Text>
                  </View>
                  <View style={styles.bullets}>
                    {selected.map((bullet) => (
                      <View key={bullet.id} style={styles.bulletRow}>
                        <Text style={styles.bulletBullet}>•</Text>
                        <Text style={styles.bullet}>{bullet.text}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Technical Skills */}
        {visibleSkills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Technical Skills</Text>
            <View>
              {visibleSkills.map((skill) => (
                <View key={skill.category} style={styles.skillRow}>
                  <Text>
                    <Text style={styles.skillCategory}>{skill.category}:</Text>
                    <Text style={styles.skillItems}> {skill.items.join(', ')}</Text>
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}
