"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth, GeneratedCV, WorkExperience, Education } from "@/context/AuthContext";
import { SendIcon, BotIcon, UserIcon, CheckIcon, EyeIcon, SearchIcon, ArrowRightIcon } from "@/components/icons/Icons";

interface Message {
  id: string;
  role: "bot" | "user";
  content: string;
  options?: string[];
  inputType?: "text" | "textarea" | "select" | "multiselect";
  selectOptions?: string[];
  stepIndex?: number; // Track which step this message belongs to for editing
  field?: string; // Field name for edit functionality
  isEditable?: boolean; // Whether this response can be edited
}

interface CVFormData {
  hasExistingCV: boolean | null;
  // Personal Info
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedIn: string;
  portfolio: string;
  // Professional Summary
  summary: string;
  yearsOfExperience: string;
  // Skills
  skills: string[];
  // Work Experience
  experiences: WorkExperience[];
  // Education
  education: Education[];
  // Education form fields
  education_degree: string;
  education_institution: string;
  education_year: string;
  // Additional
  certifications: string[];
  languages: string[];
}

const QUESTIONNAIRE_STEPS = [
  {
    id: "welcome",
    question: "Welcome to JobReady.ai! I'm your AI assistant. I'll help you create an ATS-friendly CV and find the perfect job. Do you have an existing CV you'd like to upload, or would you like to create a new one?",
    options: ["I have a CV to upload", "Create a new CV for me"],
    field: "hasExistingCV",
  },
  {
    id: "fullName",
    question: "Let's start with your full name as it should appear on your CV.",
    inputType: "text",
    field: "fullName",
    placeholder: "e.g., Rahul Sharma",
  },
  {
    id: "email",
    question: "What's your professional email address?",
    inputType: "text",
    field: "email",
    placeholder: "e.g., rahul.sharma@email.com",
  },
  {
    id: "phone",
    question: "Your contact phone number?",
    inputType: "text",
    field: "phone",
    placeholder: "e.g., +91 98765 43210",
  },
  {
    id: "location",
    question: "Where are you currently located?",
    inputType: "select",
    field: "location",
    selectOptions: ["Bangalore", "Hyderabad", "Mumbai", "Pune", "Chennai", "Delhi NCR", "Noida", "Gurgaon", "Remote", "Other"],
  },
  {
    id: "linkedIn",
    question: "Do you have a LinkedIn profile? (Optional - press Enter to skip)",
    inputType: "text",
    field: "linkedIn",
    placeholder: "e.g., linkedin.com/in/yourprofile",
    optional: true,
  },
  {
    id: "yearsOfExperience",
    question: "How many years of work experience do you have?",
    inputType: "select",
    field: "yearsOfExperience",
    selectOptions: ["Fresher (0-1 years)", "1-3 years", "3-5 years", "5-8 years", "8-12 years", "12+ years"],
  },
  {
    id: "skills",
    question: "List your key technical skills (comma-separated). These will be highlighted in your CV for ATS optimization.",
    inputType: "textarea",
    field: "skills",
    placeholder: "e.g., React, Node.js, Python, SQL, AWS, Git, JavaScript, TypeScript",
  },
  {
    id: "experience_count",
    question: "How many work experiences would you like to add? (Enter a number, or 0 if you're a fresher)",
    inputType: "text",
    field: "experience_count",
    placeholder: "e.g., 2",
  },
  {
    id: "education_degree",
    question: "What is your highest degree/qualification?",
    inputType: "text",
    field: "education_degree",
    placeholder: "e.g., B.Tech in Computer Science",
  },
  {
    id: "education_institution",
    question: "Which institution did you graduate from?",
    inputType: "text",
    field: "education_institution",
    placeholder: "e.g., IIT Delhi",
  },
  {
    id: "education_year",
    question: "What year did you graduate?",
    inputType: "text",
    field: "education_year",
    placeholder: "e.g., 2022",
  },
  {
    id: "summary",
    question: "Finally, write a brief professional summary (2-3 sentences) highlighting your key strengths and career goals. Or type 'auto' and I'll generate one for you!",
    inputType: "textarea",
    field: "summary",
    placeholder: "e.g., Experienced Full Stack Developer with 5+ years of expertise in React and Node.js...",
  },
];

