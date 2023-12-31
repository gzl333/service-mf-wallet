import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/my/wallet',
    component: () => import('layouts/WalletLayout.vue'),
    redirect: '/my/wallet/account',
    children: [
      {
        path: 'account',
        component: () => import('pages/account/MyAccounts.vue')
      },
      {
        path: 'voucher',
        component: () => import('pages/voucher/VoucherIndex.vue'),
        redirect: '/my/wallet/voucher/personal',
        children: [
          {
            path: 'personal',
            component: () => import('pages/voucher/PersonalVoucher.vue')
          },
          {
            path: 'group',
            component: () => import('pages/voucher/GroupVoucher.vue'),
            props: true
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
            component: () => import('pages/payment/GroupPayment.vue'),
            props: true
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
