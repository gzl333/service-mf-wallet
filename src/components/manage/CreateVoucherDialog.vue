<script setup lang="ts">
import { ref, computed, watch/* , PropType  */ } from 'vue'
import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import { Notify, useDialogPluginComponent, QInput } from 'quasar'
import moment from 'moment'

import api from 'src/api'

import useExceptionNotifier from 'src/hooks/useExceptionNotifier'
// import { AxiosError } from 'axios'

// const props = defineProps({
//   foo: {
//     type: String as PropType<'bar'>,
//     required: false,
//     default: ''
//   }
// })
// const emits =
defineEmits([...useDialogPluginComponent.emits])

const { tc } = i18n.global
const store = useStore()
// const route = useRoute()
// const router = useRouter()

const {
  dialogRef,
  onDialogHide
  // onDialogOK,
  // onDialogCancel
} = useDialogPluginComponent()

const exceptionNotifier = useExceptionNotifier()

// 筛选服务单元
const serviceOptions = computed(() => store.getAppServiceOptions(true, false))
const serviceSelection = ref('')
const chooseService = () => {
  serviceSelection.value = serviceOptions.value[0]?.value
}

if (store.tables.appServiceAdminTable.status === 'total') {
  // 如果table读取完毕，则选取第一项
  chooseService()
} else {
  // table未加载完，则需等待table加载完毕
  watch(serviceOptions, () => {
    // 一直watch，但是只有table total状态时才选择
    if (store.tables.appServiceAdminTable.status === 'total') {
      chooseService()
    }
  })
}

// 限额设置
const MAX_DENOMINATION = 100000 // 单张代金券最大面额
const MAX_AMOUNT = 10000 // 单次创建最大数量

// dom refs
const denominationInput = ref<QInput>()
const amountInput = ref<QInput>()
const usernameInput = ref<QInput>()

// refs
const denomination = ref(1000)
const amount = ref(1)
const username = ref('')
const isUsernameAlert = ref(false)
const method = ref<'redeem' | 'assign'>('redeem')

// 生效时间
const dateStartSelect = ref(moment().format('YYYY-MM-DD'))
const timeStartSelect = ref(moment().format('HH:mm'))
const startDateTimeStr = computed(() => moment(dateStartSelect.value + ',' + timeStartSelect.value, 'YYYY-MM-DD,HH:mm').utc().format())

// 失效时间
const dateEndSelect = ref(moment().add(1, 'month').format('YYYY-MM-DD'))
const timeEndSelect = ref(moment().format('HH:mm'))
const endDateTimeStr = computed(() => moment(dateEndSelect.value + ',' + timeEndSelect.value, 'YYYY-MM-DD,HH:mm').utc().format())

// 按钮action
const onHide = () => {
  // close
  onDialogHide()
  // jump： stamp是时间戳，唯一作用是防止进入相同路径而不刷新
  navigateToUrl('/my/wallet/manage/voucher?stamp=' + new Date().getTime())
}

