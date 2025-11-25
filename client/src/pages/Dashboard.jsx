import React, { useEffect, useState } from 'react'
import { FilePenLineIcon, PencilIcon, PlusIcon, TrashIcon, UploadCloudIcon, UploadCloud, XIcon, LoaderCircleIcon } from 'lucide-react'
import { dummyResumeData } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast'
import api from '../configs/api'; //  import api here
import pdfToText from 'react-pdftotext';


const Dashboard = () => {
  const { user, token } = useSelector(state => state.auth);

  const colors = ['#9333ea', '#d97706', '#dc2626', '#0284c7', '#16a34a']
  const [allResumes, setAllResumes] = useState([]);
  const [showCreateResume, setShowCreateResume] = useState(false);
  const [showUploadResume, setShowUploadResume] = useState(false);
  const [title, setTitle] = useState('');
  const [resume, setResume] = useState(null);
  const [editResumeId, setEditResumeId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const loadAllResumes = async () => {
    try {
      const { data } = await api.get('/api/users/resumes', { headers: { Authorization: `Bearer ${token}` } });
      setAllResumes(data.resumes || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  }

  const createResume = async (e) => {
    if (!title) return toast.error("Title is required");
    try {
      e.preventDefault()
      const { data } = await api.post('/api/resumes/create', { title }, { headers: { Authorization: `Bearer ${token}` } });
      const newResume = data.resume;
      if (!newResume || !newResume._id) {
        return toast.error("Failed to create resume");
      }

      setAllResumes([...allResumes, newResume]);
      setTitle('');
      setShowCreateResume(false);
      navigate(`/app/builder/${newResume._id}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };



  const uploadResume = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const resumeText = await pdfToText(resume)
      const { data } = await api.post('/api/ai/upload-resume', { title, resumeText }, { headers: { Authorization: `Bearer ${token}` } })
      setTitle('')
      setResume(null)
      setShowUploadResume(false)
      navigate(`/app/builder/${data.resumeId}`)
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
    setIsLoading(false);
  }

  const editTitle = async (e) => {
    try {
      e.preventDefault();
      const { data } = await api.put(`/api/resumes/update`, { resumeId: editResumeId, resumeData: { title } }, { headers: { Authorization: `Bearer ${token}` } })
      setAllResumes(allResumes.map(resume => resume._id === editResumeId ? { ...resume, title } : resume))
      setTitle('');
      setEditResumeId('');
      toast.success(data.message)
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  }

  const deleteresume = async (resumeId) => {
    try {
      const confirmDelete = window.confirm('Are you sure you want to delete this resume?');
      if (confirmDelete) {
        const { data } = await api.delete(`/api/resumes/delete/${resumeId}`, { headers: { Authorization: `Bearer ${token}` } });
        setAllResumes(allResumes.filter(resume => resume._id !== resumeId));
        toast.success(data.message)
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }

  }

  useEffect(() => {
    loadAllResumes();
  }, [])

  console.log("Token being sent:", token);

  return (
    <div>
      <div className='max-w-7xl mx-auto px-4 py-8'>
        <p className='text-2xl font-medium mb-6 bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent sm:hidden'>
          Welcome, {user?.name || "Joe Doe"}
        </p>

        {/* Buttons */}
        <div className='flex gap-4'>
          <button onClick={() => setShowCreateResume(true)} className='w-full sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-indigo-500 hover:shadow-lg transition-all duration-300 cursor-pointer'>
            <PlusIcon className='size-11 transition-all duration-300 p-2.5 bg-gradient-to-br from-indigo-300 to-indigo-500 text-white rounded-full' />
            <p className='text-sm group-hover:text-indigo-600 transition-all duration-300'>Create Resume</p>
          </button>

          <button onClick={() => setShowUploadResume(true)} className='w-full sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-purple-500 hover:shadow-lg transition-all duration-300 cursor-pointer'>
            <UploadCloudIcon className='size-11 transition-all duration-300 p-2.5 bg-gradient-to-br from-purple-300 to-purple-500 text-white rounded-full' />
            <p className='text-sm group-hover:text-purple-600 transition-all duration-300'>Upload Existing</p>
          </button>
        </div>

        {/* Resumes */}
        <hr className='border-slate-300 my-6 sm:w-[305px]' />
        <div className='grid grid-cols-2 sm:flex flex-wrap gap-4'>
          {allResumes.map((resume, index) => {
            if (!resume) return null; // ✅ skip undefined items
            const baseColor = colors[index % colors.length];
            return (
              <button key={index} onClick={() => navigate(`/app/builder/${resume._id}`)}
                className='relative w-full sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 border group hover:shadow-lg transition-all duration-300 cursor-pointer'
                style={{ background: `linear-gradient(135deg, ${baseColor}, ${baseColor}40)`, borderColor: baseColor + '40' }}>

                <FilePenLineIcon className='size-7  group-hover:scale-105 transition-all' style={{ color: baseColor }} />

                <p className='text-sm group-hover:scale-105 transition-all px-2 text-center' style={{ color: baseColor }}>
                  {resume.title || "Untitled"}
                </p>

                <p className='absolute bottom-1 text-[11px] text-slate-400 group-hover:text-slate-500 transition-all duration-300 px-2 text-center' style={{ color: baseColor + '90' }}>
                  Updated on {resume.updatedAt ? new Date(resume.updatedAt).toLocaleDateString() : "N/A"}
                </p>

                <div onClick={e => { e.stopPropagation() }} className='absolute top-1 right-1 group-hover:flex items-center hidden'>
                  <TrashIcon onClick={() => deleteresume(resume._id)} className='size-7 p-1.5 hover:bg-white/50 rounded text-slate-700 transition-colors' />
                  <PencilIcon onClick={() => { setEditResumeId(resume._id); setTitle(resume.title || "") }} className='size-7 p-1.5 hover:bg-white/50 rounded text-slate-700 transition-colors' />
                </div>
              </button>
            )
          })}
        </div>

        {/* Create Resume Popup */}
        {(showCreateResume || editResumeId) && (
          <form
            onSubmit={editResumeId ? editTitle : createResume}
            onClick={() => { if (!editResumeId) setShowCreateResume(false) }}
            className='fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center'
          >
            <div
              onClick={e => e.stopPropagation()}
              className='relative bg-slate-50 border shadow-md rounded-lg w-full max-w-sm p-6'
            >
              <h2 className='text-xl font-bold mb-4 text-center'>
                {editResumeId ? "Edit Resume" : "Create a Resume"}
              </h2>
              <input
                onChange={(e) => setTitle(e.target.value)}
                value={title}
                type="text"
                placeholder='Enter resume title'
                className='w-full px-4 py-2 mb-4 border rounded focus:border-green-600 focus:ring-1 focus:ring-green-600'
                required
              />
              <button className='w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors'>
                {editResumeId ? "Save Changes" : "Create Resume"}
              </button>
              <XIcon
                className='absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors'
                onClick={() => { setShowCreateResume(false); setEditResumeId(''); setTitle('') }}
              />
            </div>
          </form>
        )}



        {/* Upload Resume Popup */}
        {showUploadResume && (
          <form onSubmit={uploadResume} onClick={() => setShowUploadResume(false)} className='fixed inset-0 bg-black/70 backdrop-blur bg-opacity-50 z-10 flex items-center justify-center'>
            <div onClick={e => e.stopPropagation()} className='relative bg-slate-50 border shadow-md rounded-lg w-full max-w-sm p-6'>
              <h2 className='text-xl font-bold mb-4'>Upload a Resume</h2>
              <input onChange={(e) => setTitle(e.target.value)} value={title} type="text" placeholder='Enter resume title' className='w-full px-4 py-2 mb-4 focus:border-green-600 ring-green-600' required />
              <div>
                <label htmlFor="resume-input" className='block text-sm text-slate-700'>
                  Select resume file
                  <div className='flex flex-col items-center justify-center gap-2 border group text-slate-400 border-slate-400 border-dashed rounded-md p-4 py-10 my-4 hover:border-green-500 hover:text-green-700 cursor-pointer transition-colors'>
                    {resume ? (
                      <p className='text-green-700'>{resume.name}</p>
                    ) : (
                      <>
                        <UploadCloud className='size-14 stroke-1' />
                        <p>upload resume</p>
                      </>
                    )}
                  </div>
                </label>
                <input type="file" id='resume-input' accept='.pdf' hidden onChange={(e) => setResume(e.target.files[0])} />
              </div>
              <button disabled={isLoading} className='w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-2'>
                {isLoading && <LoaderCircleIcon className='animate-spin size-4 text-white' />}
                {isLoading ? 'Uploading...' : 'Upload Resume'}
                Upload Resume
              </button>
              <XIcon className='absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors' onClick={() => { setShowUploadResume(false); setTitle('') }} />
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default Dashboard
