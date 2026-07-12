import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'cooL UI',
  description: 'Native glass components with one shared semantic contract.',
  cleanUrls: true,
  lastUpdated: true,
  head: [['meta', { name: 'theme-color', content: '#071018' }]],
  themeConfig: {
    logo: '/mark.svg',
    nav: [
      { text: 'Components', link: '/components/' },
      { text: 'Release 0.2', link: '/releases/0.2.0' },
      { text: '中文', link: '/zh/' },
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Overview', link: '/' },
          { text: 'Components', link: '/components/' },
          { text: 'Release 0.2', link: '/releases/0.2.0' },
        ],
      },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/XingAur/cool-ui' }],
  },
  markdown: { theme: { light: 'github-light', dark: 'github-dark' } },
  locales: {
    root: { label: 'English', lang: 'en' },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      link: '/zh/',
      themeConfig: {
        nav: [
          { text: '组件', link: '/zh/components/' },
          { text: '0.2 发布说明', link: '/zh/releases/0.2.0' },
          { text: 'English', link: '/' },
        ],
        sidebar: [{
          text: '指南',
          items: [
            { text: '概览', link: '/zh/' },
            { text: '组件', link: '/zh/components/' },
            { text: '0.2 发布说明', link: '/zh/releases/0.2.0' },
          ],
        }],
      },
    },
  },
});
