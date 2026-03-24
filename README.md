# Tradazone

> A modern, multi-chain invoicing and checkout platform built for businesses and freelancers — enabling seamless payments across fiat and blockchain networks.

[![Deploy](https://img.shields.io/badge/deployed-GitHub%20Pages-blue?style=flat-square)](https://FolushoJoseph.github.io/Tradazone)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](./LICENSE)

---

## 📖 About the Project

Tradazone is a full-featured business management and payment product. It allows users to manage customers, create invoices, run checkout flows, and accept payments — including via Web3 wallets on the Stellar and Starknet networks.

The goal is to give small businesses and freelancers a **single, elegant dashboard** to handle their entire billing workflow, with the option to receive crypto payments without compromising the simplicity of a traditional invoicing tool.

### Key Features

- 🧾 **Invoice creation & PDF export** — Generate professional invoices and download them as PDFs
- 🛒 **Checkout flows** — Create shareable checkout links for products/services
- 📬 **Mail Checkout** — Send payment links directly to customers via email
- 👥 **Customer management** — Add, view, and manage your customer directory
- 📦 **Items & Services catalog** — Build a reusable catalog of your offerings
- 📊 **Dashboard analytics** — Visual overview of revenue and activity via Chart.js
- 🔐 **Authentication & Onboarding** — Sign up/in flows with a multi-step onboarding experience
- 🌐 **Web3 wallet support** — Connect Freighter (Stellar) and Starknet wallets for crypto payments
- ⚙️ **Settings** — Profile, password, notification, and payment configuration

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/FolushoJoseph/Tradazone.git

# 2. Navigate into the project directory
cd Tradazone/tradazone

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Building for Production

```bash
npm run build
```

### Deploying to GitHub Pages

```bash
npm run deploy
```

---

## 🗂️ Project Structure

```
tradazone/
├── public/                     # Static assets (favicon, etc.)
└── src/
    ├── App.jsx                 # Root component — routing & providers
    ├── main.jsx                # Entry point
    ├── index.css               # Global styles
    │
    ├── assets/                 # Images, logos, and static media
    │
    ├── components/
    │   ├── forms/              # Reusable form components
    │   ├── invoice/            # Invoice-specific UI components
    │   ├── layout/             # App shell: Sidebar, Header, Layout wrapper
    │   ├── routing/            # PrivateRoute and auth guards
    │   ├── tables/             # Data table components
    │   └── ui/                 # Generic UI: Modals, Buttons, Inputs, etc.
    │
    ├── context/
    │   ├── AuthContext.jsx     # Authentication state & logic
    │   └── DataContext.jsx     # Global data state (customers, items, invoices)
    │
    ├── hooks/
    │   └── useFreighter.js     # Hook for Stellar Freighter wallet integration
    │
    ├── pages/
    │   ├── auth/               # SignIn, SignUp, Onboarding
    │   ├── checkouts/          # CheckoutList, CreateCheckout, CheckoutDetail, MailCheckout
    │   ├── customers/          # CustomerList, AddCustomer, CustomerDetail
    │   ├── dashboard/          # Home / analytics dashboard
    │   ├── invoices/           # InvoiceList, CreateInvoice, InvoiceDetail, InvoicePreview
    │   ├── items/              # ItemsList, AddItem, ItemDetail
    │   └── settings/           # Profile, Password, Payment, Notification settings
    │
    ├── services/               # API/service layer abstractions
    │
    └── utils/
        ├── detectFreighter.js  # Utility to detect Freighter wallet extension
        └── wallet-discovery.js # Multi-chain wallet discovery helpers
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 7 |
| Routing | React Router DOM v7 |
| Styling | Tailwind CSS v3 |
| Charts | Chart.js + react-chartjs-2 |
| PDF Export | html2pdf.js |
| Icons | Lucide React |
| Stellar Wallet | @stellar/freighter-api |
| Starknet Wallet | get-starknet + starknet.js |
| EVM Wallet | ethers.js v6 |
| Deployment | GitHub Pages (via gh-pages) |

---

## 🤝 Contributing

Contributions, bug reports, and feature suggestions are all welcome!

Please read our [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct, the process for submitting pull requests, and our CI/CD pipeline.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.

---

## 🔗 Links

- 🌍 **Live App**: [https://FolushoJoseph.github.io/Tradazone](https://FolushoJoseph.github.io/Tradazone)
- 📁 **Repository**: [https://github.com/FolushoJoseph/Tradazone](https://github.com/FolushoJoseph/Tradazone)
