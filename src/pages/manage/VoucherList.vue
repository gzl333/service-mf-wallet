<script setup lang="ts">
import { ref, computed, onMounted/* , PropType */ } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'

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

// 根据当前搜索条件，更新rows，并更新count值
const loadAdminServers = async () => {
  // table loading
  isLoading.value = true
  // request
  try {
    // const respGetAdminServer = await api.server.server.getServer({
    //   query: {
    //     'as-admin': 'true',
    //     page: pagination.value.page,
    //     page_size: pagination.value.rowsPerPage,
    //     ...(serviceSelection.value !== 'all' && { service_id: serviceSelection.value }),
    //     ...(paymentSelection.value !== 'all' && { status: paymentSelection.value }),
    //     ...(networkSelection.value !== 'all' && { public: networkSelection.value }),
    //     ...(ipInput.value !== '' && { 'ip-contain': ipInput.value }),
    //     ...(remarkInput.value !== '' && { remark: remarkInput.value }),
    //     ...(creatorSelection.value === 'user-id' && creatorInput.value !== '' && { 'user-id': creatorInput.value }),
    //     ...(creatorSelection.value === 'username' && creatorInput.value !== '' && { username: creatorInput.value }),
    //     ...(groupSelection.value === 'exclude-vo' && { 'exclude-vo': 'true' }),
    //     ...(groupSelection.value === 'vo-id' && groupInput.value !== '' && { 'vo-id': groupInput.value }),
    //     ...(groupSelection.value === 'vo-name' && groupInput.value !== '' && { 'vo-name': groupInput.value })
    //   }
    // })
    // // 拿到rows值，给table用
    // rows.value = respGetAdminServer.data.servers
    // // pagination count
    // pagination.value.count = respGetAdminServer.data.count
  } catch (exception) {
    exceptionNotifier(exception)
  }
  // table stop loading
  isLoading.value = false
}

// 复位分页
const resetPageSelection = () => {
  pagination.value.page = 1
}

// 重置所有搜索条件
const resetFilters = () => {
  // serviceSelection.value = 'all'
  // paymentSelection.value = 'all'
  // networkSelection.value = 'all'
  // ipInput.value = ''
  // remarkInput.value = ''
  // creatorSelection.value = 'all'
  // creatorInput.value = ''
  // groupSelection.value = 'all'
  // groupInput.value = ''
}

// onMounted时加载初始table第一页
onMounted(loadAdminServers)

// 分栏定义
const columns = computed(() => [
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
    name: 'voucherType',
    label: (() => tc('代金券类型'))(),
    field: 'voucherType',
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
    name: 'validDuration',
    label: (() => tc('有效期'))(),
    field: 'validDuration',
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
    name: 'status',
    label: (() => tc('状态'))(),
    field: 'status',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
    headerStyle: 'padding: 0 2px'
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
    name: 'creation',
    label: (() => tc('创建时间'))(),
    field: 'creation',
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
    style: 'padding: 15px 0px;width: 150px;',
    headerStyle: 'padding: 0 2px'
  }])

