# 目录

## 文档

[《Go入门指南》](https://github.com/Unknwon/the-way-to-go_ZH_CN)

[Go语言圣经（中文版）](https://golang-china.github.io/gopl-zh/)

[Go语言高级编程](https://chai2010.cn/advanced-go-programming-book/)

[Go语言高级编程 Github](https://github.com/chai2010/advanced-go-programming-book)

## 自动生成目录

<script setup>
import { useData } from 'vitepress'

const { theme } = useData()
const sidebar = 'sidebar'
const root_path = '/Golang/'

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
