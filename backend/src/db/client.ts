import { PrismaClient } from "../generated/prisma/client";

//unique instance of prisma object to connect with db
export const prisma = new PrismaClient()
