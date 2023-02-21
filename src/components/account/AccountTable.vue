<script setup lang="ts">
import { ref, computed, PropType } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore, AccountInterface } from 'stores/store'
// import { useRoute/* , useRouter */ } from 'vue-router'
import { i18n } from 'boot/i18n'
import { navigateToUrl } from 'single-spa'

/* const props =  */
defineProps({
  accounts: {
    type: Array as PropType<AccountInterface[]>,
    required: true
  },
  isLoading: {
    type: Boolean,
    required: true,
    default: false
  },
  search: {
    type: String,
    required: false
  }
})
// const emits = defineEmits(['change', 'delete'])

const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
// const router = useRouter()

// 分栏定义
const columns = computed(() => [
  {
    name: 'account',
    label: (() => tc('名称'))(),
    field: 'account',
    align: 'center',
    classes: 'ellipsis',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'width: 100px;padding: 15px 0px'
  },
  {
    name: 'company',
    label: (() => tc('所属单位'))(),
    field: 'company',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px; min-width: 150px; max-width: 200px;  word-break: break-all; word-wrap: break-word; white-space: normal;',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'desc',
    label: (() => tc('备注'))(),
    field: 'desc',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px; min-width: 150px; max-width: 200px;  word-break: break-all; word-wrap: break-word; white-space: normal;',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'date',
    label: (() => tc('创建日期'))(),
    field: 'date',
    align: 'center',
    classes: 'ellipsis',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'max-width: 100px;padding: 15px 0px;word-break: break-all; word-wrap: break-word; white-space: normal;'
  },
  {
    name: 'voucher',
    label: (() => tc('代金券'))(),
    field: 'voucher',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'balance',
    label: (() => tc('余额'))(),
    field: 'balance',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'operation',
    label: (() => tc('操作'))(),
    field: 'operation',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  }
])

// 当前用户在group内的角色
// const myRole = computed(() => store.tables.groupTable.byId[props.servers[0]?.vo_id || '']?.myRole)

// 复制信息到剪切板
// const clickToCopy = useCopyToClipboard()

// table row hover
const hoverRow = ref('')
const onMouseEnterRow = (rowName: string) => {
  hoverRow.value = rowName
}
const onMouseLeaveRow = () => {
  hoverRow.value = ''
}

// 搜索方法，可扩展成更模糊的
const searchMethod = (rows: AccountInterface[], term: string): AccountInterface[] => rows.filter(account =>
  account.name.toLowerCase().includes(term) ||
  account.description.toLowerCase().includes(term) ||
  account.company.toLowerCase().includes(term)
)

</script>

<template>
  <div class="AccountTable">

    <q-table
      flat
      card-class=""
      table-class=""
      table-header-class="bg-grey-1 text-grey"
      :rows="accounts"
      :columns="columns"
      row-key="name"
      :loading="isLoading"
      color="primary"
      :loading-label="tc('正在加载')"
      :no-data-label="tc('暂无数据')"
      hide-pagination
      :pagination="{rowsPerPage: 0}"
      :filter="search"
      :filter-method="searchMethod"
      :no-results-label="tc('无筛选结果')"
    >

      <template v-slot:body="props">
        <q-tr :props="props"
              @mouseenter="onMouseEnterRow(props.row.name)"
              @mouseleave="onMouseLeaveRow"
        >

          <q-td key="account" :props="props">

            <div class="text-primary cursor-pointer"
                 @click="navigateToUrl('/my/server/group/detail/' + props.row.id)"
            >
              <q-tooltip> {{ tc('查看项目组详情') }}</q-tooltip>
              {{ props.row.name }}
            </div>

          </q-td>

          <q-td key="company" :props="props">
            {{ props.row.company }}
          </q-td>

          <q-td key="desc" :props="props">
            {{ props.row.description }}
          </q-td>

          <q-td key="date" :props="props">

            <!--              日期时间格式根据locale值变化-->
            <div v-if="i18n.global.locale==='zh'">
              <div>{{
                  new Date(props.row.creation_time).toLocaleString(i18n.global.locale).split(' ')[0]
                }}
              </div>
              <div>{{
                  new Date(props.row.creation_time).toLocaleString(i18n.global.locale).split(' ')[1]
                }}
              </div>
            </div>

            <div v-else>
              <div>{{
                  new Date(props.row.creation_time).toLocaleString(i18n.global.locale).split(',')[0]
                }}
              </div>
              <div>{{
                  new Date(props.row.creation_time).toLocaleString(i18n.global.locale).split(',')[1]
                }}
              </div>
            </div>
          </q-td>

          <q-td key="voucher" :props="props">

            <div class="row items-end justify-center text-primary cursor-pointer"
                 @click="navigateToUrl('/my/wallet/voucher/group?group=' + props.row.id)">
              <q-tooltip> {{ tc('查看代金券列表') }}</q-tooltip>
              <div class="text-h6">
                {{ props.row.voucher }}
              </div>
              <div class="text-h7 q-pb-xs">
                {{ tc('张') }}
              </div>
            </div>

          </q-td>

          <q-td key="balance" :props="props">

            <div class="row items-end justify-center text-primary cursor-pointer"
                 @click="navigateToUrl('/my/wallet/payment/group?group=' + props.row.id)">
              <q-tooltip> {{ tc('查看账户流水') }}</q-tooltip>
              <div class="text-h6">
                {{ props.row.balance }}
              </div>
              <div class="text-h7 q-pb-xs">
                {{ tc('点') }}
              </div>
            </div>

            <div class="row justify-center">
              <q-badge class="non-selectable" v-if="Number(props.row.balance) < 0" color="red">
                {{ tc('欠费') }}
              </q-badge>
            </div>

          </q-td>

          <q-td key="operation" :props="props">
            <div class="column q-gutter-y-md">

              <q-btn class="col-auto"
                     flat
                     no-caps
                     dense
                     :ripple="false"
                     color="primary"
                     @click="store.triggerRedeemCouponDialog(props.row.id)">
                {{ tc('兑换代金券') }}
                <q-tooltip> {{ tc('兑换代金券到此项目组') }}</q-tooltip>
              </q-btn>

              <q-btn class="col-auto"
                     flat
                     no-caps
                     dense
                     :ripple="false"
                     color="green"
                     @click="store.triggerChargeAccountDialog(props.row.id)">
                {{ tc('充值') }}
                <q-tooltip> {{ tc('充值到此项目组') }}</q-tooltip>
              </q-btn>

            </div>
          </q-td>

        </q-tr>
      </template>

      <!--      <template v-slot:bottom>-->
      <!--        &lt;!&ndash;            todo 批量操作&ndash;&gt;-->
      <!--      </template>-->

    </q-table>

    <q-separator/>

  </div>
</template>

<style lang="scss" scoped>
.AccountTable {
}
</style>
