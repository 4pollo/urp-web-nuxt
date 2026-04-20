export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
  ],
  app: {
    head: {
      title: 'URP - 用户角色权限管理系统',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },
  css: ['~/assets/css/main.css'],
  colorMode: {
    preference: 'system',
    fallback: 'light',
    classSuffix: '',
  },
  imports: {
    dirs: ['composables', 'stores'],
  },
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  compatibilityDate: '2024-04-03',
  // 根据环境使用不同的构建目录
  buildDir: process.env.NODE_ENV === 'production' ? '.nuxt-build' : '.nuxt-dev',
})
