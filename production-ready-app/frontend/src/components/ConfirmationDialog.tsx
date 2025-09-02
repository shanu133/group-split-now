import React from 'react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="confirmation-dialog">
      <div className="dialog-content">
        <p>{message}</p>
        <div className="dialog-actions">
          <button onClick={onConfirm}>Confirm</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;