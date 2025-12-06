'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth';
import { addDocument, generateId } from '@/lib/storage';
import { FileText, Home, Briefcase, PartyPopper, Store, HelpCircle, X, PenTool, Loader2, Send } from 'lucide-react';

export default function AjukanDokumenPage() {
    const { user } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        type: '',
        purpose: '',
    });
    const [supportingDocs, setSupportingDocs] = useState([]);
    const [signature, setSignature] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [createdId, setCreatedId] = useState('');
    const [errors, setErrors] = useState({});

    const documentTypes = [
        {
            value: 'surat_pengantar',
            label: 'Surat Pengantar RT',
            description: 'Surat pengantar untuk berbagai keperluan (KTP, KK, dll)',
            requirements: ['KTP', 'KK'],
            Icon: FileText
        },
        {
            value: 'surat_domisili',
            label: 'Surat Keterangan Domisili',
            description: 'Surat keterangan tempat tinggal',
            requirements: ['KTP', 'KK', 'Surat Perjanjian Sewa (jika kontrak)'],
            Icon: Home
        },
        {
            value: 'surat_tidak_mampu',
            label: 'Surat Keterangan Tidak Mampu',
            description: 'Surat keterangan kondisi ekonomi untuk bantuan',
            requirements: ['KTP', 'KK', 'Foto rumah'],
            Icon: Briefcase
        },
        {
            value: 'surat_izin_keramaian',
            label: 'Surat Izin Keramaian',
            description: 'Surat izin untuk mengadakan acara',
            requirements: ['KTP penyelenggara', 'Proposal acara'],
            Icon: PartyPopper
        },
        {
            value: 'surat_usaha',
            label: 'Surat Keterangan Usaha',
            description: 'Surat keterangan menjalankan usaha',
            requirements: ['KTP', 'Foto tempat usaha'],
            Icon: Store
        },
        {
            value: 'lainnya',
            label: 'Lainnya',
            description: 'Jenis surat lainnya, jelaskan di keperluan',
            requirements: ['KTP', 'Dokumen pendukung (sesuai kebutuhan)'],
            Icon: HelpCircle
        },
    ];

    const selectedType = documentTypes.find(t => t.value === formData.type);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleDocUpload = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setSupportingDocs(prev => [...prev, {
                    id: Date.now() + Math.random(),
                    name: file.name,
                    url: e.target.result,
                }]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeDoc = (id) => {
        setSupportingDocs(prev => prev.filter(doc => doc.id !== id));
    };

    const handleSignatureUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setSignature({
                    name: file.name,
                    url: e.target.result,
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const removeSignature = () => {
        setSignature(null);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.type) newErrors.type = 'Pilih jenis dokumen';
        if (!formData.purpose.trim()) newErrors.purpose = 'Keperluan wajib diisi';
        if (formData.purpose.length < 10) newErrors.purpose = 'Keperluan minimal 10 karakter';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const docId = generateId('DOC');

        const newDocument = {
            id: docId,
            type: formData.type,
            purpose: formData.purpose,
            status: 'diajukan',
            requesterId: user?.id,
            requesterName: user?.name,
            requesterAddress: user?.address,
            supportingDocs: supportingDocs.map(d => d.name),
            requesterSignature: signature?.url || null,
            approverSignature: null,
            approvedAt: null,
            approvedBy: null,
            approverName: null,
            notes: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        addDocument(newDocument);
        setCreatedId(docId);
        setShowSuccess(true);
        setIsSubmitting(false);
    };

    const cardStyle = {
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '1.75rem',
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
        boxSizing: 'border-box',
        fontFamily: 'inherit'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.9375rem',
        fontWeight: 500,
        color: '#374151',
        marginBottom: '0.625rem'
    };

    if (showSuccess) {
        return (
            <DashboardLayout>
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem 2rem' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            backgroundColor: '#DCFCE7',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            fontSize: '2rem'
                        }}>
                            ✓
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.75rem 0' }}>
                            Permohonan Berhasil Diajukan!
                        </h2>
                        <p style={{ color: '#64748B', margin: '0 0 2rem 0', lineHeight: 1.6 }}>
                            Permohonan dokumen Anda dengan ID <span style={{ fontWeight: 600, color: '#8B5CF6' }}>#{createdId}</span> telah berhasil dikirim dan akan segera diproses oleh Ketua RT.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link href={`/dokumen/${createdId}`} style={{
                                padding: '0.875rem 1.5rem',
                                backgroundColor: '#8B5CF6',
                                color: 'white',
                                borderRadius: '10px',
                                fontWeight: 600,
                                textDecoration: 'none',
                                fontSize: '0.9375rem'
                            }}>
                                Lihat Status
                            </Link>
                            <Link href="/dokumen" style={{
                                padding: '0.875rem 1.5rem',
                                backgroundColor: '#F1F5F9',
                                color: '#475569',
                                borderRadius: '10px',
                                fontWeight: 600,
                                textDecoration: 'none',
                                fontSize: '0.9375rem'
                            }}>
                                Kembali ke Daftar
                            </Link>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <Link href="/dokumen" style={{
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
                            Ajukan Dokumen
                        </h1>
                        <p style={{ color: '#64748B', margin: '0.25rem 0 0 0', fontSize: '0.9375rem' }}>
                            Buat permohonan surat dari RT
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Document Type */}
                    <div style={cardStyle}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0F172A', margin: '0 0 1.25rem 0' }}>
                            Jenis Dokumen
                        </h2>
                        {errors.type && (
                            <p style={{ color: '#EF4444', fontSize: '0.875rem', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                ⚠️ {errors.type}
                            </p>
                        )}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                            gap: '1rem'
                        }}>
                            {documentTypes.map((type) => (
                                <label
                                    key={type.value}
                                    style={{
                                        position: 'relative',
                                        padding: '1.25rem',
                                        border: `2px solid ${formData.type === type.value ? '#8B5CF6' : '#E2E8F0'}`,
                                        borderRadius: '14px',
                                        cursor: 'pointer',
                                        backgroundColor: formData.type === type.value ? '#F5F3FF' : 'white',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="type"
                                        value={type.value}
                                        checked={formData.type === type.value}
                                        onChange={handleChange}
                                        style={{ display: 'none' }}
                                    />
                                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{type.icon}</div>
                                    <p style={{ fontWeight: 600, color: '#0F172A', margin: '0 0 0.375rem 0', fontSize: '0.9375rem' }}>{type.label}</p>
                                    <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: 0, lineHeight: 1.4 }}>{type.description}</p>
                                    {formData.type === type.value && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            width: '22px',
                                            height: '22px',
                                            backgroundColor: '#8B5CF6',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '0.75rem'
                                        }}>
                                            ✓
                                        </div>
                                    )}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Purpose */}
                    <div style={cardStyle}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0F172A', margin: '0 0 1.25rem 0' }}>
                            Keperluan
                        </h2>
                        <div>
                            <label style={labelStyle}>
                                Keperluan/Tujuan <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <textarea
                                name="purpose"
                                value={formData.purpose}
                                onChange={handleChange}
                                placeholder="Jelaskan keperluan pembuatan surat ini..."
                                rows={4}
                                style={{
                                    ...inputStyle,
                                    borderColor: errors.purpose ? '#EF4444' : '#E2E8F0',
                                    minHeight: '120px',
                                    resize: 'vertical',
                                    lineHeight: 1.6
                                }}
                            />
                            {errors.purpose && (
                                <p style={{ color: '#EF4444', fontSize: '0.8125rem', margin: '0.5rem 0 0 0' }}>
                                    {errors.purpose}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Requirements Info */}
                    {selectedType && (
                        <div style={{
                            ...cardStyle,
                            backgroundColor: '#EFF6FF',
                            border: '1px solid #BFDBFE'
                        }}>
                            <h3 style={{ fontWeight: 600, color: '#1E40AF', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem' }}>
                                ℹ️ Persyaratan Dokumen
                            </h3>
                            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                                {selectedType.requirements.map((req, index) => (
                                    <li key={index} style={{ color: '#1E40AF', fontSize: '0.9375rem', marginBottom: '0.375rem', lineHeight: 1.5 }}>
                                        {req}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Supporting Documents */}
                    <div style={cardStyle}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0F172A', margin: '0 0 1.25rem 0' }}>
                            Upload Dokumen Pendukung
                        </h2>
                        <div style={{
                            border: '2px dashed #E2E8F0',
                            borderRadius: '14px',
                            padding: '2rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            backgroundColor: '#FAFAFA'
                        }}>
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                multiple
                                onChange={handleDocUpload}
                                style={{ display: 'none' }}
                                id="doc-upload"
                            />
                            <label htmlFor="doc-upload" style={{ cursor: 'pointer' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📎</div>
                                <p style={{ color: '#64748B', margin: '0 0 0.375rem 0', fontSize: '0.9375rem' }}>
                                    Upload KTP, KK, atau dokumen lainnya
                                </p>
                                <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: 0 }}>
                                    PNG, JPG, PDF hingga 5MB
                                </p>
                            </label>
                        </div>

                        {supportingDocs.length > 0 && (
                            <div style={{ marginTop: '1rem' }}>
                                {supportingDocs.map((doc) => (
                                    <div
                                        key={doc.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '0.875rem 1rem',
                                            backgroundColor: '#F8FAFC',
                                            borderRadius: '10px',
                                            marginBottom: '0.5rem'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <FileText style={{ width: '20px', height: '20px', color: '#64748B' }} />
                                            <span style={{ fontSize: '0.9375rem', color: '#0F172A' }}>{doc.name}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeDoc(doc.id)}
                                            style={{
                                                padding: '0.375rem',
                                                backgroundColor: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: '#EF4444',
                                                fontSize: '1rem'
                                            }}
                                        >
                                            <X style={{ width: '16px', height: '16px' }} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Signature Upload */}
                    <div style={cardStyle}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0F172A', margin: '0 0 0.5rem 0' }}>
                            Tanda Tangan Pemohon
                        </h2>
                        <p style={{ fontSize: '0.875rem', color: '#64748B', margin: '0 0 1.25rem 0' }}>
                            Upload file gambar tanda tangan Anda (opsional, dapat diupload nanti)
                        </p>

                        {signature ? (
                            <div style={{
                                padding: '1.25rem',
                                border: '1px solid #E2E8F0',
                                borderRadius: '14px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <span style={{ fontSize: '0.9375rem', fontWeight: 500, color: '#0F172A' }}>
                                        {signature.name}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={removeSignature}
                                        style={{
                                            padding: '0.375rem',
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#EF4444',
                                            fontSize: '1rem'
                                        }}
                                    >
                                        <X style={{ width: '16px', height: '16px' }} />
                                    </button>
                                </div>
                                <img
                                    src={signature.url}
                                    alt="Tanda tangan"
                                    style={{ maxHeight: '100px', display: 'block', margin: '0 auto' }}
                                />
                            </div>
                        ) : (
                            <div style={{
                                border: '2px dashed #E2E8F0',
                                borderRadius: '14px',
                                padding: '2rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                backgroundColor: '#FAFAFA'
                            }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleSignatureUpload}
                                    style={{ display: 'none' }}
                                    id="signature-upload"
                                />
                                <label htmlFor="signature-upload" style={{ cursor: 'pointer' }}>
                                    <PenTool style={{ width: '40px', height: '40px', color: '#CBD5E1', margin: '0 auto 0.75rem' }} />
                                    <p style={{ color: '#64748B', margin: '0 0 0.375rem 0', fontSize: '0.9375rem' }}>
                                        Klik untuk upload tanda tangan
                                    </p>
                                    <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: 0 }}>
                                        PNG, JPG dengan background transparan/putih
                                    </p>
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Submit Buttons */}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <Link href="/dokumen" style={{
                            padding: '0.875rem 1.5rem',
                            backgroundColor: '#F1F5F9',
                            color: '#475569',
                            borderRadius: '10px',
                            fontWeight: 600,
                            textDecoration: 'none',
                            fontSize: '0.9375rem',
                            textAlign: 'center'
                        }}>
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                flex: 1,
                                padding: '0.875rem 1.5rem',
                                backgroundColor: '#8B5CF6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: 600,
                                fontSize: '0.9375rem',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                opacity: isSubmitting ? 0.7 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {isSubmitting ? <><Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} /> Mengirim...</> : <><Send style={{ width: '18px', height: '18px' }} /> Ajukan Permohonan</>}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
