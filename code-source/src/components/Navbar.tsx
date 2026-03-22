import { useState } from "react";
import GestioLogo from "./GestioLogo";
import { Download, Menu, X } from "lucide-react";

const navLinks = [
  { label: "Fonctionnalités", href: "#fonctionnalites" },
  { label: "Mobile", href: "#mobile" },
  { label: "Services", href: "#services" },
  { label: "Aperçu", href: "#captures" },
  { label: "FAQ", href: "#faq" },
];

const Navbar = ({ onTabChange }: { onTabChange: (tab: string) => void }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass-nav border-b border-border">
        <div className="container flex items-center justify-between h-[72px]">
          <button onClick={() => onTabChange("home")} className="flex items-center gap-3 text-2xl font-bold text-foreground no-underline cursor-pointer">
            <GestioLogo />
            Gestio
          </button>
          <ul className="hidden md:flex gap-8 list-none">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="text-muted-foreground hover:text-primary transition-colors text-[0.9375rem] font-medium no-underline">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a href="#telecharger" className="hidden md:inline-flex items-center gap-2 bg-gradient-primary text-primary-foreground px-6 py-2.5 rounded-lg font-semibold text-[0.9375rem] hover:-translate-y-0.5 hover:shadow-primary-hover transition-all no-underline">
            Télécharger
          </a>
          <button className="md:hidden p-2" onClick={() => setOpen(true)} aria-label="Menu">
            <Menu className="w-7 h-7 text-foreground" />
          </button>
        </div>
      </nav>

      {/* Mobile nav overlay */}
      {open && (
        <div className="fixed inset-0 z-[999] bg-background/[0.98] flex flex-col items-center justify-center gap-8">
          <button className="absolute top-6 right-6" onClick={() => setOpen(false)} aria-label="Fermer">
            <X className="w-8 h-8 text-foreground" />
          </button>
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-2xl font-semibold text-foreground no-underline">
              {l.label}
            </a>
          ))}
          <a href="#telecharger" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 bg-gradient-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold no-underline">
            <Download className="w-5 h-5" />
            Télécharger
          </a>
        </div>
      )}
    </>
  );
};

export default Navbar;
