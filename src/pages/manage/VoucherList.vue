<script setup lang="ts">
import { ref, computed, onMounted/* , PropType */ } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import api from 'src/api'
import { exportFile, useQuasar } from 'quasar'

import useExceptionNotifier from 'src/hooks/useExceptionNotifier'
import useCopyToClipboard from 'src/hooks/useCopyToClipboard'

import type { VoucherInterface } from 'stores/store'

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

// 筛选代金券状态
const statusOptions = computed(() => [
  {
    value: 'all',
    label: '全部状态',
    labelEn: 'All Status'
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
    labelEn: 'Invalid'
  },
  {
    value: 'deleted',
    label: '已删除',
    labelEn: 'Deleted'
  }
])
const statusSelection = ref<'all' | 'wait' | 'available' | 'cancelled' | 'deleted'>('all')

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
        ...(statusSelection.value !== 'all' && { status: statusSelection.value })
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
}

// onMounted时加载初始table第一页
onMounted(loadRows)

// 分栏定义
const columns = computed(() => [
  {
    name: 'status',
    label: (() => tc('兑换状态'))(),
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
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
  // {
  //   name: 'resourceType',
  //   label: (() => tc('资源种类'))(),
  //   align: 'center',
  //   classes: 'ellipsis',
  //   headerStyle: 'padding: 0 0 0 1px',
  //   style: 'padding: 15px 0px; min-width: 80px; max-width: 100px; word-break: break-all; word-wrap: break-word; white-space: normal;'
  // },
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
      ? ['代金券ID', '服务单元', '资源种类', '创建时间', '失效时间', '原始面额', '当前余额', '兑换状态', '兑换码']
      : ['Voucher ID', 'Service Node', 'Resource Type', 'Creation Time', 'Expiration Time', 'Denomination', 'Balance', 'Status', 'Exchange Code']
    ] // title
      .concat(
        // rows
        rowSelection.value.map(row => [
          row.id,
          (i18n.global.locale === 'zh' ? row.app_service?.name : row.app_service?.name_en) as string,
          row.app_service?.category as string,
          new Date(row.creation_time).toLocaleString(),
          new Date(row.expiration_time).toLocaleString(),
          row.face_value,
          row.balance,
          row.status,
          row.exchange_code
        ])
      )
      .join('\r\n')

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

          <q-td key="status" :props="props">
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
                    color="red"
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
          </q-td>

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
                {{ tc('有效期内')}}
              </q-badge>

              <q-badge
                v-if="(new Date() - new Date(props.row.expiration_time)) > 0"
                color="negative">
                {{ tc('已过期')}}
              </q-badge>

              <q-badge
                v-if="(new Date(props.row.effective_time) - new Date()) > 0"
                color="primary">
                {{ tc('待生效')}}
              </q-badge>

            </div>

          </q-td>

          <q-td key="redeemer" :props="props">
            {{ props.row.user?.username || tc('未知') }}
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
                size="90px"
                :thickness="0.22"
                :color="((new Date() - new Date(props.row.expiration_time)) < 0 ) && ((new Date() - new Date(props.row.effective_time)) > 0) ? 'green' : 'grey-5'"
                track-color="grey-3"
              >
                <div class="text-caption"
                     :class="((new Date() - new Date(props.row.expiration_time)) < 0 ) && ((new Date() - new Date(props.row.effective_time)) > 0) ? 'text-green' : ''">

                  {{ (Number(props.row.balance) / Number(props.row.face_value) * 100).toFixed(2) }}%
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
                      :options="[10,20,30,50,100]"
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
