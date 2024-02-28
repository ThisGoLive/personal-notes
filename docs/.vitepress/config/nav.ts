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
      { text: "Groovy", link: "/Groovy/" },
      { text: "Kotlin", link: "/Kotlin/" },
      {
        text: "🌱 新手上路",
        items: [
          { text: "💾 基础安装", link: "/guide/rookie/pre-install" },
          {
            text: "🔩 进阶安装",
            link: "/guide/rookie/desktop-env-and-app",
          },
        ],
      },
      {
        text: "🛠️ 进阶话题",
        items: [
          { text: "⚙️ 可选配置", link: "/guide/advanced/optional-cfg-1" },
          { text: "🌸 系统美化", link: "/guide/advanced/beauty-1" },
          { text: "🧰 系统管理", link: "/guide/advanced/system-ctl" },
        ],
      },
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
      {
        text: "🌱 新手上路",
        items: [
          { text: "贡献者公约", link: "/postscript/contributor-covenant" },
          { text: "贡献指南", link: "/postscript/contribute" },
          { text: "版权说明", link: "/postscript/copyright" },
          { text: "附录", link: "/postscript/about" },
        ]
      }
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
];

export default navConfig;
