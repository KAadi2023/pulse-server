import multer from "multer";

const multerUpload = multer({
    limits: {
        fileSize: 1024 * 1024 * 10 // 10MB max file size
    }
});

const singleAvatar = multerUpload.single("avatar")

const attachmentsMulter = multerUpload.array("files", 5)

export { singleAvatar, attachmentsMulter }