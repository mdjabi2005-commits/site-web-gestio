import LegalLayout from "@/components/LegalLayout";

const PolitiqueConfidentialite = () => (
  <LegalLayout
    title="Politique de confidentialité"
    description="Cette politique explique quelles données Gestio utilise, pourquoi elles sont nécessaires et comment vous gardez le contrôle sur vos informations financières."
    updated="15 juin 2026"
  >
    <h2>1. Responsable du traitement</h2>
    <p>Gestio est édité par Mohamed DJABI, sous le nom Gestio / Lamom's. Pour toute question relative aux données personnelles, vous pouvez écrire à <a href="mailto:lamoms954@gmail.com">lamoms954@gmail.com</a>.</p>

    <h2>2. Fonctionnement local par défaut</h2>
    <p>L'application Gestio est conçue pour conserver les données financières sur l'appareil de l'utilisateur. Le site vitrine ne propose ni création de compte, ni formulaire de collecte, ni publicité ciblée. Une mesure d'audience facultative peut être activée avec l'accord du visiteur.</p>

    <h2>3. Connexion bancaire facultative</h2>
    <p>Lorsque l'utilisateur active volontairement la connexion bancaire, Gestio peut accéder aux informations rendues disponibles par sa banque via Enable Banking : identité du compte, IBAN, soldes, opérations, dates, montants, libellés, références et informations de contrepartie.</p>
    <p>Cette connexion poursuit uniquement les finalités suivantes : importer les mouvements demandés, présenter les comptes, détecter les transferts entre comptes et faciliter le rapprochement financier. Gestio ne demande, ne reçoit et ne conserve jamais les identifiants ou mots de passe bancaires.</p>

    <h2>4. Base légale et consentement</h2>
    <p>L'accès aux comptes repose sur la demande et le consentement explicite de l'utilisateur. L'autorisation est accordée dans l'interface sécurisée de la banque et d'Enable Banking. Elle peut être refusée ou révoquée sans empêcher l'utilisation locale des autres fonctions de Gestio.</p>

    <h2>5. Destinataires et prestataires</h2>
    <p>Enable Banking intervient pour établir la connexion réglementée avec la banque. L'établissement bancaire et Enable Banking traitent les données nécessaires à l'autorisation selon leurs propres politiques. Gestio ne vend pas les données et ne les transmet pas à des fins commerciales.</p>
    <p>Le site gestio.software est hébergé par GitHub Pages. GitHub peut traiter des journaux techniques de connexion nécessaires à l'hébergement et à la sécurité du service.</p>

    <h2>6. Conservation et sécurité</h2>
    <p>Les données importées sont conservées localement jusqu'à leur suppression par l'utilisateur. Lors d'un diagnostic demandé par l'utilisateur, une réponse bancaire brute peut être enregistrée temporairement sur son propre appareil afin de vérifier les champs disponibles. Elle n'est pas publiée.</p>
    <p>L'utilisateur reste responsable de la sécurité de son appareil et de ses sauvegardes. Gestio applique un principe de minimisation : seules les informations utiles à la fonction demandée sont traitées.</p>

    <h2>7. Vos droits</h2>
    <p>Vous pouvez demander l'accès, la rectification, l'effacement, la limitation ou la portabilité des données qui seraient traitées par Gestio, et retirer votre consentement à la connexion bancaire. Adressez votre demande à <a href="mailto:lamoms954@gmail.com">lamoms954@gmail.com</a>.</p>
    <p>Vous pouvez également gérer les consentements actifs depuis le portail Enable Banking et introduire une réclamation auprès de la <a href="https://www.cnil.fr" target="_blank" rel="noreferrer">CNIL</a>.</p>

    <h2 id="mesure-audience">8. Cookies et mesure d'audience</h2>
    <p>Avec votre accord, le site charge le conteneur Google Tag Manager GTM-PQCR4HPT afin d'activer une mesure d'audience. Cette mesure sert à connaître la fréquentation et les pages consultées pour améliorer le site. Le conteneur n'est pas chargé si vous refusez.</p>
    <p>Selon les balises de mesure configurées, Google peut recevoir des informations techniques et de navigation, notamment l'adresse IP, le type d'appareil et de navigateur, la page consultée, la date, l'heure, la provenance de la visite et des identifiants déposés dans le navigateur. Ces données ne sont pas utilisées par Gestio pour de la publicité ciblée.</p>
    <p>Votre choix est enregistré localement dans votre navigateur et peut être modifié à tout moment avec le lien « Gérer les cookies » présent en bas du site. En cas de retrait, les balises ne seront plus chargées lors des visites suivantes et Gestio tentera de supprimer les cookies Google Analytics accessibles depuis son domaine.</p>
    <p>Google traite ces informations selon sa propre <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">politique de confidentialité</a>. Les composants techniques de GitHub Pages peuvent également traiter les informations strictement nécessaires à la livraison et à la protection du site.</p>

    <h2>9. Évolution de cette politique</h2>
    <p>Cette politique sera mise à jour si les fonctions de Gestio, les prestataires utilisés ou les modalités de traitement changent. La date de mise à jour figure en haut de la page.</p>
  </LegalLayout>
);

export default PolitiqueConfidentialite;
