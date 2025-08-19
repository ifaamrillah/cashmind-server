import { Router } from "express";

import { createTransactionController } from "../controllers/transaction.controller";

const transactionRoutes = Router();

transactionRoutes.post("/", createTransactionController);

export default transactionRoutes;
