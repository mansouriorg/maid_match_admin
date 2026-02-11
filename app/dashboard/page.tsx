"use client";

import Sidebar from "@/components/Sidebar";
import { api } from "@/lib/api"; 
import { 
  Search, Bell, MapPin, Calendar, Clock, Phone, MoreHorizontal, 
  SprayCan, Key, Shirt, Cat, Loader2, AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Define Types based on your API response
interface ServiceRequest {
  id: number;
  customerName: string;
  customerPhone: string;
  startTime: string; // ISO String
  durationHours: number;
  address: string;
  propertyType: string;
  cleaningType: string;
  hasSupplies: boolean;
  extras: string[];
  status: string;
  maid?: { fullName: string };
}

export default function AdminDashboard() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch ONLY the requests list
        const response = await api.get('/service-requests');
        setRequests(response.data);
      } catch (err) {
        console.error("Dashboard Load Error:", err);
        setError("Impossible de charger les données.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // HELPER: Status Color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'CONFIRMED': return 'bg-teal-100 text-teal-800 border border-teal-200';
      case 'REQUESTED': return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border border-red-200';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border border-green-200';
      default: return 'bg-slate-100 text-slate-800 border border-slate-200';
    }
  };

  // HELPER: Extra Icons
  const getExtraIcon = (extra: string) => {
    const key = extra.toLowerCase().trim();
    if (key.includes('repassage')) return <Shirt className="h-3 w-3" />;
    if (key.includes('clés')) return <Key className="h-3 w-3" />;
    if (key.includes('animaux')) return <Cat className="h-3 w-3" />;
    return null;
  };

  // HELPER: Format Date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', { 
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar />
      
      <main className="ml-64 flex-1">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/80 px-8 backdrop-blur-md">
          <h1 className="text-2xl font-bold text-slate-800">Tableau de Bord</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input 
                placeholder="Rechercher un client..." 
                className="h-10 w-64 rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
              />
            </div>
            <button className="relative rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 animate-in fade-in zoom-in duration-500">
          
          {/* Error Banner */}
          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
                <AlertCircle className="h-5 w-5" />
                {error}
            </div>
          )}

          {/* Requests List */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="font-bold text-lg text-slate-800">Dernières réservations</h2>
              <Link href="/requests" className="text-sm font-medium text-teal-600 hover:text-teal-700">Tout voir</Link>
            </div>
            
            {loading ? (
                <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                </div>
            ) : requests.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-slate-400">
                    Aucune réservation trouvée.
                </div>
            ) : (
                <div className="divide-y divide-slate-100">
                {requests.map((req) => (
                    <Link 
                        href={`/requests/${req.id}`} 
                        key={req.id} 
                        className="group flex items-center justify-between p-6 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                    
                    {/* Left: Client Info */}
                    <div className="flex w-1/4 gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-500 uppercase">
                            {req.customerName.substring(0,2)}
                        </div>
                        <div>
                            <p className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">{req.customerName}</p>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Phone className="h-3 w-3" />
                            {req.customerPhone}
                            </div>
                        </div>
                    </div>

                    {/* Middle: Schedule */}
                    <div className="flex w-1/4 flex-col gap-1 text-sm">
                        <div className="flex items-center gap-2 text-slate-700 font-medium">
                            <Calendar className="h-4 w-4 text-teal-600" />
                            {formatDate(req.startTime)}
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                            <Clock className="h-4 w-4" />
                            {req.durationHours}h ({req.cleaningType})
                        </div>
                    </div>

                    {/* Middle: Address & Alerts */}
                    <div className="hidden w-1/3 lg:block">
                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-2 truncate">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            <span className="truncate">{req.address}</span>
                        </div>
                        <div className="flex gap-2">
                            {!req.hasSupplies && (
                                <span className="inline-flex items-center gap-1 rounded border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700">
                                    <SprayCan className="h-3 w-3" /> Matériel requis
                                </span>
                            )}
                            {req.extras.map(e => (
                                <span key={e} className="inline-flex items-center justify-center h-6 w-6 rounded bg-slate-100 text-slate-500" title={e}>
                                    {getExtraIcon(e)}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Right: Status & Quick Actions */}
                    <div className="flex w-auto items-center justify-end gap-6">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${getStatusColor(req.status)}`}>
                            {req.status === 'REQUESTED' ? 'EN ATTENTE' : req.status}
                        </span>
                        
                        {/* Quick Actions */}
                        <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                            <button 
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors" 
                                title="Détails"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    </Link>
                ))}
                </div>
            )}
            
          </div>
        </div>
      </main>
    </div>
  );
}