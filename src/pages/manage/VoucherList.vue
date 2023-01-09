<script setup lang="ts">
import { ref, computed, onMounted/* , PropType */ } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import api from 'src/api'

import useExceptionNotifier from 'src/hooks/useExceptionNotifier'

import type { VoucherInterface } from 'stores/store'

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

// table loading status
const isLoading = ref(false)

const rows = ref<VoucherInterface[]>()

// 筛选服务单元
const serviceOptions = computed(() => store.getServiceOptionsByRole(store.items.fedRole === 'federal-admin'))
const serviceSelection = ref('all')

// 筛选代金券状态
const statusOptions = computed(() => [
  {
    value: 'all',
    label: `${tc('全部状态')}`
  },
  {
    value: 'wait',
    label: `${tc('待兑换')}`
  },
  {
    value: 'available',
    label: `${tc('在用')}`
  },
  {
    value: 'cancelled',
    label: `${tc('失效')}`
  },
  {
    value: 'deleted',
    label: `${tc('已删除')}`
  }
])
const statusSelection = ref<'all' | 'wait' | 'available' | 'cancelled' | 'deleted'>('all')

// 根据当前搜索条件，更新rows，并更新count值
const loadRows = async () => {
  // table loading
  isLoading.value = true
  // request
  try {
    const respGetAdminVoucher = await api.wallet.admin.getAdminCashcoupon({
      query: {
        page: pagination.value.page,
        page_size: pagination.value.rowsPerPage,
        ...(serviceSelection.value !== 'all' && { app_service_id: store.tables.serviceTable.byId[serviceSelection.value]?.pay_app_service_id }), // id -> pay_app_service_id
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
    label: (() => tc('状态'))(),
    field: 'status',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'id',
    label: (() => tc('代金券ID'))(),
    field: 'id',
    align: 'center',
    classes: 'ellipsis',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'width: 100px;padding: 15px 0px'
  },
  {
    name: 'serviceNode',
    label: (() => tc('服务单元'))(),
    field: 'serviceNode',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px; min-width: 150px; max-width: 200px; word-break: break-all; word-wrap: break-word; white-space: normal;',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'resourceType',
    label: (() => tc('资源种类'))(),
    field: 'resourceType',
    align: 'center',
    classes: 'ellipsis',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'padding: 15px 0px; min-width: 80px; max-width: 100px; word-break: break-all; word-wrap: break-word; white-space: normal;'
  },
  {
    name: 'redeemer',
    label: (() => tc('兑换者'))(),
    field: 'redeemer',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'redeemTime',
    label: (() => tc('兑换日期'))(),
    field: 'redeemTime',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'expirationTime',
    label: (() => tc('失效期'))(),
    field: 'expirationTime',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px; max-width: 150px; word-break: break-all; word-wrap: break-word; white-space: normal;',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'denomination',
    label: (() => tc('原始面额'))(),
    field: 'denomination',
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
    headerStyle: 'padding: 0 0 0 1px',
    style: 'padding: 15px 0px; max-width: 100px; word-break: break-all; word-wrap: break-word; white-space: normal;'
  },
  {
    name: 'creator',
    label: (() => tc('创建者'))(),
    field: 'creator',
    align: 'center',
    style: 'padding: 15px 0px; width: 100px', // 固定宽度防止更新状态时抖动
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'code',
    label: (() => tc('兑换码'))(),
    field: 'code',
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
                    option-label="label"
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
          <q-btn unelevated no-caps color="primary" @click="store.triggerCreateVoucherDialog()">
            创建代金券
          </q-btn>
        </div>

      </div>

    </div>

    <div class="row items-center justify-between">

      <div v-if="pagination.count" class="col-auto row items-center">

        <div class="text-grey">{{ tc('选中总计') }}</div>
        <div class="">{{ rowSelection.length }}</div>

        <!--        <q-btn class="col-auto q-mx-md" flat no-caps dense color="primary">批量删除</q-btn>-->

      </div>

      <div class="col-auto row items-center">
        <div class="col-auto text-grey">{{ tc('搜索结果总计') }}</div>
        <div class="col-auto ">{{ pagination.count }}</div>
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
        <q-checkbox style="" v-model="scope.selected" dense size="xs"/>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">

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
                    color="light-green"
                    text-color="white"
                    icon="done">
              <div class="row justify-center">
                {{ tc('在用') }}
              </div>
            </q-chip>

            <q-chip v-if="props.row.status === 'cancelled'"
                    style="width: 80px;"
                    color="red"
                    text-color="white"
                    icon="close">
              <div class="row justify-center">
                {{ tc('失效') }}
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
            {{ i18n.global.locale === 'zh' ? props.row.app_service?.name : props.row.app_service?.name_en }}
          </q-td>

          <q-td key="resourceType" :props="props">
            {{ props.row.app_service?.category }}
          </q-td>

          <q-td key="redeemer" :props="props">
            {{ props.row.user?.username || tc('未知') }}
          </q-td>

          <q-td key="redeemTime" :props="props">
            <div v-if="i18n.global.locale==='zh'">
              <div>{{ new Date(props.row.effective_time).toLocaleString(i18n.global.locale).split(' ')[0] }}</div>
              <div>{{ new Date(props.row.effective_time).toLocaleString(i18n.global.locale).split(' ')[1] }}</div>
            </div>

            <div v-else>
              <div>{{ new Date(props.row.effective_time).toLocaleString(i18n.global.locale).split(',')[0] }}</div>
              <div>{{ new Date(props.row.effective_time).toLocaleString(i18n.global.locale).split(',')[1] }}</div>
            </div>
          </q-td>

          <q-td key="expirationTime" :props="props">
            <div v-if="i18n.global.locale==='zh'">
              <div>{{ new Date(props.row.expiration_time).toLocaleString(i18n.global.locale).split(' ')[0] }}</div>
              <div>{{ new Date(props.row.expiration_time).toLocaleString(i18n.global.locale).split(' ')[1] }}</div>
            </div>

            <div v-else>
              <div>{{ new Date(props.row.expiration_time).toLocaleString(i18n.global.locale).split(',')[0] }}</div>
              <div>{{ new Date(props.row.expiration_time).toLocaleString(i18n.global.locale).split(',')[1] }}</div>
            </div>
          </q-td>

          <q-td key="denomination" :props="props">
            {{ props.row.face_value }} {{ tc('点', Number(props.row.face_value)) }}
          </q-td>

          <q-td key="balance" :props="props">
            {{ props.row.balance }} {{ tc('点', Number(props.row.balance)) }}
          </q-td>

          <q-td key="creator" :props="props">
            API暂未提供
          </q-td>

          <q-td key="code" :props="props">
            {{ props.row.exchange_code }}
          </q-td>

          <!--          <q-td key="creation" :props="props">-->
          <!--            &lt;!&ndash;            <div v-if="i18n.global.locale==='zh'">&ndash;&gt;-->
          <!--            &lt;!&ndash;              <div>{{ new Date(props.row.creation_time).toLocaleString(i18n.global.locale).split(' ')[0] }}</div>&ndash;&gt;-->
          <!--            &lt;!&ndash;              <div>{{ new Date(props.row.creation_time).toLocaleString(i18n.global.locale).split(' ')[1] }}</div>&ndash;&gt;-->
          <!--            &lt;!&ndash;            </div>&ndash;&gt;-->

          <!--            &lt;!&ndash;            <div v-else>&ndash;&gt;-->
          <!--            &lt;!&ndash;              <div>{{ new Date(props.row.creation_time).toLocaleString(i18n.global.locale).split(',')[0] }}</div>&ndash;&gt;-->
          <!--            &lt;!&ndash;              <div>{{ new Date(props.row.creation_time).toLocaleString(i18n.global.locale).split(',')[1] }}</div>&ndash;&gt;-->
          <!--            &lt;!&ndash;            </div>&ndash;&gt;-->
          <!--          </q-td>-->

          <q-td key="operation" :props="props">
            <q-btn flat dense no-caps color="primary">
              删除
            </q-btn>

            <!--            <q-btn flat dense no-caps color="primary" @click="stopServer(props.row)">-->
            <!--              关机-->
            <!--            </q-btn>-->
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
                        outline
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
