import { Router } from "express";

import {
  createTransactionController,
  deleteTransactionByIdController,
  duplicateTransactionByIdController,
  getTransactionsController,
  getTransactionByIdController,
  updateTransactionByIdController,
  deleteTransactionsByIdsController,
} from "../controllers/transaction.controller";

const transactionRoutes = Router();

transactionRoutes.get("/", getTransactionsController);
transactionRoutes.get("/:id", getTransactionByIdController);

transactionRoutes.post("/", createTransactionController);
transactionRoutes.post("/duplicate/:id", duplicateTransactionByIdController);

transactionRoutes.patch("/:id", updateTransactionByIdController);

transactionRoutes.delete("/bulk", deleteTransactionsByIdsController);
transactionRoutes.delete("/:id", deleteTransactionByIdController);

export default transactionRoutes;
