import { defineStore } from 'pinia'
// import { i18n } from 'boot/i18n'
import api from 'src/api'
// @ts-expect-error
import { useStoreMain } from '@cnic/main'
import { Dialog } from 'quasar'

import CreateVoucherDialog from 'components/manage/CreateVoucherDialog.vue'

import useExceptionNotifier from 'src/hooks/useExceptionNotifier'

// const { tc } = i18n.global
const exceptionNotifier = useExceptionNotifier()

export interface ServerServiceInterface {
  id: string
  name: string
  name_en: string
  service_type: string
  cloud_type: string
  add_time: string
  need_vpn: boolean
  status: 'enable' | 'disable' | 'deleted'
  data_center: {
    id: string
    name: string
    name_en: string
  },
  longitude: number
  latitude: number
  pay_app_service_id: string

  // 自己补充的字段
  pay_app_service_type: 'server'
}

export interface StorageServiceInterface {
  id: string
  name: string
  name_en: string
  service_type: string
  endpoint_url: string
  add_time: string
  status: 'enable' | 'disable' | 'deleted'
  remarks: string
  provide_ftp: boolean
  ftp_domains: string[]
  longitude: number
  latitude: number
  pay_app_service_id: string
  data_center: {
    id: string
    name: string
    name_en: string
  }

  // 自己补充的字段
  pay_app_service_type: 'storage'
}

export type ServiceInterface = ServerServiceInterface | StorageServiceInterface

export interface VoucherInterface {
  id: string
  face_value: string
  creation_time: string
  effective_time: string
  expiration_time: string
  balance: string
  status: 'wait' | 'available' | 'canceled' | 'deleted'
  granted_time: string
  owner_type: string // more specified?
  app_service?: {
    id: string
    name: string
    name_en: string
    category: string // more specified?
    service_id: string | null
  },
  user?: {
    id: string
    username: string
  },
  vo: Record<string, unknown>
  activity: Record<string, unknown>
  exchange_code: string
}

export interface AccountInterface {
  id: string
  name: string
  company: string
  description: string
  creation_time: string
  owner: {
    id: string
    username: string
  }
  status: 'active'

  // 补充字段
  type: 'personal' | 'group'
  balance: number
  voucher: number // 代金券数量
}

export interface PaymentInterface {
  id: string
  subject: string
  payment_method: 'coupon' | 'balance'
  executor: string
  payer_id: string
  payer_name: string
  payer_type: 'user' | 'vo'
  payable_amounts: string
  amounts: string
  coupon_amount: string
  creation_time: string
  payment_time: string
  remark: string
  status: 'wait' | 'success' | 'error' | 'closed'
  status_desc: string
  order_id: string
  app_id: string
  app_service_id: string
  'coupon_historys'?: {
    cash_coupon_id: string
    amounts: string
    before_payment: string
    after_payment: string
    creation_time: string
  }[]
}

/* table的类型 */

// 整体加载表
export interface TotalTable {
  status: 'init' | 'loading' | 'total' | 'error'
}

// 累计加载表
export interface PartTable {
  status: 'init' | 'loading' | 'part' | 'error'
}

// id
export interface IdTable<T> {
  allIds: string[]
  byId: Record<string, T>
}

// localId
export interface LocalIdTable<T> {
  allLocalIds: string[]
  byLocalId: Record<string, T>
}

/* table的类型 */

/* 表的具体类型 */

// 全部service table
export interface ServiceTableInterface extends TotalTable, IdTable<ServiceInterface> {
}

// 有管理权限的service table
export interface AdminServiceTableInterface extends TotalTable, IdTable<ServiceInterface> {
}

// 全部account table
export interface AccountTableInterface extends TotalTable, IdTable<AccountInterface> {
}

// group account table
export interface GroupAccountTableInterface extends TotalTable, IdTable<AccountInterface> {
}

/* 表的具体类型 */

