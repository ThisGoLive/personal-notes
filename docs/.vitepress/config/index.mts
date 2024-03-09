import { defineConfig } from 'vitepress'
import themeConfig from "./theme";

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
  base: "/personal-notes/",
  title: "✒️ 主页",
  // 自定义后缀
  titleTemplate: "✒️个人笔记库",
  description: "个人笔记库",
  ignoreDeadLinks: true, 
  lang: "zh-CN",
  lastUpdated: true,
  markdown: {
    lineNumbers: true
  },
  themeConfig,
  
});