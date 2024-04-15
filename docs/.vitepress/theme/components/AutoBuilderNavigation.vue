<template>
    <div>
        <!-- <h2>自动生成导航栏 <a class="header-anchor" href="#自动生成目录" aria-label="Permalink to &quot;自动生成目录&quot;">​</a></h2> -->
        <ul>
            <li v-for="(item, index) in theme.sidebar[rootPath]">
                <a :href=item.link>{{ item.text }}</a>
                <ol>
                    <li v-if=filter(item.items) v-for="(item2, index) in item.items">
                        <a :href=getJumpUrl(item2.path)>{{ item2.text }}</a>
                    </li>
                </ol>
            </li>
        </ul>
    </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { useData, defineConfig } from 'vitepress';

const { site, theme, page } = useData();
const INDEX_NAME = '/index.md';
const rootPath = ref('/' + page.value.filePath.substring(0, page.value.filePath.indexOf(INDEX_NAME)) + '/');

function filter(items) {
    if (items.length < 2) {
        return false;
    }
    return items.filter(item => item.path.startsWith(rootPath.value)).length > 1;
}
/**
 * 从 site 中获取i配置的 base 路径，进行拼接跳转地址
 */
function getJumpUrl(path: String) {
    var base = site.value.base;
    return base.substring(0, base.length - 1) + path;
}
</script>
<style lang="">

</style>