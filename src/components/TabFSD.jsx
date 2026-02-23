import React, { useMemo } from 'react';
import { 
    Target, Sparkles, Workflow, Layout, 
    PenTool, Server, Code, Link as LinkIcon, Plus, Trash2, 
    UserCheck, Database, Lock, Globe, Layers, GitBranch
} from 'lucide-react';

export const TabFSD = ({ 
    project, setProject, uploadedFile, handleUpdateArray, handleAddArray, handleRemoveArray 
}) => {

  // Extract available people from Project State
  const availablePeople = useMemo(() => {
      const names = new Set();
      if (project.namaPIC) names.add(project.namaPIC);
      if (project.signatures?.approvedBy?.name) names.add(project.signatures.approvedBy.name);
      if (project.signatures?.preparedBy?.name) names.add(project.signatures.preparedBy.name);
      if (Array.isArray(project.charter?.team)) {
          project.charter.team.forEach((t) => t.name && names.add(t.name));
      }
      return Array.from(names).filter(n => n && n.trim() !== '' && n !== '....................');
  }, [project]);

  return (
    <div className="space-y-8 animate-fade-in pb-12 text-slate-800">
        {/* Datalist for Auto-Suggestion */}
        <datalist id="pic-list">
            {availablePeople.map((name, idx) => (
                <option key={idx} value={name} />
            ))}
        </datalist>

        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex gap-4 items-start">
            <Target className="w-6 h-6 text-emerald-600 mt-1" />
            <div>
                <h3 className="font-bold text-emerald-900 flex items-center gap-2">
                    Functional Specification Document (FSD) {uploadedFile && <Sparkles className="w-4 h-4 text-emerald-500"/>}
                </h3>
                <p className="text-sm text-emerald-700">Spesifikasi teknis mencakup diagram alur, mockup, hak akses, dan arsitektur.</p>
            </div>
        </div>

        {/* 1. DIAGRAM ALUR PROSES BISNIS */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-6 border-b pb-2 text-slate-800"><Workflow className="w-5 h-5 text-blue-600"/> 1. Diagram Alur Proses Bisnis (BPMN)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-bold text-slate-600">Proses Bisnis AS-IS</label>
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500">Saat Ini</span>
                    </div>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-center h-48 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                        <Workflow className="w-10 h-10 text-slate-300 mb-2 group-hover:text-blue-400 transition-colors" />
                        <p className="text-xs text-slate-500 font-medium">Upload Image / Paste Link Diagram As-Is</p>
                        <input 
                            value={project.fsdProcess.asIs} 
                            onChange={e => setProject({...project, fsdProcess: {...project.fsdProcess, asIs: e.target.value}})}
                            placeholder="https://draw.io/..."
                            className="mt-3 w-full text-xs p-2 border rounded text-center bg-white outline-none"
                        />
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-bold text-slate-600">Proses Bisnis TO-BE</label>
                        <span className="text-[10px] bg-emerald-100 px-2 py-0.5 rounded text-emerald-600 font-bold">Usulan</span>
                    </div>
                    <div className="border-2 border-dashed border-emerald-200 rounded-lg p-6 flex flex-col items-center justify-center text-center h-48 bg-emerald-50/30 hover:bg-emerald-50 transition-colors cursor-pointer group">
                        <Workflow className="w-10 h-10 text-emerald-300 mb-2 group-hover:text-emerald-500 transition-colors" />
                        <p className="text-xs text-slate-500 font-medium">Upload Image / Paste Link Diagram To-Be</p>
                        <input 
                            value={project.fsdProcess.toBe} 
                            onChange={e => setProject({...project, fsdProcess: {...project.fsdProcess, toBe: e.target.value}})}
                            placeholder="https://draw.io/..."
                            className="mt-3 w-full text-xs p-2 border rounded text-center bg-white outline-none"
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* 2. MOCK UP */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800"><Layout className="w-5 h-5 text-purple-600"/> 2. Mock Up Antarmuka</h3>
                <button 
                    onClick={() => handleAddArray('fsdMockups', {id: Date.now(), name: 'Halaman Baru', link: ''})} 
                    className="text-xs bg-purple-50 text-purple-600 hover:bg-purple-100 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1"
                >
                    <Plus className="w-3 h-3"/> Tambah Mockup
                </button>
            </div>
            <div className="space-y-3">
                {project.fsdMockups.map((mock, idx) => (
                    <div key={mock.id} className="flex gap-4 items-center group bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="w-6 h-6 flex items-center justify-center bg-purple-200 text-purple-800 rounded-full text-xs font-bold">{idx + 1}</span>
                        <input value={mock.name} onChange={e => handleUpdateArray('fsdMockups', mock.id, 'name', e.target.value)} className="flex-1 text-sm font-medium bg-transparent outline-none placeholder:text-slate-400" placeholder="Nama Halaman / Screen" />
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded border flex-1">
                            <LinkIcon className="w-3 h-3 text-slate-400"/>
                            <input value={mock.link} onChange={e => handleUpdateArray('fsdMockups', mock.id, 'link', e.target.value)} className="flex-1 text-xs bg-transparent outline-none text-blue-600" placeholder="Paste Link Figma / Adobe XD" />
                        </div>
                        <button onClick={() => handleRemoveArray('fsdMockups', mock.id)} className="text-rose-300 hover:text-rose-500"><Trash2 className="w-4 h-4"/></button>
                    </div>
                ))}
            </div>
        </div>

        {/* 3. DAFTAR HAK AKSES */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800"><UserCheck className="w-5 h-5 text-amber-600"/> 3. Daftar Hak Akses Informasi</h3>
                <button 
                    onClick={() => handleAddArray('fsdAccessRights', {id: `ar_${Date.now()}`, role: 'Role Baru', feature: 'Fitur', c: false, r: true, u: false, d: false})} 
                    className="text-xs bg-amber-50 text-amber-600 hover:bg-amber-100 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1"
                >
                    <Plus className="w-3 h-3"/> Tambah Baris
                </button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-700 text-white uppercase text-xs">
                        <tr>
                            <th className="p-3 w-12 text-center" rowSpan={2}>No</th>
                            <th className="p-3 w-48" rowSpan={2}>Kategori Pengguna</th>
                            <th className="p-3" rowSpan={2}>Fitur</th>
                            <th className="p-2 text-center border-l border-slate-600" colSpan={4}>Hak Akses</th>
                            <th className="p-2 w-10" rowSpan={2}></th>
                        </tr>
                        <tr>
                            <th className="p-2 w-10 text-center border-l border-slate-600 bg-slate-800">C</th>
                            <th className="p-2 w-10 text-center bg-slate-800">R</th>
                            <th className="p-2 w-10 text-center bg-slate-800">U</th>
                            <th className="p-2 w-10 text-center bg-slate-800">D</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {project.fsdAccessRights.map((item, idx) => (
                            <tr key={item.id} className="hover:bg-slate-50">
                                <td className="p-3 text-center text-slate-500">{idx + 1}</td>
                                <td className="p-3"><input value={item.role} onChange={e => handleUpdateArray('fsdAccessRights', item.id, 'role', e.target.value)} className="w-full bg-transparent outline-none font-semibold text-slate-700 placeholder:text-slate-300" placeholder="Contoh: Pegawai"/></td>
                                <td className="p-3"><input value={item.feature} onChange={e => handleUpdateArray('fsdAccessRights', item.id, 'feature', e.target.value)} className="w-full bg-transparent outline-none text-slate-600 placeholder:text-slate-300" placeholder="Nama Fitur"/></td>
                                <td className="p-3 text-center border-l"><input type="checkbox" checked={item.c} onChange={e => handleUpdateArray('fsdAccessRights', item.id, 'c', e.target.checked)} className="accent-blue-600 w-4 h-4 cursor-pointer"/></td>
                                <td className="p-3 text-center"><input type="checkbox" checked={item.r} onChange={e => handleUpdateArray('fsdAccessRights', item.id, 'r', e.target.checked)} className="accent-blue-600 w-4 h-4 cursor-pointer"/></td>
                                <td className="p-3 text-center"><input type="checkbox" checked={item.u} onChange={e => handleUpdateArray('fsdAccessRights', item.id, 'u', e.target.checked)} className="accent-blue-600 w-4 h-4 cursor-pointer"/></td>
                                <td className="p-3 text-center"><input type="checkbox" checked={item.d} onChange={e => handleUpdateArray('fsdAccessRights', item.id, 'd', e.target.checked)} className="accent-blue-600 w-4 h-4 cursor-pointer"/></td>
                                <td className="p-3 text-center"><button onClick={() => handleRemoveArray('fsdAccessRights', item.id)}><Trash2 className="w-4 h-4 text-slate-300 hover:text-rose-500"/></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* 4. PERANCANGAN SISTEM */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2 text-slate-800"><PenTool className="w-5 h-5 text-indigo-600"/> 4. Perancangan Sistem</h3>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-sm text-left">
                     <thead className="bg-slate-100 text-slate-600 uppercase text-xs font-bold">
                         <tr>
                             <th className="p-3 border-r border-white">Jenis Diagram / Dokumen</th>
                             <th className="p-3 border-r border-white w-64">PIC Reviu</th>
                             <th className="p-3">Link Referensi (Draw.io / Gliffy)</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {project.fsdDesign.map((item) => (
                            <tr key={item.id}>
                                <td className="p-3 font-medium text-slate-700 flex items-center gap-2">
                                    {item.item.includes('Use Case') ? <GitBranch className="w-4 h-4 text-slate-400"/> :
                                     item.item.includes('Activity') ? <Workflow className="w-4 h-4 text-slate-400"/> :
                                     item.item.includes('Class') ? <Layers className="w-4 h-4 text-slate-400"/> :
                                     item.item.includes('Data') ? <Database className="w-4 h-4 text-slate-400"/> :
                                     <Globe className="w-4 h-4 text-slate-400"/>}
                                    {item.item}
                                </td>
                                <td className="p-3">
                                    <input 
                                        list="pic-list" 
                                        value={item.pic} 
                                        onChange={e => handleUpdateArray('fsdDesign', item.id, 'pic', e.target.value)} 
                                        className="w-full bg-transparent outline-none text-slate-700 font-medium text-xs placeholder:text-slate-400 focus:text-blue-600 transition-colors" 
                                        placeholder="Nama PIC"
                                    />
                                </td>
                                <td className="p-3"><input value={item.link} onChange={e => handleUpdateArray('fsdDesign', item.id, 'link', e.target.value)} className="w-full bg-transparent outline-none text-blue-600 text-xs underline placeholder:text-slate-300" placeholder="https://..."/></td>
                            </tr>
                        ))}
                     </tbody>
                </table>
            </div>
        </div>

        {/* 5. DEVELOPMENT */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2 text-slate-800"><Code className="w-5 h-5 text-emerald-600"/> 5. Development</h3>
            <div className="bg-slate-900 rounded-lg p-6 flex flex-col md:flex-row gap-6 items-center">
                 <div className="flex items-center gap-4 text-white">
                     <div className="p-3 bg-emerald-500/20 rounded-full"><GitBranch className="w-8 h-8 text-emerald-400"/></div>
                     <div>
                         <h4 className="font-bold text-lg">Source Code Repository</h4>
                         <p className="text-xs text-slate-400">Tautan ke repository Gitlab/Github proyek</p>
                     </div>
                 </div>
                 <div className="flex-1 w-full space-y-3">
                     <div className="flex items-center gap-2 bg-slate-800 p-2 rounded border border-slate-700">
                        <span className="text-xs font-bold text-slate-500 w-24 px-2">PIC Review:</span>
                        <input 
                            list="pic-list"
                            value={project.fsdSourceCode.pic} 
                            onChange={e => setProject({...project, fsdSourceCode: {...project.fsdSourceCode, pic: e.target.value}})} 
                            className="flex-1 bg-transparent outline-none text-blue-400 font-medium text-sm focus:text-white transition-colors" 
                            placeholder="Nama PIC"
                        />
                     </div>
                     <div className="flex items-center gap-2 bg-slate-800 p-2 rounded border border-slate-700">
                        <span className="text-xs font-bold text-slate-500 w-24 px-2">Link Git:</span>
                        <input value={project.fsdSourceCode.link} onChange={e => setProject({...project, fsdSourceCode: {...project.fsdSourceCode, link: e.target.value}})} className="flex-1 bg-transparent outline-none text-emerald-400 font-mono text-sm" placeholder="https://gitlab.customs.go.id/..."/>
                     </div>
                 </div>
            </div>
        </div>
    </div>
  );
};