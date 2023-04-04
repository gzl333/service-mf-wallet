<script setup lang="ts">
import { ref, computed, onMounted/* , PropType */ } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import api from 'src/api'
import { date, exportFile, QSelect, useQuasar } from 'quasar'

import useExceptionNotifier from 'src/hooks/useExceptionNotifier'
import useCopyToClipboard from 'src/hooks/useCopyToClipboard'

import type { VoucherInterface, UserInterface } from 'stores/store'

// const props = defineProps({
//   refresh: {
//     type: Boolean,
//     required: false
//   }
// })
// const emits = defineEmits(['change', 'delete'])

const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
// const router = useRouter()
const $q = useQuasar()
const exceptionNotifier = useExceptionNotifier()

// 复制信息到剪切板
const clickToCopy = useCopyToClipboard()

// table row hover
const hoverRow = ref('')
const onMouseEnterRow = (rowName: string) => {
  hoverRow.value = rowName
}
const onMouseLeaveRow = () => {
  hoverRow.value = ''
}

// table loading status
const isLoading = ref(false)

const rows = ref<VoucherInterface[]>()

// 筛选服务单元
const serviceOptions = computed(() => store.getAppServiceOptions(true, true))
const serviceSelection = ref('all')

// 筛选兑换状态
const statusOptions = computed(() => [
  {
    value: 'all',
    label: '全部兑换状态',
    labelEn: 'All Redeem Status'
  },
  {
    value: 'wait',
    label: '待兑换',
    labelEn: 'To Be Redeemed'
  },
  {
    value: 'available',
    label: '已兑换',
    labelEn: 'Redeemed'
  },
  {
    value: 'cancelled',
    label: '已取消',
    labelEn: 'Cancelled'
  },
  {
    value: 'deleted',
    label: '已删除',
    labelEn: 'Deleted'
  }
])
const statusSelection = ref<'all' | 'wait' | 'available' | 'cancelled' | 'deleted'>('all')

// 筛选有效期
const validOptions = computed(() => [
  {
    value: 'all',
    label: '全部有效期',
    labelEn: 'All Validity Status'
  },
  {
    value: 'valid',
    label: '有效期内',
    labelEn: 'Valid'
  },
  {
    value: 'notyet',
    label: '待生效',
    labelEn: 'Pending'
  },
  {
    value: 'expired',
    label: '已过期',
    labelEn: 'Expired'
  }
])
const validSelection = ref<'all' | 'notyet' | 'valid' | 'expired'>('all')

// 筛选日期
// const startTime = ref(date.formatDate(date.startOfDate(Date.now(), 'year'), 'YYYY-MM-DD'))
const startTime = ref('2021-01-01')
const endTime = ref(date.formatDate(Date.now(), 'YYYY-MM-DD'))

// 筛选issuer
const issuerOptions = computed(() => [
  {
    value: 'all',
    label: `${tc('全部发放者')}`
  },
  {
    value: 'username',
    label: `${tc('用户名关键字')}`
  },
  {
    value: 'user-id',
    label: `${tc('用户ID')}`
  }
])
const issuerSelection = ref('all')
// 直接输入user_id
const issuerInput = ref('')
// 输入username关键字
const issuerUsernameModel = ref<UserInterface>()
const issuerUsernameOptions = ref<UserInterface[]>()
// q-select的筛选函数
const filterIssuer = async (val: string, update: (arg0: () => Promise<void>, arg1: (ref: QSelect) => void) => void, abort: () => void) => {
  // 从第几位输入开始获取列表
  if (val.length < 1) {
    abort()
    return
  }
  // update是在select的输入有变化时的回调注册函数
  update(async () => {
    const respUsers = await api.wallet.user.getUser({ query: { search: val } })
    issuerUsernameOptions.value = respUsers.data.results
  },
  // "ref" is the Vue reference to the QSelect
  ref => {
    if (val !== '' && ref.options!.length > 0 && ref.getOptionIndex() === -1) {
      ref.moveOptionSelection(1, true) // focus the first selectable option and do not update the input-value
      ref.toggleOption(ref.options![ref.getOptionIndex()], true) // toggle the focused option
    }
  }
  )
}

