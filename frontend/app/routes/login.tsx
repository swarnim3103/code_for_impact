import { Nav, Login, Footer } from "../section";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav page="home" />
      <div className="flex-1">
        <Login />
      </div>
      <Footer />
    </div>
  );
}