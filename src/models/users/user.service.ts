import AppError from "../../utils/AppError";
import User from "../users/user.model";

export const getMe = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("user not found", 404);
  }

  return user;
};

// update Profile
export const updateProfile = async (
  userId: string,
  updateData: {
    username?: string;
    email?: string;
    avatar?: string;
    status?: string;
  },
) => {
  // verify if email exist
  if (updateData.email) {
    const existingUser = await User.findOne({
      email: updateData.email,
      _id: { $ne: userId },
    });
    if (existingUser) {
      throw new AppError("Username already in use", 400);
    }

    //update user

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true, //return the updated document
      runValidators: true, // validate the schema
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    console.log(`✅ User profile updated: ${userId}`);

    return user;
  }
};

// update Avatar

// to do later with cloudinary

// update status

export const updateStatus = async (userId: string, status: string) => {
  
    const validStatuses = ["online", "offline", "away"];

    if (!validStatuses.includes(status)) {
      throw new AppError(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        400,
      );
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        status,
        lastSeen: new Date(),
      },
      { new: true, runValidators: true },
    );

    if (!user) {
      throw new AppError("User not found", 404);
    }

    console.log(`✅ Status updated for user: ${userId} to ${status}`);
    return user;
 
    
  
};

// get public user info

export const getUserPublicInfo = async (userId: string) => {

    const user = await User.findById(userId).select(
      "username avatar status lastSeen",
    );

    if (!user) {
      throw new AppError("User not found", 404);
    }

    console.log(`✅ Public info fetched for user: ${userId}`);
    return user;
 
    
};

// add updateAvatar later

// get all users

const getAllUsers = async ()=> {
  const users = User.find();
  if(!users)
    throw new AppError("Users not found",400)

  return users;
}

export default {
  getMe,
  updateProfile,
  updateStatus,
  getUserPublicInfo,
};