// 筛选redeemer
const redeemerOptions = computed(() => [
  {
    value: 'all',
    label: `${tc('全部兑换者')}`
  },
  {
    value: 'username',
    label: `${tc('用户名关键字')}`
  },
  {
    value: 'user-id',
    label: `${tc('用户ID')}`
  }
])
const redeemerSelection = ref('all')
// 直接输入user_id
const redeemerInput = ref('')
// 输入username关键字
const redeemerUsernameModel = ref<UserInterface>()
const redeemerUsernameOptions = ref<UserInterface[]>()
// q-select的筛选函数
const filterRedeemer = async (val: string, update: (arg0: () => Promise<void>, arg1: (ref: QSelect) => void) => void, abort: () => void) => {
  // 从第几位输入开始获取列表
  if (val.length < 1) {
    abort()
    return
  }
  // update是在select的输入有变化时的回调注册函数
  update(async () => {
    const respUsers = await api.wallet.user.getUser({ query: { search: val } })
    redeemerUsernameOptions.value = respUsers.data.results
  },
  // "ref" is the Vue reference to the QSelect
  ref => {
    if (val !== '' && ref.options!.length > 0 && ref.getOptionIndex() === -1) {
      ref.moveOptionSelection(1, true) // focus the first selectable option and do not update the input-value
      ref.toggleOption(ref.options![ref.getOptionIndex()], true) // toggle the focused option
    }
  }
  )
}

// 根据当前搜索条件，更新rows，并更新count值
const loadRows = async () => {
  // table loading
  isLoading.value = true
  // request
  try {
    const respGetAdminVoucher = await api.wallet.admin.getAdminCashCoupon({
      query: {
        page: pagination.value.page,
        page_size: pagination.value.rowsPerPage,
        ...(serviceSelection.value !== 'all' && { app_service_id: store.tables.appServiceTable.byId[serviceSelection.value]?.id }), // id -> pay_app_service_id
        ...(statusSelection.value !== 'all' && { status: statusSelection.value }),
        ...(validSelection.value !== 'all' && { valid_status: validSelection.value }),
        ...(issuerSelection.value === 'user-id' && { issuer: issuerInput.value }),
        ...(issuerSelection.value === 'username' && { issuer: issuerUsernameModel.value?.username }),
        ...(redeemerSelection.value === 'user-id' && { redeemer: redeemerInput.value }),
        ...(redeemerSelection.value === 'username' && { redeemer: redeemerUsernameModel.value?.username }),
        ...(startTime.value !== '' && { time_start: date.formatDate(date.extractDate(startTime.value, 'YYYY-MM-DD'), 'YYYY-MM-DDTHH:mm:ssZ') }),
        ...(endTime.value !== '' && { time_end: date.formatDate(date.extractDate(endTime.value + 'T23:59:59', 'YYYY-MM-DDTHH:mm:ss'), 'YYYY-MM-DDTHH:mm:ssZ') })
      }
    })
    // 拿到rows值，给table用
    rows.value = respGetAdminVoucher.data.results
    // pagination count
    pagination.value.count = respGetAdminVoucher.data.count
  } catch (exception) {
    exceptionNotifier(exception)
  }
  // table stop loading
  isLoading.value = false
}

// 被pagination组件使用
const pagination = ref({
  page: 1, // 当前页码
  rowsPerPage: 10, // 每页条数
  count: 0 // 总共条数
})

// 复位分页
const resetPageSelection = () => {
  pagination.value.page = 1
}

// 重置所有搜索条件
const resetFilters = () => {
  serviceSelection.value = 'all'
  statusSelection.value = 'all'
  validSelection.value = 'all'
  issuerSelection.value = 'all'
  redeemerSelection.value = 'all'
}

// onMounted时加载初始table第一页
onMounted(loadRows)

