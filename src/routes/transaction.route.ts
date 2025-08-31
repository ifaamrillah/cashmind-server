import { Router } from "express";

import { upload } from "../configs/cloudinary.config";

import {
  createTransactionController,
  deleteTransactionByIdController,
  duplicateTransactionByIdController,
  getTransactionsController,
  getTransactionByIdController,
  updateTransactionByIdController,
  deleteTransactionsByIdsController,
  createTransactionsController,
  scanReceiptController,
} from "../controllers/transaction.controller";

const transactionRoutes = Router();

transactionRoutes.get("/", getTransactionsController);
transactionRoutes.get("/:id", getTransactionByIdController);

transactionRoutes.post("/", createTransactionController);
transactionRoutes.post("/bulk", createTransactionsController);
transactionRoutes.post("/duplicate/:id", duplicateTransactionByIdController);
transactionRoutes.post(
  "/scan-receipt",
  upload.single("receipt"),
  scanReceiptController
);

transactionRoutes.patch("/:id", updateTransactionByIdController);

transactionRoutes.delete("/bulk", deleteTransactionsByIdsController);
transactionRoutes.delete("/:id", deleteTransactionByIdController);

export default transactionRoutes;
