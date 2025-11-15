import { PrismaClient } from "../../generated/prisma/client.js";

//unique instance of prisma object to connect with db
export const prisma = new PrismaClient()
