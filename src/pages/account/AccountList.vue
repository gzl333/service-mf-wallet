<script setup lang="ts">
import { /* ref,  */computed/* , PropType  */ } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
// import { i18n } from 'boot/i18n'

import AccountTable from 'components/account/AccountTable.vue'

// const props = defineProps({
//   foo: {
//     type: String as PropType<'bar'>,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

// const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
// const router = useRouter()

const accounts = computed(() => Object.values(store.tables.accountTable.byId))

</script>

<template>
  <div class="AccountList">

    <div class="row items-center justify-between q-py-md">

      <div class="col-3">
        <div class="row justify-start">
          <div class="col">
            <q-input dense outlined v-model="search">
              <template v-slot:prepend>
                <q-icon name="search"/>
              </template>
              <template v-slot:append v-if="search">
                <q-icon name="close" @click="search = ''" class="cursor-pointer"/>
              </template>
            </q-input>
          </div>
        </div>
      </div>

      <div class="col-3">
        <div class="row justify-end">
          <div class="col">
<!--            <q-select outlined dense stack-label :label="tc('pages.personal.ServerList.service_node_filter')" v-model="serviceSelection"-->
<!--                      :options="serviceOptions" emit-value map-options option-value="value"-->
<!--                      :option-label="i18n.global.locale ==='zh'? 'label':'labelEn'">-->
<!--              &lt;!&ndash;当前选项的内容插槽&ndash;&gt;-->
<!--              <template v-slot:selected-item="scope">-->
<!--                <span :class="serviceSelection===scope.opt.value ? 'text-primary' : 'text-black'">-->
<!--                  {{ i18n.global.locale === 'zh' ? scope.opt.label : scope.opt.labelEn }}-->
<!--                </span>-->
<!--              </template>-->
<!--            </q-select>-->
          </div>
        </div>
      </div>
    </div>

    <AccountTable :accounts="accounts"/>
  </div>
</template>

<style lang="scss" scoped>
.AccountList {
}
</style>
