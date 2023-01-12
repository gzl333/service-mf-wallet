<script setup lang="ts">
import { ref, computed/* , PropType  */ } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import { Notify, useDialogPluginComponent, QInput } from 'quasar'
import moment from 'moment'

import api from 'src/api'

import useExceptionNotifier from 'src/hooks/useExceptionNotifier'

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
  onDialogHide,
  // onDialogOK,
  onDialogCancel
} = useDialogPluginComponent()

const exceptionNotifier = useExceptionNotifier()

// 筛选服务单元
const serviceOptions = computed(() => store.getAllServices)
const serviceSelection = ref('1')

// 限额设置
const MAX_DENOMINATION = 100000 // 单张代金券最大面额
const MAX_AMOUNT = 10000 // 单次创建最大数量

// dom refs
const denominationInput = ref<QInput>()

// refs
const denomination = ref(0)
const amount = ref(1)
const username = ref('')

// 生效时间
const dateStartSelect = ref(moment().format('YYYY-MM-DD'))
const timeStartSelect = ref(moment().format('HH:mm'))
const startDateTimeStr = computed(() => moment(dateStartSelect.value + ',' + timeStartSelect.value, 'YYYY-MM-DD,HH:mm').utc().format())

// 失效时间
const dateEndSelect = ref(moment().add(1, 'month').format('YYYY-MM-DD'))
const timeEndSelect = ref(moment().format('HH:mm'))
const endDateTimeStr = computed(() => moment(dateEndSelect.value + ',' + timeEndSelect.value, 'YYYY-MM-DD,HH:mm').utc().format())

const onOKClick = async () => {
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
  }

  // 创建代金券
  try {
    const respPostAdminCashcoupon = await api.wallet.admin.postAdminCashcoupon({
      body: {
        face_value: denomination.value.toString(),
        effective_time: startDateTimeStr.value,
        expiration_time: endDateTimeStr.value,
        app_service_id: store.tables.serviceTable.byId[serviceSelection.value]?.pay_app_service_id,
        ...(username.value !== '' ? { username: username.value } : {})
      }
    })
    console.log(respPostAdminCashcoupon)
    // notify
    // jump
  } catch (exception) {
    exceptionNotifier(exception)
  }
}

</script>

<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
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
                          color="light-green"
                          name="play_arrow"/>
                  <q-icon v-else-if="store.tables.serviceTable.byId[scope.opt.value]?.status === 'disable'"
                          color="red"
                          name="pause"/>
                  <q-icon v-else-if="store.tables.serviceTable.byId[scope.opt.value]?.status === 'deleted'"
                          color="black"
                          name="clear"/>
                  <q-icon v-else color="primary" name="done_all"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="row items-center">
                    <q-icon v-if="store.tables.serviceTable.byId[scope.opt.value]?.pay_app_service_type === 'server'"
                            class="col-auto"
                            color="primary"
                            size="sm"
                            name="computer"/>
                    <q-icon v-if="store.tables.serviceTable.byId[scope.opt.value]?.pay_app_service_type === 'storage'"
                            class="col-auto"
                            color="primary"
                            size="sm"
                            name="mdi-database"/>
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
            class="col q-mt-md"
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

        <div class="row items-center">
          <div class="col-3 text-grey-7">
            {{ tc('数量') }}
          </div>
          <q-input
            class="col q-mt-md"
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

        <div class="row items-center">
          <div class="col-3 text-grey-7">
            {{ tc('指定用户名(可选)') }}
          </div>
          <q-input
            class="col"
            style="min-width: 200px"
            v-model.trim="username"
            :label="tc('将代金券发放给具体用户，可以不填写')"
            dense
            outlined
          />
        </div>

      </q-card-section>

      <q-card-actions align="between">
        <q-btn class="q-ma-sm"
               color="primary"
               outline
               no-caps
               :label="tc('取消')"
               @click="onDialogCancel"/>
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
