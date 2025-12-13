// Storage utility functions - Supabase + localStorage fallback
import { supabase, isSupabaseEnabled } from './supabase';

// ==================== USERS ====================

export async function getUsers() {
    if (isSupabaseEnabled()) {
        const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching users:', error);
            return [];
        }
        return data || [];
    }
    // localStorage fallback
    if (typeof window === 'undefined') return [];
    const users = localStorage.getItem('rtrw_users');
    return users ? JSON.parse(users) : [];
}

export async function addUser(user) {
    if (isSupabaseEnabled()) {
        const { data, error } = await supabase.from('users').insert([{
            email: user.email,
            name: user.name,
            phone: user.phone,
            address: user.address,
            role: user.role || 'warga',
        }]).select().single();
        if (error) {
            console.error('Error adding user:', error);
            throw new Error(error.message);
        }
        return data;
    }
    // localStorage fallback
    const users = await getUsers();
    users.push(user);
    localStorage.setItem('rtrw_users', JSON.stringify(users));
    return user;
}

export async function getUserByEmail(email) {
    if (isSupabaseEnabled()) {
        const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching user:', error);
        }
        return data || null;
    }
    // localStorage fallback
    const users = await getUsers();
    return users.find(u => u.email === email) || null;
}

export async function getUserById(id) {
    if (isSupabaseEnabled()) {
        const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching user:', error);
        }
        return data || null;
    }
    // localStorage fallback
    const users = await getUsers();
    return users.find(u => u.id === id) || null;
}

export async function updateUser(id, updates) {
    if (isSupabaseEnabled()) {
        const { data, error } = await supabase.from('users').update(updates).eq('id', id).select().single();
        if (error) {
            console.error('Error updating user:', error);
            return null;
        }
        return data;
    }
    // localStorage fallback
    const users = await getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
        users[index] = { ...users[index], ...updates };
        localStorage.setItem('rtrw_users', JSON.stringify(users));
        return users[index];
    }
    return null;
}

export async function deleteUser(id) {
    if (isSupabaseEnabled()) {
        const { error } = await supabase.from('users').delete().eq('id', id);
        if (error) console.error('Error deleting user:', error);
        return;
    }
    // localStorage fallback
    const users = await getUsers();
    const filtered = users.filter(u => u.id !== id);
    localStorage.setItem('rtrw_users', JSON.stringify(filtered));
}

// ==================== REPORTS ====================

export async function getReports() {
    if (isSupabaseEnabled()) {
        // Get reports
        const { data: reports, error } = await supabase
            .from('reports')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching reports:', error);
            return [];
        }

        // Get responses for each report
        const { data: responses } = await supabase.from('report_responses').select('*');

        // Merge responses into reports
        return (reports || []).map(report => ({
            ...report,
            isAnonymous: report.is_anonymous,
            userId: report.user_id,
            userName: report.user_name,
            createdAt: report.created_at,
            updatedAt: report.updated_at,
            responses: (responses || [])
                .filter(r => r.report_id === report.id)
                .map(r => ({
                    id: r.id,
                    message: r.message,
                    responderId: r.responder_id,
                    responderName: r.responder_name,
                    responderRole: r.responder_role,
                    createdAt: r.created_at,
                }))
        }));
    }
    // localStorage fallback
    if (typeof window === 'undefined') return [];
    const reports = localStorage.getItem('rtrw_reports');
    return reports ? JSON.parse(reports) : [];
}

export async function addReport(report) {
    if (isSupabaseEnabled()) {
        const { data, error } = await supabase.from('reports').insert([{
            id: report.id,
            title: report.title,
            category: report.category,
            description: report.description,
            location: report.location,
            status: report.status || 'baru',
            is_anonymous: report.isAnonymous || false,
            user_id: report.userId,
            user_name: report.userName,
            images: report.images || [],
        }]).select().single();
        if (error) {
            console.error('Error adding report:', error);
            throw new Error(error.message);
        }
        return { ...data, responses: [] };
    }
    // localStorage fallback
    const reports = await getReports();
    reports.unshift(report);
    localStorage.setItem('rtrw_reports', JSON.stringify(reports));
    return report;
}

