import { z } from 'zod';

export const healthQuerySchema = z.object({
  deep: z
    .enum(['0', '1', 'true', 'false'])
    .optional()
    .transform((value) => value === '1' || value === 'true'),
});
