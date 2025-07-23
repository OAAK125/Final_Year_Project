import Categories from "@/ui/landing-page/categories";
import ContactUs from "@/ui/landing-page/contact-us";
import CallToAction from "@/ui/landing-page/cta";
import FAQ from "@/ui/landing-page/faq";
import Features from "@/ui/landing-page/features";
import FooterSection from "@/ui/landing-page/footer";
import HeroSection from "@/ui/landing-page/hero-section";
import TestimonialsSection from "@/ui/landing-page/testimonals";




export default function Home() {
  return (
    <main>
    <HeroSection />
    <Features />
    <TestimonialsSection />
    <Categories />
    <FAQ />
    <ContactUs />
    <CallToAction />
    <FooterSection />
    </main>
  );
}
