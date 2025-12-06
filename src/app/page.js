'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Shield, FileText, DollarSign, FileCheck, ArrowRight, CheckCircle, Users, Lock } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  const features = [
    {
      icon: FileText,
      title: 'Laporan Warga',
      description: 'Laporkan masalah di lingkungan dengan opsi anonim. Admin akan menindaklanjuti setiap laporan.',
      color: '#3B82F6',
    },
    {
      icon: DollarSign,
      title: 'Keuangan Transparan',
      description: 'Lihat laporan keuangan RT/RW secara real-time dengan grafik interaktif yang mudah dipahami.',
      color: '#22C55E',
    },
    {
      icon: FileCheck,
      title: 'Surat-Menyurat Digital',
      description: 'Ajukan surat pengantar, domisili, dan dokumen lainnya secara online dengan tanda tangan digital.',
      color: '#8B5CF6',
    },
  ];

  const stats = [
    { value: '500+', label: 'Warga Terdaftar' },
    { value: '1,200+', label: 'Laporan Diselesaikan' },
    { value: '100%', label: 'Transparansi' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl text-[var(--text-primary)]">LaporRT</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/login" className="btn btn-ghost">
                Masuk
              </Link>
              <Link href="/register" className="btn btn-primary">
                Daftar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
        <div className="absolute top-20 right-0 w-96 h-96 bg-[var(--primary)] rounded-full blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[var(--secondary)] rounded-full blur-3xl opacity-10"></div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)]/10 rounded-full text-[var(--primary)] text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse"></span>
              Platform Digital RT/RW
            </span>

            <h1 className="text-4xl md:text-6xl font-bold text-[var(--text-primary)] mb-6 leading-tight">
              Wujudkan Lingkungan
              <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent"> Lebih Baik</span>
            </h1>

            <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
              Sistem terintegrasi untuk laporan warga, keuangan transparan, dan pengurusan surat-menyurat digital.
              Bersama membangun RT/RW yang lebih responsif dan modern.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="btn btn-primary btn-lg">
                Mulai Sekarang
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login" className="btn btn-outline btn-lg">
                Sudah Punya Akun
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 mt-16 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-2xl md:text-4xl font-bold text-[var(--primary)]">{stat.value}</p>
                <p className="text-sm text-[var(--text-secondary)] mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk mengelola lingkungan RT/RW dalam satu platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="card hover:shadow-lg transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                    style={{ backgroundColor: `${feature.color}15` }}
                  >
                    <Icon className="w-7 h-7" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-[var(--text-secondary)]">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-6">
                Kenapa Memilih LaporRT?
              </h2>
              <div className="space-y-4">
                {[
                  { icon: Lock, text: 'Opsi laporan anonim untuk keamanan pelapor' },
                  { icon: CheckCircle, text: 'Tracking status laporan secara real-time' },
                  { icon: DollarSign, text: 'Laporan keuangan transparan dan akuntabel' },
                  { icon: FileCheck, text: 'Proses surat-menyurat lebih cepat dan efisien' },
                  { icon: Users, text: 'Akses mudah untuk semua warga' },
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-[var(--success)]/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-[var(--success)]" />
                      </div>
                      <p className="text-[var(--text-secondary)]">{item.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-3xl opacity-20"></div>
              <div className="relative bg-white rounded-3xl shadow-xl p-8 border border-[var(--border-color)]">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-[var(--bg-tertiary)] rounded-xl">
                    <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-[var(--primary)]" />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">Laporan Baru</p>
                      <p className="text-sm text-[var(--text-tertiary)]">Jalan berlubang di Gang Mawar</p>
                    </div>
                    <span className="badge badge-primary ml-auto">Baru</span>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-[var(--bg-tertiary)] rounded-xl">
                    <div className="w-12 h-12 bg-[var(--warning)]/10 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-[var(--warning-dark)]" />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">Iuran Bulan Ini</p>
                      <p className="text-sm text-[var(--text-tertiary)]">Terkumpul Rp 5.200.000</p>
                    </div>
                    <span className="badge badge-success ml-auto">95%</span>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-[var(--bg-tertiary)] rounded-xl">
                    <div className="w-12 h-12 bg-[var(--success)]/10 rounded-xl flex items-center justify-center">
                      <FileCheck className="w-6 h-6 text-[var(--success)]" />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">Surat Selesai</p>
                      <p className="text-sm text-[var(--text-tertiary)]">Surat Pengantar RT</p>
                    </div>
                    <span className="badge badge-success ml-auto">Siap</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-primary rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>

            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Siap Memulai?
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Daftar sekarang dan mulai gunakan platform LaporRT untuk lingkungan yang lebih baik.
              </p>
              <Link href="/register" className="btn bg-white text-[var(--primary)] hover:bg-white/90 btn-lg">
                Daftar Gratis
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-[var(--text-primary)]">LaporRT</span>
          </div>
          <p className="text-sm text-[var(--text-tertiary)]">
            © 2024 LaporRT. Dibuat untuk lingkungan RT/RW yang lebih baik.
          </p>
        </div>
      </footer>
    </div>
  );
}
