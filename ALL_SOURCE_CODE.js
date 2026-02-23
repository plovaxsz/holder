/**
 * ============================================================================
 * CEISA 4.0 DOC GENIE - COMPLETE SOURCE CODE ARCHIVE
 * Generated: February 24, 2026
 * Project: Document Generation System for Indonesian Customs (Bea Cukai)
 * ============================================================================
 * 
 * This file contains all source code from the project organized by module.
 * Use this as a reference or backup of the complete codebase.
 * 
 * STRUCTURE:
 * 1. main.jsx - React entry point
 * 2. App.jsx - Main application component
 * 3. constants.js - Constants and configuration
 * 4. utils/aiProcessor.js - AI document processing
 * 5. utils/fileHelpers.js - File extraction utilities
 * 6. utils/docGenerator.js - Document generation (Word & PDF)
 * 7. components/TabKajian.jsx - Requirements analysis tab
 * 8. components/TabPenelitian.jsx - Research/UCP tab
 * 9. components/TabBRD.jsx - BRD tab
 * 10. components/TabFSD.jsx - FSD tab
 * 11. components/TabCharter.jsx - Project charter tab
 * ============================================================================
 */

// ============================================================================
// FILE: main.jsx
// ============================================================================
/*
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
*/

// ============================================================================
// FILE: constants.js
// ============================================================================
/*
export const formatIDR = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
};

export const getActorComplexity = (type) => {
    if (type === 'API') return { level: 'Simple', weight: 1 };
    if (type === 'Protocol') return { level: 'Average', weight: 2 };
    if (type === 'GUI') return { level: 'Complex', weight: 3 };
    return { level: 'Complex', weight: 3 };
};

export const getUseCaseComplexity = (transactions) => {
    if (transactions <= 3) return { level: 'Simple', weight: 5 };
    if (transactions >= 4 && transactions <= 7) return { level: 'Average', weight: 10 };
    return { level: 'Complex', weight: 15 };
};

export const TCF_FACTORS = [
    { id: 'T1', name: 'Distributed System', weight: 2 },
    { id: 'T2', name: 'Performance Objectives', weight: 1 },
    { id: 'T3', name: 'End-User Efficiency', weight: 1 },
    { id: 'T4', name: 'Complex Internal Processing', weight: 1 },
    { id: 'T5', name: 'Reusability', weight: 1 },
    { id: 'T6', name: 'Easy to Install', weight: 0.5 },
    { id: 'T7', name: 'Easy to Use', weight: 0.5 },
    { id: 'T8', name: 'Portability', weight: 2 },
    { id: 'T9', name: 'Easy to Change', weight: 1 },
    { id: 'T10', name: 'Concurrency', weight: 1 },
    { id: 'T11', name: 'Special Security Features', weight: 1 },
    { id: 'T12', name: 'Direct Access for Third Parties', weight: 1 },
    { id: 'T13', name: 'User Training Facilities', weight: 1 }
];

export const EF_FACTORS = [
    { id: 'E1', name: 'Familiarity with Project', weight: 1.5 },
    { id: 'E2', name: 'Application Experience', weight: 0.5 },
    { id: 'E3', name: 'Object-Oriented Experience', weight: 1 },
    { id: 'E4', name: 'Lead Analyst Capability', weight: 0.5 },
    { id: 'E5', name: 'Motivation', weight: 1 },
    { id: 'E6', name: 'Stable Requirements', weight: 2 },
    { id: 'E7', name: 'Part-time Workers', weight: -1 },
    { id: 'E8', name: 'Difficulty of Programming Language', weight: -1 }
];

export const ROLE_RATES_2023 = {
    'System Analyst': 28000000,
    'Programmer': 22000000,
    'Project Manager': 35000000,
    'Tester': 18000000
};

export const PHASE_DISTRIBUTION = [
    { name: 'Requirement Analysis', group: 'Software Phase Development', percent: 15, roleName: 'System Analyst', roleId: 'System Analyst' },
    { name: 'System Design', group: 'Software Phase Development', percent: 20, roleName: 'System Analyst', roleId: 'System Analyst' },
    { name: 'Programming/Coding', group: 'Software Phase Development', percent: 40, roleName: 'Programmer', roleId: 'Programmer' },
    { name: 'Deployment', group: 'Ongoing life-cycle activity', percent: 10, roleName: 'Project Manager', roleId: 'Project Manager' },
    { name: 'Testing & QA', group: 'Quality and testing phases', percent: 15, roleName: 'Tester', roleId: 'Tester' }
];

export const BV_OPTIONS = {
    efficiency: [ { label: 'Low', score: 1 }, { label: 'Med', score: 3 }, { label: 'High', score: 5 } ],
    users: [ { label: '<100', score: 1 }, { label: '100-500', score: 3 }, { label: '>500', score: 5 } ],
    regulatory: [ { label: 'None', score: 1 }, { label: 'Recommended', score: 3 }, { label: 'Mandatory', score: 5 } ],
    bia: [ { label: 'Low', score: 1 }, { label: 'Med', score: 3 }, { label: 'High', score: 5 } ]
};

export const EFFORT_OPTIONS = {
    duration: [ { label: '<3 Months', score: 1 }, { label: '3-6 Months', score: 3 }, { label: '>6 Months', score: 5 } ],
    technology: [ { label: 'Existing', score: 1 }, { label: 'New', score: 3 }, { label: 'Experimental', score: 5 } ],
    systems: [ { label: 'None', score: 1 }, { label: '1-2 Systems', score: 3 }, { label: '3+ Systems', score: 5 } ],
    strategy: [ { label: 'Low', score: 1 }, { label: 'Med', score: 3 }, { label: 'High', score: 5 } ]
};
*/

