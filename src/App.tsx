/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Background } from './components/Background.tsx';
import { Logo } from './components/Logo.tsx';
import { Home } from './pages/Home.tsx';
import { Lineup } from './pages/Lineup.tsx';
import { Festival } from './pages/Festival.tsx';
import { Archives } from './pages/Archives.tsx';
import { Tickets } from './pages/Tickets.tsx';
import { OrderCheckout } from './pages/OrderCheckout.tsx';
import { OrderConfirmation } from './pages/OrderConfirmation.tsx';
import { Login } from './pages/Login.tsx';
import { Register } from './pages/Register.tsx';
import { MyTickets } from './pages/MyTickets.tsx';
import { DigitalTicketDetail } from './pages/DigitalTicketDetail.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';

// Administration Pages
import { AdminDashboard } from './pages/admin/AdminDashboard.tsx';
import { AdminPasses } from './pages/admin/AdminPasses.tsx';
import { AdminOrders } from './pages/admin/AdminOrders.tsx';
import { AdminAccessControl } from './pages/admin/AdminAccessControl.tsx';
import { AdminFinances } from './pages/admin/AdminFinances.tsx';
import { AdminTeam } from './pages/admin/AdminTeam.tsx';
import { adminService } from './services/adminService.ts';

interface ParsedRoute {
  path: string;
  searchParams: URLSearchParams;
  raw: string;
}

