import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LandingPage from "../landing-page/LandingPage";

test("renders landing page with title", () => {
  render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>
  );
  expect(
    screen.getByText(/Welcome to Conference Room Booking/i)
  ).toBeInTheDocument();
});
