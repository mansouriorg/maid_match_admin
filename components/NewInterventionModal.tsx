"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { parisWallTimeToIso, todayInParis } from "@/lib/time";
import toast from "react-hot-toast";
import { X, Save, User, MapPin, Calendar, Clock, Briefcase, Loader2 } from "lucide-react";

interface Maid {
  id: number;
  fullName: string;
}

interface NewInterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Refresh data after create
}

export default function NewInterventionModal({ isOpen, onClose, onSuccess }: NewInterventionModalProps) {
  const [loading, setLoading] = useState(false);
  const [maids, setMaids] = useState<Maid[]>([]);
  
  // Form State
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    address: "",
    propertyType: "apartment", // Default
    rooms: 3,
    bathrooms: 1,
    cleaningType: "standard",
    hasSupplies: true,
    // Note: 'date' and 'time' are used for the UI form but NOT sent to backend directly
    date: todayInParis(), // YYYY-MM-DD
    time: "09:00",
    durationHours: 3,
    frequency: "one-time",
    status: "CONFIRMED", // Default starting status
    maidId: "", // Optional
  });

  // Fetch Maids when modal opens
  useEffect(() => {
    if (isOpen) {
      // People on leave cannot be assigned, so they are not offered.
      api.get("/maids").then((res) => setMaids(res.data.filter((m: { status?: string }) => m.status !== "ON_LEAVE")));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Construct the full ISO Date (Date + Time)
      const fullStartDate = parisWallTimeToIso(formData.date, formData.time);

      // 2. Destructure to REMOVE 'date' and 'time' from the payload
      const rest: Partial<typeof formData> = { ...formData };
      delete rest.date;
      delete rest.time;
      delete rest.status;

      // 3. Dynamic Status Logic: Automatically switch to ASSIGNED if a maid is selected
      const finalStatus = formData.maidId ? "ASSIGNED" : "CONFIRMED";

      // 4. Prepare Payload
      const payload = {
        ...rest, 
        startTime: fullStartDate,
        rooms: Number(formData.rooms),
        bathrooms: Number(formData.bathrooms),
        durationHours: Number(formData.durationHours),
        hasSupplies: Boolean(formData.hasSupplies),
        maidId: formData.maidId ? Number(formData.maidId) : undefined, 
        status: finalStatus, // <--- Added dynamic status logic here
        extras: [], 
      };

      // 5. Send to Backend
      await api.post("/service-requests", payload);
      
      toast.success("Intervention créée avec succès !");
      onSuccess(); // Refresh parent
      onClose();   // Close modal
    } catch (caught) {
      const err = caught as {
        message?: string;
        response?: { status?: number; data?: { message?: string } };
      };
      console.error(err);
      toast.error("Erreur : " + (err.response?.data?.message || "Création échouée"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="nim-title" className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 id="nim-title" className="text-xl font-bold text-slate-900">Nouvelle Intervention (Admin)</h2>
          <button type="button" onClick={onClose} aria-label="Fermer" className="rounded-full p-2 hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 1. Client Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
               <label htmlFor="nim-customerName" className="mb-1 block text-sm font-bold text-slate-700">Nom du Client</label>
               <div className="relative">
                 <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                 <input id="nim-customerName" name="customerName" required value={formData.customerName} onChange={handleChange} className="w-full rounded-lg border border-slate-300 pl-10 p-2.5 text-sm outline-none focus:border-teal-500" placeholder="Ex: Hôtel Majestic" />
               </div>
            </div>
            <div>
               <label htmlFor="nim-customerPhone" className="mb-1 block text-sm font-bold text-slate-700">Téléphone</label>
               <input id="nim-customerPhone" name="customerPhone" required value={formData.customerPhone} onChange={handleChange} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-teal-500" placeholder="55 123 456" />
            </div>
            <div>
               <label htmlFor="nim-customerEmail" className="mb-1 block text-sm font-bold text-slate-700">Email</label>
               <input id="nim-customerEmail" name="customerEmail" type="email" required value={formData.customerEmail} onChange={handleChange} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-teal-500" placeholder="client@email.com" />
            </div>
          </div>

          {/* 2. Property & Service */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
               <label htmlFor="nim-address" className="mb-1 block text-sm font-bold text-slate-700">Adresse Complète</label>
               <div className="relative">
                 <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                 <input id="nim-address" name="address" required value={formData.address} onChange={handleChange} className="w-full rounded-lg border border-slate-300 pl-10 p-2.5 text-sm outline-none focus:border-teal-500" placeholder="Adresse de l'intervention" />
               </div>
            </div>
            <div>
               <label htmlFor="nim-propertyType" className="mb-1 block text-sm font-bold text-slate-700">Type de Bien</label>
               <select id="nim-propertyType" name="propertyType" value={formData.propertyType} onChange={handleChange} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-teal-500">
                  <option value="apartment">Appartement</option>
                  <option value="villa">Villa</option>
                  <option value="office">Bureau</option>
               </select>
            </div>
            <div>
               <label htmlFor="nim-cleaningType" className="mb-1 block text-sm font-bold text-slate-700">Type de Nettoyage</label>
               <select id="nim-cleaningType" name="cleaningType" value={formData.cleaningType} onChange={handleChange} className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-teal-500">
                  <option value="standard">Standard</option>
                  <option value="deep">Grand Ménage (Deep)</option>
                  <option value="move">Déménagement</option>
               </select>
            </div>
          </div>

          {/* 3. Date & Time */}
          <div className="grid grid-cols-1 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 sm:grid-cols-3">
             <div>
               <label htmlFor="nim-date" className="mb-1 block text-xs font-bold text-slate-500 uppercase">Date</label>
               <div className="relative">
                 <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-teal-700" />
                 <input id="nim-date" type="date" name="date" required value={formData.date} onChange={handleChange} className="w-full rounded-lg border border-slate-300 pl-9 p-2 text-sm outline-none focus:border-teal-500" />
               </div>
             </div>
             <div>
               <label htmlFor="nim-time" className="mb-1 block text-xs font-bold text-slate-500 uppercase">Heure (Paris)</label>
               <div className="relative">
                 <Clock className="absolute left-3 top-2.5 h-4 w-4 text-teal-700" />
                 <input id="nim-time" type="time" name="time" required value={formData.time} onChange={handleChange} className="w-full rounded-lg border border-slate-300 pl-9 p-2 text-sm outline-none focus:border-teal-500" />
               </div>
             </div>
             <div>
               <label htmlFor="nim-durationHours" className="mb-1 block text-xs font-bold text-slate-500 uppercase">Durée (h)</label>
               <input id="nim-durationHours" type="number" name="durationHours" min="1" max="10" required value={formData.durationHours} onChange={handleChange} className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-teal-500" />
             </div>
          </div>

          {/* 4. Admin Assignment (Optional) */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
             <label htmlFor="nim-maidId" className="mb-2 block text-sm font-bold text-blue-800 flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> Assigner un intervenant (Optionnel)
             </label>
             <select id="nim-maidId" name="maidId" value={formData.maidId} onChange={handleChange} className="w-full rounded-lg border border-blue-200 bg-white p-2.5 text-sm outline-none focus:border-blue-500">
                <option value="">-- Laisser en attente --</option>
                {maids.map((m) => (
                  <option key={m.id} value={m.id}>{m.fullName}</option>
                ))}
             </select>
             <p className="mt-2 text-xs text-blue-600">
               * Si vous sélectionnez un intervenant, la demande passera automatiquement en statut <strong>ASSIGNED</strong>.
             </p>
          </div>

          {/* Submit */}
          <button 
            type="submit" 
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 font-bold text-white hover:bg-slate-800 transition-all disabled:opacity-70 shadow-lg"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-5 w-5" /> Créer l&rsquo;intervention</>}
          </button>

        </form>
      </div>
    </div>
  );
}