import { DefaultTheme } from "vitepress";

/**
 * 侧边栏
 */
const sidebarConfig:DefaultTheme.Sidebar = {
    '/Java/': [{
        text: 'Java基础',
        items: [
            {text: 'JavaOO', link: '/Java/JavaOO/'},
            {text: 'JavaWeb', link: '/Java/JavaWeb/'},
            {text: 'JavaEE', link: '/Java/JavaEE/'}
        ]
    },
    {
        text: 'Spring 全家桶',
        items: [
            {text: 'JavaOO', link: '/Java/JavaOO/'},
            {text: 'JavaWeb', link: '/Java/JavaWeb/'},
            {text: 'JavaEE', link: '/Java/JavaEE/'}
        ]
    },
    ]
}

export default sidebarConfig;