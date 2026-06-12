"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Boxes, 
  KeyRound, 
  Mail, 
  AlertCircle, 
  Loader2, 
  Eye, 
  EyeOff, 
  Sparkles, 
  GitCompare, 
  Trash2, 
  BarChart3, 
  PhoneCall, 
  QrCode,
  ShieldCheck
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api.post("/login", { email, password });
      
      localStorage.setItem("auth_token", data.access_token);
      localStorage.setItem("auth_user", JSON.stringify(data.user));
      
      toast.success(`Selamat datang kembali, ${data.user.name}!`);
      router.push("/");
    } catch (err: any) {
      const msg = err.message || "Email atau password salah.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background relative justify-center items-center p-4 md:p-8 overflow-hidden">
      {/* Floating Animated Blobs for premium depth */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-tr from-primary/20 to-orange-300/10 rounded-full blur-3xl -z-10 animate-float-1" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-gradient-to-bl from-primary/15 to-peach/10 rounded-full blur-3xl -z-10 animate-float-2" />
      <div className="absolute top-[40%] right-[10%] w-[30vw] h-[30vw] bg-gradient-to-br from-amber-200/10 to-orange-200/5 rounded-full blur-3xl -z-10 animate-float-1" />

      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) scale(1) rotate(0deg); }
          50% { transform: translateY(-20px) scale(1.05) rotate(3deg); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) scale(1.05) rotate(0deg); }
          50% { transform: translateY(20px) scale(0.95) rotate(-3deg); }
        }
        .animate-float-1 {
          animation: float-slow 12s ease-in-out infinite;
        }
        .animate-float-2 {
          animation: float-reverse 15s ease-in-out infinite;
        }
      `}</style>

      {/* Main Grid Wrapper */}
      <div className="grid grid-cols-12 gap-6 md:gap-8 max-w-7xl w-full items-stretch z-10">
        
        {/* LEFT COLUMN: Features & Overview (Visible on large screens) */}
        <section className="col-span-3 hidden lg:flex flex-col gap-6 justify-center">
          <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-[2.5rem] p-6 shadow-xl flex flex-col gap-5">
            <h3 className="text-base font-black font-serif text-foreground flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span>Fitur Utama</span>
            </h3>
            
            <div className="flex flex-col gap-4">
              <div className="flex gap-3 group">
                <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center text-primary flex-shrink-0 group-hover:scale-110 transition-transform">
                  <QrCode className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h4 className="text-xs font-bold text-foreground">Inventarisasi QR Code</h4>
                  <p className="text-[10px] text-foreground/50 leading-relaxed">Cetak barcode dan scan aset instan dengan kamera ponsel Anda.</p>
                </div>
              </div>

              <div className="flex gap-3 group">
                <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center text-primary flex-shrink-0 group-hover:scale-110 transition-transform">
                  <GitCompare className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h4 className="text-xs font-bold text-foreground">Mutasi Terlacak</h4>
                  <p className="text-[10px] text-foreground/50 leading-relaxed">Transfer aset antar ruangan dan unit kerja secara transparan & disetujui bertahap.</p>
                </div>
              </div>

              <div className="flex gap-3 group">
                <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center text-primary flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h4 className="text-xs font-bold text-foreground">Penghapusan & Hibah</h4>
                  <p className="text-[10px] text-foreground/50 leading-relaxed">Pencatatan disposisi barang rusak, hibah yayasan, atau sumbangan pihak ketiga.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CENTER COLUMN: The Login Card */}
        <main className="col-span-12 lg:col-span-6 xl:col-span-5 xl:col-start-4 flex items-center justify-center">
          <div className="w-full bg-white/75 backdrop-blur-xl border border-white/50 rounded-[3rem] p-8 md:p-10 shadow-2xl flex flex-col gap-6 relative overflow-hidden">
            {/* Top Gradient Accents */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-primary via-peach to-primary" />

            {/* Logo Section */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-[1.75rem] bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shadow-lg shadow-primary/20 transform hover:rotate-6 hover:scale-105 transition-all duration-300">
                <Boxes className="w-9 h-9 text-white" />
              </div>
              <div className="text-center mt-2">
                <h2 className="text-3xl font-black font-serif tracking-tight text-foreground flex items-center justify-center gap-1.5">
                  SIMA<span className="text-primary">YA</span>
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                </h2>
                <p className="text-[10px] text-foreground/45 font-bold uppercase tracking-widest mt-1">
                  Sistem Manajemen Aset Yayasan
                </p>
              </div>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-2">
              {error && (
                <div className="flex items-start gap-2.5 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/60 text-red-700 rounded-2xl text-xs font-semibold animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {/* Email Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-foreground/70 ml-1">Alamat Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-foreground/40 group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    required
                    placeholder="contoh: admin@simaya.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/50 border border-border-peach/60 rounded-2xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary shadow-sm group-hover:border-border-peach/90 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-foreground/70 ml-1">Kata Sandi</label>
                <div className="relative group">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-foreground/40 group-focus-within:text-primary transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="masukkan kata sandi"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-white/50 border border-border-peach/60 rounded-2xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary shadow-sm group-hover:border-border-peach/90 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center text-foreground/40 hover:text-primary transition-colors hover:bg-black/5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-extrabold text-xs shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    <span>Masuk Ke Sistem...</span>
                  </>
                ) : (
                  <span>Masuk Ke Dashboard</span>
                )}
              </button>
            </form>

            {/* Default Credential Box */}
            <div className="bg-primary-light/30 border border-border-peach/40 rounded-2xl p-4 text-center text-[10px] text-foreground/50 font-semibold leading-relaxed mt-2">
              Default Credential Uji Coba: <br />
              Email: <span className="text-primary font-bold">admin@simaya.id</span> / Password: <span className="text-primary font-bold">password</span>
            </div>
          </div>
        </main>

        {/* RIGHT COLUMN: System Statistics & Help (Visible on large/extra-large screens) */}
        <section className="col-span-3 hidden xl:flex flex-col gap-6 justify-center">
          <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-[2.5rem] p-6 shadow-xl flex flex-col gap-5">
            <h3 className="text-base font-black font-serif text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <span>Statistik Yayasan</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white/50 border border-white/40 rounded-xl text-center">
                <span className="text-lg font-black text-primary font-serif">50</span>
                <p className="text-[9px] text-foreground/45 font-semibold mt-0.5">Aset Aktif</p>
              </div>
              <div className="p-3 bg-white/50 border border-white/40 rounded-xl text-center">
                <span className="text-lg font-black text-primary font-serif">4</span>
                <p className="text-[9px] text-foreground/45 font-semibold mt-0.5">Unit Kerja</p>
              </div>
              <div className="p-3 bg-white/50 border border-white/40 rounded-xl text-center">
                <span className="text-lg font-black text-primary font-serif">3</span>
                <p className="text-[9px] text-foreground/45 font-semibold mt-0.5">Lokasi Utama</p>
              </div>
              <div className="p-3 bg-white/50 border border-white/40 rounded-xl text-center">
                <span className="text-lg font-black text-primary font-serif">98%</span>
                <p className="text-[9px] text-foreground/45 font-semibold mt-0.5">Kondisi Bagus</p>
              </div>
            </div>

            <hr className="border-white/50" />

            <div className="flex flex-col gap-2.5">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-primary" />
                <span>Bantuan Teknis</span>
              </h4>
              <p className="text-[9px] text-foreground/50 leading-relaxed">Mengalami kendala otentikasi atau akses unit kerja? Hubungi administrator SIMAYA:</p>
              <a 
                href="mailto:support@simaya.id" 
                className="text-[10px] text-primary font-bold hover:underline transition-all"
              >
                support@simaya.id
              </a>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