const parseHashRoute = (): ParsedRoute => {
  if (typeof window === 'undefined') {
    return { path: '/', searchParams: new URLSearchParams(), raw: '/' };
  }
  const rawHash = window.location.hash.replace(/^#\/?/, '');
  const [pathname, queryString] = rawHash.split('?');
  const path = !pathname || pathname === '/' ? '/' : pathname.startsWith('/') ? pathname : `/${pathname}`;
  const searchParams = new URLSearchParams(queryString || '');
  return { path, searchParams, raw: rawHash ? `/${rawHash}` : '/' };
};

function AppContent() {
  const { user, logout } = useAuth();
  const [routeInfo, setRouteInfo] = useState<ParsedRoute>(parseHashRoute);
  const [bg, setBg] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  const [lastCompletedOrderId, setLastCompletedOrderId] = useState<string | undefined>(undefined);

  // Synchronisation avec location.hash et événement hashchange
  useEffect(() => {
    const handleHashChange = () => {
      const nextRoute = parseHashRoute();
      setRouteInfo(nextRoute);
      setBg(null);
      setUserMenuOpen(false);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const go = (targetRoute: string) => {
    setBg(null);
    setUserMenuOpen(false);
    try {
      window.location.hash = targetRoute === '/' ? '' : targetRoute;
    } catch {
      // noop
    }
    setRouteInfo(parseHashRoute());
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const currentPath = routeInfo.path;
  const isAdminRoute = currentPath.startsWith('/admin');
  // L'image de fond n'est affichée que si la route est "/line-up"
  const currentBg = currentPath === '/line-up' ? bg : null;

  const editorialLinks = [
    {
      label: 'LINE-UP',
      route: '/line-up',
      art: '/assets/menu_art/menu_lineup_white.png'
    },
    {
      label: 'FESTIVAL',
      route: '/festival',
      art: '/assets/menu_art/menu_festival_white.png'
    },
    {
      label: 'ARCHIVES',
      route: '/archives',
      art: '/assets/menu_art/menu_archives_white.png'
    },
    {
      label: 'BILLETTERIE',
      route: '/billets',
      art: '/assets/menu_art/menu_billetterie_white.png'
    }
  ];

  // Détection des routes de billets
  const isMyTickets = currentPath === '/compte/mes-billets' || currentPath === '/compte/billets';
  const isTicketDetail =
    currentPath.startsWith('/compte/mes-billets/') && currentPath.split('/').length >= 4;
  const ticketRefParam = isTicketDetail ? currentPath.split('/')[3] : '';

  return (
    <div className="relative min-h-screen bg-[#142B1A] text-[#F4F1EA] selection:bg-[#C85A17] selection:text-[#F4F1EA] overflow-x-hidden">
      {/* Fond global avec vagues SVG et photo plein écran au survol */}
      {!isAdminRoute && <Background image={currentBg} />}

      {/* Conteneur z-10 en colonne respectant les safe areas */}
      <div className="relative z-10 min-h-screen flex flex-col pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]">
        {/* En-tête sur toutes les pages publiques sauf l'accueil et l'admin : 100% transparent */}
        {currentPath !== '/' && !isAdminRoute && (
          <header className="w-full px-3 sm:px-8 lg:px-12 pt-4 sm:pt-6 pb-3 sm:pb-4 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 select-none">
            {/* Petit logo à gauche (bouton qui renvoie à l'accueil) */}
            <div className="w-full md:w-auto flex items-center justify-between md:justify-start">
              <Logo size="small" onClick={() => go('/')} />

              {/* Raccourci ADMIN visible sur desktop */}
              <button
                type="button"
                onClick={() => go('/admin')}
                className="hidden md:inline-block ml-4 px-2 py-0.5 border border-[#C85A17] text-[#C85A17] font-display text-[10px] tracking-wider uppercase hover:bg-[#C85A17] hover:text-[#F4F1EA] transition-colors cursor-pointer"
                title="Panneau d'administration festivalier"
              >
                ADMIN
              </button>
            </div>

            {/* Barre de navigation 100% sur UNE SEULE LIGNE HORIZONTALE sur mobile et desktop */}
            <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-1.5 xs:gap-2.5 sm:gap-4 md:gap-6 flex-nowrap overflow-x-auto no-scrollbar">
              <nav aria-label="Navigation éditoriale" className="flex items-center gap-1.5 xs:gap-2.5 sm:gap-4 md:gap-6 flex-nowrap shrink-0">
                {editorialLinks.map((link) => {
                  const isActive =
                    currentPath === link.route ||
                    (link.route === '/billets' && currentPath.startsWith('/billets'));
                  return (
                    <button
                      key={link.route}
                      type="button"
                      onClick={() => go(link.route)}
                      className={`relative flex items-center justify-center transition-all duration-150 cursor-pointer shrink-0 pb-1 ${
                        isActive
                          ? 'border-b-2 sm:border-b-4 border-[#C85A17]'
                          : 'border-b-2 sm:border-b-4 border-transparent opacity-85 hover:opacity-100'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                      title={link.label}
                    >
                      <img
                        src={link.art}
                        alt={link.label}
                        className={`h-3.5 xs:h-4 sm:h-5 md:h-6 lg:h-7 w-auto max-w-[65px] xs:max-w-[75px] sm:max-w-[120px] md:max-w-none object-contain transition-all duration-150 ${
                          isActive
                            ? '[filter:invert(43%)_sepia(85%)_saturate(1630%)_hue-rotate(352deg)_brightness(105%)] drop-shadow-[0_0_6px_rgba(200,90,23,0.7)]'
                            : 'hover:[filter:invert(43%)_sepia(85%)_saturate(1630%)_hue-rotate(352deg)_brightness(105%)]'
                        }`}
                      />
                    </button>
                  );
                })}
              </nav>

              {/* Séparateur vertical fin */}
              <span className="h-4 sm:h-6 w-[1.5px] bg-[#F4F1EA]/30 shrink-0" />

              {/* Lien Compte sur la MÊME LIGNE HORIZONTALE */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`font-display text-xs xs:text-sm sm:text-base md:text-lg uppercase cursor-pointer whitespace-nowrap px-1 py-0.5 flex items-center gap-1 transition-colors ${
                    isMyTickets || userMenuOpen
                      ? 'text-[#C85A17] font-bold'
                      : 'text-[#F4F1EA]/90 hover:text-[#C85A17]'
                  }`}
                  aria-expanded={userMenuOpen}
                >
                  <span>COMPTE</span>
                  <span className="text-[9px] text-[#C85A17]">▼</span>
                </button>

                {/* Menu déroulant brutaliste du compte */}
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 sm:w-64 border-4 border-[#F4F1EA] bg-[#0c1c11] shadow-[6px_6px_0px_#C85A17] z-50 flex flex-col p-2 space-y-1">
                      <div className="px-2 py-1.5 border-b border-[#F4F1EA]/20 mb-1">
                        <span className="text-[10px] text-[#C85A17] font-mono uppercase block">PROFIL ACTIF</span>
                        <span className="font-display text-xs text-[#F4F1EA] truncate block">
                          {user ? `${user.firstName} ${user.lastName}` : 'KOFFI KOUASSI MARC'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          go('/compte/mes-billets');
                        }}
                        className="w-full text-left p-2 font-display text-xs sm:text-sm text-[#F4F1EA] hover:bg-[#C85A17] transition-colors cursor-pointer"
                      >
                        [ MES BILLETS ]
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          adminService.setAdminRole('SUPER_ADMIN');
                          setUserMenuOpen(false);
                          go('/admin');
                        }}
                        className="w-full text-left p-2 font-display text-xs text-[#F4F1EA] hover:bg-[#C85A17] transition-colors cursor-pointer"
                      >
                        [ PASSER SUR ADMINISTRATEUR ]
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          go('/admin');
                        }}
                        className="w-full text-left p-2 font-display text-xs text-[#EAD9A4] hover:bg-[#C85A17] hover:text-white transition-colors cursor-pointer"
                      >
                        [ ESPACE ADMINISTRATION ]
                      </button>

                      {user ? (
                        <button
                          type="button"
                          onClick={async () => {
                            setUserMenuOpen(false);
                            await logout();
                            go('/');
                          }}
                          className="w-full text-left p-2 font-display text-xs text-[#C85A17] hover:bg-[#C85A17] hover:text-[#F4F1EA] transition-colors cursor-pointer"
                        >
                          [ DÉCONNEXION ]
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false);
                            go('/compte/connexion?next=/compte/mes-billets');
                          }}
                          className="w-full text-left p-2 font-display text-xs text-[#C85A17] hover:bg-[#C85A17] hover:text-[#F4F1EA] transition-colors cursor-pointer"
                        >
                          [ SE CONNECTER ]
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>
        )}

        {/* Transition entre pages avec AnimatePresence mode="wait" (0.2s) */}
        <AnimatePresence mode="wait">
          <motion.main
            key={currentPath}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 w-full"
          >
            {/* Route Accueil */}
            {currentPath === '/' && <Home go={go} />}

            {/* Route Line-Up */}
            {currentPath === '/line-up' && <Lineup setBg={setBg} />}

            {/* Route Festival */}
            {currentPath === '/festival' && <Festival />}

            {/* Route Archives */}
            {currentPath === '/archives' && <Archives />}

            {/* Route Billets Tarifs */}
            {currentPath === '/billets' && <Tickets go={go} />}

            {/* Parcours d'achat étape par étape */}
            {currentPath === '/billets/commande' && (
              <OrderCheckout
                go={go}
                onOrderCompleted={(orderId) => setLastCompletedOrderId(orderId)}
              />
            )}

            {/* Confirmation d'achat */}
            {currentPath === '/billets/confirmation' && (
              <OrderConfirmation
                go={go}
                orderId={routeInfo.searchParams.get('orderId') || lastCompletedOrderId}
              />
            )}

            {/* Espace Compte : Connexion */}
            {currentPath === '/compte/connexion' && (
              <Login
                go={go}
                nextRoute={routeInfo.searchParams.get('next') || '/compte/mes-billets'}
              />
            )}

            {/* Espace Compte : Inscription */}
            {currentPath === '/compte/inscription' && (
              <Register
                go={go}
                nextRoute={routeInfo.searchParams.get('next') || '/compte/mes-billets'}
              />
            )}

            {/* Espace Compte : Mes Billets (Liste panoramique) */}
            {isMyTickets && <MyTickets go={go} />}

            {/* Espace Compte : Détail du Billet Numérique Stylisé */}
            {isTicketDetail && <DigitalTicketDetail ticketRef={ticketRefParam} go={go} />}

            {/* ========================================================
                ESPACE D'ADMINISTRATION CENTRALISÉE ET RBAC (/admin/*)
                ======================================================== */}
            {currentPath === '/admin' && <AdminDashboard go={go} />}
            {currentPath === '/admin/billetterie' && <AdminPasses go={go} />}
            {currentPath === '/admin/commandes' && <AdminOrders go={go} />}
            {currentPath === '/admin/controle-acces' && <AdminAccessControl go={go} />}
            {currentPath === '/admin/finances' && <AdminFinances go={go} />}
            {currentPath === '/admin/equipe' && <AdminTeam go={go} />}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
