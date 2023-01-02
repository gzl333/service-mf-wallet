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
  vo: {
    getVo (payload?: {
      query?: {
        page?: number;
        page_size?: number;
        owner?: boolean;
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
