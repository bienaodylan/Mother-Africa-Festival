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
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';

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
  // L'image de fond n'est affichée que si la route est "/line-up"
  const currentBg = currentPath === '/line-up' ? bg : null;

  const editorialLinks = [
    { label: 'LINE-UP', route: '/line-up' },
    { label: 'FESTIVAL', route: '/festival' },
    { label: 'ARCHIVES', route: '/archives' },
    { label: 'BILLETS', route: '/billets' }
  ];

  return (
    <div className="relative min-h-screen bg-[#142B1A] text-[#F4F1EA] selection:bg-[#C85A17] selection:text-[#F4F1EA] overflow-x-hidden">
      {/* Fond global avec vagues SVG et photo plein écran au survol */}
      <Background image={currentBg} />

      {/* Conteneur z-10 en colonne respectant les safe areas */}
      <div className="relative z-10 min-h-screen flex flex-col pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]">
        {/* En-tête sur toutes les pages sauf l'accueil */}
        {currentPath !== '/' && (
          <header className="w-full px-4 sm:px-8 lg:px-12 pt-6 pb-4 flex flex-wrap items-center justify-between gap-4 select-none">
            {/* Petit logo à gauche (bouton qui renvoie à l'accueil) */}
            <Logo size="small" onClick={() => go('/')} />

            {/* Navigation principale à droite + Lien Compte séparé */}
            <div className="flex items-center gap-6 sm:gap-8 lg:gap-10">
              <nav aria-label="Navigation éditoriale" className="flex items-center gap-6 sm:gap-8 lg:gap-10">
                {editorialLinks.map((link) => {
                  const isActive = currentPath === link.route || (link.route === '/billets' && currentPath.startsWith('/billets'));
                  return (
                    <button
                      key={link.route}
                      type="button"
                      onClick={() => go(link.route)}
                      className={`font-display text-2xl sm:text-3xl transition-colors duration-150 cursor-pointer pb-1 ${
                        isActive
                          ? 'text-[#C85A17] border-b-4 border-[#C85A17]'
                          : 'text-[#F4F1EA] hover:text-[#C85A17]'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {link.label}
                    </button>
                  );
                })}
              </nav>

              {/* Séparation et Lien Compte (affiche le prénom une fois connecté) */}
              <div className="relative border-l-2 border-[#F4F1EA]/30 pl-4 sm:pl-6">
                {user ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="px-3 py-1.5 border-2 border-[#C85A17] bg-[#C85A17]/20 font-display text-base sm:text-lg text-[#F4F1EA] hover:bg-[#C85A17] transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>{user.firstName}</span>
                      <span className="text-xs text-[#C85A17] group-hover:text-white">▼</span>
                    </button>

                    {/* Menu déroulant brutaliste du compte */}
                    {userMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-48 border-4 border-[#F4F1EA] bg-[#0c1c11] shadow-[6px_6px_0px_#C85A17] z-50 flex flex-col p-2 space-y-1">
                        <button
                          type="button"
                          onClick={() => go('/compte/billets')}
                          className="w-full text-left p-2.5 font-display text-sm text-[#F4F1EA] hover:bg-[#C85A17] transition-colors"
                        >
                          [ MES BILLETS ]
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await logout();
                            go('/');
                          }}
                          className="w-full text-left p-2.5 font-display text-xs text-[#C85A17] hover:bg-[#C85A17] hover:text-[#F4F1EA] transition-colors"
                        >
                          [ DÉCONNEXION ]
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => go(`/compte/connexion?next=${encodeURIComponent(currentPath)}`)}
                    className="font-display text-lg sm:text-xl text-[#F4F1EA]/80 hover:text-[#C85A17] uppercase cursor-pointer"
                  >
                    COMPTE
                  </button>
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
                nextRoute={routeInfo.searchParams.get('next') || '/billets/commande'}
              />
            )}

            {/* Espace Compte : Inscription */}
            {currentPath === '/compte/inscription' && (
              <Register
                go={go}
                nextRoute={routeInfo.searchParams.get('next') || '/billets/commande'}
              />
            )}

            {/* Espace Compte : Mes Billets */}
            {currentPath === '/compte/billets' && <MyTickets go={go} />}
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
