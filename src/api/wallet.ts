// wallet api

/* eslint-disable camelcase */

import { axiosWallet } from 'boot/axios'

export default {
  account: {
    getAccountBalanceUser () {
      return axiosWallet.get('/account/balance/user')
    },
    getAccountBalanceVo (payload: { path: { vo_id: string } }) {
      return axiosWallet.get('/account/balance/vo/' + payload.path.vo_id)
    }
  },
  admin: {
    getAdminCashCoupon (payload?: {
      query?: {
        page?: number
        page_size?: number
        app_service_id?: string
        status?: 'wait' | 'available' | 'cancelled' | 'deleted'
        template_id?: string
        valid_status?: 'notyet' | 'valid' | 'expired'
        issuer?: string
        redeemer?: string
        time_start?: string
        time_end?: string
        download?: string
      }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosWallet.get('/admin/cashcoupon', config)
    },
    postAdminCashCoupon (payload: {
      body: {
        face_value: string
        effective_time?: string
        expiration_time: string
        app_service_id: string
        username?: string
      }
    }) {
      const data = payload.body
      return axiosWallet.post('/admin/cashcoupon', data)
    },
    getAdminCashCouponId (payload: {
      path: {
        id: string
      }
    }) {
      return axiosWallet.get('/admin/cashcoupon/' + payload.path.id)
    },
    deleteAdminCashCouponId (payload: {
      path: {
        id: string
      }
    }) {
      return axiosWallet.delete('/admin/cashcoupon/' + payload.path.id)
    },
    getAdminCashCouponIdPayment (payload: {
      query?: {
        page?: number
        page_size?: number
      },
      path: {
        id: string
      }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosWallet.get('/admin/cashcoupon/' + payload.path.id + '/payment', config)
    }
  },
  cashcoupon: {
    getCashCoupon (payload?: {
      query?: {
        page?: number
        page_size?: number
        app_service_id?: string
        vo_id?: string
        valid?: 'notyet' | 'valid' | 'expired'
        app_service_category?: 'vms-server' | 'vms-object' | 'high-cloud' | 'hpc' | 'other'
      }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosWallet.get('/cashcoupon', config)
    },
    postCashCoupon (payload: {
      query: {
        id: string,
        coupon_code: string,
        vo_id?: string
      }
    }) {
      const config = {
        params: payload.query
      }
      return axiosWallet.post('/cashcoupon', null, config)
    },
    postCashCouponExchange (payload: {
      query: {
        code: string;
        vo_id?: string;
      }
    }) {
      const config = {
        params: payload.query
      }
      return axiosWallet.post('/cashcoupon/exchange', null, config)
    },
    deleteCashCoupon (payload: {
      path: {
        id: string;
      },
      query?: {
        force?: string;
      }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosWallet.delete('/cashcoupon/' + payload.path.id, config)
    },
    getCashCouponId (payload: {
      path: {
        id: string
      }
    }) {
      return axiosWallet.get('/cashcoupon/' + payload.path.id)
    },
    getCashCouponPayment (payload: {
      path: {
        id: string;
      },
      query?: {
        page?: number;
        page_size?: number;
      }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosWallet.get('/cashcoupon/' + payload.path.id + '/payment', config)
    }
  },
  'payment-history': {
    getPaymentHistory (payload?: {
      query?: {
        marker?: string
        page_size?: number
        vo_id?: string
        status?: string
        time_start?: string
        time_end?: string
        app_service_id?: string
      }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosWallet.get('/payment-history', config)
    },
    getPaymentHistoryId (payload: {
      path: {
        id: string
      }
    }) {
      return axiosWallet.get('/payment-history/' + payload.path.id)
    }
  },
  service: {
    getService (payload?: {
      query?: {
        page?: number
        page_size?: number
        center_id?: string
        status: 'enable' | 'disable' | 'deleted'
      }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosWallet.get('/service', config)
    },
    getServiceAdmin (payload?: {
      query?: {
        page?: number
        page_size?: number
      }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosWallet.get('/service/admin', config)
    }
  },
  storage: {
    getStorageService (payload?: {
      query?: {
        page?: number
        page_size?: number
        center_id?: string
        status?: 'enable' | 'disable' | 'deleted'
      }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosWallet.get('/storage/service', config)
    }
  },
  trade: {
    getTradeAppService (
      payload?: {
        query?: {
          page?: number
          page_size?: number // 不传默认20，最大200
          app_id?: string
        }
      }
    ) {
      const config = {
        params: payload?.query
      }
      return axiosWallet.get('/trade/app_service', config)
    },
    getTradeAppServiceAdmin (
      payload?: {
        query?: {
          page?: number
          page_size?: number // 不传默认20，最大200
          app_id?: string
        }
      }
    ) {
      const config = {
        params: payload?.query
      }
      return axiosWallet.get('/trade/app_service/admin', config)
    },
    // ...
    getTradeBill (
      payload?: {
        query?: {
          marker?: string
          page_size?: number
          vo_id?: string
          trade_type?: string
          time_start?: string
          time_end?: string
          app_service_id?: string
        }
      }
    ) {
      const config = {
        params: payload?.query
      }
      return axiosWallet.get('/trade/tradebill', config)
    }
  },
  user: {
    getUser (
      payload?: {
        query?: {
          page?: number
          page_size?: number
          search?: string
          federal_admin?: boolean
        }
      }
    ) {
      const config = {
        params: payload?.query
      }
      return axiosWallet.get('/user', config)
    },
    getUserPermissionPolicy (payload?: {
      query?: {
        page?: number;
        page_size?: number;
      }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosWallet.get('/user/permission-policy', config)
    }
  },
  vo: {
    getVo (payload?: {
      query?: {
        page?: number
        page_size?: number
        owner?: boolean
        member?: boolean
      }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosWallet.get('/vo', config)
    }
  }
}
