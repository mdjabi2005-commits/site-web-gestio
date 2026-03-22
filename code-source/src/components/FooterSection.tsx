import GestioLogo from "./GestioLogo";
import { ExternalLink } from "lucide-react";

const FooterSection = () => (
  <footer className="bg-card border-t border-border pt-12 pb-8">
    <div className="container">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
        <div className="lg:col-span-2">
          <a href="#" className="flex items-center gap-3 text-2xl font-bold text-foreground no-underline mb-4">
            <GestioLogo />
            Gestio
          </a>
          <p className="text-muted-foreground text-[0.9375rem] leading-relaxed">
            L'application de gestion de finances personnelles qui respecte votre vie privée. Disponible sur desktop et mobile, 100% hors-ligne, sans compte.
          </p>
        </div>
        <div>
          <h4 className="text-foreground text-sm font-semibold uppercase tracking-wider mb-4">Navigation</h4>
          <ul className="space-y-2 list-none">
            {["Fonctionnalités", "Mobile", "Services", "Aperçu", "Télécharger"].map((l) => (
              <li key={l}>
                <a href={`#${l.toLowerCase().replace(/é/g, "e").replace(/ç/g, "c")}`} className="text-muted-foreground hover:text-primary transition-colors text-[0.9375rem] no-underline">
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-foreground text-sm font-semibold uppercase tracking-wider mb-4">Freelance</h4>
          <ul className="space-y-2 list-none">
            <li>
              <a 
                href="https://www.malt.fr/profile/mohameddjabi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors text-[0.9375rem] no-underline flex items-center gap-1"
              >
                Malt <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              <a 
                href="https://comeup.com/fr/@lamoms" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors text-[0.9375rem] no-underline flex items-center gap-1"
              >
                ComeUp <ExternalLink className="w-3 h-3" />
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-foreground text-sm font-semibold uppercase tracking-wider mb-4">Contact</h4>
          <ul className="space-y-2 list-none">
            <li><a href="mailto:lamoms954@gmail.com" className="text-muted-foreground hover:text-primary transition-colors text-[0.9375rem] no-underline">lamoms954@gmail.com</a></li>
          </ul>
        </div>
      </div>
      <div className="pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-muted-foreground text-sm">© 2024 Gestio par Lamom's. Tous droits réservés.</p>
        <div className="flex gap-4">
          <a href="#cgu" className="text-muted-foreground hover:text-primary transition-colors text-sm no-underline">Conditions d'utilisation</a>
          <a href="#confidentialite" className="text-muted-foreground hover:text-primary transition-colors text-sm no-underline">Politique de confidentialité</a>
        </div>
      </div>
    </div>
  </footer>
);

export default FooterSection;
