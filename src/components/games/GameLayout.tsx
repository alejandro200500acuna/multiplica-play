import { X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';

export default function GameLayout({ 
  children, 
  title, 
  current, 
  total,
  colorClass = 'text-primary'
}: { 
  children: React.ReactNode; 
  title: string;
  current: number;
  total: number;
  colorClass?: string;
}) {
  const { setStep } = useStore();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel w-full max-w-4xl mx-auto rounded-3xl p-6 md:p-10 shadow-2xl flex flex-col min-h-[600px] relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className={`text-2xl md:text-3xl font-display font-bold ${colorClass}`}>
          {title}
        </h2>
        
        <div className="flex items-center gap-4">
          <div className="bg-white/50 dark:bg-black/20 px-4 py-2 rounded-full font-bold text-lg">
            {current} / {total}
          </div>
          <button 
            onClick={() => setStep('GAMES')}
            className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors border-2 border-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center">
        {children}
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 mt-8 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-success to-primary"
          initial={{ width: 0 }}
          animate={{ width: `${(current / total) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
}
