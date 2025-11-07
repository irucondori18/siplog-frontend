import { Routes } from '@angular/router';

export enum PROVEEDOR_PAGES {
  PROVEEDOR_LIST   = '',
  PROVEEDOR_DETAIL = ':/id',
  PROVEEDOR_CREATE = 'create',
  PROVEEDOR_EDIT   ='edit/:id'
}

export const PROVEEDOR_ROUTES:Routes = [
  {
    path: PROVEEDOR_PAGES.PROVEEDOR_LIST,
    loadComponent: () => import('../proveedor').then((m) => m.ProveedorListComponent)
  },
];
