
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, ComposedChart
} from 'recharts';
import { Product, KPIData, PageView, ReservedItem, UserRole } from '../types';
import { 
  Package, TrendingUp, Download, Eye, ShieldCheck, Clock, ArrowRight, 
  BarChart3, PlusCircle, Zap, Activity, Calendar as CalendarIcon, FileText,
  AlertTriangle, ClipboardList, Lock, Edit2, Trash2, X, Save, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardProps {
  products: Product[];
  kpiData: KPIData[];
  reservedItems: ReservedItem[];
  setReservedItems: React.Dispatch<React.SetStateAction<ReservedItem[]>>;
  handleGenerateReport: () => void;
  navigate: (view: PageView) => void;
  role: UserRole | null;
  requestAuth: (action: () => void) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  products, kpiData, handleGenerateReport, navigate, 
  reservedItems = [], setReservedItems, role, requestAuth 
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Reserved Area Modal State
  const [isReservedModalOpen, setIsReservedModalOpen] = useState(false);
  const [editingReservedItem, setEditingReservedItem] = useState<ReservedItem | null>(null);
  const [reservedFormData, setReservedFormData] = useState<Partial<ReservedItem>>({
    productName: '',
    quantity: 0,
    defects: '',
    actionTaken: '',
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
    shift: 'A',
    inspectorName: ''
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalProducts = products.length;
  const totalKpis = kpiData.length;
  const lastQualityRate = kpiData.length > 0 ? kpiData[kpiData.length - 1].qualityRate : 0;
  
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const formattedDate = new Intl.DateTimeFormat('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(currentTime);

  const formattedTime = currentTime.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // --- Reserved Area Functions ---

  const handleOpenAddReserved = () => {
    requestAuth(() => {
      setReservedFormData({
        productName: '',
        quantity: 0,
        defects: '',
        actionTaken: '',
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        shift: 'A',
        inspectorName: ''
      });
      setEditingReservedItem(null);
      setIsReservedModalOpen(true);
    });
  };

  const handleEditReserved = (item: ReservedItem) => {
    requestAuth(() => {
      setReservedFormData(item);
      setEditingReservedItem(item);
      setIsReservedModalOpen(true);
    });
  };

  const handleDeleteReserved = (id: string) => {
    requestAuth(() => {
      setReservedItems(prev => prev.filter(item => item.id !== id));
    });
  };

  const handleSaveReserved = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReservedItem) {
      setReservedItems(prev => prev.map(item => item.id === editingReservedItem.id ? { ...reservedFormData, id: item.id } as ReservedItem : item));
    } else {
      const newItem: ReservedItem = {
        id: Date.now().toString(),
        shift: reservedFormData.shift || 'A',
        inspectorName: reservedFormData.inspectorName || 'غير محدد',
        ...(reservedFormData as Omit<ReservedItem, 'id' | 'shift' | 'inspectorName'>)
      };
      setReservedItems(prev => [newItem, ...prev]);
    }
    setIsReservedModalOpen(false);
  };

  const handleExportCSV = () => {
    const statsHeaders = ['المقياس', 'القيمة'];
    const kpiHeaders = ['الشهر', 'معدل الجودة (%)', 'عدد العيوب'];
    const statsRows = [
        ['تقرير ملخص النظام', new Date().toLocaleDateString('ar-EG')],
        ['إجمالي المنتجات', totalProducts],
        ['إجمالي تقارير الأداء', totalKpis],
    ];
    const kpiRows = kpiData.map(d => [d.month, d.qualityRate, d.defects]);
    const csvContent = [
        '\uFEFF' + statsHeaders.join(','),
        ...statsRows.map(r => r.join(',')),
        '',
        'تحليل مؤشرات الأداء',
        kpiHeaders.join(','),
        ...kpiRows.map(r => r.join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TQM_Dashboard_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-12"
      dir="rtl"
    >
      {/* 0. Real-time Clock & Date Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-center bg-white px-8 py-4 rounded-[2rem] border border-gray-100 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-royal-50 text-royal-700 rounded-2xl">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div className="text-right">
            <p className="text-xs font-black text-gray-400 mb-0.5">التاريخ اليوم</p>
            <p className="text-sm font-black text-slate-800">{formattedDate}</p>
          </div>
        </div>
        <div className="hidden md:block h-8 w-px bg-gray-100"></div>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
          <div className="text-right">
            <p className="text-xs font-black text-gray-400 mb-0.5">الوقت الحالي</p>
            <p className="text-xl font-black text-slate-800 font-mono tracking-wider">{formattedTime}</p>
          </div>
        </div>
      </motion.div>

      {/* 1. Header & Welcome Section */}
      <motion.div variants={itemVariants} className="relative overflow-hidden bg-gradient-to-l from-royal-900 via-royal-800 to-royal-700 rounded-[3rem] p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-right space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-sm font-bold">
               <Zap className="w-4 h-4 text-amber-400" />
               نظام إدارة الجودة الشاملة نشط الآن
            </div>
            <h2 className="text-4xl md:text-5xl font-black leading-tight">نظرة عامة على الأداء</h2>
            <p className="text-royal-100 text-lg max-w-xl font-medium opacity-90">
              مرحباً بك في لوحة القيادة المركزية. تابع معدلات الجودة، الإنتاج، والامتثال للمعايير في مكان واحد.
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <button 
                onClick={handleExportCSV}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-royal-900 rounded-2xl font-black shadow-lg hover:bg-royal-50 transition-all active:scale-95"
            >
                <Download className="w-5 h-5" />
                تصدير التقرير التنفيذي
            </button>
            <button 
                onClick={() => navigate('products')}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-royal-600/30 backdrop-blur-md border border-white/30 text-white rounded-2xl font-black hover:bg-royal-600/50 transition-all"
            >
                <Eye className="w-5 h-5" />
                استعراض كافة المنتجات
            </button>
          </div>
        </div>
      </motion.div>

      {/* 2. Advanced Metrics Grid - Adjusted to 3 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'إجمالي المنتجات', value: totalProducts, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', trend: '+14%' },
          { label: 'معدل الجودة', value: `${lastQualityRate}%`, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', trend: '+2.4%' },
          { label: 'تقارير الأداء', value: totalKpis, icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', trend: 'محدث' },
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants} className={`bg-white p-6 rounded-[2rem] border ${stat.border} shadow-sm group hover:shadow-xl transition-all duration-500`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black px-2 py-1 bg-gray-50 text-gray-400 rounded-lg uppercase tracking-wider">{stat.trend}</span>
            </div>
            <p className="text-gray-500 text-sm font-bold mb-1">{stat.label}</p>
            <h4 className="text-3xl font-black text-slate-800">{stat.value}</h4>
          </motion.div>
        ))}
      </div>

      {/* 3. Dynamic Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Card */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-800">مؤشر الجودة والعيوب</h3>
              <p className="text-gray-400 text-xs mt-1">تحليل الاتجاه العام للشهور الماضية</p>
            </div>
            <div className="flex gap-2">
               <div className="flex items-center gap-1.5 px-3 py-1 bg-royal-50 text-royal-700 rounded-full text-[10px] font-bold">
                 <div className="w-2 h-2 rounded-full bg-royal-600"></div> معدل الجودة
               </div>
               <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-[10px] font-bold">
                 <div className="w-2 h-2 rounded-full bg-rose-600"></div> كمية العيوب
               </div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={kpiData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{fontSize: 12, fontWeight: 700}} tickLine={false} axisLine={false} reversed={true} />
                <YAxis yAxisId="left" stroke="#94a3b8" tick={{fontSize: 12, fontWeight: 700}} tickLine={false} axisLine={false} orientation="right" />
                <YAxis yAxisId="right" stroke="#94a3b8" tick={{fontSize: 12, fontWeight: 700}} tickLine={false} axisLine={false} orientation="left" />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '16px', border: 'none', color: '#fff', textAlign: 'right', fontStyle: 'Cairo' }}
                />
                <Area yAxisId="left" type="monotone" dataKey="qualityRate" name="معدل الجودة" fill="#eff6ff" stroke="#3b82f6" strokeWidth={4} />
                <Bar yAxisId="right" dataKey="defects" name="العيوب" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Quick Access Sidebar */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm h-full">
            <h3 className="text-xl font-black text-slate-800 mb-6">الوصول السريع</h3>
            <div className="space-y-4">
              {[
                { label: 'إضافة منتج جديد', icon: PlusCircle, view: 'products', color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'رفع وثيقة معتمدة', icon: FileText, view: 'documents', color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'تحديث مؤشرات الأداء', icon: Activity, view: 'kpi', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'قاعدة البيانات', icon: Clock, view: 'database', color: 'text-purple-600', bg: 'bg-purple-50' },
              ].map((action, i) => (
                <button 
                  key={i}
                  onClick={() => navigate(action.view as PageView)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 rounded-2xl transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${action.bg} ${action.color} group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-slate-700">{action.label}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-royal-600 group-hover:-translate-x-1 transition-all" />
                </button>
              ))}
            </div>

            <div className="mt-8 p-6 bg-royal-900 rounded-[1.5rem] text-white relative overflow-hidden">
                <ShieldCheck className="absolute -bottom-4 -left-4 w-24 h-24 text-white/5" />
                <h4 className="font-black mb-2 flex items-center gap-2">تأمين البيانات</h4>
                <p className="text-[10px] text-royal-200 font-medium leading-relaxed">
                  يتم حفظ كافة البيانات محلياً في قاعدة بيانات IndexedDB لضمان الخصوصية والسرعة.
                </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 4. Reserved Area (Quarantine) Section */}
      <motion.div variants={itemVariants} className="bg-red-50/50 rounded-[2.5rem] shadow-sm border border-red-100 overflow-hidden relative">
         <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-bl-[100px] -z-0 opacity-50" />
         
         <div className="p-8 border-b border-red-100 flex justify-between items-center relative z-10">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 text-red-600 rounded-2xl shadow-sm">
                    <ClipboardList className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-800">منطقة المحجوزات (Quarantine)</h3>
                    <p className="text-gray-500 text-xs mt-1 font-bold">متابعة المنتجات المعيبة والإجراءات المتخذة</p>
                </div>
            </div>
            {role === 'admin' ? (
                 <button 
                 onClick={handleOpenAddReserved}
                 className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl font-black shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all active:scale-95 text-sm"
               >
                 <PlusCircle className="w-4 h-4" />
                 إضافة محجوز
               </button>
            ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-xl text-xs font-bold">
                    <Lock className="w-3 h-3" />
                    للقراءة فقط
                </div>
            )}
         </div>

         <div className="overflow-x-auto p-4">
             <table className="w-full text-right border-separate border-spacing-y-3">
                 <thead className="text-gray-500 text-xs uppercase font-black">
                     <tr>
                         <th className="px-6 py-2">اسم المنتج</th>
                         <th className="px-6 py-2">المسؤول / الوردية</th>
                         <th className="px-6 py-2">الكمية</th>
                         <th className="px-6 py-2">وصف العيب</th>
                         <th className="px-6 py-2">الإجراء المتخذ</th>
                         <th className="px-6 py-2">التاريخ</th>
                         <th className="px-6 py-2">الحالة</th>
                         {role === 'admin' && <th className="px-6 py-2 text-center">تحكم</th>}
                     </tr>
                 </thead>
                 <tbody>
                     {reservedItems.length === 0 ? (
                        <tr>
                            <td colSpan={8} className="text-center py-10 bg-white rounded-2xl text-gray-400 font-bold border border-gray-100 shadow-sm">
                                لا توجد منتجات في منطقة الحجز حالياً
                            </td>
                        </tr>
                     ) : (
                         reservedItems.map((item) => (
                             <tr key={item.id} className="bg-white hover:bg-red-50/30 transition-colors shadow-sm rounded-2xl group">
                                 <td className="px-6 py-4 rounded-r-2xl font-bold text-slate-800 border-t border-b border-r border-gray-100 group-hover:border-red-100">
                                     {item.productName}
                                 </td>
                                 <td className="px-6 py-4 border-t border-b border-gray-100 group-hover:border-red-100">
                                     <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5 font-bold text-slate-700">
                                            <User className="w-3 h-3 text-gray-400" />
                                            {item.inspectorName || 'غير محدد'}
                                        </div>
                                        <span className="text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-0.5 rounded w-fit mt-1">وردية {item.shift || 'A'}</span>
                                     </div>
                                 </td>
                                 <td className="px-6 py-4 font-black text-slate-800 border-t border-b border-gray-100 group-hover:border-red-100">
                                     {item.quantity}
                                 </td>
                                 <td className="px-6 py-4 border-t border-b border-gray-100 group-hover:border-red-100">
                                     <div className="flex items-center gap-2 text-red-600 text-sm font-bold bg-red-50 px-3 py-1 rounded-lg w-fit">
                                        <AlertTriangle className="w-3 h-3" />
                                        {item.defects}
                                     </div>
                                 </td>
                                 <td className="px-6 py-4 text-sm text-slate-600 font-medium border-t border-b border-gray-100 group-hover:border-red-100">
                                     {item.actionTaken || '---'}
                                 </td>
                                 <td className="px-6 py-4 text-xs font-bold text-gray-400 border-t border-b border-gray-100 group-hover:border-red-100">
                                     {item.date}
                                 </td>
                                 <td className="px-6 py-4 border-t border-b border-gray-100 group-hover:border-red-100">
                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${
                                        item.status === 'resolved' ? 'bg-green-100 text-green-700' : 
                                        item.status === 'scrapped' ? 'bg-gray-100 text-gray-700' : 
                                        'bg-amber-100 text-amber-700'
                                    }`}>
                                        {item.status === 'resolved' ? 'تم المعالجة' : item.status === 'scrapped' ? 'إعدام' : 'قيد الانتظار'}
                                    </span>
                                 </td>
                                 {role === 'admin' && (
                                     <td className="px-6 py-4 rounded-l-2xl text-center border-t border-b border-l border-gray-100 group-hover:border-red-100">
                                         <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                             <button 
                                                onClick={() => handleEditReserved(item)}
                                                className="p-2 text-royal-600 hover:bg-royal-50 rounded-lg transition-colors"
                                             >
                                                 <Edit2 className="w-4 h-4" />
                                             </button>
                                             <button 
                                                onClick={() => handleDeleteReserved(item.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                             >
                                                 <Trash2 className="w-4 h-4" />
                                             </button>
                                         </div>
                                     </td>
                                 )}
                             </tr>
                         ))
                     )}
                 </tbody>
             </table>
         </div>
      </motion.div>

      {/* 5. Recent Items Table */}
      <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
         <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-slate-400">
                    <Clock className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-800">أحدث المنتجات المضافة</h3>
                    <p className="text-gray-400 text-xs mt-1">عرض آخر 5 منتجات تم تسجيلها في النظام</p>
                </div>
            </div>
            <button 
                onClick={() => navigate('products')}
                className="text-royal-600 text-sm font-black hover:text-royal-800 flex items-center gap-2 bg-royal-50 px-5 py-2.5 rounded-xl transition-all"
            >
                إدارة كافة المنتجات <ArrowRight className="w-4 h-4" />
            </button>
         </div>
         <div className="overflow-x-auto">
             <table className="w-full text-right">
                 <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-black">
                     <tr>
                         <th className="px-8 py-5">هوية المنتج</th>
                         <th className="px-8 py-5">المواصفات والشركة</th>
                         <th className="px-8 py-5 text-center">الإجراء</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                     {products.slice(0, 5).map((product) => (
                         <tr key={product.id} className="hover:bg-royal-50/20 transition-colors">
                             <td className="px-8 py-5">
                                 <div className="flex items-center gap-5">
                                     <div className="relative w-16 h-16 shrink-0">
                                        <img src={product.image} alt="" className="w-full h-full rounded-2xl object-cover bg-gray-100 border border-gray-200 shadow-sm" />
                                     </div>
                                     <div className="text-right">
                                         <p className="font-black text-slate-800 text-base">{product.name}</p>
                                         <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">ID: #{product.id.slice(-6)}</p>
                                     </div>
                                 </div>
                             </td>
                             <td className="px-8 py-5">
                                 <div className="space-y-1">
                                    <p className="text-sm text-slate-600 font-medium truncate max-w-[300px]">{product.specs}</p>
                                    <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-black">{product.manufacturer || 'شركة غير محددة'}</span>
                                 </div>
                             </td>
                             <td className="px-8 py-5 text-center">
                                 <button 
                                    onClick={() => navigate('products')}
                                    className="p-3 text-slate-300 hover:text-royal-600 hover:bg-royal-50 rounded-2xl transition-all"
                                 >
                                     <Eye className="w-5 h-5" />
                                 </button>
                             </td>
                         </tr>
                     ))}
                 </tbody>
             </table>
             {products.length === 0 && (
                <div className="p-20 text-center space-y-4">
                    <Package className="w-16 h-16 text-gray-100 mx-auto" />
                    <p className="text-gray-400 font-bold">لا توجد منتجات مسجلة حالياً</p>
                </div>
             )}
         </div>
      </motion.div>

      {/* Reserved Area Modal */}
      <AnimatePresence>
        {isReservedModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="bg-white rounded-[1.5rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
               >
                   <div className="p-4 border-b bg-red-50 flex justify-between items-center shrink-0">
                        <h3 className="text-lg font-black text-red-800 flex items-center gap-2">
                            <ClipboardList className="w-5 h-5" />
                            {editingReservedItem ? 'تعديل بيانات محجوز' : 'إضافة إلى المحجوزات'}
                        </h3>
                        <button onClick={() => setIsReservedModalOpen(false)} className="text-red-300 hover:text-red-600">
                            <X className="w-5 h-5" />
                        </button>
                   </div>
                   <form onSubmit={handleSaveReserved} className="p-5 space-y-3 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700">اسم المنتج</label>
                                <input 
                                    required 
                                    value={reservedFormData.productName}
                                    onChange={(e) => setReservedFormData({...reservedFormData, productName: e.target.value})}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                                    placeholder="اسم المنتج..."
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700">الكمية</label>
                                <input 
                                    type="number"
                                    required 
                                    value={reservedFormData.quantity}
                                    onChange={(e) => setReservedFormData({...reservedFormData, quantity: Number(e.target.value)})}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700">المراقب</label>
                                <input 
                                    required 
                                    value={reservedFormData.inspectorName}
                                    onChange={(e) => setReservedFormData({...reservedFormData, inspectorName: e.target.value})}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                                    placeholder="اسم المراقب..."
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700">الوردية</label>
                                <select 
                                    value={reservedFormData.shift}
                                    onChange={(e) => setReservedFormData({...reservedFormData, shift: e.target.value as any})}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none bg-white text-sm"
                                >
                                    <option value="A">وردية أ</option>
                                    <option value="B">وردية ب</option>
                                    <option value="C">وردية ج</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                             <label className="text-xs font-bold text-gray-700">وصف العيوب</label>
                             <textarea 
                                required
                                value={reservedFormData.defects}
                                onChange={(e) => setReservedFormData({...reservedFormData, defects: e.target.value})}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none h-16 text-sm resize-none"
                                placeholder="صف العيب..."
                             />
                        </div>

                        <div className="space-y-1">
                             <label className="text-xs font-bold text-gray-700">الإجراء المتخذ</label>
                             <textarea 
                                value={reservedFormData.actionTaken}
                                onChange={(e) => setReservedFormData({...reservedFormData, actionTaken: e.target.value})}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none h-16 text-sm resize-none"
                                placeholder="الإجراء..."
                             />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700">التاريخ</label>
                                <input 
                                    type="date"
                                    value={reservedFormData.date}
                                    onChange={(e) => setReservedFormData({...reservedFormData, date: e.target.value})}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700">الحالة</label>
                                <select 
                                    value={reservedFormData.status}
                                    onChange={(e) => setReservedFormData({...reservedFormData, status: e.target.value as any})}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none bg-white text-sm"
                                >
                                    <option value="pending">قيد الانتظار</option>
                                    <option value="resolved">تم المعالجة</option>
                                    <option value="scrapped">إعدام</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-3 border-t border-gray-100">
                             <button type="button" onClick={() => setIsReservedModalOpen(false)} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold text-sm">إلغاء</button>
                             <button type="submit" className="flex-1 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 text-sm">
                                <Save className="w-4 h-4" />
                                حفظ
                             </button>
                        </div>
                   </form>
               </motion.div>
           </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};