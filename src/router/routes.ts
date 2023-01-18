import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/my/wallet',
    component: () => import('layouts/WalletLayout.vue'),
    redirect: '/my/wallet/account',
    children: [
      {
        path: 'account',
        component: () => import('pages/account/AccountIndex.vue'),
        redirect: '/my/wallet/account/list',
        children: [
          {
            path: 'list',
            component: () => import('pages/account/AccountList.vue')
          },
          {
            path: 'voucher',
            component: () => import('pages/account/VoucherList.vue')
          }
        ]
      },
      {
        path: 'payment',
        component: () => import('pages/payment/PaymentIndex.vue'),
        redirect: '/my/wallet/payment/personal',
        children: [
          {
            path: 'personal',
            component: () => import('pages/payment/PersonalPayment.vue')
          },
          {
            path: 'group',
            component: () => import('pages/payment/GroupPayment.vue')
          }
        ]
      },
      {
        path: 'manage',
        component: () => import('pages/manage/ManageIndex.vue'),
        redirect: '/my/wallet/manage/voucher',
        children: [
          {
            path: 'voucher',
            component: () => import('pages/manage/VoucherList.vue')
          }
        ]
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
