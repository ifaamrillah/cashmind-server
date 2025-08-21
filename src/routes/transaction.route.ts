import { Router } from "express";

import {
  createTransactionController,
  getAllTransactionController,
  getTransactionByIdController,
} from "../controllers/transaction.controller";

const transactionRoutes = Router();

transactionRoutes.post("/", createTransactionController);
transactionRoutes.get("/", getAllTransactionController);
transactionRoutes.get("/:id", getTransactionByIdController);

export default transactionRoutes;
