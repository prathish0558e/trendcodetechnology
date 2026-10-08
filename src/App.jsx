import { lazy, Suspense, useEffect } from "react";
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
import Internship from "./pages/Internship.jsx";
import Tourism from "./pages/Tourism.jsx";
import SisterSite from "./pages/SisterSite.jsx";
import Login from "./pages/Login.jsx";
import Admin from "./pages/Admin.jsx";
import NotFound from "./pages/NotFound.jsx";
import Seo from "./seo/Seo.jsx";

/*
 * "Codey" is replaced by the 3D TCT Assistant mascot (src/mascot/) —
 * lazy-loaded so three.js never touches the initial bundle.
 */
const TctMascot = lazy(() => import("./mascot/TctMascot.jsx"));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Route changes must jump to the top instantly — "smooth" scrolling here
    // animates from the bottom of the previous page and feels broken.
    const html = document.documentElement;
    html.classList.add("no-smooth-scroll");
    window.scrollTo(0, 0);
    const raf = requestAnimationFrame(() =>
      html.classList.remove("no-smooth-scroll")
    );
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Seo />
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
          <Route path="/internship" element={<Internship />} />
          <Route path="/tourism" element={<Tourism />} />
          {/* Sister sites — real domains get wired up in src/data/sites.js */}
          <Route
            path="/tct-fashionhub"
            element={<SisterSite siteKey="fashionhub" />}
          />
          <Route path="/tct-trader" element={<SisterSite siteKey="trader" />} />
          <Route path="/careers/:track" element={<CareerCategory />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <WhatsAppFloat />
      <Suspense fallback={null}>
        <TctMascot />
      </Suspense>
    </>
  );
}
