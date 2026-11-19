import { createRouter, intentPreload } from '@solidjs/router'
import { fileRoutes } from '@solidjs/router/fs'
import { pageRoutes } from 'virtual:file-routes'

export const Router = createRouter({
  routes: fileRoutes(pageRoutes),
  preloadLinks: intentPreload(),
})
