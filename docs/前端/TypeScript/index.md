# 目录

## 资源

[官方文档](https://www.typescriptlang.org/docs/)

[中文文档](https://wangdoc.com/typescript/)

[Palyground](https://www.typescriptlang.org/play)

## 自动生成目录

<script setup>
import { useData } from 'vitepress'

const { theme } = useData()
const sidebar = 'sidebar'
const root_path = '/前端/TypeScript/'

function filter(items) {
    if (items.length < 2) {
        return false
    }
    return items.filter(item => item.path.startsWith(root_path)).length > 1
}
</script>

<ul>
    <li v-for = " (item, index) in theme[sidebar][root_path]">
        <a :href=item.link>{{item.text}}</a>
        <ol>
            <li v-if=filter(item.items) v-for = "(item2, index) in item.items">
                <a :href=item2.path>{{item2.text}}</a>
            </li>
        </ol>
    </li>
</ul>
