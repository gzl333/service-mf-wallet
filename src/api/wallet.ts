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
    getAdminCashcoupon (payload?: {
      query?: {
        page?: number
        page_size?: number
        app_service_id?: string
        status?: 'wait' | 'available' | 'cancelled' | 'deleted'
        template_id?: string
        download?: string
      }
    }) {
      const config = {
        params: payload?.query
      }
      return axiosWallet.get('/admin/cashcoupon', config)
    },
    postAdminCashcoupon (payload: {
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
    }
  },
  cashcoupon: {
    getCashCoupon (payload?: {
      query?: {
        page?: number,
        page_size?: number,
        app_service_id?: string,
        vo_id?: string,
        available?: string,
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
  user: {
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
