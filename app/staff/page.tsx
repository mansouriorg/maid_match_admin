"use client";

import Sidebar from "@/components/Sidebar";
import { Search, MapPin, Star, Filter, Briefcase, Plus, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api"; // Your Axios instance

// Define the shape of data coming from Backend
interface Maid {
  id: number;
  fullName: string;
  specialty: string;
  status: string;         // "AVAILABLE", "BUSY"
  rating: number;
  isVerified?: boolean;
  languages: string[];
  requests?: unknown[];       // To count jobs completed
  _count?: {
    requests: number;     // If you used the count in Prisma
  };
}

export default function StaffCatalogPage() {
  const [maids, setMaids] = useState<Maid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [specialtyFilter, setSpecialtyFilter] = useState("ALL");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // 1. FETCH DATA ON MOUNT
  useEffect(() => {
    const fetchMaids = async () => {
      try {
        const res = await api.get('/maids');
        setMaids(res.data);
      } catch (err) {
        console.error("Failed to load staff", err);
        setError("Impossible de charger la liste des intervenants.");
      } finally {
        setLoading(false);
      }
    };

    fetchMaids();
  }, []);

  // 2. FILTER LOGIC (Client-Side Search)
  const filteredMaids = maids.filter(maid => 
    maid.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    maid.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (maid.languages && maid.languages.some(lang => lang.toLowerCase().includes(searchTerm.toLowerCase())))
  ).filter(maid =>
    (statusFilter === "ALL" || maid.status === statusFilter) &&
    (specialtyFilter === "ALL" || maid.specialty === specialtyFilter) &&
    (verifiedOnly === false || maid.isVerified === true)
  );

  // The specialties present in the team, for the filter list
  const specialties = Array.from(new Set(maids.map(maid => maid.specialty))).sort((a, b) => a.localeCompare(b, "fr"));
  const filtersActive = statusFilter !== "ALL" || specialtyFilter !== "ALL" || verifiedOnly;

  // 3. HELPER: Status Badge Styling
  const getStatusBadge = (status: string) => {
    // Backend uses UPPERCASE, UI looks better with lowercase logic
    const normalized = status.toLowerCase(); 
    
    switch(normalized) {
        case 'available': 
            return <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700 uppercase tracking-wide">Disponible</span>;
        case 'busy': 
        case 'assigned':
            return <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-700 uppercase tracking-wide">En Mission</span>;
        case 'on_leave':
            return <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-700 uppercase tracking-wide">En cong&eacute;</span>;
        default: 
            return <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500 uppercase tracking-wide">{status}</span>;
    }
  };

  // 4. HELPER: Initials for Avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-slate-50 font-sans text-slate-900">
      <Sidebar />
      <main className="lg:ml-64 flex-1 p-4 sm:p-8">
        
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Catalogue Intervenants</h1>
                <p className="text-slate-500">Gérez votre équipe et consultez leurs compétences.</p>
            </div>
            <Link href="/staff/new">
                <button className="flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-teal-200 hover:bg-teal-800 transition-all hover:-translate-y-0.5">
                    <Plus className="h-4 w-4" />
                    Ajouter un profil
                </button>
            </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                <input 
                    aria-label="Rechercher un intervenant"
                    placeholder="Rechercher par nom, compétence, langue..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                />
            </div>
            {/* Filters: status, specialty, verified profiles */}
            <div className="flex flex-wrap items-center gap-2">
                <Filter className="h-4 w-4 text-slate-500" aria-hidden="true" />
                <select
                    aria-label="Filtrer par statut"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                >
                    <option value="ALL">Tous les statuts</option>
                    <option value="AVAILABLE">Disponible</option>
                    <option value="ON_LEAVE">En cong&eacute;</option>
                </select>
                <select
                    aria-label="Filtrer par sp&eacute;cialit&eacute;"
                    value={specialtyFilter}
                    onChange={(e) => setSpecialtyFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                >
                    <option value="ALL">Toutes les sp&eacute;cialit&eacute;s</option>
                    {specialties.map(specialty => (
                        <option key={specialty} value={specialty}>{specialty}</option>
                    ))}
                </select>
                <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700">
                    <input
                        type="checkbox"
                        checked={verifiedOnly}
                        onChange={(e) => setVerifiedOnly(e.target.checked)}
                        className="h-4 w-4 accent-teal-700"
                    />
                    V&eacute;rifi&eacute;s uniquement
                </label>
                {filtersActive && (
                    <button
                        type="button"
                        onClick={() => { setStatusFilter("ALL"); setSpecialtyFilter("ALL"); setVerifiedOnly(false); }}
                        className="px-2 py-2.5 text-sm font-medium text-teal-700 hover:underline"
                    >
                        Effacer les filtres
                    </button>
                )}
            </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
            <div className="flex h-64 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
            </div>
        )}

        {/* ERROR STATE */}
        {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
                <AlertCircle className="h-5 w-5" />
                {error}
            </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filteredMaids.length === 0 && !error && (
            <div className="flex h-64 flex-col items-center justify-center text-slate-500">
                <Search className="mb-2 h-10 w-10 opacity-20" />
                <p>Aucun intervenant trouvé.</p>
            </div>
        )}

        {/* Staff Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredMaids.map((person) => (
                <Link key={person.id} href={`/staff/${person.id}`} className="group relative block overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-teal-200">
                    
                    {/* Card Header: Avatar & Status */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-600 group-hover:bg-teal-50 group-hover:text-teal-700 transition-colors">
                                {getInitials(person.fullName)}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 group-hover:text-teal-700 transition-colors">{person.fullName}</h3>
                                <p className="text-sm text-slate-500">{person.specialty}</p>
                            </div>
                        </div>
                        {getStatusBadge(person.status)}
                    </div>

                    {/* Stats Row */}
                    <div className="mb-4 flex items-center justify-between border-y border-slate-50 py-3">
                        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            {person.rating?.toFixed(1) || "5.0"}
                        </div>
                        <div className="h-4 w-px bg-slate-200" />
                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                            <Briefcase className="h-4 w-4 text-slate-500" />
                            {/* Use _count if available, otherwise array length, otherwise 0 */}
                            {person._count?.requests ?? person.requests?.length ?? 0} <span className="hidden sm:inline">Missions</span>
                        </div>
                        <div className="h-4 w-px bg-slate-200" />
                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 truncate max-w-[80px]">
                            <MapPin className="h-4 w-4 text-slate-500" />
                            &mdash;
                        </div>
                    </div>

                    {/* Skills/Languages Tags */}
                    <div className="flex flex-wrap gap-2">
                        {person.languages && person.languages.slice(0, 3).map(lang => (
                            <span key={lang} className="rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 capitalize group-hover:bg-teal-50 group-hover:text-teal-700 transition-colors">
                                {lang}
                            </span>
                        ))}
                        {(!person.languages || person.languages.length === 0) && (
                            <span className="text-xs text-slate-500 italic">Aucune langue spécifiée</span>
                        )}
                    </div>

                </Link>
            ))}
        </div>

      </main>
    </div>
  );
}