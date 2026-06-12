import React from "react";
import WeaveHero from "@/components/WeaveHero";
import MobileHero from "@/components/MobileHero";

export default function Hero() {
  const isMobile = window.innerWidth < 768;
  return isMobile ? <MobileHero /> : <WeaveHero />;
}
