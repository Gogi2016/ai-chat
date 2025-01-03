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

    // Add event listener and show modal
    document.addEventListener('keydown', handleEscape);
    
    // Add show class after a small delay to ensure the modal is mounted
    setTimeout(() => {
      const modal = modalRef.current;
      if (modal) {
        modal.classList.add('show');
      }
    }, 0);

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleEscape);
      const modal = modalRef.current;
      if (modal && modal.classList) {
        modal.classList.remove('show');
      }
    };
  }, [onClose]);

  const handleShare = () => {
    console.log('Share button clicked');
  };

  const handleClose = () => {
    const modal = modalRef.current;
    if (modal && modal.classList) {
      modal.classList.remove('show');
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <div id="share-modal" className="modal" onClick={handleClose} ref={modalRef}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Share Chat</h2>
        <div className="share-options">
          <button onClick={handleShare}>Share Link</button>
          <button onClick={handleClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