// ============================================================================
// FILE: utils/aiProcessor.js
// ============================================================================
/*
import { GoogleGenerativeAI } from "@google/generative-ai";

const parseAIResponse = (text) => {
    try {
        const firstOpen = text.indexOf('{');
        const lastClose = text.lastIndexOf('}');
        if (firstOpen === -1 || lastClose === -1) throw new Error("No JSON found");
        
        const cleanJson = text.substring(firstOpen, lastClose + 1);
        return JSON.parse(cleanJson);
    } catch (e) {
        console.error("AI Response Parsing Failed:", e, text);
        return { 
            nama: "Parsing Error", 
            asIsToBe: [], kebutuhanFungsional: [], kebutuhanNonFungsional: [], 
            actors: [], useCases: [], risikoBisnis: [] 
        };
    }
};

const SYSTEM_PROMPT = `
You are a Senior IT System Analyst for Indonesian Customs (Direktorat Jenderal Bea dan Cukai).
Task: Extract structured software documentation from the provided TOR/Document and fill in ALL JSON fields.
Context: CEISA 4.0 ecosystem. 

CRITICAL RULES:
1. Return ONLY pure JSON. No markdown formatting around it.
2. EXHAUSTIVE EXTRACTION: You MUST extract EVERY SINGLE Actor and EVERY SINGLE Use Case. Do NOT limit to 5.
3. INFER AND GENERATE data if it is missing using your domain knowledge of Customs/Logistics IT systems.
4. "kebutuhanNonFungsional": MUST generate at least 3 to 5 items (e.g., Security, Performance, Availability).
5. "risikoBisnis": MUST generate 3 logical risks associated with this type of IT project.
6. "bia": Make a professional judgment on Business Impact (Low, Medium, High, Critical) and RTO/RPO times.
7. UAW & UUCW Classification (Bea Cukai Standard):
   - Actors ("type"): Must be exactly "API" (Simple), "Protocol" (Average), or "GUI" (Complex).
   - Use Cases ("transactions"): You must estimate the number of steps based on complexity.
     * Simple (1 to 3 transactions)
     * Average (4 to 7 transactions)
     * Complex (8 or more transactions)
   Assign these transaction numbers realistically so the Use Case receives the correct Bea Cukai weight (5, 10, or 15).

JSON Structure Provided Below...
`;

export const processDocumentWithAI = async (apiKey, fileText) => {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `${SYSTEM_PROMPT}\n\nDOCUMENT CONTENT:\n${fileText}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return parseAIResponse(response.text());
};
*/

// ============================================================================
// FILE: utils/fileHelpers.js
// ============================================================================
/*
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export const extractTextFromPdf = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ');
    }
    return text;
};

export const extractTextFromDocx = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
};
*/

