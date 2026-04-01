"use client";

import { useState } from "react";
import type { ResumeData } from "./types";
import "@/app/jobready/jobready.css";

interface Props {
  onSelect: (data: ResumeData) => void;
  onCancel: () => void;
}

interface Template {
  id: string;
  role: string;
  industry: string;
  level: string;
  data: ResumeData;
}

const TEMPLATES: Template[] = [
  {
    id: "swe",
    role: "Software Engineer",
    industry: "Technology",
    level: "Mid-level",
    data: {
      fullName: "[Your Name]",
      email: "[your.email@example.com]",
      phone: "[Your Phone]",
      location: "[City, State]",
      linkedIn: "",
      portfolio: "",
      summary:
        "Software Engineer with 3+ years of experience building scalable web applications. Proficient in React, Node.js, and cloud services. Passionate about writing clean, maintainable code and improving developer experience.",
      skills: [
        "JavaScript",
        "TypeScript",
        "React",
        "Node.js",
        "PostgreSQL",
        "AWS",
        "Docker",
        "Git",
        "REST APIs",
        "Agile/Scrum",
      ],
      experiences: [
        {
          id: "swe-exp-1",
          title: "Software Engineer",
          company: "[Company Name]",
          location: "[City, State]",
          startDate: "2022-01",
          endDate: "",
          current: true,
          highlights: [
            "Built and maintained React dashboard serving 10K+ daily active users with 99.9% uptime",
            "Reduced API response times by 45% through query optimization and caching strategies",
            "Led migration from JavaScript to TypeScript, reducing production bugs by 30%",
            "Mentored 2 junior developers through code reviews and pair programming sessions",
          ],
        },
      ],
      education: [
        {
          id: "swe-edu-1",
          degree: "B.S. Computer Science",
          institution: "[University Name]",
          location: "[City, State]",
          graduationYear: "2021",
          gpa: "",
        },
      ],
    },
  },
  {
    id: "marketing",
    role: "Marketing Manager",
    industry: "Marketing",
    level: "Mid-level",
    data: {
      fullName: "[Your Name]",
      email: "[your.email@example.com]",
      phone: "[Your Phone]",
      location: "[City, State]",
      linkedIn: "",
      portfolio: "",
      summary:
        "Results-driven Marketing Manager with 4+ years of experience leading digital campaigns, growing brand awareness, and driving revenue growth. Skilled in SEO, paid advertising, content strategy, and data-driven decision making.",
      skills: [
        "Digital Marketing",
        "SEO/SEM",
        "Google Analytics",
        "Content Strategy",
        "Social Media Marketing",
        "Email Marketing",
        "A/B Testing",
        "HubSpot",
        "Budget Management",
        "Team Leadership",
      ],
      experiences: [
        {
          id: "mkt-exp-1",
          title: "Marketing Manager",
          company: "[Company Name]",
          location: "[City, State]",
          startDate: "2022-06",
          endDate: "",
          current: true,
          highlights: [
            "Managed $500K annual marketing budget, achieving 3.2x ROI on paid campaigns",
            "Grew organic traffic by 120% in 12 months through SEO strategy overhaul",
            "Led cross-functional team of 5 to launch product campaign reaching 2M+ impressions",
            "Implemented marketing automation workflows, reducing manual tasks by 60%",
          ],
        },
      ],
      education: [
        {
          id: "mkt-edu-1",
          degree: "B.A. Marketing",
          institution: "[University Name]",
          location: "[City, State]",
          graduationYear: "2020",
          gpa: "",
        },
      ],
    },
  },
  {
    id: "data-analyst",
    role: "Data Analyst",
    industry: "Analytics",
    level: "Entry-level",
    data: {
      fullName: "[Your Name]",
      email: "[your.email@example.com]",
      phone: "[Your Phone]",
      location: "[City, State]",
      linkedIn: "",
      portfolio: "",
      summary:
        "Detail-oriented Data Analyst with strong skills in SQL, Python, and data visualization. Experienced in transforming raw data into actionable business insights. Passionate about using data to drive strategic decisions.",
      skills: [
        "SQL",
        "Python",
        "Tableau",
        "Power BI",
        "Excel",
        "Statistics",
        "Data Cleaning",
        "ETL Pipelines",
        "R",
        "Jupyter Notebooks",
      ],
      experiences: [
        {
          id: "da-exp-1",
          title: "Data Analyst Intern",
          company: "[Company Name]",
          location: "[City, State]",
          startDate: "2024-01",
          endDate: "2024-06",
          current: false,
          highlights: [
            "Analyzed 500K+ customer records to identify retention patterns, improving churn prediction accuracy by 25%",
            "Built interactive Tableau dashboards used by 15 stakeholders for weekly business reviews",
            "Automated monthly reporting pipeline in Python, saving 8 hours per week of manual work",
          ],
        },
      ],
      education: [
        {
          id: "da-edu-1",
          degree: "B.S. Statistics",
          institution: "[University Name]",
          location: "[City, State]",
          graduationYear: "2024",
          gpa: "",
        },
      ],
    },
  },
  {
    id: "pm",
    role: "Product Manager",
    industry: "Technology",
    level: "Mid-level",
    data: {
      fullName: "[Your Name]",
      email: "[your.email@example.com]",
      phone: "[Your Phone]",
      location: "[City, State]",
      linkedIn: "",
      portfolio: "",
      summary:
        "Product Manager with 5+ years of experience leading product strategy and cross-functional teams. Track record of shipping customer-centric features that drive engagement and revenue. Strong technical background with excellent stakeholder communication skills.",
      skills: [
        "Product Strategy",
        "Agile/Scrum",
        "User Research",
        "Data Analysis",
        "Roadmap Planning",
        "A/B Testing",
        "JIRA",
        "Figma",
        "SQL",
        "Stakeholder Management",
      ],
      experiences: [
        {
          id: "pm-exp-1",
          title: "Senior Product Manager",
          company: "[Company Name]",
          location: "[City, State]",
          startDate: "2021-03",
          endDate: "",
          current: true,
          highlights: [
            "Owned product roadmap for B2B SaaS platform generating $12M ARR with 30% YoY growth",
            "Launched self-serve onboarding flow that increased trial-to-paid conversion by 40%",
            "Conducted 50+ user interviews to validate feature hypotheses, reducing build waste by 35%",
            "Coordinated 3 engineering squads (15 engineers) to deliver quarterly releases on schedule",
          ],
        },
      ],
      education: [
        {
          id: "pm-edu-1",
          degree: "MBA",
          institution: "[Business School Name]",
          location: "[City, State]",
          graduationYear: "2020",
          gpa: "",
        },
      ],
    },
  },
];

