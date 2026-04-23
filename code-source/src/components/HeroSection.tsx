import { Download, Play, Smartphone, Monitor, Shield } from "lucide-react";
import type { TabId } from "./MainNavigation";
import appDesktop from "@/assets/app_desktop_1.png";
import appMobile from "@/assets/app_mobile_2.png";

interface HeroSectionProps {
  onTabChange: (tab: TabId) => void;
}

const HeroSection = ({ onTabChange }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      <video
        className="absolute inset-0 w-full h-full object-cover opacity-30"
        autoPlay
        muted
        loop
        playsInline
        src="/videos/hero_loop.mp4"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-20 pb-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-left animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/30 px-4 py-2 rounded-full text-sm text-primary mb-6 cursor-pointer hover:bg-primary/25 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              Version Bêta Gratuite
            </div>

            <h1 className="text-gradient text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[1.1] mb-6">
              Vos finances, vos données, votre contrôle
            </h1>

            <p className="text-muted-foreground text-[clamp(1rem,2vw,1.25rem)] mb-10 max-w-[540px] mx-auto lg:mx-0">
              Gestio est l'application de gestion de finances personnelles qui respecte votre vie privée. Disponible sur desktop et mobile, 100% hors-ligne, sans compte.
            </p>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <button
                onClick={() => onTabChange("download")}
                className="inline-flex items-center gap-2.5 bg-gradient-cta text-cta-foreground px-8 py-4 rounded-xl font-semibold shadow-cta hover:-translate-y-1 hover:shadow-cta-hover transition-all duration-300 cursor-pointer"
              >
                <Download className="w-5 h-5" />
                Télécharger gratuitement
              </button>
              <button
                onClick={() => document.getElementById("fonctionnalites")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center gap-2.5 bg-card text-foreground border border-border px-8 py-4 rounded-xl font-semibold hover:bg-muted hover:border-primary hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <Play className="w-5 h-5" />
                Découvrir
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-border/50">
              {[
                { icon: Monitor, value: "Desktop", label: "Windows & Linux" },
                { icon: Smartphone, value: "Mobile", label: "Android & iOS" },
                { icon: Shield, value: "100%", label: "Hors-ligne" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Composition Desktop + Mobile */}
          <div className="relative animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-primary/20 rounded-3xl blur-3xl" />

              {/* Desktop screenshot - principal */}
              <div className="relative bg-card rounded-2xl p-3 border border-border/50 shadow-2xl">
                <img
                  src={appDesktop}
                  alt="Gestio Desktop - Application de gestion financière"
                  className="w-full rounded-xl"
                />
              </div>

              {/* Mobile screenshot - superposé en bas à droite */}
              <div className="absolute -bottom-8 -right-4 lg:-right-8 w-[35%] max-w-[180px]">
                <div className="bg-card rounded-2xl p-1.5 border-2 border-border/50 shadow-2xl">
                  <img
                    src={appMobile}
                    alt="Gestio Mobile - Application de gestion financière"
                    className="w-full rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;