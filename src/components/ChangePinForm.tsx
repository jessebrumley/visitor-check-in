// === Imports ===
import { useState } from 'react';
import bcrypt from 'bcryptjs';
import { supabase } from '../lib/supabase';
import { useUser } from '@supabase/auth-helpers-react';

// === Component ===
export default function ChangePinForm() {
  // === State ===
  const user = useUser();
  const [pin, setPin] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  // === Utilities ===
  const sha256 = async (text: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  };

  // === Handlers ===
  const handleUpdatePin = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      if (!user) {
        setMessage('Not signed in');
        return;
      }

      if (!pin || pin.length < 4) {
        setMessage('PIN must be at least 4 digits');
        return;
      }

      const bcryptHash = bcrypt.hashSync(pin, 10);
      const sha = await sha256(pin);

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        pin_hash: bcryptHash,
        pin_sha256: sha,
      });

      if (error) throw error;

      setMessage('PIN updated successfully');
      setPin('');
    } catch (err: any) {
      console.error('PIN update error:', err);
      setMessage(err.message || 'Failed to update PIN');
    } finally {
      setIsSaving(false);
    }
  };

  // === Render ===
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Admin PIN</h3>
      <p>Current user: {user?.email}</p>
      <input
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="Enter new PIN"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 mb-4"
      />
      <button
        onClick={handleUpdatePin}
        disabled={isSaving}
        className="bg-blue-900 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 w-full"
      >
        {isSaving ? 'Updating...' : 'Update PIN'}
      </button>
      {message && (
        <p className="mt-3 text-sm text-gray-700">{message}</p>
      )}
    </div>
  );
}
