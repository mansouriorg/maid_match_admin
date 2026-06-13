"use client";

import Sidebar from "@/components/Sidebar";
import { api } from "@/lib/api"; 
import { useEffect, useState } from "react";
import { 
  User, 
  Building, 
  Bell, 
  Shield, 
  Save,
  Loader2,
  CheckCircle2,
  ChevronRight
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);

  // État initial vide (sera rempli par la base de données)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    companyName: "",
    contactPhone: "",
    defaultHourlyRate: "15",
    emailAlerts: true,
    smsAlerts: false,
  });

  // État pour gérer les mots de passe dynamiquement
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // 1. Charger les paramètres depuis le backend au montage de la page
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await api.get("/settings");
        if (res.data) {
          setFormData({
            ...res.data,
            // Convertir la valeur numérique en chaîne pour l'input HTML
            defaultHourlyRate: res.data.defaultHourlyRate.toString(),
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement des paramètres:", error);
      } finally {
        setIsLoadingInitialData(false);
      }
    };

    loadSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 2. Sauvegarder les modifications dans la base de données
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // A. Sauvegarde des paramètres classiques
      await api.patch("/settings", formData);

      // B. Si l'utilisateur essaie de changer son mot de passe
      if (passwordData.newPassword) {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          alert("Les mots de passe ne correspondent pas !");
          setIsSaving(false);
          return;
        }
        
        // Appel à la nouvelle route Admin de NestJS
        await api.patch("/admin/change-password", {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        });
        
        // Vider les champs après succès
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000); 
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde:", error);
      // Afficher l'erreur renvoyée par le backend (ex: mauvais mot de passe actuel)
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Une erreur est survenue lors de la sauvegarde.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Mon Profil", icon: User, desc: "Informations personnelles" },
    { id: "company", label: "L'Entreprise", icon: Building, desc: "Détails et facturation" },
    { id: "notifications", label: "Notifications", icon: Bell, desc: "Alertes et emails" },
    { id: "security", label: "Sécurité", icon: Shield, desc: "Mots de passe et accès" },
  ];

  const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 transition-all focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 placeholder:text-slate-400";
  const labelClass = "text-sm font-semibold text-slate-700 mb-1.5 block";

  // Écran de chargement esthétique en attendant les données
  if (isLoadingInitialData) {
    return (
      <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar />
      
      <main className="ml-64 flex-1">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/80 px-8 backdrop-blur-md">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Paramètres</h1>
          
          <div className="flex items-center gap-4">
            {showSuccess && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 animate-in fade-in slide-in-from-right-4">
                <CheckCircle2 className="h-4 w-4" /> Sauvegardé
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-teal-700 hover:shadow disabled:opacity-70"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Enregistrer
            </button>
          </div>
        </header>

        {/* Settings Content */}
        <div className="p-8 animate-in fade-in zoom-in-95 duration-500 max-w-6xl mx-auto">
          
          <div className="flex flex-col md:flex-row gap-8">
            
            {/* Left Sidebar (Tabs) */}
            <div className="w-full md:w-72 shrink-0">
              <nav className="flex flex-col gap-1.5">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`group flex items-center justify-between rounded-xl px-4 py-3 text-left transition-all ${
                        isActive 
                          ? "bg-white border border-slate-200 shadow-sm" 
                          : "border border-transparent hover:bg-white hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${isActive ? 'bg-teal-50 text-teal-600' : 'bg-transparent text-slate-400 group-hover:text-slate-600'}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${isActive ? 'text-teal-700' : 'text-slate-700'}`}>
                            {tab.label}
                          </p>
                          <p className="text-xs text-slate-500">{tab.desc}</p>
                        </div>
                      </div>
                      {isActive && <ChevronRight className="h-4 w-4 text-slate-300" />}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Right Content (Forms) */}
            <div className="flex-1">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                
                {/* Dynamic Header */}
                <div className="border-b border-slate-100 bg-white px-8 py-6">
                  <h2 className="text-lg font-bold text-slate-800">
                    {tabs.find(t => t.id === activeTab)?.label}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Gérez vos préférences et paramètres pour cette section.
                  </p>
                </div>

                <div className="p-8">
                  {/* --- TAB: PROFIL --- */}
                  {activeTab === "profile" && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="grid grid-cols-2 gap-5">
                        <div>
                          <label className={labelClass}>Prénom</label>
                          <input 
                            type="text" 
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Nom</label>
                          <input 
                            type="text" 
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className={inputClass}
                          />
                        </div>
                        <div className="col-span-2">
                          <label className={labelClass}>Adresse Email</label>
                          <input 
                            type="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* --- TAB: ENTREPRISE --- */}
                  {activeTab === "company" && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div>
                        <label className={labelClass}>Nom de l'Entreprise</label>
                        <input 
                          type="text" 
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Téléphone de Contact</label>
                        <input 
                          type="text" 
                          name="contactPhone"
                          value={formData.contactPhone}
                          onChange={handleInputChange}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={`${labelClass} flex justify-between items-center`}>
                          Tarif Horaire de Base
                          <span className="text-xs font-normal text-slate-400">Calcul des devis (TND)</span>
                        </label>
                        <div className="relative">
                          <input 
                            type="number" 
                            name="defaultHourlyRate"
                            value={formData.defaultHourlyRate}
                            onChange={handleInputChange}
                            className={`${inputClass} pl-12`}
                          />
                          <span className="absolute left-4 top-[11px] font-medium text-slate-400">TND</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* --- TAB: NOTIFICATIONS --- */}
                  {activeTab === "notifications" && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      
                      <label className="flex items-center justify-between cursor-pointer rounded-xl border border-slate-200 bg-white p-5 hover:border-teal-500 transition-colors">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">Alertes par Email</p>
                          <p className="text-xs text-slate-500 mt-1">Nouveau client, paiement reçu, etc.</p>
                        </div>
                        <div className="relative">
                          <input type="checkbox" name="emailAlerts" checked={formData.emailAlerts} onChange={handleInputChange} className="peer sr-only" />
                          <div className="h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-teal-500 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full"></div>
                        </div>
                      </label>

                      <label className="flex items-center justify-between cursor-pointer rounded-xl border border-slate-200 bg-white p-5 hover:border-teal-500 transition-colors">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">Alertes SMS</p>
                          <p className="text-xs text-slate-500 mt-1">Urgences et rappels immédiats (frais applicables).</p>
                        </div>
                        <div className="relative">
                          <input type="checkbox" name="smsAlerts" checked={formData.smsAlerts} onChange={handleInputChange} className="peer sr-only" />
                          <div className="h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-teal-500 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full"></div>
                        </div>
                      </label>

                    </div>
                  )}

                  {/* --- TAB: SECURITE --- */}
                  {activeTab === "security" && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div>
                        <label className={labelClass}>Mot de passe actuel</label>
                        <input 
                          type="password" 
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          placeholder="••••••••" 
                          className={inputClass} 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-5">
                        <div>
                          <label className={labelClass}>Nouveau mot de passe</label>
                          <input 
                            type="password" 
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            placeholder="••••••••" 
                            className={inputClass} 
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Confirmer le mot de passe</label>
                          <input 
                            type="password" 
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            placeholder="••••••••" 
                            className={inputClass} 
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}