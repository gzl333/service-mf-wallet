<script setup lang="ts">
import { ref, computed/* , PropType */ } from 'vue'
import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'

// @ts-expect-error
import { useStoreMain } from '@cnic/main'

import AccountTable from 'components/account/AccountTable.vue'

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
const storeMain = useStoreMain()

const search = ref('')

const accounts = computed(() => Object.values(store.tables.groupAccountTable.byId))

</script>

<template>
  <div class="MyAccounts">
    <q-scroll-area style="height: calc(100vh - 60px);">

      <div class="row justify-center">
        <div class="content-fixed-width">
          <div class="text-h6 q-py-lg q-px-none">
            {{ tc('我的账户') }}
          </div>
        </div>
      </div>

      <q-separator/>

      <div class="row justify-center">
        <div class="content-fixed-width">
          <div class="column">

            <!--个人账户详情开始-->
            <div class="col q-pt-lg">
              <div class="text-grey">
                {{ tc('个人账户') }}
              </div>
              <div class="detail-area">
                <div class="row items-center">

                  <q-icon class="col-auto q-pl-lg" name="las la-user-circle" size="120px" color="grey-5"/>

                  <div class="col row items-start justify-evenly">

                    <div class="column justify-start items-center" style="min-height: 50px;">
                      <div class="col-2 text-grey">
                        {{ tc('账号') }}
                      </div>
                      <div class="col-10">
                        <div class="row justify-center items-center ellipsis"
                             style="max-width: 200px; min-height: 50px; word-break: break-all; word-wrap: break-word; white-space: normal;">
                          {{ storeMain.items.tokenDecoded.email }}
                        </div>
                      </div>
                    </div>

                    <div class="column justify-start items-center" style="min-height: 50px;">
                      <div class="col-2 text-grey">
                        {{ tc('所属单位') }}
                      </div>
                      <div class="col-10">
                        <div class="row justify-center items-center ellipsis"
                             style="max-width: 200px; min-height: 50px; word-break: break-all; word-wrap: break-word; white-space: normal;">
                          {{ storeMain.items.tokenDecoded.orgName }}
                        </div>
                      </div>
                    </div>

                  </div>

                  <q-separator class="q-mx-lg" vertical/>

                  <div class="col-6 row items-start justify-evenly">

                    <div class="column justify-start items-center" style="min-height: 50px;">
                      <div class="col-2 text-grey">
                        {{ tc('代金券') }}
                      </div>
                      <div class="col-10">
                        <div class="row justify-center items-center ellipsis"
                             style="max-width: 200px; min-height: 50px; word-break: break-all; word-wrap: break-word; white-space: normal;">

                          <div class="row items-end text-primary cursor-pointer"
                               @click="navigateToUrl('/my/wallet/voucher/personal')">
                            <q-tooltip> {{ tc('查看代金券列表') }}</q-tooltip>
                            <div class="text-h4">
                              {{ store.items.personalVoucherCount }}
                            </div>
                            <div class="text-h6">
                              {{ tc('张') }}
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>

                    <div class="column justify-start items-center" style="min-height: 50px;">
                      <div class="col-2 text-grey">
                        {{ tc('余额') }}
                      </div>
                      <div class="col-10">
                        <div class="row justify-center items-center ellipsis"
                             style="max-width: 200px; min-height: 50px; word-break: break-all; word-wrap: break-word; white-space: normal;">

                          <div class="row items-end text-primary cursor-pointer"
                               @click="navigateToUrl('/my/wallet/payment/personal')">
                            <q-tooltip> {{ tc('查看账户流水') }}</q-tooltip>
                            <div class="text-h4">
                              {{ store.items.personalBalance }}
                            </div>
                            <div class="text-h6">
                              {{ tc('点') }}
                            </div>
                          </div>

                        </div>

                        <div class="row justify-center">
                          <q-badge class="non-selectable" v-if="Number(store.items.personalBalance) < 0" color="red">
                            {{ tc('欠费') }}
                          </q-badge>
                        </div>
                      </div>
                    </div>

                    <div class="column justify-start items-center" style="min-height: 50px;">
                      <!--占位但不可见-->
                      <div class="col-2 invisible">
                        {{ tc('充值') }}
                      </div>
                      <div class="col-10">
                        <div class="row justify-center items-center ellipsis q-gutter-xs"
                             style="max-width: 200px; min-height: 50px; word-break: break-all; word-wrap: break-word; white-space: normal;">

                          <q-btn
                            unelevated
                            no-caps
                            color="primary"
                          >
                            {{ tc('兑换代金券') }}
                          </q-btn>

                          <q-btn
                            unelevated
                            no-caps
                            color="green"
                            disabled
                          >
                            {{ tc('充值') }}
                          </q-btn>

                        </div>
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            </div>
            <!--个人账户详情结束-->

            <!-- 项目组账户开始-->
            <div class="col">
              <div class="row items-end justify-between">

                <div class="col-auto text-grey">
                  {{ tc('项目组账户') }}
                </div>

                <q-input class="col-3" dense outlined v-model.trim="search" :label="tc('筛选项目组账户')">
                  <template v-slot:prepend>
                    <q-icon name="search"/>
                  </template>
                  <template v-slot:append v-if="search">
                    <q-icon name="close" @click="search = ''" class="cursor-pointer"/>
                  </template>
                </q-input>

              </div>

              <AccountTable class="q-pt-xs"
                            :accounts="accounts"
                            :is-loading="store.tables.groupAccountTable.status === 'loading'"
                            :search="search"/>

            </div>
            <!--项目组账户结束-->

          </div>
        </div>
      </div>

    </q-scroll-area>
  </div>
</template>

<style lang="scss" scoped>
.MyAccounts {
}

.detail-area {
  //margin-top: 10px;
  padding: 15px 0;
  //min-height: 100px;
  border: $grey-4 1px solid;
  border-radius: 5px;
}
</style>
