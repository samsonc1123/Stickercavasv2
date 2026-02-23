import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

type CatRow = { code: string; name: string; sortOrder: number; isActive: boolean };

function isTitleCase(str: string): boolean {
  if (!str) return true;
  const words = str.split(/\s+/);
  return words.every((word: string) => {
    if (word.length === 0) return true;
    return word[0] === word[0].toUpperCase() &&
           (word.length === 1 || word.slice(1) === word.slice(1).toLowerCase());
  });
}

const CANONICAL_CODE_RE = /^[A-Z0-9]+(-[A-Z0-9]+)*$/;

export default function AdminTaxonomy() {
  const categoriesRaw = useQuery(api.categories.getAllCategories);
  const auditRaw = useQuery(api.taxonomyAudit.runAudit);

  const categories = (categoriesRaw ?? []) as CatRow[];
  const audit = auditRaw as any;

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'code'>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [activeTab, setActiveTab] = useState<'taxonomy' | 'audit'>('taxonomy');

  const isLoading = categoriesRaw === undefined || auditRaw === undefined;

  const filteredCategories = useMemo(() => {
    let filtered = categories.filter((c: CatRow) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a: CatRow, b: CatRow) => {
      const aVal = sortField === 'name' ? a.name : a.code;
      const bVal = sortField === 'name' ? b.name : b.code;
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

    return filtered;
  }, [categories, searchTerm, sortField, sortAsc]);

  const getCategoryWarnings = (cat: { code: string; name: string }): { level: 'yellow' | 'red' | null; reasons: string[] } => {
    const reasons: string[] = [];
    let level: 'yellow' | 'red' | null = null;

    if (!isTitleCase(cat.name)) {
      reasons.push('Name is not Title Case');
      level = 'yellow';
    }

    if (cat.name === cat.code) {
      reasons.push('Name matches code (code leaking as label)');
      level = 'red';
    }

    if (!CANONICAL_CODE_RE.test(cat.code)) {
      reasons.push('Code format violation');
      level = 'red';
    }

    if (cat.code.includes('_')) {
      reasons.push('Contains underscore');
      level = 'red';
    }

    return { level, reasons };
  };

  const handleSort = (field: 'name' | 'code') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <span className="text-gray-400 animate-pulse uppercase tracking-widest text-xs">Loading taxonomy...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-orbitron font-bold tracking-wider text-green-400">Taxonomy Inspector</h1>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Live Convex data</p>
          </div>
          <Link href="/admin">
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm font-montserrat uppercase tracking-widest border border-gray-600">
              ← Admin
            </button>
          </Link>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('taxonomy')}
            className={`px-4 py-2 rounded text-sm font-montserrat uppercase tracking-widest border ${
              activeTab === 'taxonomy'
                ? 'bg-green-500/20 border-green-500 text-green-400'
                : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Taxonomy
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded text-sm font-montserrat uppercase tracking-widest border ${
              activeTab === 'audit'
                ? 'bg-green-500/20 border-green-500 text-green-400'
                : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Audit Report
          </button>
        </div>

        {activeTab === 'taxonomy' && (
          <>
            <div className="mb-4 flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-yellow-500/30 border border-yellow-500 rounded"></span>
                Warning
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500/30 border border-red-500 rounded"></span>
                Invalid/Suspicious
              </span>
            </div>

            <section className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-audiowide text-neon-yellow">Categories ({filteredCategories.length})</h2>
                <input
                  type="text"
                  placeholder="Search by name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-1.5 bg-gray-900 border border-gray-700 rounded text-sm text-white placeholder-gray-500 w-64 focus:outline-none focus:border-green-500"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-left">
                      <th
                        className="py-2 px-3 cursor-pointer hover:text-green-400 transition-colors"
                        onClick={() => handleSort('name')}
                      >
                        Name {sortField === 'name' && (sortAsc ? '↑' : '↓')}
                      </th>
                      <th
                        className="py-2 px-3 cursor-pointer hover:text-green-400 transition-colors"
                        onClick={() => handleSort('code')}
                      >
                        Code {sortField === 'code' && (sortAsc ? '↑' : '↓')}
                      </th>
                      <th className="py-2 px-3">Subcategories</th>
                      <th className="py-2 px-3">Issues</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.map((cat: CatRow) => {
                      const warnings = getCategoryWarnings(cat);
                      const subCount = audit?.categoryCounts?.[cat.code] ?? 0;
                      const rowClass = warnings.level === 'red'
                        ? 'bg-red-500/10 border-l-2 border-red-500'
                        : warnings.level === 'yellow'
                        ? 'bg-yellow-500/10 border-l-2 border-yellow-500'
                        : '';

                      return (
                        <tr key={cat.code} className={`border-b border-gray-800/50 hover:bg-gray-900/50 ${rowClass}`}>
                          <td className="py-2 px-3 font-medium">{cat.name}</td>
                          <td className="py-2 px-3 text-gray-500 font-mono text-xs">{cat.code}</td>
                          <td className="py-2 px-3 text-gray-400 text-xs">{subCount}</td>
                          <td className="py-2 px-3">
                            {warnings.reasons.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {warnings.reasons.map((reason, i) => (
                                  <span
                                    key={i}
                                    className={`px-1.5 py-0.5 rounded text-[10px] uppercase ${
                                      warnings.level === 'red' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                                    }`}
                                  >
                                    {reason}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {activeTab === 'audit' && audit && (
          <div className="space-y-8">
            <section>
              <h2 className="text-lg font-audiowide text-neon-yellow mb-4">Audit Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Categories', value: audit.summary.totalCategories, color: 'text-cyan-400' },
                  { label: 'Subcategories', value: audit.summary.totalSubcategories, color: 'text-cyan-400' },
                  { label: 'Groups', value: audit.summary.totalGroups, color: 'text-cyan-400' },
                  { label: 'Sticker Links', value: audit.summary.totalStickerGroupLinks, color: 'text-cyan-400' },
                  { label: 'Duplicates', value: audit.summary.duplicatesCreated, color: audit.summary.duplicatesCreated > 0 ? 'text-red-400' : 'text-green-400' },
                  { label: 'Non-Canonical', value: audit.summary.nonCanonicalCodesRemaining, color: audit.summary.nonCanonicalCodesRemaining > 0 ? 'text-red-400' : 'text-green-400' },
                  { label: 'Underscore Codes', value: audit.summary.underscoreCodesRemaining, color: audit.summary.underscoreCodesRemaining > 0 ? 'text-red-400' : 'text-green-400' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                    <div className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </section>

            {(audit.duplicateCategories.length > 0 || audit.duplicateSubcategories.length > 0 || audit.duplicateGroups.length > 0) && (
              <section>
                <h2 className="text-lg font-audiowide text-red-400 mb-4">Duplicates Found</h2>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 space-y-2 text-sm font-mono">
                  {audit.duplicateCategories.map((d: any) => (
                    <div key={d.code}>Category: {d.code} x{d.count}</div>
                  ))}
                  {audit.duplicateSubcategories.map((d: any) => (
                    <div key={d.key}>Subcategory: {d.key} x{d.count}</div>
                  ))}
                  {audit.duplicateGroups.map((d: any) => (
                    <div key={d.key}>Group: {d.key} x{d.count}</div>
                  ))}
                </div>
              </section>
            )}

            {audit.underscoreDetails.length > 0 && (
              <section>
                <h2 className="text-lg font-audiowide text-red-400 mb-4">Underscore Violations</h2>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 space-y-1 text-sm font-mono">
                  {audit.underscoreDetails.map((d: string, i: number) => (
                    <div key={i}>{d}</div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-lg font-audiowide text-neon-yellow mb-4">Pokemon Sticker Counts</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {Object.entries(audit.pokemonStickerCounts).map(([code, count]) => (
                  <div key={code} className="bg-gray-900 border border-gray-800 rounded px-3 py-2 flex items-center justify-between">
                    <span className="text-xs font-mono text-gray-400">{code}</span>
                    <span className={`text-sm font-bold font-mono ${Number(count) > 0 ? 'text-green-400' : 'text-gray-600'}`}>{String(count)}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-audiowide text-neon-yellow mb-4">Category → Subcategory Counts</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-left">
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3">Subcategories</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(audit.categoryCounts).sort(([a], [b]) => a.localeCompare(b)).map(([code, count]) => (
                      <tr key={code} className="border-b border-gray-800/50 hover:bg-gray-900/50">
                        <td className="py-2 px-3 font-mono text-xs text-gray-400">{code}</td>
                        <td className="py-2 px-3 font-mono text-cyan-400">{String(count)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
