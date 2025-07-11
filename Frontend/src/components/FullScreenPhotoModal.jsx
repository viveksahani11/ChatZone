const FullScreenPhotoModal = ({ image, onClose }) => (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center cursor-pointer"
    >
      <img src={image} alt="Full DP" className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-xl" />
    </div>
  );
  
  export default FullScreenPhotoModal;
  