"use client";

import { use, useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, MapPin, Calendar, Clock, User, Phone, 
  CheckCircle2, SprayCan, AlertCircle, Loader2, Sparkles, UserPlus 
} from "lucide-react";
import Link from "next/link";

// --- Types ---
interface ServiceRequest {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  propertyType: string;
  rooms: number;
  bathrooms: number;
  cleaningType: string;
  hasSupplies: boolean;
  extras: string[];
  startTime: string;
  durationHours: number;
  status: string;
  maidId: number | null;
  maid?: {
    id: number;
    fullName: string;
  };
}

interface Maid {
  id: number;
  fullName: string;
  specialty: string;
  status: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RequestDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);

  // --- États ---
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [maids, setMaids] = useState<Maid[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedMaidId, setSelectedMaidId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // --- Chargement des données ---
  useEffect(() => {
    if (!id) return;

    const fetchDetailsAndMaids = async () => {
      try {
        // On charge la réservation ET le catalogue du personnel en parallèle
        const [reqRes, maidsRes] = await Promise.all([
          api.get(`/service-requests/${id}`),
          api.get('/maids')
        ]);
        
        setRequest(reqRes.data);
        setMaids(maidsRes.data);
        
        // Si un intervenant est déjà assigné, on pré-remplit le select
        if (reqRes.data.maidId) {
          setSelectedMaidId(reqRes.data.maidId.toString());
        }
      } catch (err) {
        console.error("Erreur de chargement", err);
        setError("Impossible de charger les détails de cette mission.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetailsAndMaids();
  }, [id]);

  // --- Fonction d'assignation ---
  const handleAssignMaid = async () => {
    if (!selectedMaidId) {
      alert("Veuillez sélectionner un intervenant !");
      return;
    }

    setIsAssigning(true);
    try {
      // On met à jour la base de données : on lie le maidId et on change le statut
      const res = await api.patch(`/service-requests/${id}`, {
        maidId: parseInt(selectedMaidId),
        status: 'ASSIGNED'
      });
      
      // On met à jour l'affichage localement sans recharger la page
      setRequest(res.data);
    } catch (err) {
      console.error("Erreur d'assignation", err);
      alert("Une erreur est survenue lors de l'assignation.");
    } finally {
      setIsAssigning(false);
    }
  };

  // --- Helpers UI ---
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'CONFIRMED': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'REQUESTED': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // Écrans de chargement et d'erreur
  if (loading) return <div className="flex min-h-screen bg-slate-50"><Sidebar /><main className="ml-64 flex-1 flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></main></div>;
  if (error || !request) return <div className="flex min-h-screen bg-slate-50"><Sidebar /><main className="ml-64 flex-1 flex justify-center items-center"><AlertCircle className="h-10 w-10 text-red-500 mb-4" /><p className="text-xl font-bold">{error}</p></main></div>;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar />
      <main className="ml-64 flex-1 p-8 max-w-6xl mx-auto">
        
        {/* En-tête de navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/planning" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Retour au planning
          </Link>
          <span className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase border shadow-sm ${getStatusBadge(request.status)}`}>
            Statut : {request.status === 'REQUESTED' ? 'EN ATTENTE' : request.status}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
          {/* COLONNE GAUCHE : Détails de la mission */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Carte 1 : Le Client */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-slate-800 flex items-center gap-2">
                <User className="h-5 w-5 text-teal-600" /> Informations Client
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Nom Complet</p>
                    <p className="font-medium text-slate-900">{request.customerName}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Téléphone</p>
                    <p className="font-medium text-slate-900 flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400"/> {request.customerPhone}</p>
                </div>
                <div className="col-span-2">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Adresse d'intervention</p>
                    <p className="font-medium text-slate-900 flex items-start gap-2"><MapPin className="h-4 w-4 text-slate-400 mt-0.5"/> {request.address}</p>
                </div>
              </div>
            </div>

            {/* Carte 2 : La Prestation */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-teal-600" /> Détails de la prestation
              </h2>
              
              <div className="flex items-center gap-6 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                      <Calendar className="h-8 w-8 text-teal-600" />
                      <div>
                          <p className="text-sm font-bold text-slate-900">
                              {new Date(request.startTime).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                          <p className="text-sm text-slate-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" /> 
                              {new Date(request.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} 
                              <span className="mx-1">•</span> 
                              Durée : {request.durationHours}h
                          </p>
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Type de Logement</p>
                    <p className="font-medium text-slate-900 capitalize">{request.propertyType} • {request.rooms} pièces</p>
                </div>
                <div>
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Type de Nettoyage</p>
                    <p className="font-medium text-slate-900">{request.cleaningType === 'deep' ? 'Grand Ménage' : 'Standard'}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Matériel</p>
                    {request.hasSupplies ? (
                        <span className="flex items-center gap-1 text-sm font-medium text-emerald-600"><CheckCircle2 className="h-4 w-4"/> Fourni par le client</span>
                    ) : (
                        <span className="flex items-center gap-1 text-sm font-medium text-orange-600"><SprayCan className="h-4 w-4"/> L'intervenant doit apporter</span>
                    )}
                </div>
                {request.extras && request.extras.length > 0 && (
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">Options supplémentaires</p>
                        <div className="flex gap-2 flex-wrap">
                            {request.extras.map(e => <span key={e} className="px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-700 capitalize">{e}</span>)}
                        </div>
                    </div>
                )}
              </div>
            </div>
          </div>

          {/* COLONNE DROITE : Assignation (Le fameux Drag & Drop / Select) */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className={`rounded-2xl border p-6 shadow-sm transition-colors ${request.maidId ? 'bg-blue-50 border-blue-200' : 'bg-white border-orange-200'}`}>
                
                <h2 className={`mb-4 text-lg font-bold flex items-center gap-2 ${request.maidId ? 'text-blue-800' : 'text-slate-800'}`}>
                    <UserPlus className={`h-5 w-5 ${request.maidId ? 'text-blue-600' : 'text-orange-500'}`} /> 
                    {request.maidId ? 'Intervenant Assigné' : 'Assignation'}
                </h2>

                {/* Si un intervenant est déjà assigné, on affiche son badge */}
                {request.maid && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl bg-white p-3 border border-blue-100 shadow-sm">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                            {request.maid.fullName.substring(0,2).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-bold text-slate-900">{request.maid.fullName}</p>
                            <Link href={`/staff/${request.maidId}`} className="text-xs font-medium text-blue-600 hover:underline">Voir le profil</Link>
                        </div>
                    </div>
                )}

                {/* Menu déroulant pour choisir ou changer l'intervenant */}
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700">
                        {request.maidId ? 'Changer l\'intervenant :' : 'Choisir un intervenant dans l\'équipe :'}
                    </label>
                    
                    <select 
                        value={selectedMaidId}
                        onChange={(e) => setSelectedMaidId(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    >
                        <option value="">-- Sélectionner un profil --</option>
                        {maids.map(maid => (
                            <option key={maid.id} value={maid.id}>
                                {maid.fullName} ({maid.specialty}) {maid.status === 'BUSY' ? '- ⚠️ Déjà en mission' : ''}
                            </option>
                        ))}
                    </select>

                    <button 
                        onClick={handleAssignMaid}
                        disabled={isAssigning || !selectedMaidId || selectedMaidId === request.maidId?.toString()}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-sm font-bold text-white shadow-md hover:bg-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isAssigning ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        Valider l'assignation
                    </button>
                </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}