// 分栏定义
const columns = computed(() => [
  // {
  //   name: 'status',
  //   label: (() => tc('状态'))(),
  //   align: 'center',
  //   classes: 'ellipsis',
  //   style: 'padding: 15px 0px',
  //   headerStyle: 'padding: 0 2px'
  // },
  {
    name: 'id',
    label: (() => tc('代金券ID'))(),
    align: 'center',
    classes: 'ellipsis',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'width: 100px;padding: 15px 0px'
  },
  {
    name: 'serviceNode',
    label: (() => tc('服务单元'))(),
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px; min-width: 150px; max-width: 250px; word-break: break-all; word-wrap: break-word; white-space: normal;',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'issuer',
    label: (() => tc('发放者'))(),
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'validTime',
    label: (() => tc('有效期'))(),
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'redeemer',
    label: (() => tc('兑换者'))(),
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'redeemTime',
    label: (() => tc('兑换日期'))(),
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'balance',
    label: (() => tc('余额'))(),
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  // {
  //   name: 'creator',
  //   label: (() => tc('创建者'))(),
  //   align: 'center',
  //   style: 'padding: 15px 0px; width: 100px', // 固定宽度防止更新状态时抖动
  //   headerStyle: 'padding: 0 2px'
  // },
  {
    name: 'code',
    label: (() => tc('兑换码'))(),
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'operation',
    label: (() => tc('操作'))(),
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px;width: 100px;',
    headerStyle: 'padding: 0 2px'
  }])

// row selection
const rowSelection = ref<VoucherInterface[]>([])
const clearRowSelection = () => {
  rowSelection.value = []
}

// export to csv
const exportTable = () => {
  // encoding to csv format
  const content =
    [i18n.global.locale === 'zh'
      ? ['代金券ID', '服务单元', '资源种类', '发放者', '创建时间', '失效时间', '兑换状态', '兑换者', '兑换时间', '原始面额', '当前余额', '兑换码']
      : ['Voucher ID', 'Service Node', 'Resource Type', 'Issuer', 'Creation Time', 'Expiration Time', 'Redeem Status', 'Redeemer', 'Redeem Time', 'Denomination', 'Balance', 'Exchange Code']
    ] // title line
      .concat(
        // contents of each line
        rowSelection.value.map(row => [
          row.id,
          (i18n.global.locale === 'zh' ? row.app_service?.name : row.app_service?.name_en) as string,
          row.app_service?.category === 'vms-server' ? tc('云主机')
            : row.app_service?.category === 'vms-object' ? tc('对象存储')
              : row.app_service?.category === 'high-cloud' ? tc('高等级云')
                : row.app_service?.category === 'hpc' ? tc('高性能计算')
                  : row.app_service?.category === 'other' ? tc('其它')
                    : tc('未知'),
          row.issuer,
          new Date(row.creation_time).toLocaleString(),
          new Date(row.expiration_time).toLocaleString(),
          row.status === 'wait' ? tc('待兑换')
            : row.status === 'available' ? '已兑换'
              : row.status === 'canceled' ? tc('已取消')
                : row.status === 'deleted' ? tc('已删除')
                  : tc('未知'),
          row.user?.username as string,
          new Date(row.granted_time).toLocaleString(),
          row.face_value,
          row.balance,
          row.exchange_code
        ])
      )
      .join('\r\n') // end of the line

  // console.log(content)

  const status = exportFile(
    `${tc('导出代金券列表')}-${new Date().toLocaleString()}.csv`,
    '\ufeff' + content,
    'text/csv'
  )

  if (status !== true) {
    $q.notify({
      classes: 'notification-negative shadow-15',
      icon: 'error',
      textColor: 'negative',
      message: `${tc('浏览器拒绝下载csv文件，请检查浏览器设置')}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
  }
}

// 删除代金券
const delVoucherAdmin = async (voucher: VoucherInterface) => {
  // 调用dialog, 拿到事件hooks
  const { onOk } = await store.triggerDeleteVoucherDialog(voucher, true)
  // 用hooks注册对应状态的回调函数
  onOk((isSuccess: boolean) => {
    // 如果删除成功，就重新搜索，获取最新列表
    if (isSuccess) {
      // 可优化部分：如果删除的是当页最后一个，应刷新前页
      loadRows()
    }
  })
}
</script>

<template>
  <div class="VoucherList">
    <div class=" column items-start justify-between q-mb-lg">

      <div class="col row full-width items-center justify-start q-pb-sm">

        <div class="col-auto q-gutter-x-sm q-pr-md">
          <q-btn unelevated no-caps color="primary"
                 @click="resetPageSelection();loadRows();clearRowSelection()">
            搜索
          </q-btn>
          <q-btn flat no-caps dense color="primary"
                 @click="resetFilters();resetPageSelection();loadRows();clearRowSelection()">
            重置
          </q-btn>
        </div>

        <div class="col">
          <div class="row q-gutter-md q-mb-sm">
            <q-select class="col-auto"
                      style="min-width: 170px; max-width: 300px;"
                      :label-color="serviceSelection !== 'all' ? 'primary' : ''"
                      outlined
                      dense
                      stack-label
                      :label="tc('筛选服务单元')"
                      v-model="serviceSelection"
                      :options="serviceOptions"
                      emit-value
                      map-options
                      option-value="value"
                      :option-label="i18n.global.locale ==='zh'? 'label':'labelEn'">
              <!--当前选项的内容插槽-->
              <!--          <template v-slot:selected-item="scope">-->
              <!--                <span :class="serviceSelection===scope.opt.value ? 'text-primary' : 'text-black'">-->
              <!--                  {{ i18n.global.locale === 'zh' ? scope.opt.label : scope.opt.labelEn }}-->
              <!--                </span>-->
              <!--          </template>-->

              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <!--                <q-tooltip>-->
                  <!--                  <div v-if="store.tables.serviceTable.byId[scope.opt.value]?.status === 'enable'">-->
                  <!--                    服务单元运行中-->
                  <!--                  </div>-->
                  <!--                  <div v-else-if="store.tables.serviceTable.byId[scope.opt.value]?.status === 'disable'">-->
                  <!--                    服务单元暂停服务-->
                  <!--                  </div>-->
                  <!--                  <div v-else-if="store.tables.serviceTable.byId[scope.opt.value]?.status === 'deleted'">-->
                  <!--                    服务单元已删除-->
                  <!--                  </div>-->
                  <!--                  <div v-else>-->
                  <!--                    全部服务单元-->
                  <!--                  </div>-->
                  <!--                </q-tooltip>-->
                  <!--                <q-item-section thumbnail>-->
                  <!--                  <q-icon v-if="store.tables.serviceTable.byId[scope.opt.value]?.status === 'enable'"-->
                  <!--                          color="light-green"-->
                  <!--                          name="play_arrow"/>-->
                  <!--                  <q-icon v-else-if="store.tables.serviceTable.byId[scope.opt.value]?.status === 'disable'"-->
                  <!--                          color="red"-->
                  <!--                          name="pause"/>-->
                  <!--                  <q-icon v-else-if="store.tables.serviceTable.byId[scope.opt.value]?.status === 'deleted'"-->
                  <!--                          color="black"-->
                  <!--                          name="clear"/>-->
                  <!--                  <q-icon v-else color="primary" name="done_all"/>-->
                  <!--                </q-item-section>-->
                  <q-item-section>
                    <q-item-label class="row items-center">
                      <q-icon v-if="scope.opt.value === 'all'"
                              class="col-auto"
                              color="primary"
                              size="sm"
                              name="mdi-check-all"/>
                      <q-icon v-if="store.tables.appServiceTable.byId[scope.opt.value]?.category === 'vms-server'"
                              class="col-auto"
                              color="primary"
                              size="sm"
                              name="computer"/>
                      <q-icon v-if="store.tables.appServiceTable.byId[scope.opt.value]?.category === 'vms-object'"
                              class="col-auto"
                              color="primary"
                              size="sm"
                              name="mdi-database"/>
                      <q-icon v-if="store.tables.appServiceTable.byId[scope.opt.value]?.category === 'high-cloud'"
                              class="col-auto"
                              color="primary"
                              size="sm"
                              name="mdi-security"/>
                      <q-icon v-if="store.tables.appServiceTable.byId[scope.opt.value]?.category === 'hpc'"
                              class="col-auto"
                              color="primary"
                              size="sm"
                              name="mdi-rocket-launch"/>
                      <q-icon v-if="store.tables.appServiceTable.byId[scope.opt.value]?.category === 'other'"
                              class="col-auto"
                              color="primary"
                              size="sm"
                              name="mdi-help-circle-outline"/>
                      <div class="col-auto">
                        {{ i18n.global.locale === 'zh' ? scope.opt.label : scope.opt.labelEn }}
                      </div>
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>

            </q-select>

            <q-select class="col-auto"
                      style="min-width: 170px;"
                      :label-color="statusSelection !== 'all' ? 'primary' : ''"
                      outlined
                      dense
                      stack-label
                      :label="tc('筛选兑换状态')"
                      v-model="statusSelection"
                      :options="statusOptions"
                      emit-value
                      map-options
                      option-value="value"
                      :option-label="i18n.global.locale ==='zh'? 'label':'labelEn'"
            >
              <!--当前选项的内容插槽-->
              <!--          <template v-slot:selected-item="scope">-->
              <!--                <span :class="validSelection===scope.opt.value ? 'text-primary' : 'text-black'">-->
              <!--                  {{ scope.opt.label }}-->
              <!--                </span>-->
              <!--          </template>-->
            </q-select>

            <q-select class="col-auto"
                      style="min-width: 170px;"
                      :label-color="validSelection !== 'all' ? 'primary' : ''"
                      outlined
                      dense
                      stack-label
                      :label="tc('筛选有效期')"
                      v-model="validSelection"
                      :options="validOptions"
                      emit-value
                      map-options
                      option-value="value"
                      :option-label="i18n.global.locale ==='zh'? 'label':'labelEn'"
            >
              <!--当前选项的内容插槽-->
              <!--          <template v-slot:selected-item="scope">-->
              <!--                <span :class="validSelection===scope.opt.value ? 'text-primary' : 'text-black'">-->
              <!--                  {{ scope.opt.label }}-->
              <!--                </span>-->
              <!--          </template>-->
            </q-select>

            <q-input style="width: 170px;"
                     v-model="startTime"
                     type="date"
                     :label="tc('创建时间起')"
                     outlined
                     dense/>

            <q-input style="width: 170px;"
                     v-model="endTime"
                     type="date"
                     :label="tc('创建时间止')"
                     outlined
                     dense/>
          </div>

          <div class="row q-gutter-md">
            <div class="col-auto row items-center no-wrap">
              <q-select class="col-auto"
                        style="min-width: 170px;"
                        outlined
                        dense
                        stack-label
                        :label="tc('筛选发放者')"
                        :label-color="issuerInput ? 'primary' : ''"
                        v-model="issuerSelection"
                        :options="issuerOptions"
                        emit-value
                        map-options
                        option-value="value"
                        option-label="label"
              >
                <!--当前选项的内容插槽-->
                <!--            <template v-slot:selected-item="scope">-->
                <!--                <span :class="creatorSelection===scope.opt.value ? 'text-primary' : 'text-black'">-->
                <!--                  {{ scope.opt.label }}-->
                <!--                </span>-->
                <!--            </template>-->
              </q-select>

              <q-select
                style="width: 300px;"
                v-if="issuerSelection === 'username'"
                v-model="issuerUsernameModel"
                :label-color="issuerUsernameModel ? 'primary' : ''"
                :label="tc('用户名关键字')"
                outlined
                dense
                use-input
                fill-input
                hide-selected
                clearable
                input-debounce="0"
                option-value="id"
                option-label="username"
                :options="issuerUsernameOptions"
                @filter="filterIssuer"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      {{ tc('暂无筛选结果') }}
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>

              <q-input
                style="width: 250px;"
                v-if="issuerSelection === 'user-id'"
                :label-color="issuerInput ? 'primary' : ''"
                v-model.trim="issuerInput"
                outlined
                dense
                :label="issuerSelection==='username' ? tc('用户名关键字') : issuerSelection==='user-id' ? tc('准确的用户ID') : ''"
                @keyup.enter="resetPageSelection();loadRows();clearRowSelection()"
              >
                <template v-slot:append v-if="issuerInput">
                  <q-icon name="close" @click="issuerInput = ''" class="cursor-pointer"/>
                </template>
              </q-input>

            </div>
            <div class="col-auto row items-center no-wrap">
              <q-select class="col-auto"
                        style="min-width: 170px;"
                        outlined
                        dense
                        stack-label
                        :label="tc('筛选兑换者')"
                        :label-color="redeemerInput ? 'primary' : ''"
                        v-model="redeemerSelection"
                        :options="redeemerOptions"
                        emit-value
                        map-options
                        option-value="value"
                        option-label="label"
              >
                <!--当前选项的内容插槽-->
                <!--            <template v-slot:selected-item="scope">-->
                <!--                <span :class="creatorSelection===scope.opt.value ? 'text-primary' : 'text-black'">-->
                <!--                  {{ scope.opt.label }}-->
                <!--                </span>-->
                <!--            </template>-->
              </q-select>

              <q-select
                style="width: 300px;"
                v-if="redeemerSelection === 'username'"
                v-model="redeemerUsernameModel"
                :label-color="redeemerUsernameModel ? 'primary' : ''"
                :label="tc('用户名关键字')"
                outlined
                dense
                use-input
                fill-input
                hide-selected
                clearable
                input-debounce="0"
                option-value="id"
                option-label="username"
                :options="redeemerUsernameOptions"
                @filter="filterRedeemer"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      {{ tc('暂无筛选结果') }}
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>

              <q-input
                style="width: 250px;"
                v-if="redeemerSelection === 'user-id'"
                :label-color="redeemerInput ? 'primary' : ''"
                v-model.trim="redeemerInput"
                outlined
                dense
                :label="redeemerSelection==='username' ? tc('用户名关键字') : redeemerSelection==='user-id' ? tc('准确的用户ID') : ''"
                @keyup.enter="resetPageSelection();loadRows();clearRowSelection()"
              >
                <template v-slot:append v-if="redeemerInput">
                  <q-icon name="close" @click="redeemerInput = ''" class="cursor-pointer"/>
                </template>
              </q-input>
            </div>
          </div>

        </div>

        <div class="col-auto q-gutter-x-sm">
          <q-btn unelevated no-caps color="green" @click="store.triggerCreateVoucherDialog()">
            创建代金券
          </q-btn>
        </div>

      </div>

    </div>

    <q-table
      flat
      card-class=""
      table-class=""
      table-header-class="bg-grey-1 text-grey"
      :rows="rows"
      :columns="columns"
      :loading="isLoading"
      color="primary"
      :loading-label="tc('网络请求中，请稍候...')"
      :no-data-label="tc('无搜索结果')"
      hide-pagination
      :pagination="{rowsPerPage: 0}"
      row-key="id"
      selection="multiple"
      v-model:selected="rowSelection"
    >

      <template v-slot:header-selection="scope">
        <q-checkbox v-model="scope.selected" dense size="xs">
          <q-tooltip> {{ tc('选择本页全部') }}</q-tooltip>
        </q-checkbox>
      </template>

      <template v-slot:top>

        <div class="row full-width items-center justify-between">

          <div class="col-auto row items-center">
            <div v-if="pagination.count" class="col-auto row items-center">
              <div class="text-grey">{{ tc('选中') }}</div>
              <div class="">{{ rowSelection.length }}</div>
              <div class="q-px-xs">/</div>
            </div>

            <div class="col-auto text-grey">{{ tc('搜索总计') }}</div>
            <div class="col-auto ">{{ pagination.count }}</div>
          </div>

          <div class="col-auto row items-center q-gutter-x-xs">
            <div class="col-auto text-grey">{{ tc('批量操作') }}</div>
            <q-btn
              :disable="rowSelection.length === 0"
              class="col-auto"
              color="primary"
              flat
              :label="tc('导出')"
              no-caps
              dense
              @click="exportTable"
            />
          </div>
        </div>

      </template>

      <template v-slot:body="props">
        <q-tr :props="props"
              @mouseenter="onMouseEnterRow(props.row.id)"
              @mouseleave="onMouseLeaveRow"
        >

          <q-td auto-width>
            <q-checkbox v-model="props.selected" dense size="xs"/>
          </q-td>

<!--          <q-td key="status" :props="props">-->
<!--            <q-chip v-if="props.row.status === 'wait'"-->
<!--                    style="width: 80px;"-->
<!--                    color="primary"-->
<!--                    text-color="white"-->
<!--                    icon="more_horiz">-->
<!--              <div class="row justify-center">-->
<!--                {{ tc('待兑换') }}-->
<!--              </div>-->
<!--            </q-chip>-->

<!--            <q-chip v-if="props.row.status === 'available'"-->
<!--                    style="width: 80px;"-->
<!--                    color="green"-->
<!--                    text-color="white"-->
<!--                    icon="done">-->
<!--              <div class="row justify-center">-->
<!--                {{ tc('已兑换') }}-->
<!--              </div>-->
<!--            </q-chip>-->

<!--            <q-chip v-if="props.row.status === 'cancelled'"-->
<!--                    style="width: 80px;"-->
<!--                    color="red"-->
<!--                    text-color="white"-->
<!--                    icon="close">-->
<!--              <div class="row justify-center">-->
<!--                {{ tc('已取消') }}-->
<!--              </div>-->
<!--            </q-chip>-->

<!--            <q-chip v-if="props.row.status === 'deleted'"-->
<!--                    style="width: 80px;"-->
<!--                    color="grey"-->
<!--                    text-color="white"-->
<!--                    icon="delete_forever">-->
<!--              <div class="row justify-center">-->
<!--                {{ tc('已删除') }}-->
<!--              </div>-->
<!--            </q-chip>-->
<!--          </q-td>-->

          <q-td key="id" :props="props">
            {{ props.row.id }}
          </q-td>

          <q-td key="serviceNode" :props="props">

            <div class="column items-center">

              <div v-if="props.row.app_service?.category === 'vms-server'"
                   class="column items-center">
                <q-icon
                  class="col"
                  name="computer"
                  color="primary"
                  size="md"
                />
                <div class="col">
                  {{ tc('云主机') }}
                </div>
              </div>

              <div v-if="props.row.app_service?.category === 'vms-object'"
                   class="column items-center">
                <q-icon
                  class="col"
                  name="mdi-database"
                  color="primary"
                  size="md"
                />
                <div class="col">
                  {{ tc('对象存储') }}
                </div>
              </div>

              <div v-if="props.row.app_service?.category === 'hpc'"
                   class="column items-center">
                <q-icon
                  class="col"
                  name="mdi-rocket-launch"
                  color="primary"
                  size="md"
                />
                <div class="col">
                  {{ tc('高性能计算') }}
                </div>
              </div>

              <div v-if="props.row.app_service?.category === 'high-cloud'"
                   class="column items-center">
                <q-icon
                  class="col"
                  name="mdi-security"
                  color="primary"
                  size="md"
                />
                <div class="col">
                  {{ tc('高等级云') }}
                </div>
              </div>

              <div v-if="props.row.app_service?.category === 'other'"
                   class="column items-center">
                <q-icon
                  class="col"
                  name="mdi-help-circle-outline"
                  color="primary"
                  size="md"
                />
                <div class="col">
                  {{ tc('其它资源') }}
                </div>
              </div>

              <div class="col">
                {{
                  i18n.global.locale === 'zh' ?
                    props.row.app_service?.name :
                    props.row.app_service?.name_en
                }}
              </div>
            </div>

          </q-td>

          <q-td key="issuer" :props="props">
            {{ props.row.issuer || tc('未知') }}
          </q-td>

          <q-td key="validTime" :props="props">
            <div class="row items-center justify-center">

              <div class="col-auto">
                <div v-if="i18n.global.locale==='zh'">
                  <div>{{ new Date(props.row.effective_time).toLocaleString(i18n.global.locale).split(' ')[0] }}</div>
                  <div>{{ new Date(props.row.effective_time).toLocaleString(i18n.global.locale).split(' ')[1] }}</div>
                </div>

                <div v-else>
                  <div>{{ new Date(props.row.effective_time).toLocaleString(i18n.global.locale).split(',')[0] }}</div>
                  <div>{{ new Date(props.row.effective_time).toLocaleString(i18n.global.locale).split(',')[1] }}</div>
                </div>
              </div>

              <div class="col-auto q-px-sm">
                -
              </div>

              <div class="col-auto">
                <div v-if="i18n.global.locale==='zh'">
                  <div>{{ new Date(props.row.expiration_time).toLocaleString(i18n.global.locale).split(' ')[0] }}</div>
                  <div>{{ new Date(props.row.expiration_time).toLocaleString(i18n.global.locale).split(' ')[1] }}</div>
                </div>

                <div v-else>
                  <div>{{ new Date(props.row.expiration_time).toLocaleString(i18n.global.locale).split(',')[0] }}</div>
                  <div>{{ new Date(props.row.expiration_time).toLocaleString(i18n.global.locale).split(',')[1] }}</div>
                </div>
              </div>

            </div>

            <div class="row items-center justify-center">

              <q-badge
                v-if="((new Date() - new Date(props.row.expiration_time)) < 0 ) && ((new Date() - new Date(props.row.effective_time)) > 0)"
                color="green">
                {{ tc('有效期内') }}
              </q-badge>

              <q-badge
                v-if="(new Date() - new Date(props.row.expiration_time)) > 0"
                color="negative">
                {{ tc('已过期') }}
              </q-badge>

              <q-badge
                v-if="(new Date(props.row.effective_time) - new Date()) > 0"
                color="primary">
                {{ tc('待生效') }}
              </q-badge>

            </div>

          </q-td>

          <q-td key="redeemer" :props="props">
            <div class="column items-center">
              {{ props.row.user?.username || tc('未知') }}

              <q-chip v-if="props.row.status === 'wait'"
                      style="width: 80px;"
                      color="primary"
                      text-color="white"
                      icon="more_horiz">
                <div class="row justify-center">
                  {{ tc('待兑换') }}
                </div>
              </q-chip>

              <q-chip v-if="props.row.status === 'available'"
                      style="width: 80px;"
                      color="green"
                      text-color="white"
                      icon="done">
                <div class="row justify-center">
                  {{ tc('已兑换') }}
                </div>
              </q-chip>

              <q-chip v-if="props.row.status === 'cancelled'"
                      style="width: 80px;"
                      color="negative"
                      text-color="white"
                      icon="close">
                <div class="row justify-center">
                  {{ tc('已取消') }}
                </div>
              </q-chip>

              <q-chip v-if="props.row.status === 'deleted'"
                      style="width: 80px;"
                      color="grey"
                      text-color="white"
                      icon="delete_forever">
                <div class="row justify-center">
                  {{ tc('已删除') }}
                </div>
              </q-chip>
            </div>

          </q-td>

          <q-td key="redeemTime" :props="props">
            <div v-if="props.row.granted_time === null">
              {{ tc('未知') }}
            </div>

            <div v-else>
              <div v-if="i18n.global.locale==='zh'">
                <div>{{ new Date(props.row.granted_time).toLocaleString(i18n.global.locale).split(' ')[0] }}</div>
                <div>{{ new Date(props.row.granted_time).toLocaleString(i18n.global.locale).split(' ')[1] }}</div>
              </div>

              <div v-else>
                <div>{{ new Date(props.row.granted_time).toLocaleString(i18n.global.locale).split(',')[0] }}</div>
                <div>{{ new Date(props.row.granted_time).toLocaleString(i18n.global.locale).split(',')[1] }}</div>
              </div>
            </div>
          </q-td>

          <q-td key="balance" :props="props">

            <div class="row items-center justify-center">

              <q-knob
                class="col-auto"
                readonly
                :model-value="Number(props.row.balance) / Number(props.row.face_value) * 100"
                show-value
                size="50px"
                :thickness="0.22"
                :color="((new Date() - new Date(props.row.expiration_time)) < 0 ) && ((new Date() - new Date(props.row.effective_time)) > 0) ? 'green' : 'grey-5'"
                track-color="grey-3"
              >
                <div class="text-caption"
                     :class="((new Date() - new Date(props.row.expiration_time)) < 0 ) && ((new Date() - new Date(props.row.effective_time)) > 0) ? 'text-green' : ''">

                  {{ (Number(props.row.balance) / Number(props.row.face_value) * 100).toFixed(0) }}%
                </div>
              </q-knob>

              <div class="col-auto column">

                <div class="col-auto column">
                  <div class="col-auto text-grey">
                    {{ tc('当前余额') }}
                  </div>
                  <div class="col-auto text-weight-bold"
                       :class="((new Date() - new Date(props.row.expiration_time)) < 0 ) && ((new Date() - new Date(props.row.effective_time)) > 0) ? 'text-green' : ''">
                    {{ props.row.balance }}
                  </div>
                </div>

                <div class="col-auto column">
                  <div class="col-auto text-grey">
                    {{ tc('原始面额') }}
                  </div>
                  <div class="col-auto text-weight-bold"
                       :class="((new Date() - new Date(props.row.expiration_time)) < 0 ) && ((new Date() - new Date(props.row.effective_time)) > 0) ? 'text-green' : ''">
                    {{ props.row.face_value }}
                  </div>
                </div>

              </div>

            </div>

          </q-td>

          <!--          <q-td key="creator" :props="props">-->
          <!--            API暂未提供-->
          <!--          </q-td>-->

          <q-td key="code" :props="props">
            {{ props.row.exchange_code }}
            <q-btn v-if="hoverRow === props.row.id"
                   class="col-shrink q-px-xs q-ma-none" flat no-caps dense icon="content_copy" size="xs" color="primary"
                   @click="clickToCopy(props.row.exchange_code)">
              <q-tooltip>
                {{ tc('复制到剪切板') }}
              </q-tooltip>
            </q-btn>
            <q-btn v-else
                   class="col-shrink q-px-xs q-ma-none invisible" flat dense icon="content_copy" size="xs">
            </q-btn>
          </q-td>

          <q-td key="operation" :props="props">
            <q-btn
              flat
              dense
              no-caps
              color="primary"
              @click="delVoucherAdmin(props.row)">
              {{ tc('删除') }}
            </q-btn>
          </q-td>

        </q-tr>
      </template>

      <template v-slot:bottom>
        <div class="row full-width items-center justify-end">
          <div class="col row items-center justify-end text-grey">
            <q-select color="grey"
                      v-model="pagination.rowsPerPage"
                      :options="[10,25,50,100,150,200,250,300,350,400,450,500]"
                      dense
                      options-dense
                      borderless
                      @update:model-value="resetPageSelection();loadRows();clearRowSelection()">
              <!--当前选项的内容插槽-->
              <!--                      <template v-slot:selected-item>-->
              <!--                            <span class="text-grey">-->
              <!--                            {{ pagination.rowsPerPage }}-->
              <!--                            </span>-->
              <!--                      </template>-->
            </q-select>
            项/页
          </div>

          <q-pagination v-model="pagination.page"
                        :max="Math.ceil(pagination.count / pagination.rowsPerPage )"
                        :max-pages="9"
                        direction-links
                        flat
                        :ripple="false"
                        @update:model-value="loadRows();clearRowSelection()"
          />
        </div>
      </template>
    </q-table>

  </div>
</template>

<style lang="scss" scoped>
.VoucherList {
}
</style>
