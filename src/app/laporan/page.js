'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth';
import { getReports } from '@/lib/storage';
import { formatRelativeTime, getStatusInfo, getCategoryInfo, truncateText } from '@/lib/utils';
import { User, MapPin, Clock, MessageCircle } from 'lucide-react';

export default function LaporanPage() {
    const { user, isAdmin } = useAuth();
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

    useEffect(() => {
        loadReports();
    }, []);

    useEffect(() => {
        filterReports();
    }, [reports, searchQuery, statusFilter, categoryFilter]);

    const loadReports = async () => {
        const allReports = await getReports();
        setReports(allReports);
    };

    const filterReports = () => {
        let filtered = [...reports];
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(r =>
                r.title.toLowerCase().includes(query) ||
                r.description.toLowerCase().includes(query) ||
                r.location?.toLowerCase().includes(query)
            );
        }
        if (statusFilter !== 'all') filtered = filtered.filter(r => r.status === statusFilter);
        if (categoryFilter !== 'all') filtered = filtered.filter(r => r.category === categoryFilter);
        setFilteredReports(filtered);
    };

    const statuses = [
        { value: 'all', label: 'Semua Status' },
        { value: 'baru', label: 'Baru' },
        { value: 'proses', label: 'Diproses' },
        { value: 'selesai', label: 'Selesai' },
        { value: 'ditolak', label: 'Ditolak' },
    ];

    const categories = [
        { value: 'all', label: 'Semua Kategori' },
        { value: 'infrastruktur', label: 'Infrastruktur' },
        { value: 'keamanan', label: 'Keamanan' },
        { value: 'kebersihan', label: 'Kebersihan' },
        { value: 'sosial', label: 'Sosial' },
        { value: 'lainnya', label: 'Lainnya' },
    ];

    const stats = {
        total: reports.length,
        new: reports.filter(r => r.status === 'baru').length,
        inProgress: reports.filter(r => r.status === 'proses').length,
        done: reports.filter(r => r.status === 'selesai').length,
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
                            Laporan Warga
                        </h1>
                        <p style={{ color: '#64748B', margin: '0.25rem 0 0 0', fontSize: '0.9375rem' }}>
                            {isAdmin ? 'Kelola semua laporan dari warga' : 'Lihat dan buat laporan masalah'}
                        </p>
                    </div>
                    <Link href="/laporan/buat" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#3B82F6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: 600,
                        fontSize: '0.9375rem',
                        textDecoration: 'none'
                    }}>
                        ➕ Buat Laporan
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
                        { label: 'Total Laporan', value: stats.total, color: '#3B82F6' },
                        { label: 'Baru', value: stats.new, color: '#3B82F6' },
                        { label: 'Diproses', value: stats.inProgress, color: '#EAB308' },
                        { label: 'Selesai', value: stats.done, color: '#22C55E' },
                    ].map((stat, index) => (
                        <div key={index} style={{ ...cardStyle, textAlign: 'center', padding: '1.25rem', marginBottom: 0 }}>
                            <p style={{ fontSize: '1.75rem', fontWeight: 700, color: stat.color, margin: '0 0 0.25rem 0' }}>{stat.value}</p>
                            <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>{stat.label}</p>
                        </div>
                    ))}
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
                                placeholder="Cari laporan..."
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
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            style={{ ...inputStyle, width: 'auto', minWidth: '180px', cursor: 'pointer' }}
                        >
                            {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                    </div>
                </div>

                {/* Reports List */}
                {filteredReports.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {filteredReports.map((report) => {
                            const statusInfo = getStatusInfo(report.status);
                            const categoryInfo = getCategoryInfo(report.category);

                            return (
                                <Link key={report.id} href={`/laporan/${report.id}`} style={{
                                    ...cardStyle,
                                    marginBottom: 0,
                                    textDecoration: 'none',
                                    display: 'block'
                                }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                        {/* Icon */}
                                        <div style={{
                                            width: '52px',
                                            height: '52px',
                                            backgroundColor: `${categoryInfo.color}15`,
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            fontSize: '1.5rem'
                                        }}>
                                            📋
                                        </div>

                                        {/* Content */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
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
                                                        fontWeight: 500
                                                    }}>
                                                        🔒 Anonim
                                                    </span>
                                                )}
                                            </div>

                                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0F172A', margin: '0 0 0.5rem 0' }}>
                                                {report.title}
                                            </h3>

                                            <p style={{ fontSize: '0.9375rem', color: '#64748B', margin: '0 0 0.75rem 0', lineHeight: 1.5 }}>
                                                {truncateText(report.description, 150)}
                                            </p>

                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8125rem', color: '#94A3B8' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                                    <User style={{ width: '14px', height: '14px' }} /> {report.isAnonymous ? 'Anonim' : report.userName}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                                    <MapPin style={{ width: '14px', height: '14px' }} /> {report.location || '-'}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                                    <Clock style={{ width: '14px', height: '14px' }} /> {formatRelativeTime(report.createdAt)}
                                                </span>
                                                {report.responses?.length > 0 && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#3B82F6' }}>
                                                        <MessageCircle style={{ width: '14px', height: '14px' }} /> {report.responses.length} respon
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* ID Badge */}
                                        <div style={{ flexShrink: 0 }}>
                                            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>#{report.id}</span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0F172A', margin: '0 0 0.5rem 0' }}>
                            Tidak ada laporan
                        </h3>
                        <p style={{ color: '#64748B', margin: '0 0 1.5rem 0' }}>
                            {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                                ? 'Coba ubah filter pencarian'
                                : 'Belum ada laporan yang dibuat'}
                        </p>
                        {!searchQuery && statusFilter === 'all' && categoryFilter === 'all' && (
                            <Link href="/laporan/buat" style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#3B82F6',
                                color: 'white',
                                borderRadius: '10px',
                                fontWeight: 600,
                                textDecoration: 'none'
                            }}>
                                ➕ Buat Laporan Pertama
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
