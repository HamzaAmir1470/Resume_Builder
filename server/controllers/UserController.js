import bcrypt from 'bcrypt'
import User from '../models/User.js';
import jwt from 'jsonwebtoken'
import Resume from "../models/Resume.js";


const generateToken = (userId) => {
    const token = jwt.sign({ userId: userId }, process.env.JWT_SECRET, { expiresIn: '20d' })
    return token;
}




// Register user
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Please provide all fields" });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        const user = await User.create({ name, email, password });

        // generate token for the newly registered user
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '20d' });

        // hide password before sending user object
        user.password = undefined;

        res.status(201).json({ message: "User registered successfully", user, token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Login user
export const loginUser = async (req, res) => {
    const { email, password } = req.body || {};

    if (!email || !password) {
        console.log('Login failed: missing fields', { emailProvided: !!email, passwordProvided: !!password });
        return res.status(400).json({ message: "Please provide all fields" });
    }

    try {
        console.log('Login attempt for email:', email);
        const user = await User.findOne({ email });
        if (!user) {
            console.log('Login failed: user not found for email', email);
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            console.log('Login failed: incorrect password for email', email);
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '20d' });

        // hide password before sending user object
        user.password = undefined;

        res.status(200).json({ message: "Login successful", token, user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};




// // controller for getting user by id 
// // GET /api/users/data
export const getUserById = async (req, res) => {
    try {

        // this userId comes from 'protect' middleware
        const userId = req.userId;
        // check is user exist 
        const user = await User.findOne({ _id: userId })
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // return user
        user.password = undefined
        return res.status(200).json({ user })

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}




// //controller for getting user resume
// // GET : /api/users/resumes
export const getUserResumes = async (req, res) => {
    try {
        const userId = req.userId;  //It simply gets the logged-in user’s ID into a variable so you can use it inside the controller.

        //return user reumes
        const resumes = await Resume.find({ userId })
        return res.status(200).json({ resumes })
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}



