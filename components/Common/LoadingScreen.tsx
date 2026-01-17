
import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
      <div className="relative">
        <Loader2 size={40} className="text-blue-600 animate-spin" />
        <div className="absolute inset-0 bg-blue-600/10 rounded-full blur-xl animate-pulse"></div>
      </div>
      <p className="mt-4 text-gray-400 text-xs font-bold tracking-widest uppercase animate-pulse">تحميل البيانات...</p>
    </div>
  );
};

export default LoadingScreen;