const onOKClick = async () => {
  // 关闭isAlert状态
  isUsernameAlert.value = false

  // 校验输入
  // 面额
  if (denomination.value <= 0 || denomination.value > MAX_DENOMINATION) {
    denominationInput.value?.focus()
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'error',
      textColor: 'negative',
      message: `${tc('面额应在以下区间之中')}: 0-${MAX_DENOMINATION}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
    return
  }
  // 时间
  if (moment.utc(startDateTimeStr.value).isAfter(moment.utc(endDateTimeStr.value))) {
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'error',
      textColor: 'negative',
      message: `${tc('生效时间应早于失效时间')}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
    return
  }
  // 数量
  if (amount.value < 0 || amount.value > MAX_AMOUNT) {
    amountInput.value?.focus()
    Notify.create({
      classes: 'notification-negative shadow-15',
      icon: 'error',
      textColor: 'negative',
      message: `${tc('数量应在以下区间之中')}1-${MAX_AMOUNT}`,
      position: 'bottom',
      closeBtn: true,
      timeout: 5000,
      multiLine: false
    })
    return
  }

  // notify
  const dismiss = Notify.create({
    classes: 'notification-positive shadow-15',
    // icon: 'mdi-check-circle',
    spinner: true,
    textColor: 'positive',
    message: `${tc('正在创建代金券')}`,
    position: 'bottom',
    closeBtn: true,
    timeout: 0, // infinite
    multiLine: false
  })

  // 创建代金券

  if (method.value === 'redeem') {
    // 发放多个代金券，用户自行领取
    try {
      // req： 同时发出多个网络请求，并等待所有成功结果
      void await Promise.all([...Array(Number(amount.value))].map(() => api.wallet.admin.postAdminCashCoupon({
        body: {
          face_value: denomination.value.toString(),
          effective_time: startDateTimeStr.value,
          expiration_time: endDateTimeStr.value,
          app_service_id: store.tables.appServiceTable.byId[serviceSelection.value]?.id
        }
      })))

      // notify
      dismiss()
      Notify.create({
        classes: 'notification-positive shadow-15',
        icon: 'mdi-check-circle',
        // spinner: true,
        textColor: 'positive',
        message: `${tc('成功创建代金券')}:${amount.value}${tc('张')}`,
        position: 'bottom',
        closeBtn: true,
        timeout: 5000, // infinite
        multiLine: false
      })

      // close
      onDialogHide()
      // jump： stamp是时间戳，唯一作用是防止进入相同路径而不刷新
      navigateToUrl('/my/wallet/manage/voucher?stamp=' + new Date().getTime())
    } catch (exception) {
      // notify
      dismiss()
      exceptionNotifier(exception, 'CreateVoucherDialog')
      // console.log(exception)
    }
  } else {
    // 发放多个代金券，直接发放到指定账户列表

    // parse accounts
    const accounts = [...new Set( // 去重
      username.value.split(',') // 分割
        .map((account: string) => account.trim()) // trim
        .filter((account: string) => account !== '') // 去掉空串
    )]
    // console.log('Accounts:', accounts)

    // 输入为空则提示
    if (accounts.length === 0) {
      dismiss()
      usernameInput.value?.focus()
      Notify.create({
        classes: 'notification-negative shadow-15',
        icon: 'error',
        textColor: 'negative',
        message: `${tc('请输入账户')}`,
        position: 'bottom',
        closeBtn: true,
        timeout: 5000,
        multiLine: false
      })
      return
    }

    // 分别记录成功和失败的账户
    const success = []
    const fail = []

    // req： 每个account独立发出请求。
    for (const account of accounts) {
      try {
        await api.wallet.admin.postAdminCashCoupon({
          body: {
            face_value: denomination.value.toString(),
            effective_time: startDateTimeStr.value,
            expiration_time: endDateTimeStr.value,
            app_service_id: store.tables.appServiceTable.byId[serviceSelection.value]?.id,
            username: account
          }
        })
        // 记录成功的账户
        success.push(account)
      } catch (exception) {
        // if (exception instanceof AxiosError) {
        //   console.log(exception.config.data.username) // can't get it!!!!
        // }
        // 记录失败的账户
        fail.push(account)
      }
    }

    // 已经创建完毕，关闭提示
    dismiss()

    // fail为空则全部创建成功
    if (fail.length === 0) {
      Notify.create({
        classes: 'notification-positive shadow-15',
        icon: 'mdi-check-circle',
        // spinner: true,
        textColor: 'positive',
        message: `${tc('成功为指定账户创建代金券')}}`,
        position: 'bottom',
        closeBtn: true,
        timeout: 5000,
        multiLine: false
      })
      // close
      onDialogHide()
      // jump： stamp是时间戳，唯一作用是防止进入相同路径而不刷新
      navigateToUrl('/my/wallet/manage/voucher?stamp=' + new Date().getTime())
    } else {
      // console.log(fail)

      // notify
      Notify.create({
        classes: 'notification-negative shadow-15',
        icon: 'error',
        textColor: 'negative',
        message: `${tc('部分账户创建代金券失败，请检查输入')}`,
        position: 'bottom',
        closeBtn: true,
        timeout: 0,
        multiLine: false
      })

      // 显示在输入框内
      username.value = fail.reduce((prev: string, curr: string) => prev + curr + ',', '')

      // dom ref modification
      usernameInput.value!.focus()
      isUsernameAlert.value = true
    }
  }
}

