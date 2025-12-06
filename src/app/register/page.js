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

        // Validation
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
            router.push('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Gradient */}
            <div className="hidden lg:flex flex-1 bg-gradient-hero items-center justify-center p-12">
                <div className="max-w-lg text-white text-center">
                    <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur">
                        <Shield className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">
                        Bergabung dengan Komunitas
                    </h2>
                    <p className="text-white/80">
                        Daftar sekarang dan mulai berkontribusi untuk lingkungan RT/RW yang lebih baik.
                    </p>

                    <div className="mt-12 space-y-4 text-left">
                        {[
                            'Laporkan masalah di lingkungan secara anonim',
                            'Pantau keuangan RT/RW secara transparan',
                            'Ajukan surat-surat secara online',
                        ].map((item, index) => (
                            <div key={index} className="flex items-center gap-3 bg-white/10 rounded-xl p-4">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                    <span className="text-sm font-bold">{index + 1}</span>
                                </div>
                                <p className="text-sm">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
                <div className="w-full max-w-md py-8">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                            <Shield className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-2xl text-[var(--text-primary)]">LaporRT</h1>
                            <p className="text-sm text-[var(--text-tertiary)]">RT 01 / RW 05</p>
                        </div>
                    </Link>

                    {/* Title */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                            Buat Akun Baru
                        </h2>
                        <p className="text-[var(--text-secondary)]">
                            Daftar untuk mulai menggunakan layanan
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="input-group">
                            <label className="input-label">Nama Lengkap</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Nama lengkap Anda"
                                    className="input pl-12"
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="nama@email.com"
                                    className="input pl-12"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="input-group">
                                <label className="input-label">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Min. 6 karakter"
                                        className="input pl-12"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label className="input-label">Konfirmasi</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Ulangi password"
                                        className="input pl-12"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="showPassword"
                                checked={showPassword}
                                onChange={() => setShowPassword(!showPassword)}
                                className="w-4 h-4 rounded border-[var(--border-color)]"
                            />
                            <label htmlFor="showPassword" className="text-sm text-[var(--text-secondary)]">
                                Tampilkan password
                            </label>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Nomor Telepon</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="08xxxxxxxxxx"
                                    className="input pl-12"
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Alamat (RT/RW)</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-3 w-5 h-5 text-[var(--text-tertiary)]" />
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Contoh: RT 01/RW 05, No. 15"
                                    className="input pl-12 textarea"
                                    rows={2}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary w-full"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                'Daftar Sekarang'
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className="mt-8 text-center text-[var(--text-secondary)]">
                        Sudah punya akun?{' '}
                        <Link href="/login" className="text-[var(--primary)] font-medium hover:underline">
                            Masuk di sini
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
