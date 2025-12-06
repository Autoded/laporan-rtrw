// Helper utilities

// Format currency to Indonesian Rupiah
export function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

// Format date to Indonesian format
export function formatDate(date, options = {}) {
    const defaultOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    };
    return new Date(date).toLocaleDateString('id-ID', { ...defaultOptions, ...options });
}

// Format date to relative time (e.g., "2 hari yang lalu")
export function formatRelativeTime(date) {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return 'Baru saja';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} minggu yang lalu`;

    return formatDate(date, { day: 'numeric', month: 'short', year: 'numeric' });
}

// Get status label and color
export function getStatusInfo(status) {
    const statusMap = {
        baru: { label: 'Baru', color: 'primary', bgClass: 'status-new' },
        proses: { label: 'Diproses', color: 'warning', bgClass: 'status-process' },
        selesai: { label: 'Selesai', color: 'success', bgClass: 'status-done' },
        ditolak: { label: 'Ditolak', color: 'danger', bgClass: 'status-rejected' },
        diajukan: { label: 'Diajukan', color: 'primary', bgClass: 'status-new' },
    };
    return statusMap[status] || { label: status, color: 'secondary', bgClass: 'badge-secondary' };
}

// Get category info
export function getCategoryInfo(category) {
    const categoryMap = {
        infrastruktur: { label: 'Infrastruktur', icon: 'building', color: '#3B82F6' },
        keamanan: { label: 'Keamanan', icon: 'shield', color: '#8B5CF6' },
        kebersihan: { label: 'Kebersihan', icon: 'trash', color: '#22C55E' },
        sosial: { label: 'Sosial', icon: 'users', color: '#EAB308' },
        lainnya: { label: 'Lainnya', icon: 'file', color: '#64748B' },
        // Finance categories
        iuran: { label: 'Iuran Bulanan', icon: 'wallet', color: '#22C55E' },
        sumbangan: { label: 'Sumbangan', icon: 'heart', color: '#EC4899' },
        acara: { label: 'Acara', icon: 'calendar', color: '#F97316' },
    };
    return categoryMap[category] || { label: category, icon: 'file', color: '#64748B' };
}

// Get document type info
export function getDocumentTypeInfo(type) {
    const typeMap = {
        surat_pengantar: { label: 'Surat Pengantar RT', description: 'Surat pengantar dari RT untuk berbagai keperluan' },
        surat_domisili: { label: 'Surat Keterangan Domisili', description: 'Surat keterangan tempat tinggal' },
        surat_tidak_mampu: { label: 'Surat Keterangan Tidak Mampu', description: 'Surat keterangan kondisi ekonomi' },
        surat_izin_keramaian: { label: 'Surat Izin Keramaian', description: 'Surat izin untuk mengadakan acara' },
        surat_usaha: { label: 'Surat Keterangan Usaha', description: 'Surat keterangan menjalankan usaha' },
        lainnya: { label: 'Surat Lainnya', description: 'Jenis surat lainnya' },
    };
    return typeMap[type] || { label: type, description: '' };
}

// Get role info
export function getRoleInfo(role) {
    const roleMap = {
        warga: { label: 'Warga', color: 'primary', permissions: ['view_reports', 'create_report', 'view_finances', 'request_document'] },
        admin: { label: 'Admin/Bendahara', color: 'warning', permissions: ['manage_reports', 'manage_finances', 'view_documents'] },
        ketua_rt: { label: 'Ketua RT', color: 'success', permissions: ['all'] },
    };
    return roleMap[role] || { label: role, color: 'secondary', permissions: [] };
}

// Check if user has permission
export function hasPermission(user, permission) {
    if (!user) return false;
    const roleInfo = getRoleInfo(user.role);
    if (roleInfo.permissions.includes('all')) return true;
    return roleInfo.permissions.includes(permission);
}

// Get user initials for avatar
export function getInitials(name) {
    if (!name) return '?';
    const words = name.split(' ');
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

// Truncate text
export function truncateText(text, maxLength = 100) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Class name merger utility
export function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}
