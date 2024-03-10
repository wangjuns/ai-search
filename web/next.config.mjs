export default (phase, { defaultConfig }) => {
  const env = process.env.NODE_ENV;
  /**
   * @type {import("next").NextConfig}
   */
  if (env === "production") {
    return {
      // output: "export",
      // assetPrefix: "/ui/",
      // basePath: "/ui",
      // distDir: "../ui"
    };
  } else {
    return {

    };
  }
}
