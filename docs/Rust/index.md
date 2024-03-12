# Rust

## 文档

[Rust 官网](https://www.rust-lang.org/zh-CN/)

[Rust中文文档](https://kaisery.github.io/trpl-zh-cn/title-page.html)

## Kotlin 自动生成目录

<script setup>
import { useData } from 'vitepress'

const { theme } = useData()
const sidebar = 'sidebar'
const root_path = '/Rust/'

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
