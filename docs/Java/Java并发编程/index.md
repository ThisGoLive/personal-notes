
# Java并发编程目录

<script setup>
import { useData } from 'vitepress'

const { theme } = useData()
const sidebar = 'sidebar'
const root_path = '/Java/Java并发编程/'
</script>


<ul>
    <li v-for = " (item, index) in theme[sidebar][root_path]">
        <a :href=item.link>{{item.text}}</a>
        <ul>
            <li v-for = " (item2, index) in item.items">
                <a :href=item2.path>{{item2.text}}</a>
            </li>
        </ul>
    </li>
</ul>
