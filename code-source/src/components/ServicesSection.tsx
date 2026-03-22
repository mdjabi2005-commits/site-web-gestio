import { Monitor, Smartphone, ExternalLink } from "lucide-react";
import Reveal from "./Reveal";

const services = [
  {
    icon: Monitor,
    title: "Création Application Desktop",
    desc: "Développement d'applications de gestion financière sur mesure avec Python, Streamlit et SQLite. Interface complète avec graphiques, OCR et import de données.",
    platforms: ["Windows", "macOS", "Linux"],
  },
  {
    icon: Smartphone,
    title: "Création Application Mobile",
    desc: "Applications mobiles hybrides avec React Native ou PWA. Synchronisation offline, interface intuitive et sécurisée pour vos projets.",
    platforms: ["Android", "iOS", "PWA"],
  },
];

const servicesSection = () => (
  <section className="py-[60px] bg-card" id="services">
    <div className="container">
      <Reveal>
        <div className="text-center max-w-[700px] mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-primary text-sm font-semibold uppercase tracking-wider mb-4">
            Mes Services
          </div>
          <h2 className="text-foreground text-[clamp(2rem,4vw,3rem)] font-bold mb-4">
            Développement sur mesure
          </h2>
          <p className="text-muted-foreground text-lg">
            Je développe des applications de gestion financière personnalisées, basées sur le même savoir-faire que Gestio.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {services.map((s, i) => (
          <Reveal key={s.title} delay={i * 100}>
            <div className="bg-background border border-border rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 hover:border-primary hover:shadow-[0_24px_48px_rgba(0,0,0,0.3)] h-full">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <s.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-foreground text-2xl font-semibold mb-4">{s.title}</h3>
              <p className="text-muted-foreground text-[0.9375rem] leading-relaxed mb-6">{s.desc}</p>
              <div className="flex flex-wrap gap-2">
                {s.platforms.map((p) => (
                  <span key={p} className="inline-flex items-center gap-1 bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div className="bg-gradient-primary rounded-2xl p-8 md:p-12 text-center">
          <h3 className="text-primary-foreground text-2xl font-bold mb-4">
            Envie de discuter de votre projet ?
          </h3>
          <p className="text-primary-foreground/80 mb-8 max-w-[600px] mx-auto">
            Contactez-moi pour un devis gratuit. Je suis disponible pour des projets de développement d'applications web et mobile.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="https://www.malt.fr/profile/mohameddjabi"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary-foreground text-primary px-8 py-4 rounded-xl font-semibold shadow-primary hover:-translate-y-1 hover:shadow-primary-hover transition-all no-underline"
            >
              <ExternalLink className="w-5 h-5" />
              Profil Malt
            </a>
            <a
              href="https://comeup.com/fr/@lamoms"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary-foreground text-primary px-8 py-4 rounded-xl font-semibold shadow-primary hover:-translate-y-1 hover:shadow-primary-hover transition-all no-underline"
            >
              <ExternalLink className="w-5 h-5" />
              Profil ComeUp
            </a>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

export default servicesSection;
