import React, { ReactNode, useState } from 'react';
import { decodeHtml } from '../../Utils/String.utils';

interface ConfirmButtonProps {
  onConfirm: () => void;
  children: ReactNode;
  buttonClassName?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmButton: React.FC<ConfirmButtonProps> = ({
  onConfirm,
  children,
  buttonClassName,
  message = 'Are you sure you want to delete this?',
  confirmText = 'Yes',
  cancelText = 'No',
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className={buttonClassName} onClick={() => setOpen(true)} style={{ display: 'inline-block' }}>
        {children}
      </button>

      {open && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: "gray",
            padding: '15px',
            borderRadius: '10px',
            maxWidth: '80%',
            textAlign: 'center',
          }}>
            <p style={{ marginBottom: '1em', fontSize: "20px", color: "white" }}>{decodeHtml(message)}</p>
            <div
              style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
              <button
                onClick={() => { setOpen(false); onConfirm(); }}
                className={"buttonBasic"}
              >
                {confirmText}
              </button>
              <button
                onClick={() => setOpen(false)}
                className={"buttonBasic"}
              >
                {cancelText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
