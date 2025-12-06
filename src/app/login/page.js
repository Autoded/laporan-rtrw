'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    const { login, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && isAuthenticated) {
            router.push('/dashboard');
        }
    }, [mounted, isAuthenticated, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            router.push('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const demoAccounts = [
        { email: 'ketua@rtrw.com', password: 'admin123', role: 'Ketua RT' },
        { email: 'bendahara@rtrw.com', password: 'admin123', role: 'Admin/Bendahara' },
        { email: 'warga@rtrw.com', password: 'warga123', role: 'Warga' },
    ];

    const fillDemo = (account) => {
        setEmail(account.email);
        setPassword(account.password);
    };

    if (!mounted) {
        return null;
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex' }}>
            {/* Left Side - Form */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                backgroundColor: '#FFFFFF'
            }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>
                    {/* Logo */}
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', textDecoration: 'none' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        </div>
                        <div>
                            <h1 style={{ fontWeight: 700, fontSize: '1.5rem', color: '#0F172A', margin: 0 }}>LaporRT</h1>
                            <p style={{ fontSize: '0.875rem', color: '#94A3B8', margin: 0 }}>RT 01 / RW 05</p>
                        </div>
                    </Link>

                    {/* Title */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.5rem 0' }}>
                            Selamat Datang Kembali
                        </h2>
                        <p style={{ color: '#64748B', margin: 0 }}>
                            Masuk ke akun Anda untuk melanjutkan
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div style={{
                            marginBottom: '1.5rem',
                            padding: '1rem',
                            backgroundColor: '#FEF2F2',
                            border: '1px solid #FECACA',
                            borderRadius: '12px',
                            color: '#DC2626',
                            fontSize: '0.875rem'
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                                Email
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    pointerEvents: 'none'
                                }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="nama@email.com"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem 0.75rem 2.75rem',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '8px',
                                        fontSize: '0.875rem',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    pointerEvents: 'none'
                                }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Masukkan password"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 2.75rem',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '8px',
                                        fontSize: '0.875rem',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '14px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {showPassword ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                backgroundColor: '#3B82F6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                opacity: isLoading ? 0.7 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {isLoading ? 'Memproses...' : 'Masuk'}
                        </button>
                    </form>

                    {/* Demo Accounts */}
                    <div style={{
                        marginTop: '2rem',
                        padding: '1rem',
                        backgroundColor: '#F1F5F9',
                        borderRadius: '12px'
                    }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#475569', marginBottom: '0.75rem' }}>
                            🎮 Akun Demo:
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {demoAccounts.map((account, index) => (
                                <button
                                    key={index}
                                    onClick={() => fillDemo(account)}
                                    type="button"
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '0.5rem 0.75rem',
                                        backgroundColor: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    <span style={{ fontWeight: 500, color: '#0F172A' }}>{account.role}</span>
                                    <span style={{ color: '#94A3B8' }}> - {account.email}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Register Link */}
                    <p style={{ marginTop: '2rem', textAlign: 'center', color: '#64748B' }}>
                        Belum punya akun?{' '}
                        <Link href="/register" style={{ color: '#3B82F6', fontWeight: 500, textDecoration: 'none' }}>
                            Daftar sekarang
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right Side - Gradient */}
            <div style={{
                flex: 1,
                background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #8B5CF6 100%)',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem'
            }} className="login-right-panel">
                <div style={{ maxWidth: '480px', textAlign: 'center', color: 'white' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 2rem'
                    }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                    </div>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '1rem' }}>
                        Platform Terpadu untuk RT/RW
                    </h2>
                    <p style={{ opacity: 0.8 }}>
                        Kelola laporan warga, keuangan, dan surat-menyurat dalam satu platform yang mudah digunakan.
                    </p>

                    <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '1.875rem', fontWeight: 700 }}>500+</p>
                            <p style={{ fontSize: '0.875rem', opacity: 0.6 }}>Warga</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '1.875rem', fontWeight: 700 }}>1.2K</p>
                            <p style={{ fontSize: '0.875rem', opacity: 0.6 }}>Laporan</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '1.875rem', fontWeight: 700 }}>100%</p>
                            <p style={{ fontSize: '0.875rem', opacity: 0.6 }}>Transparan</p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
        @media (min-width: 1024px) {
          .login-right-panel {
            display: flex !important;
          }
        }
      `}</style>
        </div>
    );
}
