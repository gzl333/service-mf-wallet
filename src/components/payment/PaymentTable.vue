<script setup lang="ts">
import { ref, computed, watch, /*  PropType, */ onMounted } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import api from 'src/api'
import { exportFile, Notify, date } from 'quasar'

import useExceptionNotifier from 'src/hooks/useExceptionNotifier'
// import useCopyToClipboard from 'src/hooks/useCopyToClipboard'

import type { PaymentInterface } from 'stores/store'

const props = defineProps({
  isGroup: {
    type: Boolean,
    required: false,
    default: false
  },
  groupId: {
    type: String,
    required: false
  }
})
// const emits = defineEmits(['change', 'delete'])

const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
// const router = useRouter()
const exceptionNotifier = useExceptionNotifier()
// const clickToCopy = useCopyToClipboard()

// 筛选项目组
const groupSelection = ref('')
// 项目组选项
const groupOptions = computed(() => store.tables.groupAccountTable.allIds.map((accountId) => ({
  value: accountId,
  label: store.tables.groupAccountTable.byId[accountId].name
})))

if (props.isGroup) {
  // 项目组默认选择
  const chooseGroup = () => {
    groupSelection.value = props.groupId || groupOptions.value[0]?.value || ''
  }
  // setup时调用一次 table已加载时，从别的页面进入本页面要选一次默认值
  if (store.tables.groupAccountTable.status === 'total') {
    chooseGroup()
    onMounted(() => (loadRows('first')))
  } else {
    // 刷新页面，table未加载时进入页面，根据table的加载状态变化一次都要选一次默认值。细分到每个table。
    watch(groupOptions, () => {
      if (store.tables.groupAccountTable.status === 'total') {
        chooseGroup()
        loadRows('first') // 读取当前项目组的rows
      }
    })
  }
} else {
  onMounted(() => (loadRows('first')))
}

// 筛选服务单元
const serviceOptions = computed(() => store.getAppServiceOptions(false, true))
const serviceSelection = ref('all')

// 筛选日期
const startTime = ref(date.formatDate(date.startOfDate(Date.now(), 'month'), 'YYYY-MM-DD'))
const endTime = ref(date.formatDate(date.endOfDate(Date.now(), 'month'), 'YYYY-MM-DD'))

// 交易类型
const typeOptions = [
  {
    value: 'all',
    label: '全部类型',
    labelEn: 'All Types'
  },
  {
    value: 'payment',
    label: '支付',
    labelEn: 'Payment'
  },
  {
    value: 'recharge',
    label: '充值',
    labelEn: 'Recharge'
  },
  {
    value: 'refund',
    label: '退款',
    labelEn: 'Refund'
  }
]
const typeSelection = ref<'payment' | 'recharge' | 'refund' | 'all'>('all')

// table loading status
const isLoading = ref(false)

const rows = ref<PaymentInterface[]>()

// pagination marker 前后翻页用
// const pagination = ref({
//   has_next: false,
//   page_size: 10,
//   prev: '',
//   curr: '',
//   next: ''
// })

const paginationMarker = ref({
  markers: [] as string[],
  currentIndex: 0,
  page_size: 10
})

// 复位分页： 应该就是根据当前筛选参数请求第一页

// 重置所有搜索条件
const resetFilters = () => {
  serviceSelection.value = 'all'
  typeSelection.value = 'all'
  startTime.value = date.formatDate(date.startOfDate(Date.now(), 'month'), 'YYYY-MM-DD')
  endTime.value = date.formatDate(date.endOfDate(Date.now(), 'month'), 'YYYY-MM-DD')
}

// 检查开始时间-截至时间的选择：截止时间应晚于开始时间
const checkTime = () => {
  const startTimeObj = date.extractDate(startTime.value, 'YYYY-MM-DD')
  const endTimeObj = date.extractDate(endTime.value, 'YYYY-MM-DD')
  const diff = date.getDateDiff(endTimeObj, startTimeObj, 'days')
  if (diff <= 0) {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'mdi-alert',
      textColor: 'negative',
      message: '时间选择错误',
      caption: '截止时间应晚于开始时间一天以上',
      position: 'bottom',
      closeBtn: true,
      timeout: 0,
      multiLine: false
    })
    return false
  }
  return true
}

