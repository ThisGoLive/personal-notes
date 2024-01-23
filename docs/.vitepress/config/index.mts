import { defineConfig } from 'vitepress'
import themeConfig from "./theme";

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
  title: "个人笔记库",
  description: "个人笔记库",
  ignoreDeadLinks: true, 
  lang: "zh-CN",
  lastUpdated: true,
  markdown: {
    lineNumbers: true
  },
  themeConfig,
  
});