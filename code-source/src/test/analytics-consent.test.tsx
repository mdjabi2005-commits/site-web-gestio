import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import AnalyticsConsent from "@/components/AnalyticsConsent";
import { ANALYTICS_CONSENT_KEY } from "@/lib/analyticsConsent";

describe("AnalyticsConsent", () => {
  beforeEach(() => {
    localStorage.clear();
    document.getElementById("gestio-gtm")?.remove();
  });

  it("ne charge pas Google Tag Manager avant le consentement", () => {
    render(<AnalyticsConsent />);

    expect(screen.getByText("Mesure d'audience")).toBeInTheDocument();
    expect(document.getElementById("gestio-gtm")).not.toBeInTheDocument();
  });

  it("charge Google Tag Manager après acceptation", () => {
    render(<AnalyticsConsent />);
    fireEvent.click(screen.getByRole("button", { name: "Accepter" }));

    expect(localStorage.getItem(ANALYTICS_CONSENT_KEY)).toBe("accepted");
    expect(document.getElementById("gestio-gtm")).toHaveAttribute(
      "src",
      "https://www.googletagmanager.com/gtm.js?id=GTM-PQCR4HPT",
    );
  });
});
