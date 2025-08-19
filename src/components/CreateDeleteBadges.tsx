import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

function AddBadgePopup({ onClose }: { onClose: () => void }) {
  const [badgeNumber, setBadgeNumber] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAddBadge = async () => {
    setIsAdding(true);
    setError(null);
    setSuccess(false);
    if (!badgeNumber.trim()) {
      setError('Badge number is required.');
      setIsAdding(false);
      return;
    }
    const { error } = await supabase
      .from('badges')
      .insert([{ badge_number: badgeNumber.trim(), assigned: false }]);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setBadgeNumber('');
    }
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-xl shadow-xl p-8 min-w-[300px]">
        <h4 className="text-lg font-bold mb-4">Add Badge</h4>
        <input
          type="text"
          placeholder="Enter badge number"
          value={badgeNumber}
          onChange={e => setBadgeNumber(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 w-full"
          disabled={isAdding}
        />
        {error && <p className="text-red-600 mt-2">{error}</p>}
        {success && <p className="text-green-600 mt-2">Badge added!</p>}
        <div className="flex flex-row items-center justify-center mt-6 space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400 w-40"
            disabled={isAdding}
          >
            Close
          </button>
          <button
            onClick={handleAddBadge}
            className="px-6 py-2 bg-blue-900 text-white rounded hover:bg-blue-950 w-40"
            disabled={isAdding}
          >
            {isAdding ? 'Adding...' : 'Add Badge'}
          </button>
        </div>
      </div>
    </div>
  );
}

function RemoveBadgePopup({ onClose }: { onClose: () => void }) {
  const [badges, setBadges] = useState<{ id: string; badge_number: string }[]>([]);
  const [selectedBadgeId, setSelectedBadgeId] = useState<string>('');
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchBadges() {
      const { data, error } = await supabase
        .from('badges')
        .select('id, badge_number')
        .order('badge_number', { ascending: true });
      if (error) {
        setError('Failed to fetch badges.');
      } else {
        setBadges(data || []);
      }
    }
    fetchBadges();
  }, []);

  const handleRemoveBadge = async () => {
    if (!selectedBadgeId) {
      setError('Please select a badge to remove.');
      return;
    }
    setIsRemoving(true);
    setError(null);
    setSuccess(false);
    const { error } = await supabase
      .from('badges')
      .delete()
      .eq('id', selectedBadgeId);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setBadges(badges.filter(b => b.id !== selectedBadgeId));
      setSelectedBadgeId('');
    }
    setIsRemoving(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-xl shadow-xl p-8 min-w-[300px]">
        <h4 className="text-lg font-bold mb-4">Remove Badge</h4>
        <select
          className="border border-gray-300 rounded-lg p-2 w-full"
          value={selectedBadgeId}
          onChange={e => setSelectedBadgeId(e.target.value)}
          disabled={isRemoving}
        >
          <option value="">Select a badge</option>
          {badges.map(badge => (
            <option key={badge.id} value={badge.id}>
              {badge.badge_number}
            </option>
          ))}
        </select>
        {error && <p className="text-red-600 mt-2">{error}</p>}
        {success && <p className="text-green-600 mt-2">Badge removed!</p>}
        <div className="flex flex-row items-center justify-center mt-6 space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400 w-40"
            disabled={isRemoving}
          >
            Close
          </button>
          <button
            onClick={handleRemoveBadge}
            className="px-6 py-2 bg-rose-900 text-white rounded hover:bg-rose-950 w-40"
            disabled={isRemoving || !selectedBadgeId}
          >
            {isRemoving ? 'Removing...' : 'Remove Badge'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CreateDeletePopups() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState<'add' | 'remove' | null>(null);

  const addBadge = () => {
    setPopupType('add');
    setShowPopup(true);
  };

  const removeBadge = () => {
    setPopupType('remove');
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Add or Remove Badges</h3>
      <button
        onClick={addBadge}
        disabled={isProcessing}
        className="bg-blue-900 hover:bg-blue-950 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 w-full mt-2"
      >
        Add Badge
      </button>
      <button
        onClick={removeBadge}
        disabled={isProcessing}
        className="bg-rose-900 hover:bg-rose-950 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 w-full mt-4"
      >
        Remove Badge
      </button>

      {showPopup && popupType === 'add' && <AddBadgePopup onClose={closePopup} />}
      {showPopup && popupType === 'remove' && <RemoveBadgePopup onClose={closePopup} />}
    </div>
  );
}