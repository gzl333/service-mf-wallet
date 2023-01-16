<script setup lang="ts">
import { computed } from 'vue'
import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'

// const props = defineProps({
//   foo: {
//     type: String,
//     required: false,
//     default: ''
//   }
// })
// const emits = defineEmits(['change', 'delete'])

const store = useStore()
// const router = useRouter()
// const route = useRoute()
const tc = i18n.global.tc

// the root layout of @cnic/wallet, load @cnic/wallet's store here
console.log('@cnic/wallet store:', store.$state)
void store.loadAllItems()
void store.loadTotalTables()

const activeItem = computed(() => store.items.currentPath[0])

const releaseTime = process.env.releaseTime

</script>

<template>
  <q-layout view="hHh LpR fFf">

    <q-drawer :model-value="true" style="padding-top: 60px;" :breakpoint="0" side="left" width="120" bordered>

      <div class="column full-height bg-grey-2">
        <q-scroll-area class="col non-selectable" visible>

          <q-list>

            <q-item>
              <q-item-section class="column items-center q-py-sm text-center text-weight-bold text-grey-8">
                {{ tc('wallet') }}
              </q-item-section>
            </q-item>

            <q-item
              clickable
              :active="activeItem === 'account'"
              @click="navigateToUrl('/my/wallet/account')"
              active-class="active-item"
            >
              <q-item-section class="column items-center">
                <q-icon name="account_circle" size="lg"/>
                <div class="active-text text-center">{{ tc('我的账户') }}</div>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              :active="activeItem === 'voucher'"
              @click="navigateToUrl('/my/wallet/voucher')"
              active-class="active-item"
            >
              <q-item-section class="column items-center">
                <q-icon name="request_quote" size="lg"/>
                <div class="active-text text-center">{{ tc('代金券') }}</div>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              :active="activeItem === 'payment'"
              @click="navigateToUrl('/my/wallet/payment')"
              active-class="active-item"
            >
              <q-item-section class="column items-center">
                <q-icon name="receipt_long" size="lg"/>
                <div class="active-text text-center">{{ tc('支付记录') }}</div>
              </q-item-section>
            </q-item>

            <q-item
              v-if="store.items.fedRole === 'federal-admin'"
              clickable
              :active="activeItem === 'manage'"
              @click="navigateToUrl('/my/wallet/manage')"
              active-class="active-item"
            >
              <q-item-section class="column items-center">
                <q-icon name="manage_accounts" size="lg"/>
                <div class="active-text text-center">{{ tc('管理员') }}</div>
              </q-item-section>
            </q-item>

          </q-list>

          <div class="row justify-center q-pt-lg">
            <q-icon class="text-center" name="info" color="grey-5" size="xs">
              <q-tooltip class="bg-grey-3">
                <div class="text-grey text-caption text-center">{{ tc('releaseTime') }}</div>
                <div class="text-grey text-caption text-center">
                  {{ new Date(releaseTime).toLocaleString(i18n.global.locale) }}
                </div>
              </q-tooltip>
            </q-icon>
          </div>

        </q-scroll-area>
      </div>
    </q-drawer>

    <q-page-container>
      <q-scroll-area style="height: 100vh;">
        <router-view :key="$route.fullPath"/>
      </q-scroll-area>
    </q-page-container>

  </q-layout>
</template>

<style lang="scss" scoped>
.active-item {
  background-color: #DBF0FC; // $grey-4;

  .active-text {
    color: $primary;
  }
}
</style>
