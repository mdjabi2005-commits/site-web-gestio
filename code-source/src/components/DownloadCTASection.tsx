import { Download, ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import type { TabId } from "./MainNavigation";

interface DownloadCTASectionProps {
  onTabChange: (tab: TabId) => void;
}

const DownloadCTASection = ({ onTabChange }: DownloadCTASectionProps) => (
  <section className="py-20 bg-gradient-download">
    <div className="container">
      <Reveal>
        <div className="bg-gradient-primary rounded-3xl p-10 md:p-14 text-center">
          <h2 className="text-primary-foreground text-[clamp(1.75rem,3vw,2.5rem)] font-bold mb-4">
            Prêt à reprendre le contrôle de vos finances ?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-[500px] mx-auto">
            Téléchargez Gestio gratuitement en quelques secondes. Aucune inscription requise.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => onTabChange("download")}
              className="inline-flex items-center gap-2.5 bg-primary-foreground text-primary px-8 py-4 rounded-xl font-semibold shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all cursor-pointer"
            >
              <Download className="w-5 h-5" />
              Télécharger maintenant
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onTabChange("mobile")}
              className="inline-flex items-center gap-2.5 bg-primary-foreground/15 border border-primary-foreground/30 text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:bg-primary-foreground/25 transition-all cursor-pointer"
            >
              <span className="text-2xl">📱</span>
              Découvrir la version mobile
            </button>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

export default DownloadCTASection;
