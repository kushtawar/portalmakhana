import Hero from "@/components/home/Hero";
import TrustStrip from "@/components/home/TrustStrip";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import WhyItarIntakes from "@/components/home/WhyItarIntakes";
import OriginStory from "@/components/home/OriginStory";
import WholesaleExportCta from "@/components/home/WholesaleExportCta";
import StoriesHighlights from "@/components/home/StoriesHighlights";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <FeaturedProducts />
      <WhyItarIntakes />
      <OriginStory />
      <WholesaleExportCta />
      <StoriesHighlights />
    </>
  );
}
