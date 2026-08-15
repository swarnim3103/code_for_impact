import { Nav, Signup, Footer } from "../section";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav page="home" />
      <div className="flex-1">
        <Signup />
      </div>
      <Footer />
    </div>
  );
}