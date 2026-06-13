"use client";

import { use, useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { api } from "@/lib/api";
import { 
  ArrowLeft, Calendar, Clock, MapPin, Phone, Mail, 
  CheckCircle2, XCircle, User, Shield, MessageSquare, Save, 
  AlertTriangle, Loader2, Briefcase, ChevronDown, CheckSquare, Ban
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
  const [maids, setMaids] = useState<Maid[]>([]); 
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
          api.get('/maids?status=AVAILABLE') 
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

  // A. Change Status (Workflow linéaire)
  const handleStatusUpdate = async (newStatus: string) => {
    const actionText = newStatus === 'COMPLETED' ? 'marquer cette mission comme terminée' : 
                       newStatus === 'CANCELLED' ? 'annuler cette demande' : 
                       'valider cette demande';

    if (!confirm(`Voulez-vous vraiment ${actionText} ?`)) return;
    
    try {
        const res = await api.patch(`/service-requests/${id}/status`, { status: newStatus });
        setRequest(res.data); 
    } catch (err) {
        alert("Erreur lors de la mise à jour du statut.");
    }
  };

  // B. Assign Maid
  const handleAssignMaid = async () => {
    if (!selectedMaidId) return alert("Veuillez sélectionner un intervenant.");
    
    setAssigning(true);
    try {
      const res = await api.patch(`/service-requests/${id}/assign`, {
        maidId: parseInt(selectedMaidId)
      });
      setRequest(res.data); 
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
        <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-6">
            <div className="flex items-center gap-4">
                <Link href="/planning" className="rounded-full bg-white p-2 text-slate-400 shadow-sm border border-slate-200 hover:text-teal-600 hover:shadow-md transition-all">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Demande #{request.id}</h1>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                        <span>Créée le {new Date(request.createdAt).toLocaleDateString('fr-FR')}</span>
                        <span>•</span>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            request.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            request.status === 'CONFIRMED' ? 'bg-teal-100 text-teal-800' : 
                            request.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                            request.status === 'REQUESTED' ? 'bg-orange-100 text-orange-800' : 
                            'bg-slate-100 text-slate-600'
                        }`}>
                            {request.status === 'REQUESTED' ? 'EN ATTENTE' : request.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* --- WORKFLOW ACTION BUTTONS --- */}
            <div className="flex gap-3">
                
                {/* Toujours afficher le bouton Annuler, sauf si déjà annulé ou terminé */}
                {['REQUESTED', 'CONFIRMED', 'ASSIGNED'].includes(request.status) && (
                    <button 
                        onClick={() => handleStatusUpdate('CANCELLED')}
                        className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <Ban className="h-4 w-4" /> Annuler
                    </button>
                )}

                {/* ÉTAPE 1 : En Attente -> Confirmer */}
                {request.status === 'REQUESTED' && (
                    <button 
                        onClick={() => handleStatusUpdate('CONFIRMED')}
                        className="flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-teal-200 hover:bg-teal-700 transition-colors"
                    >
                        <CheckCircle2 className="h-4 w-4" /> Confirmer la mission
                    </button>
                )}

                {/* ÉTAPE 2 : Confirmé -> En attente d'assignation (Indicateur visuel) */}
                {request.status === 'CONFIRMED' && (
                    <div className="flex items-center gap-2 rounded-lg bg-orange-50 px-5 py-2 text-sm font-bold text-orange-700 border border-orange-200 shadow-sm">
                        <AlertTriangle className="h-4 w-4" /> En attente d'intervenant
                    </div>
                )}

                {/* ÉTAPE 3 : Assigné -> Marquer comme terminé */}
                {request.status === 'ASSIGNED' && (
                    <button 
                        onClick={() => handleStatusUpdate('COMPLETED')}
                        className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-green-200 hover:bg-green-700 transition-colors"
                    >
                        <CheckSquare className="h-4 w-4" /> Marquer comme terminé
                    </button>
                )}

                {/* ÉTAPE 4 : Terminé (Indicateur visuel final) */}
                {request.status === 'COMPLETED' && (
                    <div className="flex items-center gap-2 rounded-lg bg-green-50 px-5 py-2 text-sm font-bold text-green-700 border border-green-200">
                        <CheckCircle2 className="h-5 w-5" /> Mission Terminée
                    </div>
                )}

                {/* Mission Annulée */}
                {request.status === 'CANCELLED' && (
                    <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-5 py-2 text-sm font-bold text-slate-500 border border-slate-200">
                        <XCircle className="h-5 w-5" /> Mission Annulée
                    </div>
                )}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* --- LEFT COLUMN (Info) --- */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* 1. ASSIGNMENT PANEL (Ne s'affiche que si Confirmé ou Assigné) */}
                {(request.status === 'CONFIRMED' || request.status === 'ASSIGNED') && (
                    <div className={`rounded-2xl border p-6 shadow-sm transition-all ${
                        request.status === 'ASSIGNED' ? 'bg-blue-50 border-blue-200' : 'bg-white border-orange-200 ring-4 ring-orange-50'
                    }`}>
                        <h2 className={`mb-4 text-lg font-bold flex items-center gap-2 ${request.status === 'ASSIGNED' ? 'text-blue-800' : 'text-slate-800'}`}>
                            <Briefcase className={`h-5 w-5 ${request.status === 'ASSIGNED' ? 'text-blue-600' : 'text-orange-500'}`} />
                            Affectation Intervenant
                        </h2>

                        {request.maid ? (
                            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shadow-inner">
                                        {request.maid.fullName.substring(0,2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-lg">{request.maid.fullName}</p>
                                        <p className="text-sm text-slate-500 flex items-center gap-1">
                                            <Phone className="h-3 w-3" /> {request.maid.phoneNumber}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-100 px-3 py-1.5 rounded-full border border-blue-200">
                                    Assigné au poste
                                </span>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row gap-4 items-end">
                                <div className="flex-1 w-full space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Sélectionner un intervenant de l'équipe :</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 font-medium text-slate-700"
                                            value={selectedMaidId}
                                            onChange={(e) => setSelectedMaidId(e.target.value)}
                                        >
                                            <option value="">-- Parcourir le catalogue --</option>
                                            {maids.map(maid => (
                                                <option key={maid.id} value={maid.id}>
                                                    {maid.fullName} ({maid.specialty})
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                                <button 
                                    onClick={handleAssignMaid}
                                    disabled={assigning || !selectedMaidId}
                                    className="h-[46px] w-full sm:w-auto px-8 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                                >
                                    {assigning ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Valider l'assignation"}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* 2. Property Details */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-teal-600" /> Détails de la propriété
                    </h2>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <p className="text-xs font-bold uppercase text-slate-400">Adresse complète</p>
                            <p className="font-medium text-slate-900 flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" /> 
                                <span className="leading-snug">{request.address}</span>
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold uppercase text-slate-400">Type de nettoyage</p>
                            <p className="font-medium text-slate-900 capitalize">
                                {request.cleaningType === 'deep' ? 'Grand Ménage' : 'Standard'} • {request.durationHours}h
                            </p>
                        </div>
                    </div>
                </div>

                {/* 3. Schedule */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-teal-600" /> Planning et Horaires
                    </h2>
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm">
                                <span className="text-[10px] font-extrabold text-teal-600 uppercase">
                                    {startDate.toLocaleDateString('fr-FR', { month: 'short' })}
                                </span>
                                <span className="text-xl font-black text-slate-800 leading-none mt-0.5">
                                    {startDate.getDate()}
                                </span>
                            </div>
                            <div>
                                <p className="font-bold text-slate-900">Date d'intervention prévue</p>
                                <p className="text-sm font-medium text-slate-600 flex items-center gap-1.5 mt-0.5">
                                    <Clock className="h-3.5 w-3.5 text-teal-500" />
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
                        <div className="h-12 w-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg uppercase shadow-inner">
                            {request.customerName.substring(0,2)}
                        </div>
                        <div>
                            <p className="font-bold text-slate-900">{request.customerName}</p>
                            <p className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded inline-block mt-1">Nouveau Client</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <a href={`tel:${request.customerPhone}`} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:bg-teal-50 hover:border-teal-100 group transition-colors">
                            <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-teal-100 transition-colors">
                                <Phone className="h-4 w-4 text-teal-600" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 group-hover:text-teal-800">{request.customerPhone}</span>
                        </a>
                        <a href={`mailto:${request.customerEmail}`} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:bg-teal-50 hover:border-teal-100 group transition-colors">
                            <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-teal-100 transition-colors">
                                <Mail className="h-4 w-4 text-teal-600" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 group-hover:text-teal-800 truncate">{request.customerEmail}</span>
                        </a>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold text-slate-800 flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-teal-600" /> Notes Internes
                    </h2>
                    <textarea 
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 outline-none min-h-[120px] resize-none transition-all"
                        placeholder="Ajouter des instructions secrètes ou des remarques sur l'accès..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                    <button className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800 transition-colors shadow-md">
                        <Save className="h-4 w-4" /> Sauvegarder la note
                    </button>
                </div>
            </div>

        </div>
      </main>
    </div>
  );
}