import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, describe, it, expect } from "vitest";
import CustomerList from "../pages/customers/CustomerList";
import { DataProvider } from "../context/DataContext";

// Mock the context to simulate malformed data
vi.mock("../context/DataContext", async () => {
  const actual = await vi.importActual("../context/DataContext");
  return {
    ...actual,
    useData: () => ({
      customers: null,
    }),
  };
});

describe("CustomerList Stability", () => {
  it("renders without crashing when customers is null", () => {
    render(
      <MemoryRouter>
        <CustomerList />
      </MemoryRouter>,
    );

    // Should show EmptyState instead of crashing
    expect(screen.getByText(/No customers yet/i)).toBeInTheDocument();
  });
});
