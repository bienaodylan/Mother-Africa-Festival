/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout.tsx';
import { adminService, TeamInvitation, UserRole } from '../../services/adminService.ts';

interface AdminTeamProps {
  go: (route: string) => void;
}

export const AdminTeam: React.FC<AdminTeamProps> = ({ go }) => {
  const [members, setMembers] = useState<TeamInvitation[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('RESPONSABLE_BILLETTERIE');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = () => {
    setMembers(adminService.getTeamMembers());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInvite = () => {
    if (!email.trim() || !email.includes('@')) {
      alert('Veuillez saisir une adresse email valide.');
      return;
    }

    adminService.inviteTeamMember(email, role);
    setIsInviteModalOpen(false);
    setEmail('');
    loadData();
    setSuccessMsg(`L'invitation a été envoyée avec succès à ${email}.`);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const handleRevoke = (id: string, memberEmail: string) => {
    if (window.confirm(`Confirmer la révocation des accès pour ${memberEmail} ?`)) {
      adminService.revokeTeamMember(id);
      loadData();
    }
  };

  const roleLabels: Record<UserRole, { label: string; badgeClass: string }> = {
    SUPER_ADMIN: { label: 'Super Admin', badgeClass: 'bg-red-50 text-red-700 border-red-200' },
    RESPONSABLE_BILLETTERIE: { label: 'Billetterie', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
    RESPONSABLE_FINANCIER: { label: 'Finances', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    AGENT_CONTROLE: { label: 'Agent Scan', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
    FESTIVALIER: { label: 'Festivalier', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' }
  };

  return (
    <AdminLayout currentRoute="/admin/equipe" go={go}>
      <div className="space-y-6 select-none font-admin">
        {/* Titre & Bouton Inviter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Gestion de l'équipe & Accès
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Attribution des rôles, invitations d'opérateurs et gestion des droits d'accès.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-xs cursor-pointer flex items-center gap-2 self-start sm:self-auto"
          >
            <span>+</span>
            <span>Inviter un collaborateur</span>
          </button>
        </div>

        {/* Message de succès */}
        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800 flex items-center gap-2">
            <span>✓</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tableau Blanc Commercial de l'Équipe */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Collaborateur / Email</th>
                  <th className="py-3.5 px-4">Rôle attribué</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-4">Date d'invitation</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m) => {
                  const badge = roleLabels[m.role] || roleLabels.AGENT_CONTROLE;

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="font-semibold text-slate-900 text-sm">
                          {m.email}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          ID: {m.id}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${badge.badgeClass}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {m.status === 'ACCEPTED' ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            En attente
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-500">
                        {new Date(m.invitedAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        {m.role !== 'SUPER_ADMIN' && (
                          <button
                            type="button"
                            onClick={() => handleRevoke(m.id, m.email)}
                            className="px-2.5 py-1 text-xs font-medium text-rose-600 bg-white border border-rose-200 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            Révoquer
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal d'invitation épurée et blanche */}
        {isInviteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs select-none">
            <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900">
                  Inviter un collaborateur
                </h3>
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 uppercase mb-1">
                    Adresse email professionnelle
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemple@motherafricafestival.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 uppercase mb-1">
                    Rôle & habilitation
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="RESPONSABLE_BILLETTERIE">Responsable Billetterie</option>
                    <option value="RESPONSABLE_FINANCIER">Responsable Financier</option>
                    <option value="AGENT_CONTROLE">Agent Contrôle / Scan Portique</option>
                    <option value="SUPER_ADMIN">Super Administrateur</option>
                  </select>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-md text-xs font-medium text-slate-700 hover:bg-white cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleInvite}
                  className="px-4 py-2 bg-slate-900 text-white rounded-md text-xs font-medium hover:bg-slate-800 cursor-pointer shadow-xs"
                >
                  Envoyer l'invitation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
