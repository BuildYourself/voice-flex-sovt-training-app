import { FeatureStatsGrid, FinalCTA, HomeHero, HomeNavbar, HowItWorks, ProductCards } from "@/components/homepage-components";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7faff]">
      <HomeNavbar />
      <HomeHero />
      <FeatureStatsGrid />
      <HowItWorks />
      <ProductCards />
      <FinalCTA />
    </main>
  );
}
