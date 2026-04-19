import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender   // homepage only
  },
  {
    path: 'add',
    renderMode: RenderMode.Client
  },
  {
    path: 'edit/:id',
    renderMode: RenderMode.Client   // ✅ FIX
  },
  {
    path: '**',
    renderMode: RenderMode.Client   // fallback
  }
];