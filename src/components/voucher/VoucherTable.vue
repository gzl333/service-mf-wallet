<script setup lang="ts">
import { ref, computed, watch, /*  PropType, */ onMounted } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import api from 'src/api'
// import { exportFile, Notify } from 'quasar'

import useExceptionNotifier from 'src/hooks/useExceptionNotifier'
// import useCopyToClipboard from 'src/hooks/useCopyToClipboard'

import type { VoucherInterface } from 'stores/store'

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

// 筛选服务单元
const serviceOptions = computed(() => store.getAppServiceOptions(false, true))
const serviceSelection = ref('all')

// 筛选服务类型
const typeOptions = computed(() => [
  {
    value: 'all',
    label: '所有服务类型',
    labelEn: 'All Types'
  },
  {
    value: 'vms-server',
    label: '云主机',
    labelEn: 'Cloud Server'
  },
  {
    value: 'vms-object',
    label: '对象存储',
    labelEn: 'Object Storage'
  },
  {
    value: 'high-cloud',
    label: '高等级云',
    labelEn: 'High Level Security Cloud'
  },
  {
    value: 'hpc',
    label: '高性能计算',
    labelEn: 'High Performance Computing'
  },
  {
    value: 'other',
    label: '其它',
    labelEn: 'Others'
  }
])
const typeSelection = ref<'all' | 'vms-server' | 'vms-object' | 'high-cloud' | 'hpc' | 'other'>('all')

// 筛选账户
// const accountOptions = computed(() => [
//   {
//     value: 'all',
//     label: '全部账户',
//     labelEn: 'All Accounts'
//   },
//   {
//     value: 'group',
//     label: '查询指定项目组',
//     labelEn: 'Check one of the Groups'
//   }
// ])
// const accountSelection = ref('all')

// 筛选代金券有效期状态
const statusOptions = computed(() => [
  {
    value: 'all',
    label: '全部有效期',
    labelEn: 'All Status'
  },
  {
    value: 'valid',
    label: '有效期内',
    labelEn: 'Valid'
  }
])
const statusSelection = ref<'all' | 'valid' | 'invalid'>('all')

// table loading status
const isLoading = ref(false)

const rows = ref<VoucherInterface[]>()

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
  if (props.isGroup) {
    chooseGroup()
  }
  serviceSelection.value = 'all'
  typeSelection.value = 'all'
  statusSelection.value = 'all'
}

// 根据当前搜索条件，更新rows，并更新count值
const loadRows = async () => {
  // table loading
  isLoading.value = true
  // request
  try {
    const respGetVoucher = await api.wallet.cashcoupon.getCashCoupon({
      query: {
        page: pagination.value.page,
        page_size: pagination.value.rowsPerPage,
        ...(serviceSelection.value !== 'all' && { app_service_id: store.tables.appServiceTable.byId[serviceSelection.value]?.id }),
        ...(props.isGroup && { vo_id: groupSelection.value }),
        ...(statusSelection.value !== 'all' && { available: 'true' }),
        ...(typeSelection.value !== 'all' && { app_service_category: typeSelection.value })
      }
    })
    // console.log(respGetVoucher.data.results)
    // 拿到rows值，给table用
    rows.value = respGetVoucher.data.results
    // pagination count
    pagination.value.count = respGetVoucher.data.count
  } catch (exception) {
    exceptionNotifier(exception)
  }
  // table stop loading
  isLoading.value = false
}

