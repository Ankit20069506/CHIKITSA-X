import React from 'react';
import type { UserRole, AppLanguage } from '../../types';
import { UserCheck, Stethoscope, Building2 } from 'lucide-react';

interface Props {
  currentRole: UserRole;
  language: AppLanguage;
  onRoleChange: (role: UserRole) => void;
}

export const RoleSwitcherBarV2: React.FC<Props> = ({ currentRole, onRoleChange }) => {
  return (
    <div style={{
      background: '#090d16',
      borderBottom: '1px solid #1f2937',
      padding: '8px 20px',
      color: '#ffffff',
      fontSize: '0.8rem'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="live-dot" style={{ backgroundColor: '#38bdf8' }} />
          <strong style={{ color: '#38bdf8' }}>CHIKITSA-X NEXT Live Role Switcher:</strong>
          <span style={{ color: '#94a3b8' }}>Switch personas instantly for judging & evaluation:</span>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => onRoleChange('PATIENT')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: currentRole === 'PATIENT' ? '1px solid #38bdf8' : '1px solid #374151',
              background: currentRole === 'PATIENT' ? '#0284c7' : '#1f2937',
              color: '#ffffff'
            }}
          >
            <UserCheck size={13} /> Patient (Ankit Patel)
          </button>

          <button
            onClick={() => onRoleChange('DOCTOR')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: currentRole === 'DOCTOR' ? '1px solid #10b981' : '1px solid #374151',
              background: currentRole === 'DOCTOR' ? '#0d9488' : '#1f2937',
              color: '#ffffff'
            }}
          >
            <Stethoscope size={13} /> Doctor (Dr. Kulkarni)
          </button>

          <button
            onClick={() => onRoleChange('HOSPITAL_ADMIN')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: currentRole === 'HOSPITAL_ADMIN' ? '1px solid #f97316' : '1px solid #374151',
              background: currentRole === 'HOSPITAL_ADMIN' ? '#ea580c' : '#1f2937',
              color: '#ffffff'
            }}
          >
            <Building2 size={13} /> Hospital Admin (Priya)
          </button>
        </div>
      </div>
    </div>
  );
};
