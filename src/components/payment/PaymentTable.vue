<script setup lang="ts">
import { ref, computed, watch, /*  PropType, */ onMounted } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { PaymentInterface, useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import useExceptionNotifier from 'src/hooks/useExceptionNotifier'
import api from 'src/api'
import { exportFile, Notify } from 'quasar'
// import useCopyToClipboard from 'src/hooks/useCopyToClipboard'

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

// 项目组默认选择
const chooseGroup = () => {
  groupSelection.value = props.groupId || groupOptions.value[0]?.value || ''
}
// setup时调用一次 table已加载时，从别的页面进入本页面要选一次默认值
if (store.tables.groupAccountTable.status === 'total') {
  chooseGroup()
}
// 刷新页面，table未加载时进入页面，根据table的加载状态变化一次都要选一次默认值。细分到每个table。
watch(groupOptions, () => {
  if (store.tables.groupAccountTable.status === 'total') {
    chooseGroup()
    loadRows('first') // 读取当前项目组的rows
  }
})

// if (!props.isGroup) {
//   onMounted(() => (loadRows('first')))
// }

onMounted(() => (loadRows('first')))

// 筛选服务单元
const serviceOptions = computed(() => store.getServiceOptions('withAll'))
const serviceSelection = ref('all')

// 筛选支付状态
const statusOptions = [
  {
    value: 'all',
    label: '全部状态',
    labelEn: 'All Status'
  },
  {
    value: 'wait',
    label: '等待支付',
    labelEn: 'To Be Paid'
  },
  {
    value: 'success',
    label: '支付成功',
    labelEn: 'Succeeded'
  },
  {
    value: 'error',
    label: '等待支付',
    labelEn: 'Failed'
  },
  {
    value: 'closed',
    label: '等待支付',
    labelEn: 'Closed'
  }
]
const statusSelection = ref('all')

// 筛选日期
const startTime = ref('')
const endTime = ref('')

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
  statusSelection.value = 'all'
  startTime.value = ''
  endTime.value = ''
}

