"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MousePointerClick, Eye, Percent, TrendingUp, AlertCircle, ArrowUpRight, Search } from "lucide-react";

// Mock data: This is exactly what the Google API returns
const mockGscData = [
  { date: 'Oct 01', clicks: 120, impressions: 1400 },
  { date: 'Oct 05', clicks: 132, impressions: 1600 },
  { date: 'Oct 10', clicks: 101, impressions: 1550 },
  { date: 'Oct 15', clicks: 165, impressions: 2100 },
  { date: 'Oct 20', clicks: 189, impressions: 2400 },
  { date: 'Oct 25', clicks: 210, impressions: 2800 },
  { date: 'Oct 30', clicks: 254, impressions: 3100 },
];

const mockQueries = [
  { query: "india australia bilateral relations", clicks: 84, impressions: 420, position: 3.2 },
  { query: "free speech in cyberspace essay", clicks: 65, impressions: 510, position: 4.5 },
  { query: "impact of AI on modern diplomacy", clicks: 42, impressions: 890, position: 8.1 },
  { query: "quadrilateral security dialogue future", clicks: 31, impressions: 315, position: 5.4 },
];

export function VisibilityClient() {
  const [isLoading, setIsLoading] = useState(false); // Used when fetching real API
  
  return (
    <div className="space-y-8">
      
      {/* Google Connect Banner */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 mt-1 md:mt-0">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-indigo-900">Google Search Console Simulated Data</h3>
            <p className="text-xs text-indigo-700 mt-1 max-w-xl">
              This dashboard is currently displaying simulated data. To view your live metrics, you will need to connect a Google Cloud Service Account in your backend environment variables.
            </p>
          </div>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <MousePointerClick className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-600">Total Clicks</h3>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-black text-slate-900">1,071</span>
            <span className="text-sm font-bold text-emerald-500 flex items-center mb-1">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> 12%
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-600">Total Impressions</h3>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-black text-slate-900">12.9k</span>
            <span className="text-sm font-bold text-emerald-500 flex items-center mb-1">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> 24%
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Percent className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-600">Average CTR</h3>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-black text-slate-900">8.3%</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-600">Avg. Position</h3>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-black text-slate-900">12.4</span>
            <span className="text-sm font-bold text-emerald-500 flex items-center mb-1">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> 1.2
            </span>
          </div>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-900">Performance Over Time</h2>
          <p className="text-sm text-slate-500">Clicks and impressions over the last 30 days.</p>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockGscData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line yAxisId="left" type="monotone" dataKey="clicks" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Clicks" />
              <Line yAxisId="right" type="monotone" dataKey="impressions" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Impressions" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Queries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Top Performing Queries</h2>
          <p className="text-sm text-slate-500">The exact keywords driving traffic to your domain.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Search Query</th>
                <th className="px-6 py-4 text-right">Clicks</th>
                <th className="px-6 py-4 text-right">Impressions</th>
                <th className="px-6 py-4 text-right">Avg Position</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockQueries.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{item.query}</td>
                  <td className="px-6 py-4 text-right font-bold text-indigo-600">{item.clicks}</td>
                  <td className="px-6 py-4 text-right text-slate-600">{item.impressions}</td>
                  <td className="px-6 py-4 text-right text-slate-600">
                    <span className={`px-2 py-1 rounded border text-xs font-bold ${
                      item.position < 5 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {item.position}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}