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
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      const msg = err.message || "Email atau kata sandi tidak valid.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background relative justify-center items-center p-4 md:p-8 overflow-hidden">
      {/* Dynamic Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-tr from-primary/20 to-orange-300/10 rounded-full blur-3xl -z-10 animate-float-1" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-gradient-to-bl from-primary/15 to-amber-300/10 rounded-full blur-3xl -z-10 animate-float-2" />

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

      {/* Main Grid Container */}
      <div className="grid grid-cols-12 gap-6 md:gap-8 max-w-7xl w-full items-stretch z-10">
        
        {/* LEFT COLUMN: Feature Highlights */}
        <section className="col-span-3 hidden lg:flex flex-col gap-6 justify-center">
          <Card className="bg-card/75 backdrop-blur-xl border-border/80 rounded-[2.5rem] p-6 shadow-xl flex flex-col gap-5">
            <h3 className="text-base font-black font-serif text-foreground flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span>Fitur Unggulan</span>
            </h3>
            
            <div className="flex flex-col gap-4">
              <div className="flex gap-3 group">
                <div className="w-10 h-10 rounded-2xl bg-primary-light border border-primary/20 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
                  <QrCode className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h4 className="text-xs font-bold text-foreground">Inventarisasi QR Code</h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">Cetak barcode dan scan aset instan dengan kamera gawai Anda.</p>
                </div>
              </div>

              <div className="flex gap-3 group">
                <div className="w-10 h-10 rounded-2xl bg-primary-light border border-primary/20 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
                  <GitCompare className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h4 className="text-xs font-bold text-foreground">Mutasi Terlacak</h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">Transfer aset antar ruangan & unit kerja transparan dengan persetujuan bertingkat.</p>
                </div>
              </div>

              <div className="flex gap-3 group">
                <div className="w-10 h-10 rounded-2xl bg-primary-light border border-primary/20 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h4 className="text-xs font-bold text-foreground">Disposisi & Hibah</h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">Pencatatan barang rusak, hibah yayasan, atau lelang resmi.</p>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* CENTER COLUMN: The Login Card */}
        <main className="col-span-12 lg:col-span-6 xl:col-span-5 xl:col-start-4 flex items-center justify-center">
          <Card className="w-full bg-card/85 backdrop-blur-2xl border-border/80 rounded-[3rem] p-8 md:p-10 shadow-2xl flex flex-col gap-6 relative overflow-hidden">
            {/* Top Accent */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-primary via-orange-400 to-primary" />

            {/* Logo Section */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-18 h-18 rounded-3xl bg-white flex items-center justify-center shadow-lg shadow-primary/20 p-1 border border-border/80 transform hover:rotate-6 hover:scale-105 transition-all duration-300">
                <img src="/images/yapi.png" alt="Logo YAPI" className="w-full h-full object-contain" />
              </div>
              <div className="text-center mt-1">
                <h2 className="text-3xl font-black font-serif tracking-tight text-foreground flex items-center justify-center gap-1.5">
                  SIMA<span className="text-primary">YA</span>
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                </h2>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                  Sistem Informasi Manajemen Aset Yayasan
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
              {error && (
                <div className="flex items-start gap-2.5 p-3.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl text-xs font-semibold animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="login-email">Alamat Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="login-email"
                    type="email"
                    required
                    placeholder="contoh: admin@simaya.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 rounded-2xl text-xs bg-muted/20"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="login-pwd">Kata Sandi</Label>
                <div className="relative group">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="login-pwd"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Masukkan kata sandi"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11 h-12 rounded-2xl text-xs bg-muted/20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl text-muted-foreground hover:text-primary"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full mt-2 h-12 rounded-2xl font-extrabold text-xs shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses Masuk...</span>
                  </>
                ) : (
                  <span>Masuk Ke Dashboard</span>
                )}
              </Button>
            </form>

            {/* Powered By Tim IT YAPI */}
            <div className="pt-1 text-center text-xs text-muted-foreground font-medium flex items-center justify-center gap-1.5">
              <span>Powered By</span>
              <span className="text-foreground font-bold font-serif">Tim IT YAPI</span>
            </div>
          </Card>
        </main>

        {/* RIGHT COLUMN: Statistics & Info */}
        <section className="col-span-3 hidden xl:flex flex-col gap-6 justify-center">
          <Card className="bg-card/75 backdrop-blur-xl border-border/80 rounded-[2.5rem] p-6 shadow-xl flex flex-col gap-5">
            <h3 className="text-base font-black font-serif text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <span>Statistik Yayasan</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/40 border border-border/60 rounded-2xl text-center">
                <span className="text-lg font-black text-primary font-serif">11.000+</span>
                <p className="text-[9px] text-muted-foreground font-semibold mt-0.5">Total Aset</p>
              </div>
              <div className="p-3 bg-muted/40 border border-border/60 rounded-2xl text-center">
                <span className="text-lg font-black text-primary font-serif">4</span>
                <p className="text-[9px] text-muted-foreground font-semibold mt-0.5">Unit Kerja</p>
              </div>
              <div className="p-3 bg-muted/40 border border-border/60 rounded-2xl text-center">
                <span className="text-lg font-black text-primary font-serif">20+</span>
                <p className="text-[9px] text-muted-foreground font-semibold mt-0.5">Lokasi Ruang</p>
              </div>
              <div className="p-3 bg-muted/40 border border-border/60 rounded-2xl text-center">
                <span className="text-lg font-black text-primary font-serif">98%</span>
                <p className="text-[9px] text-muted-foreground font-semibold mt-0.5">Kondisi Baik</p>
              </div>
            </div>

            <hr className="border-border" />

            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-primary" />
                <span>Bantuan Teknis</span>
              </h4>
              <p className="text-[9px] text-muted-foreground leading-relaxed">Kendala akun atau hak akses unit? Hubungi administrator:</p>
              <a 
                href="mailto:support@simaya.id" 
                className="text-[10px] text-primary font-bold hover:underline"
              >
                support@simaya.id
              </a>
            </div>
          </Card>
        </section>

      </div>
    </div>
  );
}