// 根据当前搜索条件，更新rows，并更新pagination
const loadRows = async (direction: 'first' | 'prev' | 'next') => {
  // check inputs
  if (!checkTime()) {
    return
  }
  // table loading
  isLoading.value = true
  // request
  try {
    if (direction === 'first') {
      const respGetPayment = await api.wallet.trade.getTradeBill({
        query: {
          // 第一页不传marker
          page_size: paginationMarker.value.page_size,
          ...(props.isGroup && { vo_id: groupSelection.value }),
          ...(typeSelection.value !== 'all' && { trade_type: typeSelection.value }),
          ...(startTime.value !== '' && { time_start: date.formatDate(date.extractDate(startTime.value, 'YYYY-MM-DD'), 'YYYY-MM-DDThh:mm:ssZ') }),
          ...(endTime.value !== '' && { time_end: date.formatDate(date.extractDate(endTime.value, 'YYYY-MM-DD'), 'YYYY-MM-DDThh:mm:ssZ') }),
          ...(serviceSelection.value !== 'all' && { app_service_id: store.tables.appServiceTable.byId[serviceSelection.value]?.id })
        }
      })
      // console.log(respGetPayment.data.results)
      // 拿到rows值，给table用
      rows.value = respGetPayment.data.results
      // 更新pagination: 1. 有next； 2.没有next
      paginationMarker.value.currentIndex = 0
      paginationMarker.value.markers = [''] // 第一页的抓手为不传参或者传空串
      if (respGetPayment.data.has_next) {
        paginationMarker.value.markers.push(respGetPayment.data.next_marker)
      }
    } else if (direction === 'next') {
      // 访问后一页： 1. 没有后一页； 2.有后一页
      if (paginationMarker.value.currentIndex === paginationMarker.value.markers.length - 1) {
        // 提示没有后一页了
        Notify.create({
          classes: 'notification-negative shadow-15',
          icon: 'mdi-alert',
          textColor: 'negative',
          message: '无法翻页',
          caption: '没有后一页了',
          position: 'bottom',
          // closeBtn: true,
          timeout: 5000,
          multiLine: false
        })
      } else {
        // 有后一页
        const respGetPayment = await api.wallet.trade.getTradeBill({
          query: {
            marker: paginationMarker.value.markers[paginationMarker.value.currentIndex + 1],
            page_size: paginationMarker.value.page_size,
            ...(props.isGroup && { vo_id: groupSelection.value }),
            ...(typeSelection.value !== 'all' && { status: typeSelection.value }),
            ...(startTime.value !== '' && { time_start: date.formatDate(date.extractDate(startTime.value, 'YYYY-MM-DD'), 'YYYY-MM-DDThh:mm:ssZ') }),
            ...(endTime.value !== '' && { time_end: date.formatDate(date.extractDate(endTime.value, 'YYYY-MM-DD'), 'YYYY-MM-DDThh:mm:ssZ') }),
            ...(serviceSelection.value !== 'all' && { app_service_id: store.tables.appServiceTable.byId[serviceSelection.value]?.id })
          }
        })
        // console.log(respGetPayment.data)
        // 拿到rows值，给table用
        rows.value = respGetPayment.data.results
        // 更新pagination, 注意到达prev后，把prev之后的全部marker都替换为新的: 1. 有next； 2.没有next
        paginationMarker.value.currentIndex += 1
        paginationMarker.value.markers = paginationMarker.value.markers.slice(0, paginationMarker.value.currentIndex)
        paginationMarker.value.markers.push(respGetPayment.data.marker)
        if (respGetPayment.data.has_next) {
          paginationMarker.value.markers.push(respGetPayment.data.next_marker)
        }
      }
    } else if (direction === 'prev') {
      // 访问前一页： 1. 没有前一页； 2.有前一页
      if (paginationMarker.value.currentIndex <= 0) {
        // 提示没有前一页了
        Notify.create({
          classes: 'notification-negative shadow-15',
          icon: 'mdi-alert',
          textColor: 'negative',
          message: '无法翻页',
          caption: '没有前一页了',
          position: 'bottom',
          // closeBtn: true,
          timeout: 5000,
          multiLine: false
        })
      } else {
        // 有前一页
        const respGetPayment = await api.wallet.trade.getTradeBill({
          query: {
            marker: paginationMarker.value.markers[paginationMarker.value.currentIndex - 1],
            page_size: paginationMarker.value.page_size,
            ...(props.isGroup && { vo_id: groupSelection.value }),
            ...(typeSelection.value !== 'all' && { status: typeSelection.value }),
            ...(startTime.value !== '' && { time_start: date.formatDate(date.extractDate(startTime.value, 'YYYY-MM-DD'), 'YYYY-MM-DDThh:mm:ssZ') }),
            ...(endTime.value !== '' && { time_end: date.formatDate(date.extractDate(endTime.value, 'YYYY-MM-DD'), 'YYYY-MM-DDThh:mm:ssZ') }),
            ...(serviceSelection.value !== 'all' && { app_service_id: store.tables.appServiceTable.byId[serviceSelection.value]?.id }) // id -> pay_app_service_id
          }
        })
        // console.log(respGetPayment.data)
        // 拿到rows值，给table用
        rows.value = respGetPayment.data.results
        // 更新pagination, 注意到达prev后，把prev之后的全部marker都替换为新的: 1. 有next； 2.没有next
        paginationMarker.value.currentIndex -= 1
        paginationMarker.value.markers = paginationMarker.value.markers.slice(0, paginationMarker.value.currentIndex)
        paginationMarker.value.markers.push(respGetPayment.data.marker)
        if (respGetPayment.data.has_next) {
          paginationMarker.value.markers.push(respGetPayment.data.next_marker)
        }
      }
    }
  } catch (exception) {
    exceptionNotifier(exception)
  }
  // table stop loading
  isLoading.value = false
}

