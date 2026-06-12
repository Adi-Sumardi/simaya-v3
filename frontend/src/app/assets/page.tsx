"use client";

import { useState, useMemo, useEffect } from "react";
import Pagination from "@/components/ui/Pagination";
import Sidebar from "@/components/layout/Sidebar";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { 
  Boxes, 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Eye, 
  Edit, 
  Menu, 
  Check, 
  X, 
  Building, 
  MapPin, 
  Camera, 
  Settings2,
  Trash,
  QrCode,
  Download,
  Info,
  Calendar,
  FileText,
  DollarSign,
  Tag,
  Wrench,
  Loader2
} from "lucide-react";

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

  // Primary assets data state
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Debounce search input to searchQuery
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const fetchMetadata = async () => {
    try {
      const [u, l, c, t, y, a] = await Promise.all([
        api.get("/units/all"),
        api.get("/locations/all"),
        api.get("/categories/all"),
        api.get("/tools/all"),
        api.get("/years/all"),
        api.get("/aktivas/all"),
      ]);
      setMockUnits(u || []);
      setMockLocations(l || []);
      setMockCategories(c || []);
      setMockTools(t || []);
      setMockYears(y || []);
      setMockAktiva(a || []);
    } catch (err) {
      console.error("Failed to load metadata", err);
    }
  };

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", String(currentPage));
      params.append("per_page", String(perPage));
      
      if (activeTab !== "all") {
        params.append("unit_id", activeTab);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }
      if (filterStatus !== "all") {
        params.append("status", filterStatus);
      }
      if (filterCondition !== "all") {
        params.append("condition", filterCondition);
      }
      if (filterCategory !== "all") {
        params.append("category_id", filterCategory);
      }
      if (filterLocation !== "all") {
        params.append("location_id", filterLocation);
      }

      const res = await api.get(`/assets?${params.toString()}`);
      setAssets(res.data || []);
      setTotalItems(res.total || 0);
      setTotalPages(res.last_page || 0);
    } catch (err) {
      console.error("Failed to load assets from backend", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    await Promise.all([fetchMetadata(), fetchAssets()]);
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
    aquisition: "",
    aquisition_date: "",
    unit_id: "",
    location_id: "",
    tool_id: "",
    category_id: "",
    year_id: "",
    aktiva_id: "",
    image: null as any
  });

  // Automatically select first element for form select dropdowns once metadata is loaded
  useEffect(() => {
    if (mockUnits.length > 0 && !formData.unit_id) {
      setFormData(prev => ({
        ...prev,
        unit_id: String(mockUnits[0]?.id || "1"),
        location_id: String(mockLocations[0]?.id || "1"),
        tool_id: String(mockTools[0]?.id || "1"),
        category_id: String(mockCategories[0]?.id || "1"),
        year_id: String(mockYears[0]?.id || "1"),
        aktiva_id: String(mockAktiva[0]?.id || "1"),
      }));
    }
  }, [mockUnits, mockLocations, mockTools, mockCategories, mockYears, mockAktiva]);

  const [bulkUnit, setBulkUnit] = useState("");
  const [bulkLocation, setBulkLocation] = useState("");

  // Handler functions
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
      const payload = {
        name: formData.name,
        entries_number: Number(formData.entries_number),
        brand: formData.brand,
        description: formData.description,
        status: formData.status,
        condition: formData.condition,
        portability: formData.portability,
        price: Number(formData.price || 0),
        aquisition: formData.aquisition,
        aquisition_date: formData.aquisition_date || new Date().toISOString().split("T")[0],
        unit_id: Number(formData.unit_id),
        location_id: Number(formData.location_id),
        tool_id: Number(formData.tool_id),
        category_id: Number(formData.category_id),
        year_id: Number(formData.year_id),
        aktiva_id: Number(formData.aktiva_id)
      };

      await api.post("/assets", payload);
      setCreateModal(false);
      resetForm();
      toast.success("Aset berhasil ditambahkan!");
      fetchAllData();
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat aset");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: editModal.name,
        entries_number: Number(editModal.entries_number),
        brand: editModal.brand,
        description: editModal.description,
        status: editModal.status,
        condition: editModal.condition,
        portability: editModal.portability,
        price: Number(editModal.price || 0),
        aquisition: editModal.aquisition,
        aquisition_date: editModal.aquisition_date,
        unit_id: Number(editModal.unit_id),
        location_id: Number(editModal.location_id),
        tool_id: Number(editModal.tool_id),
        category_id: Number(editModal.category_id),
        year_id: Number(editModal.year_id),
        aktiva_id: Number(editModal.aktiva_id)
      };

      await api.put(`/assets/${editModal.id}`, payload);
      setEditModal(null);
      toast.success("Aset berhasil diperbarui!");
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
    setFormData({
      name: "",
      entries_number: "1",
      brand: "",
      description: "",
      status: "active",
      condition: "bagus",
      portability: "portable",
      price: "",
      aquisition: "",
      aquisition_date: "",
      unit_id: String(mockUnits[0]?.id || "1"),
      location_id: String(mockLocations[0]?.id || "1"),
      tool_id: String(mockTools[0]?.id || "1"),
      category_id: String(mockCategories[0]?.id || "1"),
      year_id: String(mockYears[0]?.id || "1"),
      aktiva_id: String(mockAktiva[0]?.id || "1"),
      image: null
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
      alert("Unit dan Lokasi aset berhasil diperbarui secara massal!");
      setSelectedIds([]);
      setBulkUnitLocationModal(false);
      fetchAllData();
    } catch (err: any) {
      alert(err.message || "Gagal memperbarui aset massal");
    }
  };

  const handleExportExcel = () => {
    alert("Unduhan asset.xlsx dimulai...");
  };

  // Calculate total across all units workspace-wide
  const totalAllAssets = useMemo(() => {
    return mockUnits.reduce((acc, u) => acc + (u.asset_count || 0), 0);
  }, [mockUnits]);

  // Reset page when filters change
  const handleFilterChange = (setter: (v: any) => void, value: any) => {
    setter(value);
    setCurrentPage(1);
  };

  return (
    <div className="flex bg-background min-h-screen relative overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="flex-1 p-4 sm:p-6 md:p-10 flex flex-col gap-6 md:gap-8 overflow-y-auto max-h-screen w-full relative">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center bg-white border border-border-peach/60 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 rounded-2xl bg-background border border-border-peach hover:text-primary flex lg:hidden items-center justify-center transition-colors flex-shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold font-serif text-foreground">Daftar Assets</h2>
              <p className="text-xs text-foreground/50 font-medium mt-1">Registrasi, kelola, cetak label barcode QR, dan ekspor database aset.</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={handleExportExcel}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-3 bg-white border border-border-peach text-foreground/75 hover:text-primary hover:border-primary/50 rounded-2xl font-bold text-xs shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button 
              onClick={() => setCreateModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold text-xs shadow-md shadow-primary/10 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Asset</span>
            </button>
          </div>
        </header>

        {/* Tab Unit Selector (Matching getUnitTabs in ListAssets.php) */}
        <section className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <button
            onClick={() => { handleFilterChange(setActiveTab, "all"); setSelectedIds([]); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === "all" ? "bg-primary text-white font-extrabold" : "bg-white border border-border-peach text-foreground/60"
            }`}
          >
            <span>Semua Unit</span>
            <span className={`px-2 py-0.5 rounded text-[10px] ${activeTab === "all" ? "bg-white/20 text-white" : "bg-primary-light text-primary"}`}>
              {totalAllAssets}
            </span>
          </button>
          {mockUnits.map(unit => {
            const count = unit.asset_count || 0;
            return (
              <button
                key={unit.id}
                onClick={() => { handleFilterChange(setActiveTab, unit.id.toString()); setSelectedIds([]); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeTab === unit.id.toString() ? "bg-primary text-white" : "bg-white border border-border-peach text-foreground/60"
                }`}
              >
                <span>{unit.name}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] ${activeTab === unit.id.toString() ? "bg-white/20 text-white" : "bg-secondary-light text-secondary"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </section>

        {/* Filters and Search Bar */}
        <section className="bg-white border border-border-peach rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80 group">
              <Search className="w-4 h-4 text-foreground/45 absolute left-4 top-1/2 transform -translate-y-1/2 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Cari nama aset, brand, atau nomor urut..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border-peach rounded-2xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary transition-all"
              />
            </div>

            <button 
              onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-colors border ${
                filterOpen ? "bg-primary-light text-primary border-primary" : "bg-background border-border-peach text-foreground/75 hover:border-primary/50"
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>{filterOpen ? "Tutup Filter" : "Filter Lanjutan"}</span>
            </button>
          </div>

          {/* Collapsible Filter Forms (Matching Filament table filters) */}
          {filterOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border-peach/50 animate-in fade-in duration-200">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-foreground/50 uppercase">Kondisi</label>
                <select 
                  value={filterCondition} 
                  onChange={(e) => handleFilterChange(setFilterCondition, e.target.value)}
                  className="px-3 py-2 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                >
                  <option value="all">Semua Kondisi</option>
                  <option value="bagus">Bagus</option>
                  <option value="rusak">Rusak</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-foreground/50 uppercase">Status</label>
                <select 
                  value={filterStatus} 
                  onChange={(e) => handleFilterChange(setFilterStatus, e.target.value)}
                  className="px-3 py-2 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                  <option value="repaired">Diperbaiki</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-foreground/50 uppercase">Kategori</label>
                <select 
                  value={filterCategory} 
                  onChange={(e) => handleFilterChange(setFilterCategory, e.target.value)}
                  className="px-3 py-2 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                >
                  <option value="all">Semua Kategori</option>
                  {mockCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black text-foreground/50 uppercase">Lokasi Ruangan</label>
                <select 
                  value={filterLocation} 
                  onChange={(e) => handleFilterChange(setFilterLocation, e.target.value)}
                  className="px-3 py-2 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                >
                  <option value="all">Semua Lokasi</option>
                  {mockLocations.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </section>

        {/* Data Table */}
        <section className="bg-white border border-border-peach rounded-3xl overflow-hidden shadow-card mb-20">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-primary-light/40 border-b border-border-peach">
                  <th className="p-5 w-12 text-center">
                    <input 
                      type="checkbox"
                      checked={assets.length > 0 && assets.every(a => selectedIds.includes(a.id))}
                      onChange={() => handleToggleSelectAll(assets)}
                      className="rounded border-border-peach text-primary focus:ring-primary w-4 h-4"
                    />
                  </th>
                  <th className="p-5 text-xs font-extrabold text-foreground/75 uppercase tracking-wider">Foto</th>
                  <th className="p-5 text-xs font-extrabold text-foreground/75 uppercase tracking-wider">Nama Aset</th>
                  <th className="p-5 text-xs font-extrabold text-foreground/75 uppercase tracking-wider">No. Aset</th>
                  <th className="p-5 text-xs font-extrabold text-foreground/75 uppercase tracking-wider">Unit</th>
                  <th className="p-5 text-xs font-extrabold text-foreground/75 uppercase tracking-wider">Lokasi</th>
                  <th className="p-5 text-xs font-extrabold text-foreground/75 uppercase tracking-wider">Kondisi</th>
                  <th className="p-5 text-xs font-extrabold text-foreground/75 uppercase tracking-wider">Status</th>
                  <th className="p-5 text-xs font-extrabold text-foreground/75 uppercase tracking-wider text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-peach/50">
                {assets.map((asset) => {
                  const locationName = mockLocations.find(l => l.id === asset.location_id)?.name || "-";
                  const unitName = mockUnits.find(u => u.id === asset.unit_id)?.name || "-";
                  return (
                    <tr key={asset.id} className="hover:bg-primary-light/10 transition-colors">
                      <td className="p-5 text-center">
                        <input 
                          type="checkbox"
                          checked={selectedIds.includes(asset.id)}
                          onChange={() => handleToggleSelectRow(asset.id)}
                          className="rounded border-border-peach text-primary focus:ring-primary w-4 h-4"
                        />
                      </td>
                      <td className="p-5">
                        <div className="w-10 h-10 rounded-full bg-border-peach flex items-center justify-center font-bold text-xs text-primary font-serif">
                          {asset.name.substring(0, 2).toUpperCase()}
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col">
                          <span className="text-xs font-extrabold text-foreground">{asset.name}</span>
                          <span className="text-[10px] text-foreground/45 font-bold">{asset.brand}</span>
                        </div>
                      </td>
                      <td className="p-5 text-xs font-bold text-primary">{asset.entries_number}</td>
                      <td className="p-5 text-xs font-semibold text-foreground/60">{unitName}</td>
                      <td className="p-5 text-xs font-semibold text-foreground/60">{locationName}</td>
                      <td className="p-5 text-xs font-bold">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          asset.condition === "bagus" 
                            ? "bg-secondary-light text-secondary border border-secondary/20"
                            : "bg-red-50 text-red-500 border border-red-100"
                        }`}>
                          {asset.condition === "bagus" ? "Bagus" : "Rusak"}
                        </span>
                      </td>
                      <td className="p-5 text-xs font-semibold">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                          asset.status === "active" 
                            ? "bg-emerald-100 text-emerald-800" 
                            : asset.status === "repaired" 
                            ? "bg-amber-100 text-amber-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {asset.status === "active" ? "Aktif" : asset.status === "repaired" ? "Diperbaiki" : "Tidak Aktif"}
                        </span>
                      </td>
                      <td className="p-5 text-center">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => setViewModal(asset)}
                            className="w-8 h-8 rounded-lg bg-background border border-border-peach flex items-center justify-center text-foreground/60 hover:text-primary transition-colors shadow-sm"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setEditModal(asset)}
                            className="w-8 h-8 rounded-lg bg-background border border-border-peach flex items-center justify-center text-foreground/60 hover:text-primary transition-colors shadow-sm"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteAsset(asset.id)}
                            className="w-8 h-8 rounded-lg bg-background border border-border-peach flex items-center justify-center text-foreground/60 hover:text-red-500 transition-colors shadow-sm"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {assets.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-xs font-semibold text-foreground/40">
                      Tidak ada aset ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            perPage={perPage}
            onPageChange={setCurrentPage}
            onPerPageChange={setPerPage}
          />
        </section>

        {/* Floating Bulk Action Drawer */}
        {selectedIds.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-foreground text-white px-6 py-4 rounded-2xl flex items-center justify-between gap-6 shadow-2xl z-40 border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-300 w-[90%] max-w-3xl">
            <span className="text-xs font-black">{selectedIds.length} Aset Terpilih</span>
            <div className="flex gap-2 flex-wrap justify-end">
              <button 
                onClick={() => setQrCodePrintModal(true)}
                className="px-3.5 py-2 bg-secondary hover:bg-secondary-hover text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <QrCode className="w-4 h-4" />
                <span>Cetak Label QR</span>
              </button>
              <button 
                onClick={() => setBulkUnitLocationModal(true)}
                className="px-3.5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Settings2 className="w-4 h-4" />
                <span>Ubah Unit & Lokasi</span>
              </button>
              <button 
                onClick={() => setBulkPhotoModal(true)}
                className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-white/5"
              >
                <Camera className="w-4 h-4" />
                <span>Tambah Foto</span>
              </button>
              <button 
                onClick={() => setSelectedIds([])}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all"
                title="Batal Pilih"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Create Modal Form (Matching Sections from AssetResource.php) */}
      {createModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-border-peach rounded-3xl w-full max-w-4xl max-h-[85vh] p-6 shadow-2xl flex flex-col gap-6 relative animate-in fade-in zoom-in duration-200 overflow-y-auto">
            <button 
              onClick={() => setCreateModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-background border border-border-peach hover:text-primary flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-extrabold text-foreground font-serif border-b border-border-peach/50 pb-2 flex items-center gap-2">
              <Boxes className="w-5 h-5 text-primary" />
              <span>Registrasi Aset Baru</span>
            </h3>
            
            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-6">
              
              {/* Section 1: Informasi Aset */}
              <div className="border border-border-peach/60 rounded-2xl p-4 flex flex-col gap-4">
                <h4 className="text-xs font-black text-primary uppercase tracking-wider">1. Informasi Aset</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-xs font-bold text-foreground/75">Nama Aset</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Contoh: PC Lenovo ThinkCentre M70s..." 
                      className="px-3 py-2 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-foreground/75">Nomor Urut (Max 1000)</label>
                    <input 
                      type="number" 
                      min={1}
                      max={1000}
                      value={formData.entries_number}
                      onChange={(e) => setFormData({ ...formData, entries_number: e.target.value })}
                      className="px-3 py-2 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-foreground/75">Merk</label>
                    <input 
                      type="text" 
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="Contoh: Lenovo" 
                      className="px-3 py-2 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1 md:col-span-4">
                    <label className="text-xs font-bold text-foreground/75">Deskripsi</label>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Jelaskan spesifikasi, nomor seri, atau detail fisik aset..."
                      rows={2}
                      className="px-3 py-2 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Status & Kondisi */}
              <div className="border border-border-peach/60 rounded-2xl p-4 flex flex-col gap-4">
                <h4 className="text-xs font-black text-primary uppercase tracking-wider">2. Status & Kondisi</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-foreground/75">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="px-3 py-2 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                      required
                    >
                      <option value="active">Aktif</option>
                      <option value="inactive">Tidak Aktif</option>
                      <option value="deleted">Dihapus</option>
                      <option value="repaired">Diperbaiki</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-foreground/75">Kondisi</label>
                    <select
                      value={formData.condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                      className="px-3 py-2 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                      required
                    >
                      <option value="bagus">Bagus</option>
                      <option value="rusak">Rusak</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-foreground/75">Portability (Tipe)</label>
                    <select
                      value={formData.portability}
                      onChange={(e) => setFormData({ ...formData, portability: e.target.value })}
                      className="px-3 py-2 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                      required
                    >
                      <option value="portable">Portable</option>
                      <option value="fixtures">Fixtures</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Informasi Perolehan */}
              <div className="border border-border-peach/60 rounded-2xl p-4 flex flex-col gap-4">
                <h4 className="text-xs font-black text-primary uppercase tracking-wider">3. Informasi Perolehan</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-foreground/75">Harga Perolehan (Rp)</label>
                    <input 
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="Contoh: 12500000"
                      className="px-3 py-2 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-foreground/75">Pemilik / Sumber Dana</label>
                    <input 
                      type="text"
                      value={formData.aquisition}
                      onChange={(e) => setFormData({ ...formData, aquisition: e.target.value })}
                      placeholder="Contoh: Dana BOS atau Yayasan"
                      className="px-3 py-2 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-foreground/75">Tanggal Perolehan</label>
                    <input 
                      type="date"
                      value={formData.aquisition_date}
                      onChange={(e) => setFormData({ ...formData, aquisition_date: e.target.value })}
                      className="px-3 py-2 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Lokasi & Kategori Relasi */}
              <div className="border border-border-peach/60 rounded-2xl p-4 flex flex-col gap-4">
                <h4 className="text-xs font-black text-primary uppercase tracking-wider">4. Klasifikasi & Relasi Master</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-foreground/75">Unit Kerja</label>
                    <select
                      value={formData.unit_id}
                      onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                      className="px-3 py-2 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                      required
                    >
                      {mockUnits.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-foreground/75">Lokasi Ruangan</label>
                    <select
                      value={formData.location_id}
                      onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                      className="px-3 py-2 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                      required
                    >
                      {mockLocations.map(l => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-foreground/75">Template Barang</label>
                    <select
                      value={formData.tool_id}
                      onChange={(e) => setFormData({ ...formData, tool_id: e.target.value })}
                      className="px-3 py-2 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                      required
                    >
                      {mockTools.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.code_name})</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-foreground/75">Kategori</label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="px-3 py-2 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                      required
                    >
                      {mockCategories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-foreground/75">Tahun Pengadaan</label>
                    <select
                      value={formData.year_id}
                      onChange={(e) => setFormData({ ...formData, year_id: e.target.value })}
                      className="px-3 py-2 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                      required
                    >
                      {mockYears.map(y => (
                        <option key={y.id} value={y.id}>{y.year}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-foreground/75">Klasifikasi Aktiva</label>
                    <select
                      value={formData.aktiva_id}
                      onChange={(e) => setFormData({ ...formData, aktiva_id: e.target.value })}
                      className="px-3 py-2 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                      required
                    >
                      {mockAktiva.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 5: Foto Aset */}
              <div className="border border-border-peach/60 rounded-2xl p-4 flex flex-col gap-4">
                <h4 className="text-xs font-black text-primary uppercase tracking-wider">5. Foto Aset</h4>
                <div className="border-2 border-dashed border-border-peach hover:border-primary rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-background/50">
                  <Camera className="w-8 h-8 text-foreground/30" />
                  <span className="text-xs font-bold text-foreground/50">Simulasi File Upload</span>
                  <span className="text-[10px] text-foreground/40">Format Gambar JPG/PNG</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border-peach/50 mt-2">
                <button 
                  type="button" 
                  onClick={() => setCreateModal(false)}
                  className="px-6 py-2.5 bg-background border border-border-peach rounded-xl text-xs font-bold hover:bg-primary-light/40"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover shadow-sm"
                >
                  Simpan Asset
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Edit Modal Form */}
      {editModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-border-peach rounded-3xl w-full max-w-4xl max-h-[85vh] p-6 shadow-2xl flex flex-col gap-6 relative animate-in fade-in zoom-in duration-200 overflow-y-auto">
            <button 
              onClick={() => setEditModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-background border border-border-peach hover:text-primary flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-extrabold text-foreground font-serif border-b border-border-peach/50 pb-2 flex items-center gap-2">
              <Edit className="w-5 h-5 text-primary" />
              <span>Ubah Data Aset</span>
            </h3>
            
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-6">
              
              {/* Section 1: Informasi Aset */}
              <div className="border border-border-peach/60 rounded-2xl p-4 flex flex-col gap-4">
                <h4 className="text-xs font-black text-primary uppercase tracking-wider">1. Informasi Aset</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-xs font-bold text-foreground/75">Nama Aset</label>
                    <input 
                      type="text" 
                      value={editModal.name}
                      onChange={(e) => setEditModal({ ...editModal, name: e.target.value })}
                      className="px-3 py-2 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-foreground/75">Nomor Urut</label>
                    <input 
                      type="number" 
                      min={1}
                      max={1000}
                      value={editModal.entries_number}
                      onChange={(e) => setEditModal({ ...editModal, entries_number: e.target.value })}
                      className="px-3 py-2 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-foreground/75">Merk</label>
                    <input 
                      type="text" 
                      value={editModal.brand}
                      onChange={(e) => setEditModal({ ...editModal, brand: e.target.value })}
                      className="px-3 py-2 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1 md:col-span-4">
                    <label className="text-xs font-bold text-foreground/75">Deskripsi</label>
                    <textarea 
                      value={editModal.description}
                      onChange={(e) => setEditModal({ ...editModal, description: e.target.value })}
                      rows={2}
                      className="px-3 py-2 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Status & Kondisi */}
              <div className="border border-border-peach/60 rounded-2xl p-4 flex flex-col gap-4">
                <h4 className="text-xs font-black text-primary uppercase tracking-wider">2. Status & Kondisi</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-foreground/75">Status</label>
                    <select
                      value={editModal.status}
                      onChange={(e) => setEditModal({ ...editModal, status: e.target.value })}
                      className="px-3 py-2 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                      required
                    >
                      <option value="active">Aktif</option>
                      <option value="inactive">Tidak Aktif</option>
                      <option value="deleted">Dihapus</option>
                      <option value="repaired">Diperbaiki</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-foreground/75">Kondisi</label>
                    <select
                      value={editModal.condition}
                      onChange={(e) => setEditModal({ ...editModal, condition: e.target.value })}
                      className="px-3 py-2 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                      required
                    >
                      <option value="bagus">Bagus</option>
                      <option value="rusak">Rusak</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-foreground/75">Portability</label>
                    <select
                      value={editModal.portability}
                      onChange={(e) => setEditModal({ ...editModal, portability: e.target.value })}
                      className="px-3 py-2 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                      required
                    >
                      <option value="portable">Portable</option>
                      <option value="fixtures">Fixtures</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Informasi Perolehan */}
              <div className="border border-border-peach/60 rounded-2xl p-4 flex flex-col gap-4">
                <h4 className="text-xs font-black text-primary uppercase tracking-wider">3. Informasi Perolehan</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-foreground/75">Harga Perolehan (Rp)</label>
                    <input 
                      type="number"
                      value={editModal.price}
                      onChange={(e) => setEditModal({ ...editModal, price: e.target.value })}
                      className="px-3 py-2 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-foreground/75">Pemilik / Sumber Dana</label>
                    <input 
                      type="text"
                      value={editModal.aquisition}
                      onChange={(e) => setEditModal({ ...editModal, aquisition: e.target.value })}
                      className="px-3 py-2 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-foreground/75">Tanggal Perolehan</label>
                    <input 
                      type="date"
                      value={editModal.aquisition_date}
                      onChange={(e) => setEditModal({ ...editModal, aquisition_date: e.target.value })}
                      className="px-3 py-2 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Klasifikasi */}
              <div className="border border-border-peach/60 rounded-2xl p-4 flex flex-col gap-4">
                <h4 className="text-xs font-black text-primary uppercase tracking-wider">4. Klasifikasi & Relasi Master</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-foreground/75">Unit Kerja</label>
                    <select
                      value={editModal.unit_id}
                      onChange={(e) => setEditModal({ ...editModal, unit_id: e.target.value })}
                      className="px-3 py-2 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                      required
                    >
                      {mockUnits.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-foreground/75">Lokasi Ruangan</label>
                    <select
                      value={editModal.location_id}
                      onChange={(e) => setEditModal({ ...editModal, location_id: e.target.value })}
                      className="px-3 py-2 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                      required
                    >
                      {mockLocations.map(l => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-foreground/75">Template Barang</label>
                    <select
                      value={editModal.tool_id}
                      onChange={(e) => setEditModal({ ...editModal, tool_id: e.target.value })}
                      className="px-3 py-2 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                      required
                    >
                      {mockTools.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.code_name})</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-foreground/75">Kategori</label>
                    <select
                      value={editModal.category_id}
                      onChange={(e) => setEditModal({ ...editModal, category_id: e.target.value })}
                      className="px-3 py-2 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                      required
                    >
                      {mockCategories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-foreground/75">Tahun Pengadaan</label>
                    <select
                      value={editModal.year_id}
                      onChange={(e) => setEditModal({ ...editModal, year_id: e.target.value })}
                      className="px-3 py-2 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                      required
                    >
                      {mockYears.map(y => (
                        <option key={y.id} value={y.id}>{y.year}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-foreground/75">Klasifikasi Aktiva</label>
                    <select
                      value={editModal.aktiva_id}
                      onChange={(e) => setEditModal({ ...editModal, aktiva_id: e.target.value })}
                      className="px-3 py-2 bg-background border border-border-peach rounded-xl text-xs font-semibold"
                      required
                    >
                      {mockAktiva.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border-peach/50 mt-2">
                <button 
                  type="button" 
                  onClick={() => setEditModal(null)}
                  className="px-6 py-2.5 bg-background border border-border-peach rounded-xl text-xs font-bold hover:bg-primary-light/40"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Infolist Detail View Modal (Matching Infolist from AssetResource.php) */}
      {viewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-border-peach rounded-3xl w-full max-w-3xl max-h-[85vh] p-6 shadow-2xl flex flex-col gap-6 relative animate-in fade-in zoom-in duration-200 overflow-y-auto">
            <button 
              onClick={() => setViewModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-background border border-border-peach hover:text-primary flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex gap-4 items-start border-b border-border-peach/50 pb-4">
              <div className="w-16 h-16 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-lg font-serif flex-shrink-0">
                {viewModal.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-extrabold text-foreground font-serif leading-none">{viewModal.name}</h3>
                  <span className="text-[10px] font-bold text-white bg-primary px-2.5 py-0.5 rounded-full">No. Aset: {viewModal.entries_number}</span>
                </div>
                <p className="text-xs text-foreground/50 font-semibold mt-1.5">
                  Merk: {viewModal.brand} &bull; Tipe: <span className="capitalize">{viewModal.portability}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Section 1 */}
              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="text-[10px] font-black text-primary uppercase tracking-wider mb-2">Informasi Status & Kondisi</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-zinc-50 border border-border-peach/40 rounded-xl">
                      <span className="text-[9px] text-foreground/45 font-bold uppercase">Kondisi Fisik</span>
                      <p className="text-xs font-black text-foreground capitalize mt-0.5">
                        {viewModal.condition === "bagus" ? "✅ Bagus" : "❌ Rusak"}
                      </p>
                    </div>
                    <div className="p-3 bg-zinc-50 border border-border-peach/40 rounded-xl">
                      <span className="text-[9px] text-foreground/45 font-bold uppercase">Status Aset</span>
                      <p className="text-xs font-black text-foreground capitalize mt-0.5">
                        {viewModal.status === "active" ? "Aktif" : viewModal.status === "repaired" ? "Diperbaiki" : "Tidak Aktif"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-primary uppercase tracking-wider mb-2">Informasi Finansial & Perolehan</h4>
                  <div className="p-4 bg-zinc-50 border border-border-peach/40 rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-foreground/50 font-semibold">Harga Perolehan:</span>
                      <span className="font-extrabold text-foreground">Rp {viewModal.price.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-foreground/50 font-semibold">Sumber Dana / Pemilik:</span>
                      <span className="font-bold text-foreground">{viewModal.aquisition}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-foreground/50 font-semibold">Tanggal Perolehan:</span>
                      <span className="font-bold text-foreground">{viewModal.aquisition_date}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2 */}
              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="text-[10px] font-black text-primary uppercase tracking-wider mb-2">Klasifikasi Ruangan & Master</h4>
                  <div className="p-4 bg-zinc-50 border border-border-peach/40 rounded-xl flex flex-col gap-2.5">
                    <div className="flex items-center gap-2.5 text-xs text-foreground/75 font-semibold">
                      <Building className="w-4 h-4 text-primary" />
                      <span><strong>Unit:</strong> {mockUnits.find(u => u.id === viewModal.unit_id)?.name}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-foreground/75 font-semibold">
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      <span><strong>Lokasi:</strong> {mockLocations.find(l => l.id === viewModal.location_id)?.name}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-foreground/75 font-semibold">
                      <Tag className="w-4 h-4 text-orange-400" />
                      <span><strong>Kategori:</strong> {mockCategories.find(c => c.id === viewModal.category_id)?.name}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-foreground/75 font-semibold">
                      <Wrench className="w-4 h-4 text-indigo-400" />
                      <span><strong>Jenis Barang:</strong> {mockTools.find(t => t.id === viewModal.tool_id)?.name}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-foreground/75 font-semibold">
                      <FileText className="w-4 h-4 text-amber-500" />
                      <span><strong>Aktiva:</strong> {mockAktiva.find(a => a.id === viewModal.aktiva_id)?.name}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-foreground/75 font-semibold">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <span><strong>Tahun:</strong> {mockYears.find(y => y.id === viewModal.year_id)?.year}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-border-peach/50 pt-4">
              <span className="text-[10px] font-bold text-foreground/40 uppercase">Deskripsi / Detail Fisik</span>
              <p className="text-xs font-semibold text-foreground/75 leading-relaxed bg-zinc-50 p-3 rounded-xl border border-border-peach/30">
                {viewModal.description}
              </p>
            </div>

            <div className="flex justify-end gap-3 flex-shrink-0 mt-4">
              <button 
                onClick={() => setViewModal(null)}
                className="px-6 py-2.5 bg-background border border-border-peach text-foreground/75 hover:text-primary rounded-xl font-bold text-xs transition-colors"
              >
                Tutup Detail Aset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Change Unit & Location Modal */}
      {bulkUnitLocationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-border-peach rounded-3xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-6 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setBulkUnitLocationModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-background border border-border-peach hover:text-primary flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="text-base font-extrabold text-foreground font-serif">Ubah Unit & Lokasi Massal</h3>
              <p className="text-[10px] text-foreground/45 mt-1">Ubah unit kerja dan lokasi penempatan untuk {selectedIds.length} aset sekaligus.</p>
            </div>

            <form onSubmit={handleExecuteBulkUnitLocation} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground/70">Unit Baru</label>
                <select 
                  value={bulkUnit}
                  onChange={(e) => setBulkUnit(e.target.value)}
                  className="px-4 py-3 bg-background border border-border-peach rounded-2xl text-xs font-semibold text-foreground focus:outline-none"
                  required
                >
                  <option value="">Pilih Unit...</option>
                  {mockUnits.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-foreground/70">Lokasi Baru</label>
                <select 
                  value={bulkLocation}
                  onChange={(e) => setBulkLocation(e.target.value)}
                  disabled={!bulkUnit}
                  className="px-4 py-3 bg-background border border-border-peach rounded-2xl text-xs font-semibold text-foreground focus:outline-none disabled:opacity-50"
                  required
                >
                  <option value="">Pilih Lokasi...</option>
                  {mockLocations.filter(l => l.unit_id === Number(bulkUnit)).map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-border-peach/50 mt-2">
                <button 
                  type="button" 
                  onClick={() => setBulkUnitLocationModal(false)}
                  className="px-4 py-2 bg-background border border-border-peach rounded-xl text-xs font-bold"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable QR Code Labels Modal (Styled exactly like qrcode.blade.php) */}
      {qrCodePrintModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-border-peach rounded-3xl w-full max-w-5xl max-h-[90vh] p-6 shadow-2xl flex flex-col gap-6 relative overflow-hidden animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setQrCodePrintModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-background border border-border-peach hover:text-primary flex items-center justify-center transition-colors print:hidden"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex justify-between items-center border-b border-border-peach/50 pb-4 print:hidden">
              <div>
                <h3 className="text-base font-extrabold text-foreground font-serif">Preview Cetak Barcode QR Code</h3>
                <p className="text-[10px] text-foreground/45 mt-0.5">Desain label asset 180x110px sesuai standar sekolah YAPI</p>
              </div>
              <button 
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-xs shadow-md shadow-primary/10 transition-colors"
              >
                Cetak Halaman (Print)
              </button>
            </div>

            {/* Printable Grid Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-zinc-50 border border-border-peach/50 rounded-2xl print:bg-white print:border-none print:p-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center print:grid-cols-3 print:gap-4 print:p-0">
                {loadingSelectedDetails ? (
                  <div className="col-span-full flex flex-col items-center justify-center p-12 text-foreground/50 gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="text-xs font-bold">Memuat data barcode...</span>
                  </div>
                ) : (
                  selectedAssetsDetails.map(item => {
                    const unitCode = mockUnits.find(u => u.id === item.unit_id)?.number || "--";
                    const locationCode = mockLocations.find(l => l.id === item.location_id)?.number || "--";
                    const categoryCode = mockCategories.find(c => c.id === item.category_id)?.code || "--";
                    const toolCode = mockTools.find(t => t.id === item.tool_id)?.code_name || "--";
                    const yearCode = mockYears.find(y => y.id === item.year_id)?.code || "--";
                    const aktivaCode = mockAktiva.find(a => a.id === item.aktiva_id)?.code || "--";
                    
                    // Label code string
                    const labelCode = `${unitCode}/${aktivaCode}/${locationCode}/${toolCode}/${categoryCode}/${yearCode}/${item.entries_number}`;

                    return (
                      <div 
                        key={item.id} 
                        className="bg-white" 
                        style={{ 
                          width: "180px", 
                          height: "110px", 
                          display: "flex", 
                          flexDirection: "column", 
                          alignItems: "center", 
                          justifyContent: "center", 
                          border: "1px solid black",
                          padding: "5px",
                          boxSizing: "border-box"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "4px" }}>
                          {/* Mocking QR code graphic with inline HTML structure matching Filament qrcode.js green output */}
                          <div style={{ width: "60px", height: "60px", border: "1px solid #e2e8f0", padding: "2px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                            <div className="w-full h-full bg-[#048025]/5 p-0.5 flex flex-wrap gap-0.5 justify-center items-center">
                              {/* SVG QR Code Pattern mockup */}
                              <svg width="45" height="45" viewBox="0 0 29 29" className="text-[#048025]">
                                <path fill="currentColor" d="M0 0h7v7H0zm1 1v5h5V1zm21 0h7v7h-7zm1 1v5h5V1zM0 22h7v7H0zm1 1v5h5V23zm10-22h7v2h-7zm0 3h2v4h-2zm4 0h3v1h-3zm0 2h1v2h-1zm5 0h1v1h-1zm-9 3h2v2h-2zm6 0h2v1h-2zm-3 2h2v2h-2zm6 0h1v1h-1zm-9 3h3v1h-3zm5 0h2v2h-2zm4 0h2v1h-2zm-9 2h2v2h-2zm3 0h1v1h-1zm5 0h2v2h-2zm-6 2h3v1h-3zm6 0h1v1h-1z" />
                                <rect x="3" y="3" width="1" height="1" fill="currentColor" />
                                <rect x="25" y="3" width="1" height="1" fill="currentColor" />
                                <rect x="3" y="25" width="1" height="1" fill="currentColor" />
                              </svg>
                            </div>
                          </div>
                          
                          {/* School YAPI circular emblem badge logo */}
                          <div className="w-14 h-14 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[8px] border-2 border-amber-400 leading-none text-center shadow">
                            <span>YAPI<br />SCHOOL</span>
                          </div>
                        </div>
                        <div className="text-center font-bold font-mono" style={{ fontSize: "7.5px", letterSpacing: "-0.2px", lineHeight: "1.2", overflowWrap: "anywhere", wordBreak: "break-all" }}>
                          {labelCode}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border-peach/50 print:hidden flex-shrink-0">
              <button 
                type="button" 
                onClick={() => setQrCodePrintModal(false)}
                className="px-6 py-2.5 bg-background border border-border-peach rounded-xl text-xs font-bold hover:bg-primary-light/40"
              >
                Tutup Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Photo Modal */}
      {bulkPhotoModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-border-peach rounded-3xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-6 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setBulkPhotoModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-background border border-border-peach hover:text-primary flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="text-base font-extrabold text-foreground font-serif">Unggah Foto Massal</h3>
              <p className="text-[10px] text-foreground/45 mt-1">Unggah file foto pendukung untuk {selectedIds.length} aset terpilih.</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); alert("Foto massal diunggah!"); setSelectedIds([]); setBulkPhotoModal(false); }} className="flex flex-col gap-4">
              <div className="border-2 border-dashed border-border-peach hover:border-primary rounded-2xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-background/50">
                <Camera className="w-8 h-8 text-foreground/30" />
                <span className="text-xs font-bold text-foreground/50">Klik untuk mencari file</span>
                <span className="text-[9px] text-foreground/40 font-medium">Format JPG/PNG, maks 1MB</span>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-border-peach/50 mt-2">
                <button 
                  type="button" 
                  onClick={() => setBulkPhotoModal(false)}
                  className="px-4 py-2 bg-background border border-border-peach rounded-xl text-xs font-bold"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover shadow-sm"
                >
                  Unggah Foto Aset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
