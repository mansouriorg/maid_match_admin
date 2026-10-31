"use client";

import Sidebar from "@/components/Sidebar";
import DashboardStats from "@/components/DashboardStats"; // <-- 1. Import du nouveau composant
import { api } from "@/lib/api"; 
import { socket } from "@/lib/socket"; 
import { 
  Search, Bell, MapPin, Calendar, Clock, Phone, MoreHorizontal, 
  SprayCan, Key, Shirt, Cat, Loader2, AlertCircle, Check
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// --- Types ---
interface ServiceRequest {
  id: number;
  customerName: string;
  customerPhone: string;
  startTime: string;
  endDate?: string | null; 
  durationHours: number;
  address: string;
  propertyType: string;
  cleaningType: string;
  hasSupplies: boolean;
  extras: string[];
  status: string;
  maid?: { fullName: string };
}

interface AppNotification {
  id: number;
  title: string;
  message: string;
  createdAt: string; 
  isRead: boolean;
  serviceRequestId?: number; 
}

export default function AdminDashboard() {
  const router = useRouter(); 

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // FETCH DATA & LISTEN TO SOCKET
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reqResponse, notifResponse] = await Promise.all([
          api.get('/service-requests'),
          api.get('/notifications') 
        ]);
        
        setRequests(reqResponse.data);
        setNotifications(notifResponse.data);
      } catch (err) {
        console.error("Dashboard Load Error:", err);
        setError("Impossible de charger les données.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const handleNewIntervention = (payload: AppNotification & { data: ServiceRequest }) => {
      if (payload.data) {
        setRequests((prevRequests) => [payload.data, ...prevRequests]);
      }

      const newNotif: AppNotification = {
        id: payload.id,
        title: payload.title,
        message: payload.message,
        createdAt: payload.createdAt,
        isRead: payload.isRead,
        serviceRequestId: payload.serviceRequestId,
      };
      setNotifications((prevNotifs) => [newNotif as AppNotification, ...prevNotifs]);
    };

    socket.on("new-intervention", handleNewIntervention);

    return () => {
      socket.off("new-intervention", handleNewIntervention);
    };
  }, []); 

  // --- Logique des notifications ---
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Erreur lors de la mise à jour des notifications", err);
    }
  };

  // 4. Gérer le clic sur une notification précise (Mis à jour avec Fallback)
  const handleNotificationClick = async (notif: AppNotification) => {
    // A. On log la notification pour comprendre ce qu'elle contient
    console.log("Notification cliquée :", notif);

    // B. On ferme le menu des notifications
    setIsNotifOpen(false);

    // C. Si elle n'est pas lue, on la marque comme lue
    if (!notif.isRead) {
      try {
        await api.patch(`/notifications/${notif.id}/read`);
        setNotifications(notifications.map(n => 
          n.id === notif.id ? { ...n, isRead: true } : n
        ));
      } catch (err) {
        console.error("Erreur read notif", err);
      }
    }

    // D. Redirection avec solution de secours (Fallback)
    if (notif.serviceRequestId) {
      // S'il y a un ID (Nouvelles notifications), on va sur la page précise
      router.push(`/requests/${notif.serviceRequestId}`);
    } else {
      // S'il n'y a pas d'ID (Anciennes notifications), on va sur la liste globale
      console.warn("Ancienne notification sans ID. Redirection vers /requests");
      router.push(`/requests`);
    }
  };

  const toggleNotifMenu = () => {
    setIsNotifOpen(!isNotifOpen);
  };

  // --- Helpers d'affichage ---
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

  const getExtraIcon = (extra: string) => {
    if (!extra) return null;
    const key = extra.toLowerCase().trim();
    if (key.includes('repassage')) return <Shirt className="h-3 w-3" />;
    if (key.includes('clés')) return <Key className="h-3 w-3" />;
    if (key.includes('animaux')) return <Cat className="h-3 w-3" />;
    return null;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', { 
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' 
    });
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-slate-50 font-sans text-slate-900">
      <Sidebar />
      
      <main className="lg:ml-64 flex-1">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/80 px-4 sm:px-8 backdrop-blur-md">
          <h1 className="text-2xl font-bold text-slate-800">Tableau de Bord</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              {/* The search box is hidden until it is connected to the list below. */}
              <Search className="absolute left-3 top-3 hidden h-4 w-4 text-slate-500" />
              <input 
                hidden
                placeholder="Rechercher un client..." 
                className="h-10 w-36 sm:w-64 rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
              />
            </div>

            {/* --- ZONE DU BOUTON NOTIFICATION --- */}
            <div className="relative">
              <button 
                aria-label="Notifications"
                aria-expanded={isNotifOpen}
                onClick={toggleNotifMenu}
                className="relative rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Le Menu Déroulant des Notifications */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
                    <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                    {notifications.length > 0 && unreadCount > 0 && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); 
                          markAllAsRead();
                        }}
                        className="flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-700"
                      >
                        <Check className="h-3 w-3" /> Tout marquer lu
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-slate-500">
                        Aucune notification
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            onClick={() => handleNotificationClick(notif)} 
                            className={`p-4 transition-colors hover:bg-slate-50 cursor-pointer ${notif.isRead ? 'opacity-70' : 'bg-teal-50/30'}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-bold text-slate-800">{notif.title}</p>
                              <span className="text-xs text-slate-500 flex-shrink-0">
                                {new Date(notif.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' })}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-600 line-clamp-2">{notif.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* --- FIN ZONE NOTIFICATION --- */}

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

          {/* 🌟 2. NOUVEAU : CARTES DE STATISTIQUES 🌟 */}
          <DashboardStats />

          {/* Requests List */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="font-bold text-lg text-slate-800">Dernières réservations</h2>
              <Link href="/requests" className="text-sm font-medium text-teal-700 hover:text-teal-700">Tout voir</Link>
            </div>
            
            {loading ? (
                <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
                </div>
            ) : requests.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-slate-500">
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
                            <Calendar className="h-4 w-4 text-teal-700" />
                            {formatDate(req.startTime)}
                            {req.endDate && (
                              <span className="block text-xs font-medium text-teal-700">
                                &rarr; {formatDate(req.endDate)}
                              </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                            <Clock className="h-4 w-4" />
                            {req.durationHours}h ({req.cleaningType})
                        </div>
                    </div>

                    {/* Middle: Address & Alerts */}
                    <div className="hidden w-1/3 lg:block">
                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-2 truncate">
                            <MapPin className="h-4 w-4 text-slate-500" />
                            <span className="truncate">{req.address}</span>
                        </div>
                        <div className="flex gap-2">
                            {!req.hasSupplies && (
                                <span className="inline-flex items-center gap-1 rounded border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700">
                                    <SprayCan className="h-3 w-3" /> Matériel requis
                                </span>
                            )}
                            {req.extras?.map(e => (
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
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-600 transition-colors" 
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