import { Nav, SpeechListener, Pronunciation, Library, Pattern, Footer } from "../section";

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav page="dashboard" />
      <main className="flex-1">
        <section id="listen">
          <SpeechListener />
        </section>
        <section id="practice" className="flex justify-center">
          <Pronunciation />
        </section>
        <section id="library">
          <Library />
        </section>
        <section id="patterns">
          <Pattern />
        </section>
      </main>
      <Footer />
    </div>
  );
}