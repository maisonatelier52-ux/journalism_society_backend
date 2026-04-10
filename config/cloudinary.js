// // config/cloudinary.js
// // ─────────────────────────────────────────────────────────────────────────────
// // NEW FILE — create this at: journalism-backend/config/cloudinary.js
// // ─────────────────────────────────────────────────────────────────────────────
// import { v2 as cloudinary } from "cloudinary";
// import { Readable } from "stream";
// import dotenv from "dotenv";

// dotenv.config();

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key:    process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// /**
//  * Maps a file's original name to the correct Cloudinary resource_type.
//  *
//  * Cloudinary REQUIRES the correct resource_type or upload fails:
//  *   "image" → jpg, jpeg, png, gif, webp, svg
//  *   "video" → mp4, mov, avi, webm
//  *   "raw"   → pdf, doc, docx, xls, xlsx, csv, txt (everything else)
//  */
// const getResourceType = (originalName) => {
//   const ext = originalName.split(".").pop().toLowerCase();
//   const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
//   const videoExts = ["mp4", "mov", "avi", "webm", "mkv"];
//   if (imageExts.includes(ext)) return "image";
//   if (videoExts.includes(ext)) return "video";
//   return "raw"; // pdf, doc, docx, xls, xlsx, csv → raw
// };

// /**
//  * Upload a file buffer to Cloudinary.
//  * Called from submissionRoutes.js and adminRoutes.js instead of saving to disk.
//  *
//  * @param {Buffer} buffer        File buffer from multer memoryStorage
//  * @param {string} originalName  Original filename e.g. "report.pdf"
//  * @param {string} folder        Cloudinary folder: "submissions" | "exhibits" | "documents" | "press-releases"
//  * @returns {Promise<{ url: string, publicId: string, resourceType: string }>}
//  */
// export const uploadToCloudinary = (buffer, originalName, folder = "uploads") => {
//   return new Promise((resolve, reject) => {
//     const resourceType = getResourceType(originalName);

//     const ts     = Date.now();
//     const rand   = Math.floor(Math.random() * 1e6);
//     const ext = originalName.split(".").pop();
//     const publicId = `${folder}/${folder}-${ts}-${rand}.${ext}`;

//     const uploadStream = cloudinary.uploader.upload_stream(
//       {
//         folder,
//         resource_type: resourceType,
//         public_id: publicId,
//         use_filename: false,
//         overwrite: false,
//         // Do NOT set allowed_formats — causes issues with raw files
//       },
//       (error, result) => {
//         if (error) {
//           console.error("Cloudinary upload error:", error);
//           return reject(new Error(`Cloudinary upload failed: ${error.message}`));
//         }
//         resolve({
//           url: result.secure_url,   // permanent https:// Cloudinary URL
//           publicId: result.public_id,
//           resourceType: result.resource_type,
//         });
//       }
//     );

//     // Convert buffer to a readable stream and pipe into Cloudinary
//     const readable = new Readable();
//     readable.push(buffer);
//     readable.push(null);
//     readable.pipe(uploadStream);
//   });
// };

// /**
//  * Delete a file from Cloudinary (optional — call when docket is deleted).
//  *
//  * @param {string} publicId      Cloudinary public_id
//  * @param {string} resourceType  "image" | "raw" | "video"
//  */
// export const deleteFromCloudinary = async (publicId, resourceType = "raw") => {
//   try {
//     await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
//     console.log(`Deleted from Cloudinary: ${publicId}`);
//   } catch (error) {
//     console.error("Cloudinary delete error:", error);
//     // Non-fatal — log and continue
//   }
// };

// export default cloudinary;

// config/cloudinary.js
// ─────────────────────────────────────────────────────────────────────────────
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Determine correct Cloudinary resource_type
 */
const getResourceType = (originalName) => {
  const ext = originalName.split(".").pop().toLowerCase();

  const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
  const videoExts = ["mp4", "mov", "avi", "webm", "mkv"];

  if (imageExts.includes(ext)) return "image";
  if (videoExts.includes(ext)) return "video";

  return "raw"; // pdf, doc, excel ✅
};

/**
 * Upload file buffer to Cloudinary
 */
export const uploadToCloudinary = (buffer, originalName, folder = "uploads") => {
  return new Promise((resolve, reject) => {
    const resourceType = getResourceType(originalName);

    const ts = Date.now();
    const rand = Math.floor(Math.random() * 1e6);

    // ✅ Keep extension
    const ext = originalName.split(".").pop();

    // ✅ Clean filename (remove spaces)
    const safeName = originalName.replace(/\s+/g, "-");

    // ✅ Clean public_id (NO duplicate folder)
   const publicId = `${folder}-${ts}-${rand}-${safeName}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        public_id: publicId,
        type: "upload", // 🔥 IMPORTANT (forces public access)
        access_mode: "public", // 🔥 ensure public
        use_filename: false,
        overwrite: false,
    },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return reject(new Error(`Cloudinary upload failed: ${error.message}`));
        }

        resolve({
          url: result.secure_url,       // ✅ final usable URL
          publicId: result.public_id,  // for deletion
          resourceType: result.resource_type,
          fileName: safeName,          // optional: store original name
        });
      }
    );

    // Convert buffer → stream
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

/**
 * Delete file from Cloudinary
 */
export const deleteFromCloudinary = async (publicId, resourceType = "raw") => {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    console.log(`Deleted from Cloudinary: ${publicId}`);
  } catch (error) {
    console.error("Cloudinary delete error:", error);
  }
};

export default cloudinary;