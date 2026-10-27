/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { DigitalTicket } from '../types/ticket.ts';
import { generateSecureQrPayload } from './ticketService.ts';

/**
 * Service de génération de PDF officiel pour les billets Mother Africa Festival 2026.
 * Génère un document vectoriel haute définition au format paysage (A5 ou format billet allongé).
 */
export const ticketPdfService = {
  async generateTicketPdfBlob(ticket: DigitalTicket): Promise<Blob> {
    // Format paysage allongé : 210mm x 90mm (format standard billet collector panoramique)
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [210, 85]
    });

    // 1. Fond vert forêt sombre (#0D1E13)
    doc.setFillColor(13, 30, 19);
    doc.roundedRect(0, 0, 210, 85, 0, 0, 'F');

    // 2. Bordure intérieure terracotta (#C85A17)
    doc.setDrawColor(200, 90, 23);
    doc.setLineWidth(1);
    doc.roundedRect(3, 3, 204, 79, 4, 4, 'D');

    // 3. Bloc Artiste / Catégorie (Gauche)
    // Badge Catégorie
    doc.setFillColor(200, 90, 23);
    doc.roundedRect(8, 8, 38, 7, 1.5, 1.5, 'F');
    doc.setTextColor(244, 241, 234);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(ticket.categoryName.toUpperCase(), 27, 12.8, { align: 'center' });

    // Numéro de billet
    doc.setTextColor(244, 241, 234);
    doc.setFont('courier', 'bold');
    doc.setFontSize(9);
    doc.text(ticket.ticketNumber || 'N° 0001', 50, 13);

    // Titre Tête d'affiche
    doc.setTextColor(244, 241, 234);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('DAVIDO', 10, 68);

    doc.setTextColor(234, 217, 164);
    doc.setFontSize(9);
    doc.text('& GUESTS', 10, 74);

    // 4. Bloc Centre : Mother Africa Festival & Données du porteur
    doc.setTextColor(244, 241, 234);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('MOTHER AFRICA', 105, 18, { align: 'center' });
    doc.text('FESTIVAL 2026', 105, 24, { align: 'center' });

    doc.setDrawColor(244, 241, 234);
    doc.setLineWidth(0.3);
    doc.line(80, 27, 130, 27);

    // Nom du porteur
    doc.setTextColor(244, 241, 234);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(ticket.holderName.toUpperCase(), 105, 38, { align: 'center' });

    // Dates
    doc.setTextColor(200, 90, 23);
    doc.setFontSize(9);
    doc.text(ticket.eventDates || '27 & 28 DÉCEMBRE 2026', 105, 45, { align: 'center' });

    // Lieu
    doc.setTextColor(234, 217, 164);
    doc.setFontSize(8);
    doc.text(ticket.location || 'MARCORY ZONE 4 · ABIDJAN', 105, 51, { align: 'center' });

    // Prix
    doc.setTextColor(200, 90, 23);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(ticket.price || '10 000 FCFA', 105, 60, { align: 'center' });

    // Réf et Porte
    doc.setTextColor(244, 241, 234);
    doc.setFont('courier', 'normal');
    doc.setFontSize(7);
    doc.text(`RÉF: ${ticket.reference}  ·  ACCÈS: ${ticket.gateInfo}`, 105, 72, { align: 'center' });

    // 5. Perforation pointillée verticale (Séparateur)
    doc.setDrawColor(244, 241, 234);
    doc.setLineWidth(0.5);
    for (let y = 8; y < 76; y += 4) {
      doc.line(152, y, 152, y + 2);
    }

    // 6. Bloc Droite : QR Code & Contrôle d'accès
    doc.setTextColor(234, 217, 164);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('AGRANDIR LE QR', 180, 11, { align: 'center' });

    // Génération du QR Code
    const payload = generateSecureQrPayload(ticket);
    const qrDataUrl = await QRCode.toDataURL(payload, {
      width: 200,
      margin: 1,
      color: {
        dark: '#0D1E13',
        light: '#FFFFFF'
      }
    });

    // Insertion image QR Code
    doc.addImage(qrDataUrl, 'PNG', 162, 14, 36, 36);

    // Statut d'accès
    doc.setTextColor(244, 241, 234);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text("ÉTAT D'ACCÈS", 180, 56, { align: 'center' });

    doc.setTextColor(34, 197, 94); // Vert validé
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('✓ CONFIRMÉ - VALIDE', 180, 62, { align: 'center' });

    doc.setTextColor(244, 241, 234);
    doc.setFont('courier', 'normal');
    doc.setFontSize(6.5);
    doc.text(ticket.reference, 180, 71, { align: 'center' });

    return doc.output('blob');
  },

  async downloadTicketPdf(ticket: DigitalTicket): Promise<void> {
    try {
      const blob = await this.generateTicketPdfBlob(ticket);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `BILLET_OFFICIEL_${ticket.reference}_${ticket.categoryName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur lors du téléchargement du PDF', err);
      // Fallback impression standard
      window.print();
    }
  }
};
