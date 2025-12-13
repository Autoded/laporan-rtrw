'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth';
import { getReportById, updateReport, deleteReport } from '@/lib/storage';
import { formatDate, formatRelativeTime, getStatusInfo, getCategoryInfo, getInitials, getRoleInfo } from '@/lib/utils';
import { User, MapPin, Calendar, MessageCircle, Trash2, Send, Loader2, ArrowLeft, Lock, Circle, AlertTriangle } from 'lucide-react';

export default function ReportDetailPage({ params }) {
    const resolvedParams = use(params);
    const { user, isAdmin, isKetuaRT } = useAuth();
    const router = useRouter();

    const [report, setReport] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [responseText, setResponseText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        loadReport();
    }, [resolvedParams.id]);

    const loadReport = async () => {
        const found = await getReportById(resolvedParams.id);
        if (found) setReport(found);
        setIsLoading(false);
    };

    const handleStatusChange = async (newStatus) => {
        setShowStatusMenu(false);
        const updated = await updateReport(report.id, { status: newStatus });
        if (updated) setReport(updated);
    };

    const handleSubmitResponse = async (e) => {
        e.preventDefault();
        if (!responseText.trim()) return;
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        const newResponse = {
            id: Date.now().toString(),
            message: responseText,
            createdAt: new Date().toISOString(),
            responderId: user.id,
            responderName: user.name,
            responderRole: user.role,
        };
        const updated = await updateReport(report.id, {
            responses: [...(report.responses || []), newResponse],
            status: report.status === 'baru' ? 'proses' : report.status,
        });
        if (updated) {
            setReport(updated);
            setResponseText('');
        }
        setIsSubmitting(false);
    };

    const handleDelete = async () => {
        await deleteReport(report.id);
        router.push('/laporan');
    };

    const cardStyle = {
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '1.75rem'
    };

    const statuses = [
        { value: 'baru', label: 'Baru', Icon: Circle, color: '#3B82F6' },
        { value: 'proses', label: 'Diproses', Icon: Circle, color: '#EAB308' },
        { value: 'selesai', label: 'Selesai', Icon: Circle, color: '#22C55E' },
        { value: 'ditolak', label: 'Ditolak', Icon: Circle, color: '#EF4444' },
    ];

    if (isLoading) {
        return (
            <DashboardLayout>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                    <Loader2 style={{ width: '40px', height: '40px', color: '#3B82F6', animation: 'spin 1s linear infinite' }} />
                </div>
            </DashboardLayout>
        );
    }

    if (!report) {
        return (
            <DashboardLayout>
                <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}>
                    <AlertTriangle style={{ width: '48px', height: '48px', color: '#CBD5E1', margin: '0 auto 1rem' }} />
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.5rem' }}>
                        Laporan Tidak Ditemukan
                    </h2>
                    <p style={{ color: '#64748B', marginBottom: '1.5rem' }}>
                        Laporan yang Anda cari tidak ada atau sudah dihapus.
                    </p>
                    <Link href="/laporan" style={{
                        display: 'inline-block',
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#3B82F6',
                        color: 'white',
                        borderRadius: '10px',
                        fontWeight: 600,
                        textDecoration: 'none'
                    }}>
                        Kembali ke Daftar
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    const statusInfo = getStatusInfo(report.status);
    const categoryInfo = getCategoryInfo(report.category);

    return (
        <DashboardLayout>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <Link href="/laporan" style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '40px',
                            height: '40px',
                            backgroundColor: '#F1F5F9',
                            borderRadius: '10px',
                            textDecoration: 'none',
                            fontSize: '1.25rem',
                            marginTop: '0.25rem'
                        }}>
                            <ArrowLeft style={{ width: '20px', height: '20px', color: '#475569' }} />
                        </Link>
                        <div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                <span style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>#{report.id}</span>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    backgroundColor: '#F1F5F9',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    color: '#475569',
                                    fontWeight: 500
                                }}>
                                    {categoryInfo.label}
                                </span>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    backgroundColor: statusInfo.color + '20',
                                    color: statusInfo.color,
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 500
                                }}>
                                    {statusInfo.label}
                                </span>
                                {report.isAnonymous && (
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        backgroundColor: '#F3F4F6',
                                        color: '#6B7280',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        fontWeight: 500,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem'
                                    }}>
                                        <Lock style={{ width: '12px', height: '12px' }} /> Anonim
                                    </span>
                                )}
                            </div>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                                {report.title}
                            </h1>
                        </div>
                    </div>

                    {/* Admin Actions */}
                    {isAdmin && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                            {/* Status Dropdown */}
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setShowStatusMenu(!showStatusMenu)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.625rem 1rem',
                                        backgroundColor: '#F1F5F9',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontWeight: 500,
                                        fontSize: '0.875rem',
                                        color: '#475569',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Update Status ▼
                                </button>

                                {showStatusMenu && (
                                    <>
                                        <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setShowStatusMenu(false)} />
                                        <div style={{
                                            position: 'absolute',
                                            right: 0,
                                            marginTop: '0.5rem',
                                            width: '200px',
                                            backgroundColor: 'white',
                                            borderRadius: '12px',
                                            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                                            border: '1px solid #E2E8F0',
                                            zIndex: 20,
                                            padding: '0.5rem 0'
                                        }}>
                                            {statuses.map((status) => (
                                                <button
                                                    key={status.value}
                                                    onClick={() => handleStatusChange(status.value)}
                                                    style={{
                                                        width: '100%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.75rem',
                                                        padding: '0.75rem 1rem',
                                                        border: 'none',
                                                        backgroundColor: report.status === status.value ? '#F8FAFC' : 'transparent',
                                                        cursor: 'pointer',
                                                        fontSize: '0.875rem',
                                                        color: '#0F172A',
                                                        textAlign: 'left'
                                                    }}
                                                >
                                                    <span>{status.icon}</span>
                                                    <span>{status.label}</span>
                                                    {report.status === status.value && <span style={{ marginLeft: 'auto' }}>✓</span>}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {isKetuaRT && (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '40px',
                                        height: '40px',
                                        backgroundColor: '#FEF2F2',
                                        border: 'none',
                                        borderRadius: '10px',
                                        color: '#EF4444',
                                        cursor: 'pointer',
                                        fontSize: '1.125rem'
                                    }}
                                >
                                    🗑️
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
                    {/* Main Content */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Description */}
                        <div style={cardStyle}>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0F172A', margin: '0 0 1rem 0' }}>
                                Deskripsi Masalah
                            </h2>
                            <p style={{ color: '#64748B', lineHeight: 1.7, margin: 0, fontSize: '0.9375rem', whiteSpace: 'pre-wrap' }}>
                                {report.description}
                            </p>

                            {report.images && report.images.length > 0 && (
                                <div style={{ marginTop: '1.5rem' }}>
                                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 500, color: '#0F172A', marginBottom: '0.75rem' }}>
                                        Foto Bukti
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                                        {report.images.map((img, index) => (
                                            <img
                                                key={index}
                                                src={img}
                                                alt={`Bukti ${index + 1}`}
                                                style={{ width: '100%', height: '128px', objectFit: 'cover', borderRadius: '8px' }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Responses */}
                        <div style={cardStyle}>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0F172A', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <MessageCircle style={{ width: '20px', height: '20px' }} /> Tanggapan ({report.responses?.length || 0})
                            </h2>

                            {report.responses && report.responses.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {report.responses.map((response) => {
                                        const roleInfo = getRoleInfo(response.responderRole);
                                        const avatarColor = roleInfo.color === 'success' ? '#22C55E' : roleInfo.color === 'warning' ? '#EAB308' : '#3B82F6';
                                        return (
                                            <div key={response.id} style={{ display: 'flex', gap: '1rem' }}>
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    backgroundColor: avatarColor,
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontWeight: 600,
                                                    fontSize: '0.875rem',
                                                    flexShrink: 0
                                                }}>
                                                    {getInitials(response.responderName)}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                        <span style={{ fontWeight: 500, color: '#0F172A', fontSize: '0.9375rem' }}>
                                                            {response.responderName}
                                                        </span>
                                                        <span style={{
                                                            padding: '0.125rem 0.5rem',
                                                            backgroundColor: avatarColor + '20',
                                                            color: avatarColor,
                                                            borderRadius: '4px',
                                                            fontSize: '0.6875rem',
                                                            fontWeight: 500
                                                        }}>
                                                            {roleInfo.label}
                                                        </span>
                                                    </div>
                                                    <p style={{ color: '#64748B', fontSize: '0.9375rem', lineHeight: 1.6, margin: '0 0 0.5rem 0', whiteSpace: 'pre-wrap' }}>
                                                        {response.message}
                                                    </p>
                                                    <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0 }}>
                                                        {formatRelativeTime(response.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }}>💬</div>
                                    <p style={{ margin: 0 }}>Belum ada tanggapan</p>
                                </div>
                            )}

                            {/* Response Form */}
                            {isAdmin && (
                                <form onSubmit={handleSubmitResponse} style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #E2E8F0' }}>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            backgroundColor: '#3B82F6',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: '0.875rem',
                                            flexShrink: 0
                                        }}>
                                            {user ? getInitials(user.name) : '?'}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <textarea
                                                value={responseText}
                                                onChange={(e) => setResponseText(e.target.value)}
                                                placeholder="Tulis tanggapan..."
                                                rows={3}
                                                style={{
                                                    width: '100%',
                                                    padding: '1rem',
                                                    border: '1px solid #E2E8F0',
                                                    borderRadius: '12px',
                                                    fontSize: '0.9375rem',
                                                    resize: 'vertical',
                                                    outline: 'none',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                                                <button
                                                    type="submit"
                                                    disabled={!responseText.trim() || isSubmitting}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        padding: '0.75rem 1.5rem',
                                                        backgroundColor: responseText.trim() && !isSubmitting ? '#3B82F6' : '#CBD5E1',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '10px',
                                                        fontWeight: 600,
                                                        fontSize: '0.9375rem',
                                                        cursor: responseText.trim() && !isSubmitting ? 'pointer' : 'not-allowed'
                                                    }}
                                                >
                                                    {isSubmitting ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : <Send style={{ width: '16px', height: '16px' }} />} Kirim
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Report Info */}
                        <div style={cardStyle}>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0F172A', margin: '0 0 1.25rem 0' }}>
                                Informasi Laporan
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                                    <User style={{ width: '20px', height: '20px', color: '#64748B', flexShrink: 0 }} />
                                    <div>
                                        <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: '0 0 0.25rem 0' }}>Pelapor</p>
                                        <p style={{ fontWeight: 500, color: '#0F172A', margin: 0, fontSize: '0.9375rem' }}>
                                            {report.isAnonymous ? 'Anonim' : report.userName}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                                    <MapPin style={{ width: '20px', height: '20px', color: '#64748B', flexShrink: 0 }} />
                                    <div>
                                        <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: '0 0 0.25rem 0' }}>Lokasi</p>
                                        <p style={{ fontWeight: 500, color: '#0F172A', margin: 0, fontSize: '0.9375rem' }}>
                                            {report.location || '-'}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                                    <Calendar style={{ width: '20px', height: '20px', color: '#64748B', flexShrink: 0 }} />
                                    <div>
                                        <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: '0 0 0.25rem 0' }}>Tanggal Laporan</p>
                                        <p style={{ fontWeight: 500, color: '#0F172A', margin: 0, fontSize: '0.9375rem' }}>
                                            {formatDate(report.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Timeline */}
                        <div style={cardStyle}>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0F172A', margin: '0 0 1.25rem 0' }}>
                                Status
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {statuses.map((status, index) => {
                                    const isActive = status.value === report.status;
                                    const isPast = statuses.findIndex(s => s.value === report.status) >= index;

                                    return (
                                        <div
                                            key={status.value}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.875rem',
                                                padding: '0.875rem',
                                                borderRadius: '10px',
                                                backgroundColor: isActive ? '#F8FAFC' : 'transparent'
                                            }}
                                        >
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: isPast ? `${status.color}20` : '#F1F5F9',
                                                opacity: isPast ? 1 : 0.5
                                            }}>
                                                <span style={{ fontSize: '0.875rem' }}>{status.icon}</span>
                                            </div>
                                            <span style={{
                                                fontSize: '0.9375rem',
                                                fontWeight: isActive ? 500 : 400,
                                                color: isPast ? '#0F172A' : '#94A3B8'
                                            }}>
                                                {status.label}
                                            </span>
                                            {isActive && (
                                                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#94A3B8' }}>
                                                    Saat ini
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 50
                    }} onClick={() => setShowDeleteConfirm(false)}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            maxWidth: '400px',
                            width: '90%'
                        }} onClick={(e) => e.stopPropagation()}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0F172A', margin: '0 0 0.75rem 0' }}>
                                Hapus Laporan
                            </h3>
                            <p style={{ color: '#64748B', margin: '0 0 1.5rem 0', fontSize: '0.9375rem' }}>
                                Apakah Anda yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan.
                            </p>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    style={{
                                        padding: '0.625rem 1.25rem',
                                        backgroundColor: '#F1F5F9',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: 500,
                                        color: '#475569',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleDelete}
                                    style={{
                                        padding: '0.625rem 1.25rem',
                                        backgroundColor: '#EF4444',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: 500,
                                        color: 'white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                @media (max-width: 768px) {
                    div[style*="gridTemplateColumns: '1fr 320px'"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </DashboardLayout>
    );
}
