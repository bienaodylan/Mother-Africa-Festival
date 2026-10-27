/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DigitalTicket } from '../types/ticket.ts';
import { FACTS, Order } from '../data.ts';

/**
 * Service de gestion des billets du festival (Simulation / Mock Service).
 * En production : ce service appelle votre API GraphQL ou REST :
 * - GET /api/v1/user/tickets
 * - GET /api/v1/tickets/:reference
 */

// Données de fixtures mockées (pour tests et prévisualisation directe avec au moins 4 billets)
const FIXTURE_TICKETS: DigitalTicket[] = [
  {
    id: 'tkt_01_fixture',
    reference: 'MAF26-K9X2B1',
    orderId: 'ORD-2026-A489',
    ticketNumber: 'N° 0001',
    categoryId: 'grand-public',
    categoryName: 'GRAND PUBLIC',
    holderName: 'KOFFI KOUASSI MARC',
    price: '10.000 FCFA',
    numericPrice: 10000,
    status: 'CONFIRMED',
    secureToken: 'maf26_sec_v1_eJxLLCosTswrKSpNtc7MS8xNLcnPzU',
    purchaseDate: '24 octobre 2026',
    eventDates: FACTS.dates,
    location: FACTS.lieu + ', ABIDJAN',
    gateInfo: 'PORTE SUD - ENTRÉE PRINCIPALE',
    doorOpeningTime: '16:00 GMT'
  },
  {
    id: 'tkt_02_fixture',
    reference: 'MAF26-L4M8P9',
    orderId: 'ORD-2026-A489',
    ticketNumber: 'N° 0002',
    categoryId: 'grand-public',
    categoryName: 'GRAND PUBLIC',
    holderName: 'AMENAN FLORENCE KOUASSI',
    price: '10.000 FCFA',
    numericPrice: 10000,
    status: 'CONFIRMED',
    secureToken: 'maf26_sec_v1_eJxLTC7MSctLLSrKSc3MSSwuzc3Ntc',
    purchaseDate: '24 octobre 2026',
    eventDates: FACTS.dates,
    location: FACTS.lieu + ', ABIDJAN',
    gateInfo: 'PORTE SUD - ENTRÉE PRINCIPALE',
    doorOpeningTime: '16:00 GMT'
  },
  {
    id: 'tkt_03_fixture',
    reference: 'MAF26-V7R1W3',
    orderId: 'ORD-2026-B102',
    ticketNumber: 'N° 0003',
    categoryId: 'vip-debout',
    categoryName: 'VIP DEBOUT',
    holderName: 'KOFFI KOUASSI MARC',
    price: '100.000 FCFA',
    numericPrice: 100000,
    status: 'CONFIRMED',
    secureToken: 'maf26_sec_v1_eJyLSCwsKS1KLUgtsc7MS8xNLcnPzd',
    purchaseDate: '25 octobre 2026',
    eventDates: FACTS.dates,
    location: FACTS.lieu + ', ABIDJAN',
    gateInfo: 'PORTE VIP NORD - COCKTAIL ROOFTOP',
    doorOpeningTime: '15:30 GMT'
  },
  {
    id: 'tkt_04_fixture',
    reference: 'MAF26-Z2Q5H7',
    orderId: 'ORD-2026-B102',
    ticketNumber: 'N° 0004',
    categoryId: 'vip-debout',
    categoryName: 'VIP DEBOUT',
    holderName: 'YAO HERVÉ ASSI',
    price: '100.000 FCFA',
    numericPrice: 100000,
    status: 'USED',
    secureToken: 'maf26_sec_v1_eJwLz0ssKs1LTCssTc7MS8xNLcnPzf',
    purchaseDate: '25 octobre 2026',
    eventDates: FACTS.dates,
    location: FACTS.lieu + ', ABIDJAN',
    gateInfo: 'PORTE VIP NORD - COCKTAIL ROOFTOP',
    doorOpeningTime: '15:30 GMT'
  }
];

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Génère le jeton cryptographique sécurisé pour le QR code
 * En production : Signature JWT asymétrique (EdDSA ou RS256) validée par les scanners hors-ligne.
 */
export function generateSecureQrPayload(ticket: DigitalTicket): string {
  const payload = {
    iss: 'mother-africa-2026',
    tkt: ticket.reference,
    cat: ticket.categoryId,
    ord: ticket.orderId,
    tok: ticket.secureToken
  };
  try {
    return `MAF26://${btoa(JSON.stringify(payload))}`;
  } catch {
    return `MAF26://${ticket.reference}:${ticket.secureToken}`;
  }
}

export const ticketService = {
  /**
   * Récupère tous les billets de l'utilisateur (depuis le localStorage ou les fixtures)
   */
  async getMyTickets(userId?: string): Promise<DigitalTicket[]> {
    await delay(300);

    const storedTickets: DigitalTicket[] = [];

    try {
      const rawOrders = localStorage.getItem('maf_orders_v1');
      if (rawOrders) {
        const orders: Order[] = JSON.parse(rawOrders);
        const filtered = userId ? orders.filter((o) => o.userId === userId) : orders;

        let globalIndex = 1;
        for (const ord of filtered) {
          for (const t of ord.tickets) {
            storedTickets.push({
              id: `tkt_${t.reference}`,
              reference: t.reference,
              orderId: ord.id,
              ticketNumber: `N° ${String(globalIndex).padStart(4, '0')}`,
              categoryId: t.categoryId,
              categoryName: t.category,
              holderName: t.holderName,
              price: t.price,
              numericPrice: t.numericPrice,
              status: 'CONFIRMED',
              secureToken: `maf26_sec_${btoa(t.reference + ':' + ord.id)}`,
              purchaseDate: t.purchaseDate,
              eventDates: t.eventDates || FACTS.dates,
              location: t.location || FACTS.lieu + ', ABIDJAN',
              gateInfo:
                t.categoryId === 'vip-debout'
                  ? 'PORTE VIP NORD - ESPACE SCÈNE PRIVILÈGE'
                  : 'PORTE SUD - ENTRÉE PRINCIPALE',
              doorOpeningTime: t.categoryId === 'vip-debout' ? '15:30 GMT' : '16:00 GMT'
            });
            globalIndex++;
          }
        }
      }
    } catch (err) {
      console.error('Erreur lecture localStorage billets', err);
    }

    // Si l'utilisateur n'a pas encore passé de commande, on charge les fixtures
    if (storedTickets.length === 0) {
      return FIXTURE_TICKETS;
    }

    return storedTickets;
  },

  /**
   * Récupère un billet spécifique par sa référence unique
   */
  async getTicketByReference(reference: string): Promise<DigitalTicket | null> {
    await delay(200);
    const all = await this.getMyTickets();
    const cleanRef = reference.trim().toUpperCase();
    return all.find((t) => t.reference.toUpperCase() === cleanRef) || null;
  },

  /**
   * Récupère tous les billets d'une même commande pour la pagination
   */
  async getRelatedTicketsInOrder(orderId: string): Promise<DigitalTicket[]> {
    const all = await this.getMyTickets();
    return all.filter((t) => t.orderId === orderId);
  }
};
