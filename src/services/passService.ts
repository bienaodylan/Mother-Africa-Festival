/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PassStatus = 'PUBLISHED' | 'DRAFT' | 'SOLD_OUT' | 'SUSPENDED' | 'ARCHIVED';
export type PassDays = 'JOUR 1' | 'JOUR 2' | 'PASS 2 JOURS';

export interface FestivalPass {
  id: string;
  name: string;
  price: string;
  numericPrice: number;
  perks: string;
  note: string;
  days: PassDays;
  quotaTotal: number;
  quotaSold: number;
  quotaReserved: number;
  status: PassStatus;
  updatedAt: string;
}

const STORAGE_PASSES_KEY = 'maf_passes_catalog_v2';

const INITIAL_PASSES: FestivalPass[] = [
  {
    id: 'grand-public',
    name: 'GRAND PUBLIC',
    price: '10.000 FCFA',
    numericPrice: 10000,
    perks: 'PASS 2 JOURS · 27 & 28 DÉCEMBRE',
    note: 'DANS LA LIMITE DES STOCKS DISPONIBLES',
    days: 'PASS 2 JOURS',
    quotaTotal: 15000,
    quotaSold: 4280,
    quotaReserved: 120,
    status: 'PUBLISHED',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'vip-debout',
    name: 'VIP DEBOUT',
    price: '100.000 FCFA',
    numericPrice: 100000,
    perks: 'PASS 2 JOURS · 27 & 28 DÉCEMBRE',
    note: 'ACCÈS FOSSE GOLD VIP · ACCÈS BAR DÉDIÉ',
    days: 'PASS 2 JOURS',
    quotaTotal: 2500,
    quotaSold: 1120,
    quotaReserved: 45,
    status: 'PUBLISHED',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'vip-coupe-file',
    name: 'VIP COUPE-FILE',
    price: '150.000 FCFA',
    numericPrice: 150000,
    perks: 'PASS 2 JOURS · ENTRÉE PRIORITAIRE EXPRESS',
    note: 'ROOFTOP CLIMATISÉ + 2 CONSOMMATIONS INCLUSES',
    days: 'PASS 2 JOURS',
    quotaTotal: 600,
    quotaSold: 245,
    quotaReserved: 15,
    status: 'PUBLISHED',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'early-bird-j1',
    name: 'EARLY BIRD J1',
    price: '8.000 FCFA',
    numericPrice: 8000,
    perks: 'JOUR 1 UNIQUE · 27 DÉCEMBRE',
    note: 'TARIF PRÉVENTE LIMITÉ ÉPUISÉ',
    days: 'JOUR 1',
    quotaTotal: 2000,
    quotaSold: 2000,
    quotaReserved: 0,
    status: 'SOLD_OUT',
    updatedAt: new Date().toISOString()
  }
];

function loadPasses(): FestivalPass[] {
  try {
    const raw = localStorage.getItem(STORAGE_PASSES_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_PASSES_KEY, JSON.stringify(INITIAL_PASSES));
      return INITIAL_PASSES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PASSES;
  } catch {
    return INITIAL_PASSES;
  }
}

function savePasses(passes: FestivalPass[]): void {
  try {
    localStorage.setItem(STORAGE_PASSES_KEY, JSON.stringify(passes));
  } catch (err) {
    console.error('Erreur sauvegarde catalogue passes', err);
  }
}

export const passService = {
  getAllPasses(): FestivalPass[] {
    return loadPasses();
  },

  getPublishedPasses(): FestivalPass[] {
    const all = loadPasses();
    return all.filter((p) => p.status === 'PUBLISHED' || p.status === 'SOLD_OUT');
  },

  getPassById(id: string): FestivalPass | undefined {
    return loadPasses().find((p) => p.id === id);
  },

  savePass(pass: Omit<FestivalPass, 'updatedAt' | 'id'> & { id?: string }): FestivalPass {
    const all = loadPasses();
    const id = pass.id || `pass_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const updated: FestivalPass = {
      ...pass,
      id,
      updatedAt: new Date().toISOString()
    };

    const existingIndex = all.findIndex((p) => p.id === id);
    if (existingIndex >= 0) {
      all[existingIndex] = updated;
    } else {
      all.unshift(updated);
    }

    savePasses(all);
    return updated;
  },

  updateStatus(id: string, status: PassStatus): void {
    const all = loadPasses();
    const found = all.find((p) => p.id === id);
    if (found) {
      found.status = status;
      found.updatedAt = new Date().toISOString();
      savePasses(all);
    }
  },

  deletePass(id: string): void {
    const all = loadPasses().filter((p) => p.id !== id);
    savePasses(all);
  },

  recordTicketSale(categoryId: string, quantity: number): void {
    const all = loadPasses();
    const found = all.find((p) => p.id === categoryId);
    if (found) {
      found.quotaSold += quantity;
      if (found.quotaSold >= found.quotaTotal) {
        found.status = 'SOLD_OUT';
      }
      found.updatedAt = new Date().toISOString();
      savePasses(all);
    }
  }
};
