// LocalStorage utility functions for demo mode
const STORAGE_KEYS = {
    USERS: 'rtrw_users',
    CURRENT_USER: 'rtrw_current_user',
    REPORTS: 'rtrw_reports',
    FINANCES: 'rtrw_finances',
    DOCUMENTS: 'rtrw_documents',
};

// Initialize default data
export function initializeStorage() {
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
                description: 'Terdapat lubang besar di jalan gang mawar yang membahayakan pengendara motor, terutama saat malam hari.',
                location: 'Gang Mawar, RT 01/RW 05',
                status: 'proses',
                isAnonymous: false,
                userId: '3',
                userName: 'Ahmad Wijaya',
                images: [],
                responses: [
                    {
                        id: '1',
                        message: 'Terima kasih atas laporannya. Kami akan segera menindaklanjuti dengan mengecek lokasi.',
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
                        message: 'Lampu sudah diperbaiki oleh petugas PLN. Terima kasih atas laporannya.',
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
                description: 'Sampah di TPS sudah menumpuk dan berbau tidak sedap. Mohon segera diangkut.',
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
            // Pemasukan
            { id: 'FIN-001', type: 'income', category: 'iuran', amount: 500000, description: 'Iuran bulanan RT - November 2024', date: new Date(now.getFullYear(), now.getMonth() - 1, 5).toISOString(), createdBy: '2', createdByName: 'Siti Rahayu' },
            { id: 'FIN-002', type: 'income', category: 'iuran', amount: 520000, description: 'Iuran bulanan RT - Oktober 2024', date: new Date(now.getFullYear(), now.getMonth() - 2, 5).toISOString(), createdBy: '2', createdByName: 'Siti Rahayu' },
            { id: 'FIN-003', type: 'income', category: 'sumbangan', amount: 1000000, description: 'Sumbangan warga untuk perbaikan jalan', date: new Date(now.getFullYear(), now.getMonth() - 1, 10).toISOString(), createdBy: '2', createdByName: 'Siti Rahayu' },
            { id: 'FIN-004', type: 'income', category: 'iuran', amount: 500000, description: 'Iuran bulanan RT - Desember 2024', date: new Date(now.getFullYear(), now.getMonth(), 5).toISOString(), createdBy: '2', createdByName: 'Siti Rahayu' },
            // Pengeluaran
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

// Users
export function getUsers() {
    if (typeof window === 'undefined') return [];
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    return users ? JSON.parse(users) : [];
}

export function addUser(user) {
    const users = getUsers();
    users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return user;
}

export function getUserByEmail(email) {
    const users = getUsers();
    return users.find(u => u.email === email);
}

export function getUserById(id) {
    const users = getUsers();
    return users.find(u => u.id === id);
}

// Current User
export function setCurrentUser(user) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

export function getCurrentUser() {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
}

export function removeCurrentUser() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

// Reports
export function getReports() {
    if (typeof window === 'undefined') return [];
    const reports = localStorage.getItem(STORAGE_KEYS.REPORTS);
    return reports ? JSON.parse(reports) : [];
}

export function addReport(report) {
    const reports = getReports();
    reports.unshift(report);
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    return report;
}

export function updateReport(id, updates) {
    const reports = getReports();
    const index = reports.findIndex(r => r.id === id);
    if (index !== -1) {
        reports[index] = { ...reports[index], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
        return reports[index];
    }
    return null;
}

export function getReportById(id) {
    const reports = getReports();
    return reports.find(r => r.id === id);
}

export function deleteReport(id) {
    const reports = getReports();
    const filtered = reports.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(filtered));
}

// Finances
export function getFinances() {
    if (typeof window === 'undefined') return [];
    const finances = localStorage.getItem(STORAGE_KEYS.FINANCES);
    return finances ? JSON.parse(finances) : [];
}

export function addFinance(finance) {
    const finances = getFinances();
    finances.unshift(finance);
    localStorage.setItem(STORAGE_KEYS.FINANCES, JSON.stringify(finances));
    return finance;
}

export function updateFinance(id, updates) {
    const finances = getFinances();
    const index = finances.findIndex(f => f.id === id);
    if (index !== -1) {
        finances[index] = { ...finances[index], ...updates };
        localStorage.setItem(STORAGE_KEYS.FINANCES, JSON.stringify(finances));
        return finances[index];
    }
    return null;
}

export function deleteFinance(id) {
    const finances = getFinances();
    const filtered = finances.filter(f => f.id !== id);
    localStorage.setItem(STORAGE_KEYS.FINANCES, JSON.stringify(filtered));
}

// Documents
export function getDocuments() {
    if (typeof window === 'undefined') return [];
    const documents = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    return documents ? JSON.parse(documents) : [];
}

export function addDocument(doc) {
    const documents = getDocuments();
    documents.unshift(doc);
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    return doc;
}

export function updateDocument(id, updates) {
    const documents = getDocuments();
    const index = documents.findIndex(d => d.id === id);
    if (index !== -1) {
        documents[index] = { ...documents[index], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
        return documents[index];
    }
    return null;
}

export function getDocumentById(id) {
    const documents = getDocuments();
    return documents.find(d => d.id === id);
}

export function deleteDocument(id) {
    const documents = getDocuments();
    const filtered = documents.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(filtered));
}

// Generate unique ID
export function generateId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 7);
    return prefix ? `${prefix}-${timestamp}${randomStr}`.toUpperCase() : `${timestamp}${randomStr}`;
}