interface AgenticChatProps {
  onNavigateToSearch?: () => void;
}

export default function AgenticChat({ onNavigateToSearch }: AgenticChatProps) {
  const { user, saveGeneratedCV, updateProfile } = useAuth();
  
  // Initialize messages with welcome message (lazy initialization)
  const getInitialMessages = (): Message[] => {
    const welcomeStep = QUESTIONNAIRE_STEPS[0];
    return [{
      id: "welcome",
      role: "bot",
      content: welcomeStep.question,
      options: welcomeStep.options,
    }];
  };
  
  const [messages, setMessages] = useState<Message[]>(getInitialMessages);
  const [currentStep, setCurrentStep] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [formData, setFormData] = useState<CVFormData>({
    hasExistingCV: null,
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: "",
    linkedIn: "",
    portfolio: "",
    summary: "",
    yearsOfExperience: "",
    skills: [],
    experiences: [],
    education: [],
    education_degree: "",
    education_institution: "",
    education_year: "",
    certifications: [],
    languages: [],
  });
  const [experienceCount, setExperienceCount] = useState(0);
  const [currentExperienceIndex, setCurrentExperienceIndex] = useState(0);
  const [currentExperienceField, setCurrentExperienceField] = useState<string | null>(null);
  const [tempExperience, setTempExperience] = useState<Partial<WorkExperience>>({});
  const [generatedCV, setGeneratedCV] = useState<GeneratedCV | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [cvAccepted, setCvAccepted] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Calculate progress percentage
  const progressPercentage = Math.min(
    Math.round((currentStep / (QUESTIONNAIRE_STEPS.length - 1)) * 100),
    100
  );

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, [currentStep]);

  // Counter for unique message IDs
  const messageCounterRef = useRef(0);

  const addMessage = useCallback((role: "bot" | "user", content: string, options?: string[], inputType?: Message["inputType"], selectOptions?: string[], stepIndex?: number, field?: string, isEditable?: boolean) => {
    messageCounterRef.current += 1;
    setMessages(prev => [...prev, {
      id: `msg_${Date.now()}_${messageCounterRef.current}`,
      role,
      content,
      options,
      inputType,
      selectOptions,
      stepIndex,
      field,
      isEditable: isEditable ?? (role === "user" && !options),
    }]);
  }, []);

  // Start editing a message
  const handleEditMessage = (messageId: string, currentContent: string) => {
    setEditingMessageId(messageId);
    setEditValue(currentContent);
  };

  // Save edited message
  const handleSaveEdit = (messageId: string, field?: string) => {
    if (!editValue.trim()) return;
    
    // Update the message content
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, content: editValue } : msg
    ));
    
    // Update the form data based on the field
    if (field) {
      if (field === "skills") {
        const skillsArray = editValue.split(",").map(s => s.trim()).filter(s => s);
        setFormData(prev => ({ ...prev, skills: skillsArray }));
      } else {
        setFormData(prev => ({ ...prev, [field]: editValue }));
      }
    }
    
    setEditingMessageId(null);
    setEditValue("");
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditValue("");
  };

  const generateAutoSummary = () => {
    const yearsMap: { [key: string]: string } = {
      "Fresher (0-1 years)": "a fresh graduate",
      "1-3 years": "1-3 years",
      "3-5 years": "3-5 years",
      "5-8 years": "5-8 years",
      "8-12 years": "8-12 years",
      "12+ years": "12+ years",
    };
    
    const years = yearsMap[formData.yearsOfExperience] || "experience";
    const topSkills = formData.skills.slice(0, 3).join(", ");
    
    return `Results-driven professional with ${years} of experience specializing in ${topSkills}. Proven track record of delivering high-quality solutions and collaborating effectively with cross-functional teams. Seeking challenging opportunities to leverage technical expertise and drive innovation.`;
  };

  const handleExperienceInput = (value: string) => {
    if (!currentExperienceField) {
      // Starting experience collection
      const count = parseInt(value) || 0;
      setExperienceCount(count);
      
      if (count > 0) {
        setCurrentExperienceIndex(0);
        setCurrentExperienceField("title");
        addMessage("user", value);
        addMessage("bot", `Great! Let's add your ${count} work experience(s). For experience #1, what was your job title?`, undefined, "text");
      } else {
        // Skip to education
        addMessage("user", value);
        proceedToNextStep();
      }
      return;
    }

    // Collecting experience fields
    const updatedExp = { ...tempExperience, [currentExperienceField]: value };
    setTempExperience(updatedExp);
    addMessage("user", value);

    const experienceFields = [
      { field: "title", next: "company", question: "Company name?" },
      { field: "company", next: "location", question: "Location?" },
      { field: "location", next: "startDate", question: "Start date (e.g., Jan 2020)?" },
      { field: "startDate", next: "endDate", question: "End date (or 'Present' if current)?" },
      { field: "endDate", next: "highlights", question: "List 2-3 key achievements/responsibilities (comma-separated):" },
    ];

    const currentFieldIndex = experienceFields.findIndex(f => f.field === currentExperienceField);
    
    if (currentExperienceField === "highlights") {
      // Complete this experience
      const completeExp: WorkExperience = {
        title: updatedExp.title || "",
        company: updatedExp.company || "",
        location: updatedExp.location || "",
        startDate: updatedExp.startDate || "",
        endDate: updatedExp.endDate || "",
        current: updatedExp.endDate?.toLowerCase() === "present",
        highlights: value.split(",").map((h: string) => h.trim()),
      };
      
      setFormData(prev => ({
        ...prev,
        experiences: [...prev.experiences, completeExp],
      }));
      
      setTempExperience({});
      
      if (currentExperienceIndex + 1 < experienceCount) {
        // More experiences to collect
        setCurrentExperienceIndex(prev => prev + 1);
        setCurrentExperienceField("title");
        addMessage("bot", `Experience #${currentExperienceIndex + 1} added! Now for experience #${currentExperienceIndex + 2}, what was your job title?`, undefined, "text");
      } else {
        // Done with experiences
        setCurrentExperienceField(null);
        proceedToNextStep();
      }
    } else if (currentFieldIndex !== -1) {
      const nextField = experienceFields[currentFieldIndex];
      setCurrentExperienceField(nextField.next);
      addMessage("bot", nextField.question, undefined, "text");
    }
  };

  const proceedToNextStep = () => {
    const nextStepIndex = currentStep + 1;
    
    if (nextStepIndex >= QUESTIONNAIRE_STEPS.length) {
      // Generate CV
      generateCV();
      return;
    }
    
    setCurrentStep(nextStepIndex);
    const nextStep = QUESTIONNAIRE_STEPS[nextStepIndex];
    
    addMessage(
      "bot",
      nextStep.question,
      nextStep.options,
      nextStep.inputType as Message["inputType"],
      nextStep.selectOptions
    );
  };

  const handleOptionSelect = (option: string) => {
    addMessage("user", option);
    
    if (currentStep === 0) {
      // Handle CV choice
      if (option === "I have a CV to upload") {
        setFormData(prev => ({ ...prev, hasExistingCV: true }));
        addMessage("bot", "Great! Please upload your CV using the upload button above the chat. Once uploaded, I'll help you search for matching jobs.");
        setIsComplete(true);
      } else {
        setFormData(prev => ({ ...prev, hasExistingCV: false }));
        proceedToNextStep();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const step = QUESTIONNAIRE_STEPS[currentStep];
    const value = inputValue.trim();
    
    // Handle experience collection separately
    if (step?.id === "experience_count" || currentExperienceField) {
      handleExperienceInput(value);
      setInputValue("");
      return;
    }
    
    // Handle regular fields
    if (step?.field) {
      if (step.field === "skills") {
        const skillsArray = value.split(",").map(s => s.trim()).filter(s => s);
        setFormData(prev => ({ ...prev, skills: skillsArray }));
      } else if (step.field === "summary") {
        const finalSummary = value.toLowerCase() === "auto" ? generateAutoSummary() : value;
        setFormData(prev => ({ ...prev, summary: finalSummary }));
        addMessage("user", value);
        if (value.toLowerCase() === "auto") {
          addMessage("bot", `I've generated this summary for you: "${finalSummary}"`);
        }
        // Generate CV after summary
        setTimeout(() => generateCV(), 500);
        setInputValue("");
        return;
      } else {
        setFormData(prev => ({ ...prev, [step.field]: value }));
      }
    }
    
    addMessage("user", value);
    setInputValue("");
    proceedToNextStep();
  };

  const handleSelectChange = (value: string) => {
    const step = QUESTIONNAIRE_STEPS[currentStep];
    if (step?.field) {
      setFormData(prev => ({ ...prev, [step.field]: value }));
    }
    addMessage("user", value);
    proceedToNextStep();
  };

  const generateCV = () => {
    addMessage("bot", "Generating your ATS-optimized CV...");
    
    setTimeout(() => {
      const cv: GeneratedCV = {
        id: `cv_${crypto.randomUUID()}`,
        personalInfo: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          linkedIn: formData.linkedIn || undefined,
          portfolio: formData.portfolio || undefined,
        },
        summary: formData.summary,
        skills: formData.skills,
        experience: formData.experiences,
        education: [{
          degree: formData.education_degree || "",
          institution: formData.education_institution || "",
          location: formData.location,
          graduationYear: formData.education_year || "",
        }],
        certifications: formData.certifications,
        languages: formData.languages,
        createdAt: new Date().toISOString(),
      };
      
      setGeneratedCV(cv);
      saveGeneratedCV(cv);
      updateProfile({
        name: formData.fullName,
        phone: formData.phone,
        skills: formData.skills,
      });
      
      addMessage("bot", "🎉 Your ATS-friendly CV has been generated! Review it below and click 'Accept & Find Jobs' to start your job search.");
      setShowPreview(true);
      setIsComplete(true);
    }, 2000);
  };

  const acceptCV = () => {
    if (generatedCV) {
      setCvAccepted(true);
      addMessage("bot", "✅ Excellent! Your CV has been saved and is ready! You can now:\n\n• Search for matching jobs\n• Apply with one click using your CV\n• Track your application status\n\nClick 'Find Jobs Now' below to start searching!");
    }
  };

  const renderCurrentInput = () => {
    const step = QUESTIONNAIRE_STEPS[currentStep];
    
    if (!step || isComplete) return null;
    
    if (step.options) {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)", marginTop: "var(--space-md)" }}>
          {step.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleOptionSelect(option)}
              className="btn btn-secondary"
              style={{ textAlign: "left", justifyContent: "flex-start" }}
            >
              {option}
            </button>
          ))}
        </div>
      );
    }
    
    if (step.inputType === "select" && step.selectOptions) {
      return (
        <select
          className="form-input"
          onChange={(e) => handleSelectChange(e.target.value)}
          defaultValue=""
          style={{ marginTop: "var(--space-md)" }}
        >
          <option value="" disabled>Select an option...</option>
          {step.selectOptions.map((opt, idx) => (
            <option key={idx} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }
    
    return null;
  };

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      height: "600px",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-lg)",
      overflow: "hidden",
      background: "var(--color-surface)",
    }}>
      {/* Chat Header with Progress */}
      <div style={{ 
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-surface-elevated)",
      }}>
        <div style={{ 
          padding: "var(--space-md)", 
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
            <BotIcon size={24} />
            <div>
              <h4 style={{ margin: 0 }}>JobReady AI Assistant</h4>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                {cvAccepted ? "Ready to find jobs!" : isComplete ? "CV Generated - Review below" : "Creating your ATS-optimized CV"}
              </p>
            </div>
          </div>
          {!isComplete && (
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "var(--space-xs)",
              fontSize: "0.75rem",
              color: "var(--color-text-muted)",
            }}>
              <span>Step {currentStep + 1} of {QUESTIONNAIRE_STEPS.length}</span>
            </div>
          )}
          {cvAccepted && (
            <span style={{ 
              padding: "4px 8px", 
              borderRadius: "var(--radius-sm)", 
              background: "var(--color-success)", 
              color: "white", 
              fontSize: "0.75rem",
              fontWeight: 600,
            }}>
              ✓ CV Ready
            </span>
          )}
        </div>
        {/* Progress Bar */}
        {!isComplete && (
          <div style={{ 
            height: "4px", 
            background: "var(--color-border)",
          }}>
            <div style={{ 
              height: "100%", 
              background: "var(--color-primary)", 
              width: `${progressPercentage}%`,
              transition: "width 0.3s ease",
            }} />
          </div>
        )}
      </div>
      
      {/* Messages */}
      <div style={{ 
        flex: 1, 
        overflowY: "auto", 
        padding: "var(--space-md)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-md)",
      }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              gap: "var(--space-sm)",
            }}
          >
            {msg.role === "bot" && (
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <BotIcon size={16} color="white" />
              </div>
            )}
            <div style={{
              maxWidth: "80%",
              position: "relative",
            }}>
              {editingMessageId === msg.id ? (
                // Edit mode
                <div style={{
                  padding: "var(--space-sm)",
                  borderRadius: "var(--radius-lg)",
                  background: "var(--color-surface-highlight)",
                  border: "2px solid var(--color-primary)",
                }}>
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="form-input"
                    style={{ marginBottom: "var(--space-xs)" }}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEdit(msg.id, msg.field);
                      if (e.key === "Escape") handleCancelEdit();
                    }}
                  />
                  <div style={{ display: "flex", gap: "var(--space-xs)" }}>
                    <button 
                      onClick={() => handleSaveEdit(msg.id, msg.field)}
                      className="btn btn-primary"
                      style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                    >
                      Save
                    </button>
                    <button 
                      onClick={handleCancelEdit}
                      className="btn btn-secondary"
                      style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // Display mode
                <div style={{
                  padding: "var(--space-sm) var(--space-md)",
                  borderRadius: "var(--radius-lg)",
                  background: msg.role === "user" ? "var(--color-primary)" : "var(--color-surface-highlight)",
                  color: msg.role === "user" ? "white" : "var(--color-text)",
                  whiteSpace: "pre-wrap",
                }}>
                  {msg.content}
                  {/* Edit button for user messages (only when not complete) */}
                  {msg.role === "user" && msg.isEditable && !isComplete && (
                    <button
                      onClick={() => handleEditMessage(msg.id, msg.content)}
                      style={{
                        display: "block",
                        marginTop: "var(--space-xs)",
                        padding: "2px 6px",
                        fontSize: "0.7rem",
                        background: "rgba(255,255,255,0.2)",
                        border: "none",
                        borderRadius: "var(--radius-sm)",
                        color: "white",
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
                  )}
                </div>
              )}
            </div>
            {msg.role === "user" && (
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "var(--color-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <UserIcon size={16} color="white" />
              </div>
            )}
          </div>
        ))}
        
        {/* Render options or select if available */}
        {renderCurrentInput()}
        
        {/* CV Preview and Action Buttons */}
        {showPreview && generatedCV && (
          <div style={{ 
            background: "var(--color-surface-elevated)",
            padding: "var(--space-md)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
            marginTop: "var(--space-md)",
          }}>
            {/* Action Buttons */}
            <div style={{ 
              display: "flex", 
              gap: "var(--space-sm)", 
              flexWrap: "wrap",
              marginBottom: showPreview ? "var(--space-md)" : 0,
            }}>
              {!cvAccepted ? (
                <>
                  <button 
                    className="btn btn-primary"
                    onClick={acceptCV}
                    style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)", flex: "1 1 auto" }}
                  >
                    <CheckIcon size={16} />
                    Accept & Find Jobs
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setShowPreview(!showPreview)}
                    style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)" }}
                  >
                    <EyeIcon size={16} />
                    {showPreview ? "Hide" : "Preview"}
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="btn btn-primary"
                    onClick={() => onNavigateToSearch?.()}
                    style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)", flex: "1 1 auto" }}
                  >
                    <SearchIcon size={16} />
                    Find Jobs Now
                    <ArrowRightIcon size={16} />
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setShowPreview(!showPreview)}
                    style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)" }}
                  >
                    <EyeIcon size={16} />
                    {showPreview ? "Hide CV" : "View CV"}
                  </button>
                </>
              )}
            </div>
            
            {cvAccepted && (
              <p style={{ 
                fontSize: "0.875rem", 
                color: "var(--color-text-muted)", 
                textAlign: "center",
                marginTop: "var(--space-sm)",
                marginBottom: 0,
              }}>
                Your CV will be automatically attached when you apply for jobs
              </p>
            )}
          </div>
        )}
        
        {/* CV Preview */}
        {showPreview && generatedCV && (
          <div style={{
            background: "white",
            color: "#1a1a2e",
            padding: "var(--space-lg)",
            borderRadius: "var(--radius-md)",
            marginTop: "var(--space-md)",
            fontSize: "0.875rem",
          }}>
            <h3 style={{ marginBottom: "var(--space-xs)", color: "#1a1a2e" }}>{generatedCV.personalInfo.name}</h3>
            <p style={{ color: "#4b5563", marginBottom: "var(--space-sm)" }}>
              {generatedCV.personalInfo.email} | {generatedCV.personalInfo.phone} | {generatedCV.personalInfo.location}
            </p>
            
            <h4 style={{ marginTop: "var(--space-md)", color: "#1a1a2e", borderBottom: "1px solid #e5e7eb", paddingBottom: "var(--space-xs)" }}>Professional Summary</h4>
            <p>{generatedCV.summary}</p>
            
            <h4 style={{ marginTop: "var(--space-md)", color: "#1a1a2e", borderBottom: "1px solid #e5e7eb", paddingBottom: "var(--space-xs)" }}>Skills</h4>
            <p>{generatedCV.skills.join(" • ")}</p>
            
            {generatedCV.experience.length > 0 && (
              <>
                <h4 style={{ marginTop: "var(--space-md)", color: "#1a1a2e", borderBottom: "1px solid #e5e7eb", paddingBottom: "var(--space-xs)" }}>Work Experience</h4>
                {generatedCV.experience.map((exp, idx) => (
                  <div key={idx} style={{ marginBottom: "var(--space-sm)" }}>
                    <p><strong>{exp.title}</strong> at {exp.company}</p>
                    <p style={{ color: "#6b7280", fontSize: "0.8rem" }}>{exp.startDate} - {exp.endDate} | {exp.location}</p>
                    <ul style={{ margin: "var(--space-xs) 0", paddingLeft: "var(--space-md)" }}>
                      {exp.highlights.map((h, i) => <li key={i}>{h}</li>)}
                    </ul>
                  </div>
                ))}
              </>
            )}
            
            <h4 style={{ marginTop: "var(--space-md)", color: "#1a1a2e", borderBottom: "1px solid #e5e7eb", paddingBottom: "var(--space-xs)" }}>Education</h4>
            {generatedCV.education.map((edu, idx) => (
              <p key={idx}><strong>{edu.degree}</strong> - {edu.institution}, {edu.graduationYear}</p>
            ))}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      {!isComplete && !QUESTIONNAIRE_STEPS[currentStep]?.options && !QUESTIONNAIRE_STEPS[currentStep]?.selectOptions && (
        <form onSubmit={handleSubmit} style={{ 
          padding: "var(--space-md)", 
          borderTop: "1px solid var(--color-border)",
          display: "flex",
          gap: "var(--space-sm)",
        }}>
          {QUESTIONNAIRE_STEPS[currentStep]?.inputType === "textarea" ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={QUESTIONNAIRE_STEPS[currentStep]?.placeholder || "Type your answer..."}
              className="form-textarea"
              style={{ flex: 1, minHeight: "60px", resize: "none" }}
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={QUESTIONNAIRE_STEPS[currentStep]?.placeholder || "Type your answer..."}
              className="form-input"
              style={{ flex: 1 }}
            />
          )}
          <button type="submit" className="btn btn-primary" style={{ padding: "var(--space-sm)" }}>
            <SendIcon size={20} />
          </button>
        </form>
      )}
    </div>
  );
}
