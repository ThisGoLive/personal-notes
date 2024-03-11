# 目录

## 相关文档

轻量级：
- [meilisearch](https://www.meilisearch.com/)
- [zincsearch](https://zincsearch-docs.zinc.dev/)
- [gofound](https://gitee.com/tompeppa/gofound)

重量级：
- [opensearch](https://www.opensearch.org/)
- [elasticsearch](https://www.elastic.co/cn/elasticsearch/)
- [Elasticsearch中什么是 tokenizer、analyzer、filter](https://www.cnblogs.com/a-du/p/16272901.html)

## 自动生产目录
<script setup>
import { useData } from 'vitepress'

const { theme } = useData()
const sidebar = 'sidebar'
const root_path = '/Python/'

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


PyTorch

<https://www.bilibili.com/video/BV1sa4y1C7Fc?p=1>


Pandas

https://www.bilibili.com/video/BV1q2421L7XR?p=1