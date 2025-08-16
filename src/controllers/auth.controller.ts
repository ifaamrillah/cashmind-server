import { Request, Response } from "express";

import { HTTP_STATUS } from "../configs/http.config";

import { asyncHandler } from "../middlewares/async-handler.middleware";

import { registerService } from "../services/auth.service";

import { registerSchema } from "../validators/auth.validator";

export const registerController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = registerSchema.parse(req.body);

    const result = await registerService(body);

    res.status(HTTP_STATUS.CREATED).json({
      message: "User registered successfully",
      data: result,
    });
  }
);
