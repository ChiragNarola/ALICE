import React from 'react';

interface EmailPreviewProps {
  userName: string;
  inviterName: string;
  joinUrl: string;
  temporaryPassword?: string;
}

const EmailPreview: React.FC<EmailPreviewProps> = ({ userName, inviterName, joinUrl, temporaryPassword }) => {
  console.log("inviterName: ", inviterName)
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-gray-50 scale-90 origin-top">
      <div className="bg-white max-w-[600px] mx-auto my-4 rounded-lg overflow-hidden shadow-sm">
        {/* Header */}
        <div style={{ backgroundColor: '#134e4a', padding: '12px 20px', textAlign: 'center', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src="/favicon.ico"
            alt="Alice Logo"
            style={{ height: '60px', width: 'auto', display: 'block', margin: '0 auto' }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=ALICE';
            }}
          />
        </div>

        {/* Content */}
        <div style={{ padding: '30px', color: '#334155', lineHeight: '1.6', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#1a1a1a', fontSize: '18px', marginBottom: '15px' }}>Hello {userName || '[User Name]'},</h2>
          <p style={{ fontSize: '14px', marginBottom: '20px' }}>
            You have been invited to join <span style={{ color: '#134e4a', fontWeight: 'bold' }}>ALICE</span>, the All-round Learning, Insights & Childcare Expert.
          </p>
          <p style={{ fontSize: '14px', marginBottom: '20px' }}>
            ALICE has been created by childcare experts to support you with ideas, inspiration and guidance to help your child learn, play and develop.
          </p>
          <p style={{ fontSize: '14px', marginBottom: '10px', fontWeight: 'bold' }}>
            You can ask ALICE for:
          </p>
          <ul style={{ fontSize: '14px', marginBottom: '20px', paddingLeft: '20px', listStyleType: 'disc' }}>
            <li style={{ marginBottom: '8px' }}>Activity ideas tailored to your child’s age and interests</li>
            <li style={{ marginBottom: '8px' }}>Simple ways to support learning at home</li>
            <li style={{ marginBottom: '8px' }}>Inspiration for play, routines and everyday moments</li>
            <li style={{ marginBottom: '0' }}>Answers to those questions you’re not quite sure who to ask</li>
          </ul>
          <p style={{ fontSize: '14px', marginBottom: '20px' }}>
            Simply click below and use your <strong>temporary password</strong> to log in:
          </p>

          <div style={{
            backgroundColor: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            margin: '20px 0',
            textAlign: 'center'
          }}>
            <span style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 'bold',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              marginBottom: '8px'
            }}>
              Your Temporary Password
            </span>
            <span style={{
              display: 'block',
              fontFamily: 'monospace',
              fontSize: '22px',
              fontWeight: 'bold',
              color: '#134e4a',
              letterSpacing: '3px'
            }}>
              {temporaryPassword || '********'}
            </span>
          </div>

          <div style={{ textAlign: 'center', marginTop: '25px' }}>
            <a
              href={joinUrl}
              style={{
                display: 'inline-block',
                backgroundColor: '#134e4a',
                color: '#ffffff',
                textDecoration: 'none',
                padding: '12px 30px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px'
              }}
              onClick={(e) => e.preventDefault()}
            >
              Access Alice Platform
            </a>
          </div>

          <p style={{ marginTop: '30px', fontSize: '12px', color: '#94a3b8' }}>
            If the button above does not work, copy and paste the following link into your browser:
            <br />
            <span style={{ color: '#134e4a', wordBreak: 'break-all' }}>{joinUrl || 'https://alice-platform.com/join/...'}</span>
          </p>
        </div>

        {/* Footer */}
        <div style={{ backgroundColor: '#f8fafc', padding: '15px', textAlign: 'center', fontSize: '11px', color: '#64748b', borderTop: '1px solid #e2e8f0' }}>
          <p style={{ margin: '3px 0' }}>&copy; 2026 ALICE Management System. All rights reserved.</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    </div>
  );
};

export default EmailPreview;
