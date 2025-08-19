// === Imports ===
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// === Add Employee Popup ===
function AddEmployeePopup({ onClose }: { onClose: () => void }) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [azureAdId, setAzureAdId] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAdd = async () => {
    setIsAdding(true);
    setError(null);
    setSuccess(false);

    if (!displayName.trim() || !email.trim()) {
      setError('Display name and email are required.');
      setIsAdding(false);
      return;
    }

    const payload = {
      display_name: displayName.trim(),
      email: email.trim(),
      job_title: jobTitle.trim() || null,
      azure_ad_id: azureAdId.trim() || null,
    };

    const { error } = await supabase.from('employees').insert([payload]);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setDisplayName('');
      setEmail('');
      setJobTitle('');
      setAzureAdId('');
    }

    setIsAdding(false);
  };

  // === Render ===
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-xl shadow-xl p-8 min-w-[300px]">
        <h4 className="text-lg font-bold mb-4">Add Employee</h4>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Display name *"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 w-full"
            disabled={isAdding}
          />
          <input
            type="email"
            placeholder="Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 w-full"
            disabled={isAdding}
          />
          <input
            type="text"
            placeholder="Job title"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 w-full"
            disabled={isAdding}
          />
          <input
            type="text"
            placeholder="Azure AD ID"
            value={azureAdId}
            onChange={(e) => setAzureAdId(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 w-full"
            disabled={isAdding}
          />
        </div>

        {error && <p className="text-red-600 mt-2">{error}</p>}
        {success && <p className="text-green-600 mt-2">Employee added!</p>}

        <div className="flex flex-row items-center justify-center mt-6 space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400 w-40"
            disabled={isAdding}
          >
            Close
          </button>
          <button
            onClick={handleAdd}
            className="px-6 py-2 bg-blue-900 text-white rounded hover:bg-blue-950 w-40"
            disabled={isAdding}
          >
            {isAdding ? 'Adding...' : 'Add Employee'}
          </button>
        </div>
      </div>
    </div>
  );
}

function RemoveEmployeePopup({ onClose }: { onClose: () => void }) {
  const [employees, setEmployees] = useState<{ id: string; display_name: string; email: string }[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchEmployees() {
      const { data, error } = await supabase
        .from('employees')
        .select('id, display_name, email')
        .order('display_name', { ascending: true });
      if (error) {
        setError('Failed to fetch employees.');
      } else {
        setEmployees(data || []);
      }
    }
    fetchEmployees();
  }, []);

  const handleRemove = async () => {
    if (!selectedId) {
      setError('Please select an employee to remove.');
      return;
    }
    setIsRemoving(true);
    setError(null);
    setSuccess(false);

    const { error } = await supabase.from('employees').delete().eq('id', selectedId);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setEmployees(employees.filter((e) => e.id !== selectedId));
      setSelectedId('');
    }

    setIsRemoving(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-xl shadow-xl p-8 min-w-[300px]">
        <h4 className="text-lg font-bold mb-4">Remove Employee</h4>

        <select
          className="border border-gray-300 rounded-lg p-2 w-full"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          disabled={isRemoving}
        >
          <option value="">Select an employee</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.display_name} ({emp.email})
            </option>
          ))}
        </select>

        {error && <p className="text-red-600 mt-2">{error}</p>}
        {success && <p className="text-green-600 mt-2">Employee removed!</p>}

        <div className="flex flex-row items-center justify-center mt-6 space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400 w-40"
            disabled={isRemoving}
          >
            Close
          </button>
          <button
            onClick={handleRemove}
            className="px-6 py-2 bg-rose-900 text-white rounded hover:bg-rose-950 w-40"
            disabled={isRemoving || !selectedId}
          >
            {isRemoving ? 'Removing...' : 'Remove Employee'}
          </button>
        </div>
      </div>
    </div>
  );
}

// === Main Component ===
export default function CreateDeleteEmployees() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState<'add' | 'remove' | null>(null);

  const addEmployee = () => {
    setPopupType('add');
    setShowPopup(true);
  };

  const removeEmployee = () => {
    setPopupType('remove');
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Add or Remove Employees</h3>

      <button
        onClick={addEmployee}
        disabled={isProcessing}
        className="bg-blue-900 hover:bg-blue-950 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 w-full mt-2"
      >
        Add Employee
      </button>

      <button
        onClick={removeEmployee}
        disabled={isProcessing}
        className="bg-rose-900 hover:bg-rose-950 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 w-full mt-4"
      >
        Remove Employee
      </button>

      {showPopup && popupType === 'add' && <AddEmployeePopup onClose={closePopup} />}
      {showPopup && popupType === 'remove' && <RemoveEmployeePopup onClose={closePopup} />}
    </div>
  );
}
