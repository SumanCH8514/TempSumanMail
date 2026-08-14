import React from 'react';
import { MailQuestion, Radio } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="empty-inbox-state anim-fade-in">
      <div className="empty-radar-circle anim-pulse-radar">
        <Radio size={36} />
      </div>
      <h3 className="empty-title">Waiting for incoming emails...</h3>
      <p className="empty-desc">
        Your temporary mailbox is ready. Any email sent to your address will appear here automatically within seconds.
      </p>
    </div>
  );
}