export async function updateReport(id, updates) {
    if (isSupabaseEnabled()) {
        const dbUpdates = {
            ...(updates.title && { title: updates.title }),
            ...(updates.category && { category: updates.category }),
            ...(updates.description && { description: updates.description }),
            ...(updates.location && { location: updates.location }),
            ...(updates.status && { status: updates.status }),
            ...(updates.images && { images: updates.images }),
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase.from('reports').update(dbUpdates).eq('id', id).select().single();
        if (error) {
            console.error('Error updating report:', error);
            return null;
        }
        return data;
    }
    // localStorage fallback
    const reports = await getReports();
    const index = reports.findIndex(r => r.id === id);
    if (index !== -1) {
        reports[index] = { ...reports[index], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem('rtrw_reports', JSON.stringify(reports));
        return reports[index];
    }
    return null;
}

export async function getReportById(id) {
    if (isSupabaseEnabled()) {
        const { data: report, error } = await supabase.from('reports').select('*').eq('id', id).single();
        if (error) {
            console.error('Error fetching report:', error);
            return null;
        }

        // Get responses
        const { data: responses } = await supabase.from('report_responses').select('*').eq('report_id', id);

        return {
            ...report,
            isAnonymous: report.is_anonymous,
            userId: report.user_id,
            userName: report.user_name,
            createdAt: report.created_at,
            updatedAt: report.updated_at,
            responses: (responses || []).map(r => ({
                id: r.id,
                message: r.message,
                responderId: r.responder_id,
                responderName: r.responder_name,
                responderRole: r.responder_role,
                createdAt: r.created_at,
            }))
        };
    }
    // localStorage fallback
    const reports = await getReports();
    return reports.find(r => r.id === id) || null;
}

export async function deleteReport(id) {
    if (isSupabaseEnabled()) {
        const { error } = await supabase.from('reports').delete().eq('id', id);
        if (error) console.error('Error deleting report:', error);
        return;
    }
    // localStorage fallback
    const reports = await getReports();
    const filtered = reports.filter(r => r.id !== id);
    localStorage.setItem('rtrw_reports', JSON.stringify(filtered));
}

// Add response to report
export async function addReportResponse(reportId, response) {
    if (isSupabaseEnabled()) {
        const { data, error } = await supabase.from('report_responses').insert([{
            report_id: reportId,
            message: response.message,
            responder_id: response.responderId,
            responder_name: response.responderName,
            responder_role: response.responderRole,
        }]).select().single();
        if (error) {
            console.error('Error adding response:', error);
            return null;
        }
        return data;
    }
    // localStorage fallback
    const reports = await getReports();
    const index = reports.findIndex(r => r.id === reportId);
    if (index !== -1) {
        if (!reports[index].responses) reports[index].responses = [];
        reports[index].responses.push(response);
        localStorage.setItem('rtrw_reports', JSON.stringify(reports));
        return response;
    }
    return null;
}

// ==================== FINANCES ====================

export async function getFinances() {
    if (isSupabaseEnabled()) {
        const { data, error } = await supabase.from('finances').select('*').order('date', { ascending: false });
        if (error) {
            console.error('Error fetching finances:', error);
            return [];
        }
        return (data || []).map(f => ({
            ...f,
            createdBy: f.created_by,
            createdByName: f.created_by_name,
        }));
    }
    // localStorage fallback
    if (typeof window === 'undefined') return [];
    const finances = localStorage.getItem('rtrw_finances');
    return finances ? JSON.parse(finances) : [];
}

export async function addFinance(finance) {
    if (isSupabaseEnabled()) {
        const { data, error } = await supabase.from('finances').insert([{
            id: finance.id,
            type: finance.type,
            category: finance.category,
            amount: finance.amount,
            description: finance.description,
            date: finance.date,
            created_by: finance.createdBy,
            created_by_name: finance.createdByName,
        }]).select().single();
        if (error) {
            console.error('Error adding finance:', error);
            throw new Error(error.message);
        }
        return data;
    }
    // localStorage fallback
    const finances = await getFinances();
    finances.unshift(finance);
    localStorage.setItem('rtrw_finances', JSON.stringify(finances));
    return finance;
}

export async function updateFinance(id, updates) {
    if (isSupabaseEnabled()) {
        const { data, error } = await supabase.from('finances').update(updates).eq('id', id).select().single();
        if (error) {
            console.error('Error updating finance:', error);
            return null;
        }
        return data;
    }
    // localStorage fallback
    const finances = await getFinances();
    const index = finances.findIndex(f => f.id === id);
    if (index !== -1) {
        finances[index] = { ...finances[index], ...updates };
        localStorage.setItem('rtrw_finances', JSON.stringify(finances));
        return finances[index];
    }
    return null;
}

export async function deleteFinance(id) {
    if (isSupabaseEnabled()) {
        const { error } = await supabase.from('finances').delete().eq('id', id);
        if (error) console.error('Error deleting finance:', error);
        return;
    }
    // localStorage fallback
    const finances = await getFinances();
    const filtered = finances.filter(f => f.id !== id);
    localStorage.setItem('rtrw_finances', JSON.stringify(filtered));
}

// ==================== DOCUMENTS ====================

export async function getDocuments() {
    if (isSupabaseEnabled()) {
        const { data, error } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching documents:', error);
            return [];
        }
        return (data || []).map(d => ({
            ...d,
            requesterId: d.requester_id,
            requesterName: d.requester_name,
            requesterAddress: d.requester_address,
            supportingDocs: d.supporting_docs,
            requesterSignature: d.requester_signature,
            approverSignature: d.approver_signature,
            approvedAt: d.approved_at,
            approvedBy: d.approved_by,
            approverName: d.approver_name,
            createdAt: d.created_at,
            updatedAt: d.updated_at,
        }));
    }
    // localStorage fallback
    if (typeof window === 'undefined') return [];
    const documents = localStorage.getItem('rtrw_documents');
    return documents ? JSON.parse(documents) : [];
}

export async function addDocument(doc) {
    if (isSupabaseEnabled()) {
        const { data, error } = await supabase.from('documents').insert([{
            id: doc.id,
            type: doc.type,
            purpose: doc.purpose,
            status: doc.status || 'diajukan',
            requester_id: doc.requesterId,
            requester_name: doc.requesterName,
            requester_address: doc.requesterAddress,
            supporting_docs: doc.supportingDocs || [],
            requester_signature: doc.requesterSignature,
        }]).select().single();
        if (error) {
            console.error('Error adding document:', error);
            throw new Error(error.message);
        }
        return data;
    }
    // localStorage fallback
    const documents = await getDocuments();
    documents.unshift(doc);
    localStorage.setItem('rtrw_documents', JSON.stringify(documents));
    return doc;
}

export async function updateDocument(id, updates) {
    if (isSupabaseEnabled()) {
        const dbUpdates = {
            ...(updates.status && { status: updates.status }),
            ...(updates.notes !== undefined && { notes: updates.notes }),
            ...(updates.approvedAt && { approved_at: updates.approvedAt }),
            ...(updates.approvedBy && { approved_by: updates.approvedBy }),
            ...(updates.approverName && { approver_name: updates.approverName }),
            ...(updates.approverSignature && { approver_signature: updates.approverSignature }),
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase.from('documents').update(dbUpdates).eq('id', id).select().single();
        if (error) {
            console.error('Error updating document:', error);
            return null;
        }
        return {
            ...data,
            requesterId: data.requester_id,
            requesterName: data.requester_name,
            requesterAddress: data.requester_address,
            supportingDocs: data.supporting_docs,
            requesterSignature: data.requester_signature,
            approverSignature: data.approver_signature,
            approvedAt: data.approved_at,
            approvedBy: data.approved_by,
            approverName: data.approver_name,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    }
    // localStorage fallback
    const documents = await getDocuments();
    const index = documents.findIndex(d => d.id === id);
    if (index !== -1) {
        documents[index] = { ...documents[index], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem('rtrw_documents', JSON.stringify(documents));
        return documents[index];
    }
    return null;
}

export async function getDocumentById(id) {
    if (isSupabaseEnabled()) {
        const { data, error } = await supabase.from('documents').select('*').eq('id', id).single();
        if (error) {
            console.error('Error fetching document:', error);
            return null;
        }
        return {
            ...data,
            requesterId: data.requester_id,
            requesterName: data.requester_name,
            requesterAddress: data.requester_address,
            supportingDocs: data.supporting_docs,
            requesterSignature: data.requester_signature,
            approverSignature: data.approver_signature,
            approvedAt: data.approved_at,
            approvedBy: data.approved_by,
            approverName: data.approver_name,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        };
    }
    // localStorage fallback
    const documents = await getDocuments();
    return documents.find(d => d.id === id) || null;
}

export async function deleteDocument(id) {
    if (isSupabaseEnabled()) {
        const { error } = await supabase.from('documents').delete().eq('id', id);
        if (error) console.error('Error deleting document:', error);
        return;
    }
    // localStorage fallback
    const documents = await getDocuments();
    const filtered = documents.filter(d => d.id !== id);
    localStorage.setItem('rtrw_documents', JSON.stringify(filtered));
}

// ==================== UTILITIES ====================

export function generateId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 7);
    return prefix ? `${prefix}-${timestamp}${randomStr}`.toUpperCase() : `${timestamp}${randomStr}`;
}

// Initialize storage - no longer needed for Supabase but kept for localStorage fallback
export function initializeStorage() {
    if (typeof window === 'undefined' || isSupabaseEnabled()) return;
    // localStorage initialization code would go here if needed
}
