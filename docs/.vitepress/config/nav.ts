import { DefaultTheme } from "vitepress";

// 配置 网页头顶导航
const navConfig: DefaultTheme.NavItem[] = [
  {
    text: "💻	开发语言",
    items: [
      { text: "☕ Java", link: "/Java/" },
      { text: "🐍 Python", link: "/Python/" },
      { text: "🏃 Golang", link: "/Golang/" },
      { text: "前端", link: "/前端/" },
      { text: "TypeScript", link: "/前端/TypeScript/" },
      { text: "Groovy", link: "/Groovy/" },
      { text: "Kotlin", link: "/Kotlin/" },
      { text: "🦀 Rust", link: "/Rust/" },
    ],
  },
  {
    text: "操作系统与工具",
    items: [
      { text: "🐧	Linux", link: "/Linux/" },
      { text: "🐳 Docker", link: "/CloudAndContainer/Docker/" },
      { text: "Kubernetes", link: "/CloudAndContainer/Kubernetes/" },
      { text: "💾	数据库", link: "/数据库/" },
      { text: "🧰 开发工具", link: "/Tools/" },
      { text: "Web 服务器", link: "/Web/" },
      {text: " 🔎 搜索引擎", link: "/SearchEngine/"},
    ],
  },
  {
    text: "🛠️ 工具网站",
    items: [
      { text: "VitePress 文档", link: "https://vitepress.dev/zh/" },
      { text: "开发快速查询", link: "https://quickref.me/zh-CN/" },
      { text: "IT Tools", link: "https://it-tools.tech/" },
      { text: "数据结构可视化", link: "https://visualgo.net/zh" },
      {
        text: "正则工具",
        items: [
          { text: "正则表达式", link: "https://regex101.com/" },
          { text: "正则可视化", link: "https://regex-vis.com/" },
        ]
      },
    ],
  },
  {
    text: "📚	书籍网站",
    items: [
      { text: "书格", link: "https://new.shuge.org/" },
      { text: "古诗文网", link: "https://www.gushiwen.cn/" },
      { text: "读书网", link: "http://154.211.15.59:33255/" },
      { text: "读书网 Github", link: "https://github.com/dooshu/shu" },
      { text: "资源下载", link: "https://www.emex.top:8083/" },
      { text: "14个免费电子书网站", link: "https://zhuanlan.zhihu.com/p/310396918"},
      { text: "Z-Library", link: "https://zhuanlan.zhihu.com/p/676590811"},
    ],
  },
];

export default navConfig;
