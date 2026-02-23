import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface PrefixRule {
  prefix: string;
  category_name: string;
  category_code: string;
  subcategory_code: string;
}

interface Category {
  code: string;
  name: string;
}

interface Subcategory {
  code: string;
  name: string;
}

interface MissingPrefixData {
  success: boolean;
  categoryCode: string;
  totalSubcategories: number;
  coveredCount: number;
  missingPrefixes: Subcategory[];
}

export default function AdminPrefixMapper() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [prefixInput, setPrefixInput] = useState<string>("");
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [tapZoneFeedback, setTapZoneFeedback] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  const handleTapZone = (target: string) => {
    setTapZoneFeedback(target);
    setTimeout(() => setTapZoneFeedback(null), 300);
    setLocation(target);
  };

  const { data: rulesData, isLoading: rulesLoading, error: rulesError, refetch: refetchRules } = useQuery<{ success: boolean; rules: PrefixRule[] }>({
    queryKey: ['/api/admin/prefix-rules'],
  });

  const { data: categoriesData } = useQuery<{ success: boolean; categories: Category[] }>({
    queryKey: ['/api/admin/diagnostics/categories-list'],
  });

  const { data: subcategoriesData } = useQuery<{ success: boolean; subcategories: Subcategory[] }>({
    queryKey: ['/api/admin/diagnostics/subcategories', selectedCategory],
    queryFn: async () => {
      if (!selectedCategory) return { success: true, subcategories: [] };
      // ROGER NON-NEGOTIABLE: Subcategories MUST be fetched by category_code
      const response = await fetch(`/api/admin/diagnostics/subcategories/${selectedCategory}`);
      return response.json();
    },
    enabled: !!selectedCategory,
  });

  const { data: missingPrefixData, refetch: refetchMissing } = useQuery<MissingPrefixData>({
    queryKey: ['/api/admin/missing-prefixes', selectedCategory],
    queryFn: async () => {
      if (!selectedCategory) return { success: true, categoryCode: '', totalSubcategories: 0, coveredCount: 0, missingPrefixes: [] };
      const response = await fetch(`/api/admin/missing-prefixes/${selectedCategory}`);
      return response.json();
    },
    enabled: !!selectedCategory,
  });

  const createRuleMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/prefix-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_code: selectedCategory,
          subcategory_code: selectedSubcategory,
          prefix: prefixInput.toUpperCase(),
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create rule');
      }
      return response.json();
    },
    onSuccess: async (data) => {
      console.log('✅ Rule created:', data);
      // Refetch rules and missing prefixes BEFORE clearing selection
      await refetchRules();
      await refetchMissing();
      
      setSubmitMessage({ type: 'success', text: '✅ Prefix rule created!' });
      setPrefixInput('');
      setSelectedSubcategory('');
      setSelectedCategory('');
      setTimeout(() => setSubmitMessage(null), 3000);
    },
    onError: (error: any) => {
      console.error('❌ Rule creation failed:', error);
      setSubmitMessage({ type: 'error', text: `❌ ${error.message}` });
      setTimeout(() => setSubmitMessage(null), 5000);
    },
  });

  const rules = rulesData?.rules || [];
  const categories = categoriesData?.categories || [];
  const subcategories = subcategoriesData?.subcategories || [];
  const missingPrefixes = missingPrefixData?.missingPrefixes || [];
  const totalSubcategories = missingPrefixData?.totalSubcategories || 0;
  const coveredCount = missingPrefixData?.coveredCount || 0;

  const canSubmit = selectedCategory && selectedSubcategory && prefixInput.trim().length > 0;

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
        onTouchStart={() => handleTapZone('/admin/diagnostics')}
        onClick={() => handleTapZone('/admin/diagnostics')}
        className={`fixed top-0 right-0 w-[150px] h-[150px] z-[9999] cursor-pointer transition-all ${tapZoneFeedback === '/admin/diagnostics' ? 'bg-white/30' : 'bg-transparent'}`}
        title="System Diagnostics"
        style={{ pointerEvents: 'auto', WebkitTapHighlightColor: 'transparent' }}
      />

      <h1 className="text-3xl font-cursive font-bold mb-6">
        <span className="glow-yellow">Prefix Rules Mapper</span>
      </h1>

      {rulesLoading ? (
        <div className="text-yellow-400 animate-pulse">Loading prefix rules...</div>
      ) : rulesError ? (
        <div className="text-red-500 bg-red-900/30 px-4 py-2 rounded">
          Error: {(rulesError as Error).message}
        </div>
      ) : (
        <div className="w-full max-w-4xl space-y-6">
          {submitMessage && (
            <div className={`px-4 py-2 rounded text-center font-bold ${submitMessage.type === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
              {submitMessage.text}
            </div>
          )}

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h2 className="text-lg font-bold text-cyan-400 mb-4">Create New Prefix Rule</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Category:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedSubcategory('');
                  }}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  data-testid="select-category-form"
                >
                  <option value="">-- Select Category --</option>
                  {categories
                    .filter(cat => cat.code !== 'ANI')
                    .map(cat => (
                      <option key={cat.code} value={cat.code}>{cat.name}</option>
                    ))}
                </select>
              </div>

              {selectedCategory && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Subcategory:</label>
                  <select
                    value={selectedSubcategory}
                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    data-testid="select-subcategory-form"
                  >
                    <option value="">-- Select Subcategory --</option>
                    {subcategories.map(sub => (
                      <option key={sub.code} value={sub.code}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-1">Prefix (e.g., SHL, AVT):</label>
                <input
                  type="text"
                  value={prefixInput}
                  onChange={(e) => setPrefixInput(e.target.value.toUpperCase())}
                  placeholder="Enter prefix code"
                  maxLength={10}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white font-mono"
                  data-testid="input-prefix"
                />
              </div>

              <button
                onClick={() => createRuleMutation.mutate()}
                disabled={!canSubmit || createRuleMutation.isPending}
                className={`w-full py-2 rounded font-bold transition-all ${
                  canSubmit && !createRuleMutation.isPending
                    ? 'bg-green-700 hover:bg-green-600 text-white cursor-pointer'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
                data-testid="button-save-rule"
              >
                {createRuleMutation.isPending ? 'Creating...' : 'Save Prefix Rule'}
              </button>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h2 className="text-lg font-bold text-cyan-400 mb-3">All Prefix Rules ({rules.length} total)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-2 px-3 text-yellow-400">Category Code</th>
                    <th className="text-left py-2 px-3 text-yellow-400">Category Name</th>
                    <th className="text-left py-2 px-3 text-yellow-400">Subcategory Code</th>
                    <th className="text-left py-2 px-3 text-yellow-400">Prefix</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule, i) => (
                    <tr key={i} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                      <td className="py-2 px-3 font-mono text-cyan-300">{rule.category_code}</td>
                      <td className="py-2 px-3">{rule.category_name}</td>
                      <td className="py-2 px-3 font-mono text-pink-300">{rule.subcategory_code}</td>
                      <td className="py-2 px-3 font-mono font-bold text-green-400">{rule.prefix}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h2 className="text-lg font-bold text-cyan-400 mb-3">Check Missing Prefixes</h2>
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-1">Select Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full max-w-md bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                data-testid="select-category"
              >
                <option value="">-- Select a category --</option>
                {categories
                  .filter(cat => cat.code !== 'ANI')
                  .map(cat => (
                    <option key={cat.code} value={cat.code}>{cat.name}</option>
                  ))}
              </select>
            </div>

            {selectedCategory && totalSubcategories === 0 && (
              <div className="text-gray-500">No subcategories found for this category.</div>
            )}

            {selectedCategory && totalSubcategories > 0 && missingPrefixes.length === 0 && (
              <div className="text-green-400 font-bold text-center py-4">
                ✅ All subcategories in this category have prefix rules
              </div>
            )}

            {selectedCategory && missingPrefixes.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm text-gray-400">
                  Missing Prefix Rules ({missingPrefixes.length} of {totalSubcategories}):
                </h3>
                <div className="grid gap-2">
                  {missingPrefixes.map(sub => (
                    <div 
                      key={sub.code} 
                      className="flex items-center justify-between px-3 py-2 rounded bg-red-900/30 border border-red-700"
                    >
                      <div className="space-x-2">
                        <span className="text-gray-300">{sub.name}</span>
                      </div>
                      <span className="text-red-400 font-bold text-sm">Missing Prefix Rule</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
