// https://vitepress.dev/guide/custom-theme
// https://github.com/nakanomikuorg/arch-guide/blob/main/docs/.vitepress/theme/index.ts
import DefaultTheme from "vitepress/theme";
import "./style/theme.css";
import "./style/font.css";
import "./style/vars.css";
import "./style/global.css";

export default {
  ...DefaultTheme,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp(ctx);
  }
};
