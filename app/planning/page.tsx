"use client";

import Sidebar from "@/components/Sidebar";
import { api } from "@/lib/api";
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  MapPin, Clock, Plus, UserCircle, Loader2, AlertCircle,
  CreditCard // <-- NOUVEL IMPORT POUR LE PAIEMENT
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback, useMemo } from "react"; 
import NewInterventionModal from "@/components/NewInterventionModal";

// --- MISE À JOUR DE L'INTERFACE ---
interface ServiceRequest {
  id: number;
  startTime: string; 
  durationHours: number;
  customerName: string;
  address: string;
  hasSupplies: boolean;
  status: string;
  maid?: { fullName: string }; 
  paymentStatus?: string; // <-- Ajout du statut de paiement
  totalPrice?: number;    // <-- Ajout du prix
}

export default function PlanningPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Helper: Calculate Monday - Sunday
  const weekDays = useMemo(() => {
    const days = [];
    const start = new Date(currentDate);
    // Reset to previous Monday
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); 
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentDate]); 

  const startOfWeek = weekDays[0];
  const endOfWeek = weekDays[6];

  // 2. Fetch Logic
  const fetchPlanning = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/service-requests', {
        params: {
          minDate: startOfWeek.toISOString(),
          maxDate: new Date(endOfWeek.getTime() + 86400000).toISOString()
        }
      });
      setRequests(response.data);
    } catch (err) {
      console.error("Planning Load Error:", err);
      setError("Erreur chargement planning.");
    } finally {
      setLoading(false);
    }
  }, [startOfWeek, endOfWeek]); 

  // 3. Initial Fetch
  useEffect(() => {
    fetchPlanning();
  }, [fetchPlanning]); 

  // Handlers
  const prevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const formatDateHeader = (date: Date) => {
    return {
      dayName: date.toLocaleDateString("fr-FR", { weekday: "short" }),
      dayNumber: date.getDate(),
      month: date.toLocaleDateString("fr-FR", { month: "short" }).toUpperCase()
    };
  };

  const getJobsForDay = (date: Date) => {
    return requests.filter(req => {
      const reqDate = new Date(req.startTime);
      return (
        reqDate.getDate() === date.getDate() &&
        reqDate.getMonth() === date.getMonth() &&
        reqDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getInitials = (name?: string) => {
      return name ? name.substring(0, 2).toUpperCase() : "??";
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar />
      <main className="ml-64 flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* --- Header --- */}
        <header className="flex h-20 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8">
            <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-800">Planning</h1>
                
                {/* Navigation Controls */}
                <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1">
                    <button onClick={prevWeek} className="rounded-md p-1 hover:bg-white hover:shadow-sm transition-all">
                        <ChevronLeft className="h-5 w-5 text-slate-500" />
                    </button>
                    <div className="px-4 font-bold text-slate-700 flex items-center gap-2 text-sm min-w-[180px] justify-center">
                        <CalendarIcon className="h-4 w-4 text-teal-600" />
                        {startOfWeek.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} 
                        {" - "} 
                        {endOfWeek.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <button onClick={nextWeek} className="rounded-md p-1 hover:bg-white hover:shadow-sm transition-all">
                        <ChevronRight className="h-5 w-5 text-slate-500" />
                    </button>
                </div>

                {loading && <Loader2 className="h-5 w-5 animate-spin text-teal-600 ml-2" />}
            </div>

            <div className="flex gap-3">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-teal-700 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Nouvelle Intervention
                </button>
            </div>
        </header>

        {/* --- Error State --- */}
        {error && (
            <div className="m-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-600 text-sm font-bold">
                <AlertCircle className="h-4 w-4" /> {error}
            </div>
        )}

        {/* --- Calendar Grid --- */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
            <div className="grid h-full grid-cols-7 gap-4 min-w-[1000px]">
                
                {weekDays.map((day, index) => {
                    const { dayName, dayNumber, month } = formatDateHeader(day);
                    const today = new Date();
                    const isToday = day.getDate() === today.getDate() && day.getMonth() === today.getMonth();
                    
                    const jobs = getJobsForDay(day);

                    return (
                        <div key={index} className="flex flex-col h-full">
                            {/* Column Header */}
                            <div className={`mb-4 flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-colors ${
                                isToday 
                                ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-200' 
                                : 'bg-white text-slate-600 border-slate-200'
                            }`}>
                                <span className={`text-xs font-bold uppercase ${isToday ? 'text-teal-100' : 'text-slate-400'}`}>{dayName}</span>
                                <span className="text-2xl font-bold">{dayNumber}</span>
                                <span className={`text-[10px] font-bold uppercase ${isToday ? 'text-teal-100' : 'text-slate-400'}`}>{month}</span>
                            </div>

                            {/* Jobs List */}
                            <div className="flex-1 space-y-3 overflow-y-auto rounded-xl bg-slate-100/50 p-2 border border-slate-200/50">
                                {jobs.length === 0 && !loading && (
                                    <div className="flex h-full items-center justify-center opacity-30">
                                        <p className="text-xs font-bold text-slate-400">Aucune mission</p>
                                    </div>
                                )}

                                {jobs.map((job) => (
                                    <Link 
                                        href={`/requests/${job.id}`} 
                                        key={job.id}
                                        className={`block rounded-lg border bg-white p-3 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden ${
                                            job.status === 'ASSIGNED' ? 'border-l-4 border-l-blue-500' : 
                                            job.status === 'CONFIRMED' ? 'border-l-4 border-l-teal-500' : 
                                            'border-slate-200'
                                        }`}
                                    >
                                        {/* Card Header : Heure, Badge Paiement & Matériel */}
                                        <div className="mb-2 flex items-start justify-between">
                                            <div className="flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 group-hover:bg-teal-50 group-hover:text-teal-700 transition-colors">
                                                <Clock className="h-3 w-3" />
                                                {new Date(job.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            
                                            <div className="flex items-center gap-1.5">
                                                {/* NOUVEAU : Badge de Paiement */}
                                                {job.paymentStatus === 'PAID' ? (
                                                    <div className="flex items-center gap-0.5 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-100" title="Paiement reçu">
                                                        <CreditCard className="h-3 w-3" />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-0.5 rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-bold text-orange-600 border border-orange-100" title="En attente de paiement">
                                                        <CreditCard className="h-3 w-3" />
                                                    </div>
                                                )}

                                                {/* Alerte Matériel */}
                                                {!job.hasSupplies && (
                                                    <div className="h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white" title="Matériel requis" />
                                                )}
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <p className="font-bold text-sm text-slate-900 truncate">{job.customerName}</p>
                                            <div className="flex items-center gap-1 text-xs text-slate-500 truncate mt-0.5">
                                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                                {job.address.split(',')[0]}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 border-t border-slate-50 pt-2 mt-2">
                                            {job.maid ? (
                                                <>
                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                                                        {getInitials(job.maid.fullName)}
                                                    </div>
                                                    <span className="text-xs font-medium text-slate-700 truncate">
                                                        {job.maid.fullName.split(' ')[0]}
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-400 border border-slate-200 border-dashed">
                                                        <UserCircle className="h-4 w-4" />
                                                    </div>
                                                    <span className="text-xs font-bold text-orange-400 truncate italic">
                                                        À assigner
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    );
                })}

            </div>
        </div>
        
        {/* --- NEW INTERVENTION MODAL --- */}
        <NewInterventionModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={fetchPlanning} // Refresh the grid on success
        />

      </main>
    </div>
  );
}