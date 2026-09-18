import React, { useState, useEffect } from 'react';
import type { LiveOPDToken, AppLanguage } from '../../types';
import { db } from '../../db/database';
import { Clock, AlertTriangle, Bell, MessageSquare, CalendarPlus } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  language: AppLanguage;
  onOpenPass: (token: LiveOPDToken) => void;
  onBookNew?: () => void;
}

export const LiveOPDQueueTracker: React.FC<Props> = ({ language, onOpenPass, onBookNew }) => {
  const [queues, setQueues] = useState<LiveOPDToken[]>(() => db.getLiveOPDQueues());
  const activeToken = queues[0];
  const [smsSent, setSmsSent] = useState(false);

  useEffect(() => {
    return db.subscribe('opd', () => {
      setQueues(db.getLiveOPDQueues());
    });
  }, []);

  const handleAdvanceQueue = () => {
    if (!activeToken) return;
    const updated = db.advanceQueueToken(activeToken.id);
    if (updated) {
      setQueues([updated, ...queues.slice(1)]);
      if (updated.status === 'SERVING') {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      }
    }
  };

  const handleSendSMSAlert = () => {
    setSmsSent(true);
    setTimeout(() => setSmsSent(false), 4000);
  };

  if (!activeToken) {
    return (
      <div className="glass-panel" style={{ padding: '28px 24px', textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'rgba(2, 132, 199, 0.1)',
          color: 'var(--medical-blue)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px'
        }}>
          <Clock size={24} />
        </div>
        <h3 style={{ margin: '0 0 6px', fontSize: '1.05rem' }}>
          {language === 'HI' ? 'कोई सक्रिय ओपीडी टोकन नहीं' : 'No Active OPD Appointments'}
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto 14px' }}>
          {language === 'HI'
            ? 'अपनी पसंद के अस्पताल में डॉक्टर परामर्श हेतु तुरंत लाइव डिजिटल टोकन बुक करें।'
            : 'Book a consultation slot with a specialist doctor at an empaneled hospital to receive your live digital token.'}
        </p>
        {onBookNew && (
          <button onClick={onBookNew} className="btn btn-primary btn-sm">
            <CalendarPlus size={15} /> {language === 'HI' ? 'नया ओपीडी स्लॉट बुक करें' : 'Book OPD Slot Now'}
          </button>
        )}
      </div>
    );
  }

  const tokensAhead = Math.max(0, activeToken.tokenNumber - activeToken.currentServingToken);
  const isServingNow = activeToken.currentServingToken === activeToken.tokenNumber;

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Clock size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {language === 'HI' ? 'लाइव ओपीडी टोकन कतार एवं प्रतीक्षा ट्रैकर' : 'Live OPD Digital Token Queue & Wait-Time HUD'}
              <span className="live-dot" />
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              {activeToken.hospitalName} • {activeToken.department} ({activeToken.doctorName})
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleAdvanceQueue} className="btn btn-secondary btn-sm" title="Advance token for demonstration">
            Advance Queue (+1 Demo)
          </button>
          <button onClick={() => onOpenPass(activeToken)} className="btn btn-primary btn-sm">
            View QR Pass
          </button>
        </div>
      </div>

      {activeToken.doctorDelayNotes && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid var(--warning-amber)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.84rem',
          color: 'var(--text-main)'
        }}>
          <AlertTriangle size={18} color="var(--warning-amber)" />
          <div>
            <strong>Doctor OPD Status:</strong> {activeToken.doctorDelayNotes}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{
          background: 'var(--bg-secondary)',
          border: '2px solid var(--medical-blue)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {language === 'HI' ? 'आपका टोकन नंबर' : 'YOUR TOKEN NUMBER'}
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--medical-blue)', lineHeight: 1.1, margin: '6px 0' }}>
            #{activeToken.tokenNumber}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Ref: {activeToken.referenceId}
          </div>
        </div>

        <div style={{
          background: 'var(--bg-secondary)',
          border: isServingNow ? '2px solid var(--success-emerald)' : '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {language === 'HI' ? 'वर्तमान में सेवा चालू' : 'NOW SERVING'}
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: isServingNow ? 'var(--success-emerald)' : 'var(--text-main)', lineHeight: 1.1, margin: '6px 0' }}>
            #{activeToken.currentServingToken}
          </div>
          <div style={{ fontSize: '0.78rem', color: isServingNow ? 'var(--success-emerald)' : 'var(--text-muted)', fontWeight: isServingNow ? 700 : 400 }}>
            {isServingNow ? '★ YOUR TURN NOW ★' : `${tokensAhead} patients ahead of you`}
          </div>
        </div>

        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {language === 'HI' ? 'अनुमानित प्रतीक्षा समय' : 'ESTIMATED WAIT'}
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: tokensAhead <= 1 ? 'var(--success-emerald)' : 'var(--warning-amber)', lineHeight: 1.1, margin: '6px 0' }}>
            ~{activeToken.estimatedWaitMinutes} <span style={{ fontSize: '1rem', fontWeight: 600 }}>min</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Slot: {activeToken.appointmentSlot}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
          <span>Queue Progression</span>
          <span>Token {activeToken.currentServingToken} of {activeToken.tokenNumber}</span>
        </div>
        <div style={{ height: '8px', background: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${Math.min(100, (activeToken.currentServingToken / activeToken.tokenNumber) * 100)}%`,
              background: 'linear-gradient(90deg, var(--medical-blue), var(--success-emerald))',
              transition: 'width 0.4s ease'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          <Bell size={15} color="var(--medical-teal)" />
          <span>Automated SMS/WhatsApp alerts enabled for mobile <strong>+91 98201 54821</strong></span>
        </div>

        <button onClick={handleSendSMSAlert} className="btn btn-secondary btn-sm">
          <MessageSquare size={14} />
          {smsSent ? 'Simulated SMS Sent!' : 'Simulate WhatsApp Queue Alert'}
        </button>
      </div>
    </div>
  );
};
