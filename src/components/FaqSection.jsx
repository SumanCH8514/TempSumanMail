import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [

    {
      q: 'How does TempSumanMail protect privacy without requiring an account?',
      a: 'We operate as a lightweight edge proxy over global disposable email networks. Mailboxes are created on-demand without collecting passwords, IPs, or cookies. When you close or destroy your session, your tokens are expunged.'
    },
    {
      q: 'Can I reuse the same temporary address tomorrow?',
      a: 'Yes, as long as you keep your browser session active or customize your local username with the same domain. Sessions remain active up to 24 hours from your last incoming email.'
    },
    {
      q: 'Are attachments and HTML emails safely rendered?',
      a: 'Every incoming HTML email undergoes strict DOMPurify sanitization and executes inside an isolated sandbox. Dangerous elements like tracking beacons, executable scripts, and click-jacking frames are automatically neutralized.'
    },
    {
      q: 'Can I pick a custom username instead of a random string?',
      a: 'Click the "Customize" button or press "U" on your keyboard. You can pick any custom username (e.g., sumanmail, developer, testqa) across all live edge domains.'
    },
    {
      q: 'Is this service free to use for QA, development, and OTP verification?',
      a: '100% free and open for testing verification flows, software QA, signing up for newsletters without spam, and temporary developer pipelines.'
    },
    {
      q: 'Who created this project and what tech stack has been used?',
      a: (
        <span>
          TempSumanMail was designed and developed by{' '}
          <a
            href="https://sumanonline.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent-cyan)', fontWeight: 600, textDecoration: 'none' }}
          >
            Suman Chakrabortty (SumanOnline.Com)
          </a>
          . It is engineered as a modern, robust & high-performance web app, Stacks using React, Vite, and a distributed Cloudflare Backend edge architecture using AES-GCM stateless token encryption and real-time disposable email broker APIs.
        </span>
      )
    },
  ];

  const toggleFaq = (index) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  return (
    <section className="faq-section">
      <div className="faq-header-wrapper">
        <h2 className="faq-heading">Frequently Answered Questions</h2>
        <p className="faq-subheading">Everything you need to know about disposable addresses, security, and edge mechanics.</p>
      </div>

      <div className="faq-accordion-list">
        {faqs.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} className={`faq-accordion-item ${isOpen ? 'open' : ''}`}>
              <button
                className="faq-accordion-header"
                onClick={() => toggleFaq(index)}
                aria-expanded={isOpen}
              >
                <span className="faq-q-text">{item.q}</span>
                <span className="faq-chevron">
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              </button>
              {isOpen && (
                <div className="faq-accordion-body anim-fade-in">
                  <div>{item.a}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
