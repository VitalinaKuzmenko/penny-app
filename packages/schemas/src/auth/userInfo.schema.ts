// packages/schema/user.ts
import { z } from 'zod';

export const UserInfoSchema = z.object({
  id: z.string(),
  userEmail: z.string().email(),
  userName: z.string(),
  userSurname: z.string(),
});

export type UserInfo = z.infer<typeof UserInfoSchema>;
