/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import MushafViewer from "./components/MushafViewer";
import FontSandbox from "./components/FontSandbox";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#F8F6F2] text-[#2C1E14] overflow-x-hidden selection:bg-[#8B7355]/30">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/read/:riwayaId" element={<MushafViewer />} />
          <Route path="/sandbox" element={<FontSandbox />} />
        </Routes>
      </div>
    </Router>
  );
}

