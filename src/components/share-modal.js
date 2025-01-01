import React, { useEffect, useRef } from 'react';
import '../styles/modal.css';

const ShareModal = ({ onClose }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    
    // Add a small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      if (!mounted) return;
      
      const handleEscape = (e) => {
        if (e.key === 'Escape' && onClose) {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      
      if (modalRef.current) {
        modalRef.current.classList.add('show');
      }

      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }, 100);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [onClose]);

  const handleShare = () => {
    // Implement share functionality here
    console.log('Share button clicked');
  };

  const handleClose = () => {
    if (modalRef.current) {
      modalRef.current.classList.remove('show');
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <div id="share-modal" className="modal" onClick={handleClose} ref={modalRef}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Share Chat</h2>
        <button onClick={handleShare}>Share</button>
        <button onClick={handleClose}>Close</button>
      </div>
    </div>
  );
};

export default ShareModal;
