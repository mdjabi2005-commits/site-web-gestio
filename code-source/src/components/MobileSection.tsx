import { Smartphone, Zap, Wifi, Shield, Download } from "lucide-react";
import Reveal from "./Reveal";
import mobileScreenshot1 from "@/assets/app_mobile_1.png";
import mobileScreenshot2 from "@/assets/app_mobile_2.png";

const features = [
  { icon: Smartphone, title: "Interface adaptée", desc: "Design responsive optimisé pour smartphones et tablettes." },
  { icon: Zap, title: "Installation rapide", desc: "Application APK légère - installez en quelques secondes." },
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
          <div className="flex flex-wrap gap-4 justify-center mt-6">
            <a
              href="https://gestio.software/mobile"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold shadow-primary hover:-translate-y-1 hover:shadow-primary-hover transition-all no-underline cursor-pointer"
            >
              <Smartphone className="w-5 h-5" />
              Découvrir
            </a>
            <a
              href="https://github.com/mdjabi2005-commits/gestio-mobile/releases/latest/download/gestio-mobile-latest.apk"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-cta text-cta-foreground px-8 py-4 rounded-xl font-semibold shadow-cta hover:-translate-y-1 hover:shadow-cta-hover transition-all no-underline cursor-pointer"
            >
              <Download className="w-5 h-5" />
              Installer l'APK
            </a>
          </div>
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
        </Reveal>
      </div>
    </div>
  </section>
);

export default MobileSection;