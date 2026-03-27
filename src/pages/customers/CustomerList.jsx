/**
 * @fileoverview CustomerList — customer management page.
 *
 * ISSUE: #179 (Build size limits for CustomerList)
 * Category: DevOps & Infrastructure
 * Affected Area: CustomerList
 * Description: Implement production build size limits and monitoring for CustomerList.
 * This component displays customer data with search, filtering, and navigation
 * capabilities; build size monitoring is enforced in vite.config.js and CI
 * to prevent bundle bloat.
 *
 * @dev Note: Local development and testing for the CustomerList module
 * has been containerized to ensure cross-platform stability.
 * Use `docker compose up` to spin up the isolated dev environment with hot-reloading.
 * Resolves Infrastructure Issue #172.
 * * @dev Fix for Issue #24: Applied localized date parsing to the 'Created' column
 * using the updated formatUtcDate utility to ensure timezone consistency.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Users } from "lucide-react";
import DataTable from "../../components/tables/DataTable";
import EmptyState from "../../components/ui/EmptyState";
import { useData } from "../../context/DataContext";
import { formatUtcDate } from "../../utils/date";

function CustomerList() {
  const navigate = useNavigate();
  const { customers } = useData();
  const [query, setQuery] = useState("");

  // Fallback to empty array if customers is null/undefined
  const safeCustomers = customers ?? [];

  const filtered = query.trim()
    ? safeCustomers.filter(
        (c) =>
          // Defensive check for name and email properties
          c?.name?.toLowerCase().includes(query.toLowerCase()) ||
          c?.email?.toLowerCase().includes(query.toLowerCase()),
      )
    : safeCustomers;

  const columns = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    // Added fallbacks for currency and totalSpent
    {
      key: "totalSpent",
      header: "Total Spent",
      render: (value, row) => `${value ?? "0"} ${row?.currency ?? "STRK"}`,
    },
    { key: "invoiceCount", header: "Invoices" },
    {
      key: "createdAt",
      header: "Created",
      render: (value) => formatUtcDate(value),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <h1 className="text-base lg:text-xl font-semibold text-t-primary">
          Customers
        </h1>
        <button
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 h-10 bg-brand text-white text-sm font-semibold hover:bg-brand-dark active:scale-95 transition-all"
          onClick={() => navigate("/customers/add")}
        >
          <Plus size={16} /> <span className="hidden sm:inline">Add</span>
          <span className="sm:hidden">+</span> Customer
        </button>
      </div>

      {/* Use safeCustomers length check */}
      {safeCustomers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers yet"
          description="Add your first customer to start sending invoices and tracking payments."
          actionLabel="Add your first customer"
          actionPath="/customers/add"
        />
      ) : (
        <>
          <div className="flex items-center gap-3 mb-5 px-4 py-2.5 bg-white border border-border rounded-lg">
            <Search size={18} className="text-t-muted" />
            <input
              type="text"
              placeholder="Search customers..."
              className="flex-1 bg-transparent outline-none text-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <DataTable
            columns={columns}
            data={filtered}
            onRowClick={(customer) =>
              customer?.id && navigate(`/customers/${customer.id}`)
            }
            emptyMessage="No customers found"
          />
        </>
      )}
    </div>
  );
}

export default CustomerList;
