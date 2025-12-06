'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import {
    Home,
    FileText,
    PlusCircle,
    DollarSign,
    Settings,
    FileCheck,
    LogOut,
    Shield,
    Menu,
    X,
    Bell,
    Search,
    ChevronDown
} from 'lucide-react';

export default function DashboardLayout({ children }) {
    const { user, isLoading, isAuthenticated, isAdmin, isKetuaRT, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    // Close sidebar when route changes
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (isLoading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#F8FAFC'
            }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    border: '4px solid #E2E8F0',
                    borderTopColor: '#3B82F6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const navItems = [
        { href: '/dashboard', icon: Home, label: 'Dashboard' },
        { href: '/laporan', icon: FileText, label: 'Laporan Warga' },
        { href: '/laporan/buat', icon: PlusCircle, label: 'Buat Laporan' },
        { href: '/keuangan', icon: DollarSign, label: 'Keuangan' },
        ...(isAdmin ? [{ href: '/keuangan/kelola', icon: Settings, label: 'Kelola Keuangan' }] : []),
        { href: '/dokumen', icon: FileCheck, label: 'Dokumen' },
        { href: '/dokumen/ajukan', icon: PlusCircle, label: 'Ajukan Dokumen' },
    ];

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'ketua_rt': return { label: 'Ketua RT', color: '#22C55E' };
            case 'admin': return { label: 'Admin', color: '#EAB308' };
            default: return { label: 'Warga', color: '#3B82F6' };
        }
    };

    const roleBadge = getRoleBadge(user?.role);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 40,
                        display: 'block'
                    }}
                    className="lg:hidden"
                />
            )}

            {/* Sidebar */}
            <aside style={{
                position: 'fixed',
                top: 0,
                left: 0,
                height: '100vh',
                width: '280px',
                backgroundColor: '#FFFFFF',
                borderRight: '1px solid #E2E8F0',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                transition: 'transform 0.3s ease'
            }} className="sidebar-desktop">
                {/* Sidebar Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Shield style={{ width: '24px', height: '24px', color: 'white' }} />
                        </div>
                        <div>
                            <h1 style={{ fontWeight: 700, fontSize: '1.125rem', color: '#0F172A', margin: 0 }}>LaporRT</h1>
                            <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0 }}>RT 01 / RW 05</p>
                        </div>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        style={{
                            padding: '0.5rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            display: 'none'
                        }}
                        className="lg:hidden sidebar-close-btn"
                    >
                        <X style={{ width: '20px', height: '20px', color: '#64748B' }} />
                    </button>
                </div>

                {/* User Info */}
                <div style={{
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: roleBadge.color,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        flexShrink: 0
                    }}>
                        {getInitials(user?.name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                            fontWeight: 500,
                            color: '#0F172A',
                            margin: 0,
                            fontSize: '0.875rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>{user?.name}</p>
                        <span style={{
                            display: 'inline-block',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '9999px',
                            fontSize: '0.625rem',
                            fontWeight: 500,
                            backgroundColor: `${roleBadge.color}20`,
                            color: roleBadge.color
                        }}>{roleBadge.label}</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        backgroundColor: isActive ? 'rgba(59,130,246,0.1)' : 'transparent',
                                        color: isActive ? '#3B82F6' : '#64748B',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <Icon style={{ width: '20px', height: '20px' }} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Logout Button */}
                <div style={{ padding: '1rem', borderTop: '1px solid #E2E8F0' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#EF4444'
                        }}
                    >
                        <LogOut style={{ width: '20px', height: '20px' }} />
                        Keluar
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div style={{ marginLeft: '0' }} className="main-content-wrapper">
                {/* Header */}
                <header style={{
                    position: 'sticky',
                    top: 0,
                    backgroundColor: '#FFFFFF',
                    borderBottom: '1px solid #E2E8F0',
                    padding: '1rem 1.5rem',
                    zIndex: 30,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem'
                }}>
                    {/* Left - Menu Button & Search */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                        <button
                            onClick={() => setSidebarOpen(true)}
                            style={{
                                padding: '0.5rem',
                                borderRadius: '8px',
                                border: '1px solid #E2E8F0',
                                backgroundColor: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            className="lg:hidden menu-toggle"
                        >
                            <Menu style={{ width: '20px', height: '20px', color: '#64748B' }} />
                        </button>

                        {/* Search (Desktop only) */}
                        <div style={{
                            position: 'relative',
                            maxWidth: '400px',
                            flex: 1,
                            display: 'none'
                        }} className="search-desktop">
                            <Search style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '18px',
                                height: '18px',
                                color: '#94A3B8'
                            }} />
                            <input
                                type="text"
                                placeholder="Cari..."
                                style={{
                                    width: '100%',
                                    padding: '0.625rem 1rem 0.625rem 2.5rem',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '8px',
                                    fontSize: '0.875rem',
                                    backgroundColor: '#F8FAFC',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    {/* Right side - empty now, icons removed */}
                </header>

                {/* Page Content */}
                <main style={{ padding: '1.5rem' }}>
                    {children}
                </main>
            </div>

            {/* Responsive Styles */}
            <style jsx global>{`
        @media (min-width: 1024px) {
          .sidebar-desktop {
            transform: translateX(0) !important;
          }
          .main-content-wrapper {
            margin-left: 280px !important;
          }
          .menu-toggle {
            display: none !important;
          }
          .search-desktop {
            display: block !important;
          }
          .sidebar-close-btn {
            display: none !important;
          }
        }
        @media (max-width: 1023px) {
          .sidebar-close-btn {
            display: flex !important;
          }
        }
      `}</style>
        </div>
    );
}
