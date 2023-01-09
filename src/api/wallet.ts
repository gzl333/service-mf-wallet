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
