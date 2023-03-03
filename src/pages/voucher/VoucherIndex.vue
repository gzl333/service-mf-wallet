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
  <div class="VoucherIndex">
    <q-scroll-area style="height: calc(100vh - 60px);">
      <div class="column">

        <div class="col-auto">
          <div class="row justify-center">
            <div class="content-fixed-width">
              <div class="row justify-between">

                <div class="col-auto text-h6 q-pt-lg q-px-none">
                  {{ tc('代金券') }}
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
                      name="personal"
                      icon="mdi-account"
                      :label="tc('个人代金券')"
                      :ripple="false"
                      @click="activeTab = 'personal'; navigateToUrl('/my/wallet/voucher/personal')"
                    />
                    <q-tab
                      no-caps
                      class="q-px-none q-py-md q-mr-md"
                      name="group"
                      icon="mdi-account-multiple"
                      :label="tc('项目组代金券')"
                      :ripple="false"
                      @click="activeTab = 'group'; navigateToUrl('/my/wallet/voucher/group')"
                    />
                  </q-tabs>
                </div>

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
.VoucherIndex {
}
</style>
