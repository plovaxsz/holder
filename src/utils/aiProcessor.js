import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Clean and parse AI response to ensure valid JSON
 */
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

/**
 * MASTER PROMPT: Tailored for IKC / Bea Cukai Document Extraction
 */
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
   - Use Cases ("transactions"): You must estimate the number of steps based on complexity:
     * Simple (1 to 3 transactions)
     * Average (4 to 7 transactions)
     * Complex (8 or more transactions)
   Assign these transaction numbers realistically so the Use Case receives the correct Bea Cukai weight (5, 10, or 15).

JSON Structure:
{
  "nama": "Project Name",
  "pengampu": "Extract unit name or default to 'Direktorat Informasi Kepabeanan dan Cukai'",
  "unitPenanggungJawab": "Extract or default to 'Subdirektorat Pengembangan Sistem Informasi'",
  "namaPIC": "Extract name if available, else '-'",
  "kontakPIC": "Extract contact if available, else '-'",
  "latarBelakang": "Extract or summarize the background",
  "masalahIsu": "Extract or explicitly infer the pain points the system solves",
  "targetPenyelesaian": "Extract date/timeline or infer 'Q4 2026'",
  "targetOutcome": "What is the end goal of this system?",
  "outcomeKeluaran": "Tangible outputs (e.g., Web App, API Integration)",
  "businessValue": "Why does Bea Cukai need this?",
  "alurBisnisProses": "Write a 2-3 sentence summary of the proposed system workflow",
  "bia": { "operasional": "High", "finansial": "Medium", "reputasi": "High", "hukum": "Medium", "rto": "4h", "rpo": "24h" },
  "risikoBisnis": [
    { "id": "1", "risk": "Server downtime", "impact": "Data delayed", "mitigasi": "Auto-Scaling", "level": "Tinggi" }
  ],
  "kebutuhanNonFungsional": [
    { "id": "NFR-1", "kategori": "Security", "deskripsi": "Data must be encrypted at rest." }
  ],
  "brdProcessAnalysis": { "modul": "...", "subModul": "...", "eaMapping": "...", "notes": "..." },
  "asIsToBe": [{ "id": "1", "factor": "Speed", "asIs": "Manual", "toBe": "Automated" }],
  "kebutuhanFungsional": [{ "id": "FR-01", "deskripsi": "...", "prioritas": "Mandatory" }],
  "actors": [{ "id": "1", "name": "Petugas Bea Cukai", "type": "GUI", "desc": "Internal customs user" }],
  "useCases": [{ "id": "1", "subSystem": "Pabean", "name": "Perekaman Dokumen", "transactions": 5, "actorRef": "Petugas Bea Cukai", "preCond": "User logged in", "postCond": "Doc saved" }]
}
`;

export const processDocumentWithAI = async (apiKey, fileText) => {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Using flash for speed, it handles JSON mapping excellently
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `${SYSTEM_PROMPT}\n\nDOCUMENT CONTENT:\n${fileText}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return parseAIResponse(response.text());
};