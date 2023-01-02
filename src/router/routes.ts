import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/my/wallet',
    component: () => import('layouts/WalletLayout.vue'),
    redirect: '/my/wallet/account',
    children: [
      {
        path: 'account',
        component: () => import('pages/AccountList.vue')
      },
      {
        path: 'voucher',
        component: () => import('pages/VoucherList.vue')
      },
      {
        path: 'payment',
        component: () => import('pages/PaymentRecord.vue')
      },
      {
        path: 'manage',
        component: () => import('pages/ManageIndex.vue')
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
