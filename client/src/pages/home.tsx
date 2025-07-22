import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import HeroSection from "@/components/sections/hero-section";
import AboutSection from "@/components/sections/about-section";
import BlogSection from "@/components/sections/blog-section";
import PortfolioSection from "@/components/sections/portfolio-section";
import LoyaltySection from "@/components/sections/loyalty-section";
import ContactSection from "@/components/sections/contact-section";

export default function Home() {
  return (
    <div className="min-h-screen bg-muted/50 overflow-x-hidden">
      <Navigation />
      <main>
        <HeroSection />
        <AboutSection />
        <BlogSection />
        <PortfolioSection />
        <LoyaltySection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
