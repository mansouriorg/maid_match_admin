"use client";

import { use, useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { api } from "@/lib/api";
import { 
  ArrowLeft, Calendar, Clock, MapPin, Phone, Mail, 
  CheckCircle2, XCircle, User, Shield, MessageSquare, Save, 
  AlertTriangle, Loader2, Briefcase, ChevronDown
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// --- TYPES ---
interface ServiceRequest {
  id: number;
  createdAt: string;
  status: string; // REQUESTED, CONFIRMED, ASSIGNED, COMPLETED, CANCELLED
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  propertyType: string;
  rooms: number;
  bathrooms: number;
  cleaningType: string;
  hasSupplies: boolean;
  extras: string[];
  startTime: string;
  durationHours: number;
  frequency: string;
  maid?: { id: number; fullName: string; phoneNumber: string };
}

interface Maid {
  id: number;
  fullName: string;
  specialty: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RequestDetailsPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  // --- STATE ---
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [maids, setMaids] = useState<Maid[]>([]); // List of available maids
  const [selectedMaidId, setSelectedMaidId] = useState<string>("");
  
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [note, setNote] = useState("");

  // --- 1. FETCH DATA (Request + Available Maids) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reqRes, maidsRes] = await Promise.all([
          api.get(`/service-requests/${id}`),
          api.get('/maids?status=AVAILABLE') // Only fetch available maids
        ]);
        setRequest(reqRes.data);
        setMaids(maidsRes.data);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  // --- 2. ACTIONS ---

  // A. Change Status (Accept/Refuse)
  const handleStatusUpdate = async (newStatus: string) => {
    if (!confirm(`Confirmer le changement de statut en ${newStatus} ?`)) return;
    try {
        const res = await api.patch(`/service-requests/${id}/status`, { status: newStatus });
        setRequest(res.data); // Update local state
    } catch (err) {
        alert("Erreur lors de la mise à jour");
    }
  };

  // B. Assign Maid (NEW FUNCTION)
  const handleAssignMaid = async () => {
    if (!selectedMaidId) return alert("Veuillez sélectionner un intervenant.");
    
    setAssigning(true);
    try {
      // Call the endpoint we created in the backend
      const res = await api.patch(`/service-requests/${id}/assign`, {
        maidId: parseInt(selectedMaidId)
      });
      setRequest(res.data); // Update state (Status becomes ASSIGNED automatically)
      alert("Intervenant assigné avec succès !");
    } catch (err: any) {
      alert("Erreur : " + (err.response?.data?.message || "Impossible d'assigner."));
    } finally {
      setAssigning(false);
    }
  };

  // --- HELPER: End Time Calc ---
  const getEndTime = (startStr: string, duration: number) => {
    const date = new Date(startStr);
    date.setHours(date.getHours() + duration);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading || !request) {
    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            <Sidebar />
            <div className="ml-64 flex-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
        </div>
    );
  }

  const startDate = new Date(request.startTime);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar />

      <main className="ml-64 flex-1 p-8">
        
        {/* --- Header --- */}
        <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
                {/* UPDATED LINK HERE */}
                <Link href="/dashboard" className="rounded-full bg-white p-2 text-slate-400 shadow-sm hover:text-teal-600 hover:shadow-md transition-all">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Demande #{request.id}</h1>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span>Reçue le {new Date(request.createdAt).toLocaleDateString('fr-FR')}</span>
                        <span>•</span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold uppercase ${
                            request.status === 'CONFIRMED' ? 'bg-teal-100 text-teal-800' : 
                            request.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                            request.status === 'REQUESTED' ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                            {request.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* --- ACTION BUTTONS --- */}
            <div className="flex gap-3">
                {/* 1. If New -> Show Accept/Reject */}
                {request.status === 'REQUESTED' && (
                    <>
                        <button 
                            onClick={() => handleStatusUpdate('CANCELLED')}
                            className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <XCircle className="h-4 w-4" /> Refuser
                        </button>
                        <button 
                            onClick={() => handleStatusUpdate('CONFIRMED')}
                            className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-teal-200 hover:bg-teal-700 transition-colors"
                        >
                            <CheckCircle2 className="h-4 w-4" /> Valider la demande
                        </button>
                    </>
                )}

                {/* 2. If Confirmed -> Show "Waiting for Assignment" indicator */}
                {request.status === 'CONFIRMED' && (
                    <div className="flex items-center gap-2 rounded-lg bg-teal-50 px-4 py-2 text-sm font-bold text-teal-700 border border-teal-100">
                        <CheckCircle2 className="h-4 w-4" /> Demande Validée
                    </div>
                )}
            </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
            
            {/* --- LEFT COLUMN (Info) --- */}
            <div className="col-span-2 space-y-6">
                
                {/* 1. ASSIGNMENT PANEL (NEW SECTION) */}
                {(request.status === 'CONFIRMED' || request.status === 'ASSIGNED') && (
                    <div className={`rounded-2xl border p-6 shadow-sm transition-all ${
                        request.status === 'ASSIGNED' ? 'bg-blue-50 border-blue-200' : 'bg-white border-orange-200 ring-4 ring-orange-50'
                    }`}>
                        <h2 className="mb-4 text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-teal-600" />
                            Affectation Intervenant
                        </h2>

                        {/* CASE A: Already Assigned */}
                        {request.maid ? (
                            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-blue-100">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                        {request.maid.fullName.substring(0,2)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{request.maid.fullName}</p>
                                        <p className="text-sm text-slate-500">{request.maid.phoneNumber}</p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-blue-600 uppercase bg-blue-50 px-3 py-1 rounded-full">
                                    Affecté
                                </span>
                            </div>
                        ) : (
                            /* CASE B: Needs Assignment */
                            <div className="flex gap-4 items-end">
                                <div className="flex-1 space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Choisir un intervenant disponible</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                                            value={selectedMaidId}
                                            onChange={(e) => setSelectedMaidId(e.target.value)}
                                        >
                                            <option value="">-- Sélectionner --</option>
                                            {maids.map(maid => (
                                                <option key={maid.id} value={maid.id}>
                                                    {maid.fullName} ({maid.specialty})
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                                <button 
                                    onClick={handleAssignMaid}
                                    disabled={assigning}
                                    className="h-[46px] px-6 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors disabled:opacity-70"
                                >
                                    {assigning ? <Loader2 className="h-4 w-4 animate-spin" /> : "Assigner"}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* 2. Property Details */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-teal-600" /> Détails
                    </h2>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <p className="text-xs font-bold uppercase text-slate-400">Adresse</p>
                            <p className="font-medium text-slate-900 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-teal-500" /> {request.address}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold uppercase text-slate-400">Nettoyage</p>
                            <p className="font-medium text-slate-900 capitalize">
                                {request.cleaningType} • {request.durationHours}h
                            </p>
                        </div>
                    </div>
                </div>

                {/* 3. Schedule */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-teal-600" /> Planning
                    </h2>
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-white border border-slate-200 shadow-sm">
                                <span className="text-xs font-bold text-slate-400">
                                    {startDate.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase()}
                                </span>
                                <span className="text-lg font-bold text-slate-900">
                                    {startDate.getDate()}
                                </span>
                            </div>
                            <div>
                                <p className="font-bold text-slate-900">Date d'intervention</p>
                                <p className="text-sm text-slate-500">
                                    {startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - 
                                    {getEndTime(request.startTime, request.durationHours)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* --- RIGHT COLUMN (Client) --- */}
            <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold text-slate-800 flex items-center gap-2">
                        <User className="h-5 w-5 text-teal-600" /> Client
                    </h2>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg uppercase">
                            {request.customerName.substring(0,2)}
                        </div>
                        <div>
                            <p className="font-bold text-slate-900">{request.customerName}</p>
                            <p className="text-xs text-slate-400">Client</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <a href={`tel:${request.customerPhone}`} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition-colors">
                            <Phone className="h-4 w-4 text-teal-600" />
                            <span className="text-sm font-medium text-slate-700">{request.customerPhone}</span>
                        </a>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold text-slate-800 flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-teal-600" /> Notes
                    </h2>
                    <textarea 
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm focus:border-teal-500 focus:outline-none min-h-[100px] resize-none"
                        placeholder="Notes internes..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                    <button className="mt-3 w-full rounded-lg bg-slate-800 py-2 text-sm font-bold text-white">
                        Sauvegarder
                    </button>
                </div>
            </div>

        </div>
      </main>
    </div>
  );
}