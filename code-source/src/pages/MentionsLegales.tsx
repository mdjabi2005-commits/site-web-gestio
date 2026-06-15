import LegalLayout from "@/components/LegalLayout";

const MentionsLegales = () => (
  <LegalLayout
    title="Mentions légales"
    description="Informations relatives à l'édition, à la publication et à l'hébergement du site gestio.software."
    updated="15 juin 2026"
  >
    <h2>Éditeur du site</h2>
    <p><strong>Nom :</strong> Mohamed DJABI</p>
    <p><strong>Projet et nom d'usage :</strong> Gestio / Lamom's</p>
    <p><strong>Nature :</strong> projet logiciel indépendant diffusé à titre gratuit</p>
    <p><strong>Contact :</strong> <a href="mailto:lamoms954@gmail.com">lamoms954@gmail.com</a></p>

    <h2>Direction de la publication</h2>
    <p>Le directeur de la publication est Mohamed DJABI.</p>

    <h2>Hébergement</h2>
    <p>Le site est hébergé par GitHub Pages, service de GitHub, Inc.</p>
    <p>GitHub, Inc.<br />88 Colin P. Kelly Jr. Street<br />San Francisco, CA 94107<br />États-Unis</p>
    <p>Site de l'hébergeur : <a href="https://github.com" target="_blank" rel="noreferrer">github.com</a></p>

    <h2>Propriété intellectuelle</h2>
    <p>Sauf mention contraire, les contenus du site, la marque d'usage Gestio, les éléments graphiques et les textes appartiennent à leur auteur. Les bibliothèques et composants tiers restent soumis à leurs licences respectives.</p>

    <h2>Signalement et contact</h2>
    <p>Pour signaler une erreur, un problème de sécurité, une atteinte à un droit ou un contenu illicite, écrivez à <a href="mailto:lamoms954@gmail.com">lamoms954@gmail.com</a> en précisant l'URL et la nature de la demande.</p>

    <h2>Données personnelles</h2>
    <p>Les modalités de traitement des données et de connexion bancaire sont décrites dans la <a href="/confidentialite">politique de confidentialité</a>.</p>
  </LegalLayout>
);

export default MentionsLegales;
