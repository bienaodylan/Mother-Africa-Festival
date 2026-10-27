/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TicketStatus = 'CONFIRMED' | 'USED' | 'CANCELLED';

export interface DigitalTicket {
  id: string; // Identifiant interne unique
  reference: string; // Ex: MAF26-9F4K2A
  orderId: string; // Ex: ORD-2026-X892
  ticketNumber: string; // Ex: N° 0001
  categoryId: string; // 'grand-public' | 'vip-debout'
  categoryName: string; // 'GRAND PUBLIC' | 'VIP DEBOUT'
  holderName: string; // Nom & prénom du porteur
  price: string; // Ex: 10.000 FCFA
  numericPrice: number;
  status: TicketStatus;
  secureToken: string; // Jeton chiffré/haché transmis dans le QR Code
  purchaseDate: string;
  eventDates: string; // '27 & 28 DÉCEMBRE 2026'
  location: string; // 'MARCORY ZONE 4 · ABIDJAN'
  gateInfo: string; // 'PORTE OUEST - ACCÈS FOULOIR CENTRAL'
  doorOpeningTime: string; // '16:00 GMT'
}

export interface TicketOrderSummary {
  orderId: string;
  totalTickets: number;
  totalAmount: number;
  purchaseDate: string;
}
