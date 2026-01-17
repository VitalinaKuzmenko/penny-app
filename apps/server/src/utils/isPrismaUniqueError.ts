import { Prisma } from '../prisma/generated/prisma/client';

export const isUniqueConstraintError = (
  err: unknown,
): err is Prisma.PrismaClientKnownRequestError =>
  err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002';
