import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  GraduationCap, Calendar, Award, Bell, User, 
  ArrowRight, CheckCircle, Zap, Shield, BookOpen,
  Smartphone, Monitor, QrCode, Sparkles, Check, ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, name } = useAuth();
  const [activeDeviceView, setActiveDeviceView] = useState('mobile');

  return (
    <div style={{ fontFamily: "'Space Grotesk', sans-serif", minHeight: '100vh', background: '#090D16', color: '#F1F5F9', overflowX: 'hidden' }}>
      
      {/* BACKGROUND GLOW EFFECTS */}
      <div style={{ position: 'fixed', top: 0, left: '20%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(58,175,169,0.12) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: 0, right: '10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(95,133,162,0.15) 0%, transparent 70%)', filter: 'blur(90px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* TOP NAVIGATION */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px clamp(16px, 4vw, 40px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'sticky',
        top: 0,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        background: 'rgba(9, 13, 22, 0.85)',
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: 'linear-gradient(135deg, #3AAFA9 0%, #2B7A78 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(58,175,169,0.3)'
          }}>
            <GraduationCap size={22} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 800, fontSize: 19, letterSpacing: '-0.5px', color: '#fff' }}>M-Lynq</span>
              <span style={{ fontSize: 10, color: '#3AAFA9', fontWeight: 700, background: 'rgba(58,175,169,0.15)', border: '1px solid rgba(58,175,169,0.3)', padding: '1px 6px', borderRadius: 20 }}>
                ISTE SCTCE
              </span>
            </div>
            <div style={{ fontSize: 10, color: 'rgba(211,227,240,0.6)', fontFamily: "'Inter', sans-serif" }}>Member Gateway</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isAuthenticated ? (
            <Link
              to="/home"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 18px',
                background: 'linear-gradient(135deg, #3AAFA9 0%, #2B7A78 100%)',
                color: '#fff',
                borderRadius: 24,
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: 13,
                boxShadow: '0 4px 14px rgba(58,175,169,0.25)'
              }}
            >
              <span>{name ? `Hi, ${name.split(' ')[0]}` : 'Dashboard'}</span>
              <ChevronRight size={15} />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  padding: '8px 16px',
                  color: '#D3E3F0',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: 13,
                  transition: 'color 0.15s'
                }}
              >
                Sign In
              </Link>
              <Link
                to="/login"
                style={{
                  padding: '9px 18px',
                  background: 'linear-gradient(135deg, #3AAFA9 0%, #2B7A78 100%)',
                  color: '#fff',
                  borderRadius: 24,
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: 13,
                  boxShadow: '0 4px 16px rgba(58,175,169,0.3)'
                }}
              >
                Join Now
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{
        position: 'relative',
        textAlign: 'center',
        padding: 'clamp(50px, 8vw, 90px) clamp(16px, 4vw, 32px) 40px',
        maxWidth: 1120,
        margin: '0 auto',
        zIndex: 1
      }}>
        {/* Live Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(58, 175, 169, 0.1)',
          border: '1px solid rgba(58, 175, 169, 0.3)',
          borderRadius: 28,
          padding: '6px 16px',
          marginBottom: 24
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3AAFA9', boxShadow: '0 0 10px #3AAFA9' }} />
          <span style={{ fontSize: 13, color: '#D3E3F0', fontWeight: 600, letterSpacing: '0.2px' }}>
            Official Portal • ISTE SCTCE Chapter
          </span>
        </div>

        {/* Hero Title */}
        <h1 style={{
          fontSize: 'clamp(34px, 6vw, 68px)',
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: '-1.5px',
          marginBottom: 20,
          maxWidth: 860,
          margin: '0 auto 20px'
        }}>
          Learn Something New Today.<br />
          <span style={{
            background: 'linear-gradient(135deg, #3AAFA9 0%, #7FD1AE 50%, #E8A87C 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Campus Life, Unified.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p style={{
          fontSize: 'clamp(15px, 2.2vw, 18px)',
          color: 'rgba(211, 227, 240, 0.75)',
          maxWidth: 620,
          margin: '0 auto 36px',
          lineHeight: 1.6,
          fontFamily: "'Inter', sans-serif"
        }}>
          Your all-in-one portal for event registration, instant attendance verification, and custom-issued digital certificates — crafted for a first-class experience on both mobile and PC.
        </p>

        {/* Hero Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 50 }}>
          <Link
            to={isAuthenticated ? "/home" : "/login"}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '13px 28px',
              background: 'linear-gradient(135deg, #3AAFA9 0%, #2B7A78 100%)',
              color: '#fff',
              borderRadius: 30,
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: 15,
              boxShadow: '0 8px 24px rgba(58,175,169,0.35)',
              transition: 'transform 0.15s ease'
            }}
          >
            <span>{isAuthenticated ? 'Open My Dashboard' : 'Get Started Now'}</span>
            <ArrowRight size={18} />
          </Link>
          <a
            href="#views-showcase"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '13px 24px',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#D3E3F0',
              border: '1px solid rgba(211, 227, 240, 0.18)',
              borderRadius: 30,
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 15
            }}
          >
            <Smartphone size={17} color="#3AAFA9" />
            <span>Preview Mobile & PC</span>
          </a>
        </div>
      </section>

      {/* TWO VIEWS BEST-FIT INTERACTIVE SHOWCASE */}
      <section id="views-showcase" style={{
        padding: '20px clamp(16px, 4vw, 32px) 70px',
        maxWidth: 1080,
        margin: '0 auto',
        zIndex: 1,
        position: 'relative'
      }}>
        {/* View Switcher Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#3AAFA9', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
            <Sparkles size={14} /> Dual View Architecture
          </div>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 12 }}>
            Engineered for Both Screens
          </h2>
          <p style={{ color: 'rgba(211, 227, 240, 0.65)', maxWidth: 520, margin: '0 auto 24px', fontSize: 14, fontFamily: "'Inter', sans-serif" }}>
            Tap below to toggle between the widescreen PC layout and the compact on-the-go Mobile experience.
          </p>

          {/* Segmented Device Switcher Buttons */}
          <div style={{
            display: 'inline-flex',
            background: 'rgba(255, 255, 255, 0.06)',
            padding: 4,
            borderRadius: 30,
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}>
            <button
              onClick={() => setActiveDeviceView('mobile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 22px',
                borderRadius: 26,
                border: 'none',
                background: activeDeviceView === 'mobile' ? '#3AAFA9' : 'transparent',
                color: activeDeviceView === 'mobile' ? '#090D16' : '#D3E3F0',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: "'Space Grotesk', sans-serif"
              }}
            >
              <Smartphone size={16} /> Mobile View (Pocket Fit)
            </button>
            <button
              onClick={() => setActiveDeviceView('pc')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 22px',
                borderRadius: 26,
                border: 'none',
                background: activeDeviceView === 'pc' ? '#3AAFA9' : 'transparent',
                color: activeDeviceView === 'pc' ? '#090D16' : '#D3E3F0',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: "'Space Grotesk', sans-serif"
              }}
            >
              <Monitor size={16} /> PC Dashboard (Full Screen)
            </button>
          </div>
        </div>

        {/* DEVICE MOCKUP CONTAINER */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 28,
          padding: 'clamp(16px, 3vw, 36px)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {activeDeviceView === 'mobile' ? (
            /* 📱 MOBILE VIEW MOCKUP */
            <div style={{
              width: '100%',
              maxWidth: 360,
              background: '#0F1524',
              borderRadius: 36,
              border: '3px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Phone Status Bar / Island */}
              <div style={{ height: 26, background: '#090D16', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
                <div style={{ width: 90, height: 14, borderRadius: 10, background: '#1A2338' }} />
              </div>

              {/* Mobile Mockup Header */}
              <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: '#3AAFA9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <GraduationCap size={16} color="#fff" />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>M-Lynq</span>
                </div>
                <div style={{ fontSize: 11, padding: '3px 8px', borderRadius: 12, background: 'rgba(58,175,169,0.15)', color: '#3AAFA9', fontWeight: 600 }}>
                  Live Portal
                </div>
              </div>

              {/* Mobile Content Scroll Area */}
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Mobile QR Card */}
                <div style={{
                  background: 'linear-gradient(135deg, #182032 0%, #101522 100%)',
                  borderRadius: 18,
                  padding: '16px',
                  border: '1px solid rgba(58,175,169,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(58,175,169,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <QrCode size={24} color="#3AAFA9" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Gate Check-in QR</div>
                    <div style={{ fontSize: 11, color: 'rgba(211,227,240,0.6)', marginTop: 2 }}>Tap to present at event gate</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, background: '#3AAFA9', color: '#090D16', padding: '4px 8px', borderRadius: 10 }}>
                    PASS
                  </span>
                </div>

                {/* Mobile Event Item */}
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: '#E8A87C', fontWeight: 700 }}>UPCOMING WORKSHOP</span>
                    <span style={{ fontSize: 10, color: 'rgba(211,227,240,0.5)' }}>This Week</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Offenso 2026 Tech Summit</div>
                  <div style={{ fontSize: 11, color: 'rgba(211,227,240,0.6)', marginTop: 2 }}>Campus Auditorium • SCTCE</div>
                </div>

                {/* Mobile Certificate Card */}
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Award size={18} color="#F5C842" />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>Certificate of Appreciation</div>
                      <div style={{ fontSize: 10, color: 'rgba(211,227,240,0.5)' }}>Custom Exec Issued • Verified</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 10, color: '#3AAFA9', fontWeight: 700 }}>PDF</span>
                </div>
              </div>

              {/* Mobile Bottom App Bar Mock */}
              <div style={{
                height: 52,
                background: 'rgba(15, 21, 36, 0.95)',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                padding: '0 10px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <Calendar size={14} color="#3AAFA9" />
                  <span style={{ fontSize: 9, color: '#3AAFA9', fontWeight: 700 }}>Home</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <BookOpen size={14} color="rgba(211,227,240,0.5)" />
                  <span style={{ fontSize: 9, color: 'rgba(211,227,240,0.5)' }}>Events</span>
                </div>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#3AAFA9', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateY(-6px)' }}>
                  <QrCode size={18} color="#090D16" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <Award size={14} color="rgba(211,227,240,0.5)" />
                  <span style={{ fontSize: 9, color: 'rgba(211,227,240,0.5)' }}>Certs</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <User size={14} color="rgba(211,227,240,0.5)" />
                  <span style={{ fontSize: 9, color: 'rgba(211,227,240,0.5)' }}>Profile</span>
                </div>
              </div>
            </div>
          ) : (
            /* 🖥️ PC DASHBOARD MOCKUP */
            <div style={{
              width: '100%',
              maxWidth: 780,
              background: '#0F1524',
              borderRadius: 20,
              border: '1.5px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Window Header */}
              <div style={{
                height: 38,
                background: '#090D16',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 16px',
                gap: 8
              }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }} />
                </div>
                <div style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: 11,
                  color: 'rgba(211,227,240,0.5)',
                  fontFamily: "'Inter', sans-serif"
                }}>
                  mlynq.iste.org/home — SCTCE Student Chapter
                </div>
              </div>

              {/* PC Split Body (Sidebar + Content) */}
              <div style={{ display: 'flex', minHeight: 300 }}>
                {/* Desktop Sidebar */}
                <div style={{
                  width: 170,
                  background: 'rgba(255,255,255,0.02)',
                  borderRight: '1px solid rgba(255,255,255,0.06)',
                  padding: '16px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <GraduationCap size={18} color="#3AAFA9" />
                    <span style={{ fontSize: 13, fontWeight: 700 }}>M-Lynq</span>
                  </div>
                  {[
                    { label: 'Dashboard', icon: <Calendar size={13} />, active: true },
                    { label: 'Events', icon: <BookOpen size={13} /> },
                    { label: 'Certificates', icon: <Award size={13} /> },
                    { label: 'Attendance', icon: <CheckCircle size={13} /> },
                    { label: 'My Profile', icon: <User size={13} /> }
                  ].map(item => (
                    <div
                      key={item.label}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '7px 10px', borderRadius: 8,
                        background: item.active ? 'rgba(58,175,169,0.18)' : 'transparent',
                        color: item.active ? '#3AAFA9' : 'rgba(211,227,240,0.6)',
                        fontSize: 12, fontWeight: item.active ? 700 : 500
                      }}
                    >
                      {item.icon} {item.label}
                    </div>
                  ))}
                </div>

                {/* Desktop Main Content */}
                <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Top Bar inside Content */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>Member Dashboard</div>
                      <div style={{ fontSize: 11, color: 'rgba(211,227,240,0.5)', fontFamily: "'Inter', sans-serif" }}>
                        Verified SCTCE Member • Ready for events
                      </div>
                    </div>
                    <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 14, background: 'rgba(16,185,129,0.15)', color: '#10B981', fontWeight: 600 }}>
                      Active Member
                    </span>
                  </div>

                  {/* Desktop Grid (QR + Events + Certs) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14 }}>
                    {/* Left Card: Attendance Pass */}
                    <div style={{ background: 'linear-gradient(135deg, #182032 0%, #101522 100%)', borderRadius: 14, padding: '16px', border: '1px solid rgba(58,175,169,0.25)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <QrCode size={20} color="#3AAFA9" />
                        <span style={{ fontSize: 13, fontWeight: 700 }}>Live Attendance QR</span>
                      </div>
                      <p style={{ fontSize: 11, color: 'rgba(211,227,240,0.6)', fontFamily: "'Inter', sans-serif", margin: 0 }}>
                        AES-256 encrypted dynamic token generated on demand for event scanners.
                      </p>
                    </div>

                    {/* Right Card: Digital Certificates */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <Award size={20} color="#F5C842" />
                        <span style={{ fontSize: 13, fontWeight: 700 }}>Direct PDF Download</span>
                      </div>
                      <p style={{ fontSize: 11, color: 'rgba(211,227,240,0.6)', fontFamily: "'Inter', sans-serif", margin: 0 }}>
                        Custom certificate names set by exec committee ready to view or download.
                      </p>
                    </div>
                  </div>

                  {/* Desktop Banner */}
                  <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(58,175,169,0.08)', border: '1px solid rgba(58,175,169,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>Upcoming: Offenso 2026 Campus Hackathon & Tech Summit</div>
                    <span style={{ fontSize: 11, color: '#3AAFA9', fontWeight: 700 }}>Registered</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CORE CAPABILITY FEATURES (BENTO GRID) */}
      <section id="features" style={{
        padding: '60px clamp(16px, 4vw, 32px) 80px',
        maxWidth: 1120,
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 'clamp(28px, 4.5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: 12 }}>
            Everything You Need as an ISTE Member
          </h2>
          <p style={{ color: 'rgba(211, 227, 240, 0.65)', maxWidth: 560, margin: '0 auto', fontFamily: "'Inter', sans-serif", fontSize: 15 }}>
            Purpose-built tools designed to simplify your engineering campus experience.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: 20
        }}>
          {[
            {
              icon: <QrCode size={24} />,
              color: '#3AAFA9',
              bg: 'rgba(58, 175, 169, 0.12)',
              title: 'Dynamic Gate QR Code',
              desc: 'One-tap attendance check-in at all club events and workshops. Dynamic cryptographic tokens protect against screenshot proxying.'
            },
            {
              icon: <Award size={24} />,
              color: '#E8A87C',
              bg: 'rgba(232, 168, 124, 0.12)',
              title: 'Custom-Named Certificates',
              desc: 'Official digital certificates issued with custom titles decided by executive committee (e.g., Appreciation, Winner, Excellence) with instant PDF download.'
            },
            {
              icon: <Calendar size={24} />,
              color: '#5F85A2',
              bg: 'rgba(95, 133, 162, 0.15)',
              title: 'Campus Event Hub',
              desc: 'Discover workshops, hackathons, and technical talk series. Filter by category, view location, and access direct materials.'
            },
            {
              icon: <CheckCircle size={24} />,
              color: '#10B981',
              bg: 'rgba(16, 185, 129, 0.12)',
              title: 'Attendance History & Heatmap',
              desc: 'Keep track of every workshop you attend throughout the semester. Your verified attendance records are logged instantly into your account.'
            },
            {
              icon: <Bell size={24} />,
              color: '#F5C842',
              bg: 'rgba(245, 200, 66, 0.12)',
              title: 'Executive Announcements',
              desc: 'Stay informed with direct broadcasts from the ISTE executive committee regarding registration deadlines, venue updates, and competition guidelines.'
            },
            {
              icon: <Shield size={24} />,
              color: '#93C5FD',
              bg: 'rgba(147, 197, 253, 0.12)',
              title: 'Universal Device Sync',
              desc: 'Add to your phone home screen as a mobile app, or launch in any full desktop browser. Real-time Supabase cloud sync keeps your profile up to date.'
            }
          ].map((f, i) => (
            <div
              key={f.title}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 22,
                padding: '28px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                transition: 'transform 0.2s, border-color 0.2s'
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: f.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: f.color
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{f.title}</h3>
              <p style={{ color: 'rgba(211, 227, 240, 0.65)', fontSize: 14, lineHeight: 1.6, margin: 0, fontFamily: "'Inter', sans-serif" }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section style={{
        padding: '0 clamp(16px, 4vw, 32px) 90px',
        maxWidth: 960,
        margin: '0 auto',
        zIndex: 1,
        position: 'relative'
      }}>
        <div style={{
          textAlign: 'center',
          padding: 'clamp(36px, 6vw, 64px) clamp(20px, 4vw, 40px)',
          background: 'linear-gradient(135deg, rgba(58,175,169,0.12) 0%, rgba(15,21,36,0.8) 100%)',
          borderRadius: 28,
          border: '1px solid rgba(58,175,169,0.3)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
        }}>
          <div style={{
            width: 54, height: 54, borderRadius: 16,
            background: 'rgba(58,175,169,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            color: '#3AAFA9'
          }}>
            <Zap size={28} />
          </div>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 14 }}>
            Ready to Connect with ISTE SCTCE?
          </h2>
          <p style={{ color: 'rgba(211, 227, 240, 0.7)', maxWidth: 480, margin: '0 auto 28px', fontFamily: "'Inter', sans-serif", fontSize: 15, lineHeight: 1.6 }}>
            Sign in with your member account to access your digital QR code and download your earned event certificates.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to={isAuthenticated ? "/home" : "/login"}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '13px 30px',
                background: 'linear-gradient(135deg, #3AAFA9 0%, #2B7A78 100%)',
                color: '#fff',
                borderRadius: 30,
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: 15,
                boxShadow: '0 8px 24px rgba(58,175,169,0.35)'
              }}
            >
              <span>{isAuthenticated ? 'Go to Dashboard' : 'Sign In with Member ID'}</span>
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        textAlign: 'center',
        padding: '32px 24px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        color: 'rgba(211,227,240,0.45)',
        fontFamily: "'Inter', sans-serif",
        fontSize: 13,
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <GraduationCap size={16} color="#3AAFA9" />
          <span style={{ fontWeight: 700, color: '#D3E3F0' }}>ISTE Student Chapter • SCTCE</span>
        </div>
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} M-Lynq Member Portal. All rights reserved.</p>
      </footer>

    </div>
  );
}
