import { useEffect, useState } from "react";
import {
  ANALYTICS_CONSENT_KEY,
  OPEN_ANALYTICS_CONSENT_EVENT,
} from "@/lib/analyticsConsent";

const GTM_ID = "GTM-PQCR4HPT";

type ConsentChoice = "accepted" | "refused";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

const loadGoogleTagManager = () => {
  if (document.getElementById("gestio-gtm")) return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(["consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  }]);
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });

  const script = document.createElement("script");
  script.id = "gestio-gtm";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(script);
};

const clearAnalyticsCookies = () => {
  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0].trim();
    if (name.startsWith("_ga") || name === "_gid" || name === "_gat") {
      document.cookie = `${name}=; Max-Age=0; path=/`;
      document.cookie = `${name}=; Max-Age=0; path=/; domain=.gestio.software`;
    }
  });
};

const getStoredChoice = (): ConsentChoice | null => {
  try {
    return (window.localStorage?.getItem(ANALYTICS_CONSENT_KEY) as ConsentChoice | null | undefined) ?? null;
  } catch {
    return null;
  }
};

const storeChoice = (choice: ConsentChoice) => {
  try {
    window.localStorage?.setItem(ANALYTICS_CONSENT_KEY, choice);
  } catch {
    // Some browsers or embedded views disable localStorage. The live choice still applies.
  }
};

const AnalyticsConsent = () => {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const storedChoice = getStoredChoice();
    if (storedChoice !== null) setIsOpen(false);
    if (storedChoice === "accepted") loadGoogleTagManager();

    const reopen = () => setIsOpen(true);
    window.addEventListener(OPEN_ANALYTICS_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(OPEN_ANALYTICS_CONSENT_EVENT, reopen);
  }, []);

  const saveChoice = (nextChoice: ConsentChoice) => {
    const wasLoaded = Boolean(document.getElementById("gestio-gtm"));
    storeChoice(nextChoice);
    setIsOpen(false);

    if (nextChoice === "accepted") {
      loadGoogleTagManager();
      return;
    }

    clearAnalyticsCookies();
    if (wasLoaded) window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <section
      aria-label="Choix de mesure d'audience"
      className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-3xl border border-border bg-card p-5 shadow-2xl sm:p-6"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <h2 className="mb-2 text-lg font-semibold text-foreground">Mesure d'audience</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Gestio souhaite utiliser Google Tag Manager pour mesurer les visites et améliorer le site. Aucun outil de mesure n'est chargé sans votre accord.
          </p>
          <a href="/confidentialite#mesure-audience" className="mt-2 inline-block text-sm text-primary underline underline-offset-4">
            En savoir plus
          </a>
        </div>
        <div className="grid shrink-0 grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => saveChoice("refused")}
            className="min-h-11 border border-border px-5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Refuser
          </button>
          <button
            type="button"
            onClick={() => saveChoice("accepted")}
            className="min-h-11 bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Accepter
          </button>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsConsent;
