import type { DefaultTheme } from "vitepress";
// import algolia from "./algolia";
import nav from "./nav";
import sidebar from "./sidebar";

const themeConfig: DefaultTheme.Config = {
//   algolia,
  siteTitle: "笔记主页",
  // 页角
  footer: {
    message:
      "123",
    copyright:
      `234`
  },
  lastUpdatedText: "📑 最后更新",
  nav,
  sidebar,
  // siteTitle: false,
  
};

export default themeConfig;