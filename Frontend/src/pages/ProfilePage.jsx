import { useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Eye, ImagePlus, Trash2, Mail, User } from "lucide-react";

import toast from "react-hot-toast";
import { useFloating, offset, useClick, useDismiss, useInteractions } from "@floating-ui/react";
import ImageCropModal from "../components/ImageCropModal";
import FullScreenPhotoModal from "../components/FullScreenPhotoModal";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();

  const [selectedImg, setSelectedImg] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(authUser.fullName);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [rawImg, setRawImg] = useState(null);
  const uploadInputRef = useRef(null);

  // Floating UI setup
  const [showMenu, setShowMenu] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    open: showMenu,
    onOpenChange: setShowMenu,
    middleware: [offset(10)],
  });
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setRawImg(reader.result);
      setShowCropModal(true);
    };
  };

  const handleCropDone = async (croppedImage) => {
    setSelectedImg(croppedImage);
    setShowCropModal(false);
    await updateProfile({ profilePic: croppedImage });
  };

  const handleRemovePhoto = async () => {
    setIsRemoving(true);
    try {
      await updateProfile({ profilePic: "" });
      // toast.success("Profile photo removed ✅");
    } catch (error) {
      console.log("Error in handleRemovePhoto", error);
      toast.error("Failed to remove profile photo");
    } finally {
      setIsRemoving(false);
    }
    // toast.success("Profile photo removed ✅");
  };

  const handleNameUpdate = async () => {
    if (editedName.trim() === "") return toast.error("Name cannot be empty");
    await updateProfile({ fullName: editedName });
    // toast.success("Profile updated successfully ✅");
    setIsEditing(false);
  };

  return (
    <div className="h-screen pt-20 bg-base-100">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4 cursor-pointer"
                onClick={() => setShowFullImage(true)}
              />

              <button
                className={`absolute bottom-0 right-0 bg-base-content p-2 rounded-full`}
                ref={refs.setReference}
                {...getReferenceProps()}
              >
                <Camera className="w-5 h-5 text-base-100" />
              </button>
              

              {showMenu && (
                <div
                  ref={refs.setFloating}
                  style={floatingStyles}
                  {...getFloatingProps()}
                  className="z-50 w-44 bg-base-100 rounded-xl shadow-xl border text-sm overflow-hidden"
                >
                  <ul className="flex flex-col py-1">
                    <li>
                      <button
                        onClick={() => {
                          setShowFullImage(true);
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 hover:bg-base-200 flex items-center gap-2 text-left"
                      >
                        <Eye className="w-4 h-4" />
                        View photo
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          uploadInputRef.current.click();
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 hover:bg-base-200 flex items-center gap-2 text-left"
                      >
                        <ImagePlus className="w-4 h-4" />
                        Upload photo
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={handleRemovePhoto}
                        className="w-full px-4 py-2 text-red-500 hover:bg-base-200 flex items-center gap-2 text-left"
                        
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove photo
                      </button>
                    </li>
                  </ul>
                </div>
              )}



              <input
                type="file"
                ref={uploadInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUpdatingProfile}
              />
            </div>
            
            <p className="text-sm text-zinc-400 min-h-[20px]">
              {isUpdatingProfile ? "Uploading..." : "Tap photo or camera to update"}
              {isUpdatingProfile && <span className="loading loading-spinner loading-xs"></span>}
            </p>
          </div>


          {/* Full Name */}
          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              {isEditing ? (
                <input
                  type="text"
                  className="input input-bordered w-full text-base"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  disabled={isUpdatingProfile}
                />
              ) : (
                <div
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2.5 bg-base-200 rounded-lg border cursor-pointer hover:bg-base-100 transition-all"
                >
                  {authUser?.fullName}
                </div>
              )}
            </div>

            {/* Email (read-only) */}
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.email}</p>
            </div>
          </div>

          {/* Save Name Button */}
          {isEditing && (
            <button
              className="btn btn-primary mt-4 w-full"
              onClick={handleNameUpdate}
              disabled={isUpdatingProfile}
            >
              {isUpdatingProfile ? "Saving..." : "Save Changes"}
            </button>
          )}

          {/* Account Info */}
          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCropModal && (
        <ImageCropModal
          image={rawImg}
          onCropDone={handleCropDone}
          onClose={() => setShowCropModal(false)}
        />
      )}
      {showFullImage && (
        <FullScreenPhotoModal
          image={selectedImg || authUser.profilePic || "/avatar.png"}
          onClose={() => setShowFullImage(false)}
        />
      )}
    </div>
  );
};

export default ProfilePage;
