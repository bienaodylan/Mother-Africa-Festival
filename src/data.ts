/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Day {
  id: 1 | 2;
  label: string;
  date: string;
}

export interface Artist {
  id: string;
  name: string;
  day: 1 | 2;
  slot: string;
  image: string;
}

export interface Ticket {
  id: string;
  name: string;
  price: string;
  numericPrice: number;
  perks: string;
  note: string;
}

export interface MenuItem {
  id: string;
  label: string;
  route: string;
  teaser: string;
  image: string;
}

export interface Facts {
  edition: string;
  year: string;
  dates: string;
  lieu: string;
  ville: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  badge?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface PurchasedTicket {
  reference: string; // Ex: MAF26-XXXXXX
  orderId: string;
  category: string;
  categoryId: string;
  price: string;
  numericPrice: number;
  holderName: string;
  purchaseDate: string;
  eventDates: string;
  location: string;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  categoryId: string;
  categoryName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  paymentMethod: string;
  createdAt: string;
  tickets: PurchasedTicket[];
}

export interface CartState {
  categoryId: string;
  quantity: number;
  holderNames: string[];
}

// Configuration modifiable du parcours d'achat
export const CONFIG = {
  MAX_PER_ORDER: 6,
  ASK_HOLDER_NAMES: true
};

// Seuls les faits suivants sont réels (conformément au brief) :
// 5ème édition, 27 et 28 décembre 2026, Marcory Zone 4, Abidjan, Grand Public 10.000 FCFA et VIP Debout 100.000 FCFA.
export const FACTS: Facts = {
  edition: '5ÈME ÉDITION · ANNIVERSARY',
  year: '2026',
  dates: '27 & 28 DÉCEMBRE 2026',
  lieu: 'MARCORY ZONE 4',
  ville: "ABIDJAN, CÔTE D'IVOIRE"
};

export const DAYS: Day[] = [
  { id: 1, label: '[ DAY 1 ]', date: '27 DÉCEMBRE' },
  { id: 2, label: '[ DAY 2 ]', date: '28 DÉCEMBRE' }
];

// Note : DAVIDO est la seule tête d'affiche confirmée.
// Tous les autres artistes sont des placeholders inventés pour la maquette.
export const ARTISTS: Artist[] = [
  // DAY 1 (27 Décembre)
  {
    id: 'davido',
    name: 'DAVIDO',
    day: 1,
    slot: '23:00',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1600&q=70'
  },
  {
    id: 'naya-kora',
    name: 'NAYA KORA', // Placeholder
    day: 1,
    slot: '21:45',
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1600&q=70'
  },
  {
    id: 'kwesi-drums',
    name: 'KWESI DRUMS', // Placeholder
    day: 1,
    slot: '20:30',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=70'
  },
  {
    id: 'ama-soleil',
    name: 'AMA SOLEIL', // Placeholder
    day: 1,
    slot: '19:15',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=70'
  },
  {
    id: 'dj-marcory',
    name: 'DJ MARCORY', // Placeholder
    day: 1,
    slot: '18:00',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1600&q=70'
  },

  // DAY 2 (28 Décembre)
  {
    id: 'burna-vibes',
    name: 'BURNA SOUL', // Placeholder
    day: 2,
    slot: '23:30',
    image: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=1600&q=70'
  },
  {
    id: 'kofi-sound',
    name: 'KOFI SOUND', // Placeholder
    day: 2,
    slot: '22:00',
    image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1600&q=70'
  },
  {
    id: 'zola-lagune',
    name: 'ZOLA LAGUNE', // Placeholder
    day: 2,
    slot: '20:45',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1600&q=70'
  },
  {
    id: 'didi-beat',
    name: 'DIDI BEAT', // Placeholder
    day: 2,
    slot: '19:30',
    image: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1600&q=70'
  },
  {
    id: 'amapiano-queen',
    name: 'AMAPIANO QUEEN', // Placeholder
    day: 2,
    slot: '18:00',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1600&q=70'
  }
];

export const TICKETS: Ticket[] = [
  {
    id: 'grand-public',
    name: 'GRAND PUBLIC',
    price: '10.000 FCFA',
    numericPrice: 10000,
    perks: 'PASS 2 JOURS · 27 & 28 DÉCEMBRE',
    note: 'DANS LA LIMITE DES STOCKS DISPONIBLES'
  },
  {
    id: 'vip-debout',
    name: 'VIP DEBOUT',
    price: '100.000 FCFA',
    numericPrice: 100000,
    perks: 'PASS 2 JOURS · 27 & 28 DÉCEMBRE',
    note: 'DANS LA LIMITE DES STOCKS DISPONIBLES'
  }
];

// Méthodes de paiement officielles configurables
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'wave',
    name: 'WAVE',
    description: 'Paiement instantané mobile sans frais supplémentaires',
    badge: 'SANS FRAIS'
  },
  {
    id: 'orange-money',
    name: 'ORANGE MONEY',
    description: 'Règlement sécurisé Côte d’Ivoire & zone UEMOA',
    badge: 'POPULAIRE'
  },
  {
    id: 'moov-money',
    name: 'MOOV MONEY',
    description: 'Règlement rapide via compte Moov Money Flooz'
  },
  {
    id: 'carte-bancaire',
    name: 'CARTE BANCAIRE',
    description: 'Visa et Mastercard (3D Secure)'
  }
];

export const MENU: MenuItem[] = [
  {
    id: 'programme',
    label: 'PROGRAMME',
    route: '/line-up',
    teaser: 'Deux nuits de vibrations sonores telluriques où les rythmes ancestraux rencontrent l’Afrobeats et l’Amapiano.',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1600&q=70'
  },
  {
    id: 'festival',
    label: 'LE FESTIVAL',
    route: '/festival',
    teaser: 'Une cathédrale éphémère d’art contemporain et de son brut au cœur d’Abidjan pour la 5ème édition anniversaire.',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=70'
  },
  {
    id: 'archives',
    label: 'ARCHIVES',
    route: '/archives',
    teaser: 'Revivez l’épopée des 4 premières éditions qui ont forgé la légende de Mother Africa Festival.',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1600&q=70'
  },
  {
    id: 'billets',
    label: 'BILLETS',
    route: '/billets',
    teaser: 'Réservez votre pass officiel 2 jours. Grand Public 10.000 FCFA et VIP Debout 100.000 FCFA.',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=70'
  }
];

export const EDITIONS: string[] = [
  'ÉDITION 04',
  'ÉDITION 03',
  'ÉDITION 02',
  'ÉDITION 01'
];

// Helper de formattage en FCFA
export const formatFCFA = (amount: number): string => {
  return `${amount.toLocaleString('fr-FR')} FCFA`;
};
