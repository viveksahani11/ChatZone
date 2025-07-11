import {
  useFloating,
  offset,
  useDismiss,
  useRole,
  useClick,
  useInteractions,
  FloatingPortal,
} from '@floating-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Eye,
  Camera,
  Upload,
  Trash
} from 'lucide-react';
import { useRef } from 'react';

const PhotoMenu = ({
  open,
  onViewClick,
  onTakePhotoClick,
  onUploadClick,
  onRemoveClick,
  onClose,
  referenceEl,
}) => {
  const buttonRef = useRef(null);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: onClose,
    middleware: [offset(8)],
    placement: 'bottom',
    elements: {
      reference: referenceEl,
    },
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  return (
    <>
      <button ref={refs.setReference} className="hidden" {...getReferenceProps()} />
      <FloatingPortal>
        <AnimatePresence>
          {open && (
            <motion.div
              ref={refs.setFloating}
              style={floatingStyles}
              className="z-50 w-56 rounded-xl border border-base-300 bg-base-100 p-1 shadow-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              {...getFloatingProps()}
            >
              <ul className="text-sm text-base-content divide-y divide-base-300">
                <li>
                  <button
                    onClick={onViewClick}
                    className="flex w-full items-center gap-3 px-4 py-3 hover:bg-base-200 rounded-lg transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    View photo
                  </button>
                </li>
                <li>
                  <button
                    onClick={onTakePhotoClick}
                    className="flex w-full items-center gap-3 px-4 py-3 hover:bg-base-200 rounded-lg transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    Take photo
                  </button>
                </li>
                <li>
                  <button
                    onClick={onUploadClick}
                    className="flex w-full items-center gap-3 px-4 py-3 hover:bg-base-200 rounded-lg transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    Upload photo
                  </button>
                </li>
                <li>
                  <button
                    onClick={onRemoveClick}
                    className="flex w-full items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-100 rounded-lg transition-all"
                  >
                    <Trash className="w-4 h-4" />
                    Remove photo
                  </button>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </FloatingPortal>
    </>
  );
};

export default PhotoMenu;
