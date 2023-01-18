<script setup lang="ts">
import { ref, computed, PropType, onMounted } from 'vue'
import { navigateToUrl } from 'single-spa'
import { PaymentInterface, useStore, VoucherInterface } from 'stores/store'
import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import useExceptionNotifier from 'src/hooks/useExceptionNotifier'
import api from 'src/api'
// import useCopyToClipboard from 'src/hooks/useCopyToClipboard'

// const props = defineProps({
//   foo: {
//     type: String as PropType<'bar'>,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
// const router = useRouter()
const exceptionNotifier = useExceptionNotifier()
// const clickToCopy = useCopyToClipboard()

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
const pagination = ref({
  has_next: false,
  page_size: 10,
  prev: '',
  curr: '',
  next: ''
})

// 复位分页： 应该就是根据当前筛选参数请求第一页

// 重置所有搜索条件
const resetFilters = () => {
  serviceSelection.value = 'all'
  statusSelection.value = 'all'
  startTime.value = ''
  endTime.value = ''
}

// 根据当前搜索条件，更新rows，并更新pangination
const loadRows = async (marker?: string) => { // todo 用前后翻页作为参数，pagination处理不同
  // table loading
  isLoading.value = true
  // request
  try {
    const respGetPayment = await api.wallet['payment-history'].getPaymentHistory({
      query: {
        marker,
        page_size: pagination.value.page_size,
        ...(statusSelection.value !== 'all' && { status: statusSelection.value }),
        ...(startTime.value !== '' && { time_start: startTime.value }),
        ...(endTime.value !== '' && { time_end: endTime.value }),
        ...(serviceSelection.value !== 'all' && { app_service_id: store.tables.serviceTable.byId[serviceSelection.value]?.pay_app_service_id }) // id -> pay_app_service_id
      }
    })
    console.log(respGetPayment.data.results)
    // 拿到rows值，给table用
    rows.value = respGetPayment.data.results
    // 更新pagination
    pagination.value.prev = pagination.value.curr
    pagination.value.curr = respGetPayment.data.marker
    pagination.value.next = respGetPayment.data.next_marker
    pagination.value.has_next = respGetPayment.data.has_next
  } catch (exception) {
    exceptionNotifier(exception)
  }
  // table stop loading
  isLoading.value = false
}

// onMounted时加载初始table第一页
onMounted(loadRows)

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
    label: (() => tc('服务节点'))(),
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
const rowSelection = ref<VoucherInterface[]>([])
const clearRowSelection = () => {
  rowSelection.value = []
}

</script>

<template>
  <div class="PersonalPayment">
    <div class=" column items-start justify-between q-mb-lg">

      <div class="col row full-width items-center justify-start q-pb-sm">

        <div class="col-auto q-gutter-x-sm q-pr-md">
          <q-btn unelevated no-caps color="primary"
                 @click="loadRows();clearRowSelection()">
            搜索
          </q-btn>
          <q-btn flat no-caps dense color="primary"
                 @click="resetFilters();;loadRows();clearRowSelection()">
            重置
          </q-btn>
        </div>

        <div class="col row q-gutter-x-md">
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
                    :label="tc('筛选代金券状态')"
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

          <div v-if="rowSelection.length" class="col-auto row items-center">

            <div class="text-grey">{{ tc('选中') }}</div>
            <div class="">{{ rowSelection.length }}</div>

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
        <div class="row full-width items-center justify-end">
          <div class="col-auto row items-center justify-end text-grey">
            <q-select color="grey"
                      v-model="pagination.page_size"
                      :options="[10,20,30,50,100]"
                      dense
                      options-dense
                      borderless
                      @update:model-value="loadRows();clearRowSelection()">
              <!--当前选项的内容插槽-->
              <!--                      <template v-slot:selected-item>-->
              <!--                            <span class="text-grey">-->
              <!--                            {{ pagination.rowsPerPage }}-->
              <!--                            </span>-->
              <!--                      </template>-->
            </q-select>
            项/页
          </div>
          <q-btn color="primary"
                 flat
                 no-caps
                 dense
                 icon="chevron_left"
                 :disable="pagination.prev === ''"
                 @click="loadRows(pagination.prev)"/>
          <q-btn color="primary"
                 flat
                 no-caps
                 dense
                 icon="navigate_next"
                 :disable="!pagination.has_next"
                 @click="loadRows(pagination.next)"/>

        </div>

        {{ pagination }}

      </template>
    </q-table>
  </div>
</template>

<style lang="scss" scoped>
.PersonalPayment {
}
</style>
