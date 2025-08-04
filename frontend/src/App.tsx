import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/landing-page/LandingPage";
import BookingPage from "./components/booking-page/BookingPage";
import ConfirmationPage from "./components/confirmation-page/ConfirmationPage";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/confirmation/:id" element={<ConfirmationPage />} />
      </Routes>
    </Router>
  );
};

export default App;