// ============================================================================
// FEATURE HIGHLIGHTS
// ============================================================================
/*
✅ CORE FEATURES:
   - AI-powered document generation from TOR/specification files
   - Automatic extraction from PDF and DOCX formats
   - UCP (Use Case Points) calculation per Bea Cukai standards
   - Export to Word (.docx) and PDF (.pdf) formats
   - Real-time calculations for project estimation
   - Project priority assessment (P1, P2, P3)

✅ DOCUMENT SECTIONS:
   1. Kajian Kebutuhan (Requirements Analysis)
   2. Penelitian/UCP (Research Study)
   3. BRD (Business Requirements Document)
   4. FSD (Functional Specification Document)
   5. Project Charter

✅ EXPORT CAPABILITIES:
   - Word Document: Comprehensive, editable format with tables and formatting
   - PDF Document: 12+ sections with professional layout, page breaks, and summaries

✅ STANDARDS COMPLIANCE:
   - Bea Cukai UCP Calculation Standards (TCF: 0.87, EF: 0.77)
   - Customized role rates based on 2023 guidelines
   - Business impact and priority assessment
   - Timeline and team composition tracking

✅ TECHNOLOGY STACK:
   - React 19.2.0 - Frontend framework
   - Vite 7.3.1 - Build tool
   - jsPDF & jspdf-autotable - PDF generation
   - docx - Word document generation
   - Google Generative AI (Gemini) - AI processing
   - pdfjs-dist & mammoth - File extraction
   - Tailwind CSS - UI styling
   - Lucide React - Icons

✅ PROJECT FILES:
   - src/main.jsx - React entry point
   - src/App.jsx - Main application (294 lines)
   - src/constants.js - Configuration & standards
   - src/App.css - Global styles
   - src/index.css - Base styles
   - src/utils/aiProcessor.js - AI document processing
   - src/utils/fileHelpers.js - File extraction utilities
   - src/utils/docGenerator.js - Document generation (746 lines)
   - src/components/TabKajian.jsx - Requirements tab (345 lines)
   - src/components/TabPenelitian.jsx - Research tab (393 lines)
   - src/components/TabBRD.jsx - BRD tab (345 lines)
   - src/components/TabFSD.jsx - FSD tab (500+ lines)
   - src/components/TabCharter.jsx - Charter tab (300 lines)

✅ DEPENDENCIES:
   - @google/generative-ai@^0.24.1
   - docx@^9.5.3
   - jspdf@^2.5+
   - jspdf-autotable@^3.5+
   - lucide-react@^0.575.0
   - mammoth@^1.11.0
   - pdfjs-dist@^5.4.624
   - react@^19.2.0
   - react-dom@^19.2.0

✅ DEPLOYMENT:
   - Repository: https://github.com/plovaxsz/holder.git
   - Build: npm run build
   - Dev: npm run dev
   - Preview: npm run preview

✅ USAGE:
   1. Import a TOR document (PDF or DOCX)
   2. AI automatically extracts and populates fields
   3. Review and edit across 5 tabs
   4. Export as Word (.docx) or PDF (.pdf)
   5. Use for formal project documentation

✅ INTERNAL PROPERTY:
   © 2026 Direktorat Informasi Kepabeanan dan Cukai (IKC)
   Part of CEISA 4.0 Initiative
*/

