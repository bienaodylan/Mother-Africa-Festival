/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';

interface LoginProps {
  go: (route: string) => void;
  nextRoute?: string;
}

export const Login: React.FC<LoginProps> = ({ go, nextRoute = '/billets/commande' }) => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Écran simulé « Mot de passe oublié »
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = 'Veuillez saisir votre adresse email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Format d’adresse email invalide.';
    }

    if (!password) {
      newErrors.password = 'Veuillez renseigner votre mot de passe.';
    } else if (password.length < 8) {
      newErrors.password = 'Le mot de passe doit comporter au moins 8 caractères.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      await login(email, password);
      // Redirection vers la route souhaitée ou retour au panier
      go(nextRoute || '/billets/commande');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Échec de la connexion.';
      setErrors({ general: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    try {
      await api.requestPasswordReset(forgotEmail);
      setResetSuccess(true);
    } catch {
      setResetSuccess(true);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex flex-col justify-center px-4 sm:px-8 lg:px-12 py-8 max-w-xl mx-auto select-none">
      {!showForgotPassword ? (
        <div>
          {/* Titre CONNEXION */}
          <div className="mb-8">
            <span className="font-display text-xs sm:text-sm text-[#C85A17] tracking-widest uppercase block mb-1">
              ESPACE MEMBRE · MOTHER AFRICA
            </span>
            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl text-[#F4F1EA] leading-none">
              CONNEXION
            </h1>
            <p className="font-body text-sm sm:text-base text-[#F4F1EA]/80 mt-2">
              Un compte est nécessaire pour sécuriser vos billets nominatifs et générer vos QR codes.
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

          {/* Formulaire de connexion */}
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Champ Email */}
            <div>
              <label
                htmlFor="login-email"
                className="font-display text-lg sm:text-xl text-[#F4F1EA] uppercase block mb-2"
              >
                ADRESSE EMAIL
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'login-email-error' : undefined}
                className={`w-full px-4 py-3.5 bg-transparent border-4 text-[#F4F1EA] font-body text-base placeholder-[#F4F1EA]/40 transition-colors ${
                  errors.email
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-[#F4F1EA] focus:border-[#C85A17]'
                } focus:outline-none`}
                placeholder="votre.email@domaine.com"
                autoComplete="email"
              />
              {errors.email && (
                <p id="login-email-error" className="font-body text-xs text-[#C85A17] mt-1.5 font-bold">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Champ Mot de Passe */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="login-password"
                  className="font-display text-lg sm:text-xl text-[#F4F1EA] uppercase block"
                >
                  MOT DE PASSE
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="font-body text-xs text-[#C85A17] hover:underline uppercase tracking-wider cursor-pointer"
                >
                  MOT DE PASSE OUBLIÉ ?
                </button>
              </div>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'login-password-error' : undefined}
                className={`w-full px-4 py-3.5 bg-transparent border-4 text-[#F4F1EA] font-body text-base placeholder-[#F4F1EA]/40 transition-colors ${
                  errors.password
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-[#F4F1EA] focus:border-[#C85A17]'
                } focus:outline-none`}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {errors.password && (
                <p id="login-password-error" className="font-body text-xs text-[#C85A17] mt-1.5 font-bold">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Bouton de Soumission */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full brut-btn py-4 text-xl sm:text-2xl"
              >
                {isSubmitting ? 'VÉRIFICATION EN COURS...' : '[ SE CONNECTER ]'}
              </button>
            </div>
          </form>

          {/* Lien vers Inscription */}
          <div className="mt-8 pt-6 border-t border-[#F4F1EA]/25 text-center">
            <p className="font-body text-sm text-[#F4F1EA]/80 mb-3">
              Vous n'avez pas encore de compte festivalier ?
            </p>
            <button
              type="button"
              onClick={() => go(`/compte/inscription${nextRoute ? `?next=${encodeURIComponent(nextRoute)}` : ''}`)}
              className="font-display text-lg sm:text-xl text-[#C85A17] hover:underline uppercase cursor-pointer"
            >
              [ CRÉER MON COMPTE EN 1 MINUTE ]
            </button>
          </div>
        </div>
      ) : (
        /* Écran simulé Mot de Passe Oublié */
        <div className="border-4 border-[#F4F1EA] p-6 sm:p-10 bg-[#0c1c11]">
          <h2 className="font-display text-3xl sm:text-5xl text-[#F4F1EA] leading-tight mb-2">
            RÉCUPÉRATION DU COMPTE
          </h2>
          <p className="font-body text-xs sm:text-sm text-[#F4F1EA]/80 mb-6">
            Entrez votre adresse email. Un lien de réinitialisation sécurisé vous sera transmis immédiatement.
          </p>

          {!resetSuccess ? (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="forgot-email" className="font-display text-sm text-[#F4F1EA] uppercase block mb-1">
                  EMAIL DU COMPTE
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-transparent border-4 border-[#F4F1EA] text-[#F4F1EA] font-body text-sm focus:border-[#C85A17] focus:outline-none"
                  placeholder="votre.email@domaine.com"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button type="submit" className="flex-1 brut-btn py-3 text-base">
                  ENVOYER LE LIEN
                </button>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="py-3 px-4 font-display text-sm text-[#F4F1EA]/80 hover:text-[#C85A17] uppercase"
                >
                  RETOUR
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 border-2 border-[#C85A17] bg-[#C85A17]/20 font-body text-xs sm:text-sm text-[#F4F1EA]">
                Un email de réinitialisation fictif a été généré pour <strong>{forgotEmail}</strong>. (Simulation d'environnement de test).
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetSuccess(false);
                }}
                className="w-full brut-btn py-3 text-base"
              >
                RETOUR À LA CONNEXION
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
