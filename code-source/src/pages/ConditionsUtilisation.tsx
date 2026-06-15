import LegalLayout from "@/components/LegalLayout";

const ConditionsUtilisation = () => (
  <LegalLayout
    title="Conditions générales d'utilisation"
    description="Les présentes conditions encadrent l'accès au site Gestio et l'utilisation personnelle de l'application de gestion financière."
    updated="15 juin 2026"
  >
    <h2>1. Objet</h2>
    <p>Gestio est un outil de suivi et d'organisation des finances personnelles. Il permet notamment de saisir ou d'importer des opérations, de consulter des synthèses et, lorsque l'utilisateur l'autorise, de connecter certains comptes bancaires.</p>

    <h2>2. Acceptation</h2>
    <p>L'utilisation du site ou de l'application implique l'acceptation des présentes conditions. La connexion bancaire reste facultative et fait l'objet d'un consentement distinct auprès de la banque et d'Enable Banking.</p>

    <h2>3. Usage autorisé</h2>
    <p>Gestio est destiné à un usage personnel, licite et conforme aux droits des tiers. L'utilisateur s'engage à connecter uniquement des comptes qu'il est autorisé à consulter et à ne pas détourner le service pour accéder aux données d'une autre personne.</p>

    <h2>4. Connexion bancaire</h2>
    <p>Gestio ne collecte jamais les identifiants bancaires. L'authentification est réalisée par l'établissement bancaire dans son propre environnement. Les informations accessibles, leur niveau de détail et la profondeur de l'historique dépendent de chaque banque et du prestataire Enable Banking.</p>
    <p>Les rapprochements automatiques sont des aides à la lecture. Lorsqu'une opération reste ambiguë, Gestio la signale au lieu d'inventer une origine ou une destination.</p>

    <h2>5. Responsabilité de l'utilisateur</h2>
    <p>L'utilisateur vérifie l'exactitude des données importées, conserve ses justificatifs et effectue les sauvegardes nécessaires. Il lui appartient de protéger l'accès à son appareil et de révoquer une autorisation bancaire devenue inutile.</p>

    <h2>6. Limites du service</h2>
    <p>Gestio est fourni en l'état et peut évoluer. Aucune disponibilité permanente ni absence totale d'erreur n'est garantie. Les données présentées ne constituent ni un conseil financier, fiscal, juridique ou comptable, ni un service d'initiation de paiement.</p>
    <p>Gestio ne peut être tenu responsable d'une décision prise sans vérification auprès du relevé bancaire, de la banque ou d'un professionnel compétent.</p>

    <h2>7. Services tiers</h2>
    <p>Certaines fonctions reposent sur des services tiers, notamment GitHub Pages pour le site et Enable Banking pour la connexion bancaire. Leur disponibilité et leurs propres conditions peuvent affecter les fonctions correspondantes.</p>

    <h2>8. Propriété intellectuelle</h2>
    <p>Le nom Gestio, l'identité visuelle, les textes et le logiciel restent protégés par les droits applicables et par la licence éventuellement fournie avec le code. Toute réutilisation doit respecter cette licence et les droits de leurs auteurs.</p>

    <h2>9. Suspension et évolution</h2>
    <p>L'éditeur peut modifier, suspendre ou retirer une fonction pour des raisons de sécurité, de conformité ou de maintenance. Les présentes conditions peuvent être adaptées ; leur date de mise à jour est indiquée en haut de cette page.</p>

    <h2>10. Droit applicable et contact</h2>
    <p>Les présentes conditions sont soumises au droit français. Toute question ou réclamation peut être adressée à <a href="mailto:lamoms954@gmail.com">lamoms954@gmail.com</a>. Une résolution amiable sera recherchée avant toute procédure.</p>
  </LegalLayout>
);

export default ConditionsUtilisation;
