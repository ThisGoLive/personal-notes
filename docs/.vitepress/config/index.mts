import { defineConfig } from 'vitepress'
import themeConfig from "./theme";

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
  title: "页签",
  description: "A VitePress Site",
  ignoreDeadLinks: true, // TODO: remove this line when all links are fixed
  lang: "zh-CN",
  lastUpdated: true,
  markdown: {
    lineNumbers: true
  },
  themeConfig,
  
});