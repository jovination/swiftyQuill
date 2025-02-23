import Image from "next/image";
import Header from "@/components/Header";
import Hero from "@/components/Hero"

export default function Home() {
  return (
    <div className="min-h-screen px-8">
      <Header />
      <Hero />
  
    </div>
  );
}
