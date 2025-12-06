'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Storage keys
const STORAGE_KEYS = {
    USERS: 'rtrw_users',
    CURRENT_USER: 'rtrw_current_user',
    REPORTS: 'rtrw_reports',
    FINANCES: 'rtrw_finances',
    DOCUMENTS: 'rtrw_documents',
};

// Initialize default data
function initializeStorage() {
    if (typeof window === 'undefined') return;

    // Initialize default users if not exists
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        const defaultUsers = [
            {
                id: '1',
                name: 'Budi Santoso',
                email: 'ketua@rtrw.com',
                password: 'admin123',
                role: 'ketua_rt',
                phone: '081234567890',
                address: 'RT 01/RW 05',
                createdAt: new Date().toISOString(),
            },
            {
                id: '2',
                name: 'Siti Rahayu',
                email: 'bendahara@rtrw.com',
                password: 'admin123',
                role: 'admin',
                phone: '081234567891',
                address: 'RT 01/RW 05',
                createdAt: new Date().toISOString(),
            },
            {
                id: '3',
                name: 'Ahmad Wijaya',
                email: 'warga@rtrw.com',
                password: 'warga123',
                role: 'warga',
                phone: '081234567892',
                address: 'RT 01/RW 05, No. 15',
                createdAt: new Date().toISOString(),
            },
        ];
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
    }

    // Initialize sample reports
    if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
        const sampleReports = [
            {
                id: 'RPT-001',
                title: 'Jalan Berlubang di Gang Mawar',
                category: 'infrastruktur',
                description: 'Terdapat lubang besar di jalan gang mawar yang membahayakan pengendara motor.',
                location: 'Gang Mawar, RT 01/RW 05',
                status: 'proses',
                isAnonymous: false,
                userId: '3',
                userName: 'Ahmad Wijaya',
                images: [],
                responses: [
                    {
                        id: '1',
                        message: 'Terima kasih atas laporannya. Kami akan segera menindaklanjuti.',
                        createdAt: new Date(Date.now() - 86400000).toISOString(),
                        responderId: '1',
                        responderName: 'Budi Santoso',
                        responderRole: 'ketua_rt',
                    }
                ],
                createdAt: new Date(Date.now() - 172800000).toISOString(),
                updatedAt: new Date(Date.now() - 86400000).toISOString(),
            },
            {
                id: 'RPT-002',
                title: 'Lampu Jalan Mati',
                category: 'infrastruktur',
                description: 'Lampu jalan di depan pos ronda sudah mati sejak 1 minggu yang lalu.',
                location: 'Depan Pos Ronda, RT 01/RW 05',
                status: 'selesai',
                isAnonymous: true,
                userId: null,
                userName: 'Anonim',
                images: [],
                responses: [
                    {
                        id: '1',
                        message: 'Lampu sudah diperbaiki. Terima kasih atas laporannya.',
                        createdAt: new Date(Date.now() - 43200000).toISOString(),
                        responderId: '2',
                        responderName: 'Siti Rahayu',
                        responderRole: 'admin',
                    }
                ],
                createdAt: new Date(Date.now() - 604800000).toISOString(),
                updatedAt: new Date(Date.now() - 43200000).toISOString(),
            },
            {
                id: 'RPT-003',
                title: 'Sampah Menumpuk',
                category: 'kebersihan',
                description: 'Sampah di TPS sudah menumpuk dan berbau tidak sedap.',
                location: 'TPS RT 01/RW 05',
                status: 'baru',
                isAnonymous: false,
                userId: '3',
                userName: 'Ahmad Wijaya',
                images: [],
                responses: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ];
        localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(sampleReports));
    }

    // Initialize sample finances
    if (!localStorage.getItem(STORAGE_KEYS.FINANCES)) {
        const now = new Date();
        const sampleFinances = [
            { id: 'FIN-001', type: 'income', category: 'iuran', amount: 500000, description: 'Iuran bulanan RT - November 2024', date: new Date(now.getFullYear(), now.getMonth() - 1, 5).toISOString(), createdBy: '2', createdByName: 'Siti Rahayu' },
            { id: 'FIN-002', type: 'income', category: 'iuran', amount: 520000, description: 'Iuran bulanan RT - Oktober 2024', date: new Date(now.getFullYear(), now.getMonth() - 2, 5).toISOString(), createdBy: '2', createdByName: 'Siti Rahayu' },
            { id: 'FIN-003', type: 'income', category: 'sumbangan', amount: 1000000, description: 'Sumbangan warga untuk perbaikan jalan', date: new Date(now.getFullYear(), now.getMonth() - 1, 10).toISOString(), createdBy: '2', createdByName: 'Siti Rahayu' },
            { id: 'FIN-004', type: 'income', category: 'iuran', amount: 500000, description: 'Iuran bulanan RT - Desember 2024', date: new Date(now.getFullYear(), now.getMonth(), 5).toISOString(), createdBy: '2', createdByName: 'Siti Rahayu' },
            { id: 'FIN-005', type: 'expense', category: 'infrastruktur', amount: 750000, description: 'Perbaikan jalan gang mawar', date: new Date(now.getFullYear(), now.getMonth() - 1, 15).toISOString(), createdBy: '2', createdByName: 'Siti Rahayu' },
            { id: 'FIN-006', type: 'expense', category: 'kebersihan', amount: 200000, description: 'Pembelian peralatan kebersihan', date: new Date(now.getFullYear(), now.getMonth() - 2, 20).toISOString(), createdBy: '2', createdByName: 'Siti Rahayu' },
            { id: 'FIN-007', type: 'expense', category: 'keamanan', amount: 300000, description: 'Gaji satpam bulan November', date: new Date(now.getFullYear(), now.getMonth() - 1, 28).toISOString(), createdBy: '2', createdByName: 'Siti Rahayu' },
            { id: 'FIN-008', type: 'expense', category: 'acara', amount: 500000, description: 'Acara 17 Agustus', date: new Date(now.getFullYear(), 7, 17).toISOString(), createdBy: '2', createdByName: 'Siti Rahayu' },
        ];
        localStorage.setItem(STORAGE_KEYS.FINANCES, JSON.stringify(sampleFinances));
    }

    // Initialize sample documents
    if (!localStorage.getItem(STORAGE_KEYS.DOCUMENTS)) {
        const sampleDocuments = [
            {
                id: 'DOC-001',
                type: 'surat_pengantar',
                purpose: 'Pembuatan KTP',
                status: 'selesai',
                requesterId: '3',
                requesterName: 'Ahmad Wijaya',
                requesterAddress: 'RT 01/RW 05, No. 15',
                supportingDocs: ['KK', 'KTP Lama'],
                requesterSignature: null,
                approverSignature: null,
                approvedAt: new Date(Date.now() - 86400000).toISOString(),
                approvedBy: '1',
                approverName: 'Budi Santoso',
                notes: '',
                createdAt: new Date(Date.now() - 172800000).toISOString(),
                updatedAt: new Date(Date.now() - 86400000).toISOString(),
            },
            {
                id: 'DOC-002',
                type: 'surat_domisili',
                purpose: 'Keperluan pekerjaan',
                status: 'proses',
                requesterId: '3',
                requesterName: 'Ahmad Wijaya',
                requesterAddress: 'RT 01/RW 05, No. 15',
                supportingDocs: ['KTP', 'KK'],
                requesterSignature: null,
                approverSignature: null,
                approvedAt: null,
                approvedBy: null,
                approverName: null,
                notes: '',
                createdAt: new Date(Date.now() - 43200000).toISOString(),
                updatedAt: new Date(Date.now() - 43200000).toISOString(),
            },
        ];
        localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(sampleDocuments));
    }
}

