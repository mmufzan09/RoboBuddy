import genToken from "../config/token.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"





export const signUp = async(req,res)=>{
  try {
    const{name,email,password}=req.body

    const existEmail=await User.findOne({email})
    if(existEmail){
        return res.status(400).json({message:"email already exists!!"})
    }
     if (password.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
      
    const token = await genToken(user._id)

    res.cookie("token",token,{
        httpOnly:true,
        maxAge:7*24*60*60*1000,
        sameSite:"lax",
        secure:false
 })

 return res.status(201).json(user)

  } catch (error) {
    return res.status(500).json({message:"signup error"})
  }
}


export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = await genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "lax",
      secure: false, // set true in production with HTTPS
    });

    const { password: pass, ...userData } = user._doc;
    return res.status(200).json(userData);

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server login error", error: error.message });
  }
};


export const logOut = async (req,res)=>{
    try {
        res.clearCookie("token")
        return res.status(200).json({message:"log out successfully"})
    } catch (error) {
         return res.status(500).json({message:"log out error"})
    }
}