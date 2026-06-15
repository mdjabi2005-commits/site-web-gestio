import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ConditionsUtilisation from "@/pages/ConditionsUtilisation";
import PolitiqueConfidentialite from "@/pages/PolitiqueConfidentialite";

describe("pages légales", () => {
  it("présente clairement la connexion bancaire facultative", () => {
    render(<PolitiqueConfidentialite />);

    expect(screen.getByRole("heading", { name: "Politique de confidentialité" })).toBeInTheDocument();
    expect(screen.getByText(/Enable Banking intervient/)).toBeInTheDocument();
    expect(screen.getByText(/ne conserve jamais les identifiants/)).toBeInTheDocument();
  });

  it("précise que les rapprochements restent des aides", () => {
    render(<ConditionsUtilisation />);

    expect(screen.getByText(/Les rapprochements automatiques sont des aides/)).toBeInTheDocument();
    expect(screen.getByText(/ne constituent ni un conseil financier/)).toBeInTheDocument();
  });
});
