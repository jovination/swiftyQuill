import Image from "next/image";
import Header from "@/components/Header";
import Hero from "@/components/Hero"
import Featured from "@/components/Featured"
import Footer from "@/components/Footer"


export default function Home() {
  return (
    <div className="w-full min-h-screen mx-auto flex flex-col items-center justify-between px-6 md:px-8">
      <Header />
      <Hero />
      <Featured />  
      <Footer />
    </div>
  );
}