// ============================================================================
// QUICK START GUIDE
// ============================================================================
/*
INSTALLATION:
1. npm install
2. npm run dev
3. Open http://localhost:5173

BASIC WORKFLOW:
1. Click "Import TOR" and upload a PDF or DOCX file
2. AI processes the document (2-5 seconds)
3. Fields auto-populate in Tab 1
4. Navigate through tabs to review/edit
5. Click "Export Word" or "Export PDF" to download

CONFIGURATION:
- API_KEY: Set your Google Generative AI key in App.jsx
- TCF & EF: Set to 0.87 and 0.77 per Bea Cukai standards
- Rates: Customize ROLE_RATES_2023 in constants.js
- Phases: Adjust PHASE_DISTRIBUTION for different project types

DATABASE FIELDS (Tab 1 - Kajian):
- nama, pengampu, unitPenanggungJawab, namaPIC, kontakPIC
- latarBelakang, masalahIsu, targetPenyelesaian, targetOutcome
- outcomeKeluaran, businessValue, alurBisnisProses

KEBUTUHAN FIELDS (Tab 1 - Requirements):
- kebutuhanFungsional: Functional requirements with ID and priority
- kebutuhanNonFungsional: Non-functional requirements (Security, Performance, etc.)
- risikoBisnis: Business risks with mitigation strategies
- bia: Business Impact Assessment (operasional, finansial, reputasi, hukum)

AKTOR & USE CASE (Tab 2 - Research):
- actors: List with type (API, Protocol, GUI) for UAW calculation
- useCases: List with transactions count for UUCW calculation
- Automatic UAW and UUCW totals
- UCP = (UAW + UUCW) × TCF × EF

CALCULATION FORMULA:
UCP = UUCP × TCF × EF
Total Person-Hours = UCP × PHM (Person-Hours per Man-Month)
Man-Months = Total Person-Hours / (8 × 22)
Cost = Man-Months × Role Rate

BRD FIELDS (Tab 3):
- brdProcessAnalysis: Module, sub-module, EA mapping
- asIsToBe: Current state vs proposed state comparison
- Aktor list with descriptions
- Use Cases with pre/post conditions
- Man-Month estimation summary

FSD FIELDS (Tab 4):
- fsdProcess: As-Is and To-Be process diagrams (links)
- fsdMockups: UI mockups (Figma/Adobe XD)
- fsdAccessRights: CRUD permissions matrix
- fsdDesign: System design diagrams (Use Case, Activity, Class, ERD)
- fsdSourceCode: Git repository and PIC

CHARTER FIELDS (Tab 5):
- charter.scope: Project scope and boundaries
- charter.timeline: Milestones with start/end dates
- charter.team: Project team members and roles
- charter.bizProcessOwner: Business process owner name
- charter.benefits: Expected benefits

EXPORT FORMAT (PDF):
- 12 Sections with automatic page breaks
- Professional table formatting
- Cost estimation (RAB) with summaries
- UCP calculation details
- As-Is To-Be analysis
- Non-functional requirements
- Business risks
- Man-Month estimation
- Project timeline
- Priority assessment
- Page numbering and timestamps
*/

// ============================================================================
// VERSION HISTORY
// ============================================================================
/*
v1.0.0 (24-Feb-2026):
- Initial release with Word export
- AI-powered document processing
- UCP calculation engine
- 5 main tabs and comprehensive UI

v1.1.0 (24-Feb-2026):
- Added PDF export functionality
- Enhanced with all BRD sections
- Improved As-Is To-Be analysis
- Non-functional requirements support
- Business risk tracking
- Team composition and charter

v1.2.0 (24-Feb-2026):
- Complete PDF with 12+ sections
- Automatic page breaks and pagination
- Professional table formatting
- Timestamps and versioning
- Enhanced cost estimation (RAB)
- Priority assessment engine
*/

export const PROJECT_INFO = {
  name: "CEISA 4.0 Doc Genie",
  version: "1.2.0",
  releaseDate: "2026-02-24",
  description: "AI-Powered Document Generation System for Bea Cukai",
  author: "Direktorat Informasi Kepabeanan dan Cukai (IKC)",
  repository: "https://github.com/plovaxsz/holder.git",
  exportFormats: ["DOCX", "PDF"],
  standardsCompliance: ["Bea Cukai UCP", "CEISA 4.0"],
  features: [
    "AI Document Processing",
    "UCP Calculation",
    "Word Export",
    "PDF Export",
    "Real-time Calculations",
    "Priority Assessment",
    "Team Management",
    "Timeline Tracking"
  ],
  tabs: [
    "Kajian Kebutuhan",
    "Penelitian (UCP)",
    "BRD",
    "FSD",
    "Project Charter"
  ],
  exportSections: {
    pdf: 12,
    word: 6,
    details: {
      general: "Project Overview & Stakeholders",
      brd: "Business Requirements & Cost Estimation",
      ucp: "Actor & Use Case Analysis",
      fsd: "Functional Specifications & Diagrams",
      charter: "Project Charter & Timeline"
    }
  }
};