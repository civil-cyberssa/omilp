import Navbar from "@/components/navbar"
import HeroSection from "@/components/hero-section"
import SoftwareGrid from "@/components/software-grid"
import ImmersiveSection from "@/components/immersive-section"
import ClientsSection from "@/components/clients-section"
import ContactForm from "@/components/contact-form"

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      <Navbar />
      <HeroSection />
      <SoftwareGrid id="products" />
      <ImmersiveSection />
      <ClientsSection />
      <ContactForm />
    </main>
  )
}

