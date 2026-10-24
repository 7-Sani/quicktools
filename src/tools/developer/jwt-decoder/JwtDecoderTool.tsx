"use client";
import React, { useState } from 'react';

export default function JwtDecoderTool() {
  const [token, setToken] = useState('');
  const [decoded, setDecoded] = useState<{header: any, payload: any, signature: string} | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDecode = () => {
    if (!token.trim()) {
      setDecoded(null);
      setError(null);
      return;
    }
    try {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Invalid JWT format (must have 3 parts)');
      
      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      const signature = parts[2];

      setDecoded({ header, payload, signature });
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Invalid JWT Token');
      setDecoded(null);
    }
  };

  const getExpirationStatus = () => {
    if (!decoded || !decoded.payload.exp) return null;
    const exp = decoded.payload.exp * 1000;
    const now = Date.now();
    const isExpired = now > exp;
    return {
      isExpired,
      date: new Date(exp).toLocaleString()
    };
  };

  const expStatus = getExpirationStatus();

  return (
    <div className="space-y-6">
      <div>
        <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">JWT Token</label>
        <textarea
          className="neo-input w-full min-h-[150px] resize-y p-4 font-mono text-sm break-all"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
        />
        <button className="neo-btn neo-btn-primary mt-4" onClick={handleDecode}>Decode</button>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 text-red-700 font-semibold">
          {error}
        </div>
      )}

      {decoded && (
        <div className="space-y-4">
          {expStatus && (
            <div className={`p-4 border-2 rounded-lg font-semibold ${expStatus.isExpired ? 'bg-red-50 border-red-500 text-red-700' : 'bg-green-50 border-green-500 text-green-700'}`}>
              Status: {expStatus.isExpired ? 'Expired' : 'Valid'} (Expires: {expStatus.date})
            </div>
          )}
          
          <div className="neo-card p-6 space-y-2">
            <h3 className="font-heading font-semibold uppercase text-sm tracking-wide text-red-500">Header</h3>
            <pre className="bg-surface p-4 rounded border-2 border-border font-mono text-sm overflow-x-auto text-red-600 dark:text-red-400">
              {JSON.stringify(decoded.header, null, 2)}
            </pre>
          </div>
          
          <div className="neo-card p-6 space-y-2">
            <h3 className="font-heading font-semibold uppercase text-sm tracking-wide text-purple-500">Payload</h3>
            <pre className="bg-surface p-4 rounded border-2 border-border font-mono text-sm overflow-x-auto text-purple-600 dark:text-purple-400">
              {JSON.stringify(decoded.payload, null, 2)}
            </pre>
          </div>
          
          <div className="neo-card p-6 space-y-2">
            <h3 className="font-heading font-semibold uppercase text-sm tracking-wide text-blue-500">Signature</h3>
            <div className="bg-surface p-4 rounded border-2 border-border font-mono text-sm break-all text-blue-600 dark:text-blue-400">
              {decoded.signature}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
