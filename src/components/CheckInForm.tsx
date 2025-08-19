// === Imports ===
import React, { useState, useEffect } from 'react';
import { UserPlus, Building2, Phone, Mail, Target, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import CheckInConfirm from './CheckInConfirm';
import { CheckBox } from './CheckBox';

// === Props ===
interface CheckInFormProps {
  onSuccess: () => void;
}

// === Local Types ===
type Badge = {
  id: string;
  badge_number: string;
  assigned: boolean;
};

// === Component ===
export default function CheckInForm({ onSuccess }: CheckInFormProps) {
  // === Form Data ===
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    host_name: '',
    host_id: '',
    badge_id: '',
    citizenship: false,
  });

  // === UI states ===
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingBadges, setLoadingBadges] = useState(true);
  const [employees, setEmployees] = useState<{ id: string; display_name: string }[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  // === Host search state
  const [hostSearch, setHostSearch] = useState('');
  const [hostDropdownOpen, setHostDropdownOpen] = useState(false);

  // === Fetch Badge data ===
  async function fetchBadges() {
    setLoadingBadges(true);
    const { data, error } = await supabase
      .from('badges')
      .select('id, badge_number, assigned')
      .eq('assigned', false);

    if (!error && data) {
      setBadges(data);
    } else {
      console.error('Error fetching badges:', error);
    }
    setLoadingBadges(false);
  }

  // === Fetch Employee data ===
  async function fetchEmployees() {
    const { data, error } = await supabase
      .from('employees')
      .select('id, display_name')
      .order('display_name');

    if (!error && data) {
      setEmployees(data);
    } else {
      console.error('Error fetching employees:', error);
    }
  }

  // === Initial Loads ===
  useEffect(() => {
    fetchBadges();
    fetchEmployees();
  }, []);

  // === Handlers ===
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('visitors')
        .insert([
          {
            ...formData,
            status: 'checked_in',
            badge_id: formData.badge_id || null,
          }
        ]);

      if (insertError) throw insertError;

      if (formData.badge_id) {
        const { error: badgeError } = await supabase
          .from('badges')
          .update({ assigned: true })
          .eq('id', formData.badge_id);

        if (badgeError) throw badgeError;
      }

      // === Reset form ===
      setFormData({
        name: '',
        company: '',
        phone: '',
        email: '',
        host_name: '',
        host_id: '',
        badge_id: '',
        citizenship: false,
      });
      setHostSearch('');

      onSuccess();
      setShowConfirm(true);
      await fetchBadges();
    } catch (err) {
      console.error('Check-in error:', err);
      console.error('Full error object:', err);

      let errorMessage = 'An unexpected error occurred';

      if (err && typeof err === 'object') {
        if ('message' in err) {
          errorMessage = (err as any).message as string;
        }
        if ('details' in err && (err as any).details) {
          errorMessage += ` Details: ${(err as any).details}`;
        }
        if ('hint' in err && (err as any).hint) {
          errorMessage += ` Hint: ${(err as any).hint}`;
        }
        if ('code' in err && (err as any).code) {
          errorMessage += ` (Code: ${(err as any).code})`;
        }
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // === Render ===
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <UserPlus className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome!</h2>
        <p className="text-gray-600">Please sign in to continue your visit</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* === Contact Info === */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-semibold text-gray-700 mb-2">
              Company/Organization
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Company name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="your@email.com"
              />
            </div>
          </div>
        </div>

        {/* === Host Selection === */}
        <div>
          <label htmlFor="host_name" className="block text-sm font-semibold text-gray-700 mb-2">
            Person/Department Visiting
          </label>
          <div className="relative">
            {/* Host Search Input */}
            <input
              type="text"
              id="host_name"
              value={hostSearch}
              onChange={e => {
                setHostSearch(e.target.value);
                setHostDropdownOpen(true);
              }}
              onFocus={() => setHostDropdownOpen(true)}
              onBlur={() => setTimeout(() => setHostDropdownOpen(false), 150)}
              className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Type host name..."
              autoComplete="off"
            />
            {/* Host Dropdown */}
            {hostDropdownOpen && hostSearch.trim() !== '' && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-40 overflow-y-auto">
                {(() => {
                  const searchLower = hostSearch.toLowerCase();
                  const results = employees.filter(emp =>
                    emp.display_name.toLowerCase().startsWith(searchLower)
                  );
                  if (results.length === 0) {
                    return <div className="p-4 text-gray-400">No hosts found</div>;
                  }
                  return results.slice(0, 5).map(emp => ( // limit to 5 results
                    <button
                      key={emp.id}
                      type="button"
                      className={`w-full text-left px-4 py-2 hover:bg-blue-50 ${formData.host_id === emp.id ? 'bg-blue-100 font-bold' : ''}`}
                      onMouseDown={() => {
                        setFormData({
                          ...formData,
                          host_id: emp.id,
                          host_name: emp.display_name
                        });
                        setHostSearch(emp.display_name);
                        setHostDropdownOpen(false);
                      }}
                    >
                      {emp.display_name}
                    </button>
                  ));
                })()}
              </div>
            )}
          </div>
        </div>

        {/* === Badge Selection === */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Choose an available badge *
          </label>
          <div className="relative">
           <select
              id="badge_id"
              value={formData.badge_id}
              onChange={(e) => {
                const selectedId = e.target.value;
                setFormData({
                  ...formData,
                  badge_id: selectedId,
                });
              }}
              disabled={loadingBadges}
              className="w-full pl-14 pr-4 py-4 text-lg border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              {loadingBadges ? (
                <option value="">Loading badges...</option>
              ) : (
                <>
                  <option value="">Select a badge</option>
                  {badges
                    .slice()
                    .sort((a, b) => a.badge_number.localeCompare(b.badge_number))
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.badge_number}
                      </option>
                    ))}
                </>
              )}
            </select>
          </div>
        </div>

        {/* === US Citizenship Toggle === */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Are you a US Citizen?
          </label>
          <CheckBox
            checked={formData.citizenship}
            onChange={(checked) => 
              setFormData({
                ...formData,
                citizenship: checked,
              })
            }/>
        </div>

        {/* === Errors === */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* === Submit Button === */}
        <button
          type="submit"
          disabled={
            isSubmitting
            // || !formData.citizenship 
            || !formData.name.trim()}
          className="w-full bg-blue-900 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-xl text-lg transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100 disabled:cursor-not-allowed shadow-lg"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
              Checking In...
            </div>
          ) : (
            'Check In'
          )}
        </button>
      </form>
      {/* Render the confirmation notification */}
      <CheckInConfirm open={showConfirm} onClose={() => setShowConfirm(false)} />
    </div>
  );
}
