/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "caremap",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: input?.stage === "production",
      home: "aws",
    };
  },
  async run() {
    const db = new sst.Secret("DatabaseUrl");
    const web = new sst.aws.Nextjs("Web", {
      link: [db],
      environment: { SITE_URL: process.env.SITE_URL ?? "" },
    });
    return { url: web.url };
  },
});
