"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { FileText, Plus, AlertTriangle, User, Calendar, Menu } from "lucide-react";

export default function ReportsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const reports = [
    { id: 1, title: "AC Bocor Air & Tidak Dingin", asset: "AC Split Samsung 1.5 PK (Kelas VII-A)", reporter: "Dian Pratama", date: "11 Juni 2026", level: "Medium" },
    { id: 2, title: "Proyektor Mati Total Tiba-tiba", asset: "Proyektor Epson EB-X41 (Kelas VII-B)", reporter: "Lutfi Hakim", date: "10 Juni 2026", level: "Tinggi" },
  ];

  return (
    <div className="flex bg-background min-h-screen relative overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 p-4 sm:p-6 md:p-10 flex flex-col gap-6 md:gap-8 overflow-y-auto max-h-screen w-full">
        
        <header className="flex justify-between items-center bg-white border border-border-peach/60 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 rounded-2xl bg-background border border-border-peach hover:text-primary flex lg:hidden items-center justify-center transition-colors flex-shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold font-serif text-foreground">Laporan Kerusakan</h2>
              <p className="text-xs text-foreground/50 font-medium mt-1">Pantau dan tindaklanjuti laporan kerusakan aset dari unit/guru.</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold text-xs shadow-md shadow-primary/10 transition-colors w-full sm:w-auto justify-center">
            <Plus className="w-4 h-4" />
            <span>Buat Laporan Baru</span>
          </button>
        </header>

        <section className="flex flex-col gap-6">
          {reports.map((report) => (
            <div key={report.id} className="bg-white border border-border-peach rounded-3xl p-6 shadow-card hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-extrabold text-foreground font-serif">{report.title}</h3>
                  <span className="text-xs font-semibold text-foreground/60 mt-0.5">{report.asset}</span>
                  <div className="flex items-center gap-4 text-[10px] font-bold text-foreground/45 mt-2.5">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      <span>Oleh: {report.reporter}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{report.date}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 w-full md:w-auto justify-between">
                <span className={`flex items-center gap-1.5 text-xs font-bold ${
                  report.level === "Tinggi" ? "text-red-500" : "text-amber-500"
                }`}>
                  <AlertTriangle className="w-4 h-4" />
                  <span>Prioritas: {report.level}</span>
                </span>
                <button className="px-4 py-2 bg-primary-light hover:bg-primary-light/80 text-primary rounded-xl font-bold text-xs transition-colors">
                  Proses
                </button>
              </div>
            </div>
          ))}
        </section>

      </main>
    </div>
  );
}
