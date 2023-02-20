<script setup lang="ts">
import { ref, computed, watch } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import { Notify, QInput, useDialogPluginComponent } from 'quasar'
import api from 'src/api'
import { navigateToUrl } from 'single-spa'
// import moment from 'moment'

import useExceptionNotifier from 'src/hooks/useExceptionNotifier'

const props = defineProps({
  groupId: {
    type: String,
    required: false
  }
})
// const emits = defineEmits(['change', 'delete'])
defineEmits([...useDialogPluginComponent.emits])

// const { tc } = i18n.global
// const store = useStore()
// const route = useRoute()
// const router = useRouter()

const exceptionNotifier = useExceptionNotifier()
const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
// const router = useRouter()
const {
  dialogRef,
  onDialogHide,
  onDialogOK,
  onDialogCancel
} = useDialogPluginComponent()

// dom ref
const inputDom = ref<QInput>()

// btn loading
const isLoading = ref(false)

// 如果传入groupId则优先选中group模式
const redeemType = ref<'personal' | 'group'>(props.groupId ? 'group' : 'personal')
const coupon = ref('')

const groupOptions = computed(() => store.getGroupOptions)
const groupSelection = ref('')

const selectDefaultGroup = () => {
  // 优先选中传入的groupId
  groupSelection.value = props.groupId || groupOptions.value[0]?.value
}
// setup时选中一次
selectDefaultGroup()
// options更新时随时更新选中
watch(groupOptions, selectDefaultGroup)

const onOKClick = async () => {
  // 校验coupon格式
  if (coupon.value.length === 0) {
    // notify
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'mdi-alert',
      textColor: 'negative',
      message: `${tc('兑换码错误，请检查输入')}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
    inputDom.value?.focus()
    return
  }
  // 校验项目组选择
  if (redeemType.value === 'group' && groupOptions.value.length === 0) {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'mdi-alert',
      textColor: 'negative',
      message: `${tc('请选择目标项目组')}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
    return
  }
  // 发送请求,兑换代金券
  try {
    isLoading.value = true
    const respPostCashCoupon = await api.wallet.cashcoupon.postCashCouponExchange({
      query: {
        code: coupon.value,
        ...(redeemType.value === 'group' && { vo_id: groupSelection.value })
      }
    })
    isLoading.value = false
    Notify.create({
      classes: 'notification-positive shadow-15',
      textColor: 'positive',
      icon: 'check_circle',
      message: `${tc('兑换成功')}: ${respPostCashCoupon.data.id}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
    // 关闭dialog
    onDialogOK()
    // 跳转
    redeemType.value === 'group' ? navigateToUrl(`/my/wallet/voucher/group?group=${groupSelection.value}`) : navigateToUrl('/my/wallet/voucher/personal')
  } catch (exception) {
    exceptionNotifier(exception)
    isLoading.value = false
  }
}
</script>

<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin dialog-primary">

      <q-card-section class="row items-center justify-center q-pb-md">
        <div class="text-primary">{{ tc('兑换代金券') }}</div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>

      <q-separator/>

      <q-card-section style="height: 180px;">

        <div class="row q-pb-lg items-center ">
          <div class="col-2 text-grey-7">
            {{ tc('兑换到') }}
          </div>

          <div class="col-10 row justify-center ">

            <q-btn class="col q-mr-sm"
                   :outline="redeemType==='personal'?false:true"
                   :ripple="false" dense unelevated no-caps
                   :color="redeemType==='personal'?'primary':'grey'"
                   @click="redeemType = 'personal'">
              {{ tc('个人账户') }}
            </q-btn>

            <q-btn class="col"
                   :outline="redeemType==='group'?false:true"
                   :ripple="false" dense unelevated no-caps
                   :color="redeemType==='group'?'primary':'grey'"
                   @click="redeemType = 'group'">
              {{ tc('项目组账户') }}
            </q-btn>

          </div>
        </div>

        <div v-if="redeemType === 'group'"
             class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            {{ tc('项目组') }}
          </div>
          <div class="col">

            <q-select v-if="groupOptions.length !== 0" outlined dense stack-label v-model="groupSelection"
                      :options="groupOptions" emit-value map-options option-value="value"
                      :label="tc('请选择项目组')"
                      :option-label="i18n.global.locale ==='zh'? 'label':'labelEn'">
              <!--当前选项的内容插槽-->
              <template v-slot:selected-item="scope">
                <span :class="groupSelection===scope.opt.value ? 'text-primary' : 'text-black'">
                  {{ i18n.global.locale === 'zh' ? scope.opt.label : scope.opt.labelEn }}
                </span>
              </template>
            </q-select>

            <div v-else>
              <div class="row items-center">
                {{ tc('暂无项目组') }}
                <q-btn flat no-caps padding="none" color="primary"
                       :to="'/my/server/group/create'">
                  {{ tc('创建项目组') }}
                </q-btn>
              </div>
            </div>
          </div>
        </div>

        <div class="row items-center">
          <div class="col-2 text-grey-7">
            {{ tc('兑换码') }}
          </div>
          <div class="col">
            <q-input ref="inputDom" outlined v-model.trim="coupon" dense
                     :label="tc('请输入兑换码')" @keydown.enter="onOKClick">
              <template v-slot:append>
                <q-icon v-if="coupon !== ''" name="close" @click="coupon = ''" class="cursor-pointer"/>
              </template>
            </q-input>
          </div>
        </div>

      </q-card-section>

      <!--      <q-separator/>-->

      <q-card-actions align="between">

        <q-btn class="q-ma-sm"
               color="primary"
               unelevated
               no-caps
               :label="tc('兑换')"
               @click="onOKClick"
               :loading="isLoading"
        />

        <q-btn class="q-ma-sm"
               color="primary"
               unelevated
               no-caps
               :label="tc('取消')"
               @click="onDialogCancel"/>

      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>
