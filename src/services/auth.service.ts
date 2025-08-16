import mongoose from "mongoose";

import UserModel from "../models/user.model";
import ReportSettingModel, {
  ReportFrequencyEnum,
} from "../models/report-setting.model";

import { RegisterSchemaType } from "../validators/auth.validator";

import { UnauthorizedException } from "../utils/app-error";
import { calculateNextReportDate } from "../utils/helper";

export const registerService = async (body: RegisterSchemaType) => {
  const { name, email, password } = body;

  const session = await mongoose.startSession();

  try {
    const user = await session.withTransaction(async () => {
      const existingUser = await UserModel.findOne({ email }).session(session);
      if (existingUser) {
        throw new UnauthorizedException("User already exists");
      }

      const newUser = new UserModel({
        ...body,
      });

      await newUser.save({ session });

      const reportSetting = new ReportSettingModel({
        userId: newUser._id,
        frequency: ReportFrequencyEnum.MONTHLY,
        isEnabled: true,
        lastSentDate: null,
        nextReportDate: calculateNextReportDate(),
      });

      await reportSetting.save({ session });

      return newUser.omitPassword();
    });

    return user;
  } catch (error) {
    throw error;
  } finally {
    await session.endSession();
  }
};
