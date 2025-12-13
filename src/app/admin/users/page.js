'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth';
import { getUsers, updateUser, deleteUser } from '@/lib/storage';
import { formatDate } from '@/lib/utils';
import { Users, Shield, User, Crown, Trash2, Edit2, X, Check, ArrowLeft } from 'lucide-react';

export default function AdminUsersPage() {
    const { user, isAdmin, isKetuaRT } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    useEffect(() => {
        if (!isAdmin && !isKetuaRT) {
            router.push('/dashboard');
            return;
        }
        loadUsers();
    }, [isAdmin, isKetuaRT]);

    const loadUsers = async () => {
        const allUsers = await getUsers();
        setUsers(allUsers);
    };

    const handleRoleChange = async (userId, newRole) => {
        await updateUser(userId, { role: newRole });
        await loadUsers();
        setEditingUser(null);
    };

    const handleDeleteUser = async (userId) => {
        await deleteUser(userId);
        await loadUsers();
        setShowDeleteConfirm(null);
    };

    const getRoleInfo = (role) => {
        switch (role) {
            case 'ketua_rt':
                return { label: 'Ketua RT', color: '#8B5CF6', Icon: Crown };
            case 'admin':
                return { label: 'Admin/Bendahara', color: '#3B82F6', Icon: Shield };
            default:
                return { label: 'Warga', color: '#64748B', Icon: User };
        }
    };

    const roles = [
        { value: 'warga', label: 'Warga' },
        { value: 'admin', label: 'Admin/Bendahara' },
        { value: 'ketua_rt', label: 'Ketua RT' },
    ];

    const cardStyle = {
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
    };

    return (
        <DashboardLayout>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <Link href="/dashboard" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px',
                        height: '40px',
                        backgroundColor: '#F1F5F9',
                        borderRadius: '10px',
                        textDecoration: 'none',
                    }}>
                        <ArrowLeft style={{ width: '20px', height: '20px', color: '#64748B' }} />
                    </Link>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                            Kelola Pengguna
                        </h1>
                        <p style={{ color: '#64748B', margin: '0.25rem 0 0 0' }}>
                            Manage role dan akses pengguna aplikasi
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                }}>
                    {[
                        { label: 'Total User', value: users.length, Icon: Users, color: '#3B82F6' },
                        { label: 'Ketua RT', value: users.filter(u => u.role === 'ketua_rt').length, Icon: Crown, color: '#8B5CF6' },
                        { label: 'Warga', value: users.filter(u => u.role === 'warga').length, Icon: User, color: '#64748B' },
                    ].map((stat, index) => {
                        const StatIcon = stat.Icon;
                        return (
                            <div key={index} style={{ ...cardStyle, textAlign: 'center', marginBottom: 0 }}>
                                <StatIcon style={{ width: '24px', height: '24px', color: stat.color, margin: '0 auto 0.5rem' }} />
                                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>{stat.value}</p>
                                <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>{stat.label}</p>
                            </div>
                        );
                    })}
                </div>

                {/* User List */}
                <div style={cardStyle}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0F172A', margin: '0 0 1.25rem 0' }}>
                        Daftar Pengguna
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {users.map((u) => {
                            const roleInfo = getRoleInfo(u.role);
                            const RoleIcon = roleInfo.Icon;
                            const isEditing = editingUser === u.id;
                            const isDeleting = showDeleteConfirm === u.id;
                            const isSelf = u.id === user?.id;

                            return (
                                <div
                                    key={u.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '1rem',
                                        backgroundColor: '#F8FAFC',
                                        borderRadius: '12px',
                                        border: '1px solid #E2E8F0',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            backgroundColor: roleInfo.color + '20',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <RoleIcon style={{ width: '24px', height: '24px', color: roleInfo.color }} />
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 600, color: '#0F172A', margin: 0, fontSize: '0.9375rem' }}>
                                                {u.name} {isSelf && <span style={{ color: '#3B82F6' }}>(Anda)</span>}
                                            </p>
                                            <p style={{ color: '#64748B', margin: '0.25rem 0 0 0', fontSize: '0.8125rem' }}>
                                                {u.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        {isEditing ? (
                                            <>
                                                <select
                                                    defaultValue={u.role}
                                                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                    style={{
                                                        padding: '0.5rem 1rem',
                                                        border: '1px solid #E2E8F0',
                                                        borderRadius: '8px',
                                                        fontSize: '0.875rem',
                                                        backgroundColor: '#FFFFFF',
                                                    }}
                                                >
                                                    {roles.map(role => (
                                                        <option key={role.value} value={role.value}>{role.label}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    onClick={() => setEditingUser(null)}
                                                    style={{
                                                        padding: '0.5rem',
                                                        backgroundColor: '#F1F5F9',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    <X style={{ width: '18px', height: '18px', color: '#64748B' }} />
                                                </button>
                                            </>
                                        ) : isDeleting ? (
                                            <>
                                                <span style={{ fontSize: '0.875rem', color: '#EF4444' }}>Hapus?</span>
                                                <button
                                                    onClick={() => handleDeleteUser(u.id)}
                                                    style={{
                                                        padding: '0.5rem',
                                                        backgroundColor: '#FEE2E2',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    <Check style={{ width: '18px', height: '18px', color: '#EF4444' }} />
                                                </button>
                                                <button
                                                    onClick={() => setShowDeleteConfirm(null)}
                                                    style={{
                                                        padding: '0.5rem',
                                                        backgroundColor: '#F1F5F9',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    <X style={{ width: '18px', height: '18px', color: '#64748B' }} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <span style={{
                                                    padding: '0.375rem 0.75rem',
                                                    backgroundColor: roleInfo.color + '20',
                                                    color: roleInfo.color,
                                                    borderRadius: '6px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                }}>
                                                    {roleInfo.label}
                                                </span>
                                                {!isSelf && (
                                                    <>
                                                        <button
                                                            onClick={() => setEditingUser(u.id)}
                                                            style={{
                                                                padding: '0.5rem',
                                                                backgroundColor: '#F1F5F9',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                cursor: 'pointer',
                                                            }}
                                                            title="Edit Role"
                                                        >
                                                            <Edit2 style={{ width: '18px', height: '18px', color: '#64748B' }} />
                                                        </button>
                                                        <button
                                                            onClick={() => setShowDeleteConfirm(u.id)}
                                                            style={{
                                                                padding: '0.5rem',
                                                                backgroundColor: '#FEE2E2',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                cursor: 'pointer',
                                                            }}
                                                            title="Hapus User"
                                                        >
                                                            <Trash2 style={{ width: '18px', height: '18px', color: '#EF4444' }} />
                                                        </button>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {users.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                            Belum ada pengguna terdaftar
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