// 根据当前搜索条件，更新rows，并更新pagination
const loadRows = async (direction: 'first' | 'prev' | 'next') => {
  // table loading
  isLoading.value = true
  // request
  try {
    if (direction === 'first') {
      const respGetPayment = await api.wallet['payment-history'].getPaymentHistory({
        query: {
          page_size: paginationMarker.value.page_size,
          ...(props.isGroup && { vo_id: groupSelection.value }),
          ...(statusSelection.value !== 'all' && { status: statusSelection.value }),
          ...(startTime.value !== '' && { time_start: startTime.value }),
          ...(endTime.value !== '' && { time_end: endTime.value }),
          ...(serviceSelection.value !== 'all' && { app_service_id: store.tables.serviceTable.byId[serviceSelection.value]?.pay_app_service_id }) // id -> pay_app_service_id
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
        const respGetPayment = await api.wallet['payment-history'].getPaymentHistory({
          query: {
            marker: paginationMarker.value.markers[paginationMarker.value.currentIndex + 1],
            page_size: paginationMarker.value.page_size,
            ...(props.isGroup && { vo_id: groupSelection.value }),
            ...(statusSelection.value !== 'all' && { status: statusSelection.value }),
            ...(startTime.value !== '' && { time_start: startTime.value }),
            ...(endTime.value !== '' && { time_end: endTime.value }),
            ...(serviceSelection.value !== 'all' && { app_service_id: store.tables.serviceTable.byId[serviceSelection.value]?.pay_app_service_id }) // id -> pay_app_service_id
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
        const respGetPayment = await api.wallet['payment-history'].getPaymentHistory({
          query: {
            marker: paginationMarker.value.markers[paginationMarker.value.currentIndex - 1],
            page_size: paginationMarker.value.page_size,
            ...(props.isGroup && { vo_id: groupSelection.value }),
            ...(statusSelection.value !== 'all' && { status: statusSelection.value }),
            ...(startTime.value !== '' && { time_start: startTime.value }),
            ...(endTime.value !== '' && { time_end: endTime.value }),
            ...(serviceSelection.value !== 'all' && { app_service_id: store.tables.serviceTable.byId[serviceSelection.value]?.pay_app_service_id }) // id -> pay_app_service_id
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
    name: 'id',
    label: (() => tc('支付记录ID'))(),
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
    label: (() => tc('计费途径'))(),
    align: 'center',
    classes: 'ellipsis',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'width: 100px;padding: 15px 0px'
  },
  {
    name: 'method',
    label: (() => tc('支付方式'))(),
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px; min-width: 150px; max-width: 200px; word-break: break-all; word-wrap: break-word; white-space: normal;',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'name',
    label: (() => tc('支付账户'))(),
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'due_amount',
    label: (() => tc('应付金额'))(),
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'balance_amount',
    label: (() => tc('余额支付金额'))(),
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px; max-width: 150px; word-break: break-all; word-wrap: break-word; white-space: normal;',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'voucher_amount',
    label: (() => tc('代金券支付金额'))(),
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'success_time',
    label: (() => tc('支付时间'))(),
    align: 'center',
    classes: 'ellipsis',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'padding: 15px 0px; max-width: 100px; word-break: break-all; word-wrap: break-word; white-space: normal;'
  },
  {
    name: 'status',
    label: (() => tc('状态'))(),
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
    `${tc('导出支付记录列表')}-${new Date().toLocaleString()}.csv`,
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
                <q-tooltip>
                  <div v-if="store.tables.serviceTable.byId[scope.opt.value]?.status === 'enable'">
                    服务单元运行中
                  </div>
                  <div v-else-if="store.tables.serviceTable.byId[scope.opt.value]?.status === 'disable'">
                    服务单元暂停服务
                  </div>
                  <div v-else-if="store.tables.serviceTable.byId[scope.opt.value]?.status === 'deleted'">
                    服务单元已删除
                  </div>
                  <div v-else>
                    全部服务单元
                  </div>
                </q-tooltip>
                <q-item-section thumbnail>
                  <q-icon v-if="store.tables.serviceTable.byId[scope.opt.value]?.status === 'enable'"
                          color="light-green"
                          name="play_arrow"/>
                  <q-icon v-else-if="store.tables.serviceTable.byId[scope.opt.value]?.status === 'disable'"
                          color="red"
                          name="pause"/>
                  <q-icon v-else-if="store.tables.serviceTable.byId[scope.opt.value]?.status === 'deleted'"
                          color="black"
                          name="clear"/>
                  <q-icon v-else color="primary" name="done_all"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="row items-center">
                    <q-icon v-if="store.tables.serviceTable.byId[scope.opt.value]?.pay_app_service_type === 'server'"
                            class="col-auto"
                            color="primary"
                            size="sm"
                            name="computer"/>
                    <q-icon v-if="store.tables.serviceTable.byId[scope.opt.value]?.pay_app_service_type === 'storage'"
                            class="col-auto"
                            color="primary"
                            size="sm"
                            name="mdi-database"/>
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
                    :label="tc('筛选支付状态')"
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

          <q-td key="id" :props="props">
            {{ props.row.id }}
          </q-td>

          <q-td key="service_node" :props="props">
            {{ props.row.app_service_id }}
          </q-td>

          <q-td key="subject" :props="props">
            {{ props.row.subject }}
          </q-td>

          <q-td key="method" :props="props">
            {{ props.row.payment_method }}
          </q-td>

          <q-td key="name" :props="props">
            {{ props.row.payer_name }}
          </q-td>

          <q-td key="due_amount" :props="props">
            {{ props.row.payable_amounts }}
          </q-td>

          <q-td key="balance_amount" :props="props">
            {{ props.row.amounts }}
          </q-td>

          <q-td key="voucher_amount" :props="props">
            {{ props.row.coupon_amount }}
          </q-td>

          <q-td key="success_time" :props="props">
            <div v-if="i18n.global.locale==='zh'">
              <div>{{ new Date(props.row.payment_time).toLocaleString(i18n.global.locale).split(' ')[0] }}</div>
              <div>{{ new Date(props.row.payment_time).toLocaleString(i18n.global.locale).split(' ')[1] }}</div>
            </div>

            <div v-else>
              <div>{{ new Date(props.row.payment_time).toLocaleString(i18n.global.locale).split(',')[0] }}</div>
              <div>{{ new Date(props.row.payment_time).toLocaleString(i18n.global.locale).split(',')[1] }}</div>
            </div>
          </q-td>

          <q-td key="status" :props="props">
            {{ props.row.status }}
          </q-td>

          <q-td key="operation" :props="props">
            <q-btn flat dense no-caps color="primary">
              查看详情
            </q-btn>
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
