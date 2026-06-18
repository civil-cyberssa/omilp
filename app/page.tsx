import Navbar from "@/components/navbar"
import HeroSection from "@/components/hero-section"
import SoftwareGrid from "@/components/software-grid"
import StatsSection from "@/components/stats-section"
import ImmersiveSection from "@/components/immersive-section"
import SolutionsSection from "@/components/solutions-section"
import DigitalLensSection from "@/components/digital-lens-section"
import ClientsSection from "@/components/clients-section"
import ContactForm from "@/components/contact-form"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      <Navbar />
      <HeroSection />
      <SoftwareGrid id="products" />
      <StatsSection />
      <ImmersiveSection />
      <SolutionsSection />
      <DigitalLensSection />
      <ClientsSection />
      <ContactForm />
      <Footer />
    </main>
  )
}
