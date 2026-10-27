/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Day {
  id: 1 | 2;
  label: string;
  date: string;
  startTime: string;
  note?: string;
}

export interface Artist {
  id: string;
  name: string;
  day: 1 | 2;
  tier: 'headliner' | 'artist' | 'dj';
  tierLabel: string;
  status: 'candidat' | 'a_fournir';
  image: string;
  slot?: string;
  sourceNote?: string;
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
  art?: string;
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
  reference: string;
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

export const CONFIG = {
  MAX_PER_ORDER: 6,
  ASK_HOLDER_NAMES: true
};

export const FACTS: Facts = {
  edition: '4TH EDITION · 2026',
  year: '2026',
  dates: '27 & 28 DÉCEMBRE 2026',
  lieu: 'MARCORY ZONE 4',
  ville: "ABIDJAN, CÔTE D'IVOIRE"
};

export const DAYS: Day[] = [
  {
    id: 1,
    label: '[ DAY 1 ]',
    date: '27 DÉCEMBRE 2026',
    startTime: 'DÈS 17H'
  },
  {
    id: 2,
    label: '[ DAY 2 ]',
    date: '28 DÉCEMBRE 2026',
    startTime: 'DÈS 15H',
    note: "DIFFUSION DU MATCH CÔTE D'IVOIRE – CAMEROUN"
  }
];

// Line-up officiel 4e édition — 25 artistes et DJ sets certifiés
export const ARTISTS: Artist[] = [
  // ================= DAY 1 — 27 DÉCEMBRE (DÈS 17H) =================
  // Têtes d'affiche
  {
    id: 'asake',
    name: 'ASAKE',
    day: 1,
    tier: 'headliner',
    tierLabel: "TÊTE D'AFFICHE",
    status: 'candidat',
    image: 'https://image.okayafrica.com/201173.jpg?imageId=201173&panox=0&panoy=0&panow=0&panoh=0&width=1200&height=683',
    sourceNote: 'OkayAfrica, crédit Jeremy Moeller / Getty Images'
  },
  {
    id: 'didi-b',
    name: 'DIDI B',
    day: 1,
    tier: 'headliner',
    tierLabel: "TÊTE D'AFFICHE",
    status: 'a_fournir',
    image: '',
    sourceNote: 'Visuel officiel en attente'
  },
  {
    id: 'keblack',
    name: 'KEBLACK',
    day: 1,
    tier: 'headliner',
    tierLabel: "TÊTE D'AFFICHE",
    status: 'a_fournir',
    image: '',
    sourceNote: 'Visuel officiel en attente'
  },
  // Artistes
  {
    id: 'sindika',
    name: 'SINDIKA',
    day: 1,
    tier: 'artist',
    tierLabel: 'ARTISTE',
    status: 'a_fournir',
    image: ''
  },
  {
    id: 'fanny-j',
    name: 'FANNY J',
    day: 1,
    tier: 'artist',
    tierLabel: 'ARTISTE',
    status: 'candidat',
    image: 'https://img.nrj.fr/vFxiiddJPYbFFkw-rDmBvB_IjAo=/800x450/smart/medias%2F2018%2F03%2Ffanny-j.jpg',
    sourceNote: 'NRJ, ©MDD'
  },
  {
    id: 'l2b-gang',
    name: 'L2B GANG',
    day: 1,
    tier: 'artist',
    tierLabel: 'ARTISTE',
    status: 'a_fournir',
    image: ''
  },
  {
    id: 'mavo',
    name: 'MAVO',
    day: 1,
    tier: 'artist',
    tierLabel: 'ARTISTE',
    status: 'candidat',
    image: 'https://assets.soundcharts.com/artist/f/b/1/2db8cdd8-51bf-4f58-b4ff-8990290cb149.jpg',
    sourceNote: 'Soundcharts'
  },
  {
    id: 'afara-tsena',
    name: 'AFARA TSENA',
    day: 1,
    tier: 'artist',
    tierLabel: 'ARTISTE',
    status: 'candidat',
    image: 'https://assets.soundcharts.com/artist/b/4/0/78f3afd7-e04b-404d-9e46-bfe3942b59a1.jpg',
    sourceNote: 'Soundcharts'
  },
  {
    id: 'djelyka-ba-bintou',
    name: 'DJELYKA BA BINTOU',
    day: 1,
    tier: 'artist',
    tierLabel: 'ARTISTE',
    status: 'candidat',
    image: 'https://assets.soundcharts.com/artist/f/b/9/bcdad54c-59bf-11ea-9d48-549f35141000.jpg',
    sourceNote: 'Soundcharts'
  },
  {
    id: 'zrai',
    name: 'ZRAI',
    day: 1,
    tier: 'artist',
    tierLabel: 'ARTISTE',
    status: 'candidat',
    image: 'https://www.fratmat.info/uploads/images/2026/04/13/276606.jpg',
    sourceNote: 'Fraternité Matin'
  },
  {
    id: 'trk',
    name: 'TRK',
    day: 1,
    tier: 'artist',
    tierLabel: 'ARTISTE',
    status: 'a_fournir',
    image: ''
  },
  // DJ Sets
  {
    id: 'dj-vogis',
    name: 'DJ VOGIS',
    day: 1,
    tier: 'dj',
    tierLabel: 'DJ SET',
    status: 'a_fournir',
    image: ''
  },
  {
    id: 'dj-nika',
    name: 'DJ NIKA',
    day: 1,
    tier: 'dj',
    tierLabel: 'DJ SET',
    status: 'a_fournir',
    image: ''
  },

  // ================= DAY 2 — 28 DÉCEMBRE (DÈS 15H) =================
  // Têtes d'affiche
  {
    id: 'gims',
    name: 'GIMS',
    day: 2,
    tier: 'headliner',
    tierLabel: "TÊTE D'AFFICHE",
    status: 'candidat',
    image: 'https://cdn-images.dzcdn.net/images/artist/ba02785ee0a58180ca0e8dd37190d107/500x500.jpg',
    sourceNote: 'Deezer'
  },
  {
    id: 'himra',
    name: 'HIMRA',
    day: 2,
    tier: 'headliner',
    tierLabel: "TÊTE D'AFFICHE",
    status: 'candidat',
    image: 'https://cdn-images.dzcdn.net/images/artist/a00bc6dcc86b10c1b03aa2372ab71a30/500x500.jpg',
    sourceNote: 'Deezer'
  },
  {
    id: 'lamano',
    name: 'LAMANO',
    day: 2,
    tier: 'headliner',
    tierLabel: "TÊTE D'AFFICHE",
    status: 'a_fournir',
    image: '',
    sourceNote: 'Visuel officiel en attente'
  },
  // Artistes
  {
    id: 'triangle-des-bermudes',
    name: 'TRIANGLE DES BERMUDES',
    day: 2,
    tier: 'artist',
    tierLabel: 'ARTISTE',
    status: 'candidat',
    image: 'https://cdn-images.dzcdn.net/images/artist/375f9bbc0178d5f3c648fa8b5861cfdc/500x500.jpg',
    sourceNote: 'Deezer'
  },
  {
    id: 'roga-roga',
    name: 'ROGA ROGA',
    day: 2,
    tier: 'artist',
    tierLabel: 'ARTISTE',
    status: 'candidat',
    image: 'https://cdn-images.dzcdn.net/images/artist/639a1d3c0be5c9eef3fcc8cac6994988/500x500.jpg',
    sourceNote: 'Deezer'
  },
  {
    id: 'team-paiya',
    name: 'TEAM PAIYA',
    day: 2,
    tier: 'artist',
    tierLabel: 'ARTISTE',
    status: 'a_fournir',
    image: ''
  },
  {
    id: 'dopelym',
    name: 'DOPELYM',
    day: 2,
    tier: 'artist',
    tierLabel: 'ARTISTE',
    status: 'a_fournir',
    image: ''
  },
  {
    id: 'espoir-2000',
    name: 'ESPOIR 2000',
    day: 2,
    tier: 'artist',
    tierLabel: 'ARTISTE',
    status: 'a_fournir',
    image: ''
  },
  {
    id: 'dydy-yeman',
    name: 'DYDY YEMAN',
    day: 2,
    tier: 'artist',
    tierLabel: 'ARTISTE',
    status: 'a_fournir',
    image: ''
  },
  {
    id: 'rebo-tchulo',
    name: 'REBO TCHULO',
    day: 2,
    tier: 'artist',
    tierLabel: 'ARTISTE',
    status: 'a_fournir',
    image: ''
  },
  {
    id: 'emma-a',
    name: "EMMA'A",
    day: 2,
    tier: 'artist',
    tierLabel: 'ARTISTE',
    status: 'a_fournir',
    image: ''
  },
  // DJ Sets
  {
    id: 'dj-phaphane',
    name: 'DJ PHAPHANE',
    day: 2,
    tier: 'dj',
    tierLabel: 'DJ SET',
    status: 'a_fournir',
    image: ''
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
    label: 'LINE-UP',
    route: '/line-up',
    art: '/assets/menu_art/menu_lineup_white.png',
    teaser: 'Deux nuits de vibrations sonores telluriques où les rythmes ancestraux rencontrent l’Afrobeats et l’Amapiano.',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1600&q=70'
  },
  {
    id: 'festival',
    label: 'FESTIVAL',
    route: '/festival',
    art: '/assets/menu_art/menu_festival_white.png',
    teaser: 'Une cathédrale éphémère d’art contemporain et de son brut au cœur d’Abidjan pour la 5ème édition anniversaire.',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=70'
  },
  {
    id: 'archives',
    label: 'ARCHIVES',
    route: '/archives',
    art: '/assets/menu_art/menu_archives_white.png',
    teaser: 'Revivez l’épopée des 4 premières éditions qui ont forgé la légende de Mother Africa Festival.',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1600&q=70'
  },
  {
    id: 'billets',
    label: 'BILLETTERIE',
    route: '/billets',
    art: '/assets/menu_art/menu_billetterie_white.png',
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
