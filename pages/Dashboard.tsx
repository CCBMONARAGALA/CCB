
import React, { useState, useEffect, useMemo } from 'react';
import { User, Announcement, SettingsData, PlantType } from '../types';
import { db } from '../db';
import Modal from '../components/Modal';
import Settings from './Settings';
import * as XLSX from 'xlsx';
import { 
  LayoutDashboard, 
  PlusCircle, 
  RotateCcw, 
  Settings as SettingsIcon, 
  LogOut, 
  Sprout, 
  ClipboardList,
  ChevronDown,
  Warehouse,
  Search, 
  FileText,
  TrendingUp,
  Download,
  Table as TableIcon,
  ChevronLeft,
  ArrowRight,
  Trash2,
  Save,
  FileEdit
} from 'lucide-react';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'settings' | 'reports'>('dashboard');
  const [reportView, setReportView] = useState<'list' | 'distribution' | 'nursery-summary'>('list');
  const [viewMode, setViewMode] = useState<'main' | 'external'>('main');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [settings, setSettings] = useState<SettingsData>(db.getSettings());
  const [isOtherNurseryMenuOpen, setIsOtherNurseryMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [modals, setModals] = useState({
    addAnnouncement: false,
    updateReceipt: false,
    addOtherNursery: false,
    updateOtherReceipt: false,
    updateNurseryPlants: false,
    manageRecords: false
  });

  // Forms
  const [newAnn, setNewAnn] = useState<Partial<Announcement>>({
    date: new Date().toISOString().split('T')[0],
    plantType: 'BIM',
    nursery: 'Walipitiya',
    isOtherNursery: false,
    announcementNo: '',
    receiptNo: '',
    journalPrice: '',
    quantity: 0,
    issuedCount: 0,
    program: '',
    cdoDivision: '',
    gnDivision: ''
  });

  const [updateReceiptForm, setUpdateReceiptForm] = useState({
    annNo: '',
    count: 0,
    foundAnn: null as Announcement | null
  });

  const [nurseryUpdateForm, setNurseryUpdateForm] = useState({
    annNo: '',
    addCount: 0,
    foundAnn: null as Announcement | null
  });

  const [manageRecordsForm, setManageRecordsForm] = useState({
    annNo: '',
    foundAnn: null as Announcement | null
  });

  useEffect(() => {
    refreshData();
  }, [user]);

  const refreshData = () => {
    let data = db.getAnnouncements();
    if (user.role === 'HADPANAGALA') {
      data = data.filter(a => a.nursery === 'Hadpanagal');
    } else if (user.role === 'WALIPITIYA') {
      data = data.filter(a => a.nursery === 'Walipitiya');
    }
    setAnnouncements(data);
    setSettings(db.getSettings());
  };

  const handleAddAnnouncement = (isOther: boolean) => {
    if (!newAnn.announcementNo || !newAnn.quantity || !newAnn.receiptNo) {
      alert("Please fill in all mandatory fields (Ann No, Receipt No, Quantity)");
      return;
    }
    db.addAnnouncement({
      ...newAnn as any,
      isOtherNursery: isOther,
      issuedCount: newAnn.issuedCount || 0
    });
    setModals({ ...modals, addAnnouncement: false, addOtherNursery: false });
    setNewAnn({
      date: new Date().toISOString().split('T')[0],
      plantType: 'BIM',
      nursery: 'Walipitiya',
      isOtherNursery: false,
      announcementNo: '',
      receiptNo: '',
      journalPrice: '',
      quantity: 0,
      issuedCount: 0,
      program: '',
      cdoDivision: '',
      gnDivision: ''
    });
    refreshData();
  };

  const findAnnForReceipt = (annNo: string, isOther: boolean) => {
    const found = announcements.find(a => a.announcementNo === annNo && a.isOtherNursery === isOther);
    setUpdateReceiptForm({ ...updateReceiptForm, annNo, foundAnn: found || null, count: found?.receivedReceipts || 0 });
  };

  const handleUpdateReceipt = (isOther: boolean) => {
    if (updateReceiptForm.annNo) {
      db.updateReceipts(updateReceiptForm.annNo, updateReceiptForm.count, isOther);
      setModals({ ...modals, updateReceipt: false, updateOtherReceipt: false });
      refreshData();
    }
  };

  const findAnnForNursery = (annNo: string) => {
    const found = announcements.find(a => a.announcementNo === annNo);
    setNurseryUpdateForm({ ...nurseryUpdateForm, annNo, foundAnn: found || null, addCount: 0 });
  };

  const handleUpdateNurseryPlants = () => {
    if (nurseryUpdateForm.annNo) {
      db.updateIssuedPlants(nurseryUpdateForm.annNo, nurseryUpdateForm.addCount);
      setModals({ ...modals, updateNurseryPlants: false });
      refreshData();
    }
  };

  const findAnnForManagement = () => {
    const found = announcements.find(a => a.announcementNo === manageRecordsForm.annNo);
    if (found) {
      setManageRecordsForm({ ...manageRecordsForm, foundAnn: { ...found } });
    } else {
      alert("මෙම නිවේදන අංකය සහිත දත්ත සොයාගත නොහැක.");
      setManageRecordsForm({ ...manageRecordsForm, foundAnn: null });
    }
  };

  const handleUpdateManagedRecord = () => {
    if (manageRecordsForm.foundAnn) {
      // Determine if it's other nursery based on current selection
      const isOther = settings.otherNurseries.includes(manageRecordsForm.foundAnn.nursery);
      const updatedData = { ...manageRecordsForm.foundAnn, isOtherNursery: isOther };
      db.updateAnnouncement(updatedData);
      alert("දත්ත සාර්ථකව යාවත්කාලීන කරන ලදී.");
      setModals({ ...modals, manageRecords: false });
      setManageRecordsForm({ annNo: '', foundAnn: null });
      refreshData();
    }
  };

  const handleDeleteManagedRecord = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (manageRecordsForm.foundAnn) {
      if (window.confirm("ඔබට මෙම දත්ත ස්ථිරවම මකා දැමීමට අවශ්‍ය බව සහතිකද?")) {
        const success = db.deleteAnnouncement(manageRecordsForm.foundAnn.id);
        if (success) {
          alert("දත්ත සාර්ථකව මකා දමන ලදී.");
          setModals({ ...modals, manageRecords: false });
          setManageRecordsForm({ annNo: '', foundAnn: null });
          refreshData();
        } else {
          alert("දත්ත මකා දැමීම අසාර්ථක විය.");
        }
      }
    } else {
      alert("මකා දැමීමට දත්තයක් තෝරාගෙන නොමැත.");
    }
  };

  const filteredAnnouncements = announcements.filter(a => {
    const matchesSearch = a.announcementNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         a.cdoDivision.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMode = viewMode === 'main' ? !a.isOtherNursery : a.isOtherNursery;
    return matchesSearch && matchesMode;
  });

  const reportData = useMemo(() => {
    const data: Record<string, Record<string, { total: number; issued: number; receipts: number }>> = {};
    settings.cdoDivisions.forEach(cdo => {
      data[cdo] = {};
      settings.programs.forEach(prog => {
        data[cdo][prog] = { total: 0, issued: 0, receipts: 0 };
      });
    });
    announcements.forEach(ann => {
      if (data[ann.cdoDivision] && data[ann.cdoDivision][ann.program]) {
        data[ann.cdoDivision][ann.program].total += ann.quantity;
        data[ann.cdoDivision][ann.program].issued += ann.issuedCount;
        data[ann.cdoDivision][ann.program].receipts += ann.receivedReceipts;
      }
    });
    return data;
  }, [announcements, settings]);

  const nurserySummaryData = useMemo(() => {
    const data: Record<string, Record<string, { total: number; issued: number }>> = {};
    const nurseries = ['Hadpanagal', 'Walipitiya'];
    
    settings.programs.forEach(prog => {
      data[prog] = {};
      nurseries.forEach(n => {
        data[prog][n] = { total: 0, issued: 0 };
      });
    });

    announcements.forEach(ann => {
      const nKey = ann.nursery;
      if (data[ann.program] && data[ann.program][nKey]) {
        data[ann.program][nKey].total += ann.quantity;
        data[ann.program][nKey].issued += ann.issuedCount;
      }
    });
    return data;
  }, [announcements, settings]);

  const downloadExcelDistribution = () => {
    const dataRows: any[] = [];
    dataRows.push(["Coconut Plant Distribution Report - " + new Date().toLocaleDateString()]);
    dataRows.push([]);
    const headerRow1 = ["CDO Division"];
    const merges: XLSX.Range[] = [];
    settings.programs.forEach((prog, idx) => {
      headerRow1.push(prog, "", "", "");
      const startCol = 1 + (idx * 4);
      merges.push({ s: { r: 2, c: startCol }, e: { r: 2, c: startCol + 3 } });
    });
    dataRows.push(headerRow1);
    const headerRow2 = [""];
    settings.programs.forEach(() => {
      headerRow2.push("Total", "Issued", "Receipts", "Balance");
    });
    dataRows.push(headerRow2);
    settings.cdoDivisions.forEach(cdo => {
      const row: (string | number)[] = [cdo];
      settings.programs.forEach(prog => {
        const d = reportData[cdo][prog];
        row.push(d.total, d.issued, d.receipts, d.total - d.receipts);
      });
      dataRows.push(row);
    });
    const worksheet = XLSX.utils.aoa_to_sheet(dataRows);
    worksheet['!merges'] = merges;
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Distribution");
    XLSX.writeFile(workbook, `CPDS_Program_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const downloadExcelNursery = () => {
    const dataRows: any[] = [];
    dataRows.push(["Nursery-wise Distribution Report - " + new Date().toLocaleDateString()]);
    dataRows.push([]);
    const headerRow1 = ["Program", "Hadpanagala", "", "", "Walipitiya", "", ""];
    const headerRow2 = ["", "Total", "Issued", "Balance", "Total", "Issued", "Balance"];
    dataRows.push(headerRow1);
    dataRows.push(headerRow2);

    let gHT = 0, gHI = 0, gWT = 0, gWI = 0;
    settings.programs.forEach(prog => {
      const h = nurserySummaryData[prog]['Hadpanagal'];
      const w = nurserySummaryData[prog]['Walipitiya'];
      gHT += h.total; gHI += h.issued;
      gWT += w.total; gWI += w.issued;
      dataRows.push([
        prog,
        h.total, h.issued, h.total - h.issued,
        w.total, w.issued, w.total - w.issued
      ]);
    });

    dataRows.push(["Grand Total", gHT, gHI, gHT - gHI, gWT, gWI, gWT - gWI]);

    const worksheet = XLSX.utils.aoa_to_sheet(dataRows);
    worksheet['!merges'] = [{ s: { r: 2, c: 1 }, e: { r: 2, c: 3 } }, { s: { r: 2, c: 4 }, e: { r: 2, c: 6 } }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Nursery Summary");
    XLSX.writeFile(workbook, `CPDS_Nursery_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col shadow-sm shrink-0 no-print">
        <div className="p-6 border-b flex items-center gap-3">
          <div className="bg-green-600 p-2 rounded-lg"><Sprout className="w-6 h-6 text-white" /></div>
          <span className="font-bold text-gray-800 text-lg tracking-tight">CPDS System</span>
        </div>
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}><LayoutDashboard className="w-5 h-5 shrink-0" /><span className="text-sm">Dashboard</span></button>
          <button onClick={() => { setActiveTab('reports'); setReportView('list'); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${activeTab === 'reports' ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}><FileText className="w-5 h-5 shrink-0" /><span className="text-sm">Reports</span></button>
          {user.role === 'ADMIN' && (
            <button onClick={() => setModals({ ...modals, manageRecords: true })} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-gray-600 hover:bg-red-50 hover:text-red-700"><FileEdit className="w-5 h-5 shrink-0" /><span className="text-sm font-medium">Manage Records</span></button>
          )}
          <div className="my-4 border-t border-gray-100"></div>
          {user.role === 'ADMIN' && (
            <>
              <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">External Sources</div>
              <div className="space-y-1">
                <button onClick={() => setIsOtherNurseryMenuOpen(!isOtherNurseryMenuOpen)} className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200">
                  <div className="flex items-center gap-3"><Warehouse className="w-5 h-5 shrink-0" /><span className="text-sm font-medium">Other Nurseries</span></div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOtherNurseryMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOtherNurseryMenuOpen && (
                  <div className="ml-9 mt-1 space-y-0.5 border-l-2 border-gray-100">
                    <button onClick={() => setModals({ ...modals, addOtherNursery: true })} className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:text-green-600 hover:bg-green-50/50 rounded-r-lg transition-colors">Add Details</button>
                    <button onClick={() => setModals({ ...modals, updateOtherReceipt: true })} className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:text-green-600 hover:bg-green-50/50 rounded-r-lg transition-colors">Update Receipts</button>
                  </div>
                )}
              </div>
            </>
          )}
          <div className="my-4 border-t border-gray-100"></div>
          {user.role === 'ADMIN' && (
            <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${activeTab === 'settings' ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}><SettingsIcon className="w-5 h-5 shrink-0" /><span className="text-sm">Settings</span></button>
          )}
        </nav>
        <div className="p-4 border-t bg-gray-50/50">
          <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 rounded-xl mb-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center text-white font-bold shadow-sm">{user.username.charAt(0)}</div>
            <div className="flex-1 min-w-0"><p className="text-sm font-bold text-gray-900 truncate">{user.username}</p><p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{user.role}</p></div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"><LogOut className="w-5 h-5 shrink-0 group-hover:-translate-x-1 transition-transform" /><span className="text-sm font-semibold">Logout</span></button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-8 py-4 flex items-center justify-between shadow-sm shrink-0 no-print">
          <div className="flex items-center gap-4">
            {activeTab === 'reports' && reportView !== 'list' && (
              <button onClick={() => setReportView('list')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><ChevronLeft className="w-5 h-5" /></button>
            )}
            <h2 className="text-xl font-bold text-gray-800 shrink-0">
              {activeTab === 'dashboard' ? `${user.username} Dashboard` : 
               activeTab === 'reports' ? 'Reports Center' : 'System Settings'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {activeTab === 'dashboard' && (
              <div className="flex items-center gap-3">
                <div className="relative group mr-2">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                  <input type="text" placeholder="Search..." className="pl-9 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-green-500 transition-all w-48 text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                {user.role === 'ADMIN' ? (
                  <>
                    <button onClick={() => setModals({ ...modals, addAnnouncement: true })} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm text-sm font-medium transition-all"><PlusCircle className="w-4 h-4" /><span>Add Announcement</span></button>
                    <button onClick={() => setModals({ ...modals, updateReceipt: true })} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm text-sm font-medium transition-all"><RotateCcw className="w-4 h-4" /><span>Update Receipts</span></button>
                  </>
                ) : (
                  <button onClick={() => setModals({ ...modals, updateNurseryPlants: true })} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm text-sm font-medium transition-all"><PlusCircle className="w-4 h-4" /><span>Update Plant Count</span></button>
                )}
              </div>
            )}
            {activeTab === 'reports' && reportView !== 'list' && (
              <div className="flex items-center gap-2">
                <button onClick={handlePrint} className="bg-red-50 text-red-700 border border-red-100 hover:bg-red-100 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm text-sm font-bold transition-all"><Download className="w-4 h-4" /><span>PDF Download</span></button>
                <button onClick={reportView === 'distribution' ? downloadExcelDistribution : downloadExcelNursery} className="bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm text-sm font-bold transition-all"><TableIcon className="w-4 h-4" /><span>Excel Download</span></button>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 no-print-scroll">
          {activeTab === 'settings' ? <Settings /> : activeTab === 'reports' ? (
            reportView === 'list' ? (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="mb-8"><h3 className="text-2xl font-bold text-gray-900">Select Report</h3><p className="text-gray-500 text-sm">Choose a report to analyze and download distribution data.</p></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button onClick={() => setReportView('distribution')} className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all text-left flex flex-col justify-between">
                    <div>
                      <div className="bg-green-50 text-green-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><TrendingUp className="w-6 h-6" /></div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Program Distribution Summary</h4>
                      <p className="text-gray-500 text-sm leading-relaxed">Distribution summary across CDO divisions by program.</p>
                    </div>
                    <div className="mt-8 flex items-center gap-2 text-green-600 font-bold text-sm"><span>View Report</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></div>
                  </button>
                  <button onClick={() => setReportView('nursery-summary')} className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all text-left flex flex-col justify-between">
                    <div>
                      <div className="bg-amber-50 text-amber-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Warehouse className="w-6 h-6" /></div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Nursery Distribution Table</h4>
                      <p className="text-gray-500 text-sm leading-relaxed">Detailed distribution report by Nursery and Program.</p>
                    </div>
                    <div className="mt-8 flex items-center gap-2 text-amber-600 font-bold text-sm"><span>View Report</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></div>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8 print-container max-w-7xl mx-auto">
                <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
                  <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{reportView === 'distribution' ? 'Program Distribution Summary (CDO)' : 'Nursery Distribution Summary'}</h3>
                      <p className="text-sm text-gray-500 mt-1">Report generated on {new Date().toLocaleDateString()}</p>
                    </div>
                    <div className="hidden sm:block bg-green-50 text-green-600 p-3 rounded-2xl"><FileText className="w-6 h-6" /></div>
                  </div>
                  <div className="overflow-x-auto">
                    {reportView === 'distribution' ? (
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50/50">
                            <th rowSpan={2} className="p-6 text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-r border-gray-100 min-w-[240px]">CDO DIVISION</th>
                            {settings.programs.map((prog) => (<th key={prog} colSpan={4} className="p-4 text-center text-xs font-black text-gray-700 uppercase tracking-widest border-b border-r border-gray-100 last:border-r-0 bg-white/50">{prog}</th>))}
                          </tr>
                          <tr className="bg-gray-50/20">
                            {settings.programs.map((prog) => (
                              <React.Fragment key={`sh-${prog}`}>
                                <th className="p-3 text-center text-[9px] font-bold text-gray-400 uppercase border-b border-gray-100">Total</th>
                                <th className="p-3 text-center text-[9px] font-bold text-gray-400 uppercase border-b border-gray-100">Issued</th>
                                <th className="p-3 text-center text-[9px] font-bold text-gray-400 uppercase border-b border-gray-100">Receipts</th>
                                <th className="p-3 text-center text-[9px] font-bold text-gray-400 uppercase border-b border-r border-gray-100 last:border-r-0">Balance</th>
                              </React.Fragment>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {settings.cdoDivisions.map(cdo => (
                            <tr key={cdo} className="group hover:bg-green-50/20 transition-all duration-300">
                              <td className="p-6 border-r border-gray-100"><span className="text-lg font-bold text-gray-900 group-hover:text-green-700 transition-colors">{cdo}</span></td>
                              {settings.programs.map(prog => {
                                const cell = reportData[cdo][prog];
                                const balance = cell.total - cell.receipts;
                                return (
                                  <React.Fragment key={`val-${cdo}-${prog}`}>
                                    <td className="p-3 text-center"><div className="inline-flex items-center justify-center bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold text-sm min-w-[60px] shadow-sm shadow-blue-100/50">{cell.total}</div></td>
                                    <td className="p-3 text-center"><div className="inline-flex items-center justify-center bg-green-50 text-green-700 px-4 py-2 rounded-xl font-bold text-sm min-w-[60px] shadow-sm shadow-green-100/50">{cell.issued}</div></td>
                                    <td className="p-3 text-center"><div className="inline-flex items-center justify-center bg-amber-50 text-amber-700 px-4 py-2 rounded-xl font-bold text-sm min-w-[60px] shadow-sm shadow-amber-100/50">{cell.receipts}</div></td>
                                    <td className="p-3 text-center border-r border-gray-100 last:border-r-0"><div className={`inline-flex items-center justify-center px-4 py-2 rounded-xl font-bold text-sm min-w-[60px] shadow-sm ${balance > 0 ? 'bg-red-50 text-red-600 shadow-red-100/50' : 'bg-gray-50 text-gray-400'}`}>{balance}</div></td>
                                  </React.Fragment>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50/50">
                            <th rowSpan={2} className="p-6 text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-r border-gray-100 min-w-[200px]">PROGRAM</th>
                            <th colSpan={3} className="p-4 text-center text-xs font-black text-gray-700 uppercase tracking-widest border-b border-r border-gray-100 bg-white/50">HADPANAGALA</th>
                            <th colSpan={3} className="p-4 text-center text-xs font-black text-gray-700 uppercase tracking-widest border-b last:border-r-0 bg-white/50">WALIPITIYA</th>
                          </tr>
                          <tr className="bg-gray-50/20">
                            <th className="p-3 text-center text-[9px] font-bold text-gray-400 uppercase border-b border-gray-100">Total</th>
                            <th className="p-3 text-center text-[9px] font-bold text-gray-400 uppercase border-b border-gray-100">Issued</th>
                            <th className="p-3 text-center text-[9px] font-bold text-gray-400 uppercase border-b border-r border-gray-100">Balance</th>
                            <th className="p-3 text-center text-[9px] font-bold text-gray-400 uppercase border-b border-gray-100">Total</th>
                            <th className="p-3 text-center text-[9px] font-bold text-gray-400 uppercase border-b border-gray-100">Issued</th>
                            <th className="p-3 text-center text-[9px] font-bold text-gray-400 uppercase border-b">Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {settings.programs.map(prog => {
                            const h = nurserySummaryData[prog]['Hadpanagal'];
                            const w = nurserySummaryData[prog]['Walipitiya'];
                            return (
                              <tr key={prog} className="group hover:bg-green-50/20 transition-all duration-300">
                                <td className="p-6 border-r border-gray-100"><span className="text-base font-bold text-gray-900 group-hover:text-green-700">{prog}</span></td>
                                <td className="p-3 text-center"><div className="inline-flex items-center justify-center bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold text-sm min-w-[60px] shadow-sm">{h.total}</div></td>
                                <td className="p-3 text-center"><div className="inline-flex items-center justify-center bg-green-50 text-green-700 px-4 py-2 rounded-xl font-bold text-sm min-w-[60px] shadow-sm">{h.issued}</div></td>
                                <td className="p-3 text-center border-r border-gray-100"><div className="inline-flex items-center justify-center bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold text-sm min-w-[60px] shadow-sm">{h.total - h.issued}</div></td>
                                <td className="p-3 text-center"><div className="inline-flex items-center justify-center bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold text-sm min-w-[60px] shadow-sm">{w.total}</div></td>
                                <td className="p-3 text-center"><div className="inline-flex items-center justify-center bg-green-50 text-green-700 px-4 py-2 rounded-xl font-bold text-sm min-w-[60px] shadow-sm">{w.issued}</div></td>
                                <td className="p-3 text-center"><div className="inline-flex items-center justify-center bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold text-sm min-w-[60px] shadow-sm">{w.total - w.issued}</div></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Announcements', value: announcements.length, icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Total Plants', value: announcements.reduce((acc, a) => acc + a.quantity, 0), icon: Sprout, color: 'text-green-600', bg: 'bg-green-50' },
                  { label: 'Plants Issued', value: announcements.reduce((acc, a) => acc + a.issuedCount, 0), icon: Warehouse, color: 'text-purple-600', bg: 'bg-purple-50' },
                  { label: 'Receipts Collected', value: announcements.reduce((acc, a) => acc + a.receivedReceipts, 0), icon: RotateCcw, color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}><stat.icon className="w-8 h-8" /></div>
                    <div><p className="text-sm font-medium text-gray-500">{stat.label}</p><p className="text-2xl font-bold text-gray-900">{stat.value}</p></div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="text-lg font-bold text-gray-800">Current Distribution Data</h3>
                  <div className="flex bg-gray-100 p-1 rounded-xl w-fit border border-gray-200">
                    <button onClick={() => setViewMode('main')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'main' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Main Data</button>
                    <button onClick={() => setViewMode('external')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'external' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>External Sources</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider font-semibold">
                      <tr><th className="px-6 py-4">Date</th><th className="px-6 py-4">Ann. No</th><th className="px-6 py-4">Nursery</th><th className="px-6 py-4">Program / CDO</th><th className="px-6 py-4">Plant Details</th><th className="px-6 py-4">Receipts</th><th className="px-6 py-4">Issued</th></tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                      {filteredAnnouncements.map((ann) => (
                        <tr key={ann.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium">{ann.date}</td>
                          <td className="px-6 py-4"><span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-md font-bold border border-green-100">{ann.announcementNo}</span></td>
                          <td className="px-6 py-4"><div className="flex flex-col"><span className="font-medium">{ann.nursery}</span>{ann.isOtherNursery && <span className="text-[10px] bg-amber-100 text-amber-700 px-1 rounded inline-block w-fit">External</span>}</div></td>
                          <td className="px-6 py-4"><div className="text-gray-900 font-medium">{ann.program}</div><div className="text-gray-500 text-xs">{ann.cdoDivision}</div></td>
                          <td className="px-6 py-4"><div className="font-bold">{ann.quantity} <span className="text-[10px] text-gray-400 font-normal">({ann.plantType})</span></div></td>
                          <td className="px-6 py-4"><span className="font-semibold text-amber-600">{ann.receivedReceipts}</span></td>
                          <td className="px-6 py-4"><span className="font-semibold text-green-600">{ann.issuedCount}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals Section */}
      <Modal isOpen={modals.addAnnouncement || modals.addOtherNursery} onClose={() => setModals({ ...modals, addAnnouncement: false, addOtherNursery: false })} title={modals.addOtherNursery ? "Add Other Nursery Announcement" : "Create Distribution Announcement"}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Date</label><input type="date" className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none" value={newAnn.date} onChange={e => setNewAnn({...newAnn, date: e.target.value})} /></div>
          <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Announcement No</label><input type="text" className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none" value={newAnn.announcementNo} onChange={e => setNewAnn({...newAnn, announcementNo: e.target.value})} placeholder="e.g. ANN-001" /></div>
          <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Receipt No</label><input type="text" className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none" value={newAnn.receiptNo} onChange={e => setNewAnn({...newAnn, receiptNo: e.target.value})} placeholder="e.g. REC-502" /></div>
          <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Plant Type</label><select className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none" value={newAnn.plantType} onChange={e => setNewAnn({...newAnn, plantType: e.target.value as PlantType})}><option value="BIM">BIM (බිම්)</option><option value="BADUN">BADUN (බදුන්)</option></select></div>
          <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Planned Quantity</label><input type="number" className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none" value={newAnn.quantity || ''} onChange={e => setNewAnn({...newAnn, quantity: parseInt(e.target.value) || 0})} placeholder="0" /></div>
          <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Issued Quantity</label><input type="number" className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none bg-green-50/30" value={newAnn.issuedCount || ''} onChange={e => setNewAnn({...newAnn, issuedCount: parseInt(e.target.value) || 0})} placeholder="0" /></div>
          <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Journal Price</label><select className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none" value={newAnn.journalPrice} onChange={e => setNewAnn({...newAnn, journalPrice: e.target.value})}><option value="">Select Price</option>{settings.journalPrices.map(jp => <option key={jp.id} value={jp.price}>{jp.price} ({jp.description})</option>)}</select></div>
          <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Program</label><select className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none" value={newAnn.program} onChange={e => setNewAnn({...newAnn, program: e.target.value})}><option value="">Select Program</option>{settings.programs.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
          <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">CDO Division</label><select className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none" value={newAnn.cdoDivision} onChange={e => setNewAnn({...newAnn, cdoDivision: e.target.value})}><option value="">Select CDO</option>{settings.cdoDivisions.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
          <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">GN Division</label><select className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none" value={newAnn.gnDivision} onChange={e => setNewAnn({...newAnn, gnDivision: e.target.value})}><option value="">Select GN</option>{settings.gnDivisions.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
          <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Nursery</label><select className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none" value={newAnn.nursery} onChange={e => setNewAnn({...newAnn, nursery: e.target.value})}>{modals.addOtherNursery ? (<><option value="">Select Other Nursery</option>{settings.otherNurseries.map(n => <option key={n} value={n}>{n}</option>)}</>) : (<><option value="Walipitiya">Walipitiya</option><option value="Hadpanagal">Hadpanagal</option></>)}</select></div>
        </div>
        <button onClick={() => handleAddAnnouncement(modals.addOtherNursery)} className="w-full mt-8 bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-700 transition-all shadow-lg flex items-center justify-center gap-2"><PlusCircle className="w-5 h-5" /><span>Submit Distribution Details</span></button>
      </Modal>

      <Modal isOpen={modals.manageRecords} onClose={() => { setModals({ ...modals, manageRecords: false }); setManageRecordsForm({ annNo: '', foundAnn: null }); }} title="Manage Distribution Records">
        <div className="space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Announcement Number (Find to Edit)</label>
            <div className="flex gap-2">
              <input type="text" className="flex-1 border rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none" placeholder="Enter No..." value={manageRecordsForm.annNo} onChange={e => setManageRecordsForm({...manageRecordsForm, annNo: e.target.value})} />
              <button onClick={findAnnForManagement} className="bg-green-600 text-white px-6 rounded-lg hover:bg-green-700 font-bold transition-colors">Find Record</button>
            </div>
          </div>
          {manageRecordsForm.foundAnn && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Announcement No</label><input type="text" className="w-full border rounded-lg p-2 text-sm font-bold bg-gray-50" value={manageRecordsForm.foundAnn.announcementNo} onChange={e => setManageRecordsForm({...manageRecordsForm, foundAnn: {...manageRecordsForm.foundAnn!, announcementNo: e.target.value}})} /></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Date</label><input type="date" className="w-full border rounded-lg p-2 text-sm" value={manageRecordsForm.foundAnn.date} onChange={e => setManageRecordsForm({...manageRecordsForm, foundAnn: {...manageRecordsForm.foundAnn!, date: e.target.value}})} /></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Receipt No</label><input type="text" className="w-full border rounded-lg p-2 text-sm" value={manageRecordsForm.foundAnn.receiptNo} onChange={e => setManageRecordsForm({...manageRecordsForm, foundAnn: {...manageRecordsForm.foundAnn!, receiptNo: e.target.value}})} /></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Plant Type</label><select className="w-full border rounded-lg p-2 text-sm" value={manageRecordsForm.foundAnn.plantType} onChange={e => setManageRecordsForm({...manageRecordsForm, foundAnn: {...manageRecordsForm.foundAnn!, plantType: e.target.value as PlantType}})}><option value="BIM">BIM (බිම්)</option><option value="BADUN">BADUN (බදුන්)</option></select></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Planned Quantity</label><input type="number" className="w-full border rounded-lg p-2 text-sm" value={manageRecordsForm.foundAnn.quantity} onChange={e => setManageRecordsForm({...manageRecordsForm, foundAnn: {...manageRecordsForm.foundAnn!, quantity: parseInt(e.target.value) || 0}})} /></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Issued Quantity</label><input type="number" className="w-full border rounded-lg p-2 text-sm bg-green-50/50" value={manageRecordsForm.foundAnn.issuedCount} onChange={e => setManageRecordsForm({...manageRecordsForm, foundAnn: {...manageRecordsForm.foundAnn!, issuedCount: parseInt(e.target.value) || 0}})} /></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Journal Price</label><select className="w-full border rounded-lg p-2 text-sm" value={manageRecordsForm.foundAnn.journalPrice} onChange={e => setManageRecordsForm({...manageRecordsForm, foundAnn: {...manageRecordsForm.foundAnn!, journalPrice: e.target.value}})}><option value="">Select Price</option>{settings.journalPrices.map(jp => <option key={jp.id} value={jp.price}>{jp.price} ({jp.description})</option>)}</select></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Program</label><select className="w-full border rounded-lg p-2 text-sm" value={manageRecordsForm.foundAnn.program} onChange={e => setManageRecordsForm({...manageRecordsForm, foundAnn: {...manageRecordsForm.foundAnn!, program: e.target.value}})}>{settings.programs.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">CDO Division</label><select className="w-full border rounded-lg p-2 text-sm" value={manageRecordsForm.foundAnn.cdoDivision} onChange={e => setManageRecordsForm({...manageRecordsForm, foundAnn: {...manageRecordsForm.foundAnn!, cdoDivision: e.target.value}})}>{settings.cdoDivisions.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">GN Division</label><select className="w-full border rounded-lg p-2 text-sm" value={manageRecordsForm.foundAnn.gnDivision} onChange={e => setManageRecordsForm({...manageRecordsForm, foundAnn: {...manageRecordsForm.foundAnn!, gnDivision: e.target.value}})}>{settings.gnDivisions.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                <div className="space-y-1 lg:col-span-2"><label className="text-[10px] font-bold text-gray-400 uppercase">Nursery</label><select className="w-full border rounded-lg p-2 text-sm" value={manageRecordsForm.foundAnn.nursery} onChange={e => setManageRecordsForm({...manageRecordsForm, foundAnn: {...manageRecordsForm.foundAnn!, nursery: e.target.value}})}><option value="Walipitiya">Walipitiya</option><option value="Hadpanagal">Hadpanagal</option>{settings.otherNurseries.map(n => <option key={n} value={n}>{n}</option>)}</select></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Receipts Collected</label><input type="number" className="w-full border rounded-lg p-2 text-sm" value={manageRecordsForm.foundAnn.receivedReceipts} onChange={e => setManageRecordsForm({...manageRecordsForm, foundAnn: {...manageRecordsForm.foundAnn!, receivedReceipts: parseInt(e.target.value) || 0}})} /></div>
              </div>
              <div className="flex gap-4 pt-6 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={handleUpdateManagedRecord} 
                  className="flex-1 bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-700 flex items-center justify-center gap-2 shadow-lg shadow-green-100 transition-all"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
                <button 
                  type="button"
                  onClick={handleDeleteManagedRecord} 
                  className="bg-red-50 text-red-600 font-bold py-3.5 px-8 rounded-xl hover:bg-red-100 flex items-center justify-center gap-2 border border-red-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Utility Modals */}
      <Modal isOpen={modals.updateReceipt || modals.updateOtherReceipt} onClose={() => setModals({...modals, updateReceipt: false, updateOtherReceipt: false})} title="Update Receipt Count">
        <div className="space-y-4">
          <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Announcement Number</label><div className="flex gap-2"><input type="text" className="flex-1 border rounded-lg p-2" placeholder="Enter No..." value={updateReceiptForm.annNo} onChange={e => setUpdateReceiptForm({...updateReceiptForm, annNo: e.target.value})} /><button onClick={() => findAnnForReceipt(updateReceiptForm.annNo, modals.updateOtherReceipt)} className="bg-gray-100 px-4 rounded-lg hover:bg-gray-200">Find</button></div></div>
          {updateReceiptForm.foundAnn && (<div className="p-4 bg-gray-50 rounded-xl space-y-2 border border-dashed border-gray-300"><p className="text-sm font-bold">Ann: {updateReceiptForm.foundAnn.announcementNo}</p><input type="number" className="w-full border rounded-lg p-2 mt-1" value={updateReceiptForm.count} onChange={e => setUpdateReceiptForm({...updateReceiptForm, count: parseInt(e.target.value) || 0})} /><button onClick={() => handleUpdateReceipt(modals.updateOtherReceipt)} className="w-full bg-amber-600 text-white font-bold py-2 rounded-lg hover:bg-amber-700 mt-2">Update Total Receipts</button></div>)}
        </div>
      </Modal>

      <Modal isOpen={modals.updateNurseryPlants} onClose={() => setModals({...modals, updateNurseryPlants: false})} title="Update Issued Plants">
        <div className="space-y-4">
          <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Announcement Number</label><div className="flex gap-2"><input type="text" className="flex-1 border rounded-lg p-2" placeholder="Enter No..." value={nurseryUpdateForm.annNo} onChange={e => setNurseryUpdateForm({...nurseryUpdateForm, annNo: e.target.value})} /><button onClick={() => findAnnForNursery(nurseryUpdateForm.annNo)} className="bg-gray-100 px-4 rounded-lg hover:bg-gray-200">Find</button></div></div>
          {nurseryUpdateForm.foundAnn && (<div className="p-4 bg-gray-50 rounded-xl space-y-4 border border-dashed border-gray-300"><div className="flex justify-between items-center"><p className="font-bold text-gray-700">Previously Issued:</p><span className="text-xl font-black text-green-700">{nurseryUpdateForm.foundAnn.issuedCount}</span></div><div className="space-y-2"><label className="text-xs font-bold text-gray-500">ADDITIONAL COUNT TO ISSUE</label><input type="number" className="w-full border rounded-lg p-3 text-lg font-bold outline-none focus:ring-2 focus:ring-green-500" value={nurseryUpdateForm.addCount || ''} onChange={e => setNurseryUpdateForm({...nurseryUpdateForm, addCount: parseInt(e.target.value) || 0})} placeholder="0" /></div><button onClick={handleUpdateNurseryPlants} className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all flex items-center justify-center gap-2"><Warehouse className="w-5 h-5" /><span>Confirm Plant Issue</span></button></div>)}
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