// onMounted时加载初始table第一页
// onMounted(() => (loadRows('first')))

// table row hover
const hoverRow = ref('')
const onMouseEnterRow = (rowName: string) => {
  hoverRow.value = rowName
}
const onMouseLeaveRow = () => {
  hoverRow.value = ''
}

// 分栏定义
const columns = computed(() => [
  {
    name: 'time',
    label: (() => tc('交易时间'))(),
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'id',
    label: (() => tc('ID'))(),
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'service_node',
    label: (() => tc('服务单元'))(),
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'subject',
    label: (() => tc('交易内容'))(),
    align: 'center',
    classes: 'ellipsis',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'width: 100px;padding: 15px 0px'
  },
  {
    name: 'type',
    label: (() => tc('交易类型'))(),
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'amount',
    label: (() => tc('交易金额'))(),
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'balance',
    label: (() => tc('交易后余额'))(),
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  }
  // {
  //   name: 'operation',
  //   label: (() => tc('操作'))(),
  //   align: 'center',
  //   classes: 'ellipsis',
  //   style: 'padding: 15px 0px;width: 100px;',
  //   headerStyle: 'padding: 0 2px'
  // }
])

// row selection
const rowSelection = ref<PaymentInterface[]>([])
const clearRowSelection = () => {
  rowSelection.value = []
}

