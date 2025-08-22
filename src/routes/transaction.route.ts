import { Router } from "express";

import {
  createTransactionController,
  duplicateTransactionByIdController,
  getAllTransactionController,
  getTransactionByIdController,
  updateTransactionByIdController,
} from "../controllers/transaction.controller";

const transactionRoutes = Router();

transactionRoutes.get("/", getAllTransactionController);
transactionRoutes.get("/:id", getTransactionByIdController);

transactionRoutes.post("/", createTransactionController);
transactionRoutes.post("/duplicate/:id", duplicateTransactionByIdController);

transactionRoutes.patch("/:id", updateTransactionByIdController);

export default transactionRoutes;
