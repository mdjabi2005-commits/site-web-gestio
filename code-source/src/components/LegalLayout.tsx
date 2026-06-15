import { ArrowLeft } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import FooterSection from "./FooterSection";
import GestioLogo from "./GestioLogo";

interface LegalLayoutProps {
  title: string;
  description: string;
  updated: string;
  children: ReactNode;
}

const LegalLayout = ({ title, description, updated, children }: LegalLayoutProps) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} | Gestio`;
    return () => {
      document.title = previousTitle;
    };
  }, [title]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/95">
        <div className="container flex h-[72px] items-center justify-between">
          <a href="/" className="flex items-center gap-3 text-xl font-bold text-foreground no-underline">
            <GestioLogo className="h-9 w-9" />
            Gestio
          </a>
          <a href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground no-underline transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Retour au site
          </a>
        </div>
      </header>
      <main>
        <section className="border-b border-border bg-card py-14">
          <div className="container max-w-5xl">
            <p className="mb-3 text-sm font-semibold uppercase text-primary">Informations légales</p>
            <h1 className="max-w-4xl text-3xl font-bold text-foreground sm:text-5xl">{title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">{description}</p>
            <p className="mt-5 text-sm text-muted-foreground">Dernière mise à jour : {updated}</p>
          </div>
        </section>
        <article className="container max-w-5xl py-14">
          <div className="legal-content max-w-4xl">{children}</div>
        </article>
      </main>
      <FooterSection />
    </div>
  );
};

export default LegalLayout;
