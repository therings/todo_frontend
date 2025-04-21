import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Slider,
  Stack,
  Divider,
  TextField,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import Cropper from "react-easy-crop";
import {
  ZoomIn,
  ZoomOut,
  Rotate90DegreesCcw,
  Logout,
} from "@mui/icons-material";

const API_URL = process.env.REACT_APP_API_URL?.endsWith("/")
  ? process.env.REACT_APP_API_URL.slice(0, -1)
  : process.env.REACT_APP_API_URL ||
    "https://todo-backend-nine-wine.vercel.app";

// Constants for file and image restrictions
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGE_DIMENSION = 800; // Maximum width/height for the image

// Helper function to create an Image object from a URL
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });

// Helper function to crop, rotate, and compress the selected image
const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Calculate the maximum size while maintaining aspect ratio
  let width = pixelCrop.width;
  let height = pixelCrop.height;
  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    const ratio = Math.min(
      MAX_IMAGE_DIMENSION / width,
      MAX_IMAGE_DIMENSION / height
    );
    width *= ratio;
    height *= ratio;
  }

  // Set canvas size to the compressed dimensions
  canvas.width = width;
  canvas.height = height;

  // Draw the cropped/rotated image
  ctx.translate(width / 2, height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-width / 2, -height / 2);

  // Calculate scaling to fit the crop area into the canvas
  const scale = Math.min(width / pixelCrop.width, height / pixelCrop.height);
  const scaledWidth = image.width * scale;
  const scaledHeight = image.height * scale;

  ctx.drawImage(
    image,
    -pixelCrop.x * scale,
    -pixelCrop.y * scale,
    scaledWidth,
    scaledHeight
  );

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(URL.createObjectURL(blob));
      },
      "image/jpeg",
      0.6 // Increased compression (lower quality) to reduce file size
    );
  });
};

