import UserModel from "../models/user.model";

export const findUserByIdService = async (userId: string) => {
  const user = await UserModel.findById(userId);
  return user?.omitPassword();
};
