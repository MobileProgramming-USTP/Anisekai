import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}


router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body || {};

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json("All fields are required");
    }

    if (password.length < 6) {
      return res.status(400).json("Password must be at least 6 characters");
    }

    if(username.length < 5){
      return res.status(400).json("Username must be at least 5 characters");
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json("Email already in use");
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json("Username already taken");
    }

    const profileImage = "https://api.dicebear.com/6.x/micah/svg?seed=${username}";

    const user = new User({
      username,
      email,
      password,
      profileImage
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email, 
        profileImage: user.profileImage 
      } 
    
    });

  } catch (error) {

    console.log("Error during registration:", error);
    res.status(500).json({message: "Server error during registration"});

  }

});

router.get("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: "All fields are required" })

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Credentials" });

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) return res.status(400).json({ message: "Invalid Credentials" });

    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      },
    });

  } catch (error) {
    console.log("Error in login route:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});


export default router;

