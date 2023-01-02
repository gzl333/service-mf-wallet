<script setup lang="ts">
import { ref, computed, PropType } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore, AccountInterface } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'

const props = defineProps({
  accounts: {
    type: Array as PropType<AccountInterface[]>,
    required: true
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
    label: (() => tc('账户'))(),
    field: 'account',
    align: 'center',
    classes: 'ellipsis',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'width: 100px;padding: 15px 0px'
  },
  {
    name: 'type',
    label: (() => tc('类型'))(),
    field: 'type',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px; min-width: 150px; max-width: 200px;  word-break: break-all; word-wrap: break-word; white-space: normal;',
    headerStyle: 'padding: 0 2px'
  },
  {
    name: 'status',
    label: (() => tc('状态'))(),
    field: 'status',
    align: 'center',
    classes: 'ellipsis',
    headerStyle: 'padding: 0 0 0 1px',
    style: 'padding: 15px 0px; min-width: 80px; max-width: 100px; word-break: break-all; word-wrap: break-word; white-space: normal;'
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
    name: 'voucher',
    label: (() => tc('代金券'))(),
    field: 'voucher',
    align: 'center',
    classes: 'ellipsis',
    style: 'padding: 15px 0px',
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
  }])

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
// const searchMethod = (rows: ServerInterface[], terms: string): ServerInterface[] => rows.filter(server => server.id.toLowerCase().includes(terms) || server.ipv4.toLowerCase().includes(terms) || server.image.toLowerCase().includes(terms) || server.remarks.toLowerCase().includes(terms))

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
      :loading="store.tables.accountTable.status === 'loading'"
      color="primary"
      :loading-label="tc('components.server.ServeTable.notify_loading')"
      :no-data-label="tc('components.server.ServeTable.no_server_available')"
      hide-pagination
      :pagination="{rowsPerPage: 0}"
      :filter="search"
      :filter-method="searchMethod"
      :no-results-label="tc('components.server.ServeTable.no_search_results')"
    >

      <template v-slot:body="props">
        <q-tr :props="props"
              @mouseenter="onMouseEnterRow(props.row.name)"
              @mouseleave="onMouseLeaveRow"
        >
          <q-td key="account" :props="props">
            {{ props.row.name }}
          </q-td>

          <q-td key="type" :props="props">
            {{ props.row.type }}
          </q-td>

          <q-td key="status" :props="props">
            <div v-if="Number(props.row.balance) < 0"> {{ tc('欠费') }}</div>
            <div v-else> {{ tc('正常') }}</div>
          </q-td>

          <q-td key="balance" :props="props">
            {{ props.row.balance }}
          </q-td>

          <q-td key="voucher" :props="props">
            TBD
          </q-td>

          <q-td key="date" :props="props">
            <div v-if="props.row.type === 'personal'">-</div>
            <div v-else> {{ new Date(props.row.creation_time).toLocaleString(i18n.global.locale) }}</div>
          </q-td>

        </q-tr>
      </template>

      <template v-slot:bottom>
        <!--            todo 批量操作-->
      </template>

    </q-table>

  </div>
</template>

<style lang="scss" scoped>
.AccountTable {
}
</style>
