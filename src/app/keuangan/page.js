'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth';
import { getFinances } from '@/lib/storage';
import { formatCurrency, formatDate, getCategoryInfo } from '@/lib/utils';
import { Settings, Download, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function KeuanganPage() {
    const { isAdmin } = useAuth();
    const [finances, setFinances] = useState([]);
    const [stats, setStats] = useState({ balance: 0, income: 0, expense: 0 });

    useEffect(() => {
        loadFinances();
    }, []);

    const loadFinances = async () => {
        const data = await getFinances();
        setFinances(data);
        calculateStats(data);
    };

    const calculateStats = (data) => {
        const totalIncome = data.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0);
        const totalExpense = data.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0);
        setStats({ balance: totalIncome - totalExpense, income: totalIncome, expense: totalExpense });
    };

    const handleExport = () => {
        if (finances.length === 0) {
            alert('Tidak ada data untuk di-export');
            return;
        }

        // Sort all by date (oldest first for balance calculation)
        const allSorted = [...finances].sort((a, b) => new Date(a.date) - new Date(b.date));

        // Create CSV with proper formatting (semicolon delimiter for Excel)
        let csv = '';

        // Title
        csv += 'LAPORAN KEUANGAN RT 01 / RW 05\n';
        csv += 'Tanggal Export;' + formatDate(new Date(), { day: 'numeric', month: 'long', year: 'numeric' }) + '\n';
        csv += '\n';

        // Summary section
        csv += 'RINGKASAN KEUANGAN\n';
        csv += 'Total Pemasukan;Rp ' + stats.income.toLocaleString('id-ID') + '\n';
        csv += 'Total Pengeluaran;Rp ' + stats.expense.toLocaleString('id-ID') + '\n';
        csv += 'Saldo Akhir;Rp ' + stats.balance.toLocaleString('id-ID') + '\n';
        csv += '\n';

        // Transaction details header
        csv += 'DETAIL TRANSAKSI\n';
        csv += 'No;Tanggal;Tipe;Kategori;Keterangan;Debit (Masuk);Kredit (Keluar);Saldo\n';

        // Calculate running balance and add rows
        let runningBalance = 0;

        allSorted.forEach((f, index) => {
            if (f.type === 'income') {
                runningBalance += f.amount;
            } else {
                runningBalance -= f.amount;
            }

            const debit = f.type === 'income' ? 'Rp ' + f.amount.toLocaleString('id-ID') : '-';
            const kredit = f.type === 'expense' ? 'Rp ' + f.amount.toLocaleString('id-ID') : '-';

            csv += (index + 1) + ';';
            csv += formatDate(f.date, { day: 'numeric', month: 'short', year: 'numeric' }) + ';';
            csv += (f.type === 'income' ? 'Pemasukan' : 'Pengeluaran') + ';';
            csv += getCategoryInfo(f.category).label + ';';
            csv += f.description + ';';
            csv += debit + ';';
            csv += kredit + ';';
            csv += 'Rp ' + runningBalance.toLocaleString('id-ID') + '\n';
        });

        // Create and download file
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'laporan-keuangan-' + new Date().toISOString().split('T')[0] + '.csv';
        link.click();
    };

    const getMonthlyData = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentYear = new Date().getFullYear();
        const incomeByMonth = new Array(12).fill(0);
        const expenseByMonth = new Array(12).fill(0);

        finances.forEach(f => {
            const date = new Date(f.date);
            if (date.getFullYear() === currentYear) {
                const month = date.getMonth();
                if (f.type === 'income') incomeByMonth[month] += f.amount;
                else expenseByMonth[month] += f.amount;
            }
        });
        return { months, incomeByMonth, expenseByMonth };
    };

    const getExpenseByCategory = () => {
        const categoryTotals = {};
        finances.filter(f => f.type === 'expense').forEach(f => {
            if (!categoryTotals[f.category]) categoryTotals[f.category] = 0;
            categoryTotals[f.category] += f.amount;
        });
        return categoryTotals;
    };

    const { months, incomeByMonth, expenseByMonth } = getMonthlyData();
    const expenseByCategory = getExpenseByCategory();

    const barChartData = {
        labels: months,
        datasets: [
            { label: 'Pemasukan', data: incomeByMonth, backgroundColor: 'rgba(34, 197, 94, 0.8)', borderRadius: 4 },
            { label: 'Pengeluaran', data: expenseByMonth, backgroundColor: 'rgba(239, 68, 68, 0.8)', borderRadius: 4 },
        ],
    };

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } },
        scales: { y: { beginAtZero: true, ticks: { callback: (value) => formatCurrency(value).replace('Rp', '') } } },
    };

    const expenseCategories = Object.keys(expenseByCategory);
    const expenseValues = Object.values(expenseByCategory);
    const categoryColors = expenseCategories.map(cat => getCategoryInfo(cat).color);

    const doughnutData = {
        labels: expenseCategories.map(cat => getCategoryInfo(cat).label),
        datasets: [{
            data: expenseValues,
            backgroundColor: categoryColors.map(c => `${c}CC`),
            borderColor: categoryColors,
            borderWidth: 2,
        }],
    };

    const doughnutOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } };

    const getBalanceHistory = () => {
        const sortedFinances = [...finances].sort((a, b) => new Date(a.date) - new Date(b.date));
        let balance = 0;
        const balanceHistory = [];
        const labels = [];
        sortedFinances.forEach(f => {
            balance += f.type === 'income' ? f.amount : -f.amount;
            balanceHistory.push(balance);
            labels.push(formatDate(f.date, { day: 'numeric', month: 'short' }));
        });
        return { labels, balanceHistory };
    };

    const { labels: balanceLabels, balanceHistory } = getBalanceHistory();

    const lineChartData = {
        labels: balanceLabels,
        datasets: [{
            label: 'Saldo',
            data: balanceHistory,
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
        }],
    };

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { ticks: { callback: (value) => formatCurrency(value).replace('Rp', '') } } },
    };

    const recentTransactions = [...finances].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

    const cardStyle = {
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '1.5rem'
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
                            Laporan Keuangan
                        </h1>
                        <p style={{ color: '#64748B', margin: '0.25rem 0 0 0', fontSize: '0.9375rem' }}>
                            Transparansi keuangan RT/RW untuk semua warga
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {isAdmin && (
                            <Link href="/keuangan/kelola" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#3B82F6',
                                color: 'white',
                                borderRadius: '10px',
                                fontWeight: 600,
                                fontSize: '0.9375rem',
                                textDecoration: 'none'
                            }}>
                                <Settings style={{ width: '18px', height: '18px' }} /> Kelola Keuangan
                            </Link>
                        )}
                        <button
                            onClick={handleExport}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#F1F5F9',
                                color: '#475569',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: 600,
                                fontSize: '0.9375rem',
                                cursor: 'pointer'
                            }}>
                            <Download style={{ width: '18px', height: '18px' }} /> Export
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1.5rem'
                }}>
                    {/* Balance Card */}
                    <div style={{
                        background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        color: 'white'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ opacity: 0.8, fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>Total Saldo</p>
                                <p style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0 }}>{formatCurrency(stats.balance)}</p>
                            </div>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Wallet style={{ width: '24px', height: '24px', color: 'white' }} />
                            </div>
                        </div>
                    </div>

                    {/* Income Card */}
                    <div style={cardStyle}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ color: '#64748B', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>Total Pemasukan</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22C55E', margin: 0 }}>{formatCurrency(stats.income)}</p>
                            </div>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                backgroundColor: '#DCFCE7',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <TrendingUp style={{ width: '24px', height: '24px', color: '#22C55E' }} />
                            </div>
                        </div>
                    </div>

                    {/* Expense Card */}
                    <div style={cardStyle}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ color: '#64748B', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>Total Pengeluaran</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#EF4444', margin: 0 }}>{formatCurrency(stats.expense)}</p>
                            </div>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                backgroundColor: '#FEE2E2',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <TrendingDown style={{ width: '24px', height: '24px', color: '#EF4444' }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    {/* Bar Chart */}
                    <div style={cardStyle}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0F172A', margin: '0 0 1rem 0' }}>
                            Pemasukan vs Pengeluaran Bulanan
                        </h2>
                        <div style={{ height: '320px' }}>
                            <Bar data={barChartData} options={barChartOptions} />
                        </div>
                    </div>

                    {/* Doughnut Chart */}
                    <div style={cardStyle}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0F172A', margin: '0 0 1rem 0' }}>
                            Pengeluaran per Kategori
                        </h2>
                        <div style={{ height: '320px' }}>
                            {expenseCategories.length > 0 ? (
                                <Doughnut data={doughnutData} options={doughnutOptions} />
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8' }}>
                                    Belum ada data pengeluaran
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Balance Trend */}
                <div style={cardStyle}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0F172A', margin: '0 0 1rem 0' }}>
                        Trend Saldo
                    </h2>
                    <div style={{ height: '256px' }}>
                        {balanceHistory.length > 0 ? (
                            <Line data={lineChartData} options={lineChartOptions} />
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8' }}>
                                Belum ada data transaksi
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Transactions */}
                <div style={{ ...cardStyle, overflow: 'hidden', padding: 0 }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0F172A', margin: 0 }}>Transaksi Terakhir</h2>
                        {isAdmin && (
                            <Link href="/keuangan/kelola" style={{ color: '#3B82F6', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                Lihat Semua →
                            </Link>
                        )}
                    </div>

                    {recentTransactions.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#F8FAFC' }}>
                                        <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>Tanggal</th>
                                        <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>Keterangan</th>
                                        <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>Kategori</th>
                                        <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>Jumlah</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentTransactions.map((tx) => {
                                        const categoryInfo = getCategoryInfo(tx.category);
                                        return (
                                            <tr key={tx.id} style={{ borderTop: '1px solid #E2E8F0' }}>
                                                <td style={{ padding: '1rem 1.5rem', color: '#64748B', fontSize: '0.9375rem' }}>
                                                    {formatDate(tx.date, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td style={{ padding: '1rem 1.5rem' }}>
                                                    <p style={{ fontWeight: 500, color: '#0F172A', margin: 0, fontSize: '0.9375rem' }}>{tx.description}</p>
                                                </td>
                                                <td style={{ padding: '1rem 1.5rem' }}>
                                                    <span style={{
                                                        display: 'inline-block',
                                                        padding: '0.375rem 0.75rem',
                                                        backgroundColor: '#F1F5F9',
                                                        borderRadius: '6px',
                                                        fontSize: '0.8125rem',
                                                        color: '#475569'
                                                    }}>
                                                        {categoryInfo.label}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                                    <span style={{
                                                        fontWeight: 600,
                                                        fontSize: '0.9375rem',
                                                        color: tx.type === 'income' ? '#22C55E' : '#EF4444'
                                                    }}>
                                                        {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                            Belum ada transaksi
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                @media (max-width: 768px) {
                    div[style*="gridTemplateColumns: 'repeat(2, 1fr)'"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </DashboardLayout>
    );
}
