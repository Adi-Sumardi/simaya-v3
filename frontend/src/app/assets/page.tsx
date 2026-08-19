"use client";

import { useState, useMemo, useEffect } from "react";
import Pagination from "@/components/ui/Pagination";
import Sidebar from "@/components/layout/Sidebar";
import AssetQrSticker from "@/components/common/AssetQrSticker";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { 
  Boxes, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Menu, 
  Building, 
  MapPin, 
  Camera, 
  Settings2,
  Trash,
  QrCode,
  Download,
  Upload,
  Info,
  Calendar,
  FileText,
  DollarSign,
  Tag,
  Wrench,
  Loader2,
  ExternalLink,
  ShieldCheck,
  TrendingDown,
  Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

export default function AssetsPage() {
  const toast = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all"); // "all" or unit_id
  
  // Modals state
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState<any | null>(null);
  const [viewModal, setViewModal] = useState<any | null>(null);
  const [bulkUnitLocationModal, setBulkUnitLocationModal] = useState(false);
  const [bulkPhotoModal, setBulkPhotoModal] = useState(false);
  const [importExcelModal, setImportExcelModal] = useState(false);
  const [qrCodePrintModal, setQrCodePrintModal] = useState(false);

  // Advanced Filter state
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCondition, setFilterCondition] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Selected Assets Details for Print Modal
  const [selectedAssetsDetails, setSelectedAssetsDetails] = useState<any[]>([]);
  const [loadingSelectedDetails, setLoadingSelectedDetails] = useState(false);

  // Dynamic States loaded from Laravel API
  const [mockUnits, setMockUnits] = useState<any[]>([]);
  const [mockLocations, setMockLocations] = useState<any[]>([]);
  const [mockCategories, setMockCategories] = useState<any[]>([]);
  const [mockTools, setMockTools] = useState<any[]>([]);
  const [mockYears, setMockYears] = useState<any[]>([]);
  const [mockAktiva, setMockAktiva] = useState<any[]>([]);
  const [statsData, setStatsData] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("auth_user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setCurrentUser(u);
      } catch (e) {}
    }
  }, []);

  const isUnitRole = currentUser?.role === "Unit" || (!["super_admin", "admin"].includes(currentUser?.role) && !!currentUser?.unit_id);

  // Primary assets data state
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Debounce search input to searchQuery
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch all support metadata from Laravel API once on mount
  const fetchMetadata = async () => {
    try {
      const [unitsData, locationsData, categoriesData, toolsData, yearsData, aktivaData, statsResp] = await Promise.all([
        api.get("/units/all"),
        api.get("/locations/all"),
        api.get("/categories/all"),
        api.get("/tools/all"),
        api.get("/years/all"),
        api.get("/aktivas/all"),
        api.get("/assets/stats"),
      ]);

      setMockUnits(unitsData || []);
      setMockLocations(locationsData || []);
      setMockCategories(categoriesData || []);
      setMockTools(toolsData || []);
      setMockYears(yearsData || []);
      setMockAktiva(aktivaData || []);
      setStatsData(statsResp || null);
    } catch (err) {
      console.error("Failed to load metadata from backend", err);
    }
  };

  // Fetch paginated Assets with server-side query filters
  const fetchAssets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", currentPage.toString());
      params.set("per_page", perPage.toString());

      if (activeTab !== "all") {
        params.set("unit_id", activeTab);
      }
      if (searchQuery.trim()) {
        params.set("search", searchQuery.trim());
      }
      if (filterStatus !== "all") {
        params.set("status", filterStatus);
      }
      if (filterCondition !== "all") {
        params.set("condition", filterCondition);
      }
      if (filterCategory !== "all") {
        params.set("category_id", filterCategory);
      }
      if (filterLocation !== "all") {
        params.set("location_id", filterLocation);
      }

      const response = await api.get(`/assets?${params.toString()}`);
      setAssets(response.data || []);
      setTotalItems(response.meta?.total || response.total || 0);
      setTotalPages(response.meta?.last_page || response.last_page || 1);
    } catch (err) {
      console.error("Failed to load assets from backend", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = () => {
    fetchMetadata();
    fetchAssets();
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [currentPage, perPage, activeTab, searchQuery, filterStatus, filterCondition, filterCategory, filterLocation]);

  // Fetch details of selected assets for print modal
  useEffect(() => {
    if (qrCodePrintModal && selectedIds.length > 0) {
      const fetchDetails = async () => {
        try {
          setLoadingSelectedDetails(true);
          const resp = await api.get(`/assets?ids=${selectedIds.join(",")}&per_page=9999`);
          setSelectedAssetsDetails(resp.data || []);
        } catch (err) {
          console.error("Failed to load details for selected assets", err);
        } finally {
          setLoadingSelectedDetails(false);
        }
      };
      fetchDetails();
    } else {
      setSelectedAssetsDetails([]);
    }
  }, [qrCodePrintModal, selectedIds]);

  // Form State variables
  const [formData, setFormData] = useState({
    name: "",
    entries_number: "1",
    brand: "",
    description: "",
    status: "active",
    condition: "bagus",
    portability: "portable",
    price: "",
    depreciation_rate: "10",
    aquisition: "YAPI",
    aquisition_date: new Date().toISOString().split("T")[0],
    unit_id: "",
    location_id: "",
    tool_id: "",
    category_id: "",
    year_id: "",
    aktiva_id: "",
    image_file: null as any
  });

  useEffect(() => {
    if (mockUnits.length > 0 && !formData.unit_id) {
      const defaultUnit = isUnitRole && currentUser?.unit_id 
        ? String(currentUser.unit?.id || currentUser.unit_id)
        : String(mockUnits[0]?.id || "1");
      const matchedLocs = mockLocations.filter(l => String(l.unit_id) === defaultUnit);
      setFormData(prev => ({
        ...prev,
        unit_id: defaultUnit,
        location_id: String(matchedLocs[0]?.id || mockLocations[0]?.id || "1"),
        tool_id: String(mockTools[0]?.id || "1"),
        category_id: String(mockCategories[0]?.id || "1"),
        year_id: String(mockYears[0]?.id || "1"),
        aktiva_id: String(mockAktiva[0]?.id || "1"),
      }));
    }
  }, [mockUnits, mockLocations, mockTools, mockCategories, mockYears, mockAktiva, currentUser, isUnitRole]);

  // Bulk actions states
  const [bulkUnit, setBulkUnit] = useState("");
  const [bulkLocation, setBulkLocation] = useState("");
  const [bulkPhotoFile, setBulkPhotoFile] = useState<File | null>(null);

  const handleToggleSelectRow = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleToggleSelectAll = (filteredAssets: any[]) => {
    const filteredIds = filteredAssets.map(a => a.id);
    const allSelected = filteredIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(selectedIds.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedIds(Array.from(new Set([...selectedIds, ...filteredIds])));
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        name: formData.name,
        entries_number: Number(formData.entries_number),
        brand: formData.brand,
        description: formData.description,
        status: formData.status,
        condition: formData.condition,
        portability: formData.portability,
        price: Number(formData.price || 0),
        depreciation_rate: formData.depreciation_rate ? Number(formData.depreciation_rate) : 10,
        aquisition: formData.aquisition,
        aquisition_date: formData.aquisition_date || new Date().toISOString().split("T")[0],
        unit_id: Number(formData.unit_id),
        location_id: Number(formData.location_id),
        tool_id: Number(formData.tool_id),
        category_id: Number(formData.category_id),
        year_id: Number(formData.year_id),
        aktiva_id: Number(formData.aktiva_id)
      };

      if (formData.image_file) {
        const data = new FormData();
        Object.entries(payload).forEach(([k, v]) => data.append(k, String(v)));
        data.append("image_file", formData.image_file);
        await api.post("/assets", data);
      } else {
        await api.post("/assets", payload);
      }

      setCreateModal(false);
      resetForm();
      toast.success("Aset inventaris berhasil ditambahkan!");
      fetchAllData();
    } catch (err: any) {
      toast.error(err.message || "Gagal menambahkan aset");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        name: editModal.name,
        entries_number: Number(editModal.entries_number),
        brand: editModal.brand,
        description: editModal.description,
        status: editModal.status,
        condition: editModal.condition,
        portability: editModal.portability,
        price: Number(editModal.price || 0),
        depreciation_rate: editModal.depreciation_rate ? Number(editModal.depreciation_rate) : 10,
        aquisition: editModal.aquisition,
        aquisition_date: editModal.aquisition_date || new Date().toISOString().split("T")[0],
        unit_id: Number(editModal.unit_id),
        location_id: Number(editModal.location_id),
        tool_id: Number(editModal.tool_id),
        category_id: Number(editModal.category_id),
        year_id: Number(editModal.year_id),
        aktiva_id: Number(editModal.aktiva_id)
      };

      if (editModal.image_file) {
        const data = new FormData();
        Object.entries(payload).forEach(([k, v]) => data.append(k, String(v)));
        data.append("image_file", editModal.image_file);
        await api.put(`/assets/${editModal.id}`, data);
      } else {
        await api.put(`/assets/${editModal.id}`, payload);
      }

      setEditModal(null);
      toast.success("Aset inventaris berhasil diperbarui!");
      fetchAllData();
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui aset");
    }
  };

  const handleDeleteAsset = (id: number) => {
    toast.confirm("Apakah Anda yakin ingin menghapus aset ini?", async () => {
      try {
        await api.delete(`/assets/${id}`);
        setSelectedIds(selectedIds.filter(x => x !== id));
        toast.success("Aset berhasil dihapus!");
        fetchAllData();
      } catch (err: any) {
        toast.error(err.message || "Gagal menghapus aset");
      }
    });
  };

  const resetForm = () => {
    const defaultUnit = String(mockUnits[0]?.id || "1");
    const matchedLocs = mockLocations.filter(l => String(l.unit_id) === defaultUnit);
    setFormData({
      name: "",
      entries_number: "1",
      brand: "",
      description: "",
      status: "active",
      condition: "bagus",
      portability: "portable",
      price: "",
      depreciation_rate: "10",
      aquisition: "YAPI",
      aquisition_date: new Date().toISOString().split("T")[0],
      unit_id: defaultUnit,
      location_id: String(matchedLocs[0]?.id || mockLocations[0]?.id || "1"),
      tool_id: String(mockTools[0]?.id || "1"),
      category_id: String(mockCategories[0]?.id || "1"),
      year_id: String(mockYears[0]?.id || "1"),
      aktiva_id: String(mockAktiva[0]?.id || "1"),
      image_file: null
    });
  };

  const handleExecuteBulkUnitLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/assets/bulk-update", {
        ids: selectedIds,
        unit_id: Number(bulkUnit),
        location_id: Number(bulkLocation)
      });
      toast.success("Unit dan Lokasi aset berhasil diperbarui secara massal!");
      setSelectedIds([]);
      setBulkUnitLocationModal(false);
      fetchAllData();
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui aset massal");
    }
  };

  const handleExecuteBulkPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkPhotoFile) {
      toast.error("Pilih file foto terlebih dahulu");
      return;
    }
    try {
      const data = new FormData();
      selectedIds.forEach(id => data.append("ids[]", String(id)));
      data.append("image_file", bulkPhotoFile);

      await api.post("/assets/bulk-add-photo", data);
      toast.success("Foto massal berhasil dipasang pada aset terpilih!");
      setSelectedIds([]);
      setBulkPhotoFile(null);
      setBulkPhotoModal(false);
      fetchAllData();
    } catch (err: any) {
      toast.error(err.message || "Gagal memasang foto massal");
    }
  };

  const handleExportExcel = () => {
    toast.info("Unduhan file Excel data aset sedang dipersiapkan...");
  };

  const totalAllAssets = useMemo(() => {
    return mockUnits.reduce((acc, u) => acc + (u.asset_count || 0), 0);
  }, [mockUnits]);

  const handleFilterChange = (setter: (v: any) => void, value: any) => {
    setter(value);
    setCurrentPage(1);
  };

  return (
    <div className="flex bg-background min-h-screen relative overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col gap-6 w-full min-h-screen pb-20 relative">
        
        {/* Header */}
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
              <h2 className="text-xl sm:text-2xl font-extrabold font-serif text-foreground">Daftar Assets</h2>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Registrasi, kelola, cetak label barcode QR, dan ekspor database aset yayasan.</p>
            </div>
          </div>
          <div className="flex gap-2.5 w-full sm:w-auto flex-wrap">
            <Button 
              variant="outline"
              onClick={() => setImportExcelModal(true)}
              className="flex-1 sm:flex-none gap-2 rounded-2xl h-11 px-4 text-xs font-bold"
            >
              <Upload className="w-4 h-4" />
              <span>Import Excel</span>
            </Button>
            <Button 
              variant="outline"
              onClick={handleExportExcel}
              className="flex-1 sm:flex-none gap-2 rounded-2xl h-11 px-4 text-xs font-bold"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
            <Button 
              onClick={() => setCreateModal(true)}
              className="flex-1 sm:flex-none gap-2 rounded-2xl h-11 px-5 text-xs font-bold shadow-md shadow-primary/20"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Asset</span>
            </Button>
          </div>
        </header>

        {/* Tab Unit / Condition Selector (Filament Parity) */}
        <section className="flex flex-wrap gap-2 items-center w-full">
          {isUnitRole ? (
            // Filament Unit Condition Tabs: Semua Aset, Kondisi Bagus, Kondisi Rusak, Non-Aktif
            <>
              <Button
                variant={filterCondition === "all" && filterStatus === "all" ? "default" : "outline"}
                onClick={() => {
                  setFilterCondition("all");
                  setFilterStatus("all");
                  setCurrentPage(1);
                  setSelectedIds([]);
                }}
                className={`rounded-2xl text-xs font-bold gap-2 shrink-0 ${filterCondition === "all" && filterStatus === "all" ? "shadow-sm shadow-primary/20" : "bg-card"}`}
              >
                <span>Semua Aset Unit</span>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${filterCondition === "all" && filterStatus === "all" ? "bg-white/20 text-white" : "bg-muted text-foreground"}`}>
                  {statsData?.total_assets ?? totalAllAssets}
                </span>
              </Button>

              <Button
                variant={filterCondition === "bagus" ? "default" : "outline"}
                onClick={() => {
                  setFilterCondition("bagus");
                  setFilterStatus("all");
                  setCurrentPage(1);
                  setSelectedIds([]);
                }}
                className={`rounded-2xl text-xs font-bold gap-2 shrink-0 ${filterCondition === "bagus" ? "shadow-sm shadow-primary/20" : "bg-card"}`}
              >
                <span>Kondisi Bagus</span>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${filterCondition === "bagus" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"}`}>
                  {statsData?.conditions?.bagus ?? 0}
                </span>
              </Button>

              <Button
                variant={filterCondition === "rusak" ? "default" : "outline"}
                onClick={() => {
                  setFilterCondition("rusak");
                  setFilterStatus("all");
                  setCurrentPage(1);
                  setSelectedIds([]);
                }}
                className={`rounded-2xl text-xs font-bold gap-2 shrink-0 ${filterCondition === "rusak" ? "shadow-sm shadow-primary/20" : "bg-card"}`}
              >
                <span>Kondisi Rusak</span>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${filterCondition === "rusak" ? "bg-white/20 text-white" : "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400"}`}>
                  {statsData?.conditions?.rusak ?? 0}
                </span>
              </Button>

              <Button
                variant={filterStatus === "inactive" || filterStatus === "repaired" ? "default" : "outline"}
                onClick={() => {
                  setFilterCondition("all");
                  setFilterStatus("inactive,repaired");
                  setCurrentPage(1);
                  setSelectedIds([]);
                }}
                className={`rounded-2xl text-xs font-bold gap-2 shrink-0 ${filterStatus === "inactive" || filterStatus === "repaired" ? "shadow-sm shadow-primary/20" : "bg-card"}`}
              >
                <span>Perlu Perbaikan / Non-Aktif</span>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${filterStatus === "inactive" || filterStatus === "repaired" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"}`}>
                  {(statsData?.statuses?.repaired ?? 0) + (statsData?.statuses?.inactive ?? 0)}
                </span>
              </Button>
            </>
          ) : (
            // Admin Superadmin Unit Tabs
            <>
              <Button
                variant={activeTab === "all" ? "default" : "outline"}
                onClick={() => { handleFilterChange(setActiveTab, "all"); setSelectedIds([]); }}
                className={`rounded-2xl text-xs font-bold gap-2 shrink-0 ${activeTab === "all" ? "shadow-sm shadow-primary/20" : "bg-card"}`}
              >
                <span>Semua Unit</span>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${activeTab === "all" ? "bg-white/20 text-white" : "bg-muted text-foreground"}`}>
                  {totalAllAssets}
                </span>
              </Button>
              {mockUnits.map(unit => {
                const count = unit.asset_count || 0;
                const isCurrent = activeTab === unit.id.toString();
                return (
                  <Button
                    key={unit.id}
                    variant={isCurrent ? "default" : "outline"}
                    onClick={() => { handleFilterChange(setActiveTab, unit.id.toString()); setSelectedIds([]); }}
                    className={`rounded-2xl text-xs font-bold gap-2 shrink-0 ${isCurrent ? "shadow-sm shadow-primary/20" : "bg-card"}`}
                  >
                    <span>{unit.name}</span>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${isCurrent ? "bg-white/20 text-white" : "bg-secondary-light text-secondary"}`}>
                      {count}
                    </span>
                  </Button>
                );
              })}
            </>
          )}
        </section>

        {/* Filters and Search Bar */}
        <Card className="rounded-3xl shadow-sm">
          <CardContent className="p-5 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                <Input 
                  type="text" 
                  placeholder="Cari nama aset, brand, nomor urut..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9 h-11 rounded-2xl text-xs bg-card w-full"
                />
              </div>

              <Button 
                variant={filterOpen ? "primaryLight" : "outline"}
                onClick={() => setFilterOpen(!filterOpen)}
                className="gap-2 rounded-2xl h-11 px-5 text-xs font-bold w-full sm:w-auto shrink-0"
              >
                <Filter className="w-4 h-4" />
                <span>{filterOpen ? "Tutup Filter" : "Filter Lanjutan"}</span>
              </Button>
            </div>

            {/* Collapsible Filter Forms */}
            {filterOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border animate-in fade-in duration-200">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[10px]">Kondisi</Label>
                  <select 
                    value={filterCondition} 
                    onChange={(e) => handleFilterChange(setFilterCondition, e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="all">Semua Kondisi</option>
                    <option value="bagus">Bagus</option>
                    <option value="rusak">Rusak</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-[10px]">Status</Label>
                  <select 
                    value={filterStatus} 
                    onChange={(e) => handleFilterChange(setFilterStatus, e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="all">Semua Status</option>
                    <option value="active">Aktif</option>
                    <option value="inactive">Tidak Aktif</option>
                    <option value="repaired">Diperbaiki</option>
                    <option value="transferred">Ditransfer</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-[10px]">Kategori</Label>
                  <select 
                    value={filterCategory} 
                    onChange={(e) => handleFilterChange(setFilterCategory, e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="all">Semua Kategori</option>
                    {mockCategories.map(c => (
                      <option key={c.id} value={c.id.toString()}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-[10px]">Lokasi Ruangan</Label>
                  <select 
                    value={filterLocation} 
                    onChange={(e) => handleFilterChange(setFilterLocation, e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="all">Semua Lokasi</option>
                    {mockLocations.map(l => (
                      <option key={l.id} value={l.id.toString()}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bulk Action Sticky Bar */}
        {selectedIds.length > 0 && (
          <div className="p-4 bg-primary-light border border-primary/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs font-black px-3 py-1">
                {selectedIds.length} Aset Terpilih
              </Badge>
              <span className="text-xs text-muted-foreground font-semibold">Aksi massal:</span>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Button 
                size="sm"
                variant="outline"
                onClick={() => setBulkUnitLocationModal(true)}
                className="rounded-xl gap-1.5 bg-card"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Pindah Unit & Lokasi</span>
              </Button>
              <Button 
                size="sm"
                variant="outline"
                onClick={() => setBulkPhotoModal(true)}
                className="rounded-xl gap-1.5 bg-card"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Pasang Foto Massal</span>
              </Button>
              <Button 
                size="sm"
                variant="outline"
                onClick={() => setQrCodePrintModal(true)}
                className="rounded-xl gap-1.5 bg-card text-sky-600 border-sky-200"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Cetak QR ({selectedIds.length})</span>
              </Button>
              <Button 
                size="sm"
                variant="destructive"
                onClick={() => {
                  toast.confirm(`Yakin hapus ${selectedIds.length} aset terpilih?`, async () => {
                    try {
                      await api.post("/assets/bulk-delete", { ids: selectedIds });
                      setSelectedIds([]);
                      toast.success("Aset terpilih berhasil dihapus!");
                      fetchAllData();
                    } catch (err: any) {
                      toast.error(err.message || "Gagal menghapus aset massal");
                    }
                  });
                }}
                className="rounded-xl gap-1.5"
              >
                <Trash className="w-3.5 h-3.5" />
                <span>Hapus Terpilih</span>
              </Button>
            </div>
          </div>
        )}

        {/* Primary Assets Table */}
        <Card className="rounded-3xl shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">
                    <Checkbox
                      checked={assets.length > 0 && assets.every(a => selectedIds.includes(a.id))}
                      onCheckedChange={() => handleToggleSelectAll(assets)}
                    />
                  </TableHead>
                  <TableHead>Nama Aset & Kode</TableHead>
                  <TableHead>Unit & Lokasi</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Kondisi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Nilai Buku (Rp)</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-16 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <span className="text-xs font-bold">Memuat data aset inventaris...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : assets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-16 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Boxes className="w-10 h-10 opacity-30" />
                        <span className="text-xs font-bold">Tidak ada aset ditemukan sesuai kriteria.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  assets.map((asset) => {
                    const isSelected = selectedIds.includes(asset.id);
                    return (
                      <TableRow 
                        key={asset.id} 
                        data-state={isSelected ? "selected" : undefined}
                      >
                        <TableCell className="text-center">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleToggleSelectRow(asset.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-extrabold text-foreground">{asset.name}</span>
                            <span className="text-[10px] font-bold text-muted-foreground font-mono">
                              #{asset.entries_number} &bull; {asset.brand || "Tanpa Merk"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground">{asset.unit?.name || "—"}</span>
                            <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                              {asset.location?.name || "—"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] font-bold bg-muted/60">
                            {asset.category?.name || "Umum"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={asset.condition === "bagus" ? "success" : "destructive"} 
                            className="text-[10px] font-bold uppercase"
                          >
                            {asset.condition === "bagus" ? "Bagus" : "Rusak"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              asset.status === "active" 
                                ? "success" 
                                : asset.status === "repaired" 
                                ? "warning" 
                                : asset.status === "transferred"
                                ? "info"
                                : "destructive"
                            } 
                            className="text-[10px] font-bold uppercase"
                          >
                            {asset.status === "active" ? "Aktif" : asset.status === "repaired" ? "Diperbaiki" : asset.status === "transferred" ? "Ditransfer" : "Tidak Aktif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold text-foreground">
                          Rp {(asset.book_value !== undefined ? asset.book_value : asset.price)?.toLocaleString("id-ID") || 0}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setViewModal(asset)}
                              className="h-8 w-8 rounded-lg hover:text-primary hover:bg-muted"
                              title="Lihat Detail & QR"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setEditModal(asset)}
                              className="h-8 w-8 rounded-lg hover:text-primary hover:bg-muted"
                              title="Ubah Aset"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteAsset(asset.id)}
                              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              title="Hapus Aset"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              perPage={perPage}
              onPageChange={setCurrentPage}
              onPerPageChange={setPerPage}
            />
          </CardContent>
        </Card>

      </main>

      {/* Create Asset Dialog */}
      <Dialog open={createModal} onOpenChange={setCreateModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] rounded-3xl p-6 overflow-hidden flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold font-serif">Tambah Data Aset</DialogTitle>
            <DialogDescription className="text-xs">
              Isi data inventaris baru secara lengkap sesuai unit, lokasi, dan klasifikasi aktiva.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto flex flex-col gap-4 pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="add-name">Nama Aset</Label>
                <Input 
                  id="add-name"
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Laptop Lenovo ThinkPad L13" 
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="add-brand">Merk / Brand</Label>
                <Input 
                  id="add-brand"
                  type="text" 
                  value={formData.brand} 
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="Contoh: Lenovo / Epson" 
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="add-unit">Unit Kerja</Label>
                  {isUnitRole && <span className="text-[9px] font-bold text-primary">(Terkunci)</span>}
                </div>
                <select 
                  id="add-unit"
                  value={formData.unit_id} 
                  disabled={isUnitRole}
                  onChange={(e) => {
                    const newUnit = e.target.value;
                    const matchedLocs = mockLocations.filter(l => String(l.unit_id) === newUnit);
                    setFormData({ 
                      ...formData, 
                      unit_id: newUnit,
                      location_id: String(matchedLocs[0]?.id || mockLocations[0]?.id || "1")
                    });
                  }}
                  className={`flex h-10 w-full rounded-xl border border-input px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${isUnitRole ? "bg-muted/60 opacity-80 cursor-not-allowed" : "bg-card"}`}
                  required
                >
                  {mockUnits.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="add-loc">Lokasi / Ruangan</Label>
                <select 
                  id="add-loc"
                  value={formData.location_id} 
                  onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                  className="flex h-10 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  required
                >
                  {mockLocations.filter(l => !formData.unit_id || String(l.unit_id) === String(formData.unit_id)).map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="add-category">Kategori</Label>
                <select 
                  id="add-category"
                  value={formData.category_id} 
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="flex h-10 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  required
                >
                  {mockCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="add-tool">Alat / Barang</Label>
                <select 
                  id="add-tool"
                  value={formData.tool_id} 
                  onChange={(e) => setFormData({ ...formData, tool_id: e.target.value })}
                  className="flex h-10 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  required
                >
                  {mockTools.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="add-year">Tahun Pengadaan</Label>
                <select 
                  id="add-year"
                  value={formData.year_id} 
                  onChange={(e) => setFormData({ ...formData, year_id: e.target.value })}
                  className="flex h-10 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  required
                >
                  {mockYears.map(y => (
                    <option key={y.id} value={y.id}>{y.year || y.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="add-aktiva">Klasifikasi Aktiva</Label>
                <select 
                  id="add-aktiva"
                  value={formData.aktiva_id} 
                  onChange={(e) => setFormData({ ...formData, aktiva_id: e.target.value })}
                  className="flex h-10 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  required
                >
                  {mockAktiva.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="add-condition">Kondisi</Label>
                <select 
                  id="add-condition"
                  value={formData.condition} 
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="flex h-10 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  required
                >
                  <option value="bagus">Bagus</option>
                  <option value="rusak">Rusak</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="add-status">Status</Label>
                <select 
                  id="add-status"
                  value={formData.status} 
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="flex h-10 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  required
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                  <option value="repaired">Diperbaiki</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="add-portability">Tipe Portabilitas</Label>
                <select 
                  id="add-portability"
                  value={formData.portability} 
                  onChange={(e) => setFormData({ ...formData, portability: e.target.value })}
                  className="flex h-10 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  required
                >
                  <option value="portable">Portable</option>
                  <option value="fixtures">Fixtures (Non-portable)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="add-price">Harga Perolehan (Rp)</Label>
                <Input 
                  id="add-price"
                  type="number" 
                  value={formData.price} 
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="Contoh: 15000000" 
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="add-depreciation">Penyusutan / Tahun (%)</Label>
                <Input 
                  id="add-depreciation"
                  type="number" 
                  value={formData.depreciation_rate} 
                  onChange={(e) => setFormData({ ...formData, depreciation_rate: e.target.value })}
                  placeholder="10 (default)" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="add-aquisition">Pemilik / Sumber Perolehan</Label>
                <Input 
                  id="add-aquisition"
                  type="text" 
                  value={formData.aquisition} 
                  onChange={(e) => setFormData({ ...formData, aquisition: e.target.value })}
                  placeholder="Contoh: YAPI / BOS / Hibah" 
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="add-date">Tanggal Perolehan</Label>
                <Input 
                  id="add-date"
                  type="date" 
                  value={formData.aquisition_date} 
                  onChange={(e) => setFormData({ ...formData, aquisition_date: e.target.value })}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="add-img">Upload Foto Aset (Opsional)</Label>
                <Input 
                  id="add-img"
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, image_file: e.target.files?.[0] || null })}
                  className="cursor-pointer"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="add-desc">Deskripsi / Spesifikasi</Label>
              <Textarea 
                id="add-desc"
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Catatan tambahan spesifikasi aset..."
                rows={2}
              />
            </div>

            <DialogFooter className="mt-2">
              <Button type="button" variant="outline" onClick={() => setCreateModal(false)} className="rounded-xl">
                Batal
              </Button>
              <Button type="submit" className="rounded-xl shadow-md shadow-primary/20">
                Simpan Aset
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Asset Dialog */}
      <Dialog open={!!editModal} onOpenChange={(open) => !open && setEditModal(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] rounded-3xl p-6 overflow-hidden flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold font-serif">Ubah Data Aset</DialogTitle>
            <DialogDescription className="text-xs">
              Perbarui detail informasi aset inventaris.
            </DialogDescription>
          </DialogHeader>

          {editModal && (
            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto flex flex-col gap-4 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label htmlFor="edit-name">Nama Aset</Label>
                  <Input 
                    id="edit-name"
                    type="text" 
                    value={editModal.name} 
                    onChange={(e) => setEditModal({ ...editModal, name: e.target.value })}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-brand">Merk / Brand</Label>
                  <Input 
                    id="edit-brand"
                    type="text" 
                    value={editModal.brand || ""} 
                    onChange={(e) => setEditModal({ ...editModal, brand: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit-unit">Unit Kerja</Label>
                    {isUnitRole && <span className="text-[9px] font-bold text-primary">(Terkunci)</span>}
                  </div>
                  <select 
                    id="edit-unit"
                    value={editModal.unit_id} 
                    disabled={isUnitRole}
                    onChange={(e) => {
                      const newUnit = Number(e.target.value);
                      const matchedLocs = mockLocations.filter(l => Number(l.unit_id) === newUnit);
                      setEditModal({ 
                        ...editModal, 
                        unit_id: newUnit,
                        location_id: Number(matchedLocs[0]?.id || mockLocations[0]?.id || 1)
                      });
                    }}
                    className={`flex h-10 w-full rounded-xl border border-input px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${isUnitRole ? "bg-muted/60 opacity-80 cursor-not-allowed" : "bg-card"}`}
                    required
                  >
                    {mockUnits.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-loc">Lokasi / Ruangan</Label>
                  <select 
                    id="edit-loc"
                    value={editModal.location_id} 
                    onChange={(e) => setEditModal({ ...editModal, location_id: Number(e.target.value) })}
                    className="flex h-10 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    required
                  >
                    {mockLocations.filter(l => !editModal.unit_id || Number(l.unit_id) === Number(editModal.unit_id)).map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-category">Kategori</Label>
                  <select 
                    id="edit-category"
                    value={editModal.category_id} 
                    onChange={(e) => setEditModal({ ...editModal, category_id: Number(e.target.value) })}
                    className="flex h-10 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    required
                  >
                    {mockCategories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-condition">Kondisi</Label>
                  <select 
                    id="edit-condition"
                    value={editModal.condition} 
                    onChange={(e) => setEditModal({ ...editModal, condition: e.target.value })}
                    className="flex h-10 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    required
                  >
                    <option value="bagus">Bagus</option>
                    <option value="rusak">Rusak</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-status">Status</Label>
                  <select 
                    id="edit-status"
                    value={editModal.status} 
                    onChange={(e) => setEditModal({ ...editModal, status: e.target.value })}
                    className="flex h-10 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    required
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Tidak Aktif</option>
                    <option value="repaired">Diperbaiki</option>
                    <option value="transferred">Ditransfer</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-price">Harga Perolehan (Rp)</Label>
                  <Input 
                    id="edit-price"
                    type="number" 
                    value={editModal.price || 0} 
                    onChange={(e) => setEditModal({ ...editModal, price: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-depreciation">Penyusutan / Tahun (%)</Label>
                  <Input 
                    id="edit-depreciation"
                    type="number" 
                    value={editModal.depreciation_rate !== undefined ? editModal.depreciation_rate : 10} 
                    onChange={(e) => setEditModal({ ...editModal, depreciation_rate: Number(e.target.value) })}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-aquisition">Pemilik / Sumber Perolehan</Label>
                  <Input 
                    id="edit-aquisition"
                    type="text" 
                    value={editModal.aquisition || "YAPI"} 
                    onChange={(e) => setEditModal({ ...editModal, aquisition: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-desc">Deskripsi</Label>
                <Textarea 
                  id="edit-desc"
                  value={editModal.description || ""} 
                  onChange={(e) => setEditModal({ ...editModal, description: e.target.value })}
                  rows={2}
                />
              </div>

              <DialogFooter className="mt-2">
                <Button type="button" variant="outline" onClick={() => setEditModal(null)} className="rounded-xl">
                  Batal
                </Button>
                <Button type="submit" className="rounded-xl shadow-md shadow-primary/20">
                  Simpan Perubahan
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Rich View Detail Infolist Modal */}
      <Dialog open={!!viewModal} onOpenChange={(open) => !open && setViewModal(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] rounded-3xl p-6 overflow-hidden flex flex-col gap-4">
          {viewModal && (
            <>
              {/* Modal Top Header */}
              <div className="flex gap-4 items-start pb-4 border-b border-border">
                <div className="w-14 h-14 rounded-2xl bg-primary-light text-primary border border-primary/20 flex items-center justify-center shrink-0">
                  <Boxes className="w-7 h-7" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-extrabold text-foreground font-serif leading-tight">{viewModal.name}</h3>
                    <Badge variant={viewModal.condition === "bagus" ? "success" : "destructive"} className="text-[10px] font-bold uppercase">
                      {viewModal.condition === "bagus" ? "Bagus" : "Rusak"}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] font-bold uppercase">
                      {viewModal.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono font-bold mt-1">
                    {viewModal.brand || "Tanpa Merk"} &bull; #{viewModal.entries_number}
                  </p>
                </div>
              </div>

              {/* Modal Scrollable Content */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-1">
                
                {/* Kode Lengkap & QR Code Preview */}
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-muted/40 p-4 rounded-2xl border border-border">
                  <div className="shrink-0 flex items-center justify-center">
                    <AssetQrSticker asset={viewModal} size="compact" className="shadow-sm" />
                  </div>
                  <div className="flex flex-col gap-1 w-full text-center sm:text-left">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Format Kode Lengkap</span>
                    <span className="text-xs font-mono font-bold text-primary bg-card px-3 py-1.5 rounded-xl border border-border break-all">
                      {viewModal.full_code || `${viewModal.unit?.number || 'UNT'}/${viewModal.aktiva?.code || 'AKT'}/${viewModal.location?.number || 'LOC'}/${viewModal.tool?.code_name || 'BRG'}/${viewModal.category?.code || 'CAT'}/${viewModal.entries_number}`}
                    </span>
                    <span className="text-[10px] text-muted-foreground">Pindai QR untuk membuka halaman verifikasi publik aset ini.</span>
                  </div>
                </div>

                {/* Lokasi & Klasifikasi Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-muted/20 p-4 rounded-2xl border border-border">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Unit Kerja</span>
                    <span className="text-xs font-bold text-foreground mt-0.5">{viewModal.unit?.name || "—"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Lokasi Ruangan</span>
                    <span className="text-xs font-bold text-foreground mt-0.5">{viewModal.location?.name || "—"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Kategori</span>
                    <span className="text-xs font-bold text-foreground mt-0.5">{viewModal.category?.name || "—"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Barang / Alat</span>
                    <span className="text-xs font-bold text-foreground mt-0.5">{viewModal.tool?.name || "—"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Aktiva Tetap</span>
                    <span className="text-xs font-bold text-foreground mt-0.5">{viewModal.aktiva?.name || "—"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Tahun Perolehan</span>
                    <span className="text-xs font-bold text-foreground mt-0.5">{viewModal.year?.year || "—"}</span>
                  </div>
                </div>

                {/* Blok Penyusutan Aset (Depreciation) */}
                <div className="flex flex-col gap-2 p-4 bg-muted/30 rounded-2xl border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold font-serif text-foreground flex items-center gap-1.5">
                      <TrendingDown className="w-4 h-4 text-primary" />
                      <span>Kalkulasi Penyusutan & Nilai Buku</span>
                    </span>
                    <Badge variant="outline" className="text-[10px] font-bold">
                      {viewModal.effective_depreciation_rate || 10}% / Tahun
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="flex flex-col p-2.5 bg-card rounded-xl border border-border">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase">Harga Beli</span>
                      <span className="text-xs font-bold text-foreground mt-0.5">Rp {viewModal.price?.toLocaleString("id-ID") || 0}</span>
                    </div>
                    <div className="flex flex-col p-2.5 bg-card rounded-xl border border-border">
                      <span className="text-[9px] font-bold text-amber-600 uppercase">Akumulasi Susut</span>
                      <span className="text-xs font-bold text-amber-600 mt-0.5">
                        Rp {(viewModal.accumulated_depreciation || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="flex flex-col p-2.5 bg-card rounded-xl border border-border">
                      <span className="text-[9px] font-bold text-emerald-600 uppercase">Nilai Buku Saat Ini</span>
                      <span className="text-xs font-extrabold text-emerald-600 mt-0.5">
                        Rp {(viewModal.book_value !== undefined ? viewModal.book_value : viewModal.price)?.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sumber Perolehan & Tanggal */}
                <div className="grid grid-cols-2 gap-3 bg-muted/10 p-3 rounded-2xl border border-border">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Sumber / Pemilik</span>
                    <span className="text-xs font-semibold text-foreground mt-0.5">{viewModal.aquisition || "YAPI"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Tanggal Perolehan</span>
                    <span className="text-xs font-semibold text-foreground mt-0.5">
                      {viewModal.aquisition_date ? new Date(viewModal.aquisition_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "—"}
                    </span>
                  </div>
                </div>

                {viewModal.description && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Deskripsi & Spesifikasi</span>
                    <p className="text-xs text-foreground/80 bg-muted/20 p-3 rounded-xl border border-border leading-relaxed">
                      {viewModal.description}
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter className="pt-2">
                <Button variant="outline" onClick={() => setViewModal(null)} className="rounded-xl px-5">
                  Tutup
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Unit & Location Modal */}
      <Dialog open={bulkUnitLocationModal} onOpenChange={setBulkUnitLocationModal}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold font-serif">Pindah Unit & Lokasi Massal</DialogTitle>
            <DialogDescription className="text-xs">
              Ubah unit kerja dan lokasi ruangan untuk {selectedIds.length} aset terpilih sekaligus.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleExecuteBulkUnitLocation} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bulk-unit">Pilih Unit Baru</Label>
              <select 
                id="bulk-unit"
                value={bulkUnit} 
                onChange={(e) => {
                  setBulkUnit(e.target.value);
                  setBulkLocation("");
                }}
                className="flex h-10 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                required
              >
                <option value="">Pilih Unit...</option>
                {mockUnits.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bulk-loc">Pilih Lokasi Baru</Label>
              <select 
                id="bulk-loc"
                value={bulkLocation} 
                onChange={(e) => setBulkLocation(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-medium text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                required
              >
                <option value="">Pilih Lokasi...</option>
                {mockLocations.filter(l => !bulkUnit || String(l.unit_id) === String(bulkUnit)).map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>

            <DialogFooter className="mt-2">
              <Button type="button" variant="outline" onClick={() => setBulkUnitLocationModal(false)} className="rounded-xl">
                Batal
              </Button>
              <Button type="submit" className="rounded-xl">
                Simpan Perubahan Massal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Photo Modal */}
      <Dialog open={bulkPhotoModal} onOpenChange={setBulkPhotoModal}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold font-serif">Pasang Foto Massal</DialogTitle>
            <DialogDescription className="text-xs">
              Upload foto dokumentasi untuk {selectedIds.length} aset terpilih sekaligus.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleExecuteBulkPhoto} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bulk-photo-input">Pilih File Foto (JPG/PNG Max 2MB)</Label>
              <Input 
                id="bulk-photo-input"
                type="file" 
                accept="image/*"
                onChange={(e) => setBulkPhotoFile(e.target.files?.[0] || null)}
                className="cursor-pointer"
                required
              />
            </div>

            <DialogFooter className="mt-2">
              <Button type="button" variant="outline" onClick={() => setBulkPhotoModal(false)} className="rounded-xl">
                Batal
              </Button>
              <Button type="submit" className="rounded-xl">
                Upload Foto ({selectedIds.length} Aset)
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Import Excel Modal */}
      <Dialog open={importExcelModal} onOpenChange={setImportExcelModal}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold font-serif">Import Aset dari Excel</DialogTitle>
            <DialogDescription className="text-xs">
              Unggah file spreadsheet data aset dalam format .xlsx sesuai template.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-2">
            <div className="p-3 bg-muted/40 rounded-xl border border-border text-xs flex flex-col gap-2">
              <span className="font-bold text-foreground">Format Spreadsheet:</span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Pastikan file Anda menyertakan kolom: name, brand, condition, entries_number, price, unit_id, location_id, category_id, year_id, aktiva_id.
              </p>
              <Button variant="outline" size="sm" onClick={() => toast.info("Mengunduh template sample-asset.xlsx...")} className="rounded-xl gap-1.5 w-fit text-xs">
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Contoh Format (.xlsx)</span>
              </Button>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="import-excel-file">Pilih File Excel</Label>
              <Input 
                id="import-excel-file"
                type="file" 
                accept=".xlsx,.xls,.csv"
                className="cursor-pointer"
              />
            </div>

            <DialogFooter className="mt-2">
              <Button type="button" variant="outline" onClick={() => setImportExcelModal(false)} className="rounded-xl">
                Batal
              </Button>
              <Button onClick={() => { setImportExcelModal(false); toast.success("File Excel berhasil diunggah & diproses!"); }} className="rounded-xl">
                Mulai Import Data
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Print Modal */}
      <Dialog open={qrCodePrintModal} onOpenChange={setQrCodePrintModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] rounded-3xl p-6 overflow-hidden flex flex-col gap-4 print:bg-white print:border-none print:w-full print:h-full print:max-h-full">
          <div className="flex justify-between items-center border-b border-border pb-3 print:hidden shrink-0">
            <div>
              <DialogTitle className="text-base font-extrabold font-serif">
                Cetak Barcode QR Code ({selectedIds.length} Aset)
              </DialogTitle>
              <p className="text-xs text-muted-foreground">Label barcode QR siap dicetak menggunakan printer stiker/A4.</p>
            </div>
            <Button onClick={() => window.print()} className="rounded-xl">
              Cetak Halaman (Print)
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-muted/30 border border-border rounded-2xl print:bg-white print:border-none print:p-0">
            {loadingSelectedDetails ? (
              <div className="flex items-center justify-center p-12 gap-2 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="text-xs font-bold">Menyiapkan format label cetak...</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4 justify-center print:gap-1.5 print:p-0">
                {selectedAssetsDetails.map((item) => (
                  <div key={item.id} className="no-break">
                    <AssetQrSticker asset={item} size="compact" className="shadow-sm" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="print:hidden">
            <Button variant="outline" onClick={() => setQrCodePrintModal(false)} className="rounded-xl">
              Tutup Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
