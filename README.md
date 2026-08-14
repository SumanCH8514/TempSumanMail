# TempSumanMail

> Instant, anonymous, disposable temporary email service powered by Cloudflare edge workers and React.

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

---

## Overview

**TempSumanMail** is a privacy-first, disposable temporary email web application designed for developers, students, QA testers, and privacy-conscious users. It generates disposable inboxes on the fly to receive verification codes, OTPs, and confirmation links without exposing personal email addresses to spam, newsletters, or data leaks.

Built as an edge-brokered aggregator over upstream disposable providers (`mail.tm`, `mail.gw`, `Guerrilla Mail`) with automatic failover, DOMPurify HTML sanitization, and sandboxed rendering.

---

## Features

- **Instant Address Generation** &mdash; Provision receivable inboxes in under 2 seconds on initial page load.
- **Custom Local-Part & Domains** &mdash; Pick a custom username (e.g., `sumanmail`, `alex.dev`) and select from live edge domains.
- **Real-Time Polling & Notifications** &mdash; Automated background polling with subtle Web Audio alerts and native browser notifications.
- **Safe Sandboxed HTML Viewer** &mdash; Renders complex HTML emails securely with DOMPurify sanitization and remote image protection.
- **Multi-Provider Failover** &mdash; Automatic fallback across multiple upstream providers with built-in circuit breaking.
- **Power-User Keyboard Shortcuts** &mdash; Copy (`C`), Refresh (`R`), Randomize (`N`), Customize (`U`), QR Code (`Q`), and Search (`/`).
- **QR Code Sharing** &mdash; Instant QR code generation to test email flows across mobile devices.
- **Zero Logging & Ephemeral Lifecycle** &mdash; No tracking cookies, no personal identity collection, and automatic session cleanup.
- **Dark / Light Theme** &mdash; System-aware high-contrast themes crafted with bespoke typography.

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
│   ├── router.js               # REST API route handlers
│   ├── sessionStore.js         # Opaque session token mapping (KV/Memory)
│   └── providers/              # Upstream mail adapters
│       ├── base.js             # Base provider interface
│       ├── mailtm.js           # Mail.tm integration
│       ├── mailgw.js           # Mail.gw failover adapter
│       ├── guerrilla.js        # Guerrilla Mail fallback
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
│   ├── hooks/                  # Polling, Sound, and Shortcut hooks
│   ├── styles/                 # CSS design tokens & animations
│   ├── utils/                  # Sanitizer & relative time formatters
│   ├── App.jsx                 # Master application layout
│   └── main.jsx                # React root mount
├── package.json
├── vite.config.js              # Vite configuration with embedded dev API middleware
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
   git clone https://github.com/your-username/TempSumanMail.git
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

## Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

## Author

Designed & Developed with ❤️ by **[SumanOnline.Com](https://sumanonline.com)**