// 刷新页面，table未加载时进入页面，根据table的加载状态变化一次都要选一次默认值
if (store.tables.groupAccountTable.status === 'total') {
  // 如果groupAccountTable已经加载，则使用当前group选项直接loadRows
  onMounted(loadRows)
} else {
  // 否则根据groupOptions来chooseGroup
  watch(groupOptions, () => {
    if (store.tables.groupAccountTable.status === 'total') {
      chooseGroup()
      loadRows() // 读取当前项目组的rows
    }
  })
}

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
  // {
  //   name: 'status',
  //   label: (() => tc('兑换状态'))(),
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
    style: 'padding: 15px 0px; min-width: 150px; max-width: 200px; word-break: break-all; word-wrap: break-word; white-space: normal;',
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
    name: 'validTime',
    label: (() => tc('有效期'))(),
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
  <div class="VoucherTable">
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

          <q-select class="col-auto"
                    style="min-width: 170px;"
                    :label-color="typeSelection !== 'all' ? 'primary' : ''"
                    outlined
                    dense
                    stack-label
                    :label="tc('筛选代金券种类')"
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

          <div v-if="pagination.count" class="col-auto row items-center">

            <div class="text-grey">{{ tc('选中') }}</div>
            <div class="">{{ rowSelection.length }}</div>
            <div class="q-px-xs">/</div>
            <div class="col-auto text-grey">{{ tc('搜索总计') }}</div>
            <div class="col-auto ">{{ pagination.count }}</div>

          </div>

          <div class="col-auto row items-center q-gutter-x-xs">
            <div class="col-auto text-grey">批量操作</div>
            <q-btn
              :disable="rowSelection.length === 0"
              class="col-auto"
              color="primary"
              :label="tc('删除')"
              no-caps
              dense
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
          <!--                    color="light-green"-->
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

              <q-icon
                v-if="props.row.app_service?.category === 'vms-server'"
                class="col"
                name="computer"
                color="primary"
                size="md"
              />

              <q-icon
                v-if="props.row.app_service?.category === 'vms-object'"
                class="col"
                name="mdi-database"
                color="primary"
                size="md"
              />

              <q-icon
                v-if="props.row.app_service?.category === 'hpc'"
                class="col"
                name="mdi-rocket-launch"
                color="primary"
                size="md"
              />

              <q-icon
                v-if="props.row.app_service?.category === 'high-cloud'"
                class="col"
                name="mdi-security"
                color="primary"
                size="md"
              />

              <q-icon
                v-if="props.row.app_service?.category === 'other'"
                class="col"
                name="mdi-help-circle-outline"
                color="primary"
                size="md"
              />

              <div class="col">
                {{ i18n.global.locale === 'zh' ? props.row.app_service?.name : props.row.app_service?.name_en }}
              </div>
            </div>
          </q-td>

          <q-td key="redeemer" :props="props">
            {{ props.row.user?.username || tc('未知') }}
          </q-td>

          <q-td key="redeemTime" :props="props">
            <div v-if="i18n.global.locale==='zh'">
              <div>{{ new Date(props.row.granted_time).toLocaleString(i18n.global.locale).split(' ')[0] }}</div>
              <div>{{ new Date(props.row.granted_time).toLocaleString(i18n.global.locale).split(' ')[1] }}</div>
            </div>

            <div v-else>
              <div>{{ new Date(props.row.granted_time).toLocaleString(i18n.global.locale).split(',')[0] }}</div>
              <div>{{ new Date(props.row.granted_time).toLocaleString(i18n.global.locale).split(',')[1] }}</div>
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
                color="green"
                track-color="grey-3"
              >
                <div class="text-caption text-green">
                  {{ (Number(props.row.balance) / Number(props.row.face_value) * 100).toFixed(2) }}%
                </div>
              </q-knob>

              <div class="col-auto column">

                <div class="col-auto column">
                  <div class="col-auto text-grey">
                    {{ tc('当前余额') }}
                  </div>
                  <div class="col-auto text-green">
                    {{ props.row.balance }}
                  </div>
                </div>

                <div class="col-auto column">
                  <div class="col-auto text-grey">
                    {{ tc('原始面额') }}
                  </div>
                  <div class="col-auto text-green">
                    {{ props.row.face_value }}
                  </div>
                </div>

              </div>

            </div>

          </q-td>

          <q-td key="operation" :props="props">

            <div class="column">
              <q-btn flat dense no-caps color="primary">
                {{ tc('查看明细') }}
              </q-btn>

              <q-btn
                flat
                dense
                no-caps
                color="primary"
              @click="store.triggerDeleteVoucherDialog(props.row.id)">
                {{ tc('删除') }}
              </q-btn>
            </div>
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
.VoucherTable {
}
</style>
