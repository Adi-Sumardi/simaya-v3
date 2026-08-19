"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { FileText, Plus, AlertTriangle, User, Calendar, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ReportsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const reports = [
    { id: 1, title: "AC Bocor Air & Tidak Dingin", asset: "AC Split Samsung 1.5 PK (Kelas VII-A)", reporter: "Dian Pratama", date: "11 Juni 2026", level: "Sedang" },
    { id: 2, title: "Proyektor Mati Total Tiba-tiba", asset: "Proyektor Epson EB-X41 (Kelas VII-B)", reporter: "Lutfi Hakim", date: "10 Juni 2026", level: "Tinggi" },
  ];

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
              <h2 className="text-xl sm:text-2xl font-extrabold font-serif text-foreground">Laporan Kerusakan</h2>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Pantau dan tindaklanjuti laporan kerusakan aset dari unit atau pengajar.</p>
            </div>
          </div>
          <Button className="rounded-2xl gap-2 h-11 px-5 shadow-md shadow-primary/20 text-xs font-bold">
            <Plus className="w-4 h-4" />
            <span>Buat Laporan Baru</span>
          </Button>
        </header>

        <section className="flex flex-col gap-4">
          {reports.map((report) => (
            <Card key={report.id} className="rounded-3xl shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-base font-extrabold text-foreground font-serif">{report.title}</h3>
                    <span className="text-xs font-semibold text-muted-foreground">{report.asset}</span>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground mt-2">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        <span>Pelapor: {report.reporter}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{report.date}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 border-t border-border md:border-t-0 pt-4 md:pt-0 w-full md:w-auto justify-between">
                  <Badge 
                    variant={report.level === "Tinggi" ? "destructive" : "warning"}
                    className="text-[10px] font-bold gap-1"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Prioritas: {report.level}</span>
                  </Badge>
                  <Button variant="primaryLight" size="sm" className="rounded-xl font-bold text-xs">
                    Proses
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