export default function ExampleTemplates({ onSelect, onCancel }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="jr-examples">
      <div className="jr-examples-header">
        <h2>Choose a template</h2>
        <p>
          Pick a professional template pre-filled with industry-specific content.
          You can edit every field after selecting.
        </p>
      </div>

      <div className="jr-examples-grid">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            className={`jr-example-card ${
              selected === t.id ? "jr-example-card-selected" : ""
            }`}
            onClick={() => setSelected(t.id)}
          >
            <div className="jr-example-card-header">
              <span className="jr-example-role">{t.role}</span>
              <span className="jr-example-level">{t.level}</span>
            </div>
            <span className="jr-example-industry">{t.industry}</span>
            <p className="jr-example-preview">
              {t.data.summary.slice(0, 100)}...
            </p>
            <div className="jr-example-skills">
              {t.data.skills.slice(0, 4).map((s) => (
                <span key={s} className="jr-example-skill-tag">
                  {s}
                </span>
              ))}
              {t.data.skills.length > 4 && (
                <span className="jr-example-skill-tag jr-example-skill-more">
                  +{t.data.skills.length - 4}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="jr-examples-actions">
        <button className="jr-btn jr-btn-secondary" onClick={onCancel}>
          Back to options
        </button>
        <button
          className="jr-btn jr-btn-primary"
          disabled={!selected}
          onClick={() => {
            const template = TEMPLATES.find((t) => t.id === selected);
            if (template) onSelect(template.data);
          }}
        >
          Use this template
        </button>
      </div>
    </div>
  );
}
