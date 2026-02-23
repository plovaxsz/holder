import React, { useState, useMemo } from 'react';
import { 
  Bot, Download, FileText, Layout, 
  Settings, Shield, Users, Zap, Loader2 
} from 'lucide-react';

import { TabKajian } from './components/TabKajian.jsx';
import { TabPenelitian } from './components/TabPenelitian.jsx';
import { TabBRD } from './components/TabBRD.jsx';
import { TabFSD } from './components/TabFSD.jsx';
import { TabCharter } from './components/TabCharter.jsx';

import { 
  ROLE_RATES_2023, 
  PHASE_DISTRIBUTION, 
  getUseCaseComplexity, 
  getActorComplexity,
  TCF_FACTORS,
  EF_FACTORS
} from './constants.js';

import { processDocumentWithAI } from './utils/aiProcessor.js';
import { extractTextFromPdf, extractTextFromDocx } from './utils/fileHelpers.js';
import { generateWordDocument } from './utils/docGenerator.js';

// WARNING: Replace this with your actual key and move to .env for production
const API_KEY = "AIzaSyD_rK7gKL86NliduYi-WQQIg1TG0cdQJdo";

function App() {
  const [activeTab, setActiveTab] = useState('kajian');
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  // --- INITIAL STATE (Standardized for CEISA 4.0) ---
  const [project, setProject] = useState({
    nama: 'Pengembangan Modul Baru CEISA 4.0',
    pengampu: 'Direktorat Informasi Kepabeanan dan Cukai',
    unitPenanggungJawab: 'Subdirektorat Pengembangan Sistem Informasi',
    namaPIC: '',
    kontakPIC: '',
    latarBelakang: '',
    masalahIsu: '',
    targetPenyelesaian: '',
    targetOutcome: '',
    outcomeKeluaran: '',
    businessValue: '',
    alurBisnisProses: '',
    phm: 20,
    
    // MANDATORY: These must be initialized as arrays/objects to prevent .map() crashes
    brdProcessAnalysis: { modul: '', subModul: '', eaMapping: '', notes: '' },
    asIsToBe: [], 
    
    kebutuhanFungsional: [],
    kebutuhanNonFungsional: [],
    risikoBisnis: [],
    bia: { operasional: 'Medium', finansial: 'Low', reputasi: 'Medium', hukum: 'Low', rto: '4h', rpo: '24h' },
    
    actors: [],
    useCases: [],
    tcfImpacts: TCF_FACTORS.reduce((acc, f) => ({ ...acc, [f.id]: 3 }), {}),
    efImpacts: EF_FACTORS.reduce((acc, f) => ({ ...acc, [f.id]: 3 }), {}),
    
    bvEffort: {
      efficiency: { label: 'Med', score: 3 },
      users: { label: '100-500', score: 3 },
      regulatory: { label: 'Recommended', score: 3 },
      bia: { label: 'Med', score: 3 },
      duration: { label: '3-6 Months', score: 3 },
      technology: { label: 'Existing', score: 1 },
      systems: { label: 'None', score: 1 },
      strategy: { label: 'High', score: 1 }
    },

    kakStructure: PHASE_DISTRIBUTION.map((p, i) => ({
      id: `phase-${i}`,
      ...p,
      rate: ROLE_RATES_2023[p.roleId] || 20000000
    })),

    fsdProcess: { asIs: '', toBe: '' },
    fsdMockups: [],
    fsdAccessRights: [],
    fsdDesign: [
      { id: 'd1', item: 'Use Case Diagram', pic: '', link: '' },
      { id: 'd2', item: 'Activity Diagram', pic: '', link: '' },
      { id: 'd3', item: 'Class Diagram', pic: '', link: '' },
      { id: 'd4', item: 'Data Model / ERD', pic: '', link: '' }
    ],
    fsdSourceCode: { pic: '', link: '' },

    charter: {
      scope: '',
      timeline: [
        { id: 1, milestone: 'Analisis & Desain', start: '', end: '', note: '' },
        { id: 2, milestone: 'Development', start: '', end: '', note: '' },
        { id: 3, milestone: 'Testing & UAT', start: '', end: '', note: '' },
        { id: 4, milestone: 'Deployment', start: '', end: '', note: '' }
      ],
      team: [
        { id: 1, name: '', role: 'Project Manager', responsibility: 'Manajemen Proyek' },
        { id: 2, name: '', role: 'System Analyst', responsibility: 'Analisis & Desain' },
        { id: 3, name: '', role: 'Developer', responsibility: 'Coding & Integrasi' }
      ]
    }
  });

 // --- CALCULATIONS (UCP, RAB & Priority) ---
  const calc = useMemo(() => {
    const uaw = (project.actors || []).reduce((acc, a) => acc + getActorComplexity(a.type).weight, 0);
    const uucw = (project.useCases || []).reduce((acc, uc) => acc + getUseCaseComplexity(uc.transactions).weight, 0);
    const uucp = uaw + uucw;

    // --- LOCKED BEA CUKAI STANDARDS ---
    const tcf = 0.87;
    const ef = 0.77;

    // --- MAN-MONTH DERIVATION (MATCHING EXCEL) ---
    const ucp = uucp * tcf * ef;
    const totalPersonHours = ucp * project.phm;
    const workingDays = totalPersonHours / 8;       // WD = PHM / 8
    const totalManMonths = workingDays / 22;        // MM = WD / 22

    const kakTableData = (project.kakStructure || []).map(item => {
      const effortMM = (item.percent / 100) * totalManMonths;
      const cost = effortMM * item.rate;
      return { ...item, effortMM, cost };
    });

    const runningTotalCost = kakTableData.reduce((acc, item) => acc + item.cost, 0);
    const warrantyCost = runningTotalCost * 0.25;
    const subTotal = runningTotalCost + warrantyCost;
    const ppn = subTotal * 0.11;
    const grandTotal = subTotal + ppn;

    const totalBV = Object.values(project.bvEffort).slice(0, 4).reduce((acc, v) => acc + v.score, 0);
    const totalEffort = Object.values(project.bvEffort).slice(4).reduce((acc, v) => acc + v.score, 0);
    const priorityScore = totalBV / (totalEffort || 1);
    let priority = "P3 (Low)";
    if (priorityScore > 2) priority = "P1 (Critical)";
    else if (priorityScore > 1) priority = "P2 (High)";

    return { 
      uaw, uucw, uucp, tcf, ef, ucp, 
      totalPersonHours, workingDays, totalManMonths, // ADDED workingDays HERE
      kakTableData, runningTotalCost, warrantyCost, subTotal, ppn, grandTotal,
      totalBV, totalEffort, priority
    };
  }, [project]);

  // --- FILE PROCESSING HANDLER ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setUploadedFile(file.name);

    try {
      let text = "";
      if (file.type === "application/pdf") text = await extractTextFromPdf(file);
      else text = await extractTextFromDocx(file);

      // Call high-performance AI model
      const aiResult = await processDocumentWithAI(API_KEY, text);
      
      // Update state catching ALL fields from the Master Prompt
      setProject(prev => ({
        ...prev,
        // Kajian Kebutuhan fields
        nama: aiResult.nama || prev.nama,
        pengampu: aiResult.pengampu || prev.pengampu,
        unitPenanggungJawab: aiResult.unitPenanggungJawab || prev.unitPenanggungJawab,
        namaPIC: aiResult.namaPIC || prev.namaPIC,
        kontakPIC: aiResult.kontakPIC || prev.kontakPIC,
        latarBelakang: aiResult.latarBelakang || prev.latarBelakang,
        masalahIsu: aiResult.masalahIsu || prev.masalahIsu,
        targetPenyelesaian: aiResult.targetPenyelesaian || prev.targetPenyelesaian,
        targetOutcome: aiResult.targetOutcome || prev.targetOutcome,
        outcomeKeluaran: aiResult.outcomeKeluaran || prev.outcomeKeluaran,
        businessValue: aiResult.businessValue || prev.businessValue,
        alurBisnisProses: aiResult.alurBisnisProses || prev.alurBisnisProses,
        bia: aiResult.bia || prev.bia,

        // Array Fields (with safe fallbacks)
        kebutuhanFungsional: aiResult.kebutuhanFungsional || prev.kebutuhanFungsional || [],
        kebutuhanNonFungsional: aiResult.kebutuhanNonFungsional || prev.kebutuhanNonFungsional || [],
        risikoBisnis: aiResult.risikoBisnis || prev.risikoBisnis || [],
        actors: aiResult.actors || prev.actors || [],
        useCases: aiResult.useCases || prev.useCases || [],
        asIsToBe: aiResult.asIsToBe || prev.asIsToBe || [],
        brdProcessAnalysis: aiResult.brdProcessAnalysis || prev.brdProcessAnalysis
      }));
      
      setActiveTab('kajian');
    } catch (err) {
      console.error("AI Processing Error:", err);
      alert("Gagal memproses file. Pastikan API Key aktif dan format file benar.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateArray = (name, id, field, value) => {
    setProject(prev => ({
      ...prev,
      [name]: (prev[name] || []).map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const handleAddArray = (name, newItem) => {
    setProject(prev => ({ ...prev, [name]: [...(prev[name] || []), newItem] }));
  };

  const handleRemoveArray = (name, id) => {
    setProject(prev => ({ ...prev, [name]: (prev[name] || []).filter(i => i.id !== id) }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase">CEISA 4.0 Doc Genie</h1>
              <p className="text-[10px] font-bold text-slate-400">System Analyst Automation</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <label className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl cursor-pointer transition-all">
                <Layout className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold">{loading ? 'Processing...' : uploadedFile || 'Import TOR'}</span>
                <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.docx" disabled={loading} />
             </label>
             <button 
                onClick={() => generateWordDocument(project, calc)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-xl font-bold text-sm"
             >
                <Download className="w-4 h-4" /> Export Word
             </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        <nav className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
           {[
             { id: 'kajian', label: '1. Kajian Kebutuhan', icon: FileText },
             { id: 'penelitian', label: '2. Penelitian (UCP)', icon: Zap },
             { id: 'brd', label: '3. BRD', icon: Users },
             { id: 'fsd', label: '4. FSD', icon: Settings },
             { id: 'charter', label: '5. Charter', icon: Shield }
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all
                 ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}
               `}
             >
               <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-blue-400' : ''}`} />
               {tab.label}
             </button>
           ))}
        </nav>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
             <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
             <h2 className="text-xl font-black text-slate-800">AI Genie is analyzing...</h2>
          </div>
        ) : (
          <div className="flex-1">
            {activeTab === 'kajian' && <TabKajian project={project} setProject={setProject} uploadedFile={uploadedFile} handleUpdateArray={handleUpdateArray} handleAddArray={handleAddArray} handleRemoveArray={handleRemoveArray} />}
            {activeTab === 'penelitian' && <TabPenelitian project={project} setProject={setProject} calc={calc} handleUpdateArray={handleUpdateArray} handleAddArray={handleAddArray} handleRemoveArray={handleRemoveArray} />}
            {activeTab === 'brd' && <TabBRD project={project} setProject={setProject} uploadedFile={uploadedFile} calc={calc} handleUpdateArray={handleUpdateArray} handleAddArray={handleAddArray} handleRemoveArray={handleRemoveArray} />}
            {activeTab === 'fsd' && <TabFSD project={project} setProject={setProject} uploadedFile={uploadedFile} handleUpdateArray={handleUpdateArray} handleAddArray={handleAddArray} handleRemoveArray={handleRemoveArray} />}
            {activeTab === 'charter' && <TabCharter project={project} setProject={setProject} calc={calc} />}
          </div>
        )}
      </main>

      <footer className="p-4 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest border-t bg-white">
        Internal Property of IKC Customs Indonesia © 2026
      </footer>
    </div>
  );
}

export default App;