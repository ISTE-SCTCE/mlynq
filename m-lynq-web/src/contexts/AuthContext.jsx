import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProfile = async (authUser) => {
    if (!authUser) { setProfile(null); setIsLoading(false); return; }
    try {
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profileErr) {
        console.error('Error fetching profile from DB:', profileErr);
      }
      const p = profileData || { id: authUser.id, email: authUser.email };
      const merged = {
        id: authUser.id,
        email: authUser.email,
        ...p,
        membership_id: p.iste_membership_id || p.membership_id || '',
        validity_end: p.expiry_date || p.validity_end || null,
      };
      setProfile(merged);
    } catch (err) {
      console.error('Error in loadProfile:', err);
      setError(err.message);
      // Fallback profile so authenticated user is never trapped in infinite OTP loop
      setProfile({
        id: authUser.id,
        email: authUser.email,
        name: authUser.email ? authUser.email.split('@')[0] : 'Member',
        role: 'member',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      loadProfile(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);
      setIsLoading(true);
      loadProfile(newUser);
    });
    return () => subscription.unsubscribe();
  }, []);

  const refresh = () => { setIsLoading(true); loadProfile(user); };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const isAuthenticated = !!(user && profile);
  const name = profile?.name || '';
  const role = profile?.role || 'user';
  const membershipId = profile?.membership_id || '';
  const validityEnd = profile?.validity_end ? new Date(profile.validity_end) : null;
  const isMembershipValid = !!membershipId;
  const daysUntilExpiry = validityEnd ? Math.ceil((validityEnd - new Date()) / (1000 * 60 * 60 * 24)) : null;
  const isRegistered = profile?.is_registered ?? false;
  const isIsteMember = profile?.is_iste_member ?? false;
  const isSuspended = profile?.status === 'suspended' || (profile?.suspended_until ? new Date(profile.suspended_until) > new Date() : false);

  const value = {
    user, profile, isLoading, error, isAuthenticated: isAuthenticated && !isSuspended,
    isSuspended,
    name, role, membershipId, validityEnd, isMembershipValid, daysUntilExpiry,
    isRegistered, isIsteMember,
    refresh, signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
