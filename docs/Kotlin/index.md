# Kotlin 自动生成目录

<script setup>
import { useData } from 'vitepress'

const { theme } = useData()
const sidebar = 'sidebar'
const root_path = '/Kotlin/'

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

[Kotlin 协程完全解析](https://juejin.cn/post/7238195267286876219)