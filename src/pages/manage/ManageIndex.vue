<script setup lang="ts">
import { ref/* , computed, PropType */ } from 'vue'
import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'

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

const activeTab = ref(store.items.currentPath[1]) // keep selection when reloading

</script>

<template>
  <div class="ManageIndex">
    <q-scroll-area style="height: calc(100vh - 60px);">
      <div class="column">

        <div class="col-auto">
          <div class="row justify-center">
            <div class="content-fixed-width">
              <div class="row justify-between">

                <div class="col-auto text-h6 q-pt-lg q-px-none">
                  {{ tc('管理员') }}
                </div>

              </div>

              <div class="row">
                <div class="col">

                  <q-tabs
                    v-model="activeTab"
                    indicator-color="primary"
                    active-color="primary"
                    align="left"
                    inline-label
                  >
                    <q-tab
                      no-caps
                      class="q-px-none q-py-md q-mr-md"
                      name="voucher"
                      icon="format_list_bulleted"
                      :label="tc('代金券管理')"
                      :ripple="false"
                      @click="activeTab = 'voucher'; navigateToUrl('/my/wallet/manage/voucher')"
                    />
                  </q-tabs>
                </div>
<!--                <div class="col-1">-->
                <!--                  &lt;!&ndash;                <ButtonAdd/>&ndash;&gt;-->
                <!--                </div>-->
              </div>
            </div>

          </div>
        </div>

        <q-separator/>

        <!--      <q-scroll-area style="height: calc(100vh - 300px); width: 1720px;" visible>-->

        <div class="col-auto q-pt-xl">
          <div class="row justify-center">
            <!--          <div class="col"/>-->
            <!--          <div class="col-xs-12 col-md-10">-->
            <router-view class="content-fixed-width"/>
            <!--          </div>-->
            <!--          <div class="col"/>-->
          </div>
        </div>

        <!--      </q-scroll-area>-->

      </div>
    </q-scroll-area>
  </div>
</template>

<style lang="scss" scoped>
.ManageIndex {
}
</style>
