import React from "react";
import MagneticHero from "@/components/MagneticHero";
import MobileHero from "@/components/MobileHero";

export default function Hero() {
  const isMobile = window.innerWidth < 768;
  return isMobile ? <MobileHero /> : <MagneticHero />;
}
