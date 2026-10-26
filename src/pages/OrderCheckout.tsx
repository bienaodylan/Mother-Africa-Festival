/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TICKETS, CONFIG, PAYMENT_METHODS, formatFCFA } from '../data.ts';
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
    categoryId,
    selectCategory,
    quantity,
    incrementQuantity,
    decrementQuantity,
    totalPrice,
    unitPrice,
    categoryName,
    holderNames,
    setHolderName,
    clearCart
  } = useCart();

  // Étape de la commande : 1 = Billet, 2 = Compte, 3 = Récap, 4 = Paiement
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(PAYMENT_METHODS[0].id);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Redirection automatique à l'étape 2 si non connecté
  useEffect(() => {
    if (step === 2) {
      if (!authLoading) {
        if (user) {
          // L'utilisateur est connecté : avance automatiquement au Récap
          setStep(3);
        } else {
          // Redirige vers la connexion avec le paramètre de retour
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
      // 1. Simuler l'appel de paiement
      const paymentRes = await api.pay({
        orderId: `temp_${Date.now()}`,
        paymentMethod: selectedPaymentMethod,
        amount: totalPrice
      });

      if (!paymentRes.success) {
        throw new Error('La transaction a été refusée par la passerelle de paiement.');
      }

      // 2. Créer la commande officielle et les billets unitaires
      const finalOrder = await api.createOrder({
        user,
        categoryId,
        categoryName,
        quantity,
        unitPrice,
        holderNames,
        paymentMethod: selectedPaymentMethod
      });

      // 3. Simuler l'envoi du mail pour le premier billet
      if (finalOrder.tickets.length > 0) {
        api.sendTicketEmail(finalOrder.tickets[0], '', user.email);
      }

      // 4. Vider le panier
      clearCart();

      // 5. Notifier l'application et rediriger vers la confirmation
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

  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex flex-col justify-between px-4 sm:px-8 lg:px-12 py-6 select-none max-w-5xl mx-auto pb-24 md:pb-12">
      <div>
        {/* 1. Indicateur d'étapes brutaliste */}
        <div className="mb-10 overflow-x-auto pb-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-max">
            {stepsList.map((s) => {
              const isCurrent = step === s.num;
              const isPast = step > s.num;

              return (
                <div
                  key={s.num}
                  className={`border-4 px-3 sm:px-5 py-2 sm:py-2.5 font-display text-xs sm:text-base tracking-wider uppercase transition-all ${
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

        {/* 2. Contenu de l'étape animée (AnimatePresence mode="wait", slide 40px, 0.25s) */}
        <AnimatePresence mode="wait">
          {/* ÉTAPE 1 : CHOIX DU BILLET ET QUANTITÉ */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="space-y-8"
            >
              <div>
                <span className="font-display text-xs sm:text-sm text-[#C85A17] tracking-widest uppercase block mb-1">
                  ÉTAPE 01 / SÉLECTION
                </span>
                <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl text-[#F4F1EA] leading-none">
                  VOTRE BILLET
                </h1>
                <p className="font-body text-xs sm:text-sm text-[#F4F1EA]/80 mt-2 uppercase tracking-wide">
                  DANS LA LIMITE DES STOCKS DISPONIBLES · PASS VALABLE LES 27 & 28 DÉCEMBRE 2026
                </p>
              </div>

              {/* Sélection de la catégorie */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {TICKETS.map((t) => {
                  const isSelected = categoryId === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => selectCategory(t.id)}
                      className={`border-4 p-6 sm:p-8 text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-[#C85A17] bg-[#C85A17]/25 shadow-[6px_6px_0px_#C85A17]'
                          : 'border-[#F4F1EA] bg-[#142B1A]/80 hover:border-[#C85A17]'
                      }`}
                    >
                      <span className="font-display text-xs sm:text-sm text-[#C85A17] block uppercase mb-1">
                        {isSelected ? '✓ SÉLECTIONNÉ' : '[ SÉLECTIONNER ]'}
                      </span>
                      <h2 className="font-display text-3xl sm:text-5xl text-[#F4F1EA] leading-tight">
                        {t.name}
                      </h2>
                      <div className="font-display text-2xl sm:text-4xl text-[#C85A17] mt-1">
                        {t.price}
                      </div>
                      <p className="font-body text-xs text-[#F4F1EA]/80 mt-3 uppercase">
                        {t.perks}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Sélecteur de Quantité avec boutons géants [ – ] et [ + ] */}
              <div className="border-4 border-[#F4F1EA] p-6 sm:p-8 bg-[#0c1c11]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <label htmlFor="qty-controls" className="font-display text-lg sm:text-2xl text-[#F4F1EA] block uppercase">
                      QUANTITÉ DE BILLETS
                    </label>
                    <span className="font-body text-xs text-[#F4F1EA]/70 block mt-1">
                      Limite fixée à {CONFIG.MAX_PER_ORDER} billets maximum par commande.
                    </span>
                  </div>

                  <div id="qty-controls" className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      aria-label="Diminuer la quantité"
                      className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-[#F4F1EA] font-display text-3xl sm:text-5xl text-[#F4F1EA] hover:bg-[#C85A17] hover:border-[#C85A17] disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center justify-center cursor-pointer"
                    >
                      [ – ]
                    </button>

                    <div className="w-16 sm:w-24 text-center font-display text-4xl sm:text-6xl text-[#F4F1EA]">
                      {quantity}
                    </div>

                    <button
                      type="button"
                      onClick={incrementQuantity}
                      disabled={quantity >= CONFIG.MAX_PER_ORDER}
                      aria-label="Augmenter la quantité"
                      className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-[#F4F1EA] font-display text-3xl sm:text-5xl text-[#F4F1EA] hover:bg-[#C85A17] hover:border-[#C85A17] disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center justify-center cursor-pointer"
                    >
                      [ + ]
                    </button>
                  </div>
                </div>

                {/* Total de l'étape */}
                <div className="mt-8 pt-6 border-t-2 border-[#F4F1EA]/20 flex items-baseline justify-between">
                  <span className="font-display text-xs sm:text-base text-[#F4F1EA]/70 uppercase">
                    SOUS-TOTAL ESTIMÉ ({quantity}x {categoryName}) :
                  </span>
                  <span className="font-display text-3xl sm:text-5xl text-[#C85A17]">
                    {formatFCFA(totalPrice)}
                  </span>
                </div>
              </div>

              {/* Navigation étape */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
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
                  className="w-full sm:w-auto brut-btn px-8 sm:px-12 py-4 text-xl sm:text-2xl"
                >
                  CONTINUER VERS L'IDENTIFICATION →
                </button>
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
              className="space-y-8"
            >
              <div>
                <span className="font-display text-xs sm:text-sm text-[#C85A17] tracking-widest uppercase block mb-1">
                  ÉTAPE 03 / VÉRIFICATION
                </span>
                <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl text-[#F4F1EA] leading-none">
                  RÉCAPITULATIF
                </h1>
              </div>

              {/* Lignes en gros caractères */}
              <div className="border-4 border-[#F4F1EA] p-6 sm:p-10 bg-[#0c1c11] space-y-6">
                <div className="border-b-2 border-[#F4F1EA]/20 pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <span className="font-display text-sm text-[#F4F1EA]/60 uppercase">CATÉGORIE</span>
                  <span className="font-display text-2xl sm:text-4xl text-[#F4F1EA]">{categoryName}</span>
                </div>

                <div className="border-b-2 border-[#F4F1EA]/20 pb-4 flex items-baseline justify-between">
                  <span className="font-display text-sm text-[#F4F1EA]/60 uppercase">QUANTITÉ</span>
                  <span className="font-display text-2xl sm:text-4xl text-[#F4F1EA]">{quantity} BILLET{quantity > 1 ? 'S' : ''}</span>
                </div>

                <div className="border-b-2 border-[#F4F1EA]/20 pb-4 flex items-baseline justify-between">
                  <span className="font-display text-sm text-[#F4F1EA]/60 uppercase">PRIX UNITAIRE</span>
                  <span className="font-display text-2xl sm:text-4xl text-[#F4F1EA]">{formatFCFA(unitPrice)}</span>
                </div>

                <div className="pt-2 flex items-baseline justify-between">
                  <span className="font-display text-base sm:text-xl text-[#C85A17] uppercase">TOTAL À PAYER</span>
                  <span className="font-display text-4xl sm:text-6xl text-[#C85A17]">{formatFCFA(totalPrice)}</span>
                </div>
              </div>

              {/* Option ASK_HOLDER_NAMES : Un champ par billet */}
              {CONFIG.ASK_HOLDER_NAMES && (
                <div className="border-4 border-[#F4F1EA] p-6 sm:p-8 bg-[#142B1A]/80">
                  <div className="mb-4">
                    <h2 className="font-display text-xl sm:text-2xl text-[#F4F1EA] uppercase">
                      NOMS DES PORTEURS DES BILLETS
                    </h2>
                    <p className="font-body text-xs text-[#F4F1EA]/70 mt-1">
                      Chaque billet est strictement personnel et sera vérifié à l'entrée avec une pièce d'identité.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {Array.from({ length: quantity }).map((_, index) => (
                      <div key={index}>
                        <label
                          htmlFor={`holder-name-${index}`}
                          className="font-display text-sm text-[#F4F1EA] uppercase block mb-1"
                        >
                          BILLET 0{index + 1} · NOM COMPLET
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

              {/* Navigation étape */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="font-display text-base text-[#F4F1EA]/70 hover:text-[#C85A17] uppercase cursor-pointer"
                >
                  [ RETOUR À LA QUANTITÉ ]
                </button>

                <button
                  type="button"
                  onClick={handleNextFromStep3}
                  className="w-full sm:w-auto brut-btn px-8 sm:px-12 py-4 text-xl sm:text-2xl"
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
              className="space-y-8"
            >
              <div>
                <span className="font-display text-xs sm:text-sm text-[#C85A17] tracking-widest uppercase block mb-1">
                  ÉTAPE 04 / RÈGLEMENT SÉCURISÉ
                </span>
                <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl text-[#F4F1EA] leading-none">
                  PAIEMENT
                </h1>
                <p className="font-body text-sm text-[#F4F1EA]/80 mt-2">
                  Montant net à débiter : <strong className="text-[#C85A17] font-display text-xl sm:text-2xl">{formatFCFA(totalPrice)}</strong>
                </p>
              </div>

              {/* Choix de la méthode parmi PAYMENT_METHODS */}
              <div className="space-y-3">
                <span className="font-display text-sm text-[#F4F1EA] uppercase block mb-2">
                  SÉLECTIONNEZ VOTRE MOYEN DE RÈGLEMENT :
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {PAYMENT_METHODS.map((pm) => {
                    const isSelected = selectedPaymentMethod === pm.id;
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setSelectedPaymentMethod(pm.id)}
                        className={`border-4 p-5 text-left transition-colors cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#C85A17] bg-[#C85A17]/25 shadow-[4px_4px_0px_#C85A17]'
                            : 'border-[#F4F1EA] bg-[#0c1c11] hover:border-[#C85A17]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-display text-2xl sm:text-3xl text-[#F4F1EA]">
                            {pm.name}
                          </span>
                          {pm.badge && (
                            <span className="text-[10px] font-display bg-[#C85A17] text-[#F4F1EA] px-2 py-0.5 uppercase tracking-wider">
                              {pm.badge}
                            </span>
                          )}
                        </div>
                        <p className="font-body text-xs text-[#F4F1EA]/70 mt-2">
                          {pm.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message d'erreur de paiement */}
              {paymentError && (
                <div role="alert" className="p-4 border-2 border-[#C85A17] bg-[#C85A17]/20 text-sm font-body text-[#F4F1EA]">
                  <strong className="block font-display text-base mb-1">ÉCHEC DE LA TRANSACTION :</strong>
                  {paymentError}
                </div>
              )}

              {/* Animation pendant le traitement du paiement : barre de vagues terracotta qui défile */}
              {isProcessingPayment && (
                <div className="border-4 border-[#C85A17] p-8 bg-[#0c1c11] text-center space-y-4">
                  <h3 className="font-display text-2xl sm:text-3xl text-[#F4F1EA]">
                    TRAITEMENT DE LA TRANSACTION EN COURS...
                  </h3>
                  <p className="font-body text-xs sm:text-sm text-[#F4F1EA]/80">
                    Veuillez ne pas rafraîchir la page pendant la confirmation auprès de votre opérateur.
                  </p>
                  {/* Barre animée avec ondes terracotta défilantes */}
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

              {/* Actions de l'étape 4 */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
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
                    className="w-full sm:w-auto brut-btn px-8 sm:px-12 py-4 text-xl sm:text-2xl"
                  >
                    {isProcessingPayment ? 'RÈGLEMENT EN COURS...' : `PAYER ${formatFCFA(totalPrice)} →`}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleProcessPayment}
                    className="w-full sm:w-auto brut-btn px-8 sm:px-12 py-4 text-xl sm:text-2xl bg-[#C85A17] border-[#C85A17]"
                  >
                    [ RÉESSAYER LE PAIEMENT ]
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Barre fixe en bas sur mobile pour garder le total toujours visible */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0c1c11] border-t-4 border-[#C85A17] px-4 py-3 flex items-center justify-between pb-[calc(env(safe-area-inset-bottom,0px)+12px)]">
        <div>
          <span className="font-display text-[10px] text-[#F4F1EA]/60 uppercase block">TOTAL COMMANDE</span>
          <span className="font-display text-xl text-[#C85A17] leading-none">{formatFCFA(totalPrice)}</span>
        </div>
        <div className="font-display text-xs text-[#F4F1EA]">
          {quantity}x {categoryName}
        </div>
      </div>
    </div>
  );
};
