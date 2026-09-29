import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import WhatsAppFloat from "./components/WhatsAppFloat.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Services from "./pages/Services.jsx";
import ServiceDetail from "./pages/ServiceDetail.jsx";
import HrServices from "./pages/HrServices.jsx";
import HrDetail from "./pages/HrDetail.jsx";
import Bpo from "./pages/Bpo.jsx";
import BpoDetail from "./pages/BpoDetail.jsx";
import Careers from "./pages/Careers.jsx";
import CareerCategory from "./pages/CareerCategory.jsx";
import Contact from "./pages/Contact.jsx";
import Login from "./pages/Login.jsx";
import NotFound from "./pages/NotFound.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/hr-services" element={<HrServices />} />
          <Route path="/hr-services/:slug" element={<HrDetail />} />
          <Route path="/bpo" element={<Bpo />} />
          <Route path="/bpo/:slug" element={<BpoDetail />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/careers/:track" element={<CareerCategory />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
