import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage) },
  { path: 'products', loadComponent: () => import('./pages/products/products.page').then((m) => m.ProductsPage) },
  { path: 'products/:slug', loadComponent: () => import('./pages/product-detail/product-detail.page').then((m) => m.ProductDetailPage) },
  { path: 'categories', loadComponent: () => import('./pages/categories/categories.page').then((m) => m.CategoriesPage) },
  { path: 'categories/:slug', loadComponent: () => import('./pages/products/products.page').then((m) => m.ProductsPage) },
  { path: 'about', loadComponent: () => import('./pages/about/about.page').then((m) => m.AboutPage) },
  { path: 'contact', loadComponent: () => import('./pages/contact/contact.page').then((m) => m.ContactPage) },
  { path: 'get-a-quote', loadComponent: () => import('./pages/quote/quote.page').then((m) => m.QuotePage) },
  { path: '**', loadComponent: () => import('./pages/not-found/not-found.page').then((m) => m.NotFoundPage) },
];