export const useStore = defineStore('wallet', {
  state: () => ({
    items: {
      // 实时记录用户所在app局部路径位置
      // 例如'/my/server/personal/list' -> ['personal', 'list'], 供二级三级导航栏在刷新时保持选择使用
      currentPath: [] as string[],
      // 账户在vms内的身份
      fedRole: '' as 'ordinary' | 'federal-admin', // 联邦层级：普通用户还是管理员
      adminServiceIds: [] as string[] // 有vms管理员权限的接入服务id
    },
    tables: {
      /* 整体加载表：一旦加载则全部加载 */
      // 全部service
      serviceTable: {
        byId: {},
        allIds: [],
        status: 'init'
      } as ServiceTableInterface,
      // 全部有管理权限的service
      adminServiceTable: {
        byId: {},
        allIds: [],
        status: 'init'
      } as AdminServiceTableInterface,
      // 全部账户：个人账户，项目组账户
      accountTable: {
        byId: {},
        allIds: [],
        status: 'init'
      } as AccountTableInterface,
      // 全部项目组账户
      groupAccountTable: {
        byId: {},
        allIds: [],
        status: 'init'
      } as AccountTableInterface
      /* 整体加载表：一旦加载则全部加载 */
    }
  }),
  getters: {
    // 根据所需，返回service options
    getServiceOptions: state => (style: 'withAll' | 'withoutAll' | 'admin') => {
      const services = (style === 'admin' ? state.items.adminServiceIds : state.tables.serviceTable.allIds).map(serviceId => {
        const currentService = state.tables.serviceTable.byId[serviceId]
        return {
          value: currentService?.id,
          label: currentService?.name,
          labelEn: currentService?.name_en
        }
      })
      if (style === 'withAll') {
        services.unshift(
          {
            value: 'all',
            label: '全部服务单元',
            labelEn: 'All Service Units'
          }
        )
      }
      return services
    }
    // // 根据管理员权限，返回serviceOption：1.联邦管理员获取全部服务单元；2.服务单元管理员获取全部管理权限对应服务单元
    // getServiceOptionsByRole: state => (isFedAdmin: boolean) => {
    //   const services = (isFedAdmin ? state.tables.serviceTable.allIds : state.items.adminServiceIds).map(serviceId => {
    //     const currentService = state.tables.serviceTable.byId[serviceId]
    //     return {
    //       value: currentService?.id,
    //       label: currentService?.name,
    //       labelEn: currentService?.name_en
    //     }
    //   })
    //   services.unshift(
    //     {
    //       value: 'all',
    //       label: '全部服务单元',
    //       labelEn: 'All Service Units'
    //     }
    //   )
    //   return services
    // },
    // getAllServices: state => state.tables.serviceTable.allIds
    //   .map(serviceId => {
    //     const currentService = state.tables.serviceTable.byId[serviceId]
    //     return {
    //       value: currentService?.id,
    //       label: currentService?.name,
    //       labelEn: currentService?.name_en
    //     }
    //   })
  },
  actions: {
    /* items */
    async loadAllItems () {
      void this.loadServerRole()
    },
    async loadServerRole () {
      try {
        const respGetUserPermissionPolicy = await api.wallet.user.getUserPermissionPolicy()
        this.items.fedRole = respGetUserPermissionPolicy.data.role
        this.items.adminServiceIds = respGetUserPermissionPolicy.data.vms.service_ids
      } catch (exception) {
        exceptionNotifier(exception)
      }
    },
    /* items */

    /* tables */
    loadTotalTables () {
      if (this.tables.accountTable.status === 'init') {
        void this.loadAccountTable()
      }
      if (this.tables.serviceTable.status === 'init') {
        void this.loadServiceTable()
      }
      if (this.tables.adminServiceTable.status === 'init') {
        void this.loadAdminServiceTable()
      }
      if (this.tables.groupAccountTable.status === 'init') {
        void this.loadGroupAccountTable()
      }
    },
    // 加载全部service
    async loadServiceTable () {
      this.tables.serviceTable = {
        byId: {},
        allIds: [],
        status: 'init'
      }
      this.tables.serviceTable.status = 'loading'
      try {
        // object storage services
        const respGetStorageService = await api.wallet.storage.getStorageService()
        for (const data of respGetStorageService.data.results) {
          Object.assign(data, { pay_app_service_type: 'storage' })
          Object.assign(this.tables.serviceTable.byId, { [data.id]: data })
          this.tables.serviceTable.allIds.unshift(data.id)
          this.tables.serviceTable.allIds = [...new Set(this.tables.serviceTable.allIds)]
        }

        // cloud server services
        const respGetServerService = await api.wallet.service.getService()
        for (const data of respGetServerService.data.results) {
          Object.assign(data, { pay_app_service_type: 'server' })
          Object.assign(this.tables.serviceTable.byId, { [data.id]: data })
          this.tables.serviceTable.allIds.unshift(data.id)
          this.tables.serviceTable.allIds = [...new Set(this.tables.serviceTable.allIds)]
        }

        this.tables.serviceTable.status = 'total'
      } catch (exception) {
        exceptionNotifier(exception)
        this.tables.serviceTable.status = 'error'
      }
    },
    // 加载有管理员权限的service
    async loadAdminServiceTable () {
      this.tables.adminServiceTable = {
        byId: {},
        allIds: [],
        status: 'init'
      }
      this.tables.adminServiceTable.status = 'loading'
      try {
        const respGetAdminService = await api.wallet.service.getServiceAdmin()
        for (const data of respGetAdminService.data.results) {
          Object.assign(this.tables.adminServiceTable.byId, { [data.id]: data })
          this.tables.adminServiceTable.allIds.unshift(data.id)
          this.tables.adminServiceTable.allIds = [...new Set(this.tables.adminServiceTable.allIds)]
        }
        this.tables.adminServiceTable.status = 'total'
      } catch (exception) {
        exceptionNotifier(exception)
        this.tables.adminServiceTable.status = 'error'
      }
    },
    // 加载用户相关全部账户，包括个人账户、项目组账户
    async loadAccountTable () {
      // clear
      this.tables.accountTable = {
        byId: {},
        allIds: [],
        status: 'init'
      }
      // status
      this.tables.accountTable.status = 'loading'
      // load
      try {
        // personal account
        const storeMain = useStoreMain()
        const personalAccount = {
          id: storeMain.items.tokenDecoded.email,
          name: storeMain.items.tokenDecoded.email,
          company: '',
          description: '',
          creation_time: '',
          owner: {
            id: storeMain.items.tokenDecoded.email,
            username: storeMain.items.tokenDecoded.email
          },
          status: 'active',

          // 补充字段
          type: 'personal',
          balance: 0,
          voucher: 0
        }

        // get personal balance
        const respPersonalBalance = await api.wallet.account.getAccountBalanceUser()
        personalAccount.balance = respPersonalBalance.data.balance

        // get personal voucher count
        const respPersonalVoucher = await api.wallet.cashcoupon.getCashCoupon()
        personalAccount.voucher = respPersonalVoucher.data.count

        // add personal account to accountTable
        Object.assign(this.tables.accountTable.byId, { personal: personalAccount })
        this.tables.accountTable.allIds.unshift('personal')
        this.tables.accountTable.allIds = [...new Set(this.tables.accountTable.allIds)]
        // done personal account

        // all group accounts
        const respGroup = await api.wallet.vo.getVo()
        for (const data of respGroup.data.results) {
          // get group balance
          const respGroupBalance = await api.wallet.account.getAccountBalanceVo({ path: { vo_id: data.id } })
          // get group voucher count
          const respGroupVoucher = await api.wallet.cashcoupon.getCashCoupon({ query: { vo_id: data.id } })
          // 添加type/balance/voucher字段
          Object.assign(data, {
            type: 'group',
            balance: respGroupBalance.data.balance,
            voucher: respGroupVoucher.data.count
          })
          // 保存table
          Object.assign(this.tables.accountTable.byId, { [data.id]: data })
          this.tables.accountTable.allIds.unshift(data.id)
          this.tables.accountTable.allIds = [...new Set(this.tables.accountTable.allIds)]
        }
        // done all group accounts

        // status
        this.tables.accountTable.status = 'total'
      } catch (exception) {
        exceptionNotifier(exception)
        this.tables.accountTable.status = 'error'
      }
    },
    async loadGroupAccountTable () {
      // clear
      this.tables.groupAccountTable = {
        byId: {},
        allIds: [],
        status: 'init'
      }
      // status
      this.tables.groupAccountTable.status = 'loading'
      // load
      try {
        // all group accounts
        const respGroup = await api.wallet.vo.getVo()
        for (const data of respGroup.data.results) {
          // get group balance
          const respGroupBalance = await api.wallet.account.getAccountBalanceVo({ path: { vo_id: data.id } })
          // get group voucher count
          const respGroupVoucher = await api.wallet.cashcoupon.getCashCoupon({ query: { vo_id: data.id } })
          // 添加type/balance/voucher字段
          Object.assign(data, {
            balance: respGroupBalance.data.balance,
            voucher: respGroupVoucher.data.count
          })
          // 保存table
          Object.assign(this.tables.groupAccountTable.byId, { [data.id]: data })
          this.tables.groupAccountTable.allIds.unshift(data.id)
          this.tables.groupAccountTable.allIds = [...new Set(this.tables.groupAccountTable.allIds)]
        }
        // done all group accounts

        // status
        this.tables.groupAccountTable.status = 'total'
      } catch (exception) {
        exceptionNotifier(exception)
        this.tables.groupAccountTable.status = 'error'
      }
    },
    /* tables */

    /* dialog */
    triggerCreateVoucherDialog () {
      Dialog.create({
        component: CreateVoucherDialog
      })
    }
    /* dialog */
  }
})
