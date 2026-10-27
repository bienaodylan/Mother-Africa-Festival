/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Order, PurchasedTicket, FACTS } from '../data.ts';
import { generateTicketEmailHtml } from '../emails/ticketEmail.ts';

// Clés de stockage local pour la simulation
const STORAGE_USERS = 'maf_users_v1';
const STORAGE_CURRENT_USER = 'maf_auth_session_v1';
const STORAGE_ORDERS = 'maf_orders_v1';

// Petit délai réaliste pour simuler la latence réseau
const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

// Fonction de hachage simple côté client pour ne jamais stocker de mot de passe en clair
async function pseudoHashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`maf_salt_${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

interface StoredUser extends User {
  passwordHash: string;
}

function getStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredUser[]): void {
  try {
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
  } catch (err) {
    console.error('Erreur de sauvegarde locale des utilisateurs', err);
  }
}

function getStoredOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_ORDERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredOrders(orders: Order[]): void {
  try {
    localStorage.setItem(STORAGE_ORDERS, JSON.stringify(orders));
  } catch (err) {
    console.error('Erreur de sauvegarde locale des commandes', err);
  }
}

/**
 * Service API (Simulé côté client avec Promesses asynchrones).
 * Tous les points d'entrée indiquent où brancher les routes réelles de votre API REST ou GraphQL.
 */
export const api = {
  /**
   * Récupère l'utilisateur actuellement authentifié depuis la session locale.
   * [POINT D'INTÉGRATION BACKEND] : GET /api/auth/me (avec token Bearer).
   */
  async getCurrentUser(): Promise<User | null> {
    await delay(150);
    try {
      const raw = localStorage.getItem(STORAGE_CURRENT_USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Inscription d'un nouvel utilisateur.
   * [POINT D'INTÉGRATION BACKEND] : POST /api/auth/register
   * Corps : { firstName, lastName, email, phone, password }
   */
  async register(params: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<User> {
    await delay(450);

    const emailClean = params.email.trim().toLowerCase();
    const users = getStoredUsers();

    if (users.some((u) => u.email.toLowerCase() === emailClean)) {
      throw new Error('Un compte existe déjà avec cette adresse email.');
    }

    if (params.password.length < 8) {
      throw new Error('Le mot de passe doit comporter au moins 8 caractères.');
    }

    const passwordHash = await pseudoHashPassword(params.password);
    const newUser: StoredUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      firstName: params.firstName.trim().toUpperCase(),
      lastName: params.lastName.trim().toUpperCase(),
      email: emailClean,
      phone: params.phone.trim(),
      passwordHash
    };

    users.push(newUser);
    saveStoredUsers(users);

    // Mémorise la session sans le hash
    const sessionUser: User = {
      id: newUser.id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      phone: newUser.phone
    };
    localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(sessionUser));

    return sessionUser;
  },

  /**
   * Connexion avec email et mot de passe.
   * [POINT D'INTÉGRATION BACKEND] : POST /api/auth/login
   * Corps : { email, password }
   */
  async login(params: { email: string; password: string }): Promise<User> {
    await delay(400);

    const emailClean = params.email.trim().toLowerCase();
    const users = getStoredUsers();
    const user = users.find((u) => u.email.toLowerCase() === emailClean);

    if (!user) {
      throw new Error('Aucun compte trouvé avec cet email.');
    }

    const passwordHash = await pseudoHashPassword(params.password);
    if (user.passwordHash !== passwordHash) {
      throw new Error('Mot de passe incorrect.');
    }

    const sessionUser: User = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone
    };
    localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(sessionUser));

    return sessionUser;
  },

  /**
   * Déconnexion de l'utilisateur.
   * [POINT D'INTÉGRATION BACKEND] : POST /api/auth/logout
   */
  async logout(): Promise<void> {
    await delay(150);
    localStorage.removeItem(STORAGE_CURRENT_USER);
  },

  /**
   * Réinitialisation de mot de passe (simulée).
   * [POINT D'INTÉGRATION BACKEND] : POST /api/auth/forgot-password
   */
  async requestPasswordReset(email: string): Promise<boolean> {
    await delay(400);
    console.log(`[AUTH SERVICE - SIMULÉ] Lien de réinitialisation envoyé à : ${email}`);
    return true;
  },

  /**
   * Traitement du paiement.
   * [POINT D'INTÉGRATION BACKEND] : POST /api/orders/pay
   * Corps : { orderId, paymentMethod, amount }
   * Note : Aucun numéro de carte bancaire ni code secret n'est manipulé ou stocké.
   */
  async pay(params: {
    orderId: string;
    paymentMethod: string;
    amount: number;
  }): Promise<{ success: boolean; transactionId: string }> {
    // Délai plus long pour simuler l'interrogation de la passerelle de paiement
    await delay(1200);

    // Simulation : 100% de succès par défaut, mais avec une référence unique
    const transactionId = `TXN-${params.paymentMethod.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    return {
      success: true,
      transactionId
    };
  },

  /**
   * Création et enregistrement officiel d'une commande de billets.
   * [POINT D'INTÉGRATION BACKEND] : POST /api/orders
   */
  async createOrder(params: {
    user: User;
    categoryId?: string;
    categoryName?: string;
    quantity?: number;
    unitPrice?: number;
    items?: Array<{ categoryId: string; categoryName: string; quantity: number; unitPrice: number }>;
    holderNames: string[];
    paymentMethod: string;
  }): Promise<Order> {
    await delay(500);

    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const tickets: PurchasedTicket[] = [];

    const normalizedItems = params.items && params.items.length > 0
      ? params.items
      : [
          {
            categoryId: params.categoryId || 'grand-public',
            categoryName: params.categoryName || 'GRAND PUBLIC',
            quantity: params.quantity || 1,
            unitPrice: params.unitPrice || 10000
          }
        ];

    let holderIndex = 0;
    let totalOrderPrice = 0;
    let totalOrderQuantity = 0;

    for (const item of normalizedItems) {
      totalOrderPrice += item.unitPrice * item.quantity;
      totalOrderQuantity += item.quantity;

      for (let i = 0; i < item.quantity; i++) {
        const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
        const reference = `MAF26-${randomHex}`;
        const holder =
          params.holderNames[holderIndex] && params.holderNames[holderIndex].trim().length > 0
            ? params.holderNames[holderIndex].trim().toUpperCase()
            : `${params.user.firstName} ${params.user.lastName}`;

        tickets.push({
          reference,
          orderId,
          category: item.categoryName,
          categoryId: item.categoryId,
          price: `${item.unitPrice.toLocaleString('fr-FR')} FCFA`,
          numericPrice: item.unitPrice,
          holderName: holder,
          purchaseDate: new Date().toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          }),
          eventDates: FACTS.dates,
          location: FACTS.lieu
        });

        holderIndex++;
      }
    }

    const order: Order = {
      id: orderId,
      userId: params.user.id,
      userEmail: params.user.email,
      userName: `${params.user.firstName} ${params.user.lastName}`,
      categoryId: normalizedItems[0].categoryId,
      categoryName: normalizedItems.map((it) => `${it.quantity}x ${it.categoryName}`).join(', '),
      quantity: totalOrderQuantity,
      unitPrice: normalizedItems[0].unitPrice,
      totalPrice: totalOrderPrice,
      paymentMethod: params.paymentMethod,
      createdAt: new Date().toISOString(),
      tickets
    };

    const orders = getStoredOrders();
    orders.unshift(order);
    saveStoredOrders(orders);

    return order;
  },

  /**
   * Récupération de tous les billets de l'utilisateur connecté.
   * [POINT D'INTÉGRATION BACKEND] : GET /api/users/me/tickets
   */
  async getMyTickets(userId: string): Promise<PurchasedTicket[]> {
    await delay(300);
    const orders = getStoredOrders();
    const userOrders = orders.filter((o) => o.userId === userId);
    const allTickets: PurchasedTicket[] = [];
    userOrders.forEach((o) => allTickets.push(...o.tickets));
    return allTickets;
  },

  /**
   * Envoi du billet par email (simulé).
   * [POINT D'INTÉGRATION BACKEND] : POST /api/emails/send-ticket
   * Note : La version réelle requiert un serveur et un service d'emailing (Resend, SendGrid, Mailgun).
   */
  async sendTicketEmail(ticket: PurchasedTicket, qrCodeDataUrl: string, email: string): Promise<boolean> {
    await delay(200);
    const emailHtml = generateTicketEmailHtml(ticket, qrCodeDataUrl);
    console.log(`[SERVICE EMAIL - SIMULÉ] Envoi du billet ${ticket.reference} à ${email}`);
    console.log(`[SERVICE EMAIL - SIMULÉ] Gabarit HTML généré avec succès (${emailHtml.length} caractères)`);
    return true;
  }
};
