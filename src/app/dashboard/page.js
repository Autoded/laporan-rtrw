'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth';
import { getReports, getFinances, getDocuments } from '@/lib/storage';
import { formatCurrency, formatRelativeTime, getStatusInfo, getCategoryInfo, getRoleInfo } from '@/lib/utils';
import {
    FileText, Wallet, FileCheck, AlertTriangle, Clock, Plus,
    Settings, TrendingUp, TrendingDown, ChevronRight, ClipboardList
} from 'lucide-react';

export default function DashboardPage() {
    const { user, isAdmin, isKetuaRT } = useAuth();
    const [stats, setStats] = useState({
        reports: { total: 0, new: 0, inProgress: 0, done: 0 },
        finances: { balance: 0, income: 0, expense: 0 },
        documents: { total: 0, pending: 0, done: 0 },
    });
    const [recentReports, setRecentReports] = useState([]);
    const [recentDocuments, setRecentDocuments] = useState([]);

    useEffect(() => {
        loadDashboardData();
    }, [user]);

    const loadDashboardData = async () => {
        const reports = await getReports();
        const finances = await getFinances();
        const documents = await getDocuments();

        const reportStats = {
            total: reports.length,
            new: reports.filter(r => r.status === 'baru').length,
            inProgress: reports.filter(r => r.status === 'proses').length,
            done: reports.filter(r => r.status === 'selesai').length,
        };

        const totalIncome = finances.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0);
        const totalExpense = finances.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0);
        const financeStats = { balance: totalIncome - totalExpense, income: totalIncome, expense: totalExpense };

        const userDocs = user?.role === 'warga' ? documents.filter(d => d.requesterId === user.id) : documents;
        const documentStats = {
            total: userDocs.length,
            pending: userDocs.filter(d => ['diajukan', 'proses'].includes(d.status)).length,
            done: userDocs.filter(d => d.status === 'selesai').length,
        };

        setStats({ reports: reportStats, finances: financeStats, documents: documentStats });
        setRecentReports(reports.slice(0, 5));
        const userDocsList = user?.role === 'warga' ? documents.filter(d => d.requesterId === user.id) : documents;
        setRecentDocuments(userDocsList.slice(0, 3));
    };

    const cardStyle = {
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '1.5rem'
    };

    const iconStyle = { width: '24px', height: '24px' };

    const statCards = [
        { Icon: ClipboardList, label: 'Total Laporan', value: stats.reports.total, subValue: `${stats.reports.new} baru`, color: '#3B82F6', href: '/laporan' },
        { Icon: Wallet, label: 'Saldo Kas', value: formatCurrency(stats.finances.balance), subValue: stats.finances.balance >= 0 ? 'Positif' : 'Negatif', color: '#22C55E', href: '/keuangan' },
        { Icon: FileCheck, label: 'Dokumen', value: stats.documents.total, subValue: `${stats.documents.pending} pending`, color: '#8B5CF6', href: '/dokumen' },
        { Icon: isAdmin ? AlertTriangle : Clock, label: isAdmin ? 'Perlu Tindakan' : 'Menunggu', value: isAdmin ? stats.reports.new : stats.documents.pending, subValue: isAdmin ? 'laporan baru' : 'dokumen', color: '#EAB308', href: isAdmin ? '/laporan' : '/dokumen' },
    ];

    const quickActions = user?.role === 'warga' ? [
        { Icon: Plus, label: 'Buat Laporan', href: '/laporan/buat', color: '#3B82F6' },
        { Icon: FileText, label: 'Ajukan Surat', href: '/dokumen/ajukan', color: '#8B5CF6' },
        { Icon: Wallet, label: 'Lihat Keuangan', href: '/keuangan', color: '#22C55E' },
    ] : [
        { Icon: ClipboardList, label: 'Kelola Laporan', href: '/laporan', color: '#3B82F6' },
        { Icon: Wallet, label: 'Kelola Keuangan', href: '/keuangan/kelola', color: '#22C55E' },
        { Icon: FileText, label: 'Permohonan Surat', href: '/dokumen', color: '#8B5CF6' },
    ];

    return (
        <DashboardLayout>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Welcome Section */}
                <div style={{
                    background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                    borderRadius: '20px',
                    padding: '2rem',
                    color: 'white',
                    marginBottom: '1.5rem'
                }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                        <div>
                            <p style={{ opacity: 0.8, fontSize: '0.9375rem', margin: 0 }}>Selamat datang kembali,</p>
                            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.5rem 0 0 0' }}>{user?.name}</h1>
                            <p style={{ opacity: 0.8, fontSize: '0.9375rem', margin: '0.5rem 0 0 0' }}>
                                {getRoleInfo(user?.role)?.label} • {user?.address}
                            </p>
                        </div>

                    </div>
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    {statCards.map((stat, index) => {
                        const StatIcon = stat.Icon;
                        return (
                            <Link key={index} href={stat.href} style={{ ...cardStyle, textDecoration: 'none', display: 'block' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        backgroundColor: `${stat.color}15`,
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <StatIcon style={{ ...iconStyle, color: stat.color }} />
                                    </div>
                                </div>
                                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.25rem 0' }}>{stat.value}</p>
                                <p style={{ fontSize: '0.9375rem', color: '#64748B', margin: '0 0 0.25rem 0' }}>{stat.label}</p>
                                <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: 0 }}>{stat.subValue}</p>
                            </Link>
                        );
                    })}
                </div>

                {/* Quick Actions - Mobile */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0F172A', marginBottom: '1rem' }}>Aksi Cepat</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        {quickActions.map((action, index) => {
                            const ActionIcon = action.Icon;
                            return (
                                <Link key={index} href={action.href} style={{ ...cardStyle, textAlign: 'center', textDecoration: 'none' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        backgroundColor: `${action.color}15`,
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 0.75rem'
                                    }}>
                                        <ActionIcon style={{ ...iconStyle, color: action.color }} />
                                    </div>
                                    <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0F172A', margin: 0 }}>{action.label}</p>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Content Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
                    {/* Recent Reports */}
                    <div style={cardStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0F172A', margin: 0 }}>Laporan Terbaru</h3>
                        </div>
                        {recentReports.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {recentReports.map(report => {
                                    const statusInfo = getStatusInfo(report.status);
                                    const categoryInfo = getCategoryInfo(report.category);
                                    return (
                                        <Link key={report.id} href={`/laporan/${report.id}`} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            padding: '0.875rem',
                                            backgroundColor: '#F8FAFC',
                                            borderRadius: '10px',
                                            textDecoration: 'none'
                                        }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                backgroundColor: `${categoryInfo.color}20`,
                                                borderRadius: '10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <FileText style={{ width: '20px', height: '20px', color: categoryInfo.color }} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: '#0F172A', margin: '0 0 0.25rem 0' }}>
                                                    {report.title}
                                                </p>
                                                <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: 0 }}>
                                                    {categoryInfo.label} • {formatRelativeTime(report.createdAt)}
                                                </p>
                                            </div>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                backgroundColor: `${statusInfo.color}20`,
                                                color: statusInfo.color,
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                fontWeight: 500
                                            }}>
                                                {statusInfo.label}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <FileText style={{ width: '48px', height: '48px', color: '#CBD5E1', margin: '0 auto 0.75rem' }} />
                                <p style={{ color: '#94A3B8', margin: 0 }}>Belum ada laporan</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Finance Summary */}
                        <div style={cardStyle}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0F172A', margin: '0 0 1rem 0' }}>Ringkasan Keuangan</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem', backgroundColor: '#F0FDF4', borderRadius: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <TrendingUp style={{ width: '20px', height: '20px', color: '#22C55E' }} />
                                        <span style={{ fontSize: '0.875rem', color: '#64748B' }}>Pemasukan</span>
                                    </div>
                                    <span style={{ fontWeight: 600, color: '#22C55E' }}>{formatCurrency(stats.finances.income)}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem', backgroundColor: '#FEF2F2', borderRadius: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <TrendingDown style={{ width: '20px', height: '20px', color: '#EF4444' }} />
                                        <span style={{ fontSize: '0.875rem', color: '#64748B' }}>Pengeluaran</span>
                                    </div>
                                    <span style={{ fontWeight: 600, color: '#EF4444' }}>{formatCurrency(stats.finances.expense)}</span>
                                </div>
                                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '0.875rem', color: '#64748B' }}>Saldo</span>
                                        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A' }}>{formatCurrency(stats.finances.balance)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @media (max-width: 768px) {
                    div[style*="gridTemplateColumns: '2fr 1fr'"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </DashboardLayout>
    );
}
