import 'dotenv/config';

import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  clientPrefix: '',
  client: {
    SITE_HOSTNAME: z.string().optional(),
  },
  runtimeEnv: process.env,
});
