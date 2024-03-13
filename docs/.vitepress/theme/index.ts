// https://vitepress.dev/guide/custom-theme
// https://github.com/nakanomikuorg/arch-guide/blob/main/docs/.vitepress/theme/index.ts
import DefaultTheme from "vitepress/theme";
import "./style/theme.css";
import "./style/font.css";
import "./style/vars.css";
import "./style/global.css";
import AutoBuilderNavigation from "./components/AutoBuilderNavigation.vue";
import Layout from "./components/Layout.vue";

export default {
  ...DefaultTheme,
  Layout,
  enhanceApp({app}) {
    // DefaultTheme.enhanceApp(ctx);
    app.component("AutoBuilderNavigation", AutoBuilderNavigation)
  }
};
