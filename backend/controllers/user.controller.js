import uploadOnCloudinary from "../config/cloudinary.js";
import geminiResponse from "../gemini.js";
import User from "../models/user.model.js";

import moment from "moment";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ message: "get current user error" });
  }
};



export const updateAssistant = async (req, res) => {
  try {
    const { assistantName, imageUrl } = req.body;
    let assistantImage = imageUrl || "";

    if (req.file) {
      assistantImage = await uploadOnCloudinary(req.file.path);
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { assistantName, assistantImage },
      { new: true }
    ).select("-password");

    return res.status(200).json(user);
  } catch (error) {
    console.error("❌ updateAssistant error:", error);
    return res.status(500).json({ message: "update assistant error" });
  }
};



export const asktoAssistant = async (req, res) => {
  try {
    const { command } = req.body;

    // check user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userName = user.name;
    const assistantName = user.assistantName;

    // get gemini result
    const result = await geminiResponse(command, assistantName, userName);

    // JSON extract
    const jsonMatch = result.match(/{[\s\S]*}/); // ✅ fixed regex
    if (!jsonMatch) {
      return res.status(400).json({ message: "Invalid response format" });
    }

    const gemResult = JSON.parse(jsonMatch[0]); // ✅ fixed JSON.parse
    const type = gemResult.type;

    switch (type) {
      case "get_time":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Current time is ${moment().format("hh:mm A")}`,
        });

      case "get_date":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Current date is ${moment().format("YYYY-MM-DD")}`,
        });

      case "get_day":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Current day is ${moment().format("dddd")}`,
        });

      case "get_month":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Current month is ${moment().format("MMMM")}`,
        });

      case "get_year":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Current year is ${moment().format("YYYY")}`,
        });

      case "general":
      case "google_search":
      case "youtube_search":
      case "youtube_play":
      case "youtube_open":
      case "calculator_open":
      case "instagram_open":
      case "facebook_open":
      case "weather_show":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: gemResult.response,
        });

      default:
        return res.status(400).json({ message: "Unknown command type" });
    }
  } catch (error) {
    console.error("Assistant error:", error); // ✅ console me log karo
    return res.status(500).json({ message: "ask to assistant error", error: error.message });
  }
};