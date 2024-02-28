import { DefaultTheme } from "vitepress";
import path from "path"
import fs from "fs"
// 根目录
const DIR_PATH = path.resolve()
// 过滤白名单
const WHITE_LIST = ["index.md", ".vitepress", "node_modules", ".idea", ".vscode",
    ".gitgnore", "gitpush.py", "package.json", "pnpm-lock.json", "READE.md", "assets",
    "img", "img2", "img3", "img4", "public"
]
const NUM_EMOJI = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"]
const FILE_FOLDER = "📂";
const MEMO = "📝";
const SPLIT_TAG = "/"
const LOCAL_TAG = "."

const isDirectory = (path_str: string): boolean => fs.lstatSync(path_str).isDirectory()
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
export const builderSidebarItem = (rootPath: string, directoryName: string, fatherDirectoryName): DefaultTheme.SidebarItem[] => {
    // 获取pathname
    let nowPathStr = rootPath + fatherDirectoryName + SPLIT_TAG + directoryName
    const dirPath = path.join(DIR_PATH, nowPathStr)

    // 读取
    const files = fs.readdirSync(dirPath)
    // 过滤
    const fileNameItems = filterNeedPath(files, WHITE_LIST)
    // DefaultTheme.SidebarItem 没有 path，但是 用 path 才能正常显示
    let valArray: any[] = []
    let valArrayFile: any[] = []
    for (let itemName of fileNameItems) {
        if (isDirectory(LOCAL_TAG + nowPathStr + SPLIT_TAG + itemName)) {
            // 文件夹 找下边的 index.md
            valArray.push({
                text: FILE_FOLDER + " " + itemName,
                link: fatherDirectoryName + SPLIT_TAG + directoryName + SPLIT_TAG + itemName + "/index.md",
                path: fatherDirectoryName + SPLIT_TAG + directoryName + SPLIT_TAG + itemName + SPLIT_TAG,
            })
        } else {
            let fileType = itemName.substring(itemName.length - 2, itemName.length)
            if (fileType.toLowerCase() === "md") {
                // 文件
                valArrayFile.push({
                    text: MEMO + " " + itemName.substring(0, itemName.length - 3),
                    link: fatherDirectoryName + SPLIT_TAG + directoryName + SPLIT_TAG + itemName,
                    path: fatherDirectoryName + SPLIT_TAG + directoryName + SPLIT_TAG + itemName.substring(0, itemName.lastIndexOf(LOCAL_TAG)),
                });
            } else {
                console.log("文件 " + itemName + " 忽略");
            }
        }
    }
    // 排序 先文件夹 后文件
    return valArray.concat(valArrayFile)
}


/**
 * 自动生成侧边栏
 * @param rootPath 文档所在的的根目录 / 或者 /docs/
 * @param directoryName 需要生成目录的文件名称 根目录为空 文件夹即文件名
 * @param fatherItemList 上级文件或文件夹所生成的数据
 * @param num 文件夹的层数，用于获取图标
 */
export const builderSidebarMulti = function (rootPath: string, directoryName: string, fatherItemList: DefaultTheme.SidebarItem[], num: number): DefaultTheme.Sidebar {
    let nowPathStr = rootPath + directoryName
    const dirPath = path.join(DIR_PATH, nowPathStr)

    // 读取文件名
    const files = fs.readdirSync(dirPath)

    // 过滤
    const fileNameItems = filterNeedPath(files, WHITE_LIST)
    let val: DefaultTheme.Sidebar = {}
    let nowNum = num + 1
    for (let fileName of fileNameItems) {
        if (isDirectory(LOCAL_TAG + nowPathStr + SPLIT_TAG + fileName)) {

            // 父文件夹目录 + 本级明细
            let itemList: DefaultTheme.SidebarItem[] = fatherItemList.concat([{
                text: getNumEmoji(num) + fileName + "目录",
                collapsed: false,
                items: builderSidebarItem(rootPath, fileName, directoryName)
            }])
            val[directoryName + SPLIT_TAG + fileName + SPLIT_TAG] = itemList

            let detail = builderSidebarMulti(rootPath, directoryName + SPLIT_TAG + fileName, itemList, nowNum)
            // 于将所有可枚举属性的值从一个或多个源对象复制到目标对象
            val = Object.assign(val, detail)
        }
    }
    return val
}