const ProfilePicture = ({ size = 40 }) => {
  const { user, updateUser, logout } = useAuth();
  console.log("ProfilePicture component - Current user:", user);

  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openNameDialog, setOpenNameDialog] = useState(false);
  const [error, setError] = useState("");
  const [newName, setNewName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  // Effect for handling dark mode changes
  useEffect(() => {
    const updateDarkMode = () => {
      const newDarkMode = localStorage.getItem("darkMode") === "true";
      setDarkMode(newDarkMode);
    };

    // Initial check
    updateDarkMode();

    // Listen for dark mode changes
    window.addEventListener("storage", updateDarkMode);
    window.addEventListener("darkModeChange", updateDarkMode);

    return () => {
      window.removeEventListener("storage", updateDarkMode);
      window.removeEventListener("darkModeChange", updateDarkMode);
    };
  }, []); // Empty dependency array since updateDarkMode is defined inside

  const dialogStyle = {
    "& .MuiDialog-paper": {
      bgcolor: darkMode ? "#1e1e1e" : "#ffffff",
      color: darkMode ? "#ffffff" : "#000000",
    },
    "& .MuiDialogTitle-root": {
      borderBottom: `1px solid ${darkMode ? "#424242" : "#e0e0e0"}`,
    },
  };

  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      color: darkMode ? "#ffffff" : "#000000",
      "& fieldset": {
        borderColor: darkMode ? "#424242" : "#e0e0e0",
      },
      "&:hover fieldset": {
        borderColor: darkMode ? "#ffffff" : "#000000",
      },
    },
    "& .MuiInputLabel-root": {
      color: darkMode ? "#ffffff" : "#000000",
    },
  };

  // State for image cropping and manipulation
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

  // Handle menu anchor for profile dropdown
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setError("");
    setSelectedFile(null);
    setPreviewUrl(null);
    setCrop({ x: 0, y: 0 });
    setRotation(0);
    setZoom(1);
    handleClose();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError("");
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsCropping(false);
  };

  const handleOpenNameDialog = () => {
    setOpenNameDialog(true);
    setNewName(user?.name || "");
    handleClose();
  };

  const handleCloseNameDialog = () => {
    setOpenNameDialog(false);
    setError("");
  };

  // Validate uploaded file type and size
  const validateFile = (file) => {
    if (!file.type.startsWith("image/")) {
      throw new Error("Please select an image file");
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File size should be less than 5MB");
    }
  };

  // Handle file selection and create preview
  const handleFileSelect = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      validateFile(file);
      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
      setError("");
    } catch (error) {
      setError(error.message);
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  // Update cropped area pixels when crop selection changes
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Process and upload the cropped image to the server
  const handleUpdatePicture = async () => {
    if (!selectedFile || !croppedAreaPixels) {
      setError("Please select and crop an image");
      return;
    }

    try {
      setError("");
      const croppedImage = await getCroppedImg(
        previewUrl,
        croppedAreaPixels,
        rotation
      );

      const response = await fetch(croppedImage);
      const blob = await response.blob();
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64String = reader.result;

        const token = localStorage.getItem("token");
        const response = await axios.post(
          `${API_URL}/api/users/update-profile-picture`,
          {
            pictureUrl: base64String,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        updateUser(response.data.user);
        handleCloseDialog();
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Update picture error:", error);
      setError(
        error.response?.data?.error || "Failed to update profile picture"
      );
    }
  };

  // Reset profile picture to default
  const handleResetPicture = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/users/reset-profile-picture`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      updateUser(response.data.user);
      handleClose();
    } catch (error) {
      console.error("Failed to reset profile picture:", error);
      setError(
        error.response?.data?.error || "Failed to reset profile picture"
      );
    }
  };

  // Update user's display name
  const handleUpdateName = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/users/update-name`,
        {
          name: newName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      updateUser(response.data.user);
      handleCloseNameDialog();
    } catch (error) {
      console.error("Update name error:", error);
      setError(error.response?.data?.error || "Failed to update name");
    }
  };

  return (
    <>
      {/* Avatar button to open profile menu */}
      <IconButton onClick={handleClick}>
        <Avatar
          src={user?.picture}
          alt={user?.name}
          sx={{ width: size, height: size }}
        />
      </IconButton>

      {/* Profile dropdown menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            bgcolor: darkMode ? "#1e1e1e" : "#ffffff",
            color: darkMode ? "#ffffff" : "#000000",
            "& .MuiDivider-root": {
              borderColor: darkMode ? "#424242" : "#e0e0e0",
            },
            "& .MuiTypography-root.MuiTypography-caption": {
              color: darkMode ? "#9e9e9e" : "text.secondary",
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            {user?.name}
          </Typography>
          {user?.isGooglePicture && (
            <Typography variant="caption">
              Using Google Profile Picture
            </Typography>
          )}
        </Box>
        <Divider />
        <MenuItem onClick={handleOpenNameDialog}>Change Name</MenuItem>
        {!user?.isGooglePicture && (
          <MenuItem onClick={handleOpenDialog}>Change Picture</MenuItem>
        )}
        <Divider />
        <MenuItem
          onClick={() => {
            handleClose();
            logout();
          }}
          sx={{
            color: "error.main",
            "&:hover": {
              bgcolor: darkMode ? "rgba(211, 47, 47, 0.08)" : undefined,
            },
          }}
        >
          <Logout sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Dialog for updating profile picture */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        sx={dialogStyle}
      >
        <DialogTitle>Update Profile Picture</DialogTitle>
        <DialogContent>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <Box sx={{ textAlign: "center", my: 2 }}>
            {isCropping && previewUrl ? (
              <Box sx={{ position: "relative", height: 400, mb: 2 }}>
                <Cropper
                  image={previewUrl}
                  crop={crop}
                  rotation={rotation}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onRotationChange={setRotation}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </Box>
            ) : (
              <Box sx={{ mb: 2 }}>
                <Stack spacing={2} alignItems="center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                    ref={fileInputRef}
                  />
                  <Button
                    variant="outlined"
                    onClick={() => fileInputRef.current.click()}
                    sx={{
                      borderWidth: 1,
                      borderColor: darkMode ? "#ffffff" : "primary.main",
                      color: darkMode ? "#ffffff" : "primary.main",
                      "&:hover": {
                        borderWidth: 1,
                        borderColor: darkMode ? "#ffffff" : "primary.main",
                        backgroundColor: darkMode
                          ? "rgba(255, 255, 255, 0.08)"
                          : "rgba(25, 118, 210, 0.04)",
                      },
                    }}
                  >
                    SELECT IMAGE
                  </Button>
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ color: darkMode ? "#ffffff" : "text.secondary" }}
                  >
                    Maximum file size: 5MB
                  </Typography>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => {
                      handleResetPicture();
                      handleCloseDialog();
                    }}
                    sx={{
                      borderWidth: 1,
                      "&:hover": {
                        borderWidth: 1,
                        backgroundColor: darkMode
                          ? "rgba(211, 47, 47, 0.08)"
                          : "rgba(211, 47, 47, 0.04)",
                      },
                    }}
                  >
                    RESET TO DEFAULT
                  </Button>
                </Stack>
              </Box>
            )}

            {isCropping && (
              <Stack spacing={2} sx={{ px: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    color: darkMode ? "#ffffff" : "inherit",
                  }}
                >
                  <ZoomOut />
                  <Slider
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    onChange={(e, zoom) => setZoom(zoom)}
                    sx={{
                      color: darkMode ? "#ffffff" : "primary.main",
                      "& .MuiSlider-rail": {
                        backgroundColor: darkMode ? "#424242" : undefined,
                      },
                    }}
                  />
                  <ZoomIn />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    color: darkMode ? "#ffffff" : "inherit",
                  }}
                >
                  <Rotate90DegreesCcw />
                  <Slider
                    value={rotation}
                    min={0}
                    max={360}
                    step={90}
                    onChange={(e, rotation) => setRotation(rotation)}
                    sx={{
                      color: darkMode ? "#ffffff" : "primary.main",
                      "& .MuiSlider-rail": {
                        backgroundColor: darkMode ? "#424242" : undefined,
                      },
                    }}
                  />
                </Box>
              </Stack>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            sx={{ color: darkMode ? "#ffffff" : undefined }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdatePicture}
            variant="contained"
            disabled={!selectedFile || !isCropping}
            sx={{
              bgcolor: darkMode ? "#1976d2" : undefined,
              "&:hover": {
                bgcolor: darkMode ? "#1565c0" : undefined,
              },
            }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for changing display name */}
      <Dialog
        open={openNameDialog}
        onClose={handleCloseNameDialog}
        maxWidth="xs"
        fullWidth
        sx={dialogStyle}
      >
        <DialogTitle>Change Name</DialogTitle>
        <DialogContent>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <TextField
            autoFocus
            margin="dense"
            type="text"
            fullWidth
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            variant="outlined"
            sx={{ ...inputStyle, mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseNameDialog}
            sx={{ color: darkMode ? "#ffffff" : undefined }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateName}
            variant="contained"
            disabled={!newName.trim() || newName === user?.name}
            sx={{
              bgcolor: darkMode ? "#1976d2" : undefined,
              "&:hover": {
                bgcolor: darkMode ? "#1565c0" : undefined,
              },
            }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProfilePicture;