// Helper functions
function getUsers() {
    if (typeof window === 'undefined') return [];
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    return users ? JSON.parse(users) : [];
}

function addUser(user) {
    const users = getUsers();
    users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return user;
}

function getUserByEmail(email) {
    const users = getUsers();
    return users.find(u => u.email === email);
}

function generateId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 7);
    return prefix ? `${prefix}-${timestamp}${randomStr}`.toUpperCase() : `${timestamp}${randomStr}`;
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Initialize storage with sample data
        initializeStorage();

        // Check if user is already logged in
        try {
            const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (e) {
            console.error('Error reading user from localStorage:', e);
        }
        setIsLoading(false);
    }, []);

    const login = async (email, password) => {
        const foundUser = getUserByEmail(email);

        if (!foundUser) {
            throw new Error('Email tidak terdaftar');
        }

        if (foundUser.password !== password) {
            throw new Error('Password salah');
        }

        const userWithoutPassword = { ...foundUser };
        delete userWithoutPassword.password;

        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userWithoutPassword));
        setUser(userWithoutPassword);

        return userWithoutPassword;
    };

    const register = async (userData) => {
        const existingUser = getUserByEmail(userData.email);

        if (existingUser) {
            throw new Error('Email sudah terdaftar');
        }

        const newUser = {
            id: generateId('USR'),
            ...userData,
            role: 'warga',
            createdAt: new Date().toISOString(),
        };

        addUser(newUser);

        const userWithoutPassword = { ...newUser };
        delete userWithoutPassword.password;

        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userWithoutPassword));
        setUser(userWithoutPassword);

        return userWithoutPassword;
    };

    const logout = () => {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        setUser(null);
    };

    const isAdmin = user?.role === 'admin' || user?.role === 'ketua_rt';
    const isKetuaRT = user?.role === 'ketua_rt';

    // Don't render children until mounted to prevent hydration mismatch
    if (!mounted) {
        return null;
    }

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            login,
            register,
            logout,
            isAdmin,
            isKetuaRT,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
