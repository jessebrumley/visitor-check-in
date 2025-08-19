import React, { useState, useEffect } from 'react';
import { Shield, UserCheck, BarChart3 } from 'lucide-react';
import { supabase } from './lib/supabase';
import type { User } from '@supabase/supabase-js';
import CheckInForm from './components/CheckInForm';
import CheckOutForm from './components/CheckOutForm';
import VisitorList from './components/VisitorList';
import Dashboard from './components/Dashboard';
import AuthButton from './components/AuthButton';
import IdleSplash from './components/IdleSplash';
import LogoDark from './assets/logodark.png';
import Background from './assets/background.jpg';


type ActiveTab = 'checkin' | 'checkout' | 'visitors' | 'dashboard';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('checkin');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isIdle, setIsIdle] = useState(false);
  const [formView, setFormView] = useState<'none' | 'checkin' | 'checkout'>('none');
  const [showSignIn, setShowSignIn] = useState(false);
  const idleTimeout = 90000; // 90 seconds for idle timeout

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && session.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Idle timeout
    let idleTimer: ReturnType<typeof setTimeout>;
 
    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      if (isIdle) setIsIdle(false);
      idleTimer = setTimeout(() => {
        // Log out admin on idle
        if (user) {
          setUser(null);
          supabase.auth.signOut();
        }
        setFormView('none');
        setIsIdle(true);
      }, idleTimeout);
    };

    const activityEvents = ['click', 'touchstart'];
    activityEvents.forEach(event => window.addEventListener(event, resetIdleTimer));

    resetIdleTimer();

    return () => {
      clearTimeout(idleTimer);
      activityEvents.forEach(event =>
        window.removeEventListener(event, resetIdleTimer)
      );
    };
  }, []);

  const handleCheckInSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    // Only switch to visitors tab if user is authenticated
    if (user) {
      setTimeout(() => {
        setActiveTab('visitors');
      }, 1000);
    }
  };

  const handleAuthChange = async () => {
    const { data } = await supabase.auth.getUser();

    if (data?.user) {
      setUser(data.user); // Email/password login
    } else {
      // Fallback to PIN loginfrom localStorage
      const pinUserId = localStorage.getItem('pin_user_id');
      if (pinUserId) {
      // Try to fetch from profiles using the ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('id', pinUserId)
        .single();

      if (profile) {
        setUser({ id: profile.id, email: profile.email } as User); // use real email
      } else {
        setUser(null); // fallback — user not found
        localStorage.removeItem('pin_user_id'); // clean stale storage
      }
    } else {
      setUser(null); // not logged in
    }
    }

    setRefreshTrigger(prev => prev + 1);
  };

  const tabs = [
    { id: 'checkin' as ActiveTab, label: 'Check In', icon: UserCheck },
    { id: 'checkout' as ActiveTab, label: 'Check Out', icon: Shield },
    { id: 'visitors' as ActiveTab, label: 'Visitor List', icon: Shield },
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: BarChart3 }
  ];

  if (isLoading) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
    </div>;
  }

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundImage: `url(${Background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* IdleSplash */}
      {isIdle && (
        <IdleSplash
          onDismiss={async () => {
            await supabase.auth.signOut();
            localStorage.removeItem('pin_user_id');
            setUser(null);
            setActiveTab('checkin');
            setIsIdle(false);
          }}
        />
      )}
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-4">
          <button
            type="button"
            className="inline-flex items-center justify-center w-auto h-auto bg-white rounded-2xl shadow-lg mb-4 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => {
              setFormView('checkin');
              setShowSignIn(true);
            }}
            aria-label="Admin Sign In"
          >
            <img src={LogoDark} alt="logo" className='w-11/12 h-full' />
          </button>
        </div>

        {/* Navigation Tabs */}
        {formView !== 'none' && (
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-2 inline-flex">
            {user && tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-900 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-900 hover:bg-blue-50'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            ))}
            {!user && (
              <>
                <button
                  onClick={() => setFormView('checkin')}
                  className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 mr-2 ${
                    formView === 'checkin'
                      ? 'bg-blue-900 text-white shadow-md'
                      : 'text-gray-600 hover:text-blue-900 hover:bg-blue-50'
                  }`}
                >
                  <UserCheck className="w-5 h-5 mr-2" />
                  Check In
                </button>
                <button
                  onClick={() => setFormView('checkout')}
                  className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    formView === 'checkout'
                      ? 'bg-rose-900 text-white shadow-md'
                      : 'text-gray-600 hover:text-rose-900 hover:bg-rose-50'
                  }`}
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Check Out
                </button>
              </>
            )}
            <AuthButton
              user={user}
              onAuthChange={handleAuthChange}
              showSignIn={showSignIn}
              setShowSignIn={setShowSignIn}
            />
          </div>
        </div>
        )}

        {/* Content */}
        <div className="flex justify-center">
          {!user && (
            <>
              {formView === 'none' && (
                <div className="flex min-h-[60vh] items-center justify-center">
                  <div className="flex flex-col gap-28">
                    <button
                      className="px-8 py-4 bg-blue-900 text-white rounded-xl font-bold text-2xl shadow-lg hover:bg-blue-950 transition"
                      onClick={() => setFormView('checkin')}
                    >
                      Check In
                    </button>
                    <button
                      className="px-8 py-4 bg-rose-900 text-white rounded-xl font-bold text-2xl shadow-lg hover:bg-rose-950 transition"
                      onClick={() => setFormView('checkout')}
                    >
                      Check Out
                    </button>
                  </div>
                </div>
              )}
              {formView === 'checkin' && (
                <CheckInForm onSuccess={handleCheckInSuccess} />
              )}
              {formView === 'checkout' && (
                <CheckOutForm />
              )}
            </>
          )}

          {activeTab === 'checkin' && user && (
            <CheckInForm onSuccess={handleCheckInSuccess} />
          )}

          {activeTab === 'checkout' && user && (
            <CheckOutForm />
          )}

          {activeTab === 'visitors' && user && (
            <div className="w-full max-w-6xl">
              <VisitorList refreshTrigger={refreshTrigger} />
            </div>
          )}
          
          {activeTab === 'dashboard' && user && (
            <div className="w-full max-w-6xl">
              <Dashboard />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;