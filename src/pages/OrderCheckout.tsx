/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TICKETS, CONFIG, PAYMENT_METHODS, formatFCFA, Ticket } from '../data.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { api } from '../services/api.ts';

interface OrderCheckoutProps {
  go: (route: string) => void;
  onOrderCompleted?: (orderId: string) => void;
}

export const OrderCheckout: React.FC<OrderCheckoutProps> = ({ go, onOrderCompleted }) => {
  const { user, isLoading: authLoading } = useAuth();
  const {
    items,
    addCategory,
    removeCategory,
    incrementCategory,
    decrementCategory,
    totalPrice,
    totalQuantity,
    holderNames,
    setHolderName,
    clearCart
  } = useCart();

  // Étape de la commande : 1 = Billet, 2 = Compte, 3 = Récap, 4 = Paiement
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(PAYMENT_METHODS[0].id);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Modal ou panneau de sélection d'une autre catégorie
  const [showAddCategoryModal, setShowAddCategoryModal] = useState<boolean>(false);

  // Redirection automatique à l'étape 2 si non connecté
  useEffect(() => {
    if (step === 2) {
      if (!authLoading) {
        if (user) {
          setStep(3);
        } else {
          go('/compte/connexion?next=/billets/commande');
        }
      }
    }
  }, [step, user, authLoading, go]);

  const stepsList = [
    { num: 1, label: '[ 1 BILLET ]' },
    { num: 2, label: '[ 2 COMPTE ]' },
    { num: 3, label: '[ 3 RÉCAP ]' },
    { num: 4, label: '[ 4 PAIEMENT ]' },
    { num: 5, label: '[ 5 BILLETS ]' }
  ];

  const handleNextFromStep1 = () => {
    if (!user) {
      go('/compte/connexion?next=/billets/commande');
    } else {
      setStep(3);
    }
  };

  const handleNextFromStep3 = () => {
    setPaymentError(null);
    setStep(4);
  };

  const handleProcessPayment = async () => {
    if (!user) {
      go('/compte/connexion?next=/billets/commande');
      return;
    }

    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      const paymentRes = await api.pay({
        orderId: `temp_${Date.now()}`,
        paymentMethod: selectedPaymentMethod,
        amount: totalPrice
      });

      if (!paymentRes.success) {
        throw new Error('La transaction a été refusée par la passerelle de paiement.');
      }

      // Préparation des articles pour la commande
      const orderItems = items.map((it) => {
        const ticketInfo = TICKETS.find((t) => t.id === it.categoryId) || TICKETS[0];
        return {
          categoryId: it.categoryId,
          categoryName: ticketInfo.name,
          quantity: it.quantity,
          unitPrice: ticketInfo.numericPrice
        };
      });

      const finalOrder = await api.createOrder({
        user,
        items: orderItems,
        holderNames,
        paymentMethod: selectedPaymentMethod
      });

      if (finalOrder.tickets.length > 0) {
        api.sendTicketEmail(finalOrder.tickets[0], '', user.email);
      }

      clearCart();

      if (onOrderCompleted) {
        onOrderCompleted(finalOrder.id);
      }
      go(`/billets/confirmation?orderId=${finalOrder.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors du traitement du paiement.';
      setPaymentError(msg);
      setIsProcessingPayment(false);
    }
  };

  // Catégories non encore présentes dans la commande
  const availableCategoriesToAdd = TICKETS.filter(
    (ticket) => !items.some((it) => it.categoryId === ticket.id)
  );

  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex flex-col justify-between px-4 sm:px-8 lg:px-12 py-8 select-none max-w-5xl mx-auto pb-28 md:pb-16">
      <div>
        {/* 1. Indicateur d'étapes brutaliste */}
        <div className="mb-12 overflow-x-auto pb-2">
          <div className="flex items-center gap-3 sm:gap-4 min-w-max">
            {stepsList.map((s) => {
              const isCurrent = step === s.num;
              const isPast = step > s.num;

              return (
                <div
                  key={s.num}
                  className={`border-4 px-4 sm:px-6 py-2.5 font-display text-xs sm:text-base tracking-wider uppercase transition-all ${
                    isCurrent
                      ? 'bg-[#C85A17] text-[#F4F1EA] border-[#C85A17]'
                      : isPast
                      ? 'bg-[#F4F1EA] text-[#142B1A] border-[#F4F1EA]'
                      : 'opacity-40 text-[#F4F1EA] border-[#F4F1EA]'
                  }`}
                >
                  {s.label}
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Contenu de l'étape animée */}
        <AnimatePresence mode="wait">
          {/* ÉTAPE 1 : FOCUS UNIQUE SUR LE BILLET CHOISI & AJOUT POSSIBLE */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="space-y-10"
            >
              <div>
                <span className="font-display text-xs sm:text-sm text-[#C85A17] tracking-widest uppercase block mb-2">
                  ÉTAPE 01 / SÉLECTION
                </span>
                <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl text-[#F4F1EA] leading-none">
                  VOTRE BILLET
                </h1>
                <p className="font-body text-xs sm:text-sm text-[#F4F1EA]/80 mt-2 uppercase tracking-wide">
                  DANS LA LIMITE DES STOCKS DISPONIBLES · PASS VALABLE LES 27 & 28 DÉCEMBRE 2026
                </p>
              </div>

              {/* LISTE DES BILLETS SÉLECTIONNÉS (Focus unique avec grand encadré terracotta) */}
              <div className="space-y-8">
                {items.map((cartItem) => {
                  const ticket: Ticket =
                    TICKETS.find((t) => t.id === cartItem.categoryId) || TICKETS[0];
                  const itemSubtotal = ticket.numericPrice * cartItem.quantity;

                  return (
                    <div
                      key={ticket.id}
                      className="border-4 border-[#C85A17] bg-[#C85A17]/10 p-6 sm:p-10 shadow-[8px_8px_0px_#C85A17] space-y-8"
                    >
                      {/* Entête du billet sélectionné */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-[#C85A17]/40 pb-6">
                        <div>
                          <span className="bg-[#C85A17] text-[#F4F1EA] px-3 py-1 font-display text-xs sm:text-sm tracking-wider uppercase inline-block mb-3">
                            ✓ BILLET SÉLECTIONNÉ
                          </span>
                          <h2 className="font-display text-4xl sm:text-6xl text-[#F4F1EA] leading-none">
                            {ticket.name}
                          </h2>
                          <p className="font-body text-xs sm:text-sm text-[#F4F1EA]/80 mt-2 uppercase tracking-wide">
                            {ticket.perks}
                          </p>
                        </div>

                        <div className="sm:text-right">
                          <span className="font-display text-xs text-[#F4F1EA]/60 uppercase block">
                            PRIX UNITAIRE
                          </span>
                          <span className="font-display text-3xl sm:text-5xl text-[#C85A17]">
                            {ticket.price}
                          </span>
                        </div>
                      </div>

                      {/* Sélecteur de Quantité avec boutons [-] et [+] parfaitement cadrés et espacés */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-2">
                        <div>
                          <span className="font-display text-lg sm:text-2xl text-[#F4F1EA] uppercase block">
                            QUANTITÉ DE BILLETS
                          </span>
                          <span className="font-body text-xs text-[#F4F1EA]/70 mt-1 block">
                            Limite fixée à {CONFIG.MAX_PER_ORDER} billets maximum par commande.
                          </span>
                        </div>

                        {/* Boutons Moins et Plus géants avec cadrage SVG géométrique parfait */}
                        <div className="flex items-center gap-6">
                          {/* Bouton Moins */}
                          <button
                            type="button"
                            onClick={() => decrementCategory(ticket.id)}
                            disabled={cartItem.quantity <= 1}
                            aria-label={`Diminuer la quantité de billets ${ticket.name}`}
                            className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-[#F4F1EA] flex items-center justify-center text-[#F4F1EA] hover:bg-[#C85A17] hover:border-[#C85A17] disabled:opacity-25 disabled:pointer-events-none transition-colors cursor-pointer"
                          >
                            <svg
                              className="w-7 h-7 sm:w-8 sm:h-8"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="4"
                              strokeLinecap="square"
                            >
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                          </button>

                          {/* Quantité centrale */}
                          <div className="w-16 sm:w-20 text-center font-display text-4xl sm:text-6xl text-[#F4F1EA] leading-none">
                            {cartItem.quantity}
                          </div>

                          {/* Bouton Plus */}
                          <button
                            type="button"
                            onClick={() => incrementCategory(ticket.id)}
                            disabled={cartItem.quantity >= CONFIG.MAX_PER_ORDER}
                            aria-label={`Augmenter la quantité de billets ${ticket.name}`}
                            className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-[#F4F1EA] flex items-center justify-center text-[#F4F1EA] hover:bg-[#C85A17] hover:border-[#C85A17] disabled:opacity-25 disabled:pointer-events-none transition-colors cursor-pointer"
                          >
                            <svg
                              className="w-7 h-7 sm:w-8 sm:h-8"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="4"
                              strokeLinecap="square"
                            >
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Sous-total de ce billet & option de retrait si multi-billets */}
                      <div className="pt-6 border-t border-[#F4F1EA]/20 flex flex-wrap items-baseline justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <span className="font-display text-xs sm:text-sm text-[#F4F1EA]/70 uppercase">
                            SOUS-TOTAL ESTIMÉ :
                          </span>
                          <span className="font-display text-2xl sm:text-4xl text-[#C85A17]">
                            {formatFCFA(itemSubtotal)}
                          </span>
                        </div>

                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCategory(ticket.id)}
                            className="font-display text-xs text-red-400 hover:text-red-300 uppercase tracking-wider cursor-pointer"
                          >
                            [ RETIRER CE BILLET ]
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* BOUTON SECONDAIRE AÉRÉ POUR AJOUTER UNE AUTRE CATÉGORIE */}
              {availableCategoriesToAdd.length > 0 && (
                <div className="pt-4">
                  {!showAddCategoryModal ? (
                    <button
                      type="button"
                      onClick={() => setShowAddCategoryModal(true)}
                      className="w-full py-5 border-4 border-dashed border-[#F4F1EA]/50 font-display text-base sm:text-xl text-[#F4F1EA] hover:border-[#C85A17] hover:text-[#C85A17] hover:bg-[#C85A17]/10 transition-colors uppercase cursor-pointer"
                    >
                      [ + AJOUTER UNE AUTRE CATÉGORIE DE BILLET ]
                    </button>
                  ) : (
                    <div className="border-4 border-[#F4F1EA] p-6 bg-[#0c1c11] space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-display text-sm text-[#C85A17] uppercase">
                          CHOISIR UNE CATÉGORIE À AJOUTER :
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowAddCategoryModal(false)}
                          className="font-display text-xs text-[#F4F1EA]/70 hover:text-[#C85A17] uppercase"
                        >
                          [ ANNULER ]
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {availableCategoriesToAdd.map((otherTicket) => (
                          <button
                            key={otherTicket.id}
                            type="button"
                            onClick={() => {
                              addCategory(otherTicket.id);
                              setShowAddCategoryModal(false);
                            }}
                            className="p-5 border-2 border-[#F4F1EA] text-left hover:border-[#C85A17] hover:bg-[#C85A17]/20 transition-colors cursor-pointer"
                          >
                            <span className="font-display text-2xl text-[#F4F1EA] block">
                              {otherTicket.name}
                            </span>
                            <span className="font-display text-xl text-[#C85A17] mt-1 block">
                              {otherTicket.price}
                            </span>
                            <span className="font-body text-xs text-[#F4F1EA]/70 mt-2 block uppercase">
                              {otherTicket.perks}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* GRAND ESPACE VIDE DE RESPIRATION AVANT LES BOUTONS FINAUX */}
              <div className="my-14 sm:my-20 border-b border-[#F4F1EA]/20" />

              {/* RECAP RAPIDE & ACTIONS */}
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
                  <span className="font-display text-base sm:text-xl text-[#F4F1EA]/80 uppercase">
                    TOTAL ESTIMÉ ({totalQuantity} BILLET{totalQuantity > 1 ? 'S' : ''}) :
                  </span>
                  <span className="font-display text-4xl sm:text-6xl text-[#C85A17]">
                    {formatFCFA(totalPrice)}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4">
                  <button
                    type="button"
                    onClick={() => go('/billets')}
                    className="font-display text-base text-[#F4F1EA]/70 hover:text-[#C85A17] uppercase cursor-pointer"
                  >
                    [ RETOUR AUX TARIFS ]
                  </button>

                  <button
                    type="button"
                    onClick={handleNextFromStep1}
                    className="w-full sm:w-auto brut-btn px-10 sm:px-14 py-5 text-xl sm:text-2xl"
                  >
                    CONTINUER VERS L'IDENTIFICATION →
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ÉTAPE 3 : RÉCAPITULATIF & NOMS DES PORTEURS */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="space-y-10"
            >
              <div>
                <span className="font-display text-xs sm:text-sm text-[#C85A17] tracking-widest uppercase block mb-2">
                  ÉTAPE 03 / VÉRIFICATION
                </span>
                <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl text-[#F4F1EA] leading-none">
                  RÉCAPITULATIF
                </h1>
              </div>

              {/* Lignes du récapitulatif */}
              <div className="border-4 border-[#F4F1EA] p-6 sm:p-10 bg-[#0c1c11] space-y-6">
                {items.map((cartItem) => {
                  const t = TICKETS.find((tk) => tk.id === cartItem.categoryId) || TICKETS[0];
                  return (
                    <div
                      key={t.id}
                      className="border-b-2 border-[#F4F1EA]/20 pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2"
                    >
                      <div>
                        <span className="font-display text-2xl sm:text-4xl text-[#F4F1EA] block">
                          {cartItem.quantity}x {t.name}
                        </span>
                        <span className="font-body text-xs text-[#F4F1EA]/60 uppercase">
                          {t.price} / unité
                        </span>
                      </div>
                      <span className="font-display text-2xl sm:text-4xl text-[#C85A17]">
                        {formatFCFA(t.numericPrice * cartItem.quantity)}
                      </span>
                    </div>
                  );
                })}

                <div className="pt-4 flex items-baseline justify-between">
                  <span className="font-display text-base sm:text-xl text-[#C85A17] uppercase">
                    TOTAL À PAYER
                  </span>
                  <span className="font-display text-4xl sm:text-6xl text-[#C85A17]">
                    {formatFCFA(totalPrice)}
                  </span>
                </div>
              </div>

              {/* Noms des porteurs */}
              {CONFIG.ASK_HOLDER_NAMES && (
                <div className="border-4 border-[#F4F1EA] p-6 sm:p-8 bg-[#142B1A]/80 space-y-6">
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl text-[#F4F1EA] uppercase">
                      NOMS DES PORTEURS DES BILLETS
                    </h2>
                    <p className="font-body text-xs text-[#F4F1EA]/70 mt-1">
                      Chaque billet est strictement personnel et sera vérifié à l'entrée avec une pièce d'identité.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {Array.from({ length: totalQuantity }).map((_, index) => (
                      <div key={index}>
                        <label
                          htmlFor={`holder-name-${index}`}
                          className="font-display text-sm text-[#F4F1EA] uppercase block mb-1"
                        >
                          BILLET 0{index + 1} · NOM COMPLET DU TITULAIRE
                        </label>
                        <input
                          id={`holder-name-${index}`}
                          type="text"
                          value={holderNames[index] || ''}
                          onChange={(e) => setHolderName(index, e.target.value.toUpperCase())}
                          placeholder={
                            index === 0 && user
                              ? `${user.firstName} ${user.lastName}`
                              : `NOM & PRÉNOM DU TITULAIRE 0${index + 1}`
                          }
                          className="w-full px-4 py-3 bg-transparent border-4 border-[#F4F1EA] text-[#F4F1EA] font-body text-base uppercase focus:border-[#C85A17] focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Grand espace de respiration avant boutons */}
              <div className="my-10 border-b border-[#F4F1EA]/20" />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="font-display text-base text-[#F4F1EA]/70 hover:text-[#C85A17] uppercase cursor-pointer"
                >
                  [ RETOUR À LA SÉLECTION ]
                </button>

                <button
                  type="button"
                  onClick={handleNextFromStep3}
                  className="w-full sm:w-auto brut-btn px-10 sm:px-14 py-5 text-xl sm:text-2xl"
                >
                  VALIDER ET PASSER AU PAIEMENT →
                </button>
              </div>
            </motion.div>
          )}

          {/* ÉTAPE 4 : PAIEMENT */}
          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="space-y-10"
            >
              <div>
                <span className="font-display text-xs sm:text-sm text-[#C85A17] tracking-widest uppercase block mb-2">
                  ÉTAPE 04 / RÈGLEMENT SÉCURISÉ
                </span>
                <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl text-[#F4F1EA] leading-none">
                  PAIEMENT
                </h1>
                <p className="font-body text-sm text-[#F4F1EA]/80 mt-2">
                  Montant net à débiter :{' '}
                  <strong className="text-[#C85A17] font-display text-xl sm:text-2xl">
                    {formatFCFA(totalPrice)}
                  </strong>
                </p>
              </div>

              <div className="space-y-4">
                <span className="font-display text-xs sm:text-sm text-[#F4F1EA] uppercase block">
                  SÉLECTIONNEZ VOTRE OPÉRATEUR DE PAIEMENT :
                </span>
                {/* Alignement strict sur une seule ligne (4 colonnes) avec typographie ajustée pour mobile */}
                <div className="grid grid-cols-4 gap-1.5 sm:gap-3 w-full">
                  {PAYMENT_METHODS.map((pm) => {
                    const isSelected = selectedPaymentMethod === pm.id;
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setSelectedPaymentMethod(pm.id)}
                        className={`border-2 sm:border-4 py-2 sm:py-4 px-1 sm:px-3 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[64px] sm:min-h-[85px] ${
                          isSelected
                            ? 'border-[#C85A17] bg-[#C85A17]/30 shadow-[2px_2px_0px_#C85A17] sm:shadow-[4px_4px_0px_#C85A17]'
                            : 'border-[#F4F1EA] bg-[#0c1c11] hover:border-[#C85A17]'
                        }`}
                      >
                        <span className="font-display text-xs sm:text-base md:text-xl text-[#F4F1EA] tracking-wide truncate w-full block">
                          {pm.name}
                        </span>
                        {pm.badge ? (
                          <span className="text-[7px] sm:text-[9px] font-display bg-[#C85A17] text-[#F4F1EA] px-1 py-0.2 sm:py-0.5 uppercase tracking-wider mt-1 rounded-xs truncate max-w-full">
                            {pm.badge}
                          </span>
                        ) : (
                          <span className="text-[7px] sm:text-[9px] font-mono text-[#F4F1EA]/60 uppercase tracking-tighter mt-1 truncate max-w-full">
                            MOBILE
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {paymentError && (
                <div
                  role="alert"
                  className="p-4 border-2 border-[#C85A17] bg-[#C85A17]/20 text-sm font-body text-[#F4F1EA]"
                >
                  <strong className="block font-display text-base mb-1">ÉCHEC DE LA TRANSACTION :</strong>
                  {paymentError}
                </div>
              )}

              {isProcessingPayment && (
                <div className="border-4 border-[#C85A17] p-8 bg-[#0c1c11] text-center space-y-4">
                  <h3 className="font-display text-2xl sm:text-3xl text-[#F4F1EA]">
                    TRAITEMENT DE LA TRANSACTION EN COURS...
                  </h3>
                  <p className="font-body text-xs sm:text-sm text-[#F4F1EA]/80">
                    Veuillez ne pas rafraîchir la page pendant la confirmation auprès de votre opérateur.
                  </p>
                  <div className="relative h-6 w-full max-w-md mx-auto border-2 border-[#F4F1EA] overflow-hidden bg-[#142B1A]">
                    <div className="absolute inset-0 bg-[#C85A17] animate-pulse opacity-80" />
                    <div
                      className="absolute inset-0 w-[200%] h-full animate-[moveWave_1.5s_linear_infinite]"
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(45deg, #C85A17 0, #C85A17 12px, #8C3A08 12px, #8C3A08 24px)'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Grand espace avant actions */}
              <div className="my-10 border-b border-[#F4F1EA]/20" />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={() => setStep(3)}
                  className="font-display text-base text-[#F4F1EA]/70 hover:text-[#C85A17] uppercase cursor-pointer disabled:opacity-40"
                >
                  [ RETOUR AU RÉCAPITULATIF ]
                </button>

                {!paymentError ? (
                  <button
                    type="button"
                    disabled={isProcessingPayment}
                    onClick={handleProcessPayment}
                    className="w-full sm:w-auto brut-btn px-10 sm:px-14 py-5 text-xl sm:text-2xl"
                  >
                    {isProcessingPayment ? 'RÈGLEMENT EN COURS...' : `PAYER ${formatFCFA(totalPrice)} →`}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleProcessPayment}
                    className="w-full sm:w-auto brut-btn px-10 sm:px-14 py-5 text-xl sm:text-2xl bg-[#C85A17] border-[#C85A17]"
                  >
                    [ RÉESSAYER LE PAIEMENT ]
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Barre fixe en bas sur mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0c1c11] border-t-4 border-[#C85A17] px-4 py-3 flex items-center justify-between pb-[calc(env(safe-area-inset-bottom,0px)+12px)]">
        <div>
          <span className="font-display text-[10px] text-[#F4F1EA]/60 uppercase block">TOTAL COMMANDE</span>
          <span className="font-display text-xl text-[#C85A17] leading-none">{formatFCFA(totalPrice)}</span>
        </div>
        <div className="font-display text-xs text-[#F4F1EA]">
          {totalQuantity} BILLET{totalQuantity > 1 ? 'S' : ''}
        </div>
      </div>
    </div>
  );
};
