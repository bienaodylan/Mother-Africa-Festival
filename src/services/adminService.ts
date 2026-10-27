/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order, PurchasedTicket } from '../data.ts';
import { DigitalTicket } from '../types/ticket.ts';
import { passService } from './passService.ts';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'RESPONSABLE_BILLETTERIE'
  | 'RESPONSABLE_FINANCIER'
  | 'AGENT_CONTROLE'
  | 'FESTIVALIER';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface TeamInvitation {
  id: string;
  email: string;
  role: UserRole;
  invitedBy: string;
  invitedAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'REVOKED';
}

export interface AccessScanLog {
  id: string;
  ticketReference: string;
  ticketNumber: string;
  categoryName: string;
  holderName: string;
  scannedAt: string;
  gate: string;
  agentName: string;
  result: 'AUTHORIZED' | 'ALREADY_USED' | 'INVALID' | 'CANCELLED';
  message: string;
}

const STORAGE_ADMIN_SESSION = 'maf_admin_active_session_v1';
const STORAGE_TEAM_KEY = 'maf_team_members_v1';
const STORAGE_SCAN_LOGS_KEY = 'maf_access_scan_logs_v1';

const INITIAL_TEAM: TeamInvitation[] = [
  {
    id: 'inv_01',
    email: 'direction@motherafricafestival.com',
    role: 'SUPER_ADMIN',
    invitedBy: 'Système Root',
    invitedAt: '2026-10-01T10:00:00Z',
    status: 'ACCEPTED'
  },
  {
    id: 'inv_02',
    email: 'billetterie@motherafricafestival.com',
    role: 'RESPONSABLE_BILLETTERIE',
    invitedBy: 'direction@motherafricafestival.com',
    invitedAt: '2026-10-10T14:30:00Z',
    status: 'ACCEPTED'
  },
  {
    id: 'inv_03',
    email: 'finances@motherafricafestival.com',
    role: 'RESPONSABLE_FINANCIER',
    invitedBy: 'direction@motherafricafestival.com',
    invitedAt: '2026-10-12T09:15:00Z',
    status: 'ACCEPTED'
  },
  {
    id: 'inv_04',
    email: 'controle.porte1@motherafricafestival.com',
    role: 'AGENT_CONTROLE',
    invitedBy: 'billetterie@motherafricafestival.com',
    invitedAt: '2026-10-20T16:00:00Z',
    status: 'ACCEPTED'
  }
];

