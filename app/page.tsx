import Image from "next/image";
import Header from "@/components/Header";
import Hero from "@/components/Hero"
import Featured from "@/components/Featured"


export default function Home() {
  return (
    <div className="min-h-screen px-8">
      <Header />
      <Hero />
      <Featured />  
    </div>
  );
}
