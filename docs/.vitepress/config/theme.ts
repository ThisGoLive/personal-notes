import type { DefaultTheme } from "vitepress";
// import algolia from "./algolia";
import nav from "./nav";
import sidebar from "./sidebar";

const themeConfig: DefaultTheme.Config = {
  // logo: '/images/spring-prosperity.svg',
  // algolia,
  siteTitle: "🏠 笔记主页Home",
  // 隐藏
  // siteTitle: false,
  // 页角
  footer: {
    message:
      "123",
    copyright:
      `234`
  },
  lastUpdatedText: "📑 最后更新",
  // 头顶导航
  nav,
  // 侧边栏
  sidebar,
  outline: {
    level: [2,6],
    label: '本篇导航'
  },
  // 头顶跳转
  socialLinks: [
    { icon: "github", link: 'https://vitepress.dev/zh/' }
  ],
  // 开启搜索烂尾
//   search: {
//     provider: 'local'
//   }
  
};

export default themeConfig;