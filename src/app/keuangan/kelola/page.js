'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth';
import { getFinances, addFinance, updateFinance, deleteFinance, generateId } from '@/lib/storage';
import { formatCurrency, formatDate, getCategoryInfo } from '@/lib/utils';

export default function KelolaKeuanganPage() {
    const { user, isAdmin } = useAuth();
    const router = useRouter();

    const [finances, setFinances] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const [formData, setFormData] = useState({
        type: 'income',
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
    });

    const incomeCategories = [
        { value: 'iuran', label: 'Iuran Bulanan' },
        { value: 'sumbangan', label: 'Sumbangan' },
        { value: 'lainnya', label: 'Lainnya' },
    ];

    const expenseCategories = [
        { value: 'infrastruktur', label: 'Infrastruktur' },
        { value: 'kebersihan', label: 'Kebersihan' },
        { value: 'keamanan', label: 'Keamanan' },
        { value: 'acara', label: 'Acara' },
        { value: 'lainnya', label: 'Lainnya' },
    ];

    useEffect(() => {
        if (!isAdmin) {
            router.push('/keuangan');
            return;
        }
        loadFinances();
    }, [isAdmin]);

    const loadFinances = () => {
        const data = getFinances();
        setFinances(data);
    };

    const filteredFinances = finances.filter(f => {
        const matchesSearch = f.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'all' || f.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const stats = {
        balance: finances.reduce((sum, f) =>
            f.type === 'income' ? sum + f.amount : sum - f.amount, 0
        ),
        income: finances.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0),
        expense: finances.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0),
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                type: item.type,
                category: item.category,
                amount: item.amount.toString(),
                description: item.description,
                date: item.date.split('T')[0],
            });
        } else {
            setEditingItem(null);
            setFormData({
                type: 'income',
                category: '',
                amount: '',
                description: '',
                date: new Date().toISOString().split('T')[0],
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingItem(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            if (name === 'type') {
                newData.category = '';
            }
            return newData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        await new Promise(resolve => setTimeout(resolve, 500));

        const financeData = {
            type: formData.type,
            category: formData.category,
            amount: parseInt(formData.amount),
            description: formData.description,
            date: new Date(formData.date).toISOString(),
            createdBy: user.id,
            createdByName: user.name,
        };

        if (editingItem) {
            updateFinance(editingItem.id, financeData);
        } else {
            addFinance({
                id: generateId('FIN'),
                ...financeData,
            });
        }

        loadFinances();
        handleCloseModal();
        setIsSubmitting(false);
    };

    const handleDelete = (id) => {
        deleteFinance(id);
        loadFinances();
        setDeleteConfirm(null);
    };

    const currentCategories = formData.type === 'income' ? incomeCategories : expenseCategories;

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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Link href="/keuangan" style={{
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
                                Kelola Keuangan
                            </h1>
                            <p style={{ color: '#64748B', margin: '0.25rem 0 0 0', fontSize: '0.9375rem' }}>
                                Catat pemasukan dan pengeluaran RT/RW
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        style={{
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
                            cursor: 'pointer'
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14" /><path d="M12 5v14" />
                        </svg>
                        Tambah Transaksi
                    </button>
                </div>

                {/* Stats Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem'
                }}>
                    {/* Balance */}
                    <div style={{
                        ...cardStyle,
                        textAlign: 'center',
                        padding: '1.5rem',
                        marginBottom: 0
                    }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            backgroundColor: '#DBEAFE',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem'
                        }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                            </svg>
                        </div>
                        <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.25rem 0' }}>
                            {formatCurrency(stats.balance)}
                        </p>
                        <p style={{ fontSize: '0.9375rem', color: '#64748B', margin: 0 }}>Saldo</p>
                    </div>

                    {/* Income */}
                    <div style={{
                        ...cardStyle,
                        textAlign: 'center',
                        padding: '1.5rem',
                        marginBottom: 0
                    }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            backgroundColor: '#DCFCE7',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem'
                        }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
                            </svg>
                        </div>
                        <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22C55E', margin: '0 0 0.25rem 0' }}>
                            {formatCurrency(stats.income)}
                        </p>
                        <p style={{ fontSize: '0.9375rem', color: '#64748B', margin: 0 }}>Pemasukan</p>
                    </div>

                    {/* Expense */}
                    <div style={{
                        ...cardStyle,
                        textAlign: 'center',
                        padding: '1.5rem',
                        marginBottom: 0
                    }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            backgroundColor: '#FEE2E2',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem'
                        }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" /><polyline points="16 17 22 17 22 11" />
                            </svg>
                        </div>
                        <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#EF4444', margin: '0 0 0.25rem 0' }}>
                            {formatCurrency(stats.expense)}
                        </p>
                        <p style={{ fontSize: '0.9375rem', color: '#64748B', margin: 0 }}>Pengeluaran</p>
                    </div>
                </div>

                {/* Filters */}
                <div style={cardStyle}>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        alignItems: 'center'
                    }}>
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
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Cari transaksi..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ ...inputStyle, paddingLeft: '2.75rem' }}
                            />
                        </div>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            style={{ ...inputStyle, width: 'auto', minWidth: '180px', cursor: 'pointer' }}
                        >
                            <option value="all">Semua Tipe</option>
                            <option value="income">Pemasukan</option>
                            <option value="expense">Pengeluaran</option>
                        </select>
                    </div>
                </div>

                {/* Transaction Table */}
                <div style={{ ...cardStyle, overflow: 'hidden', padding: 0 }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#F8FAFC' }}>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>Tanggal</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>Keterangan</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>Kategori</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>Tipe</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>Jumlah</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFinances.length > 0 ? (
                                    filteredFinances
                                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                                        .map((tx) => {
                                            const categoryInfo = getCategoryInfo(tx.category);
                                            return (
                                                <tr key={tx.id} style={{ borderTop: '1px solid #E2E8F0' }}>
                                                    <td style={{ padding: '1rem 1.5rem', color: '#64748B', fontSize: '0.9375rem' }}>
                                                        {formatDate(tx.date, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </td>
                                                    <td style={{ padding: '1rem 1.5rem' }}>
                                                        <p style={{ fontWeight: 500, color: '#0F172A', margin: 0, fontSize: '0.9375rem' }}>
                                                            {tx.description}
                                                        </p>
                                                        <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: '0.25rem 0 0 0' }}>
                                                            oleh {tx.createdByName}
                                                        </p>
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
                                                    <td style={{ padding: '1rem 1.5rem' }}>
                                                        <span style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '0.375rem',
                                                            color: tx.type === 'income' ? '#22C55E' : '#EF4444',
                                                            fontSize: '0.9375rem'
                                                        }}>
                                                            {tx.type === 'income' ? '↑ Masuk' : '↓ Keluar'}
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
                                                    <td style={{ padding: '1rem 1.5rem' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                            <button
                                                                onClick={() => handleOpenModal(tx)}
                                                                style={{
                                                                    padding: '0.5rem',
                                                                    borderRadius: '8px',
                                                                    border: 'none',
                                                                    backgroundColor: 'transparent',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteConfirm(tx.id)}
                                                                style={{
                                                                    padding: '0.5rem',
                                                                    borderRadius: '8px',
                                                                    border: 'none',
                                                                    backgroundColor: 'transparent',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
                                            {searchQuery || typeFilter !== 'all'
                                                ? 'Tidak ada transaksi yang cocok'
                                                : 'Belum ada transaksi'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add/Edit Modal */}
                {showModal && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 100,
                        padding: '1rem'
                    }} onClick={handleCloseModal}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '20px',
                            maxWidth: '480px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflow: 'auto'
                        }} onClick={(e) => e.stopPropagation()}>
                            <div style={{
                                padding: '1.5rem',
                                borderBottom: '1px solid #E2E8F0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0F172A', margin: 0 }}>
                                    {editingItem ? 'Edit Transaksi' : 'Tambah Transaksi'}
                                </h3>
                                <button onClick={handleCloseModal} style={{
                                    padding: '0.5rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    cursor: 'pointer'
                                }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div style={{ padding: '1.5rem' }}>
                                    {/* Type Selection */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <label style={{
                                            padding: '1.25rem',
                                            border: `2px solid ${formData.type === 'income' ? '#22C55E' : '#E2E8F0'}`,
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            textAlign: 'center',
                                            backgroundColor: formData.type === 'income' ? '#F0FDF4' : 'white'
                                        }}>
                                            <input
                                                type="radio"
                                                name="type"
                                                value="income"
                                                checked={formData.type === 'income'}
                                                onChange={handleChange}
                                                style={{ display: 'none' }}
                                            />
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                backgroundColor: formData.type === 'income' ? '#DCFCE7' : '#F1F5F9',
                                                borderRadius: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                margin: '0 auto 0.75rem'
                                            }}>
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={formData.type === 'income' ? '#22C55E' : '#94A3B8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" />
                                                </svg>
                                            </div>
                                            <p style={{ margin: 0, fontWeight: 600, color: formData.type === 'income' ? '#22C55E' : '#64748B' }}>Pemasukan</p>
                                        </label>
                                        <label style={{
                                            padding: '1.25rem',
                                            border: `2px solid ${formData.type === 'expense' ? '#EF4444' : '#E2E8F0'}`,
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            textAlign: 'center',
                                            backgroundColor: formData.type === 'expense' ? '#FEF2F2' : 'white'
                                        }}>
                                            <input
                                                type="radio"
                                                name="type"
                                                value="expense"
                                                checked={formData.type === 'expense'}
                                                onChange={handleChange}
                                                style={{ display: 'none' }}
                                            />
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                backgroundColor: formData.type === 'expense' ? '#FEE2E2' : '#F1F5F9',
                                                borderRadius: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                margin: '0 auto 0.75rem'
                                            }}>
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={formData.type === 'expense' ? '#EF4444' : '#94A3B8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <circle cx="12" cy="12" r="10" /><path d="M8 12h8" />
                                                </svg>
                                            </div>
                                            <p style={{ margin: 0, fontWeight: 600, color: formData.type === 'expense' ? '#EF4444' : '#64748B' }}>Pengeluaran</p>
                                        </label>
                                    </div>

                                    {/* Form Fields */}
                                    <div style={{ marginBottom: '1.25rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                                            Kategori
                                        </label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            style={inputStyle}
                                            required
                                        >
                                            <option value="">Pilih Kategori</option>
                                            {currentCategories.map(cat => (
                                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={{ marginBottom: '1.25rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                                            Jumlah (Rp)
                                        </label>
                                        <input
                                            type="number"
                                            name="amount"
                                            value={formData.amount}
                                            onChange={handleChange}
                                            placeholder="0"
                                            style={inputStyle}
                                            min="0"
                                            required
                                        />
                                    </div>

                                    <div style={{ marginBottom: '1.25rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                                            Keterangan
                                        </label>
                                        <input
                                            type="text"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Keterangan transaksi..."
                                            style={inputStyle}
                                            required
                                        />
                                    </div>

                                    <div style={{ marginBottom: '1.25rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                                            Tanggal
                                        </label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleChange}
                                            style={inputStyle}
                                            required
                                        />
                                    </div>
                                </div>

                                <div style={{
                                    padding: '1rem 1.5rem',
                                    borderTop: '1px solid #E2E8F0',
                                    display: 'flex',
                                    gap: '0.75rem',
                                    justifyContent: 'flex-end'
                                }}>
                                    <button type="button" onClick={handleCloseModal} style={{
                                        padding: '0.75rem 1.5rem',
                                        backgroundColor: '#F1F5F9',
                                        color: '#475569',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}>
                                        Batal
                                    </button>
                                    <button type="submit" disabled={isSubmitting} style={{
                                        padding: '0.75rem 1.5rem',
                                        backgroundColor: '#3B82F6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        opacity: isSubmitting ? 0.7 : 1
                                    }}>
                                        {isSubmitting ? 'Menyimpan...' : (editingItem ? 'Simpan Perubahan' : 'Tambah Transaksi')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation */}
                {deleteConfirm && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 100,
                        padding: '1rem'
                    }} onClick={() => setDeleteConfirm(null)}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '20px',
                            maxWidth: '400px',
                            width: '100%'
                        }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid #E2E8F0' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0F172A', margin: 0 }}>
                                    Hapus Transaksi
                                </h3>
                            </div>
                            <div style={{ padding: '1.5rem' }}>
                                <p style={{ color: '#64748B', margin: 0 }}>
                                    Apakah Anda yakin ingin menghapus transaksi ini?
                                </p>
                            </div>
                            <div style={{
                                padding: '1rem 1.5rem',
                                borderTop: '1px solid #E2E8F0',
                                display: 'flex',
                                gap: '0.75rem',
                                justifyContent: 'flex-end'
                            }}>
                                <button onClick={() => setDeleteConfirm(null)} style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#F1F5F9',
                                    color: '#475569',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}>
                                    Batal
                                </button>
                                <button onClick={() => handleDelete(deleteConfirm)} style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#EF4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}>
                                    Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
