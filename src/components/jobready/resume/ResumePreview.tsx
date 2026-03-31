"use client";

import { ResumeData } from "./types";

interface ResumePreviewProps {
  data: ResumeData;
}

export default function ResumePreview({ data }: ResumePreviewProps) {
  const s = { mb15: { marginBottom: "1.5rem" }, text: { fontSize: "0.875rem", color: "var(--jr-muted)" } };
  return (
    <div className="jr-resume-preview">
      <div style={s.mb15}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "700", margin: "0 0 0.25rem 0" }}>{data.fullName || "Your Name"}</h1>
        <div style={{ ...s.text, display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.location && <span>{data.location}</span>}
        </div>
        {(data.linkedIn || data.portfolio) && (
          <div style={{ ...s.text, color: "var(--jr-primary)", marginTop: "0.25rem" }}>
            {data.linkedIn && <span>{data.linkedIn}</span>}
            {data.linkedIn && data.portfolio && <span> • </span>}
            {data.portfolio && <span>{data.portfolio}</span>}
          </div>
        )}
      </div>

      {data.summary && (
        <div style={s.mb15}>
          <h2 style={{ fontSize: "0.875rem", fontWeight: "700", textTransform: "uppercase", color: "var(--jr-muted)", marginBottom: "0.5rem" }}>Professional Summary</h2>
          <p style={{ fontSize: "0.875rem", lineHeight: "1.5", margin: "0" }}>{data.summary}</p>
        </div>
      )}

      {data.experiences.length > 0 && (
        <div style={s.mb15}>
          <h2 style={{ fontSize: "0.875rem", fontWeight: "700", textTransform: "uppercase", color: "var(--jr-muted)", marginBottom: "0.5rem" }}>Experience</h2>
          {data.experiences.map((exp) => (
            <div key={exp.id} style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: "700", margin: "0" }}>{exp.title || "Job Title"}</h3>
                  <div style={s.text}>{exp.company || "Company"}{exp.location && ` • ${exp.location}`}</div>
                </div>
                {exp.startDate && <div style={s.text}>{exp.startDate} — {exp.current ? "Present" : exp.endDate}</div>}
              </div>
              {exp.highlights.length > 0 && (
                <ul style={{ margin: "0.5rem 0 0 0", paddingLeft: "1.25rem", fontSize: "0.875rem" }}>
                  {exp.highlights.map((h, i) => <li key={i} style={{ margin: "0.25rem 0" }}>{h}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {data.education.length > 0 && (
        <div style={s.mb15}>
          <h2 style={{ fontSize: "0.875rem", fontWeight: "700", textTransform: "uppercase", color: "var(--jr-muted)", marginBottom: "0.5rem" }}>Education</h2>
          {data.education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: "700", margin: "0" }}>{edu.degree || "Degree"}</h3>
                  <div style={s.text}>{edu.institution || "Institution"}{edu.location && ` • ${edu.location}`}</div>
                </div>
                {edu.graduationYear && <div style={s.text}>{edu.graduationYear}</div>}
              </div>
              {edu.gpa && <div style={{ ...s.text, marginTop: "0.25rem" }}>GPA: {edu.gpa}</div>}
            </div>
          ))}
        </div>
      )}

      {data.skills.length > 0 && (
        <div>
          <h2 style={{ fontSize: "0.875rem", fontWeight: "700", textTransform: "uppercase", color: "var(--jr-muted)", marginBottom: "0.5rem" }}>Skills</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", fontSize: "0.875rem" }}>
            {data.skills.map((skill) => (
              <span key={skill} style={{ padding: "0.25rem 0.5rem", backgroundColor: "var(--jr-bg-secondary)", borderRadius: "0.25rem" }}>{skill}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
