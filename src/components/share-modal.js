import React, { useEffect, useRef } from 'react';
import '../styles/modal.css';

const ShareModal = ({ onClose }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleEscape);

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleShare = () => {
    console.log('Share button clicked');
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="modal" onClick={handleClose} ref={modalRef}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Share this conversation</h2>
        <button onClick={handleShare}>Share</button>
        <button onClick={handleClose}>Close</button>
      </div>
    </div>
  );
};

export default ShareModal;
