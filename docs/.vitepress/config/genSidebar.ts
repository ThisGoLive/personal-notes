import path from 'path'
import fs from 'fs'
// 根目录
const DIR_PATH = path.resolve()
// 过滤白名单
const WHITE_LIST = ['index.md', '.vitepress', 'node_modules', '.idea', '.vscode', 
'.gitgnore', 'gitpush.py', 'package.json', 'pnpm-lock.json', 'READE.md', 'assets',
'img', 'img2', 'img3', 'img4'
]

const isDirectory = (path_str): boolean => fs.lstatSync(path_str).isDirectory()

function filterNeedPath (arr1: string[], arr2: string[]) : string[] {
    return Array.from(new Set(arr1.filter((item) => {
        return arr2.indexOf(item) < 0
    })))
}

export const builderSidebar = (pathname: string) : Object[] => {
    // 获取pathname
    let nowPathStr  = '/docs/' + pathname
    const dirPath = path.join(DIR_PATH, nowPathStr)
    
    // 读取
    const files = fs.readdirSync(dirPath)
    // 过滤
    const items = filterNeedPath(files, WHITE_LIST)
    let valArray: Object[] = []
    for (let index in items) {
        let item = items[index]
        if (isDirectory('./docs/' + pathname + '/' + item)) {
            valArray.push({
                text: item,
                items: builderSidebar(pathname + '/' + item),
            })
        } else{
            valArray.push({
                text: item,
                link: pathname + '/' + item,
            })
        }
    }
    return valArray
}