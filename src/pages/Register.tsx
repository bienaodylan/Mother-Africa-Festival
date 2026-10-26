/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';

interface RegisterProps {
  go: (route: string) => void;
  nextRoute?: string;
}

export const Register: React.FC<RegisterProps> = ({ go, nextRoute = '/billets/commande' }) => {
  const { register } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    password?: string;
    general?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs: typeof errors = {};

    if (!firstName.trim()) {
      errs.firstName = 'Veuillez renseigner votre prénom.';
    }
    if (!lastName.trim()) {
      errs.lastName = 'Veuillez renseigner votre nom.';
    }
    if (!email.trim()) {
      errs.email = 'Veuillez saisir votre adresse email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Format d’adresse email invalide.';
    }
    if (!phone.trim()) {
      errs.phone = 'Veuillez renseigner votre numéro de téléphone (WhatsApp).';
    } else if (phone.trim().length < 8) {
      errs.phone = 'Numéro de téléphone incomplet.';
    }
    if (!password) {
      errs.password = 'Veuillez définir un mot de passe.';
    } else if (password.length < 8) {
      errs.password = 'Le mot de passe doit comporter au moins 8 caractères.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      await register({
        firstName,
        lastName,
        email,
        phone,
        password
      });
      // Redirection après inscription
      go(nextRoute || '/billets/commande');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Échec de la création du compte.';
      setErrors({ general: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex flex-col justify-center px-4 sm:px-8 lg:px-12 py-8 max-w-xl mx-auto select-none">
      {/* Titre INSCRIPTION */}
      <div className="mb-8">
        <span className="font-display text-xs sm:text-sm text-[#C85A17] tracking-widest uppercase block mb-1">
          NOUVEAU FESTIVALIER
        </span>
        <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl text-[#F4F1EA] leading-none">
          INSCRIPTION
        </h1>
        <p className="font-body text-sm sm:text-base text-[#F4F1EA]/80 mt-2">
          Créez votre profil pour réserver et retrouver vos billets nominatifs en quelques secondes.
        </p>
      </div>

      {/* Message d'erreur général */}
      {errors.general && (
        <div
          role="alert"
          className="mb-6 p-4 border-2 border-[#C85A17] bg-[#C85A17]/20 font-body text-sm text-[#F4F1EA]"
        >
          {errors.general}
        </div>
      )}

      {/* Formulaire d'inscription */}
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Prénom & Nom */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="reg-firstname"
              className="font-display text-base sm:text-lg text-[#F4F1EA] uppercase block mb-1.5"
            >
              PRÉNOM
            </label>
            <input
              id="reg-firstname"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              aria-invalid={!!errors.firstName}
              aria-describedby={errors.firstName ? 'reg-firstname-error' : undefined}
              className={`w-full px-4 py-3 bg-transparent border-4 text-[#F4F1EA] font-body text-base placeholder-[#F4F1EA]/40 transition-colors ${
                errors.firstName
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-[#F4F1EA] focus:border-[#C85A17]'
              } focus:outline-none`}
              placeholder="KOFFI"
              autoComplete="given-name"
            />
            {errors.firstName && (
              <p id="reg-firstname-error" className="font-body text-xs text-[#C85A17] mt-1 font-bold">
                {errors.firstName}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="reg-lastname"
              className="font-display text-base sm:text-lg text-[#F4F1EA] uppercase block mb-1.5"
            >
              NOM
            </label>
            <input
              id="reg-lastname"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              aria-invalid={!!errors.lastName}
              aria-describedby={errors.lastName ? 'reg-lastname-error' : undefined}
              className={`w-full px-4 py-3 bg-transparent border-4 text-[#F4F1EA] font-body text-base placeholder-[#F4F1EA]/40 transition-colors ${
                errors.lastName
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-[#F4F1EA] focus:border-[#C85A17]'
              } focus:outline-none`}
              placeholder="KOUASSI"
              autoComplete="family-name"
            />
            {errors.lastName && (
              <p id="reg-lastname-error" className="font-body text-xs text-[#C85A17] mt-1 font-bold">
                {errors.lastName}
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="reg-email"
            className="font-display text-base sm:text-lg text-[#F4F1EA] uppercase block mb-1.5"
          >
            ADRESSE EMAIL
          </label>
          <input
            id="reg-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'reg-email-error' : undefined}
            className={`w-full px-4 py-3 bg-transparent border-4 text-[#F4F1EA] font-body text-base placeholder-[#F4F1EA]/40 transition-colors ${
              errors.email
                ? 'border-red-500 focus:border-red-500'
                : 'border-[#F4F1EA] focus:border-[#C85A17]'
            } focus:outline-none`}
            placeholder="koffi.kouassi@exemple.ci"
            autoComplete="email"
          />
          {errors.email && (
            <p id="reg-email-error" className="font-body text-xs text-[#C85A17] mt-1 font-bold">
              {errors.email}
            </p>
          )}
        </div>

        {/* Téléphone WhatsApp */}
        <div>
          <label
            htmlFor="reg-phone"
            className="font-display text-base sm:text-lg text-[#F4F1EA] uppercase block mb-1.5"
          >
            TÉLÉPHONE (WHATSAPP)
          </label>
          <input
            id="reg-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'reg-phone-error' : undefined}
            className={`w-full px-4 py-3 bg-transparent border-4 text-[#F4F1EA] font-body text-base placeholder-[#F4F1EA]/40 transition-colors ${
              errors.phone
                ? 'border-red-500 focus:border-red-500'
                : 'border-[#F4F1EA] focus:border-[#C85A17]'
            } focus:outline-none`}
            placeholder="+225 07 XX XX XX XX"
            autoComplete="tel"
          />
          {errors.phone && (
            <p id="reg-phone-error" className="font-body text-xs text-[#C85A17] mt-1 font-bold">
              {errors.phone}
            </p>
          )}
        </div>

        {/* Mot de passe */}
        <div>
          <label
            htmlFor="reg-password"
            className="font-display text-base sm:text-lg text-[#F4F1EA] uppercase block mb-1.5"
          >
            MOT DE PASSE (MIN. 8 CARACTÈRES)
          </label>
          <input
            id="reg-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'reg-password-error' : undefined}
            className={`w-full px-4 py-3 bg-transparent border-4 text-[#F4F1EA] font-body text-base placeholder-[#F4F1EA]/40 transition-colors ${
              errors.password
                ? 'border-red-500 focus:border-red-500'
                : 'border-[#F4F1EA] focus:border-[#C85A17]'
            } focus:outline-none`}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          {errors.password && (
            <p id="reg-password-error" className="font-body text-xs text-[#C85A17] mt-1 font-bold">
              {errors.password}
            </p>
          )}
        </div>

        {/* Bouton de Soumission */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full brut-btn py-4 text-xl sm:text-2xl"
          >
            {isSubmitting ? 'CRÉATION DU COMPTE...' : '[ CRÉER MON COMPTE ET CONTINUER ]'}
          </button>
        </div>
      </form>

      {/* Déjà un compte ? */}
      <div className="mt-8 pt-6 border-t border-[#F4F1EA]/25 text-center">
        <p className="font-body text-sm text-[#F4F1EA]/80 mb-3">
          Vous possédez déjà un compte festivalier ?
        </p>
        <button
          type="button"
          onClick={() => go(`/compte/connexion${nextRoute ? `?next=${encodeURIComponent(nextRoute)}` : ''}`)}
          className="font-display text-lg sm:text-xl text-[#C85A17] hover:underline uppercase cursor-pointer"
        >
          [ SE CONNECTER À MON COMPTE ]
        </button>
      </div>
    </div>
  );
};
