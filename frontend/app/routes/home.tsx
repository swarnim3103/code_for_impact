import { Nav, Hero, About, Footer } from "../section";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav page="home" />
      <main className="flex-1">
        <Hero />
        <About />
      </main>
      <Footer />
    </div>
  );
}