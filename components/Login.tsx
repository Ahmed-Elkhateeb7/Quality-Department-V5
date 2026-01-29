
import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Lock } from 'lucide-react';
import { UserRole } from '../types';
import { motion } from 'framer-motion';

interface LoginProps {
  onLogin: (role: UserRole) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '305071') {
      onLogin('admin');
    } else if (password === '1') {
      onLogin('user');
    } else {
      setError('كلمة المرور غير صحيحة');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-royal-800 rounded-3xl shadow-xl shadow-royal-800/20 mb-6">
                <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">نظام إدارة الجودة</h1>
            <p className="text-gray-500">سجل الدخول للمتابعة إلى لوحة التحكم</p>
        </div>

        <div className="bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 p-8 border border-white">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 mr-1 block">كلمة المرور</label>
                    <div className="relative">
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            className="w-full pr-12 pl-4 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-royal-500/10 focus:border-royal-500 outline-none transition-all font-bold text-lg text-center tracking-widest"
                            placeholder="••••••"
                            autoFocus
                        />
                    </div>
                    {error && (
                        <motion.p 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-red-500 text-sm font-bold mr-1"
                        >
                            {error}
                        </motion.p>
                    )}
                </div>

                <button 
                    type="submit"
                    className="w-full py-4 bg-royal-800 text-white rounded-xl font-bold text-lg hover:bg-royal-900 transition-all shadow-xl shadow-royal-800/20 active:scale-95 flex items-center justify-center gap-2 group"
                >
                    تسجيل الدخول
                    <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </button>
            </form>
        </div>
      </motion.div>
    </div>
  );
};
