import React from 'react';
import type { Hospital, AppLanguage } from '../../types';
import { AmbulanceLiveTrackingModal } from '../emergency/AmbulanceLiveTrackingModal';

interface Props {
  language: AppLanguage;
  targetHospital?: Hospital | null;
  onClose: () => void;
}

export const EmergencyRadarModal: React.FC<Props> = ({ language, targetHospital, onClose }) => {
  return (
    <AmbulanceLiveTrackingModal
      language={language}
      targetHospital={targetHospital}
      onClose={onClose}
    />
  );
};
