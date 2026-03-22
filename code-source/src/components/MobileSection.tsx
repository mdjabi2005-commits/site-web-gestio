import { Smartphone, Zap, Wifi, Shield } from "lucide-react";
import Reveal from "./Reveal";
import mobileScreenshot1 from "@/assets/Screenshot_20260321_093256.png";
import mobileScreenshot2 from "@/assets/Screenshot_20260321_093321.png";

const features = [
  { icon: Smartphone, title: "Interface adaptée", desc: "Design responsive optimisé pour smartphones et tablettes." },
  { icon: Zap, title: "Installation rapide", desc: "Progressive Web App (PWA) - installez directement depuis votre navigateur." },
  { icon: Wifi, title: "Fonctionne hors-ligne", desc: "Accédez à vos données sans connexion internet." },
  { icon: Shield, title: "Données sécurisées", desc: "Chiffrement local - vos finances restent sur votre appareil." },
];

const MobileSection = () => (
  <section className="py-[60px] bg-gradient-subtle" id="mobile">
    <div className="container">
      <Reveal>
        <div className="text-center max-w-[700px] mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-primary text-sm font-semibold uppercase tracking-wider mb-4">
            Application Mobile
          </div>
          <h2 className="text-foreground text-[clamp(2rem,4vw,3rem)] font-bold mb-4">
            Gestio dans votre poche
          </h2>
          <p className="text-muted-foreground text-lg">
            Emportez vos finances partout avec vous. L'application mobile Gestio offre la même expérience complète que la version desktop.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <Reveal>
          <div className="grid grid-cols-2 gap-4">
            <img 
              src={mobileScreenshot1} 
              alt="Gestio Mobile - Dashboard" 
              className="rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.5)] border border-border" 
              loading="lazy" 
            />
            <img 
              src={mobileScreenshot2} 
              alt="Gestio Mobile - Transactions" 
              className="rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.5)] border border-border mt-8" 
              loading="lazy" 
            />
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div className="space-y-8">
            {features.map((f) => (
              <div key={f.title} className="flex gap-4">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-foreground text-xl font-semibold mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-[0.9375rem]">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-primary/10 border border-primary/20 rounded-2xl p-6 mt-4">
            <h3 className="text-foreground text-xl font-semibold mb-6 text-center">
              Comment installer Gestio sur votre téléphone ?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card/80 rounded-xl p-5 border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">📱</span>
                  <h4 className="text-foreground text-lg font-semibold">iPhone / iPad</h4>
                  <span className="text-xs text-muted-foreground ml-auto">(Safari)</span>
                </div>
                <ol className="space-y-3">
                  <li className="flex gap-3 items-start">
                    <span className="bg-primary/20 text-primary text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">1</span>
                    <p className="text-muted-foreground text-sm">Appuyez sur le bouton <strong className="text-foreground">Partager</strong> (carré avec flèche vers le haut)</p>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="bg-primary/20 text-primary text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">2</span>
                    <p className="text-muted-foreground text-sm">Faites défiler et sélectionnez <strong className="text-foreground">« Sur l'écran d'accueil »</strong></p>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="bg-primary/20 text-primary text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">3</span>
                    <p className="text-muted-foreground text-sm">Appuyez sur <strong className="text-foreground">« Ajouter »</strong> en haut à droite</p>
                  </li>
                </ol>
              </div>

              <div className="bg-card/80 rounded-xl p-5 border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">🤖</span>
                  <h4 className="text-foreground text-lg font-semibold">Android</h4>
                  <span className="text-xs text-muted-foreground ml-auto">(Chrome)</span>
                </div>
                <ol className="space-y-3">
                  <li className="flex gap-3 items-start">
                    <span className="bg-primary/20 text-primary text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">1</span>
                    <p className="text-muted-foreground text-sm">Appuyez sur le <strong className="text-foreground">menu</strong> (3 points en haut à droite)</p>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="bg-primary/20 text-primary text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">2</span>
                    <p className="text-muted-foreground text-sm">Sélectionnez <strong className="text-foreground">« Ajouter à l'écran d'accueil »</strong> ou <strong className="text-foreground">« Installer l'application »</strong></p>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="bg-primary/20 text-primary text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">3</span>
                    <p className="text-muted-foreground text-sm">Appuyez sur <strong className="text-foreground">« Ajouter »</strong> ou <strong className="text-foreground">« Installer »</strong></p>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

export default MobileSection;
