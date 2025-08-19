// === Imports ===
import React, { useState, useEffect } from 'react';
import { Users, Search, LogOut, Clock, Building2, Phone, User, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase, type Visitor } from '../lib/supabase';

// === Props ===
interface VisitorListProps {
  refreshTrigger: number;
}

// === Component ===
export default function VisitorList({ refreshTrigger }: VisitorListProps) {
  // === State ===
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [badges, setBadges] = useState<{ id: string; badge_number: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'checked_in' | 'checked_out'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const visitorsPerPage = 5;

  // === Effects ===
  useEffect(() => {
    fetchVisitors();
    fetchBadges();
  }, [refreshTrigger]);

  // === Data Fetching ===
  const fetchVisitors = async () => {
    try {
      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .order('checked_in_at', { ascending: false });

      if (error) throw error;
      setVisitors(data || []);
    } catch (error) {
      console.error('Error fetching visitors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBadges = async () => {
    try {
      const { data, error } = await supabase
        .from('badges')
        .select('id, badge_number');
      if (error) throw error;
      setBadges(data || []);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  };

  // === Handlers ===
  const handleCheckOut = async (visitorId: string) => {
    setCheckingOut(visitorId);
    try {
      const visitor = visitors.find(v => v.id === visitorId);
      if (!visitor) throw new Error('Visitor not found');

      const updates = {
        checked_out_at: new Date().toISOString(),
        status: 'checked_out',
        badge_id: null
      };

      const { error: visitorError } = await supabase
        .from('visitors')
        .update(updates)
        .eq('id', visitorId);

      if (visitorError) throw visitorError;

      if (visitor.badge_id) {
        const { error: badgeError } = await supabase
          .from('badges')
          .update({ assigned: false })
          .eq('id', visitor.badge_id);

        if (badgeError) throw badgeError;
      }

      fetchVisitors();
    } catch (error) {
      console.error('Error checking out visitor:', error);
    } finally {
      setCheckingOut(null);
    }
  };

  // === Derived Data ===
  const filteredVisitors = visitors.filter(visitor => {
    const matchesSearch = visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (visitor.company && visitor.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (visitor.host_name && visitor.host_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || visitor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredVisitors.length / visitorsPerPage);
  const paginatedVisitors = filteredVisitors.slice(
    (currentPage - 1) * visitorsPerPage,
    currentPage * visitorsPerPage
  );

  const activeVisitors = visitors.filter(v => v.status === 'checked_in').length;

  // === Helpers ===
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // === Loading State ===
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // === Render ===
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mr-4">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Visitor Management</h2>
            <p className="text-gray-600">
              {activeVisitors} currently checked in • {visitors.length} total visits today
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, company, or host..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'checked_in' | 'checked_out')}
          className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        >
          <option value="all">All Visitors</option>
          <option value="checked_in">Checked In</option>
          <option value="checked_out">Checked Out</option>
        </select>
      </div>

      {/* Visitor List */}
      {filteredVisitors.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No visitors found' : 'No visitors yet'}
          </h3>
          <p className="text-gray-400">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'Visitor check-ins will appear here'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedVisitors.map((visitor) => (
              <div
                key={visitor.id}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <h3 className="text-xl font-semibold text-gray-900 mr-3">{visitor.name}</h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        visitor.status === 'checked_in' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {visitor.status === 'checked_in' ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Checked In
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 mr-1" />
                            Checked Out
                          </>
                        )}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                      {visitor.company && (
                        <div className="flex items-center">
                          <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{visitor.company}</span>
                        </div>
                      )}
                      {visitor.phone && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{visitor.phone}</span>
                        </div>
                      )}
                      {visitor.host_name && (
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          <span>Host: {visitor.host_name}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <span className="text-rose-900 font-semibold mr-2">Badge:</span>
                        <span>{badges.find(b => b.id === (visitor as any).badge_id)?.badge_number || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        <span>In: {formatTime(visitor.checked_in_at)}</span>
                      </div>
                      {visitor.checked_out_at && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />
                          <span>Out: {formatTime(visitor.checked_out_at)}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <span className="text-gray-500">
                          {visitor.citizenship ? 'U.S. Citizen' : 'Foreign National'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {visitor.status === 'checked_in' && (
                    <button
                      onClick={() => handleCheckOut(visitor.id)}
                      disabled={checkingOut === visitor.id}
                      className="ml-4 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center"
                    >
                      {checkingOut === visitor.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <LogOut className="w-4 h-4 mr-2" />
                      )}
                      Check Out
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="inline-flex items-center">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 bg-white text-gray-700 rounded-l-lg hover:bg-blue-100 disabled:opacity-50"
                >
                  &#8592; Previous
                </button>
                <span className="px-4 py-2 border border-gray-300 bg-white text-gray-700 font-bold">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 bg-white text-gray-700 rounded-r-lg hover:bg-blue-100 disabled:opacity-50"
                >
                  Next &#8594;
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}
