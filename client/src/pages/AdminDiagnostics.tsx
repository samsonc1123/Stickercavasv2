import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface DiagnosticResult {
  name: string;
  status: 'pending' | 'pass' | 'fail';
  message?: string;
  data?: any;
}

interface Category {
  code: string;
  name: string;
}

export default function AdminDiagnostics() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [tapZoneFeedback, setTapZoneFeedback] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  const handleTapZone = (target: string) => {
    setTapZoneFeedback(target);
    setTimeout(() => setTapZoneFeedback(null), 300);
    if (target === 'BACK') {
      window.history.back();
    } else {
      setLocation(target);
    }
  };

  const { data: categoriesData } = useQuery<{ success: boolean; categories: Category[] }>({
    queryKey: ['/api/admin/diagnostics/categories-list'],
  });

  const categories = categoriesData?.categories || [];

  const runDiagnostics = async () => {
    setIsRunning(true);
    const newResults: DiagnosticResult[] = [];

    const runCheck = async (name: string, endpoint: string): Promise<DiagnosticResult> => {
      try {
        const res = await fetch(endpoint);
        const data = await res.json();
        if (data.success) {
          return { name, status: 'pass', data, message: JSON.stringify(data) };
        } else {
          return { name, status: 'fail', message: data.error || 'Unknown error' };
        }
      } catch (err: any) {
        return { name, status: 'fail', message: err.message };
      }
    };

    newResults.push(await runCheck('Categories Count', '/api/admin/diagnostics/categories'));
    newResults.push(await runCheck('Subcategories Count', '/api/admin/diagnostics/subcategories'));
    newResults.push(await runCheck('Prefix Rules Count', '/api/admin/diagnostics/prefix-rules-count'));
    newResults.push(await runCheck('Storage List Test', '/api/admin/diagnostics/storage'));

    if (selectedCategory) {
      newResults.push(await runCheck(
        `Subcategories for ${selectedCategory}`,
        `/api/admin/diagnostics/subcategories/${selectedCategory}`
      ));
    }

    setResults(newResults);
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-perforated text-white flex flex-col items-center p-4 pt-8 relative">
      {/* Invisible Tap Zones - Large 150x150 for reliability */}
      <div 
        onTouchStart={() => handleTapZone('/admin')}
        onClick={() => handleTapZone('/admin')}
        className={`fixed top-0 left-0 w-[150px] h-[150px] z-[9999] cursor-pointer transition-all ${tapZoneFeedback === '/admin' ? 'bg-white/30' : 'bg-transparent'}`}
        title="Admin Dugout"
        style={{ pointerEvents: 'auto', WebkitTapHighlightColor: 'transparent' }}
      />
      <div 
        onTouchStart={() => handleTapZone('/admin/reorder')}
        onClick={() => handleTapZone('/admin/reorder')}
        className={`fixed top-0 right-0 w-[150px] h-[150px] z-[9999] cursor-pointer transition-all ${tapZoneFeedback === '/admin/reorder' ? 'bg-white/30' : 'bg-transparent'}`}
        title="Reorder Stickers"
        style={{ pointerEvents: 'auto', WebkitTapHighlightColor: 'transparent' }}
      />

      <h1 className="text-3xl font-cursive font-bold mb-6">
        <span className="glow-yellow">Diagnostics System</span>
      </h1>

      <div className="w-full max-w-2xl space-y-6">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <h2 className="text-lg font-bold text-cyan-400 mb-3">Run Diagnostics</h2>
          
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">Optional: Select Category for subcategory test:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              data-testid="select-category"
            >
              <option value="">-- None (skip category-specific test) --</option>
              {categories.map(cat => (
                <option key={cat.code} value={cat.code}>{cat.name} ({cat.code})</option>
              ))}
            </select>
          </div>

          <button
            onClick={runDiagnostics}
            disabled={isRunning}
            className={`w-full py-3 rounded-lg font-bold ${isRunning ? 'bg-gray-600 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-500'}`}
            data-testid="button-run-diagnostics"
          >
            {isRunning ? 'Running...' : 'Run All Diagnostics'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h2 className="text-lg font-bold text-cyan-400 mb-3">Results</h2>
            <div className="space-y-3">
              {results.map((result, i) => (
                <div 
                  key={i} 
                  className={`p-3 rounded-lg border ${
                    result.status === 'pass' 
                      ? 'bg-green-900/30 border-green-700' 
                      : result.status === 'fail' 
                        ? 'bg-red-900/30 border-red-700'
                        : 'bg-gray-700/30 border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold">{result.name}</span>
                    <span className={`font-mono font-bold ${
                      result.status === 'pass' ? 'text-green-400' : 
                      result.status === 'fail' ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {result.status === 'pass' ? '✓ PASS' : result.status === 'fail' ? '✗ FAIL' : 'PENDING'}
                    </span>
                  </div>
                  {result.message && (
                    <div className="text-xs font-mono text-gray-400 bg-black/30 p-2 rounded overflow-x-auto">
                      {result.message}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <h2 className="text-lg font-bold text-cyan-400 mb-2">What These Tests Check</h2>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• <strong>Categories Count:</strong> Fetches total number of categories from database</li>
            <li>• <strong>Subcategories Count:</strong> Fetches total number of subcategories from database</li>
            <li>• <strong>Prefix Rules Count:</strong> Fetches total number of sticker prefix rules</li>
            <li>• <strong>Storage List Test:</strong> Tests connection to Supabase Storage bucket</li>
            <li>• <strong>Subcategories for Category:</strong> Fetches subcategories for a specific category code</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
