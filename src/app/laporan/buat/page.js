'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth';
import { addReport, generateId } from '@/lib/storage';
import { Loader2, Send, HardHat, Shield, Sparkles, Users, ClipboardList } from 'lucide-react';

export default function BuatLaporanPage() {
    const { user } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        location: '',
        isAnonymous: false,
    });
    const [images, setImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [createdId, setCreatedId] = useState('');
    const [errors, setErrors] = useState({});

    const categories = [
        { value: 'infrastruktur', label: 'Infrastruktur', description: 'Jalan rusak, jembatan, saluran air', Icon: HardHat },
        { value: 'keamanan', label: 'Keamanan', description: 'Pencurian, perusakan, aktivitas mencurigakan', Icon: Shield },
        { value: 'kebersihan', label: 'Kebersihan', description: 'Sampah, polusi, limbah', Icon: Sparkles },
        { value: 'sosial', label: 'Sosial', description: 'Konflik warga, kegiatan melanggar', Icon: Users },
        { value: 'lainnya', label: 'Lainnya', description: 'Masalah lain yang tidak tercakup', Icon: ClipboardList },
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 5) {
            alert('Maksimal 5 gambar');
            return;
        }

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImages(prev => [...prev, {
                    id: Date.now() + Math.random(),
                    name: file.name,
                    url: e.target.result,
                }]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (id) => {
        setImages(prev => prev.filter(img => img.id !== id));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Judul laporan wajib diisi';
        if (!formData.category) newErrors.category = 'Pilih kategori laporan';
        if (!formData.description.trim()) newErrors.description = 'Deskripsi wajib diisi';
        if (!formData.description.trim()) newErrors.description = 'Deskripsi wajib diisi';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const reportId = generateId('RPT');

        const newReport = {
            id: reportId,
            title: formData.title,
            category: formData.category,
            description: formData.description,
            location: formData.location || user?.address,
            status: 'baru',
            isAnonymous: formData.isAnonymous,
            userId: formData.isAnonymous ? null : user?.id,
            userName: formData.isAnonymous ? 'Anonim' : user?.name,
            images: images.map(img => img.url),
            responses: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await addReport(newReport);
        setCreatedId(reportId);
        setShowSuccess(true);
        setIsSubmitting(false);
    };

    const cardStyle = {
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '1.75rem',
        marginBottom: '1.5rem'
    };

    const inputStyle = {
        width: '100%',
        padding: '0.875rem 1rem',
        border: '1px solid #E2E8F0',
        borderRadius: '10px',
        fontSize: '0.9375rem',
        backgroundColor: '#FFFFFF',
        outline: 'none',
        boxSizing: 'border-box',
        fontFamily: 'inherit'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.9375rem',
        fontWeight: 500,
        color: '#374151',
        marginBottom: '0.625rem'
    };

    if (showSuccess) {
        return (
            <DashboardLayout>
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem 2rem' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            backgroundColor: '#DCFCE7',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            fontSize: '2rem'
                        }}>
                            ✓
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.75rem 0' }}>
                            Laporan Berhasil Dibuat!
                        </h2>
                        <p style={{ color: '#64748B', margin: '0 0 2rem 0', lineHeight: 1.6 }}>
                            Laporan Anda dengan ID <span style={{ fontWeight: 600, color: '#3B82F6' }}>#{createdId}</span> telah berhasil dikirim dan akan segera ditindaklanjuti.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link href={`/laporan/${createdId}`} style={{
                                padding: '0.875rem 1.5rem',
                                backgroundColor: '#3B82F6',
                                color: 'white',
                                borderRadius: '10px',
                                fontWeight: 600,
                                textDecoration: 'none',
                                fontSize: '0.9375rem'
                            }}>
                                Lihat Laporan
                            </Link>
                            <Link href="/laporan" style={{
                                padding: '0.875rem 1.5rem',
                                backgroundColor: '#F1F5F9',
                                color: '#475569',
                                borderRadius: '10px',
                                fontWeight: 600,
                                textDecoration: 'none',
                                fontSize: '0.9375rem'
                            }}>
                                Kembali ke Daftar
                            </Link>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <Link href="/laporan" style={{
                        padding: '0.625rem',
                        borderRadius: '10px',
                        border: '1px solid #E2E8F0',
                        backgroundColor: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none'
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
                        </svg>
                    </Link>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                            Buat Laporan
                        </h1>
                        <p style={{ color: '#64748B', margin: '0.25rem 0 0 0', fontSize: '0.9375rem' }}>
                            Laporkan masalah di lingkungan Anda
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Category Selection */}
                    <div style={cardStyle}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0F172A', margin: '0 0 1.25rem 0' }}>
                            Kategori Laporan
                        </h2>
                        {errors.category && (
                            <p style={{ color: '#EF4444', fontSize: '0.875rem', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                ⚠️ {errors.category}
                            </p>
                        )}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '1rem'
                        }}>
                            {categories.map((cat) => (
                                <label
                                    key={cat.value}
                                    style={{
                                        position: 'relative',
                                        padding: '1.25rem',
                                        border: `2px solid ${formData.category === cat.value ? '#3B82F6' : '#E2E8F0'}`,
                                        borderRadius: '14px',
                                        cursor: 'pointer',
                                        backgroundColor: formData.category === cat.value ? '#EFF6FF' : 'white',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="category"
                                        value={cat.value}
                                        checked={formData.category === cat.value}
                                        onChange={handleChange}
                                        style={{ display: 'none' }}
                                    />
                                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{cat.icon}</div>
                                    <p style={{ fontWeight: 600, color: '#0F172A', margin: '0 0 0.375rem 0', fontSize: '0.9375rem' }}>{cat.label}</p>
                                    <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: 0, lineHeight: 1.4 }}>{cat.description}</p>
                                    {formData.category === cat.value && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            width: '22px',
                                            height: '22px',
                                            backgroundColor: '#3B82F6',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '0.75rem'
                                        }}>
                                            ✓
                                        </div>
                                    )}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Report Details */}
                    <div style={cardStyle}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0F172A', margin: '0 0 1.5rem 0' }}>
                            Detail Laporan
                        </h2>

                        {/* Title */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={labelStyle}>
                                Judul Laporan <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Contoh: Jalan Berlubang di Gang Mawar"
                                style={{
                                    ...inputStyle,
                                    borderColor: errors.title ? '#EF4444' : '#E2E8F0'
                                }}
                            />
                            {errors.title && (
                                <p style={{ color: '#EF4444', fontSize: '0.8125rem', margin: '0.5rem 0 0 0' }}>
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={labelStyle}>
                                Deskripsi <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Jelaskan masalah yang Anda temui secara detail..."
                                rows={5}
                                style={{
                                    ...inputStyle,
                                    borderColor: errors.description ? '#EF4444' : '#E2E8F0',
                                    minHeight: '140px',
                                    resize: 'vertical',
                                    lineHeight: 1.6
                                }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                                {errors.description ? (
                                    <p style={{ color: '#EF4444', fontSize: '0.8125rem', margin: 0 }}>
                                        {errors.description}
                                    </p>
                                ) : (
                                    <span style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>Deskripsi wajib diisi</span>
                                )}
                                <span style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>{formData.description.length} karakter</span>
                            </div>
                        </div>

                        {/* Location */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={labelStyle}>Lokasi</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    pointerEvents: 'none'
                                }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder={user?.address || "Lokasi kejadian"}
                                    style={{ ...inputStyle, paddingLeft: '2.75rem' }}
                                />
                            </div>
                            <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: '0.5rem 0 0 0' }}>
                                Kosongkan untuk menggunakan alamat Anda: {user?.address}
                            </p>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label style={labelStyle}>Foto/Bukti (Opsional)</label>
                            <div style={{
                                border: '2px dashed #E2E8F0',
                                borderRadius: '14px',
                                padding: '2rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                backgroundColor: '#FAFAFA'
                            }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    style={{ display: 'none' }}
                                    id="image-upload"
                                />
                                <label htmlFor="image-upload" style={{ cursor: 'pointer' }}>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📷</div>
                                    <p style={{ color: '#64748B', margin: '0 0 0.375rem 0', fontSize: '0.9375rem' }}>
                                        Klik untuk upload atau drag & drop
                                    </p>
                                    <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: 0 }}>
                                        PNG, JPG hingga 5MB (maks. 5 gambar)
                                    </p>
                                </label>
                            </div>

                            {images.length > 0 && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
                                    {images.map((img) => (
                                        <div key={img.id} style={{ position: 'relative' }}>
                                            <img
                                                src={img.url}
                                                alt={img.name}
                                                style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '10px' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(img.id)}
                                                style={{
                                                    position: 'absolute',
                                                    top: '-8px',
                                                    right: '-8px',
                                                    width: '24px',
                                                    height: '24px',
                                                    backgroundColor: '#EF4444',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.75rem'
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Anonymous Option */}
                    <div style={cardStyle}>
                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                name="isAnonymous"
                                checked={formData.isAnonymous}
                                onChange={handleChange}
                                style={{
                                    marginTop: '0.25rem',
                                    width: '22px',
                                    height: '22px',
                                    accentColor: '#3B82F6'
                                }}
                            />
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '1.25rem' }}>🔒</span>
                                    <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.9375rem' }}>
                                        Laporkan Secara Anonim
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.875rem', color: '#64748B', margin: '0.5rem 0 0 0', lineHeight: 1.5 }}>
                                    Identitas Anda tidak akan ditampilkan pada laporan ini.
                                    Admin tetap dapat menghubungi Anda jika diperlukan.
                                </p>
                            </div>
                        </label>
                    </div>

                    {/* Submit Buttons */}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <Link href="/laporan" style={{
                            padding: '0.875rem 1.5rem',
                            backgroundColor: '#F1F5F9',
                            color: '#475569',
                            borderRadius: '10px',
                            fontWeight: 600,
                            textDecoration: 'none',
                            fontSize: '0.9375rem',
                            textAlign: 'center'
                        }}>
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                flex: 1,
                                padding: '0.875rem 1.5rem',
                                backgroundColor: '#3B82F6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: 600,
                                fontSize: '0.9375rem',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                opacity: isSubmitting ? 0.7 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {isSubmitting ? <><Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} /> Mengirim...</> : <><Send style={{ width: '18px', height: '18px' }} /> Kirim Laporan</>}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
