import { useState, useEffect, useCallback } from 'react';

export interface DevBypassStatus {
  lastSticker: {
    name: string;
    category_code: string;
    subcategory_code: string;
    created_at: string;
  } | null;
  totalStickers: number;
  totalCategories: number;
}

export function DevBypassBar() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('success');
  const [data, setData] = useState<DevBypassStatus | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    // Supabase logic removed
  }, []);

  useEffect(() => {
    refresh();
    (window as any).refreshDevBypass = refresh;
    return () => {
      delete (window as any).refreshDevBypass;
    };
  }, [refresh]);

  const bgColor = 'bg-gray-900/40 border-gray-500 text-gray-400';

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-[10000] px-4 py-2 border-t-2 font-mono text-[10px] md:text-xs flex justify-between items-center backdrop-blur-md transition-colors duration-500 overflow-hidden ${bgColor}`} style={{ position: 'fixed', bottom: 0 }}>
      <div className="flex gap-4 items-center">
        <span className="font-bold uppercase tracking-widest">
          Dev Bypass (Offline)
        </span>
      </div>
      
      <div className="flex gap-4 items-center">
        <button 
          onClick={refresh}
          className="ml-2 px-2 py-0.5 border border-current rounded hover:bg-white/10 transition-colors uppercase font-bold text-[9px]"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
