/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'berlin-where',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: ['production'].includes(input?.stage),
      home: 'aws',
    };
  },
  async run() {
    const { env } = await import('./src/env');

    new sst.aws.StaticSite('site', {
      path: 'dist',
      domain: env.SITE_HOSTNAME,
    });
  },
});