</script>

<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialogRef" @hide="onHide" persistent>
    <q-card class="q-dialog-plugin dialog-primary ">

      <q-card-section class="row items-center justify-center q-pb-md">
        <div class="text-primary">{{ tc('创建代金券') }}</div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div class="row items-center">
          <div class="col-3 text-grey-7">
            {{ tc('服务单元') }}
          </div>
          <q-select class="col"
                    style="min-width: 170px;"
                    :label-color="serviceSelection !== 'all' ? 'primary' : ''"
                    outlined
                    dense
                    stack-label
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
                <!--                <q-tooltip>-->
                <!--                  <div v-if="store.tables.serviceTable.byId[scope.opt.value]?.status === 'enable'">-->
                <!--                    服务单元运行中-->
                <!--                  </div>-->
                <!--                  <div v-else-if="store.tables.serviceTable.byId[scope.opt.value]?.status === 'disable'">-->
                <!--                    服务单元暂停服务-->
                <!--                  </div>-->
                <!--                  <div v-else-if="store.tables.serviceTable.byId[scope.opt.value]?.status === 'deleted'">-->
                <!--                    服务单元已删除-->
                <!--                  </div>-->
                <!--                  <div v-else>-->
                <!--                    全部服务单元-->
                <!--                  </div>-->
                <!--                </q-tooltip>-->
                <!--                <q-item-section thumbnail>-->
                <!--                  <q-icon v-if="store.tables.serviceTable.byId[scope.opt.value]?.status === 'enable'"-->
                <!--                          color="light-green"-->
                <!--                          name="play_arrow"/>-->
                <!--                  <q-icon v-else-if="store.tables.serviceTable.byId[scope.opt.value]?.status === 'disable'"-->
                <!--                          color="red"-->
                <!--                          name="pause"/>-->
                <!--                  <q-icon v-else-if="store.tables.serviceTable.byId[scope.opt.value]?.status === 'deleted'"-->
                <!--                          color="black"-->
                <!--                          name="clear"/>-->
                <!--                  <q-icon v-else color="primary" name="done_all"/>-->
                <!--                </q-item-section>-->
                <q-item-section>
                  <q-item-label class="row items-center">
                    <q-icon v-if="store.tables.appServiceTable.byId[scope.opt.value]?.category === 'vms-server'"
                            class="col-auto"
                            color="primary"
                            size="sm"
                            name="computer"/>
                    <q-icon v-if="store.tables.appServiceTable.byId[scope.opt.value]?.category === 'vms-object'"
                            class="col-auto"
                            color="primary"
                            size="sm"
                            name="mdi-database"/>
                    <q-icon v-if="store.tables.appServiceTable.byId[scope.opt.value]?.category === 'high-cloud'"
                            class="col-auto"
                            color="primary"
                            size="sm"
                            name="mdi-security"/>
                    <q-icon v-if="store.tables.appServiceTable.byId[scope.opt.value]?.category === 'hpc'"
                            class="col-auto"
                            color="primary"
                            size="sm"
                            name="mdi-rocket-launch"/>
                    <q-icon v-if="store.tables.appServiceTable.byId[scope.opt.value]?.category === 'other'"
                            class="col-auto"
                            color="primary"
                            size="sm"
                            name="mdi-help-circle-outline"/>
                    <div class="col-auto">
                      {{ i18n.global.locale === 'zh' ? scope.opt.label : scope.opt.labelEn }}
                    </div>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>

          </q-select>
        </div>

        <div class="row items-center">
          <div class="col-3 text-grey-7">
            {{ tc('面额') }}
          </div>

          <q-input
            ref="denominationInput"
            class="col-4 q-mt-md"
            style="min-width: 200px"
            v-model.number.trim="denomination"
            type="number"
            dense
            outlined
            :rules="[
              val => val >= 0 || tc('不可为负数'),
              val => val <= MAX_DENOMINATION || tc('最大面额:') + MAX_DENOMINATION
              ]"
          />

          <div class="col-auto"> {{ tc('点') }}</div>

        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('生效时间') }}
          </div>
          <div class="col-9 row items-center">
            <q-input class="col"
                     v-model="dateStartSelect"
                     type="date"
                     outlined
                     dense/>
            <q-input class="col"
                     v-model="timeStartSelect"
                     type="time"
                     outlined
                     dense/>
          </div>
        </div>

        <div class="row items-center">
          <div class="col-3 text-grey-7">
            {{ tc('失效时间') }}
          </div>
          <div class="col-9 row items-center">
            <q-input class="col"
                     v-model="dateEndSelect"
                     type="date"
                     outlined
                     dense/>
            <q-input class="col"
                     v-model="timeEndSelect"
                     type="time"
                     outlined
                     dense/>
          </div>
        </div>

        <div class="row items-center q-pt-lg q-pb-xs">
          <div class="col-3 text-grey-7">
            {{ tc('发放方式') }}
          </div>
          <div class="col-9 row items-center ">

            <q-btn
              class=""
              :color="method === 'redeem' ? 'primary' : 'grey-3'"
              :text-color="method === 'redeem' ? '' : 'black'"
              unelevated
              dense
              @click="method = 'redeem'"
            >
              {{ tc('用户兑换') }}
            </q-btn>

            <q-btn
              class="q-mx-sm"
              :color="method === 'assign' ? 'primary' : 'grey-3'"
              :text-color="method === 'assign' ? '' : 'black'"
              unelevated
              dense
              @click="method = 'assign'"
            >
              {{ tc('发到指定账户') }}
            </q-btn>

          </div>
        </div>

        <div v-if="method === 'redeem'"
             class="row items-center">
          <div class="col-3 text-grey-7">
            {{ tc('数量') }}
          </div>
          <q-input
            ref="amountInput"
            class="col-4 q-mt-md"
            style="min-width: 200px"
            v-model.number.trim="amount"
            type="number"
            dense
            outlined
            :rules="[
              val => val>0 || tc('应大于0'),
              val => val % 1 === 0 || tc('应为整数'),
              val => val <= MAX_AMOUNT || tc('最大数量:') + MAX_AMOUNT
            ]"
          />
          <div class="col-auto"> {{ tc('张') }}</div>
        </div>

        <div v-if="method === 'assign'"
             class="row items-center">
          <div class="col-3 text-grey-7">
            {{ tc('指定账户') }}
          </div>
          <div class="col q-pt-md">

            <div class="text-grey">
              {{ tc('将代金券发放给指定账户，请用英文逗号分隔多个账户') }}
            </div>

            <q-input
              ref="usernameInput"
              style="min-width: 200px;"
              :color="isUsernameAlert ? 'negative' : 'primary'"
              :label="isUsernameAlert ? tc('以下账户创建代金券失败:'):''"
              type="textarea"
              v-model.trim="username"
              dense
              outlined
              @update:model-value="isUsernameAlert = false"
            />
          </div>

        </div>

      </q-card-section>

      <q-card-actions align="between">
        <q-btn class="q-ma-sm"
               color="primary"
               outline
               no-caps
               :label="tc('取消')"
               @click="onHide"/>
        <q-btn class="q-ma-sm"
               color="primary"
               unelevated
               no-caps
               :label="tc('确定')"
               @click="onOKClick"/>
      </q-card-actions>

    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>
