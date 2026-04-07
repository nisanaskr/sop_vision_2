import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, Wrench, Layers, FileText, Plus, Trash2, 
  Save, Video, Lock, Unlock, Edit, Key, ClipboardCheck,
  Image as ImageIcon, X, Download, AlertTriangle, PlayCircle
} from 'lucide-react';
import html2canvas from 'html2canvas';

const App = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const viewMode = queryParams.get('view'); 
  const targetId = queryParams.get('id');

  const fileInputRef = useRef(null);
  const imageContainerRef = useRef(null);
  const downloadRef = useRef(null);

  const getInitialLibrary = () => {
    const saved = localStorage.getItem('visionguide_vfinal_full');
    return saved ? JSON.parse(saved) : [];
  };

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [engineerPassword] = useState(localStorage.getItem('visionguide_pass') || '1234');
  const [accessKey, setAccessKey] = useState('');
  const [library, setLibrary] = useState(getInitialLibrary());
  const [activeMarkerType, setActiveMarkerType] = useState('red');
  const [editingSopId, setEditingSopId] = useState(null);
  
  const [sopForm, setSopForm] = useState({ 
    title: '', 
    steps: [''], 
    warnings: [''], 
    videoUrl: '', 
    imageData: null, 
    markers: [] 
  });

  useEffect(() => {
    localStorage.setItem('visionguide_vfinal_full', JSON.stringify(library));
  }, [library]);

  // --- OPERATÖR GÖRÜNÜMÜ ---
  if (viewMode === 'operator' && targetId) {
    const activeSop = library.find(s => s.id === targetId);
    if (!activeSop) return <div className="p-20 text-center font-black text-slate-400 uppercase tracking-widest">SOP Bulunamadı!</div>;

    return (
      <div className="min-h-screen bg-white p-4 lg:p-10 animate-in fade-in duration-500">
        <header className="flex items-center gap-4 mb-6 border-b-2 border-slate-50 pb-6">
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg"><Layers size={24} /></div>
          <h1 className="font-black text-2xl text-slate-800 uppercase tracking-tight">{activeSop.title}</h1>
        </header>

        {activeSop.warnings && activeSop.warnings.some(w => w.trim() !== '') && (
          <div className="mb-8 p-6 bg-red-50 border-l-8 border-red-500 rounded-[2rem] shadow-sm animate-pulse">
            <div className="flex items-center gap-3 mb-3 text-red-600">
              <AlertTriangle size={24} />
              <h3 className="font-black uppercase tracking-widest text-sm">KRİTİK GÜVENLİK UYARILARI</h3>
            </div>
            <ul className="space-y-2">
              {activeSop.warnings.map((warn, idx) => warn.trim() !== '' && (
                <li key={idx} className="font-bold text-red-700 flex items-start gap-2 text-lg">
                  <span className="mt-2 w-2 h-2 bg-red-400 rounded-full shrink-0"></span>{warn}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="relative rounded-[2.5rem] overflow-hidden border-8 border-slate-50 shadow-2xl">
            <img src={activeSop.imageData} className="w-full h-auto" alt="Manual" />
            {activeSop.markers.map((marker, idx) => (
              <div key={idx} className={`absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-2 border-white shadow-2xl flex items-center justify-center text-white font-black text-sm ${marker.type === 'red' ? 'bg-red-500' : 'bg-blue-500'}`} style={{ left: `${marker.x}%`, top: `${marker.y}%` }}>{marker.label}</div>
            ))}
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Uygulama Adımları</h3>
            {activeSop.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-5 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:bg-slate-100">
                <span className="w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black shrink-0 text-lg shadow-md">{i+1}</span>
                <p className="font-bold text-slate-700 text-lg pt-1 leading-snug">{step}</p>
              </div>
            ))}
            {activeSop.videoUrl && (
              <a href={activeSop.videoUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-lg shadow-xl hover:bg-indigo-700 transition-all mt-6 shadow-indigo-100"><PlayCircle size={28} /> VİDEOLU ANLATIMI İZLE</a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- MÜHENDİS FONKSİYONLARI ---
  const handleSaveSop = () => {
    if (!sopForm.title.trim()) return alert("Başlık giriniz.");
    if (editingSopId) {
      setLibrary(prev => prev.map(sop => sop.id === editingSopId ? { ...sopForm, id: editingSopId } : sop));
    } else {
      setLibrary(prev => [{ ...sopForm, id: `sop-${Date.now()}` }, ...prev]);
    }
    resetForm();
  };

  const resetForm = () => {
    setSopForm({ title: '', steps: [''], warnings: [''], videoUrl: '', imageData: null, markers: [] });
    setEditingSopId(null);
  };

  const updateStep = (index, value) => {
    const newSteps = [...sopForm.steps];
    newSteps[index] = value;
    setSopForm({ ...sopForm, steps: newSteps });
  };

  const updateWarning = (index, value) => {
    const newWarns = [...sopForm.warnings];
    newWarns[index] = value;
    setSopForm({ ...sopForm, warnings: newWarns });
  };

  const downloadJPG = async () => {
    const canvas = await html2canvas(downloadRef.current);
    const link = document.createElement('a');
    link.download = `${sopForm.title}.jpg`; link.href = canvas.toDataURL('image/jpeg'); link.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <header className="bg-white border-b p-4 sticky top-0 z-50 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-100"><Layers size={22} /></div>
          <h1 className="font-black text-xl leading-none">VisionGuide <span className="text-blue-600 italic tracking-tighter">AR-SOP</span></h1>
        </div>
        {isAuthenticated && <button onClick={() => setIsAuthenticated(false)} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-black text-xs hover:bg-red-600">ÇIKIŞ</button>}
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 lg:p-8">
        {!isAuthenticated ? (
          <div className="max-w-md mx-auto mt-20 p-10 bg-white border border-slate-200 rounded-[3rem] shadow-2xl text-center space-y-8 animate-in zoom-in-95 duration-300">
            <Lock size={40} className="mx-auto text-blue-600" />
            <h2 className="text-3xl font-black tracking-tight">Erişim Paneli</h2>
            <div className="space-y-4">
              <input type="password" placeholder="••••" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[2rem] text-center text-2xl font-black tracking-[0.5em] outline-none" value={accessKey} onChange={(e) => setAccessKey(e.target.value)} />
              <button onClick={() => {if(accessKey === engineerPassword) setIsAuthenticated(true)}} className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl hover:bg-blue-600 transition-all">GİRİŞ</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* SOL ALAN: GÖRSEL VE MARKERLAR */}
            <div className="lg:col-span-7 space-y-4">
               <div className="flex justify-between items-center px-4">
                <div className="flex gap-2 bg-slate-200/50 p-1 rounded-xl">
                  <button onClick={() => setActiveMarkerType('red')} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${activeMarkerType === 'red' ? 'bg-red-500 text-white shadow-md' : 'text-slate-400'}`}>RED (STEP)</button>
                  <button onClick={() => setActiveMarkerType('blue')} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${activeMarkerType === 'blue' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-400'}`}>BLUE (INFO)</button>
                </div>
                {sopForm.imageData && <button onClick={downloadJPG} className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black hover:bg-black transition-all"><Download size={14}/> JPG İNDİR</button>}
              </div>
              <div className="bg-white p-4 rounded-[2.5rem] border shadow-sm" ref={downloadRef}>
                 {sopForm.title && <h2 className="text-xl font-black mb-4 uppercase text-slate-800 p-2">{sopForm.title}</h2>}
                 <div className="relative overflow-hidden rounded-2xl border-2 border-slate-100 bg-slate-50 min-h-[400px] flex items-center justify-center cursor-crosshair">
                   {sopForm.imageData ? (
                    <div className="relative w-full h-full" ref={imageContainerRef} onClick={(e) => {
                        const rect = imageContainerRef.current.getBoundingClientRect();
                        const x = ((e.clientX - rect.left) / rect.width) * 100;
                        const y = ((e.clientY - rect.top) / rect.height) * 100;
                        const label = activeMarkerType === 'red' ? (sopForm.markers.filter(m => m.type === 'red').length + 1).toString() : null;
                        setSopForm(p => ({ ...p, markers: [...p.markers, {x, y, type: activeMarkerType, label}] }));
                    }}>
                      <img src={sopForm.imageData} className="w-full h-auto block select-none" alt="SOP" />
                      {sopForm.markers.map((marker, idx) => (
                        <div key={idx} className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white font-black text-xs ${marker.type === 'red' ? 'bg-red-500' : 'bg-blue-500'}`} style={{ left: `${marker.x}%`, top: `${marker.y}%` }}>{marker.label}</div>
                      ))}
                    </div>
                  ) : (
                    <button onClick={() => fileInputRef.current.click()} className="flex flex-col items-center gap-2 text-slate-400 hover:text-blue-500 transition-all"><ImageIcon size={48} /><span className="font-bold">Görsel Yükle</span></button>
                  )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setSopForm(p => ({ ...p, imageData: reader.result, markers: [] })); reader.readAsDataURL(file); } }} />
              </div>
            </div>

            {/* SAĞ ALAN: FORM */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-[2.5rem] p-8 border shadow-sm space-y-4">
                <input type="text" placeholder="SOP Başlığı" className="w-full p-4 bg-slate-50 border rounded-2xl font-black text-sm outline-none" value={sopForm.title} onChange={e => setSopForm({...sopForm, title: e.target.value})} />
                <input type="text" placeholder="Video URL (YouTube/MP4)" className="w-full p-4 bg-slate-50 border rounded-2xl text-[10px] font-bold outline-none focus:ring-2 ring-indigo-100" value={sopForm.videoUrl} onChange={e => setSopForm({...sopForm, videoUrl: e.target.value})} />

                <div className="space-y-2 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                  <label className="text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-1"><AlertTriangle size={12}/> Güvenlik Uyarıları</label>
                  {sopForm.warnings.map((warn, i) => (
                    <input key={i} className="w-full p-2 bg-white border border-orange-200 rounded-xl text-xs outline-none mb-1" placeholder="Uyarı yazın..." value={warn} onChange={(e) => updateWarning(i, e.target.value)} />
                  ))}
                  <button onClick={() => setSopForm(p => ({...p, warnings: [...p.warnings, '']}))} className="text-[9px] font-black text-orange-500 uppercase">+ Uyarı Ekle</button>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Talimat Adımları</label>
                  <div className="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {sopForm.steps.map((step, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="w-8 h-8 flex items-center justify-center font-black text-white bg-red-500 rounded-lg text-[10px] shrink-0">{i+1}</span>
                        <input className="flex-1 p-2.5 border border-slate-200 rounded-xl text-xs outline-none" value={step} onChange={(e) => updateStep(i, e.target.value)} />
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setSopForm(p => ({...p, steps: [...p.steps, '']}))} className="w-full py-2 border-2 border-dashed rounded-xl text-[10px] font-black text-slate-400">+ ADIM EKLE</button>
                </div>
                <button onClick={handleSaveSop} className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-sm shadow-xl active:scale-95 transition-all">SİSTEME KAYDET</button>
              </div>

              {/* KÜTÜPHANE LİSTESİ */}
              <div className="space-y-3 pb-20">
                {library.map(sop => (
                  <div key={sop.id} className="bg-white p-4 rounded-3xl border flex items-center gap-4 group hover:shadow-md transition-all">
                    {sop.imageData && <img src={sop.imageData} className="w-12 h-12 object-cover rounded-xl border" />}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-slate-800 text-[10px] truncate uppercase">{sop.title}</h4>
                      <div className="flex gap-2 mt-1">
                        <p className="text-[9px] text-slate-400 font-bold">{sop.steps.length} Adım</p>
                        {sop.videoUrl && <span className="text-[9px] font-bold text-indigo-500">🎥 Video</span>}
                        {sop.warnings && sop.warnings.some(w => w !== '') && <span className="text-[9px] font-bold text-red-500">⚠️ {sop.warnings.filter(w => w !== '').length} Uyarı</span>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditingSopId(sop.id); setSopForm(sop); window.scrollTo({top:0, behavior:'smooth'}); }} className="p-2.5 bg-slate-50 text-slate-400 hover:bg-orange-500 hover:text-white rounded-xl transition-all"><Edit size={12}/></button>
                      <button onClick={() => setLibrary(l => l.filter(s => s.id !== sop.id))} className="p-2.5 bg-slate-50 text-slate-400 hover:bg-red-600 hover:text-white rounded-xl transition-all"><Trash2 size={12}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
