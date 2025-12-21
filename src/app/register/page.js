'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Shield, Mail, Lock, Eye, EyeOff, User, Phone, MapPin, Loader2 } from 'lucide-react';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        address: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register } = useAuth();
    const router = useRouter();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Password tidak cocok');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password minimal 6 karakter');
            return;
        }

        setIsLoading(true);

        try {
            await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                address: formData.address,
            });
            router.push('/login');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '0.875rem 1rem 0.875rem 3rem',
        border: '1px solid #E2E8F0',
        borderRadius: '10px',
        fontSize: '0.9375rem',
        backgroundColor: '#FFFFFF',
        outline: 'none',
        boxSizing: 'border-box',
    };

    const inputWithRightIconStyle = {
        ...inputStyle,
        paddingRight: '3rem',
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: 500,
        color: '#64748B',
        marginBottom: '0.5rem',
    };

    const iconStyle = {
        position: 'absolute',
        left: '1rem',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '20px',
        height: '20px',
        color: '#94A3B8',
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex' }}>
            {/* Left Side - Gradient */}
            <div style={{
                flex: 1,
                background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #8B5CF6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem',
            }}>
                <div style={{ maxWidth: '480px', textAlign: 'center', color: 'white' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 2rem',
                    }}>
                        <Shield style={{ width: '40px', height: '40px' }} />
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
                        Bergabung dengan Komunitas
                    </h2>
                    <p style={{ opacity: 0.8, marginBottom: '3rem' }}>
                        Daftar sekarang dan mulai berkontribusi untuk lingkungan RT/RW yang lebih baik.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                        {[
                            'Laporkan masalah di lingkungan secara anonim',
                            'Pantau keuangan RT/RW secara transparan',
                            'Ajukan surat-surat secara online',
                        ].map((item, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                padding: '1rem 1.25rem',
                            }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{index + 1}</span>
                                </div>
                                <p style={{ fontSize: '0.9375rem', margin: 0 }}>{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                overflowY: 'auto',
                backgroundColor: '#FFFFFF',
            }}>
                <div style={{ width: '100%', maxWidth: '420px' }}>
                    {/* Logo */}
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', textDecoration: 'none' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Shield style={{ width: '28px', height: '28px', color: 'white' }} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>LaporRT</h1>
                            <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: 0 }}>RT 01 / RW 05</p>
                        </div>
                    </Link>

                    {/* Title */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.5rem 0' }}>
                            Buat Akun Baru
                        </h2>
                        <p style={{ color: '#64748B', margin: 0 }}>
                            Daftar untuk mulai menggunakan layanan
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div style={{
                            marginBottom: '1.5rem',
                            padding: '1rem',
                            backgroundColor: '#FEF2F2',
                            border: '1px solid #FECACA',
                            borderRadius: '10px',
                            color: '#DC2626',
                            fontSize: '0.875rem',
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Nama Lengkap */}
                        <div>
                            <label style={labelStyle}>Nama Lengkap</label>
                            <div style={{ position: 'relative' }}>
                                <User style={iconStyle} />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Nama lengkap Anda"
                                    style={inputStyle}
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label style={labelStyle}>Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail style={iconStyle} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="nama@email.com"
                                    style={inputStyle}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label style={labelStyle}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock style={iconStyle} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Minimal 6 karakter"
                                    style={inputWithRightIconStyle}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: 0,
                                        color: '#94A3B8',
                                    }}
                                >
                                    {showPassword ? <EyeOff style={{ width: '20px', height: '20px' }} /> : <Eye style={{ width: '20px', height: '20px' }} />}
                                </button>
                            </div>
                        </div>

                        {/* Konfirmasi Password */}
                        <div>
                            <label style={labelStyle}>Konfirmasi Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock style={iconStyle} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Ulangi password Anda"
                                    style={inputStyle}
                                    required
                                />
                            </div>
                        </div>

                        {/* Nomor Telepon */}
                        <div>
                            <label style={labelStyle}>Nomor Telepon</label>
                            <div style={{ position: 'relative' }}>
                                <Phone style={iconStyle} />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="08xxxxxxxxxx"
                                    style={inputStyle}
                                    required
                                />
                            </div>
                        </div>

                        {/* Alamat */}
                        <div>
                            <label style={labelStyle}>Alamat (RT/RW)</label>
                            <div style={{ position: 'relative' }}>
                                <MapPin style={{ ...iconStyle, top: '1.25rem', transform: 'none' }} />
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Contoh: RT 01/RW 05, No. 15"
                                    style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                                    rows={2}
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                backgroundColor: '#3B82F6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '0.9375rem',
                                fontWeight: 600,
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                opacity: isLoading ? 0.7 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                marginTop: '0.5rem',
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
                                    Memproses...
                                </>
                            ) : (
                                'Daftar Sekarang'
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <p style={{ marginTop: '2rem', textAlign: 'center', color: '#64748B' }}>
                        Sudah punya akun?{' '}
                        <Link href="/login" style={{ color: '#3B82F6', fontWeight: 500, textDecoration: 'none' }}>
                            Masuk di sini
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
