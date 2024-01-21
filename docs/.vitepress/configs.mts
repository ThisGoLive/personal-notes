import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "My Awesome Project",
  description: "A VitePress Site",
  themeConfig: {
    siteTitle: "笔记主页",
    logo: "",
    // https://vitepress.dev/reference/default-theme-config
    // 主页上的栏位
    nav: [
      { text: 'Java', link: '/Java/',},
      { text: 'Examples', link: '/markdown-examples' }
    ],
    // 主页的 标签
    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
