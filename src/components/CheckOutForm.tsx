// === Imports ===
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import CheckOutConfirm from './CheckOutConfirm';

// === Types ===
type Badge = {
  id: string;
  badge_number: string;
  assigned: boolean;
};

// === Component ===
export default function CheckOutForm() {
  // === State ===
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);

  // === Fetch Assigned Badges ===
  useEffect(() => {
    async function fetchBadges() {
      setLoading(true);
      const { data, error } = await supabase
        .from('badges')
        .select('id, badge_number, assigned')
        .eq('assigned', true);
      if (!error && data) setBadges(data);
      setLoading(false);
    }
    fetchBadges();
  }, []);

  // === Filtered Badges ===
  const filteredBadges = badges.filter(b =>
    b.badge_number.toLowerCase().includes(search.toLowerCase())
  );

  // Find the selected badge object for badge_number
  const selectedBadge = badges.find(b => b.id === selectedId);
  // === Handlers ===
  function handleOpenConfirm() {
    if (!selectedId) return;
    setShowConfirm(true);
  }

  function handleCloseConfirm() {
    setShowConfirm(false);
  }

  function handleCheckedOut() {
    setBadges(badges.filter(b => b.id !== selectedId));
    setSelectedId(null);
    setShowConfirm(false);
  }

  // === Render ===
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Out</h2>
        <p className="text-gray-600">Select your badge number to check out</p>
      </div>

      {/* Badge Search & List */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2"></label>
        <input
          type="text"
          placeholder="Type your badge number..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-2"
          maxLength={4}
        />
        <div className="border border-gray-200 rounded-xl max-h-40 overflow-y-auto bg-white">
          {loading ? (
            <div className="p-4 text-gray-400">Loading...</div>
          ) : filteredBadges.length === 0 ? (
            <div className="p-4 text-gray-400">No badge numbers found</div>
          ) : (
            filteredBadges
              .slice()
              .sort((a, b) => a.badge_number.localeCompare(b.badge_number))
              .slice(0, 5) // Limit to 5 results
              .map(b => (
                <button
                  key={b.id}
                  className={`w-full text-left px-4 py-2 hover:bg-blue-50 ${
                    selectedId === b.id ? 'bg-blue-100 font-bold' : ''
                  }`}
                  onClick={() => setSelectedId(b.id)}
                  type="button"
                >
                  {b.badge_number}
                </button>
              ))
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        className="w-full bg-rose-900 text-white font-semibold py-4 px-6 rounded-xl text-lg transition-all duration-200 shadow-lg disabled:bg-gray-400"
        disabled={selectedId === null || loading}
        onClick={handleOpenConfirm}
      >
        Check Out
      </button>
      {/* Render the confirmation popup */}
      <CheckOutConfirm
        open={showConfirm}
        badgeId={selectedId}
        badgeNumber={selectedBadge?.badge_number ?? null}
        onClose={handleCloseConfirm}
        onCheckedOut={handleCheckedOut}
      />
    </div>
  );
}
