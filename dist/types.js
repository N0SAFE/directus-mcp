import { z } from 'zod';
export const DirectusConfigSchema = z.object({
    url: z.string().url(),
    token: z.string(),
    collection: z.string(),
});
