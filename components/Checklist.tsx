
import React, { useState } from 'react';
import { ChecklistEntry, UserRole } from '../types';
import { Calendar, CheckSquare, AlertCircle, Settings2, Plus, Trash2, X, FileSpreadsheet, User, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChecklistProps {
  entries: ChecklistEntry[];
  setEntries: React.Dispatch<React.SetStateAction<ChecklistEntry[]>>;
  machines: string[];
  setMachines: React.Dispatch<React.SetStateAction<string[]>>;
  requestAuth: (action: () => void) => void;
  role: UserRole | null;
  shiftNames: Record<string, {A: string, B: string, C: string}>;
  setShiftNames: React.Dispatch<React.SetStateAction<Record<string, {A: string, B: string, C: string}>>>;
}

const DEFECT_CODES = [
  { code: 'A', label: 'اتساخ', color: 'bg-yellow-100 text-yellow-800' },
  { code: 'P', label: 'تطبق', color: 'bg-yellow-100 text-yellow-800' },
  { code: 'B', label: 'تنويرة', color: 'bg-orange-100 text-orange-800' },
  { code: 'Q', label: 'بيضاوي', color: 'bg-orange-100 text-orange-800' },
  { code: 'C', label: 'كسر', color: 'bg-red-100 text-red-800' },
  { code: 'R', label: 'عصب', color: 'bg-red-100 text-red-800' },
  { code: 'D', label: 'قوة تحمل', color: 'bg-purple-100 text-purple-800' },
  { code: 'S', label: 'رايش', color: 'bg-purple-100 text-purple-800' },
  { code: 'E', label: 'تفویت', color: 'bg-blue-100 text-blue-800' },
  { code: 'T', label: 'أوزان', color: 'bg-blue-100 text-blue-800' },
  { code: 'F', label: 'نقص', color: 'bg-indigo-100 text-indigo-800' },
  { code: 'U', label: 'ميل', color: 'bg-indigo-100 text-indigo-800' },
  { code: 'G', label: 'تصفط', color: 'bg-pink-100 text-pink-800' },
  { code: 'V', label: 'خط بيان', color: 'bg-pink-100 text-pink-800' },
  { code: 'H', label: 'مقاسات', color: 'bg-cyan-100 text-cyan-800' },
  { code: 'W', label: 'تعريقه', color: 'bg-cyan-100 text-cyan-800' },
  { code: 'I', label: 'ضعف', color: 'bg-teal-100 text-teal-800' },
  { code: 'X', label: 'خط لون', color: 'bg-teal-100 text-teal-800' },
  { code: 'J', label: 'خط قاطع', color: 'bg-lime-100 text-lime-800' },
  { code: 'Y', label: 'فتح بالقالب', color: 'bg-lime-100 text-lime-800' },
  { code: 'K', label: 'حرارات', color: 'bg-rose-100 text-rose-800' },
  { code: 'Z', label: 'اهتزاز', color: 'bg-rose-100 text-rose-800' },
  { code: 'L', label: 'جهاز اختبار', color: 'bg-emerald-100 text-emerald-800' },
  { code: 'AA', label: 'تقل بالغطاء', color: 'bg-emerald-100 text-emerald-800' },
  { code: 'M', label: 'ريحه', color: 'bg-gray-100 text-gray-800' },
  { code: 'AB', label: 'قلبه بالغطاء', color: 'bg-gray-100 text-gray-800' },
  { code: 'N', label: 'نمش', color: 'bg-amber-100 text-amber-800' },
  { code: 'AC', label: 'لحميه', color: 'bg-amber-100 text-amber-800' },
  { code: 'O', label: 'ثقوب', color: 'bg-red-50 text-red-900' },
];

const TIME_SLOTS = [
  '08:00 ص', '10:00 ص', '12:00 م', '02:00 م', '04:00 م', '06:00 م', 
  '08:00 م', '10:00 م', '12:00 ص', '02:00 ص', '04:00 ص', '06:00 ص'
];

export const Checklist: React.FC<ChecklistProps> = ({ entries, setEntries, machines, setMachines, requestAuth, role, shiftNames, setShiftNames }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedShift, setSelectedShift] = useState<'A' | 'B' | 'C'>('A');

  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [newMachineName, setNewMachineName] = useState('');

  const currentNames = shiftNames[selectedDate] || { A: '', B: '', C: '' };

  const handleNameChange = (shift: 'A' | 'B' | 'C', name: string) => {
      setShiftNames(prev => ({
          ...prev,
          [selectedDate]: {
              ...(prev[selectedDate] || { A: '', B: '', C: '' }),
              [shift]: name
          }
      }));
  };

  const getEntry = (machineId: string, timeSlot: string) => {
    return entries.find(e => 
      e.date === selectedDate && 
      e.shift === selectedShift && 
      e.machineId === machineId && 
      e.timeSlot === timeSlot
    );
  };

  const handleCellChange = (machineId: string, timeSlot: string, value: string) => {
    const upperValue = value.toUpperCase();
    
    setEntries(prev => {
      const filtered = prev.filter(e => 
        !(e.date === selectedDate && e.shift === selectedShift && e.machineId === machineId && e.timeSlot === timeSlot)
      );
      
      if (upperValue.trim() === '') return filtered;

      return [...filtered, {
        id: `${selectedDate}-${selectedShift}-${machineId}-${timeSlot}`,
        date: selectedDate,
        shift: selectedShift,
        machineId,
        timeSlot,
        status: upperValue
      }];
    });
  };

  const handleAddMachine = (e: React.FormEvent) => {
      e.preventDefault();
      if (newMachineName.trim() && !machines.includes(newMachineName.trim())) {
          setMachines(prev => [...prev, newMachineName.trim()]);
          setNewMachineName('');
      }
  };

  const handleDeleteMachine = (machineName: string) => {
      setMachines(prev => prev.filter(m => m !== machineName));
  };

  const handleExportCSV = () => {
    const headers = ['الماكينة', ...TIME_SLOTS];
    
    const rows = machines.map(machine => {
      const rowData = [machine];
      TIME_SLOTS.forEach(time => {
         const entry = getEntry(machine, time);
         rowData.push(entry?.status || '-');
      });
      return rowData.join(',');
    });

    const shiftLabel = selectedShift === 'A' ? 'الوردية الأولى' : selectedShift === 'B' ? 'الوردية الثانية' : 'الوردية الثالثة';
    const shiftSupervisor = currentNames[selectedShift] || 'غير محدد';

    const csvContent = '\uFEFF' + [
        `تقرير فحص الوردية: ${shiftLabel},المسؤول: ${shiftSupervisor},التاريخ: ${selectedDate}`,
        '',
        headers.join(','), 
        ...rows
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `checklist_${selectedDate}_shift_${selectedShift}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCellColor = (status: string | undefined) => {
    if (!status) return 'bg-white';
    if (status === 'OK') return 'bg-green-100 text-green-800 font-bold border-green-300';
    if (status === 'STOP') return 'bg-red-100 text-red-800 font-bold border-red-300';
    return 'bg-amber-50 text-amber-800 font-bold border-amber-200';
  };

  return (
    <div className="space-y-6 pb-20 print:pb-0 print:space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <CheckSquare className="w-8 h-8 text-royal-600" />
            قائمة الفحص اليومي (Checklist)
          </h2>
          <p className="text-gray-500 font-bold text-sm">متابعة جودة الماكينات الدورية</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
                <Calendar className="w-4 h-4 text-gray-500" />
                <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => setSelectedDate(e.target.value)} 
                    className="bg-transparent outline-none text-sm font-bold text-gray-700"
                />
            </div>

            {role === 'admin' && (
                <button 
                    onClick={() => requestAuth(() => setIsManageModalOpen(true))}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-royal-800 border border-royal-200 rounded-xl font-bold hover:bg-royal-50 transition-colors"
                >
                    <Settings2 className="w-4 h-4" />
                    إدارة الماكينات
                </button>
            )}

            <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
                title="تحميل كملف Excel"
            >
                <FileSpreadsheet className="w-4 h-4" />
                تصدير Excel
            </button>
        </div>
      </div>

      {/* REFINED: Shift Selector Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
          {[
              { id: 'A', label: 'الوردية الأولى' },
              { id: 'B', label: 'الوردية الثانية' },
              { id: 'C', label: 'الوردية الثالثة' }
          ].map((shift) => (
              <div 
                key={shift.id}
                onClick={() => setSelectedShift(shift.id as any)}
                className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex flex-col gap-4 relative overflow-hidden group bg-white shadow-sm ${
                    selectedShift === shift.id 
                    ? 'border-royal-600 shadow-xl shadow-royal-900/5 ring-1 ring-royal-200' 
                    : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
                }`}
              >
                  <div className={`absolute top-0 right-0 left-0 h-1.5 transition-colors ${selectedShift === shift.id ? 'bg-royal-600' : 'bg-transparent group-hover:bg-gray-50'}`} />
                  
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-black tracking-wide ${selectedShift === shift.id ? 'text-royal-800' : 'text-gray-500'}`}>
                        {shift.label}
                    </span>
                    {selectedShift === shift.id && (
                        <div className="bg-royal-600 text-white p-1 rounded-full shadow-sm">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                      <label className={`text-[10px] font-black uppercase tracking-widest ${selectedShift === shift.id ? 'text-royal-500' : 'text-gray-400'}`}>مسؤول الوردية</label>
                      <div className="relative">
                          <User className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${selectedShift === shift.id ? 'text-royal-400' : 'text-gray-300'}`} />
                          <input 
                            type="text"
                            placeholder="اكتب اسم المسؤول هنا..."
                            value={currentNames[shift.id as 'A'|'B'|'C']}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleNameChange(shift.id as any, e.target.value)}
                            className={`w-full pr-10 pl-4 py-3 rounded-2xl border outline-none font-black text-sm transition-all ${
                                selectedShift === shift.id 
                                ? 'bg-white border-royal-200 text-royal-900 focus:ring-4 focus:ring-royal-500/10 focus:border-royal-500' 
                                : 'bg-gray-50/30 border-gray-100 text-gray-500 hover:bg-white focus:bg-white'
                            }`}
                          />
                      </div>
                  </div>
              </div>
          ))}
      </div>

      {/* Defect Codes Legend */}
      <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:border print:rounded-none">
          <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center print:p-2 print:bg-gray-100">
              <h3 className="font-black text-gray-800 flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-royal-600" />
                  دليل أكواد العيوب
              </h3>
              <span className="text-[10px] text-gray-500 font-bold bg-white px-2 py-1 rounded border no-print">اكتب الكود في الخانة</span>
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 print:grid-cols-8 print:p-2 print:gap-1">
              {DEFECT_CODES.map((defect) => (
                  <div key={defect.code} className={`flex items-center justify-between px-2 py-1.5 rounded-lg border text-xs font-bold ${defect.color.replace('bg-', 'border-').replace('text-', 'text-opacity-50')} bg-white print:py-1`}>
                      <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded text-gray-800 font-black print:w-4 print:h-4 print:text-[10px]">{defect.code}</span>
                      <span className="text-gray-700 print:text-[9px]">{defect.label}</span>
                  </div>
              ))}
              <div className="col-span-1 md:col-span-2 flex gap-2 print:col-span-2">
                 <div className="flex-1 flex items-center justify-center bg-green-100 text-green-800 rounded-lg border border-green-200 font-black text-xs print:text-[9px] print:py-1">OK = سليم</div>
                 <div className="flex-1 flex items-center justify-center bg-red-100 text-red-800 rounded-lg border border-red-200 font-black text-xs print:text-[9px] print:py-1">STOP = توقف</div>
              </div>
          </div>
      </div>

      {/* Main Inspection Grid */}
      <div className="bg-white rounded-[1.5rem] shadow-md border border-gray-200 overflow-hidden print:shadow-none print:border print:rounded-none">
         <div className="overflow-x-auto">
             <table className="w-full text-center border-collapse">
                 <thead>
                     <tr className="bg-royal-900 text-white text-sm print:bg-gray-800 print:text-black print:text-xs">
                         <th className="p-4 font-black border-l border-royal-800 w-24 print:p-2 print:border-gray-300">الماكينة</th>
                         {TIME_SLOTS.map((time) => (
                             <th key={time} className="p-3 font-bold border-l border-royal-800 min-w-[80px] print:p-1 print:border-gray-300 print:text-[10px]">{time}</th>
                         ))}
                     </tr>
                 </thead>
                 <tbody className="text-sm font-bold text-gray-700">
                     {machines.map((machine) => (
                         <tr key={machine} className="hover:bg-gray-50 border-b border-gray-100 last:border-0 print:border-gray-300">
                             <td className="p-3 bg-gray-50 font-black border-l border-gray-200 text-royal-800 text-base print:bg-gray-100 print:border-gray-300 print:text-sm print:p-1">{machine}</td>
                             {TIME_SLOTS.map((time) => {
                                 const entry = getEntry(machine, time);
                                 return (
                                     <td key={time} className="p-1 border-l border-gray-100 h-14 relative group print:h-8 print:border-gray-300 print:p-0">
                                         <input 
                                            type="text" 
                                            maxLength={4}
                                            value={entry?.status || ''}
                                            onChange={(e) => handleCellChange(machine, time, e.target.value)}
                                            className={`w-full h-full text-center outline-none transition-all uppercase rounded-md focus:ring-2 focus:ring-inset focus:ring-royal-500 ${getCellColor(entry?.status)} print:rounded-none print:text-xs`}
                                            placeholder="-"
                                         />
                                     </td>
                                 );
                             })}
                         </tr>
                     ))}
                 </tbody>
             </table>
         </div>
      </div>

      {/* Machine Management Modal */}
      <AnimatePresence>
        {isManageModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:hidden">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden flex flex-col"
               >
                   <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
                        <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
                            <Settings2 className="w-5 h-5 text-royal-600" />
                            إدارة الماكينات
                        </h3>
                        <button onClick={() => setIsManageModalOpen(false)} className="text-gray-400 hover:text-red-500">
                            <X className="w-5 h-5" />
                        </button>
                   </div>
                   
                   <div className="p-6">
                       <form onSubmit={handleAddMachine} className="flex gap-2 mb-6">
                           <input 
                               type="text" 
                               value={newMachineName}
                               onChange={(e) => setNewMachineName(e.target.value)}
                               placeholder="اسم الماكينة (مثلاً: P9)"
                               className="flex-1 px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-royal-500 text-sm font-bold"
                           />
                           <button 
                               type="submit" 
                               disabled={!newMachineName.trim()}
                               className="px-4 py-2 bg-royal-800 text-white rounded-xl hover:bg-royal-900 disabled:opacity-50 font-bold"
                           >
                               <Plus className="w-5 h-5" />
                           </button>
                       </form>

                       <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                           {machines.map((machine) => (
                               <div key={machine} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                   <span className="font-black text-gray-700">{machine}</span>
                                   <button 
                                       onClick={() => handleDeleteMachine(machine)}
                                       className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                       title="حذف الماكينة"
                                   >
                                       <Trash2 className="w-4 h-4" />
                                   </button>
                               </div>
                           ))}
                           {machines.length === 0 && (
                               <p className="text-center text-gray-400 font-bold py-4">لا توجد ماكينات مضافة</p>
                           )}
                       </div>
                   </div>
               </motion.div>
           </div>
        )}
      </AnimatePresence>

      <div className="text-center text-xs text-gray-400 font-bold mt-4 no-print">
         يتم حفظ البيانات تلقائياً. اختر البطاقة العلوية لتفعيل الوردية وإدخال اسم المسؤول.
      </div>
    </div>
  );
};