// export to csv
const exportTable = () => {
  // encoding to csv format
  const content =
    [['支付记录ID', '服务单元', '计费途径', '支付方式', '支付账户', '应付金额', '余额支付金额', '代金券支付金额', '支付时间', '状态']] // title
      .concat(
        // rows
        rowSelection.value.map(row => [
          row.id,
          row.app_service_id,
          row.subject,
          row.payment_method,
          row.payer_name,
          row.payable_amounts,
          row.amounts,
          row.coupon_amount,
          row.payment_time,
          row.status
        ])
      )
      .join('\r\n')

  const status = exportFile(
    `${tc('导出账户流水列表')}-${!props.isGroup ? '个人账户' : store.tables.groupAccountTable.byId[groupSelection.value]?.name}-${new Date().toLocaleString()}.csv`,
    '\ufeff' + content,
    'text/csv'
  )

  if (status !== true) {
    Notify.create({
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

</script>

<template>
  <div class="PaymentTable">
    <div class=" column items-start justify-between q-mb-lg">

      <div class="col row full-width items-center justify-start q-pb-sm">

        <div class="col-auto q-gutter-x-sm q-pr-md">
          <q-btn unelevated no-caps color="primary"
                 @click="loadRows('first');clearRowSelection()">
            搜索
          </q-btn>
          <q-btn flat no-caps dense color="primary"
                 @click="resetFilters();;loadRows('first');clearRowSelection()">
            重置
          </q-btn>
        </div>

        <div class="col row q-gutter-x-md">

          <q-select v-if="isGroup"
                    class="col-auto"
                    style="min-width: 170px;"
                    label-color="primary"
                    outlined
                    dense
                    stack-label
                    :label="tc('筛选项目组账户')"
                    v-model="groupSelection"
                    :options="groupOptions"
                    emit-value
                    map-options
                    option-value="value"
                    option-label="label"
                    :loading="groupSelection === ''"
          >
            <!--当前选项的内容插槽-->
            <!--          <template v-slot:selected-item="scope">-->
            <!--                <span :class="validSelection===scope.opt.value ? 'text-primary' : 'text-black'">-->
            <!--                  {{ scope.opt.label }}-->
            <!--                </span>-->
            <!--          </template>-->
          </q-select>

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
                    :label-color="typeSelection !== 'all' ? 'primary' : ''"
                    outlined
                    dense
                    stack-label
                    :label="tc('筛选支付状态')"
                    v-model="typeSelection"
                    :options="typeOptions"
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
                   :label="tc('开始时间')"
                   outlined
                   dense/>

          <q-input style="width: 170px;"
                   v-model="endTime"
                   type="date"
                   :label="tc('截止时间')"
                   outlined
                   dense/>

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

            <div class="text-grey">
              {{ tc('选中') }}
            </div>
            <div>
              {{ rowSelection.length }}
            </div>
            <div class="text-grey">
              {{ tc('项') }}
            </div>

          </div>

          <div class="col-auto row items-center q-gutter-x-xs">
            <div class="col-auto text-grey">批量操作</div>
            <q-btn
              :disable="rowSelection.length === 0"
              class="col-auto"
              color="primary"
              :label="tc('导出为csv文件')"
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

          <q-td key="time" :props="props">
            <div v-if="i18n.global.locale==='zh'">
              <div>{{ new Date(props.row.creation_time).toLocaleString(i18n.global.locale).split(' ')[0] }}</div>
              <div>{{ new Date(props.row.creation_time).toLocaleString(i18n.global.locale).split(' ')[1] }}</div>
            </div>

            <div v-else>
              <div>{{ new Date(props.row.creation_time).toLocaleString(i18n.global.locale).split(',')[0] }}</div>
              <div>{{ new Date(props.row.creation_time).toLocaleString(i18n.global.locale).split(',')[1] }}</div>
            </div>
          </q-td>

          <q-td key="id" :props="props">
            {{ props.row.id }}
          </q-td>

          <q-td key="service_node" :props="props">
            <div class="column items-center">

              <q-icon
                v-if="store.tables.appServiceTable.byId[props.row.app_service_id]?.category === 'vms-server'"
                class="col"
                name="computer"
                color="primary"
                size="md"
              />

              <q-icon
                v-if="store.tables.appServiceTable.byId[props.row.app_service_id]?.category === 'vms-object'"
                class="col"
                name="mdi-database"
                color="primary"
                size="md"
              />

              <q-icon
                v-if="store.tables.appServiceTable.byId[props.row.app_service_id]?.category === 'hpc'"
                class="col"
                name="mdi-rocket-launch"
                color="primary"
                size="md"
              />

              <q-icon
                v-if="store.tables.appServiceTable.byId[props.row.app_service_id]?.category === 'high-cloud'"
                class="col"
                name="mdi-security"
                color="primary"
                size="md"
              />

              <q-icon
                v-if="store.tables.appServiceTable.byId[props.row.app_service_id]?.category === 'other'"
                class="col"
                name="mdi-help-circle-outline"
                color="primary"
                size="md"
              />

              <div class="col">
                {{
                  i18n.global.locale === 'zh' ?
                    store.tables.appServiceTable.byId[props.row.app_service_id]?.name :
                    store.tables.appServiceTable.byId[props.row.app_service_id]?.name_en
                }}
              </div>
            </div>
          </q-td>

          <q-td key="subject" :props="props">
            {{ props.row.subject }}
          </q-td>

          <q-td key="type" :props="props">

            <div class="col-auto text-h6">
              <div v-if="props.row.trade_type === 'payment'">
                {{ tc('支付') }}
              </div>
              <div v-if="props.row.trade_type === 'recharge'" class="text-green">
                {{ tc('充值') }}
              </div>
              <div v-if="props.row.trade_type === 'refund'" class="text-green">
                {{ tc('退款') }}
              </div>
            </div>

          </q-td>

          <q-td key="amount" :props="props">

            <div class="row items-center justify-center text-h6"
                 :class="[props.row.trade_type === 'recharge' ? 'text-green' : '', props.row.trade_type === 'refund' ? 'text-green' : '']">
              {{ props.row.trade_amounts }}
            </div>

            <div class="row items-center justify-center text-caption">
              <div class="col-auto">
                {{ tc('余额') }}
              </div>
              <div class="col-auto q-pr-xs">
                :
              </div>
              <div class="col-auto">
                {{ props.row.amounts }}
              </div>
            </div>

            <div class="row items-center justify-center text-caption">
              <div class="col-auto">
                {{ tc('代金券') }}
              </div>
              <div class="col-auto q-pr-xs">
                :
              </div>
              <div class="col-auto">
                {{ props.row.coupon_amount }}
              </div>
            </div>

          </q-td>

          <q-td key="balance" :props="props">
            <div class="row items-end justify-center">
              <div class="col-auto text-h6">
                {{ props.row.after_balance }}
              </div>
              <div class="col-auto q-pb-xs">
                {{ tc('点', Number(props.row.after_balance)) }}
              </div>
            </div>
          </q-td>

        </q-tr>
      </template>

      <template v-slot:bottom>
        <div class="row full-width items-center justify-end q-gutter-x-md">
          <div class="col-auto row items-center justify-end text-grey">
            <q-select color="grey"
                      v-model="paginationMarker.page_size"
                      :options="[1,2,3,4,5,10,20,30,50,100]"
                      dense
                      options-dense
                      borderless
                      @update:model-value="loadRows('first');clearRowSelection()">
              <!--当前选项的内容插槽-->
              <!--                      <template v-slot:selected-item>-->
              <!--                            <span class="text-grey">-->
              <!--                            {{ pagination.rowsPerPage }}-->
              <!--                            </span>-->
              <!--                      </template>-->
            </q-select>
            项/页
          </div>

          <div class="col-auto row">
            <div class="text-grey">
              当前位于第
            </div>
            <div class="col-auto">
              {{ paginationMarker.currentIndex + 1 }}
            </div>
            <div class="text-grey">
              页
            </div>
          </div>

          <q-btn class="col-auto"
                 color="primary"
                 flat
                 no-caps
                 dense
                 icon="chevron_left"
                 :disable="paginationMarker.currentIndex === 0"
                 @click="loadRows('prev')">
            <q-tooltip v-if="paginationMarker.currentIndex === 0">
              {{ tc('已经到达第一页') }}
            </q-tooltip>
          </q-btn>

          <q-btn class="col-auto"
                 color="primary"
                 flat
                 no-caps
                 dense
                 icon="navigate_next"
                 :disable="paginationMarker.currentIndex === paginationMarker.markers.length - 1"
                 @click="loadRows('next')">
            <q-tooltip v-if="paginationMarker.currentIndex === paginationMarker.markers.length - 1">
              {{ tc('已经到达最后一页') }}
            </q-tooltip>
          </q-btn>

        </div>

        <!--        <pre>{{ paginationMarker }}</pre>-->

      </template>
    </q-table>
  </div>
</template>

<style lang="scss" scoped>
</style>
