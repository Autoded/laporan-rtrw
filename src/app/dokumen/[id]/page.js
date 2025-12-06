'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth';
import { getDocumentById, updateDocument } from '@/lib/storage';
import { formatDate, getStatusInfo, getDocumentTypeInfo } from '@/lib/utils';
import {
    ArrowLeft,
    FileCheck,
    User,
    Clock,
    MapPin,
    CheckCircle,
    XCircle,
    Download,
    FileText,
    X,
    PenTool,
    Upload,
    Eye,
    Loader2
} from 'lucide-react';

export default function DocumentDetailPage({ params }) {
    const resolvedParams = use(params);
    const { user, isKetuaRT } = useAuth();
    const router = useRouter();

    const [document, setDocument] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [showDocPreview, setShowDocPreview] = useState(null);
    const [approvalType, setApprovalType] = useState('approve');
    const [notes, setNotes] = useState('');
    const [approverSignature, setApproverSignature] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadDocument();
    }, [resolvedParams.id]);

    const loadDocument = () => {
        const found = getDocumentById(resolvedParams.id);
        if (found) setDocument(found);
        setIsLoading(false);
    };

    const handleSignatureUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setApproverSignature({ name: file.name, url: e.target.result });
            };
            reader.readAsDataURL(file);
        }
    };

    // Set status to "diproses"
    const handleSetProses = async () => {
        if (!isKetuaRT) return;
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 300));
        const updated = updateDocument(document.id, { status: 'proses' });
        if (updated) setDocument(updated);
        setIsSubmitting(false);
    };

    const handleApproval = async () => {
        if (approvalType === 'approve' && !approverSignature) {
            alert('Upload tanda tangan terlebih dahulu');
            return;
        }
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        const updates = {
            status: approvalType === 'approve' ? 'selesai' : 'ditolak',
            notes,
            approvedAt: new Date().toISOString(),
            approvedBy: user.id,
            approverName: user.name,
            approverSignature: approvalType === 'approve' ? approverSignature?.url : null,
        };
        const updated = updateDocument(document.id, updates);
        if (updated) setDocument(updated);
        setShowApprovalModal(false);
        setIsSubmitting(false);
    };

    // Download surat as text file (simulated)
    const handleDownloadSurat = () => {
        if (!document) return;
        const typeInfo = getDocumentTypeInfo(document.type);

        const content = `
================================================================================
                            SURAT PENGANTAR RT
                         RT 01 / RW 05 Kelurahan XYZ
================================================================================

Nomor Surat    : ${document.id}
Tanggal        : ${formatDate(document.approvedAt)}

Yang bertanda tangan di bawah ini, Ketua RT 01 RW 05, menerangkan bahwa:

Nama           : ${document.requesterName}
Alamat         : ${document.requesterAddress}

Adalah benar warga RT 01 RW 05 dan bermaksud untuk:
${document.purpose}

Jenis Dokumen  : ${typeInfo.label}
Status         : DISETUJUI

Demikian surat pengantar ini dibuat untuk dipergunakan sebagaimana mestinya.

                                            Yang Menyetujui,
                                            Ketua RT 01


                                            ${document.approverName}

================================================================================
                    Dokumen ini dikeluarkan secara resmi oleh Sistem LaporRT
================================================================================
`;

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = window.document.createElement('a');
        link.href = url;
        link.download = `Surat-${document.id}-${document.requesterName.replace(/\s/g, '_')}.txt`;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const openApprovalModal = (type) => {
        setApprovalType(type);
        setNotes('');
        setApproverSignature(null);
        setShowApprovalModal(true);
    };

    const cardStyle = {
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '1.75rem',
        marginBottom: '1.5rem'
    };

    const iconStyle = { width: '20px', height: '20px', color: '#64748B', flexShrink: 0 };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                    <Loader2 style={{ width: '40px', height: '40px', color: '#3B82F6', animation: 'spin 1s linear infinite' }} />
                </div>
            </DashboardLayout>
        );
    }

    if (!document) {
        return (
            <DashboardLayout>
                <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <FileCheck style={{ width: '64px', height: '64px', color: '#CBD5E1', margin: '0 auto' }} />
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.5rem' }}>
                        Dokumen Tidak Ditemukan
                    </h2>
                    <p style={{ color: '#64748B', marginBottom: '1.5rem' }}>
                        Dokumen yang Anda cari tidak ada atau sudah dihapus.
                    </p>
                    <Link href="/dokumen" style={{
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

    const statusInfo = getStatusInfo(document.status);
    const typeInfo = getDocumentTypeInfo(document.type);
    const canApprove = isKetuaRT && ['diajukan', 'proses'].includes(document.status);
    const canSetProses = isKetuaRT && document.status === 'diajukan';

    const statuses = [
        { value: 'diajukan', label: 'Diajukan', Icon: FileCheck, color: '#3B82F6' },
        { value: 'proses', label: 'Diproses', Icon: Clock, color: '#EAB308' },
        { value: 'selesai', label: 'Selesai', Icon: CheckCircle, color: '#22C55E' },
        { value: 'ditolak', label: 'Ditolak', Icon: XCircle, color: '#EF4444' },
    ];

    return (
        <DashboardLayout>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <Link href="/dokumen" style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '40px',
                            height: '40px',
                            backgroundColor: '#F1F5F9',
                            borderRadius: '10px',
                            textDecoration: 'none'
                        }}>
                            <ArrowLeft style={{ width: '20px', height: '20px', color: '#475569' }} />
                        </Link>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>#{document.id}</span>
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
                            </div>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                                {typeInfo.label}
                            </h1>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {/* Set to Diproses button */}
                        {canSetProses && (
                            <button
                                onClick={handleSetProses}
                                disabled={isSubmitting}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.625rem 1rem', backgroundColor: '#FEF3C7',
                                    border: 'none', borderRadius: '10px', color: '#B45309',
                                    fontWeight: 500, cursor: 'pointer', fontSize: '0.875rem',
                                    opacity: isSubmitting ? 0.7 : 1
                                }}
                            >
                                <Clock style={{ width: '18px', height: '18px' }} /> Set Diproses
                            </button>
                        )}
                        {canApprove && (
                            <>
                                <button onClick={() => openApprovalModal('reject')} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.625rem 1rem', backgroundColor: '#FEF2F2',
                                    border: 'none', borderRadius: '10px', color: '#EF4444',
                                    fontWeight: 500, cursor: 'pointer', fontSize: '0.875rem'
                                }}>
                                    <XCircle style={{ width: '18px', height: '18px' }} /> Tolak
                                </button>
                                <button onClick={() => openApprovalModal('approve')} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.625rem 1rem', backgroundColor: '#22C55E',
                                    border: 'none', borderRadius: '10px', color: 'white',
                                    fontWeight: 500, cursor: 'pointer', fontSize: '0.875rem'
                                }}>
                                    <CheckCircle style={{ width: '18px', height: '18px' }} /> Setujui
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Content Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
                    {/* Main Content */}
                    <div>
                        {/* Document Info */}
                        <div style={cardStyle}>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0F172A', margin: '0 0 1.25rem 0' }}>
                                Detail Permohonan
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: '0 0 0.25rem 0' }}>Jenis Dokumen</p>
                                    <p style={{ fontWeight: 500, color: '#0F172A', margin: 0 }}>{typeInfo.label}</p>
                                    <p style={{ fontSize: '0.875rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>{typeInfo.description}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: '0 0 0.25rem 0' }}>Keperluan</p>
                                    <p style={{ color: '#0F172A', margin: 0 }}>{document.purpose}</p>
                                </div>
                                {document.notes && (
                                    <div style={{
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        backgroundColor: document.status === 'ditolak' ? '#FEF2F2' : '#F0FDF4'
                                    }}>
                                        <p style={{ fontSize: '0.875rem', fontWeight: 500, margin: '0 0 0.25rem 0' }}>
                                            Catatan dari {document.approverName}:
                                        </p>
                                        <p style={{
                                            fontSize: '0.875rem',
                                            color: document.status === 'ditolak' ? '#DC2626' : '#16A34A',
                                            margin: 0
                                        }}>
                                            {document.notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Supporting Documents - Now clickable */}
                        <div style={cardStyle}>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0F172A', margin: '0 0 1.25rem 0' }}>
                                Dokumen Pendukung
                            </h2>
                            {document.supportingDocs && document.supportingDocs.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {document.supportingDocs.map((doc, index) => (
                                        <div key={index} style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '0.875rem', backgroundColor: '#F8FAFC', borderRadius: '10px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <FileText style={iconStyle} />
                                                <span style={{ fontSize: '0.9375rem', color: '#0F172A' }}>{doc}</span>
                                            </div>
                                            <button
                                                onClick={() => setShowDocPreview(doc)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                                                    padding: '0.5rem 0.75rem', backgroundColor: '#3B82F6',
                                                    border: 'none', borderRadius: '8px', color: 'white',
                                                    fontSize: '0.8125rem', cursor: 'pointer', fontWeight: 500
                                                }}
                                            >
                                                <Eye style={{ width: '16px', height: '16px' }} /> Lihat
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: '#94A3B8', fontSize: '0.9375rem' }}>Tidak ada dokumen pendukung</p>
                            )}
                        </div>

                        {/* Signatures */}
                        <div style={cardStyle}>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0F172A', margin: '0 0 1.25rem 0' }}>
                                Tanda Tangan
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                {/* Requester Signature */}
                                <div>
                                    <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: '0 0 0.75rem 0' }}>Pemohon</p>
                                    {document.requesterSignature ? (
                                        <div style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '12px', textAlign: 'center' }}>
                                            <img src={document.requesterSignature} alt="Tanda tangan" style={{ maxHeight: '80px', margin: '0 auto' }} />
                                            <p style={{ fontSize: '0.875rem', color: '#0F172A', margin: '0.75rem 0 0 0' }}>{document.requesterName}</p>
                                        </div>
                                    ) : (
                                        <div style={{ padding: '1.5rem', border: '2px dashed #E2E8F0', borderRadius: '12px', textAlign: 'center' }}>
                                            <PenTool style={{ width: '32px', height: '32px', color: '#CBD5E1', margin: '0 auto 0.5rem' }} />
                                            <p style={{ fontSize: '0.875rem', color: '#94A3B8', margin: 0 }}>Belum ada tanda tangan</p>
                                        </div>
                                    )}
                                </div>
                                {/* Approver Signature */}
                                <div>
                                    <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: '0 0 0.75rem 0' }}>Ketua RT</p>
                                    {document.approverSignature ? (
                                        <div style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: '12px', textAlign: 'center' }}>
                                            <img src={document.approverSignature} alt="Tanda tangan" style={{ maxHeight: '80px', margin: '0 auto' }} />
                                            <p style={{ fontSize: '0.875rem', color: '#0F172A', margin: '0.75rem 0 0 0' }}>{document.approverName}</p>
                                        </div>
                                    ) : (
                                        <div style={{ padding: '1.5rem', border: '2px dashed #E2E8F0', borderRadius: '12px', textAlign: 'center' }}>
                                            <PenTool style={{ width: '32px', height: '32px', color: '#CBD5E1', margin: '0 auto 0.5rem' }} />
                                            <p style={{ fontSize: '0.875rem', color: '#94A3B8', margin: 0 }}>Menunggu persetujuan</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Download Button */}
                        {document.status === 'selesai' && (
                            <div style={{ ...cardStyle, backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <h3 style={{ fontWeight: 500, color: '#166534', margin: '0 0 0.25rem 0' }}>Dokumen Siap Diunduh</h3>
                                        <p style={{ fontSize: '0.875rem', color: '#16A34A', margin: 0 }}>
                                            Surat telah disetujui dan ditandatangani oleh Ketua RT
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleDownloadSurat}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            padding: '0.75rem 1.25rem', backgroundColor: '#22C55E',
                                            color: 'white', border: 'none', borderRadius: '10px',
                                            fontWeight: 600, cursor: 'pointer', fontSize: '0.9375rem'
                                        }}
                                    >
                                        <Download style={{ width: '18px', height: '18px' }} /> Unduh Surat
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div>
                        {/* Requester Info */}
                        <div style={cardStyle}>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0F172A', margin: '0 0 1.25rem 0' }}>
                                Informasi Pemohon
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ display: 'flex', gap: '0.875rem' }}>
                                    <User style={iconStyle} />
                                    <div>
                                        <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: '0 0 0.25rem 0' }}>Nama</p>
                                        <p style={{ fontWeight: 500, color: '#0F172A', margin: 0 }}>{document.requesterName}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.875rem' }}>
                                    <MapPin style={iconStyle} />
                                    <div>
                                        <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: '0 0 0.25rem 0' }}>Alamat</p>
                                        <p style={{ fontWeight: 500, color: '#0F172A', margin: 0 }}>{document.requesterAddress}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.875rem' }}>
                                    <Clock style={iconStyle} />
                                    <div>
                                        <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: '0 0 0.25rem 0' }}>Tanggal Pengajuan</p>
                                        <p style={{ fontWeight: 500, color: '#0F172A', margin: 0 }}>{formatDate(document.createdAt)}</p>
                                    </div>
                                </div>
                                {document.approvedAt && (
                                    <div style={{ display: 'flex', gap: '0.875rem' }}>
                                        <CheckCircle style={{ ...iconStyle, color: '#22C55E' }} />
                                        <div>
                                            <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: '0 0 0.25rem 0' }}>
                                                {document.status === 'selesai' ? 'Disetujui' : 'Ditolak'}
                                            </p>
                                            <p style={{ fontWeight: 500, color: '#0F172A', margin: 0 }}>{formatDate(document.approvedAt)}</p>
                                            <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>oleh {document.approverName}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Status Timeline */}
                        <div style={cardStyle}>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0F172A', margin: '0 0 1.25rem 0' }}>
                                Status Permohonan
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {statuses.slice(0, document.status === 'ditolak' ? 4 : 3).map((status, index) => {
                                    const StatusIcon = status.Icon;
                                    const currentIndex = statuses.findIndex(s => s.value === document.status);
                                    const isActive = status.value === document.status;
                                    const isPast = index <= currentIndex;

                                    if (status.value === 'ditolak' && document.status !== 'ditolak') return null;

                                    return (
                                        <div key={status.value} style={{
                                            display: 'flex', alignItems: 'center', gap: '0.875rem',
                                            padding: '0.875rem', borderRadius: '10px',
                                            backgroundColor: isActive ? '#F8FAFC' : 'transparent'
                                        }}>
                                            <div style={{
                                                width: '32px', height: '32px', borderRadius: '50%',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                backgroundColor: isPast ? `${status.color}20` : '#F1F5F9',
                                                opacity: isPast ? 1 : 0.5
                                            }}>
                                                <StatusIcon style={{ width: '16px', height: '16px', color: isPast ? status.color : '#94A3B8' }} />
                                            </div>
                                            <span style={{
                                                fontSize: '0.9375rem',
                                                fontWeight: isActive ? 500 : 400,
                                                color: isPast ? '#0F172A' : '#94A3B8'
                                            }}>
                                                {status.label}
                                            </span>
                                            {isActive && (
                                                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#94A3B8' }}>Saat ini</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Document Preview Modal */}
                {showDocPreview && (
                    <div style={{
                        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
                    }} onClick={() => setShowDocPreview(null)}>
                        <div style={{
                            backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem',
                            maxWidth: '600px', width: '90%', maxHeight: '80vh', overflow: 'auto'
                        }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0F172A', margin: 0 }}>
                                    Preview: {showDocPreview}
                                </h3>
                                <button onClick={() => setShowDocPreview(null)} style={{
                                    padding: '0.5rem', borderRadius: '8px', border: 'none',
                                    backgroundColor: '#F1F5F9', cursor: 'pointer'
                                }}>
                                    <X style={{ width: '20px', height: '20px', color: '#64748B' }} />
                                </button>
                            </div>
                            <div style={{
                                padding: '3rem', backgroundColor: '#F8FAFC', borderRadius: '12px',
                                textAlign: 'center', border: '2px dashed #E2E8F0'
                            }}>
                                <FileText style={{ width: '64px', height: '64px', color: '#94A3B8', margin: '0 auto 1rem' }} />
                                <p style={{ fontWeight: 500, color: '#0F172A', margin: '0 0 0.5rem 0' }}>{showDocPreview}</p>
                                <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
                                    File dokumen pendukung tersimpan di sistem.
                                </p>
                                <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: '1rem 0 0 0' }}>
                                    (Preview gambar tidak tersedia dalam mode demo)
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Approval Modal */}
                {showApprovalModal && (
                    <div style={{
                        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
                    }} onClick={() => setShowApprovalModal(false)}>
                        <div style={{
                            backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem',
                            maxWidth: '480px', width: '90%'
                        }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0F172A', margin: 0 }}>
                                    {approvalType === 'approve' ? 'Setujui Permohonan' : 'Tolak Permohonan'}
                                </h3>
                                <button onClick={() => setShowApprovalModal(false)} style={{
                                    padding: '0.5rem', borderRadius: '8px', border: 'none',
                                    backgroundColor: 'transparent', cursor: 'pointer'
                                }}>
                                    <X style={{ width: '20px', height: '20px', color: '#64748B' }} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
                                {approvalType === 'approve' && (
                                    <div>
                                        <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0F172A', display: 'block', marginBottom: '0.5rem' }}>
                                            Tanda Tangan Ketua RT <span style={{ color: '#EF4444' }}>*</span>
                                        </label>
                                        {approverSignature ? (
                                            <div style={{ padding: '1rem', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                                    <span style={{ fontSize: '0.875rem', color: '#0F172A' }}>{approverSignature.name}</span>
                                                    <button onClick={() => setApproverSignature(null)} style={{
                                                        padding: '0.25rem', border: 'none', backgroundColor: '#FEF2F2',
                                                        borderRadius: '4px', cursor: 'pointer'
                                                    }}>
                                                        <X style={{ width: '14px', height: '14px', color: '#EF4444' }} />
                                                    </button>
                                                </div>
                                                <img src={approverSignature.url} alt="Signature" style={{ maxHeight: '96px', margin: '0 auto', display: 'block' }} />
                                            </div>
                                        ) : (
                                            <div style={{ border: '2px dashed #E2E8F0', borderRadius: '12px', padding: '2rem', textAlign: 'center' }}>
                                                <input type="file" accept="image/*" onChange={handleSignatureUpload} style={{ display: 'none' }} id="sig-upload" />
                                                <label htmlFor="sig-upload" style={{ cursor: 'pointer' }}>
                                                    <Upload style={{ width: '40px', height: '40px', color: '#CBD5E1', margin: '0 auto 0.75rem' }} />
                                                    <p style={{ color: '#64748B', margin: 0 }}>Upload tanda tangan</p>
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div>
                                    <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0F172A', display: 'block', marginBottom: '0.5rem' }}>
                                        Catatan {approvalType === 'reject' && <span style={{ color: '#EF4444' }}>*</span>}
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder={approvalType === 'approve' ? 'Catatan tambahan (opsional)...' : 'Alasan penolakan...'}
                                        rows={3}
                                        style={{
                                            width: '100%', padding: '0.875rem', border: '1px solid #E2E8F0',
                                            borderRadius: '10px', fontSize: '0.9375rem', resize: 'vertical',
                                            outline: 'none', boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => setShowApprovalModal(false)} style={{
                                    padding: '0.75rem 1.25rem', backgroundColor: '#F1F5F9',
                                    border: 'none', borderRadius: '10px', fontWeight: 500, cursor: 'pointer'
                                }}>Batal</button>
                                <button
                                    onClick={handleApproval}
                                    disabled={isSubmitting || (approvalType === 'reject' && !notes.trim())}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        padding: '0.75rem 1.25rem',
                                        backgroundColor: approvalType === 'approve' ? '#22C55E' : '#EF4444',
                                        color: 'white', border: 'none', borderRadius: '10px',
                                        fontWeight: 500, cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1
                                    }}
                                >
                                    {approvalType === 'approve' ? (
                                        <><CheckCircle style={{ width: '16px', height: '16px' }} /> Setujui</>
                                    ) : (
                                        <><XCircle style={{ width: '16px', height: '16px' }} /> Tolak</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Document Preview Modal */}
                {showDocPreview && (
                    <div style={{
                        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 60, padding: '1rem'
                    }}>
                        <div style={{
                            backgroundColor: 'white', borderRadius: '16px',
                            width: '100%', maxWidth: '500px', overflow: 'hidden'
                        }}>
                            <div style={{
                                padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                            }}>
                                <h3 style={{ fontWeight: 600, color: '#0F172A', margin: 0 }}>
                                    Dokumen Pendukung
                                </h3>
                                <button onClick={() => setShowDocPreview(null)} style={{
                                    padding: '0.5rem', backgroundColor: '#F1F5F9', border: 'none',
                                    borderRadius: '8px', cursor: 'pointer'
                                }}>
                                    <X style={{ width: '18px', height: '18px', color: '#64748B' }} />
                                </button>
                            </div>
                            <div style={{ padding: '2rem', textAlign: 'center' }}>
                                <div style={{
                                    width: '80px', height: '80px', backgroundColor: '#F1F5F9',
                                    borderRadius: '16px', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', margin: '0 auto 1rem'
                                }}>
                                    <FileText style={{ width: '40px', height: '40px', color: '#64748B' }} />
                                </div>
                                <h4 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0F172A', margin: '0 0 0.5rem 0' }}>
                                    {showDocPreview}
                                </h4>
                                <p style={{ color: '#64748B', fontSize: '0.875rem', margin: '0 0 1.5rem 0' }}>
                                    Dokumen ini diupload sebagai persyaratan permohonan surat.
                                </p>
                                <div style={{
                                    padding: '1rem', backgroundColor: '#FEF3C7',
                                    borderRadius: '10px', fontSize: '0.875rem', color: '#92400E'
                                }}>
                                    <strong>Mode Demo:</strong> Preview file tidak tersedia karena file tidak benar-benar diupload ke server.
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx global>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @media (max-width: 768px) {
                    div[style*="gridTemplateColumns: '1fr 320px'"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </DashboardLayout>
    );
}
