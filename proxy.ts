import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // 1. Récupérer le token depuis les cookies
  const token = request.cookies.get('adminToken')?.value;
  const currentPath = request.nextUrl.pathname;

  // 2. Définir quelles routes sont protégées
  const isProtectedPath = currentPath.startsWith('/admin') || 
                          currentPath.startsWith('/settings') || 
                          currentPath.startsWith('/maids');

  // 3. SCÉNARIO A : Non connecté + essaie d'aller sur une page protégée
  // -> On le renvoie sur la page d'accueil (la page de login : "/")
  if (isProtectedPath && !token) {
    const homeLoginUrl = new URL('/', request.url);
    return NextResponse.redirect(homeLoginUrl);
  }

  // 4. SCÉNARIO B (Bonus Pro) : Déjà connecté + va sur la page de login ("/")
  // -> On l'envoie directement sur son tableau de bord !
  if (currentPath === '/' && token) {
    const dashboardUrl = new URL('/admin', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // 5. Si tout est bon, on laisse passer normalement
  return NextResponse.next();
}

// Configuration optimisée pour intercepter la page d'accueil ET les pages protégées
export const config = {
  matcher: [
    '/', // On écoute la racine pour le SCÉNARIO B
    '/admin', '/admin/:path*', 
    '/settings', '/settings/:path*', 
    '/maids', '/maids/:path*'
  ],
};