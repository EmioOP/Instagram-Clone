import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        return response
    } catch (error) {
        console.log(error.message || "file upload failed")
    }
}

const deleteFromCloudinary = async (fileUrl, fileType) => {
    try {
        const regex = /\/v\d+\/([^/]+)\.\w+$/;
        const match = fileUrl.match(regex)

        let publicId

        if (match && match.length > 1) {
            publicId = match[1]
        }

        const response = await cloudinary.uploader.destroy(publicId, { resource_type: fileType })

        return response

    } catch (error) {
        console.log(error.message || "file delete failed")
    }
}

export {
    uploadOnCloudinary,
    deleteFromCloudinary
}