/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PurchasedTicket, FACTS } from '../data.ts';

/**
 * Modèle d'email HTML pour l'envoi des billets Mother Africa Festival 2026.
 *
 * NOTE TECHNIQUE & ARCHITECTURE :
 * - En production réelle, l'envoi d'emails transactionnels nécessite un backend dédié
 *   (Node.js / Express / Cloud Run) couplé à un service d'envoi certifié (ex: Resend, SendGrid, Postmark, AWS SES).
 * - Pour garantir une compatibilité maximale avec tous les clients de messagerie
 *   (Gmail, Apple Mail, Outlook, Yahoo), ce gabarit utilise exclusivement du HTML
 *   traditionnel basé sur des tableaux (<table>), des styles en ligne (inline styles)
 *   et une largeur maximale contrainte de 600px.
 */
export function generateTicketEmailHtml(ticket: PurchasedTicket, qrCodeDataUrl: string): string {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="fr">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Votre Billet - Mother Africa Festival 2026</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b1a10; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #F4F1EA;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0b1a10; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Conteneur principal 600px -->
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #142B1A; border: 4px solid #F4F1EA;">
          <!-- En-tête -->
          <tr>
            <td align="center" style="padding: 30px 20px 20px; border-bottom: 2px solid #C85A17;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 900; letter-spacing: 2px; color: #F4F1EA; text-transform: uppercase;">
                MOTHER AFRICA FESTIVAL
              </h1>
              <p style="margin: 8px 0 0; font-size: 14px; font-weight: bold; color: #C85A17; text-transform: uppercase; letter-spacing: 1px;">
                ${FACTS.edition} · ${FACTS.dates} · ${FACTS.lieu}
              </p>
            </td>
          </tr>

          <!-- Message de confirmation -->
          <tr>
            <td style="padding: 24px 30px 10px;">
              <h2 style="margin: 0 0 10px; font-size: 24px; color: #F4F1EA; text-transform: uppercase;">
                VOTRE BILLET OFFICIEL EST PRÊT.
              </h2>
              <p style="margin: 0; font-size: 15px; line-height: 1.5; color: #F4F1EA;">
                Présentez ce billet numérique ou imprimé avec votre pièce d'identité à l'entrée du festival pour récupérer votre bracelet connecté RFID.
              </p>
            </td>
          </tr>

          <!-- Bloc Détails Billet -->
          <tr>
            <td style="padding: 15px 30px 25px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0d2114; border: 3px solid #C85A17; padding: 20px;">
                <tr>
                  <!-- Colonne Infos -->
                  <td width="60%" style="vertical-align: top;">
                    <div style="font-size: 11px; font-weight: bold; color: #C85A17; text-transform: uppercase; letter-spacing: 1px;">
                      CATÉGORIE
                    </div>
                    <div style="font-size: 22px; font-weight: bold; color: #F4F1EA; margin-bottom: 14px;">
                      ${ticket.category}
                    </div>

                    <div style="font-size: 11px; font-weight: bold; color: #C85A17; text-transform: uppercase; letter-spacing: 1px;">
                      PORTEUR DU BILLET
                    </div>
                    <div style="font-size: 17px; font-weight: bold; color: #F4F1EA; margin-bottom: 14px;">
                      ${ticket.holderName}
                    </div>

                    <div style="font-size: 11px; font-weight: bold; color: #C85A17; text-transform: uppercase; letter-spacing: 1px;">
                      RÉFÉRENCE & PRIX
                    </div>
                    <div style="font-size: 15px; font-family: monospace; font-weight: bold; color: #F4F1EA;">
                      ${ticket.reference} · ${ticket.price}
                    </div>
                  </td>

                  <!-- Colonne QR Code -->
                  <td width="40%" align="center" style="vertical-align: middle;">
                    <div style="background-color: #F4F1EA; padding: 10px; display: inline-block; border: 2px solid #142B1A;">
                      <img src="${qrCodeDataUrl}" alt="QR Code Billet ${ticket.reference}" width="140" height="140" style="display: block; border: 0;" />
                    </div>
                    <div style="margin-top: 8px; font-size: 11px; font-family: monospace; color: #F4F1EA; font-weight: bold;">
                      ${ticket.reference}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Pied de page email -->
          <tr>
            <td style="background-color: #0a170e; padding: 20px 30px; border-top: 2px solid #C85A17; text-align: center;">
              <p style="margin: 0 0 6px; font-size: 12px; color: #F4F1EA; font-weight: bold; text-transform: uppercase;">
                MOTHER AFRICA FESTIVAL 2026 · MARCORY ZONE 4, ABIDJAN
              </p>
              <p style="margin: 0; font-size: 11px; color: #8e9e92;">
                Billet strictement personnel et nominatif. Revente interdite. En cas de question, contactez contact@motherafricafestival.ci
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