export const adminService = {
  // Session active d'administration
  getCurrentAdmin(): AdminUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_ADMIN_SESSION);
      if (raw) return JSON.parse(raw);
    } catch {
      // noop
    }
    // Par défaut, pour les besoins de la démonstration / prévisualisation :
    return {
      id: 'admin_root',
      name: 'DIRECTION FESTIVAL',
      email: 'direction@motherafricafestival.com',
      role: 'SUPER_ADMIN'
    };
  },

  setAdminRole(role: UserRole): void {
    const current = this.getCurrentAdmin() || {
      id: 'admin_usr',
      name: 'RESPONSABLE PROFIL',
      email: 'admin@motherafricafestival.com',
      role
    };
    current.role = role;
    localStorage.setItem(STORAGE_ADMIN_SESSION, JSON.stringify(current));
  },

  // Tableau de bord & KPIs
  getDashboardStats() {
    const rawOrders = localStorage.getItem('maf_orders_v1');
    const orders: Order[] = rawOrders ? JSON.parse(rawOrders) : [];
    const passes = passService.getAllPasses();

    let totalRevenue = 0;
    let totalTicketsSold = 0;

    orders.forEach((ord) => {
      totalRevenue += ord.totalPrice || 0;
      totalTicketsSold += ord.tickets?.length || ord.quantity || 0;
    });

    // Ajout des ventes historiques du catalogue pass
    passes.forEach((p) => {
      totalRevenue += p.quotaSold * p.numericPrice;
      totalTicketsSold += p.quotaSold;
    });

    const netTicketing = Math.round(totalRevenue * 0.965); // Retenue commission passerelle ~3.5%
    const totalCapacity = passes.reduce((acc, p) => acc + p.quotaTotal, 0);
    const occupancyRate = totalCapacity > 0 ? Math.round((totalTicketsSold / totalCapacity) * 100) : 0;

    return {
      totalRevenue,
      netTicketing,
      totalTicketsSold,
      totalCapacity,
      occupancyRate,
      ordersCount: orders.length + 1840,
      activePassesCount: passes.filter((p) => p.status === 'PUBLISHED').length
    };
  },

  // Gestion des Commandes
  getOrders(searchQuery = '', statusFilter = 'ALL'): Order[] {
    try {
      const raw = localStorage.getItem('maf_orders_v1');
      let orders: Order[] = raw ? JSON.parse(raw) : [];

      // Si aucune commande stockée, générer des données de démo réalistes
      if (orders.length === 0) {
        orders = [
          {
            id: 'ORD-2026-A489',
            userId: 'usr_demo_1',
            userEmail: 'koffi.marc@gmail.com',
            userName: 'KOFFI KOUASSI MARC',
            categoryId: 'grand-public',
            categoryName: 'GRAND PUBLIC',
            quantity: 2,
            unitPrice: 10000,
            totalPrice: 20000,
            paymentMethod: 'wave',
            createdAt: '2026-10-24T18:24:00Z',
            tickets: [
              {
                reference: 'MAF26-K9X2B1',
                orderId: 'ORD-2026-A489',
                category: 'GRAND PUBLIC',
                categoryId: 'grand-public',
                price: '10.000 FCFA',
                numericPrice: 10000,
                holderName: 'KOFFI KOUASSI MARC',
                purchaseDate: '24 octobre 2026',
                eventDates: '27 & 28 DÉCEMBRE 2026',
                location: 'MARCORY ZONE 4, ABIDJAN'
              },
              {
                reference: 'MAF26-L4M8P9',
                orderId: 'ORD-2026-A489',
                category: 'GRAND PUBLIC',
                categoryId: 'grand-public',
                price: '10.000 FCFA',
                numericPrice: 10000,
                holderName: 'AMENAN FLORENCE KOUASSI',
                purchaseDate: '24 octobre 2026',
                eventDates: '27 & 28 DÉCEMBRE 2026',
                location: 'MARCORY ZONE 4, ABIDJAN'
              }
            ]
          },
          {
            id: 'ORD-2026-B102',
            userId: 'usr_demo_2',
            userEmail: 'yao.herve@yahoo.fr',
            userName: 'YAO HERVÉ ASSI',
            categoryId: 'vip-debout',
            categoryName: 'VIP DEBOUT',
            quantity: 2,
            unitPrice: 100000,
            totalPrice: 200000,
            paymentMethod: 'orange-money',
            createdAt: '2026-10-25T11:15:00Z',
            tickets: [
              {
                reference: 'MAF26-V7R1W3',
                orderId: 'ORD-2026-B102',
                category: 'VIP DEBOUT',
                categoryId: 'vip-debout',
                price: '100.000 FCFA',
                numericPrice: 100000,
                holderName: 'KOFFI KOUASSI MARC',
                purchaseDate: '25 octobre 2026',
                eventDates: '27 & 28 DÉCEMBRE 2026',
                location: 'MARCORY ZONE 4, ABIDJAN'
              },
              {
                reference: 'MAF26-Z2Q5H7',
                orderId: 'ORD-2026-B102',
                category: 'VIP DEBOUT',
                categoryId: 'vip-debout',
                price: '100.000 FCFA',
                numericPrice: 100000,
                holderName: 'YAO HERVÉ ASSI',
                purchaseDate: '25 octobre 2026',
                eventDates: '27 & 28 DÉCEMBRE 2026',
                location: 'MARCORY ZONE 4, ABIDJAN'
              }
            ]
          }
        ];
        localStorage.setItem('maf_orders_v1', JSON.stringify(orders));
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        orders = orders.filter(
          (o) =>
            o.id.toLowerCase().includes(q) ||
            o.userEmail.toLowerCase().includes(q) ||
            o.userName.toLowerCase().includes(q) ||
            o.tickets?.some((t: PurchasedTicket) => t.reference.toLowerCase().includes(q) || t.holderName.toLowerCase().includes(q))
        );
      }

      return orders;
    } catch {
      return [];
    }
  },

  refundOrder(orderId: string, reason: string): boolean {
    try {
      const raw = localStorage.getItem('maf_orders_v1');
      if (!raw) return false;
      const orders: Order[] = JSON.parse(raw);
      const filtered = orders.filter((o) => o.id !== orderId);
      localStorage.setItem('maf_orders_v1', JSON.stringify(filtered));

      // Ajout trace d'audit
      console.log(`[AUDIT] Commande #${orderId} remboursée/annulée. Motif: ${reason}`);
      return true;
    } catch {
      return false;
    }
  },

  // Scanner de Contrôle d'Accès avec détection immédiate des fraudes et doubles entrées
  getScanLogs(): AccessScanLog[] {
    try {
      const raw = localStorage.getItem(STORAGE_SCAN_LOGS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async scanAndValidateTicket(
    codeOrUrl: string,
    agentName = 'Agent Porte Sud',
    gate = 'PORTE SUD'
  ): Promise<AccessScanLog> {
    // Extraction de la référence
    let ref = codeOrUrl.trim().toUpperCase();
    if (ref.includes('MAF26://')) {
      try {
        const b64 = ref.replace('MAF26://', '');
        const decoded = JSON.parse(atob(b64));
        if (decoded.tkt) ref = decoded.tkt.toUpperCase();
      } catch {
        // format brut
      }
    } else if (ref.includes('#')) {
      ref = ref.split('#')[1].trim();
    }

    const logs = this.getScanLogs();
    const nowIso = new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // 1. Vérification si déjà scanné auparavant
    const previousScan = logs.find((l) => l.ticketReference === ref && l.result === 'AUTHORIZED');
    if (previousScan) {
      const duplicateLog: AccessScanLog = {
        id: `scan_${Date.now()}`,
        ticketReference: ref,
        ticketNumber: previousScan.ticketNumber,
        categoryName: previousScan.categoryName,
        holderName: previousScan.holderName,
        scannedAt: nowIso,
        gate,
        agentName,
        result: 'ALREADY_USED',
        message: `ALERTE : BILLET DÉJÀ VALIDÉ à ${previousScan.scannedAt} sur la ${previousScan.gate}. DOUBLE ENTRÉE REFUSÉE.`
      };
      logs.unshift(duplicateLog);
      localStorage.setItem(STORAGE_SCAN_LOGS_KEY, JSON.stringify(logs.slice(0, 100)));
      return duplicateLog;
    }

    // 2. Recherche du billet dans la base
    const orders = this.getOrders();
    let foundTicket: PurchasedTicket | undefined;
    orders.forEach((o) => {
      o.tickets?.forEach((t: PurchasedTicket) => {
        if (t.reference.toUpperCase() === ref) {
          foundTicket = t;
        }
      });
    });

    // Fallback fixtures
    if (!foundTicket) {
      const fixtures: Record<string, { cat: string; name: string; num: string }> = {
        'MAF26-K9X2B1': { cat: 'GRAND PUBLIC', name: 'KOFFI KOUASSI MARC', num: 'N° 0001' },
        'MAF26-L4M8P9': { cat: 'GRAND PUBLIC', name: 'AMENAN FLORENCE KOUASSI', num: 'N° 0002' },
        'MAF26-V7R1W3': { cat: 'VIP DEBOUT', name: 'KOFFI KOUASSI MARC', num: 'N° 0003' },
        'MAF26-Z2Q5H7': { cat: 'VIP DEBOUT', name: 'YAO HERVÉ ASSI', num: 'N° 0004' }
      };
      if (fixtures[ref]) {
        foundTicket = {
          reference: ref,
          orderId: 'ORD-FIXTURE',
          category: fixtures[ref].cat,
          categoryId: fixtures[ref].cat.toLowerCase().replace(/\s+/g, '-'),
          price: '10.000 FCFA',
          numericPrice: 10000,
          holderName: fixtures[ref].name,
          purchaseDate: '25 octobre 2026',
          eventDates: '27 & 28 DÉCEMBRE 2026',
          location: 'MARCORY ZONE 4, ABIDJAN'
        };
      }
    }

    if (!foundTicket) {
      const invalidLog: AccessScanLog = {
        id: `scan_${Date.now()}`,
        ticketReference: ref || 'INCONNU',
        ticketNumber: 'N/A',
        categoryName: 'INCONNUE',
        holderName: 'NON IDENTIFIÉ',
        scannedAt: nowIso,
        gate,
        agentName,
        result: 'INVALID',
        message: 'REFUS : Billet introuvable dans la base de données officielle ou contrefait.'
      };
      logs.unshift(invalidLog);
      localStorage.setItem(STORAGE_SCAN_LOGS_KEY, JSON.stringify(logs.slice(0, 100)));
      return invalidLog;
    }

    // 3. Billet valide : validation et entrée
    const validLog: AccessScanLog = {
      id: `scan_${Date.now()}`,
      ticketReference: foundTicket.reference,
      ticketNumber: foundTicket.reference === 'MAF26-K9X2B1' ? 'N° 0001' : 'N° 0042',
      categoryName: foundTicket.category,
      holderName: foundTicket.holderName,
      scannedAt: nowIso,
      gate,
      agentName,
      result: 'AUTHORIZED',
      message: 'ACCÈS VALIDÉ · BON FESTIVAL !'
    };
    logs.unshift(validLog);
    localStorage.setItem(STORAGE_SCAN_LOGS_KEY, JSON.stringify(logs.slice(0, 100)));
    return validLog;
  },

  // Gestion de l'Équipe
  getTeamMembers(): TeamInvitation[] {
    try {
      const raw = localStorage.getItem(STORAGE_TEAM_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_TEAM_KEY, JSON.stringify(INITIAL_TEAM));
        return INITIAL_TEAM;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_TEAM;
    }
  },

  inviteTeamMember(email: string, role: UserRole): TeamInvitation {
    const list = this.getTeamMembers();
    const newInv: TeamInvitation = {
      id: `inv_${Date.now()}`,
      email: email.trim().toLowerCase(),
      role,
      invitedBy: this.getCurrentAdmin()?.email || 'Administrateur',
      invitedAt: new Date().toISOString(),
      status: 'PENDING'
    };
    list.unshift(newInv);
    localStorage.setItem(STORAGE_TEAM_KEY, JSON.stringify(list));
    return newInv;
  },

  revokeTeamMember(id: string): void {
    const list = this.getTeamMembers().filter((m) => m.id !== id);
    localStorage.setItem(STORAGE_TEAM_KEY, JSON.stringify(list));
  }
};
