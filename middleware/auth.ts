export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return;

  const { isAuthenticated } = useAuth();

  // 公开路由
  const publicRoutes = ['/login', '/register'];

  if (!isAuthenticated.value && !publicRoutes.includes(to.path)) {
    return navigateTo('/login');
  }

  if (isAuthenticated.value && publicRoutes.includes(to.path)) {
    return navigateTo('/dashboard');
  }
});
