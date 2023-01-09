<script setup lang="ts">
import { ref, computed, PropType } from 'vue'
// import { navigateToUrl } from 'single-spa'
import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import { Notify, useDialogPluginComponent } from 'quasar'

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
  onDialogOK,
  onDialogCancel
} = useDialogPluginComponent()

// 筛选服务单元
const serviceOptions = computed(() => store.getAllServices)
const serviceSelection = ref('1')

const denomination = ref(0)

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

        <div class="row q-pb-lg items-center">
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

        <div class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('面额') }}
          </div>

          <q-input
            class="col q-mt-md"
            style="min-width: 200px"
            v-model.number="denomination"
            type="number"
            dense
            outlined
            :rules="[val => val>=0 || tc('不可为负数')]"
          />

        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('生效时间') }}
          </div>
          <div class="col" style="max-width: 400px; word-break: break-all; word-wrap: break-word; white-space: normal;">
            2023-1-1
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('失效时间') }}
          </div>
          <div class="col">
            2024-1-1
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-3 text-grey-7">
            {{ tc('数量') }}
          </div>
          <div class="col">
            99
          </div>
        </div>

        <div class="row items-center">
          <div class="col-3 text-grey-7">
            {{ tc('指定用户名') }}
          </div>
          <div class="col">
            username
          </div>
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
