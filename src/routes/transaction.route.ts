import { Router } from "express";

import {
  createTransactionController,
  getAllTransactionController,
} from "../controllers/transaction.controller";

const transactionRoutes = Router();

transactionRoutes.get("/", getAllTransactionController);
transactionRoutes.post("/", createTransactionController);

export default transactionRoutes;
