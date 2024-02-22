import { DefaultTheme } from "vitepress";
import { builderSidebarMulti, builderSidebarMulti2 } from './genSidebar';

/**
 * 侧边栏
 */
const sidebarConfig:DefaultTheme.Sidebar = builderSidebarMulti('/docs/', '', [], 0);
// const sidebarConfig:DefaultTheme.Sidebar = builderSidebarMulti2('/docs/', '')
// const sidebarConfig:DefaultTheme.Sidebar = {
    // '/Java/': [{
    //     text: 'Java基础',
    //     items: [
    //         {text: 'JavaOO', link: '/Java/JavaOO/'},
    //         {text: 'JavaWeb', link: '/Java/JavaWeb/'},
    //         {text: 'JavaEE', link: '/Java/JavaEE/'}
    //     ]
    // },
    // {
    //     text: 'Spring 全家桶',
    //     items: [
    //         {text: 'JavaOO', link: '/Java/JavaOO/'},
    //         {text: 'JavaWeb', link: '/Java/JavaWeb/'},
    //         {text: 'JavaEE', link: '/Java/JavaEE/'}
    //     ]
    // },
    // ],
    // SidebarMulti
    // '/Java/': builderSidebar('Java'),
    // '/Python/': builderSidebar('Python'),
    // '/Golang/': builderSidebar('Golang'),
    // '/前端/': builderSidebar('前端'),
    // '/Groovy/': builderSidebar('Groovy'),
    
    // '/Linux/': builderSidebar('Linux'),
    // '/CloudAndContainer/': builderSidebar('CloudAndContainer'),
    // '/Tools/': builderSidebar('Tools'),
    // '/Web/': builderSidebar('Web'),

    // '/DesignPatterns/': builderSidebar('DesignPatterns'),
    // '/分布式事务/': builderSidebar('分布式事务'),
    // '/数据结构/': builderSidebar('数据结构'),
    // '/数据库/': builderSidebar('数据库'),
    // '/网络服务/': builderSidebar('网络服务'),
    // '/微服务/': builderSidebar('微服务'),
    // '/MessageQueue/': builderSidebar('MessageQueue'),
    // '/extend/': builderSidebar('extend'),
// }

export default sidebarConfig;