'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth';
import { getDocuments } from '@/lib/storage';
import { formatRelativeTime, getStatusInfo, getDocumentTypeInfo } from '@/lib/utils';
import { FileText, Clock, CheckCircle, XCircle, User, ChevronRight } from 'lucide-react';

export default function DokumenPage() {
    const { user, isAdmin } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [filteredDocs, setFilteredDocs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    useEffect(() => {
        loadDocuments();
    }, [user]);

    useEffect(() => {
        filterDocuments();
    }, [documents, searchQuery, statusFilter, typeFilter]);

    const loadDocuments = async () => {
        const allDocs = await getDocuments();
        const userDocs = user?.role === 'warga' ? allDocs.filter(d => d.requesterId === user?.id) : allDocs;
        setDocuments(userDocs);
    };

    const filterDocuments = () => {
        let filtered = [...documents];
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(d =>
                d.purpose?.toLowerCase().includes(query) ||
                d.requesterName?.toLowerCase().includes(query) ||
                d.id.toLowerCase().includes(query)
            );
        }
        if (statusFilter !== 'all') filtered = filtered.filter(d => d.status === statusFilter);
        if (typeFilter !== 'all') filtered = filtered.filter(d => d.type === typeFilter);
        setFilteredDocs(filtered);
    };

    const statuses = [
        { value: 'all', label: 'Semua Status' },
        { value: 'diajukan', label: 'Diajukan' },
        { value: 'proses', label: 'Diproses' },
        { value: 'selesai', label: 'Selesai' },
        { value: 'ditolak', label: 'Ditolak' },
    ];

    const documentTypes = [
        { value: 'all', label: 'Semua Jenis' },
        { value: 'surat_pengantar', label: 'Surat Pengantar' },
        { value: 'surat_domisili', label: 'Surat Domisili' },
        { value: 'surat_tidak_mampu', label: 'Surat Tidak Mampu' },
        { value: 'surat_izin_keramaian', label: 'Izin Keramaian' },
        { value: 'surat_usaha', label: 'Surat Usaha' },
        { value: 'lainnya', label: 'Lainnya' },
    ];

    const stats = {
        total: documents.length,
        pending: documents.filter(d => ['diajukan', 'proses'].includes(d.status)).length,
        done: documents.filter(d => d.status === 'selesai').length,
        rejected: documents.filter(d => d.status === 'ditolak').length,
    };

    const cardStyle = {
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '1.5rem',
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
        boxSizing: 'border-box'
    };

    return (
        <DashboardLayout>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    marginBottom: '2rem'
                }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                            {user?.role === 'warga' ? 'Dokumen Saya' : 'Permohonan Dokumen'}
                        </h1>
                        <p style={{ color: '#64748B', margin: '0.25rem 0 0 0', fontSize: '0.9375rem' }}>
                            {user?.role === 'warga' ? 'Kelola permohonan surat dan dokumen Anda' : 'Proses permohonan surat warga'}
                        </p>
                    </div>
                    <Link href="/dokumen/ajukan" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#8B5CF6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: 600,
                        fontSize: '0.9375rem',
                        textDecoration: 'none'
                    }}>
                        ➕ Ajukan Dokumen
                    </Link>
                </div>

                {/* Stats */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1.5rem'
                }}>
                    {[
                        { label: 'Total', value: stats.total, color: '#8B5CF6', Icon: FileText },
                        { label: 'Pending', value: stats.pending, color: '#EAB308', Icon: Clock },
                        { label: 'Selesai', value: stats.done, color: '#22C55E', Icon: CheckCircle },
                        { label: 'Ditolak', value: stats.rejected, color: '#EF4444', Icon: XCircle },
                    ].map((stat, index) => {
                        const StatIcon = stat.Icon;
                        return (
                            <div key={index} style={{ ...cardStyle, textAlign: 'center', padding: '1.25rem', marginBottom: 0 }}>
                                <StatIcon style={{ width: '24px', height: '24px', color: stat.color, margin: '0 auto 0.5rem' }} />
                                <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.25rem 0' }}>{stat.value}</p>
                                <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>{stat.label}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Search and Filters */}
                <div style={cardStyle}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ flex: '1 1 300px', position: 'relative' }}>
                            <div style={{
                                position: 'absolute',
                                left: '14px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                display: 'flex',
                                alignItems: 'center',
                                pointerEvents: 'none'
                            }}>
                                🔍
                            </div>
                            <input
                                type="text"
                                placeholder="Cari dokumen..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ ...inputStyle, paddingLeft: '2.75rem' }}
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ ...inputStyle, width: 'auto', minWidth: '160px', cursor: 'pointer' }}
                        >
                            {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            style={{ ...inputStyle, width: 'auto', minWidth: '180px', cursor: 'pointer' }}
                        >
                            {documentTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                    </div>
                </div>

                {/* Document List */}
                {filteredDocs.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {filteredDocs
                            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                            .map((doc) => {
                                const statusInfo = getStatusInfo(doc.status);
                                const typeInfo = getDocumentTypeInfo(doc.type);

                                return (
                                    <Link key={doc.id} href={`/dokumen/${doc.id}`} style={{
                                        ...cardStyle,
                                        marginBottom: 0,
                                        textDecoration: 'none',
                                        display: 'block'
                                    }}>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            {/* Icon */}
                                            <div style={{
                                                width: '52px',
                                                height: '52px',
                                                backgroundColor: '#F3E8FF',
                                                borderRadius: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                <FileText style={{ width: '24px', height: '24px', color: '#8B5CF6' }} />
                                            </div>

                                            {/* Content */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                                                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>#{doc.id}</span>
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

                                                <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: '#0F172A', margin: '0 0 0.375rem 0' }}>
                                                    {typeInfo.label}
                                                </h3>

                                                <p style={{ fontSize: '0.9375rem', color: '#64748B', margin: '0 0 0.5rem 0' }}>
                                                    {doc.purpose}
                                                </p>

                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.75rem', color: '#94A3B8' }}>
                                                    {isAdmin && (
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                            <User style={{ width: '12px', height: '12px' }} /> {doc.requesterName}
                                                        </span>
                                                    )}
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <Clock style={{ width: '12px', height: '12px' }} /> {formatRelativeTime(doc.createdAt)}
                                                    </span>
                                                    {doc.approvedAt && (
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#22C55E' }}>
                                                            <CheckCircle style={{ width: '12px', height: '12px' }} /> Disetujui {formatRelativeTime(doc.approvedAt)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Arrow */}
                                            <ChevronRight style={{ width: '20px', height: '20px', color: '#94A3B8', flexShrink: 0 }} />
                                        </div>
                                    </Link>
                                );
                            })}
                    </div>
                ) : (
                    <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}>
                        <FileText style={{ width: '48px', height: '48px', color: '#CBD5E1', margin: '0 auto 1rem' }} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0F172A', margin: '0 0 0.5rem 0' }}>
                            Tidak ada dokumen
                        </h3>
                        <p style={{ color: '#64748B', margin: '0 0 1.5rem 0' }}>
                            {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                                ? 'Coba ubah filter pencarian'
                                : 'Belum ada permohonan dokumen'}
                        </p>
                        {!searchQuery && statusFilter === 'all' && typeFilter === 'all' && (
                            <Link href="/dokumen/ajukan" style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#8B5CF6',
                                color: 'white',
                                borderRadius: '10px',
                                fontWeight: 600,
                                textDecoration: 'none'
                            }}>
                                ➕ Ajukan Dokumen
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
