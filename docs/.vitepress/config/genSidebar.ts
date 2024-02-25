import path from 'path'
import fs from 'fs'
// 根目录
const DIR_PATH = path.resolve()
// 过滤白名单
const WHITE_LIST = ['index.md', '.vitepress', 'node_modules', '.idea', '.vscode',
    '.gitgnore', 'gitpush.py', 'package.json', 'pnpm-lock.json', 'READE.md', 'assets',
    'img', 'img2', 'img3', 'img4', 'public'
]
const NUM_EMOJI = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']
const FILE_FOLDER = '📂';
const MEMO = '📝';
const isDirectory = (path_str): boolean => fs.lstatSync(path_str).isDirectory()
function getNumEmoji(num: number): string {
    if (NUM_EMOJI.length > num) {
        return NUM_EMOJI[num]
    }
    return NUM_EMOJI[NUM_EMOJI.length - 1]
}

function filterNeedPath(arr1: string[], arr2: string[]): string[] {
    return Array.from(new Set(arr1.filter((item) => {
        return arr2.indexOf(item) < 0
    })))
}

// SidebarItem
export const builderSidebarItem = (rootPath: string, directoryName: string, fatherDirectoryName): Object[] => {
    // 获取pathname
    let nowPathStr = rootPath + fatherDirectoryName + "/" + directoryName
    const dirPath = path.join(DIR_PATH, nowPathStr)

    // 读取
    const files = fs.readdirSync(dirPath)
    // 过滤
    const fileNameItems = filterNeedPath(files, WHITE_LIST)
    let valArray: Object[] = []
    for (let index in fileNameItems) {
        let itemName = fileNameItems[index]
        if (isDirectory('.' + nowPathStr + "/" + itemName)) {
            // 文件夹 找下边的 index.md
            valArray.push({
                text: FILE_FOLDER + " " + itemName,
                link: fatherDirectoryName + "/" + directoryName + "/" + itemName + '/index.md',
                path: fatherDirectoryName + "/" + directoryName + "/" + itemName + '/',
            })
        } else {
            let fileType = itemName.substring(itemName.length - 2, itemName.length)
            if (fileType.toLowerCase() === "md") {
                // 文件
                valArray.push({
                    text: MEMO + " " + itemName.substring(0, itemName.length - 3),
                    link: fatherDirectoryName + "/" + directoryName + "/" + itemName,
                    path: fatherDirectoryName + "/" + directoryName + "/" + itemName.substring(0, itemName.lastIndexOf(".")),
                });
            } else {
                console.log("文件 " + itemName + " 忽略");
            }

        }
    }
    return valArray
}


/**
 * 自动生成侧边栏
 * @param rootPath 文档所在的的根目录 / 或者 /docs/
 * @param directoryName 需要生成目录的文件名称 根目录为空 文件夹即文件名
 * @param fatherItemList 上级文件或文件夹所生成的数据
 * @param num 文件夹的层数，用于获取图标
 */
export const builderSidebarMulti = function (rootPath: string, directoryName: string, fatherItemList: any[], num: number): Object[] {
    let nowPathStr = rootPath + directoryName
    const dirPath = path.join(DIR_PATH, nowPathStr)

    // 读取文件名
    const files = fs.readdirSync(dirPath)

    // 过滤
    const fileNameItems = filterNeedPath(files, WHITE_LIST)
    let val: any = {}
    let nowNum = num + 1
    for (let index in fileNameItems) {
        let fileName = fileNameItems[index]
        if (isDirectory("." + nowPathStr + "/" + fileName)) {

            // 本目录下
            let itemList = fatherItemList.map(num => num).concat([{
                text: getNumEmoji(num) + fileName + "目录",
                items: builderSidebarItem(rootPath, fileName, directoryName)
            }])
            val[directoryName + "/" + fileName + "/"] = itemList

            let detail = builderSidebarMulti(rootPath, directoryName + "/" + fileName, itemList, nowNum)
            // 于将所有可枚举属性的值从一个或多个源对象复制到目标对象
            val = Object.assign(val, detail)
        }
    }
    return val
}


// ==============================================================
/**
 * 可折叠的侧边栏组  不需要文件夹下的 index.md SidebarItem
 * @param rootPath 文档所在的的根目录 / 或者 /docs/
 * @param directoryName 需要生成目录的文件名称 根目录为空 文件夹即文件名
 * @param fatherDirectoryName 父文件夹名称
 * @returns 
 */
export const builderSidebarItem2 = function (rootPath: string, directoryName: string, fatherDirectoryName: string): Object[] {
    // 获取pathname
    let nowPathStr = rootPath + fatherDirectoryName + "/" + directoryName
    const dirPath = path.join(DIR_PATH, nowPathStr)

    // 读取
    const files = fs.readdirSync(dirPath)
    // 过滤
    const fileNameItems = filterNeedPath(files, WHITE_LIST)
    let valArray: Object[] = []
    for (let index in fileNameItems) {
        let itemName = fileNameItems[index]
        if (isDirectory('.' + nowPathStr + "/" + itemName)) {
            // 文件夹 找下边的 index.md
            valArray.push({
                text: itemName,
                collapsed: true,
                // link: fatherDirectoryName + "/" + directoryName + "/" + itemName + '/index.md',
                items: builderSidebarItem2(rootPath, itemName, fatherDirectoryName + "/" + directoryName),

            })
        } else {
            // 文件
            valArray.push({
                text: itemName,
                link: fatherDirectoryName + "/" + directoryName + "/" + itemName,
            })
        }
    }
    return valArray
}


//  '/Java/': builderSidebar('Java'), SidebarMulti
/**
 * rootPath / /docs/
 */
export const builderSidebarMulti2 = (rootPath: string, directoryName: string): Object[] => {
    let nowPathStr = rootPath + directoryName
    const dirPath = path.join(DIR_PATH, nowPathStr)

    // 读取文件名
    const files = fs.readdirSync(dirPath)

    // 过滤
    const fileNameItems = filterNeedPath(files, WHITE_LIST)
    let val: any = {}
    for (let index in fileNameItems) {
        let fileName = fileNameItems[index]
        if (isDirectory("." + nowPathStr + "/" + fileName)) {
            val[directoryName + "/" + fileName + "/"] = builderSidebarItem2(rootPath, fileName, directoryName)
        }
    }
    return val
}

