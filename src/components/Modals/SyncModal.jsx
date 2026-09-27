import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import { X, Cloud, CloudOff, RefreshCw, Check, AlertCircle, Database, Lock, ExternalLink } from 'lucide-react';

export function SyncModal({ isOpen, onClose }) {
  const { isCloudSynced, forceCloudSync, tripId, tripData } = useTrip();
  const [syncing, setSyncing] = useState(false);
  const [statusResult, setStatusResult] = useState(null);

  if (!isOpen) return null;

  const handleForceSync = async () => {
    setSyncing(true);
    setStatusResult(null);
    const result = await forceCloudSync();
    setSyncing(false);
    setStatusResult(result);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200 space-y-4 animate-in fade-in zoom-in duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${isCloudSynced ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
              {isCloudSynced ? <Cloud className="w-5 h-5" /> : <CloudOff className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-serif font-bold text-stone-900 text-lg">Firestore Cloud Sync Status</h3>
              <p className="text-xs text-stone-500 font-medium">Real-time database connection details.</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Status Box */}
        <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
          isCloudSynced 
            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' 
            : 'bg-amber-50/60 border-amber-200 text-amber-950'
        }`}>
          {isCloudSynced ? (
            <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-sm">
              {isCloudSynced ? 'Connected to Firestore' : 'Running in Offline / Local Storage Mode'}
            </h4>
            <p className="leading-relaxed opacity-90">
              {isCloudSynced 
                ? `Changes to trip #${tripId} are syncing in real-time across all connected devices.`
                : `Your itinerary is currently saved safely in browser storage. Click below to attempt a force sync to Firestore.`}
            </p>
          </div>
        </div>

        {/* Result Message */}
        {statusResult && (
          <div className={`p-3 rounded-xl text-xs font-semibold border ${
            statusResult.success 
              ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}>
            {statusResult.success ? (
              <span>✅ Successfully connected & synced trip data to Firestore!</span>
            ) : (
              <span>⚠️ Connection failed: {statusResult.reason}</span>
            )}
          </div>
        )}

        {/* Force Sync Action Button */}
        <button
          onClick={handleForceSync}
          disabled={syncing}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs shadow-xs flex items-center justify-center gap-2 transition"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Connecting & Syncing...' : 'Force Connect & Push to Firestore'}</span>
        </button>

        {/* Technical Configuration Details */}
        <div className="space-y-2 pt-2 border-t border-stone-100 text-xs">
          <span className="font-bold uppercase tracking-wider text-[10px] text-stone-500 flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-stone-400" />
            Connecting your custom Firebase Project:
          </span>

          <ol className="list-decimal pl-4 space-y-1 text-stone-600 text-[11px] leading-relaxed">
            <li>Ensure you have created a Firestore database at <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline inline-flex items-center gap-0.5 font-semibold">console.firebase.google.com <ExternalLink className="w-3 h-3" /></a></li>
            <li>In Firebase Console ➔ <strong>Firestore Database ➔ Rules</strong>, set:
              <pre className="font-mono bg-stone-100 p-1.5 rounded text-[10px] text-stone-800 mt-1 mb-1">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
              </pre>
            </li>
            <li>To use custom API keys, place them in a <code className="bg-stone-100 px-1 py-0.5 rounded font-mono">.env.local</code> file in your project root (<code className="bg-stone-100 px-1 py-0.5 rounded font-mono">VITE_FIREBASE_PROJECT_ID=your-project-id</code>).</li>
          </ol>
        </div>

      </div>
    </div>
  );
}
