import type { Route } from "./+types/dashboard";
import { Nav, Footer, SpeechListener, Pronunciation, Library, Pattern } from "../section/index.js";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Dashboard — SpeechEase" }];
}

export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen">
      <Nav page="dashboard" />

      <SpeechListener />

      <div className="flex flex-col md:flex-row">
        <div className="flex-1 flex items-center justify-center p-4">
          <img src="/icons/download-1.jpeg" alt="Speech practice" />
        </div>
        <div className="flex-1 flex flex-col gap-6">
          <Pronunciation />
          <Library />
        </div>
      </div>

      <Pattern />

      <Footer />
    </div>
  );
}