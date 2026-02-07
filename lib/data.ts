// --- TYPES & MOCK DATA FOR BOOKING REQUESTS ---

export type BookingRequest = {
  id: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  contact: {
    name: string;
    phone: string;
    email: string;
  };
  property: {
    type: string;
    address: string;
    rooms: number;
    bathrooms: number;
    cleaningType: 'standard' | 'deep';
    hasSupplies: boolean;
    extras: string[];
  };
  schedule: {
    startDate: string;
    endDate: string | null;
    startTime: string;
    endTime: string;
    frequency: string;
  };
};

export const mockRequests: BookingRequest[] = [
  {
    id: "CMD-001",
    status: 'pending',
    createdAt: "2023-10-27T10:00:00Z",
    contact: {
      name: "Thomas Martin",
      phone: "06 12 34 56 78",
      email: "thomas@gmail.com"
    },
    property: {
      type: "apartment",
      address: "12 Rue de Rivoli, 75004 Paris",
      rooms: 3,
      bathrooms: 1,
      cleaningType: 'deep',
      hasSupplies: false, // ALERTE: Matériel requis
      extras: ['ironing', 'keys']
    },
    schedule: {
      startDate: "2023-10-30T00:00:00.000Z",
      endDate: null,
      startTime: "09:00",
      endTime: "13:00",
      frequency: "one-time"
    }
  },
  {
    id: "CMD-002",
    status: 'confirmed',
    createdAt: "2023-10-26T14:30:00Z",
    contact: {
      name: "Sophie Dubois",
      phone: "07 98 76 54 32",
      email: "sophie.d@orange.fr"
    },
    property: {
      type: "villa",
      address: "45 Avenue Foch, 75116 Paris",
      rooms: 5,
      bathrooms: 3,
      cleaningType: 'standard',
      hasSupplies: true,
      extras: ['pets'] // Attention au chien
    },
    schedule: {
      startDate: "2023-11-02T00:00:00.000Z",
      endDate: "2023-11-04T00:00:00.000Z", // Sur 3 jours
      startTime: "08:00",
      endTime: "12:00",
      frequency: "weekly"
    }
  },
  {
    id: "CMD-003",
    status: 'cancelled',
    createdAt: "2023-10-25T09:15:00Z",
    contact: {
      name: "Jean Dupont",
      phone: "06 55 44 33 22",
      email: "j.dupont@outlook.com"
    },
    property: {
      type: "studio",
      address: "10 Rue Oberkampf, 75011 Paris",
      rooms: 1,
      bathrooms: 1,
      cleaningType: 'standard',
      hasSupplies: true,
      extras: []
    },
    schedule: {
      startDate: "2023-10-28T00:00:00.000Z",
      endDate: null,
      startTime: "14:00",
      endTime: "16:00",
      frequency: "bi-weekly"
    }
  }
];


// --- TYPES & MOCK DATA FOR STAFF (INTERVENANTS) ---

export type Staff = {
  id: string;
  name: string;
  photo: string; // Initials or URL
  role: string;
  status: 'available' | 'busy' | 'off';
  rating: number;
  jobsCompleted: number;
  location: string;
  phone: string;
  email: string;
  skills: string[]; // ex: ['ironing', 'cooking', 'deep-clean']
  bio: string;
  experience: number; // Years
};

export const mockStaff: Staff[] = [
  {
    id: "STF-001",
    name: "Fatima Ben Ali",
    photo: "FB",
    role: "Gouvernante Senior",
    status: 'available',
    rating: 4.9,
    jobsCompleted: 342,
    location: "Paris 16ème",
    phone: "06 12 34 56 78",
    email: "fatima.b@maidmatch.com",
    skills: ['ironing', 'deep-clean', 'cooking'],
    experience: 8,
    bio: "Experte en entretien de villas de luxe. Très méticuleuse sur le repassage et la gestion des textiles délicats. Parle Arabe et Français couramment."
  },
  {
    id: "STF-002",
    name: "Sonia Mejbri",
    photo: "SM",
    role: "Femme de Ménage",
    status: 'busy',
    rating: 4.7,
    jobsCompleted: 120,
    location: "Paris 11ème",
    phone: "07 98 76 54 32",
    email: "sonia.m@maidmatch.com",
    skills: ['standard-clean', 'pets'],
    experience: 3,
    bio: "Jeune et dynamique, Sonia est très appréciée pour sa rapidité et son amour des animaux. Idéale pour les entretiens courants."
  },
  {
    id: "STF-003",
    name: "Amel Tounsi",
    photo: "AT",
    role: "Spécialiste Grand Ménage",
    status: 'off',
    rating: 4.8,
    jobsCompleted: 215,
    location: "Boulogne-Billancourt",
    phone: "06 11 22 33 44",
    email: "amel.t@maidmatch.com",
    skills: ['deep-clean', 'windows', 'moving'],
    experience: 5,
    bio: "Spécialiste des états des lieux et des déménagements. Elle dispose de son propre matériel vapeur professionnel."
  },
  {
    id: "STF-004",
    name: "Marie Curie",
    photo: "MC",
    role: "Femme de Ménage",
    status: 'available',
    rating: 4.5,
    jobsCompleted: 45,
    location: "Paris 5ème",
    phone: "06 99 88 77 66",
    email: "marie.c@maidmatch.com",
    skills: ['standard-clean'],
    experience: 1,
    bio: "Nouvelle dans l'équipe, Marie est très ponctuelle et apprend vite. Disponible pour les petites surfaces."
  }
];