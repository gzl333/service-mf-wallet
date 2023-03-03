<script setup lang="ts">
import { ref /* computed, watch/!* , PropType  *!/ */ } from 'vue'
// import { navigateToUrl } from 'single-spa'
// import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import { Notify, useDialogPluginComponent } from 'quasar'

import api from 'src/api'
import type { PropType } from 'vue'
import type { VoucherInterface } from 'stores/store'

import useExceptionNotifier from 'src/hooks/useExceptionNotifier'

const props = defineProps({
  isAdmin: {
    type: Boolean,
    required: false,
    default: false
  },
  voucher: {
    type: Object as PropType<VoucherInterface>,
    required: true
  }
})
// const emits =
defineEmits([...useDialogPluginComponent.emits])

const { tc } = i18n.global
// const store = useStore()
// const route = useRoute()
// const router = useRouter()

const {
  dialogRef,
  onDialogHide,
  onDialogOK,
  onDialogCancel
} = useDialogPluginComponent()

const exceptionNotifier = useExceptionNotifier()

// checks
const check1 = ref(false)
const check2 = ref(false)

const isDeleting = ref(false)
// onOK
const onOKClick = async () => {
  // start
  isDeleting.value = true

  // notify
  const dismiss = Notify.create({
    classes: 'notification-positive shadow-15',
    spinner: true,
    textColor: 'positive',
    message: `${tc('正在删除代金券')}`,
    position: 'bottom',
    closeBtn: true,
    timeout: 0, // infinite
    multiLine: false
  })

  // to del
  try {
    // del
    const respDelVoucher = props.isAdmin
      ? await api.wallet.admin.deleteAdminCashCouponId({ path: { id: props.voucher.id } })
      : await api.wallet.cashcoupon.deleteCashCoupon({
        path: { id: props.voucher.id },
        query: { force: 'true' }
      })

    if (respDelVoucher.status === 204) {
      onDialogOK(true)
      // 成功通知
      Notify.create({
        classes: 'notification-positive shadow-15',
        icon: 'mdi-check-circle',
        // spinner: true,
        textColor: 'positive',
        message: `${tc('成功删除代金券')}`,
        position: 'bottom',
        closeBtn: true,
        timeout: 5000, // 0, // infinite
        multiLine: false
      })
    }
  } catch (exception) {
    exceptionNotifier(exception)
  }

  // end
  dismiss()
  isDeleting.value = false
}

</script>

<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin dialog-negative">

      <q-card-section class="row items-center justify-center q-pb-md">
        <div class="text-negative">{{ isAdmin ? tc('管理员删除代金券') : tc('删除代金券') }}</div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            {{ tc('代金券ID') }}
          </div>
          <div class="col">
            {{ voucher?.id }}
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            {{ tc('余额') }}
          </div>
          <div class="col">
            {{ voucher?.balance }}
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            {{ tc('面额') }}
          </div>
          <div class="col">
            {{ voucher?.face_value }}
          </div>
        </div>

        <div class="row items-center">
          <div class="col-2 text-grey-7">
            {{ tc('服务单元') }}
          </div>
          <div class="col">
            {{ i18n.global.locale === 'zh' ? voucher?.app_service?.name : voucher?.app_service?.name_en }}
          </div>
        </div>

      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div class="row items-center">
          <div class="col text-grey-7">
            {{ tc('请仔细阅读以下事项，并在确认后勾选:') }}
          </div>
        </div>

        <div class="row">
          <q-checkbox
            style="margin-left: -10px;"
            v-model="check1"
            color="primary">
            <div :class="check1?'text-primary':'text-black'">
              {{ tc('我了解所删除代金券不可恢复') }}
            </div>
          </q-checkbox>
        </div>

        <div class="row">
          <q-checkbox
            style="margin-left: -10px;"
            v-model="check2"
            color="primary">
            <div :class="check2?'text-primary':'text-black'">
              {{ tc('我了解删除代金券不会影响已经获得的资源') }}
            </div>
          </q-checkbox>
        </div>

      </q-card-section>

      <q-card-actions align="between">

        <q-btn class="q-ma-sm"
               color="primary"
               unelevated
               no-caps
               :label="tc('取消')"
               @click="onDialogCancel"/>

        <q-btn class="q-ma-sm"
               :loading="isDeleting"
               :color="!check1 || !check2 ? 'grey' : 'negative'"
               unelevated no-caps
               :disable="!check1 || !check2"
               :label="tc('确认')"
               @click="onOKClick">

          <q-tooltip v-if="!check1 || !check2">
            {{ tc('请勾选全部注意事项') }}
          </q-tooltip>

        </q-btn>

      </q-card-actions>

    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>
