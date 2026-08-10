import type { Route } from "./+types/home";
import { Nav, Hero, About, Footer } from "../section/index.js";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "SpeechEase" },
    { name: "description", content: "Empowering Clear Communication, One Word at a Time" },
  ];
}

export default function Home() {
  return (
    <main className="relative flex flex-col min-h-screen">
      <Nav page="home" />
      <section id="home">
        <Hero />
      </section>
      <section id="about-us">
        <About />
      </section>
      <section id="contact-us">
        <Footer />
      </section>
    </main>
  );
}