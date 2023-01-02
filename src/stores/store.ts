import { defineStore } from 'pinia'
import { normalize, schema } from 'normalizr'
import { i18n } from 'boot/i18n'
import api from 'src/api'
// @ts-expect-error
import { useStoreMain } from '@cnic/main'

import useExceptionNotifier from 'src/hooks/useExceptionNotifier'

const { tc } = i18n.global
const exceptionNotifier = useExceptionNotifier()

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
}

// export interface BalanceInterface {
//   id: string
//   balance: string
//   creation_time: string
//   vo: {
//     id: string
//   }
// }

/* table的类型 */

// 整体加载表
export interface totalTable {
  status: 'init' | 'loading' | 'total' | 'error'
}

// 累计加载表
export interface partTable {
  status: 'init' | 'loading' | 'part' | 'error'
}

// id
export interface idTable<T> {
  allIds: string[]
  byId: Record<string, T>
}

// localId
export interface localIdTable<T> {
  allLocalIds: string[]
  byLocalId: Record<string, T>
}

/* table的类型 */

/* 表的具体类型 */

// 全部account table
export interface AccountTableInterface extends totalTable, idTable<AccountInterface> {
}

/* 表的具体类型 */

export const useStore = defineStore('wallet', {
  state: () => ({
    items: {
      // 实时记录用户所在app局部路径位置
      // 例如'/my/server/personal/list' -> ['personal', 'list'], 供二级三级导航栏在刷新时保持选择使用
      currentPath: [] as string[]
    },
    tables: {
      /* 整体加载表：一旦加载则全部加载 */
      accountTable: {
        byId: {},
        allIds: [],
        status: 'init'
      } as AccountTableInterface
      /* 整体加载表：一旦加载则全部加载 */
    }
  }),
  getters: {},
  actions: {
    /* tables */
    loadTotalTables () {
      if (this.tables.accountTable.status === 'init') {
        void this.loadAccountTable()
      }
    },

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
          balance: 0
        }
        // get personal balance
        const respPersonalBalance = await api.wallet.account.getAccountBalanceUser()
        personalAccount.balance = respPersonalBalance.data.balance
        // add personal account to accountTable
        Object.assign(this.tables.accountTable.byId, { personal: personalAccount })
        this.tables.accountTable.allIds.unshift('personal')
        this.tables.accountTable.allIds = [...new Set(this.tables.accountTable.allIds)]
        // done personal account

        // all group accounts
        const respGroup = await api.wallet.vo.getVo()
        // normalize
        const group = new schema.Entity('group')
        for (const data of respGroup.data.results) {
          // get group balance
          const respGroupBalance = await api.wallet.account.getAccountBalanceVo({ path: { vo_id: data.id } })
          // 添加type/balance字段
          Object.assign(data, {
            type: 'group',
            balance: respGroupBalance.data.balance
          })
          // normalize
          const normalizedData = normalize(data, group)
          // 保存table
          Object.assign(this.tables.accountTable.byId, normalizedData.entities.group)
          this.tables.accountTable.allIds.unshift(Object.keys(normalizedData.entities.group as Record<string, unknown>)[0])
          this.tables.accountTable.allIds = [...new Set(this.tables.accountTable.allIds)]
        }
        // done all group accounts

        // status
        this.tables.accountTable.status = 'total'
      } catch (exception) {
        exceptionNotifier(exception)
        this.tables.accountTable.status = 'error'
      }
    }
    /* tables */
  }
})
