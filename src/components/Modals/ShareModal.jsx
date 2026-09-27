import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import { X, Share2, Copy, Check, QrCode, Cloud, Download, Upload, Users, Edit3 } from 'lucide-react';

export function ShareModal({ isOpen, onClose }) {
  const { tripId, tripData, switchTrip } = useTrip();
  const [copied, setCopied] = useState(false);
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [codeInput, setCodeInput] = useState(tripId);
  const [jsonText, setJsonText] = useState('');
  const [importStatus, setImportStatus] = useState('');

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}${window.location.pathname}#trip=${tripId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    const clean = codeInput.trim().replace(/[^A-Za-z0-9_-]+/g, '');
    if (clean) {
      switchTrip(clean);
    }
    setIsEditingCode(false);
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tripData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${(tripData.tripName || 'vacation-plan').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(jsonText);
      if (parsed && parsed.tripName) {
        localStorage.setItem(`voyageur_trip_${tripId}`, JSON.stringify(parsed));
        window.location.reload();
      } else {
        setImportStatus('Invalid itinerary format!');
      }
    } catch (err) {
      setImportStatus('Error parsing JSON text.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 space-y-5 animate-in fade-in zoom-in duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-stone-900 text-lg">Share Vacation Itinerary</h3>
              <p className="text-xs text-stone-500 font-medium">Invite travel companions to view & co-edit live.</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share Link Section */}
        <div className="space-y-3 bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Trip Share Code</span>
            
            {isEditingCode ? (
              <form onSubmit={handleCodeSubmit} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  autoFocus
                  className="font-mono text-xs font-bold bg-white border border-indigo-300 rounded px-2 py-0.5 text-indigo-900 focus:outline-none focus:border-indigo-600 w-32"
                />
                <button 
                  type="submit"
                  className="bg-indigo-600 text-white text-[11px] font-bold px-2 py-0.5 rounded hover:bg-indigo-700"
                >
                  Save
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-xs bg-indigo-200/80 text-indigo-900 px-2.5 py-0.5 rounded-md">
                  {tripId}
                </span>
                <button
                  onClick={() => { setCodeInput(tripId); setIsEditingCode(true); }}
                  className="text-indigo-600 hover:text-indigo-800 p-1 rounded hover:bg-indigo-100 transition"
                  title="Change Trip Share Code"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <p className="text-xs text-indigo-800">
            Anyone with this link can view and edit the itinerary live in real-time.
          </p>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-mono text-stone-700 focus:outline-none select-all"
            />
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition shadow-xs flex-shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Active Companions */}
        <div className="space-y-2 pt-1">
          <span className="flex items-center gap-1.5 text-xs font-bold text-stone-700 uppercase tracking-wider">
            <Users className="w-4 h-4 text-indigo-600" />
            Connected Companions ({tripData.activeMembers?.length || 1})
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {(tripData.activeMembers || []).map(m => (
              <span key={m.id} className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-800 rounded-lg text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {m.name}
              </span>
            ))}
          </div>
        </div>

        {/* Backup & Export */}
        <div className="pt-3 border-t border-stone-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">Offline JSON Backup</span>
            <button
              onClick={handleExportJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>

          <details className="text-xs text-stone-500">
            <summary className="cursor-pointer font-semibold text-indigo-600 hover:underline">Paste JSON to Restore / Import</summary>
            <form onSubmit={handleImportJson} className="mt-2 space-y-2">
              <textarea
                rows="3"
                placeholder="Paste JSON contents here..."
                value={jsonText}
                onChange={e => setJsonText(e.target.value)}
                className="w-full p-2 border border-stone-200 rounded-xl text-xs font-mono focus:outline-none"
              ></textarea>
              {importStatus && <p className="text-rose-600 text-xs">{importStatus}</p>}
              <button
                type="submit"
                className="px-3 py-1.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800"
              >
                Import & Refresh
              </button>
            </form>
          </details>
        </div>

      </div>
    </div>
  );
}
