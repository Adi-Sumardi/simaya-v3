"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Settings, Save, Shield, Database, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/context/ToastContext";

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toast = useToast();

  const handleSave = () => {
    toast.success("Pengaturan aplikasi berhasil disimpan!");
  };

  return (
    <div className="flex bg-background min-h-screen relative overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col gap-6 overflow-y-auto max-h-screen w-full">
        
        <header className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden rounded-2xl shrink-0"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold font-serif text-foreground">Pengaturan Sistem</h2>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Konfigurasi preferensi aplikasi, integrasi API, dan parameter sistem.</p>
            </div>
          </div>
          <Button onClick={handleSave} className="rounded-2xl gap-2 h-11 px-5 shadow-md shadow-primary/20 text-xs font-bold">
            <Save className="w-4 h-4" />
            <span>Simpan Pengaturan</span>
          </Button>
        </header>

        <Card className="rounded-3xl shadow-sm">
          <CardContent className="p-6 sm:p-8 flex flex-col gap-8">
            {/* General Section */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-black text-primary uppercase tracking-wider flex items-center gap-2">
                <Settings className="w-4.5 h-4.5" />
                <span>Pengaturan Umum</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="app-name">Nama Aplikasi</Label>
                  <Input 
                    id="app-name"
                    type="text" 
                    defaultValue="SIMAYA - Sistem Informasi Manajemen Aset"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="app-unit">Default Unit Kerja</Label>
                  <select 
                    id="app-unit"
                    className="flex h-10 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option>Kantor Pusat Yayasan</option>
                    <option>Unit SD Islam</option>
                    <option>Unit SMP 12</option>
                    <option>Unit SMP 55</option>
                  </select>
                </div>
              </div>
            </div>

            <hr className="border-border" />

            {/* Database Section */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-black text-primary uppercase tracking-wider flex items-center gap-2">
                <Database className="w-4.5 h-4.5" />
                <span>Integrasi & API Backend</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="api-url">Endpoint URL Backend (Laravel)</Label>
                  <Input 
                    id="api-url"
                    type="url" 
                    defaultValue="http://localhost:8000/api"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="api-key">API Key Authorization</Label>
                  <Input 
                    id="api-key"
                    type="password" 
                    defaultValue="••••••••••••••••••••••••••••"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
