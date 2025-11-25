import multer from 'multer'

const storage = multer.diskStorage({}); // to create a storage 
const upload =multer({storage})

export default upload