import { Monitor, Smartphone } from "lucide-react";
import Reveal from "./Reveal";
import type { TabId } from "./MainNavigation";
import appDesktop from "@/assets/app_desktop_1.png";
import appMobile from "@/assets/app_mobile_2.png";

interface DownloadCTASectionProps {
  onTabChange: (tab: TabId) => void;
}

const DownloadCTASection = ({ onTabChange }: DownloadCTASectionProps) => (
  <section className="py-20 bg-gradient-download">
    <div className="container">
      <Reveal>
        <div className="bg-gradient-primary rounded-3xl p-10 md:p-14 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="text-center lg:text-left">
              <h2 className="text-primary-foreground text-[clamp(1.75rem,3vw,2.5rem)] font-bold mb-4">
                Simplifiez vos finances en moins d'une minute
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-8 max-w-[500px] mx-auto lg:mx-0">
                L'application est légère, gratuite et prête à l'emploi. Commencez à budgétiser sereinement.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => onTabChange("download")}
                  className="inline-flex items-center gap-2.5 bg-primary-foreground text-primary px-8 py-4 rounded-xl font-semibold shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all cursor-pointer"
                >
                  <Monitor className="w-5 h-5" />
                  Obtenir Gestio pour PC
                </button>
                <button
                  onClick={() => onTabChange("mobile")}
                  className="inline-flex items-center gap-2.5 bg-primary-foreground/15 border border-primary-foreground/30 text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:bg-primary-foreground/25 transition-all cursor-pointer"
                >
                  <Smartphone className="w-5 h-5" />
                  Voir la version Mobile
                </button>
              </div>
            </div>

            <div className="relative flex items-end justify-center lg:justify-end min-h-[280px] md:min-h-[340px]">
              <div className="relative w-[85%] lg:w-[90%] rounded-xl overflow-hidden shadow-2xl border border-white/10">
                <img
                  src={appDesktop}
                  alt="Gestio version Desktop"
                  className="w-full h-auto rounded-xl"
                />
              </div>
              <div className="absolute -bottom-4 -right-2 md:right-4 w-[28%] max-w-[130px] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20">
                <div className="absolute inset-0 bg-primary/20 blur-xl" />
                <img
                  src={appMobile}
                  alt="Gestio version Mobile"
                  className="relative w-full h-auto rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

export default DownloadCTASection;