import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { isIsteMemberEmail } from '../lib/member_emails';
import { GraduationCap, Mail, User, Phone, Hash, Building, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

const STEP = {
  EMAIL: 'emailEntry',
  ISTE_OTP: 'isteOtpVerify',
  GUEST_REG: 'guestRegistration',
  GUEST_OTP: 'guestOtpVerify',
};

const inputStyle = {
  width: '100%',
  padding: '13px 16px',
  background: '#fff',
  border: '1.5px solid #D3E3F0',
  borderRadius: 14,
  fontSize: 15,
  fontFamily: "'Inter', sans-serif",
  outline: 'none',
  color: '#111',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEP.EMAIL);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestRoll, setGuestRoll] = useState('');
  const [guestCollege, setGuestCollege] = useState('');
  // 'iste_member' | 'guest' | null — drives the tag shown on OTP/login steps
  const [membershipTag, setMembershipTag] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  // Live detection derived state
  const cleanEmail = email.trim().toLowerCase();
  const isEmailValid = cleanEmail.includes('@') && cleanEmail.includes('.');
  const isIsteMember = isEmailValid && isIsteMemberEmail(cleanEmail);

  // Step 1: Check email membership & send OTP or route to registration
  const handleEmailContinue = async () => {
    clearMessages();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) return setError('Please enter your email address');
    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      return setError('Please enter a valid email address');
    }

    setIsLoading(true);
    try {
      // 1. Check official registered ISTE member list
      const isMember = isIsteMemberEmail(trimmedEmail);

      // 2. Also check users table in Supabase (via RPC or direct select)
      let profileRow = null;
      try {
        const { data: rpcData } = await supabase.rpc('check_member_email', { p_email: trimmedEmail });
        if (rpcData && rpcData.exists) {
          profileRow = rpcData;
        }
      } catch (_) {}

      if (!profileRow) {
        try {
          const { data } = await supabase
            .from('users')
            .select('id, is_iste_member, is_registered, name, phone')
            .ilike('email', trimmedEmail)
            .maybeSingle();
          profileRow = data;
        } catch (_) {}
      }

      const isIste = isMember || (profileRow?.is_iste_member === true);

      if (isIste) {
        // ISTE Member: send OTP and go to ISTE OTP verify
        setMembershipTag('iste_member');
        const { error: otpErr } = await supabase.auth.signInWithOtp({
          email: trimmedEmail,
          options: { shouldCreateUser: true },
        });
        if (otpErr) throw otpErr;
        setSuccess('OTP sent to your email!');
        setStep(STEP.ISTE_OTP);
        return;
      }

      if (profileRow?.is_registered || profileRow) {
        // Existing registered guest: send OTP directly
        setMembershipTag('guest');
        const { error: otpErr } = await supabase.auth.signInWithOtp({
          email: trimmedEmail,
          options: { shouldCreateUser: true },
        });
        if (otpErr) throw otpErr;
        setSuccess('OTP sent to your email!');
        setStep(STEP.GUEST_OTP);
        return;
      }

      // New guest user: go to guest registration form
      setMembershipTag('guest');
      setStep(STEP.GUEST_REG);
    } catch (err) {
      console.error('[Auth Error]', err);
      setError(err.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step: Verify ISTE OTP
  const handleIsteOtpVerify = async () => {
    clearMessages();
    if (otp.trim().length < 6) return setError('Please enter the verification code');
    setIsLoading(true);
    try {
      const trimmedEmail = email.trim().toLowerCase();
      const { data, error: otpErr } = await supabase.auth.verifyOtp({
        email: trimmedEmail,
        token: otp.trim(),
        type: 'email',
      });
      if (otpErr) throw otpErr;

      const uid = data.user?.id;
      if (uid) {
        // Upsert default profile for the ISTE member
        await supabase.from('users').upsert({
          id: uid,
          email: trimmedEmail,
          role: 'member',
          is_registered: true,
          is_iste_member: true,
          status: 'active',
        }, { onConflict: 'id' });
      }

      setSuccess('Logged in successfully!');
      navigate('/home');
    } catch (err) {
      setError('Invalid or expired OTP code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step: Guest registration — store pending details and send OTP
  const handleGuestRegister = async () => {
    clearMessages();
    if (!guestName.trim() || !guestPhone.trim() || !guestRoll.trim() || !guestCollege.trim()) {
      return setError('Please fill in all fields');
    }

    setIsLoading(true);
    try {
      const trimmedEmail = email.trim().toLowerCase();
      sessionStorage.setItem('pending_signup', JSON.stringify({
        name: guestName.trim(),
        phone: guestPhone.trim(),
        roll_number: guestRoll.trim(),
        college: guestCollege.trim(),
        email: trimmedEmail,
      }));

      const { error: otpErr } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: { shouldCreateUser: true },
      });
      if (otpErr) throw otpErr;

      setSuccess('OTP sent to your email!');
      setStep(STEP.GUEST_OTP);
    } catch (err) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step: Verify Guest OTP
  const handleGuestOtpVerify = async () => {
    clearMessages();
    if (otp.trim().length < 6) return setError('Please enter the verification code');
    setIsLoading(true);
    try {
      const trimmedEmail = email.trim().toLowerCase();
      const { data, error: otpErr } = await supabase.auth.verifyOtp({
        email: trimmedEmail,
        token: otp.trim(),
        type: 'email',
      });
      if (otpErr) throw otpErr;

      const uid = data.user?.id;
      const pending = JSON.parse(sessionStorage.getItem('pending_signup') || '{}');
      if (uid) {
        if (pending.name) {
          await supabase.from('users').upsert({
            id: uid,
            email: trimmedEmail,
            name: pending.name,
            phone: pending.phone,
            roll_number: pending.roll_number,
            college: pending.college,
            role: 'member',
            is_registered: true,
            is_iste_member: false,
            status: 'active',
          }, { onConflict: 'id' });
          sessionStorage.removeItem('pending_signup');
        } else {
          // Pre-registered user logging in: link auth uid to users record
          await supabase.from('users').update({ id: uid }).ilike('email', trimmedEmail);
        }
      }

      setSuccess('Logged in successfully!');
      navigate('/home');
    } catch (err) {
      setError('Invalid or expired OTP code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const stepTitles = {
    [STEP.EMAIL]: 'Sign In',
    [STEP.ISTE_OTP]: 'Verify Email',
    [STEP.GUEST_REG]: 'Guest Registration',
    [STEP.GUEST_OTP]: 'Verify OTP',
  };

  const getButtonText = () => {
    switch (step) {
      case STEP.EMAIL:
        return 'Continue →';
      case STEP.ISTE_OTP:
      case STEP.GUEST_OTP:
        return 'Verify OTP →';
      case STEP.GUEST_REG:
        return 'Register & Send OTP →';
      default:
        return 'Continue →';
    }
  };

  const renderStep = () => {
    switch (step) {
      case STEP.EMAIL:
        return (
          <>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#5F85A2', marginBottom: 8, display: 'block' }}>
              Email Address
            </label>
            <div style={{ position: 'relative', marginBottom: isEmailValid ? 10 : 20 }}>
              <Mail size={18} style={{ position: 'absolute', left: 14, top: 15, color: '#5F85A2' }} />
              <input
                style={{ ...inputStyle, paddingLeft: 42 }}
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleEmailContinue()}
                autoFocus
              />
            </div>

            {/* Live member detection indicator — identical to Flutter */}
            {isEmailValid && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 18,
                  padding: '8px 12px',
                  borderRadius: 10,
                  background: isIsteMember ? 'rgba(72, 187, 120, 0.1)' : 'rgba(237, 137, 54, 0.1)',
                  border: `1px solid ${isIsteMember ? 'rgba(72, 187, 120, 0.3)' : 'rgba(237, 137, 54, 0.3)'}`,
                }}
              >
                {isIsteMember ? (
                  <CheckCircle size={16} color="#38A169" />
                ) : (
                  <AlertCircle size={16} color="#DD6B20" />
                )}
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 12,
                    fontWeight: 700,
                    color: isIsteMember ? '#276749' : '#C05621',
                  }}
                >
                  {isIsteMember ? '✓ ISTE Member Account Detected' : 'Guest Account Detected'}
                </span>
              </div>
            )}

            <button onClick={handleEmailContinue} disabled={isLoading} style={btnStyle}>
              {isLoading ? 'Checking...' : getButtonText()}
            </button>
          </>
        );

      case STEP.ISTE_OTP:
      case STEP.GUEST_OTP:
        return (
          <>
            {/* Membership badge */}
            {membershipTag && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 12,
                  padding: '5px 12px',
                  borderRadius: 20,
                  background: membershipTag === 'iste_member' ? 'rgba(49, 130, 206, 0.1)' : 'rgba(237, 137, 54, 0.1)',
                  border: `1px solid ${membershipTag === 'iste_member' ? 'rgba(49, 130, 206, 0.3)' : 'rgba(237, 137, 54, 0.3)'}`,
                }}
              >
                {membershipTag === 'iste_member' ? (
                  <GraduationCap size={14} color="#3182CE" />
                ) : (
                  <User size={14} color="#DD6B20" />
                )}
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 12,
                    fontWeight: 700,
                    color: membershipTag === 'iste_member' ? '#2B6CB0' : '#C05621',
                  }}
                >
                  {membershipTag === 'iste_member' ? 'ISTE Member' : 'Guest Account'}
                </span>
              </div>
            )}
            <p style={{ fontSize: 14, color: '#5F85A2', marginBottom: 18, fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}>
              We sent a verification code to <strong>{email}</strong>
            </p>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#5F85A2', marginBottom: 6, display: 'block' }}>
              Verification Code
            </label>
            <input
              style={{ ...inputStyle, letterSpacing: 6, fontSize: 20, textAlign: 'center', marginBottom: 20 }}
              type="text"
              placeholder="••••••••"
              maxLength={8}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              onKeyDown={e => e.key === 'Enter' && (step === STEP.ISTE_OTP ? handleIsteOtpVerify() : handleGuestOtpVerify())}
              autoFocus
            />
            <button
              onClick={step === STEP.ISTE_OTP ? handleIsteOtpVerify : handleGuestOtpVerify}
              disabled={isLoading}
              style={btnStyle}
            >
              {isLoading ? 'Verifying...' : getButtonText()}
            </button>
          </>
        );

      case STEP.GUEST_REG:
        return (
          <>
            <p style={{ fontSize: 13, color: '#5F85A2', marginBottom: 16, fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}>
              No ISTE membership record was found for <strong>{email}</strong>. Register as a guest below:
            </p>
            {[
              { label: 'Full Name', icon: <User size={18} />, value: guestName, set: setGuestName, ph: 'John Doe', type: 'text' },
              { label: 'Phone Number (+91)', icon: <Phone size={18} />, value: guestPhone, set: setGuestPhone, ph: '+91 9876543210', type: 'tel' },
              { label: 'University Roll Number', icon: <Hash size={18} />, value: guestRoll, set: setGuestRoll, ph: 'RA2011003010287', type: 'text' },
              { label: 'College Name', icon: <Building size={18} />, value: guestCollege, set: setGuestCollege, ph: 'SCT College of Engineering', type: 'text' },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#5F85A2', marginBottom: 6, display: 'block' }}>
                  {f.label}
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: 15, color: '#5F85A2' }}>{f.icon}</span>
                  <input
                    style={{ ...inputStyle, paddingLeft: 42 }}
                    type={f.type}
                    placeholder={f.ph}
                    value={f.value}
                    onChange={e => f.set(e.target.value)}
                  />
                </div>
              </div>
            ))}
            <button onClick={handleGuestRegister} disabled={isLoading} style={{ ...btnStyle, marginTop: 8 }}>
              {isLoading ? 'Sending OTP...' : getButtonText()}
            </button>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#EBF3FC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background halos */}
      <div
        style={{
          position: 'absolute',
          top: -100,
          right: -80,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: '#C5D9EB',
          opacity: 0.4,
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -100,
          left: -80,
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: '#C5D9EB',
          opacity: 0.3,
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }} className="fade-in">
        {/* Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: '50%',
              background: 'rgba(95, 133, 162, 0.12)',
              border: '2px solid #111',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}
          >
            <GraduationCap size={28} color="#111" />
          </div>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 24,
              fontWeight: 700,
              color: '#111',
              letterSpacing: '-0.5px',
              margin: 0,
            }}
          >
            {stepTitles[step]}
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: 'rgba(17, 17, 17, 0.5)', marginTop: 4 }}>
            ISTE Student Chapter Member Portal
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: '#fff',
            borderRadius: 24,
            padding: 32,
            boxShadow: '0 4px 40px rgba(95, 133, 162, 0.12)',
            border: '1.5px solid rgba(95, 133, 162, 0.12)',
          }}
        >
          {/* Error & Success Messages */}
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                background: '#FFF0F0',
                border: '1px solid #FFD0D0',
                borderRadius: 12,
                padding: '12px 14px',
                marginBottom: 20,
              }}
            >
              <AlertCircle size={18} color="#E53E3E" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: '#C53030', lineHeight: 1.5, margin: 0 }}>
                {error}
              </p>
            </div>
          )}
          {success && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: '#F0FFF4',
                border: '1px solid #9AE6B4',
                borderRadius: 12,
                padding: '12px 14px',
                marginBottom: 20,
              }}
            >
              <CheckCircle size={18} color="#38A169" />
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: '#276749', margin: 0 }}>
                {success}
              </p>
            </div>
          )}

          {renderStep()}

          {/* Back Navigation Link */}
          {step !== STEP.EMAIL && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button
                type="button"
                onClick={() => {
                  clearMessages();
                  setOtp('');
                  if (step === STEP.GUEST_OTP && membershipTag === 'guest' && sessionStorage.getItem('pending_signup')) {
                    setStep(STEP.GUEST_REG);
                  } else {
                    setStep(STEP.EMAIL);
                  }
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'none',
                  border: 'none',
                  color: '#5F85A2',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                }}
              >
                <ArrowLeft size={16} />
                {step === STEP.GUEST_OTP && membershipTag === 'guest' && sessionStorage.getItem('pending_signup')
                  ? 'Back to registration details'
                  : 'Back to email entry'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const btnStyle = {
  width: '100%',
  padding: '13px 20px',
  background: '#111',
  color: '#fff',
  border: 'none',
  borderRadius: 28,
  fontSize: 15,
  fontWeight: 600,
  fontFamily: "'Space Grotesk', sans-serif",
  cursor: 'pointer',
  transition: 'opacity 0.2s',
};
