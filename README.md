# TempSumanMail

> Instant, anonymous, disposable temporary email service powered by Cloudflare edge workers and React.

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020?style=flat-square&logo=cloudflarepages&logoColor=white)](https://pages.cloudflare.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

---

## Live Deployments

- **Web Application**: [https://tempsumanmail.sumanonline.com](https://tempsumanmail.sumanonline.com)
- **API Gateway Engine**: [https://backend.tempsumanmail.sumanonline.com](https://backend.tempsumanmail.sumanonline.com)

---

## Overview

**TempSumanMail** is a privacy-first, disposable temporary email web application designed for developers, students, QA testers, and privacy-conscious users. It generates disposable inboxes on the fly to receive verification codes, OTPs, and confirmation links without exposing personal email addresses to spam, newsletters, or data leaks.

Built as an edge-brokered aggregator over upstream disposable providers (`mail.tm`, `mail.gw`, `Guerrilla Mail`) with automatic failover, DOMPurify HTML sanitization, and sandboxed rendering.

---

## Features

- **Instant Address Generation** &mdash; Provision receivable inboxes in under 2 seconds on initial page load.
- **Custom Local-Part & Domains** &mdash; Pick a custom username (e.g., `sumanmail`, `user+1`) and select from live edge domains.
- **Sub-Addressing / Plus Tagging** &mdash; Full support for `+` aliases (e.g., `tester+otp1@domain.com`).
- **Real-Time Polling & Notifications** &mdash; Automated background polling with Web Audio alerts, haptic vibrations, and Service Worker push notifications that trigger even when minimized.
- **Toggleable Alerts** &mdash; Independent Header toggles for Sound alerts and System push notifications with real-time state sync.
- **Safe Sandboxed HTML Viewer** &mdash; Renders complex HTML emails securely with DOMPurify sanitization and remote image protection.
- **Multi-Provider Direct Routing & Failover** &mdash; Intelligent domain routing across `mail.tm`, `mail.gw`, and `Guerrilla Mail` with automated circuit breaking.
- **Power-User Keyboard Shortcuts** &mdash; Copy (`C`), Refresh (`R`), Randomize (`N`), Customize (`U`), QR Code (`Q`), Search (`/`), and Back/Close (`Esc`).
- **QR Code Sharing** &mdash; Instant QR code generation to test email flows across mobile devices.
- **Zero Logging & Ephemeral Lifecycle** &mdash; No tracking cookies, no personal identity collection, and automatic session cleanup.
- **Light / Dark Theme** &mdash; Light Mode default with high-contrast Dark Mode toggle and dynamic mobile status bar synchronization.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 6, Vanilla CSS Design System, Lucide Icons, DOMPurify, QRCode |
| **Backend Broker** | Cloudflare Workers, Edge Request Router, Session Store (KV / In-Memory) |
| **Upstream Providers** | `mail.tm`, `mail.gw`, `Guerrilla Mail` |
| **Hosting & Edge** | Cloudflare Pages & Cloudflare Workers |

---

## Project Structure

```text
TempSumanMail/
├── worker/                     # Cloudflare Workers Edge Broker
│   ├── index.js                # Worker entrypoint
│   ├── router.js               # REST API route handlers & HTML Gateway
│   ├── sessionStore.js         # Opaque session token mapping (KV/Memory)
│   └── providers/              # Upstream mail adapters
│       ├── base.js             # Base provider interface
│       ├── mailtm.js           # Mail.tm integration
│       ├── mailgw.js           # Mail.gw failover adapter
│       ├── guerrilla.js        # Guerrilla Mail adapter
│       └── manager.js          # Multi-provider manager & circuit breaker
├── src/                        # Frontend React Application
│   ├── api/                    # API client wrapper
│   ├── components/             # Reusable UI components
│   │   ├── AddressBar.jsx      # Hero address card & actions
│   │   ├── CustomAddressModal.jsx # Username & domain customization
│   │   ├── QrCodeModal.jsx     # Mobile QR code dialog
│   │   ├── MessageList.jsx     # Filterable email inbox list
│   │   ├── MessageItem.jsx     # Email preview card with star bookmark
│   │   ├── MessageViewer.jsx   # Sandboxed safe email reader
│   │   ├── ShortcutsModal.jsx  # Keyboard shortcuts guide
│   │   ├── AboutUsModal.jsx    # About modal
│   │   ├── PrivacyPolicyModal.jsx # Privacy policy dialog
│   │   ├── TermsModal.jsx      # Terms & conditions dialog
│   │   ├── FaqSection.jsx      # Interactive accordion FAQ
│   │   └── Header.jsx / Footer.jsx
│   ├── context/                # Theme and Mail global state providers
│   ├── hooks/                  # Sound, and Keyboard Shortcut hooks
│   ├── styles/                 # CSS design tokens & animations
│   ├── utils/                  # Sanitizer & relative time formatters
│   ├── App.jsx                 # Master application layout
│   └── main.jsx                # React root mount
├── public/                     # Static assets, PWA manifest, service worker & icons
├── package.json
├── vite.config.js              # Vite configuration
└── wrangler.toml               # Cloudflare deployment configuration
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18.0 or higher)
- `npm` or `pnpm` / `yarn`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SumanCH8514/TempSumanMail.git
   cd TempSumanMail
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to `http://localhost:5173` to access the application.

---

## Keyboard Shortcuts

| Key | Action |
|:---:|:---|
| <kbd>C</kbd> | Copy active email address to clipboard |
| <kbd>R</kbd> | Manually trigger refresh and check incoming mail |
| <kbd>N</kbd> | Generate a new random disposable inbox |
| <kbd>U</kbd> | Open customization dialog for custom username |
| <kbd>Q</kbd> | Open QR code modal for mobile testing |
| <kbd>/</kbd> | Focus the inbox search bar |
| <kbd>Esc</kbd> | Close active modal or exit email reader view |

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

## Author

Designed & Developed with ❤️ by **[SumanOnline.Com](https://sumanonline.com)**
