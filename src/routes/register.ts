import express from "express";
import multer from "multer";
import { supabase } from "../lib/supabase";
import { registerSchema } from "../middleware/validate";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_, file, cb) => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/jpg"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only PNG and JPG allowed"));
    }
  },
});

router.post("/", upload.single("paymentScreenshot"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Screenshot required" });
    }

    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid form data" });
    }

    const filePath = `screenshots/${Date.now()}_${parsed.data.phone}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("screenshots")
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
      });

    if (uploadError) {
      return res.status(500).json({ error: "File upload failed" });
    }

    const { data: publicUrl } = supabase.storage
      .from("screenshots")
      .getPublicUrl(filePath);

    const { error: dbError } = await supabase.from("registrations").insert([
      {
        ...parsed.data,
        payment_screenshot: publicUrl.publicUrl,
      },
    ]);

    if (dbError) {
        if (dbError.code === "23505") {
            if (dbError.details?.includes("(email)=")) {
                return res.status(400).json({
                error: "This Email ID has already been used.",
                });
            }

            if (dbError.details?.includes("(phone)=")) {
                return res.status(400).json({
                error: "This phone number is already registered.",
                });
            }
        }
    }

    return res.status(200).json({
      success: true,
      message: "Registration successful",
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
