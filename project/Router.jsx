import { BrowserRouter, Route, Routes } from "react-router-dom";
import {
  App,
  Dashboard,
} from "./src/pages/index.js";
function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;