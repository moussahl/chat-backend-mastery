

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
  try {
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(` Error updating profile: ${message}`);
    throw error;
  }
};

// update Avatar

// to do later with cloudinary

// update status

export const updateStatus = async (userId: string, status: string) => {
  try {
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ Error updating status: ${message}`);
    throw error;
  }
};



// get public user info


export const getUserPublicInfo = async (userId: string) => {
  try {
    const user = await User.findById(userId).select(
      "username avatar status lastSeen"
    );
 
    if (!user) {
      throw new AppError("User not found", 404);
    }
 
    console.log(`✅ Public info fetched for user: ${userId}`);
    return user;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ Error fetching public info: ${message}`);
    throw error;
  }
};
 

// add updateAvatar later

export default {
  getMe,
  updateProfile,
  updateStatus,
  getUserPublicInfo,
};