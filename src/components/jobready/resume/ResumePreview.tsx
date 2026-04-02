"use client";

import { ResumeData } from "./types";

interface ResumePreviewProps {
  data: ResumeData;
}

export default function ResumePreview({ data }: ResumePreviewProps) {
  return (
    <div className="jr-resume-preview">
      <div className="jr-preview-header">
        <h1 className="jr-preview-name">{data.fullName || "Your Name"}</h1>
        <div className="jr-preview-contact">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.location && <span>{data.location}</span>}
        </div>
        {(data.linkedIn || data.portfolio) && (
          <div className="jr-preview-links">
            {data.linkedIn && <span>{data.linkedIn}</span>}
            {data.linkedIn && data.portfolio && <span>•</span>}
            {data.portfolio && <span>{data.portfolio}</span>}
          </div>
        )}
      </div>

      {data.summary && (
        <section className="jr-preview-section">
          <h2 className="jr-preview-section-title">Professional Summary</h2>
          <p className="jr-preview-summary">{data.summary}</p>
        </section>
      )}

      {data.experiences.length > 0 && (
        <section className="jr-preview-section">
          <h2 className="jr-preview-section-title">Experience</h2>
          {data.experiences.map((exp) => (
            <div key={exp.id} className="jr-preview-entry">
              <div className="jr-preview-entry-header">
                <div>
                  <h3 className="jr-preview-entry-title">{exp.title || "Job title"}</h3>
                  <div className="jr-preview-entry-sub">
                    {exp.company || "Company"}
                    {exp.location && ` • ${exp.location}`}
                  </div>
                </div>
                {exp.startDate && (
                  <div className="jr-preview-entry-date">
                    {formatMonth(exp.startDate)} — {exp.current ? "Present" : formatMonth(exp.endDate)}
                  </div>
                )}
              </div>
              {exp.highlights.filter(Boolean).length > 0 && (
                <ul className="jr-preview-highlights">
                  {exp.highlights.filter(Boolean).map((highlight, index) => (
                    <li key={index}>{highlight}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {data.education.length > 0 && (
        <section className="jr-preview-section">
          <h2 className="jr-preview-section-title">Education</h2>
          {data.education.map((edu) => (
            <div key={edu.id} className="jr-preview-entry">
              <div className="jr-preview-entry-header">
                <div>
                  <h3 className="jr-preview-entry-title">{edu.degree || "Degree"}</h3>
                  <div className="jr-preview-entry-sub">
                    {edu.institution || "Institution"}
                    {edu.location && ` • ${edu.location}`}
                  </div>
                </div>
                {edu.graduationYear && (
                  <div className="jr-preview-entry-date">{edu.graduationYear}</div>
                )}
              </div>
              {edu.gpa && <div className="jr-preview-entry-sub">GPA: {edu.gpa}</div>}
            </div>
          ))}
        </section>
      )}

      {data.skills.length > 0 && (
        <section className="jr-preview-section">
          <h2 className="jr-preview-section-title">Skills</h2>
          <div className="jr-preview-skills">
            {data.skills.map((skill) => (
              <span key={skill} className="jr-preview-skill">{skill}</span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function formatMonth(value?: string) {
  if (!value) return "";
  const date = new Date(`${value}-01`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
