/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Navbar, Footer } from "@/components/layout";
import { Home } from "@/pages/Home";
import { BrowseDogs } from "@/pages/BrowseDogs";
import { DogDetail } from "@/pages/DogDetail";
import { ShelterProfile } from "@/pages/ShelterProfile";
import { About } from "@/pages/About";
import { ForShelters } from "@/pages/ForShelters";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen w-full bg-white font-sans text-gray-900">
        <Navbar />
        <main className="flex-grow w-full flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dogs" element={<BrowseDogs />} />
            <Route path="/dogs/:id" element={<DogDetail />} />
            <Route path="/shelters/:id" element={<ShelterProfile />} />
            <Route path="/about" element={<About />} />
            <Route path="/shelters/join" element={<ForShelters />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
