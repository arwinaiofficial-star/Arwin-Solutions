"use client";

import { ResumeData } from "./types";

interface PersonalInfoStepProps {
  data: ResumeData;
  onChange: (field: string, value: string) => void;
}

export default function PersonalInfoStep({
  data,
  onChange,
}: PersonalInfoStepProps) {
  const fields = [
    {
      key: "fullName",
      label: "Full Name",
      placeholder: "John Doe",
      required: true,
    },
    {
      key: "email",
      label: "Email",
      placeholder: "john@example.com",
      type: "email",
      required: true,
    },
    {
      key: "phone",
      label: "Phone",
      placeholder: "+1 (555) 123-4567",
    },
    {
      key: "location",
      label: "Location",
      placeholder: "San Francisco, CA",
    },
    {
      key: "linkedIn",
      label: "LinkedIn",
      placeholder: "linkedin.com/in/johndoe",
    },
    {
      key: "portfolio",
      label: "Portfolio",
      placeholder: "johndoe.com",
    },
  ];

  return (
    <div className="jr-resume-form-grid">
      {fields.map((field) => (
        <div key={field.key} className="jr-input-group">
          <label className="jr-label">
            {field.label}
            {field.required && <span style={{ color: "var(--jr-error)" }}>*</span>}
          </label>
          <input
            type={field.type || "text"}
            className="jr-input"
            placeholder={field.placeholder}
            value={(data[field.key as keyof ResumeData] as string) || ""}
            onChange={(e) => onChange(field.key, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
