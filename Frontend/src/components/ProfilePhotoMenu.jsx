import { useRef } from "react";
import { Eye, Camera, Upload, Trash } from "lucide-react";

const ProfilePhotoMenu = ({
  onView,
  onUpload,
  onRemove,
  onTakePhoto,
}) => {
  const uploadRef = useRef();

  return (
    <div className="absolute bottom-0 right-0 z-20 bg-base-100 rounded-xl shadow-xl border border-base-300 w-44">
      <ul className="p-2 text-sm text-base-content">
        <li
          className="flex items-center gap-2 px-3 py-2 hover:bg-base-200 cursor-pointer rounded"
          onClick={onView}
        >
          <Eye className="w-4 h-4" />
          View photo
        </li>
        <li
          className="flex items-center gap-2 px-3 py-2 hover:bg-base-200 cursor-pointer rounded"
          onClick={onTakePhoto}
        >
          <Camera className="w-4 h-4" />
          Take photo
        </li>
        <li
          className="flex items-center gap-2 px-3 py-2 hover:bg-base-200 cursor-pointer rounded"
          onClick={() => uploadRef.current.click()}
        >
          <Upload className="w-4 h-4" />
          Upload photo
        </li>
        <li
          className="flex items-center gap-2 px-3 py-2 hover:bg-red-100 text-red-500 cursor-pointer rounded"
          onClick={onRemove}
        >
          <Trash className="w-4 h-4" />
          Remove photo
        </li>
        <input
          ref={uploadRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onUpload}
        />
      </ul>
    </div>
  );
};

export default ProfilePhotoMenu;
