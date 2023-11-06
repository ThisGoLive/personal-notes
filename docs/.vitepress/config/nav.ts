import { DefaultTheme } from "vitepress";

const navConfig: DefaultTheme.NavItem[] = [
  {
    text: "Java",
    items: [
      { text: "Java基础", link: "/Java/" },
      { text: "ℹ️ 尝试之前", link: "/guide/prepare/head-on-blow" },
      {
        text: "🌱 新手上路",
        items: [
          { text: "💾 基础安装", link: "/guide/rookie/pre-install" },
          {
            text: "🔩 进阶安装",
            link: "/guide/rookie/desktop-env-and-app"
          }
        ]
      },
      {
        text: "🛠️ 进阶话题",
        items: [
          { text: "⚙️ 可选配置", link: "/guide/advanced/optional-cfg-1" },
          { text: "🌸 系统美化", link: "/guide/advanced/beauty-1" },
          { text: "🧰 系统管理", link: "/guide/advanced/system-ctl" }
        ]
      }
    ]
  },
  {
    text: "Python",
    items: [
      { text: "Python目录", link: "/Python/" },
      {
        text: "💽 常用软件",
        items: [
          { text: "📐 日常办公", link: "/app/common/daily" },
          { text: "🎯 其它内容", link: "/app/common/media" }
        ]
      },
      {
        text: "🔬 专有领域",
        items: [
          { text: "🎹 媒体创作", link: "/app/exclusive/video" },
          { text: "🖥️ 信息技术", link: "/app/exclusive/code" }
        ]
      }
    ]
  },
  {
    text: "Golang",
    items: [
      { text: "Golang目录", link: "/Golang/" },
      { text: "贡献者公约", link: "/postscript/contributor-covenant" },
      { text: "贡献指南", link: "/postscript/contribute" },
      { text: "版权说明", link: "/postscript/copyright" },
      { text: "附录", link: "/postscript/about" }
    ]
  },
  {
    text: "前端",
    items: [
      { text: "前端目录", link: "/前端/" },
    ]
  },
  {
    text: "Linux",
    items: [
      { text: "Linux目录", link: "/Linux/" },
      { text: "贡献者公约", link: "/postscript/contributor-covenant" },
      { text: "贡献指南", link: "/postscript/contribute" },
      { text: "版权说明", link: "/postscript/copyright" },
      { text: "附录", link: "/postscript/about" }
    ]
  },
  {
    text: "云原生与容器",
    items: [
      { text: "Docker目录", link: "/CloudAndContainer/Docker/" },
      { text: "Kubernetes目录", link: "/CloudAndContainer/Kubernetes/" },
    ]
  }
];

export default navConfig;