// 被pagination组件使用
const pagination = ref({
  page: 1, // 当前页码
  rowsPerPage: 10, // 每页条数
  count: 0 // 总共条数
})

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

        <div class="col row q-gutter-x-md">
          <q-select class="col-auto"
                    style="min-width: 170px; max-width: 250px;"
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
                          color="light-green" name="play_arrow"/>
                  <q-icon v-else-if="store.tables.serviceTable.byId[scope.opt.value]?.status === 'disable'" color="red"
                          name="pause"/>
                  <q-icon v-else-if="store.tables.serviceTable.byId[scope.opt.value]?.status === 'deleted'"
                          color="black" name="clear"/>
                  <q-icon v-else color="primary" name="done_all"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ i18n.global.locale === 'zh' ? scope.opt.label : scope.opt.labelEn }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>

          </q-select>

          <q-select class="col-auto"
                    style="min-width: 170px;"
                    :label-color="paymentSelection !== 'all' ? 'primary' : ''"
                    outlined
                    dense
                    stack-label
                    :label="tc('筛选云主机计费方式')"
                    v-model="paymentSelection"
                    :options="paymentOptions"
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

          <q-select class="col-auto"
                    style="min-width: 170px;"
                    :label-color="networkSelection !== 'all' ? 'primary' : ''"
                    outlined
                    dense
                    stack-label
                    :label="tc('筛选网络类型')"
                    v-model="networkSelection"
                    :options="networkOptions"
                    emit-value
                    map-options
                    option-value="value"
                    option-label="label"
          >
            <!--当前选项的内容插槽-->
            <!--          <template v-slot:selected-item="scope">-->
            <!--                <span :class="networkSelection===scope.opt.value ? 'text-primary' : 'text-black'">-->
            <!--                  {{ scope.opt.label }}-->
            <!--                </span>-->
            <!--          </template>-->
          </q-select>

          <q-input
            style="width: 250px;"
            :label-color="ipInput ? 'primary' : ''"
            v-model.trim="ipInput"
            outlined
            dense
            :label="tc('筛选IP地址关键字')"
            @keyup.enter="resetPageSelection();loadAdminServers();clearRowSelection()"
          >
            <template v-slot:append v-if="ipInput">
              <q-icon name="close" @click="ipInput = ''" class="cursor-pointer"/>
            </template>

          </q-input>

          <q-input
            style="width: 250px;"
            :label-color="remarkInput ? 'primary' : ''"
            v-model.trim="remarkInput"
            outlined
            dense
            :label="tc('筛选云主机备注关键字')"
            @keyup.enter="resetPageSelection();loadAdminServers();clearRowSelection()"
          >
            <template v-slot:append v-if="remarkInput">
              <q-icon name="close" @click="remarkInput = ''" class="cursor-pointer"/>
            </template>

          </q-input>
        </div>

      </div>

      <div class="col row full-width items-center justify-between">

        <div class="col row q-gutter-x-md">

          <div class="col-auto row items-center no-wrap">
            <q-select class="col-auto"
                      style="min-width: 170px;"
                      outlined
                      dense
                      stack-label
                      :label="tc('筛选项目组')"
                      :label-color="((groupSelection === 'exclude-vo') || (groupSelection !== 'all' && groupSelection !== 'exclude-vo' && groupInput)) ? 'primary' : ''"
                      v-model="groupSelection"
                      :options="groupOptions"
                      emit-value
                      map-options
                      option-value="value"
                      option-label="label"
            >
              <!--当前选项的内容插槽-->
              <!--            <template v-slot:selected-item="scope">-->
              <!--                <span :class="groupSelection===scope.opt.value ? 'text-primary' : 'text-black'">-->
              <!--                  {{ scope.opt.label }}-->
              <!--                </span>-->
              <!--            </template>-->
            </q-select>

            <q-input
              style="width: 250px;"
              v-if="groupSelection !== 'all' && groupSelection !== 'exclude-vo'"
              :label-color="groupInput ? 'primary' : ''"
              v-model.trim="groupInput"
              outlined
              dense
              :label="groupSelection==='vo-name' ? tc('项目组名关键字') : groupSelection==='vo-id' ? tc('准确的项目组ID') : ''"
              @keyup.enter="resetPageSelection();loadAdminServers();clearRowSelection()"
            >
              <template v-slot:append v-if="groupInput">
                <q-icon name="close" @click="groupInput = ''" class="cursor-pointer"/>
              </template>
            </q-input>

          </div>

          <div class="col-auto row items-center no-wrap">
            <q-select class="col-auto"
                      style="min-width: 170px;"
                      outlined
                      dense
                      stack-label
                      :label="tc('筛选创建者')"
                      :label-color="creatorInput ? 'primary' : ''"
                      v-model="creatorSelection"
                      :options="creatorOptions"
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

            <q-input
              style="width: 250px;"
              v-if="creatorSelection !== 'all'"
              :label-color="creatorInput ? 'primary' : ''"
              v-model.trim="creatorInput"
              outlined
              dense
              :label="creatorSelection==='username' ? tc('用户名关键字') : creatorSelection==='user-id' ? tc('准确的用户ID') : ''"
              @keyup.enter="resetPageSelection();loadAdminServers();clearRowSelection()"
            >
              <template v-slot:append v-if="creatorInput">
                <q-icon name="close" @click="creatorInput = ''" class="cursor-pointer"/>
              </template>
            </q-input>
          </div>

        </div>

        <div class="col-auto q-gutter-x-sm">
          <q-btn flat no-caps dense color="primary"
                 @click="resetFilters();resetPageSelection();loadAdminServers();clearRowSelection()">
            重置
          </q-btn>
          <q-btn unelevated no-caps color="primary"
                 @click="resetPageSelection();loadAdminServers();clearRowSelection()">
            搜索
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

          <q-td key="id" :props="props">
            <!--            {{ props.row.ipv4 }}-->
          </q-td>

          <q-td key="serviceNode" :props="props">

          </q-td>

          <q-td key="voucherType" :props="props">

          </q-td>

          <q-td key="redeemer" :props="props">

          </q-td>

          <q-td key="redeemTime" :props="props">

          </q-td>

          <q-td key="validDuration" :props="props">
            <!--            {{ props.row.user.username }}-->
          </q-td>

          <q-td key="denomination" :props="props">
            <!--            {{ props.row.pay_type }}-->
          </q-td>

          <q-td key="balance" :props="props">
            {{ props.row.remarks }}
          </q-td>

          <q-td key="status" :props="props">
            status
          </q-td>

          <q-td key="creator" :props="props">
            creator
          </q-td>

          <q-td key="creation" :props="props">
            <!--            <div v-if="i18n.global.locale==='zh'">-->
            <!--              <div>{{ new Date(props.row.creation_time).toLocaleString(i18n.global.locale).split(' ')[0] }}</div>-->
            <!--              <div>{{ new Date(props.row.creation_time).toLocaleString(i18n.global.locale).split(' ')[1] }}</div>-->
            <!--            </div>-->

            <!--            <div v-else>-->
            <!--              <div>{{ new Date(props.row.creation_time).toLocaleString(i18n.global.locale).split(',')[0] }}</div>-->
            <!--              <div>{{ new Date(props.row.creation_time).toLocaleString(i18n.global.locale).split(',')[1] }}</div>-->
            <!--            </div>-->
          </q-td>

          <q-td key="operation" :props="props">
            <q-btn flat dense no-caps color="primary" @click="deleteServer(props.row)">
              删除
            </q-btn>

            <q-btn flat dense no-caps color="primary" @click="stopServer(props.row)">
              关机
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
                      @update:model-value="resetPageSelection();loadAdminServers();clearRowSelection()">
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
                        @update:model-value="loadAdminServers();clearRowSelection()"
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
