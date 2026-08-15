import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { MailProvider, useMail } from './context/MailContext.jsx';
import { Header } from './components/Header.jsx';
import { AddressBar } from './components/AddressBar.jsx';
import { MessageList } from './components/MessageList.jsx';
import { FaqSection } from './components/FaqSection.jsx';
import { Footer } from './components/Footer.jsx';
import { NotificationToast } from './components/NotificationToast.jsx';
import { CustomAddressModal } from './components/CustomAddressModal.jsx';
import { QrCodeModal } from './components/QrCodeModal.jsx';
import { AboutUsModal } from './components/AboutUsModal.jsx';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal.jsx';
import { TermsModal } from './components/TermsModal.jsx';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts.js';

function AppContent() {
  const {
    session,
    createRandomInbox,
    fetchMessages,
    closeMessage,
    selectedMessage,
    addToast
  } = useMail();

  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  useKeyboardShortcuts({
    onCopy: async () => {
      if (session?.address) {
        try {
          await navigator.clipboard.writeText(session.address);
          addToast('Address copied to clipboard', 'success');
        } catch (e) {
          addToast('Failed to copy address', 'error');
        }
      }
    },
    onCustomize: () => {
      setCustomModalOpen(true);
    },
    onQr: () => {
      if (session?.address) {
        setQrModalOpen(true);
      }
    },
    onRefresh: () => {
      fetchMessages(true);
      addToast('Checking for new emails...', 'info');
    },
    onNew: () => {
      createRandomInbox();
      addToast('Generating new inbox...', 'info');
    },
    onSearch: () => {
      const searchInput = document.querySelector('.search-input');
      if (searchInput) {
        searchInput.focus();
      }
    },
    onEscape: () => {
      if (selectedMessage) {
        closeMessage();
      }
      setCustomModalOpen(false);
      setQrModalOpen(false);
      setAboutModalOpen(false);
      setPrivacyModalOpen(false);
      setTermsModalOpen(false);
    }
  });

  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        <section className="hero-section">
          <h1 className="hero-title">
            Disposable Temporary Mailbox
          </h1>

          <p className="hero-subtitle">
            Instant anonymous inboxes for OTP verification, QA testing, and spam prevention. Zero registration, zero tracking. A <a href="https://sumanonline.com" target="_blank" style={{ fontWeight: 'bold', textDecoration: 'none', cursor: 'pointer' }} rel="noopener noreferrer">SumanOnline</a> Project.
          </p>

          <AddressBar
            onOpenCustomize={() => setCustomModalOpen(true)}
            onOpenQr={() => setQrModalOpen(true)}
          />
        </section>

        <MessageList />

        <FaqSection />
      </main>

      <Footer
        onOpenAbout={() => setAboutModalOpen(true)}
        onOpenPrivacy={() => setPrivacyModalOpen(true)}
        onOpenTerms={() => setTermsModalOpen(true)}
      />
      <NotificationToast />

      <CustomAddressModal
        isOpen={customModalOpen}
        onClose={() => setCustomModalOpen(false)}
      />

      <QrCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
      />

      <AboutUsModal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
      />

      <PrivacyPolicyModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
      />

      <TermsModal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MailProvider>
        <AppContent />
      </MailProvider>
    </ThemeProvider>
  );
}
