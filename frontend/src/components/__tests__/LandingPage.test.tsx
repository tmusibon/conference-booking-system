import React, { act } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LandingPage from "../landing-page/LandingPage";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

global.EventSource = jest.fn(() => ({
  onmessage: null,
  onerror: null,
  close: jest.fn(),
})) as any;

test("renders landing page with title", async () => {
  mockedAxios.get.mockResolvedValueOnce({
    data: [
      {
        id: 1,
        name: "Testing Room",
        location: "Floor 1",
        equipment: "Projector",
        capacity: 2,
      },
    ],
  });
  mockedAxios.get.mockResolvedValueOnce({ data: [] });

  await act(async () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );
  });

  await waitFor(() => {
    expect(
      screen.getByText(/Welcome to Conference Room Booking/i)
    ).toBeInTheDocument();
  });
});
