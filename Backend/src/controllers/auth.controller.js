import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
   const {fullName, email, password} = req.body;
    try {

        if(!fullName || !email || !password){
            return res.status(400).json({ message: "All Feilds are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password Must Be At Least 6 Characters" });
        }

        const user = await User.findOne({ email });

        if (user) return res.status(400).json({
            message: "Email Already Exits"
        });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = new User({
            fullName,
            email,
            password:hashedPassword
        });

        if(newUser){
            generateToken(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id:newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
               
            });


        }else{
            res.status(400).json({
                message: "Invalid User Data"
            });
        }

   } catch (error) {
    
    console.log("Error In Signup Controller",error.message);
    res.status(500).json({ 
        message: "Internal Server Error"
     });

   }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
          if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({message: "Invalid Credentials"});
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if(!isPasswordCorrect){
            return res.status(400).json({message: "Invalid Credentials"});
        }

        generateToken(user._id, res);

        return res.status(200).json({
            _id:user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });

    } catch (error) {
        console.log("Error In Login Controller",error.message);
        res.status(500).json({
            message: "Internal Server Error."
        });
    }
}

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", {maxAge: 0});
        res.status(200).json({
            message: "Logged Out Successfully"
        });
    } catch (error) {
        console.log("Error In Logout Controller", error.message);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
};


export const updateProfile = async (req, res) => {
    try {
      const { fullName, profilePic } = req.body;
      const userId = req.user._id;
  
      const updates = {};
  
      if (fullName) updates.fullName = fullName;

      if(profilePic === ""){
        const publicId = req.user.profilePic.split("/").pop().split(".")[0];
        if(publicId) { await cloudinary.uploader.destroy(publicId);}
                          
        let updatedUser = await User.findByIdAndUpdate(userId, {profilePic: ""}, {new: true});
        return res.status(200).json(updatedUser);
      }
  
      if (profilePic) {
        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        updates.profilePic = uploadResponse.secure_url;
      }
  
      const updatedUser = await User.findByIdAndUpdate(userId, updates, {
        new: true,
        select: "-password" // optional: exclude password
      });
  
      res.status(200).json(updatedUser);
    } catch (error) {
      console.log("Error In Update Profile Controller", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  

export const checkAuth = (req,res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};