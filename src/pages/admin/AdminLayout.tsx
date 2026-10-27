/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { adminService, UserRole } from '../../services/adminService.ts';

interface AdminLayoutProps {
  currentRoute: string;
  go: (route: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentRoute, go, children }) => {
  const currentAdmin = adminService.getCurrentAdmin();
  const [role, setRole] = useState<UserRole>(currentAdmin?.role || 'SUPER_ADMIN');
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const handleRoleChange = (newRole: UserRole) => {
    adminService.setAdminRole(newRole);
    setRole(newRole);
    setRoleSwitcherOpen(false);
  };

  const navItems = [
    { label: 'Tableau de bord', route: '/admin', roles: ['SUPER_ADMIN', 'RESPONSABLE_BILLETTERIE', 'RESPONSABLE_FINANCIER'] },
    { label: 'Pass & Tarifs', route: '/admin/billetterie', roles: ['SUPER_ADMIN', 'RESPONSABLE_BILLETTERIE'] },
    { label: 'Commandes', route: '/admin/commandes', roles: ['SUPER_ADMIN', 'RESPONSABLE_BILLETTERIE', 'RESPONSABLE_FINANCIER'] },
    { label: 'Contrôle d’accès', route: '/admin/controle-acces', roles: ['SUPER_ADMIN', 'RESPONSABLE_BILLETTERIE', 'AGENT_CONTROLE'] },
    { label: 'Finances', route: '/admin/finances', roles: ['SUPER_ADMIN', 'RESPONSABLE_FINANCIER'] },
    { label: 'Équipe', route: '/admin/equipe', roles: ['SUPER_ADMIN'] }
  ];

  const allowedNav = navItems.filter((item) => item.roles.includes(role));

  const roleLabels: Record<UserRole, { label: string; badgeClass: string }> = {
    SUPER_ADMIN: { label: 'Super Admin', badgeClass: 'bg-red-100 text-red-700 border-red-200' },
    RESPONSABLE_BILLETTERIE: { label: 'Billetterie', badgeClass: 'bg-amber-100 text-amber-800 border-amber-200' },
    RESPONSABLE_FINANCIER: { label: 'Finances', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    AGENT_CONTROLE: { label: 'Agent Scan', badgeClass: 'bg-blue-100 text-blue-800 border-blue-200' },
    FESTIVALIER: { label: 'Festivalier', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 font-admin flex flex-col antialiased">
      {/* 1. Barre supérieure blanche épurée type SaaS commercial */}
      <header className="w-full bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 z-40 select-none shadow-xs">
        {/* Logo & Titre Console de Gestion */}
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-base tracking-tight shadow-xs">
            MA
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 text-base">
                Mother Africa Festival 2026
              </span>
              <span className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">
                Administration
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Gestion commerciale, billetterie et contrôle d'accès
            </p>
          </div>
        </div>

        {/* Sélecteur de rôle & Lien vers le site public */}
        <div className="flex items-center gap-3">
          {/* Menu déroulant rôle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
              className="px-3 py-1.5 border border-slate-200 rounded-md bg-white text-xs font-medium text-slate-700 flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <span className="text-slate-400">Rôle :</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${roleLabels[role].badgeClass}`}>
                {roleLabels[role].label}
              </span>
              <span className="text-slate-400 text-[10px]">▼</span>
            </button>

            {roleSwitcherOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-60 border border-slate-200 bg-white rounded-lg shadow-lg p-1.5 space-y-1 z-50">
                <span className="text-[11px] font-medium text-slate-400 uppercase px-2 py-1 block">
                  Changer de vue opérateur :
                </span>
                {(
                  [
                    'SUPER_ADMIN',
                    'RESPONSABLE_BILLETTERIE',
                    'RESPONSABLE_FINANCIER',
                    'AGENT_CONTROLE',
                    'FESTIVALIER'
                  ] as UserRole[]
                ).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      if (r === 'FESTIVALIER') {
                        handleRoleChange(r);
                        go('/compte/mes-billets');
                      } else {
                        handleRoleChange(r);
                      }
                    }}
                    className={`w-full text-left px-2.5 py-1.5 text-xs rounded-md flex items-center justify-between cursor-pointer transition-colors ${
                      role === r
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{roleLabels[r].label}</span>
                    {role === r && <span className="text-slate-900 font-bold">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bouton retour au site public */}
          <button
            type="button"
            onClick={() => go('/')}
            className="px-3 py-1.5 border border-slate-300 rounded-md bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <span>↗</span>
            <span className="hidden sm:inline">Voir le site public</span>
            <span className="sm:hidden">Site</span>
          </button>
        </div>
      </header>

      {/* 2. Barre de navigation des modules - Style SaaS blanc & simple */}
      <nav
        aria-label="Navigation administration"
        className="w-full bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center gap-1 sm:gap-2 overflow-x-auto select-none"
      >
        {allowedNav.map((item) => {
          const isActive = currentRoute === item.route;
          return (
            <button
              key={item.route}
              type="button"
              onClick={() => go(item.route)}
              className={`text-sm px-3.5 py-3 transition-colors whitespace-nowrap cursor-pointer border-b-2 font-medium ${
                isActive
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* 3. Contenu de la vue admin sur fond clair */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {children}
      </main>
    </div>
  );
};
