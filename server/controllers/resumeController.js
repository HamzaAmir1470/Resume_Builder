import imagekit from "../configs/imageKit.js";
import Resume from "../models/Resume.js";
import fs from 'fs'


// controller for creating a new resume 
//POST: /api/resumes/create
// controllers/resumeController.js

export const createResume = async (req, res) => {
  try {
    const userId = req.userId; // comes from middleware
    const { title } = req.body;

    if (!userId) return res.status(400).json({ message: "User not found" });

    const resume = await Resume.create({
      userId,
      title,
      template: "classic",
      public: false,
    });

    return res.status(201).json({ message: "Resume created", resume });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};


//controller for deleting a resume
//DELETE: /api/resumes/delete
export const deleteResume = async (req, res) => {
  try {
    const userId = req.userId; //It simply gets the logged-in user’s ID into a variable so you can use it inside the controller.
    const { resumeId } = req.params;

    await Resume.findOneAndDelete({ userId, _id: resumeId })

    // return success message
    return res.status(200).json({ message: "Resume deleted successfully" })
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}






// get user resume by Id 
//GET : /api/resume/get
export const getResumeById = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;

    const resume = await Resume.findOne({ userId, _id: resumeId });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const { __v, createdAt, updatedAt, ...resumeData } = resume.toObject();
    return res.status(200).json({ resume: resumeData });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}







// get resume by id public 
//GET: /api/resume/public

export const getPublicResumeById = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const resume = await Resume.findById(resumeId);

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    // Only allow access if it's public
    if (!resume.public) {
      return res.status(403).json({ message: "Resume is private" });
    }

    return res.status(200).json({ resume });

  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};



// controller for updating a resume
// PUT: /api/resumes/update
export const updateResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId, resumeData, removeBackground } = req.body;
    const image = req.file;
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);


    let resumeDataCopy;
    if (typeof resumeData === 'string') {
      resumeDataCopy = await JSON.parse(resumeData)
    } else {
      resumeDataCopy = structuredClone(resumeData)
    }

    // Upload image if present
    if (image) {
      const imageBufferData = fs.createReadStream(image.path);
      const response = await imagekit.files.upload({
        file: imageBufferData,
        fileName: 'resume.jpg',
        folder: 'user-resumes',
        transformation: {
          pre: 'w-300,h-300,fo-face,z-0.75' + (removeBackground ? ',e-bgremove' : ''),
        }
      });
      resumeDataCopy.personal_info = {
        ...resumeDataCopy.personal_info,
        image: response.url
      };
      fs.unlinkSync(image.path); // delete temp file
    }

    // Find resume
    const resume = await Resume.findOne({ userId, _id: resumeId });
    console.log("Logged-in userId:", req.userId);
    if (!resume) return res.status(404).json({ message: "Resume not found" });

    // Merge data safely
    resume.personal_info = { ...resume.personal_info, ...resumeDataCopy.personal_info };
    resume.title = resumeDataCopy.title || resume.title;
    resume.professional_Summary = resumeDataCopy.professional_Summary || resume.professional_Summary;
    resume.skills = resumeDataCopy.skills || resume.skills;
    resume.experience = resumeDataCopy.experience || resume.experience;
    resume.education = resumeDataCopy.education || resume.education;
    resume.project = resumeDataCopy.project || resume.project;
    resume.public = resumeDataCopy.public !== undefined ? resumeDataCopy.public : resume.public;


    await resume.save();

    return res.status(200).json({ message: "Saved Successfully", resume });

  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
};