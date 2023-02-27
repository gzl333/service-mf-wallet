<script setup lang="ts">
// import { ref, computed, watch/* , PropType  */ } from 'vue'
// import { navigateToUrl } from 'single-spa'
// import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import { /*  Notify,  */useDialogPluginComponent /* QInput  */ } from 'quasar'

// import api from 'src/api'

// import useExceptionNotifier from 'src/hooks/useExceptionNotifier'

/* const props =  */defineProps({
  voucherId: {
    type: String,
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
  onDialogHide
  // onDialogOK,
  // onDialogCancel
} = useDialogPluginComponent()

// const exceptionNotifier = useExceptionNotifier()

// getVoucher
// temp
const voucher = {
  id: '491197306518',
  face_value: '200.00',
  creation_time: '2022-11-25T08:45:27.004686Z',
  effective_time: '2022-11-27T11:43:51.775259Z',
  expiration_time: '2022-12-30T00:00:00Z',
  balance: '3.32',
  status: 'available',
  granted_time: '2022-11-29T01:44:46.410430Z',
  owner_type: 'user',
  app_service: {
    id: 's20220627514265',
    name: 'SDGs项目',
    name_en: 'SDGs',
    category: 'vms-server',
    service_id: '2'
  },
  user: {
    id: '6',
    username: 'zlguo@cnic.cn'
  },
  vo: null,
  activity: {
    id: '032898f4-6c9b-11ed-ac8b-c8009fe2eb03',
    name: '2022年中国科技云培训（云主机）'
  }
}

</script>

<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialogRef" @hide="onDialogHide" >
    <q-card class="q-dialog-plugin dialog-negative">

      <q-card-section class="row items-center justify-center q-pb-md">
        <div class="text-negative">{{ tc('删除代金券') }}</div>
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
            {{ voucher.id }}
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            {{ tc('余额') }}
          </div>
          <div class="col">
            {{ voucher.balance }}
          </div>
        </div>

        <div class="row q-pb-lg items-center">
          <div class="col-2 text-grey-7">
            {{ tc('有效期') }}
          </div>
          <div class="col">
            {{ voucher.balance }}
          </div>
        </div>

        <!--        <div class="row q-pb-lg items-center">-->
        <!--          <div class="col-2 text-grey-7">-->
        <!--            {{ tc('components.server.ServerDeleteDialog.remarks') }}-->
        <!--          </div>-->
        <!--          <div class="col" style="max-width: 400px; word-break: break-all; word-wrap: break-word; white-space: normal;">-->
        <!--            {{ server.remarks }}-->
        <!--          </div>-->
        <!--        </div>-->

        <!--        <div v-if="isGroup" class="row q-pb-lg items-center">-->
        <!--          <div class="col-2 text-grey-7">-->
        <!--            {{ tc('components.server.ServerDeleteDialog.group') }}-->
        <!--          </div>-->
        <!--          <div class="col">-->
        <!--            {{ store.tables.groupTable.byId[server.vo_id].name }}-->
        <!--          </div>-->
        <!--        </div>-->

        <!--        <div class="row q-pb-lg items-center">-->
        <!--          <div class="col-2 text-grey-7">-->
        <!--            {{ tc('components.server.ServerDeleteDialog.org') }}-->
        <!--          </div>-->
        <!--          <div class="col">-->
        <!--            {{-->
        <!--              i18n.global.locale === 'zh' ?-->
        <!--                store.tables.dataCenterTable.byId[store.tables.serviceTable.byId[server.service.id]?.data_center]?.name :-->
        <!--                store.tables.dataCenterTable.byId[store.tables.serviceTable.byId[server.service.id]?.data_center]?.name_en-->
        <!--            }}-->
        <!--          </div>-->
        <!--        </div>-->

        <!--        <div class="row q-pb-lg items-center">-->
        <!--          <div class="col-2 text-grey-7">-->
        <!--            {{ tc('components.server.ServerDeleteDialog.service_node') }}-->
        <!--          </div>-->
        <!--          <div class="col">-->
        <!--            {{-->
        <!--              i18n.global.locale === 'zh' ?-->
        <!--                store.tables.serviceTable.byId[server.service.id]?.name :-->
        <!--                store.tables.serviceTable.byId[server.service.id]?.name_en-->
        <!--            }}-->

        <!--            <span>-->
        <!--              <q-icon-->
        <!--                v-if="store.tables.serviceTable.byId[server.service.id]?.service_type.toLowerCase().includes('ev')"-->
        <!--                style="width: 100px;height: 20px">-->
        <!--                      <img src="~assets/svg/EVCloud-Logo-Horizontal.svg" style="width: 100px;height: 20px"/>-->
        <!--              </q-icon>-->
        <!--            </span>-->

        <!--            <span>-->
        <!--              <q-icon-->
        <!--                v-if="store.tables.serviceTable.byId[server.service.id]?.service_type.toLowerCase().includes('open')"-->
        <!--                style="width: 100px;height: 20px">-->
        <!--                      <img src="~assets/svg/OpenStack-Logo-Horizontal.svg" style="width: 100px;height: 20px"/>-->
        <!--              </q-icon>-->
        <!--            </span>-->

        <!--          </div>-->
        <!--        </div>-->

        <!--        <div class="row q-pb-lg items-center">-->
        <!--          <div class="col-2 text-grey-7">-->
        <!--            {{ tc('components.server.ServerDeleteDialog.configuration') }}-->
        <!--          </div>-->
        <!--          <div class="col">-->
        <!--            {{ server.vcpus }}{{ tc('components.server.ServerDeleteDialog.cores') }} / {{ server.ram / 1024 }}GB-->
        <!--          </div>-->
        <!--        </div>-->

        <!--        <div class="row q-pb-lg items-center">-->
        <!--          <div class="col-2 text-grey-7">-->
        <!--            {{ tc('components.server.ServerDeleteDialog.operating_system') }}-->
        <!--          </div>-->
        <!--          <div class="col">-->
        <!--            {{ server.image }}-->
        <!--          </div>-->
        <!--        </div>-->

        <!--        <div class="row q-pb-lg items-center">-->
        <!--          <div class="col-2 text-grey-7">-->
        <!--            {{ tc('components.server.ServerDeleteDialog.network_type') }}-->
        <!--          </div>-->
        <!--          <div class="col">-->
        <!--            {{-->
        <!--              server.public_ip ? tc('components.server.ServerDeleteDialog.public_network') : tc('components.server.ServerDeleteDialog.private_network')-->
        <!--            }}-->
        <!--          </div>-->
        <!--        </div>-->

        <!--        <div class="row items-center">-->
        <!--          <div class="col-2 text-grey-7">-->
        <!--            {{ tc('components.server.ServerDeleteDialog.available_period') }}-->
        <!--          </div>-->
        <!--          <div class="col">-->
        <!--            {{ new Date(server.creation_time).toLocaleString(i18n.global.locale) }} - -->
        <!--            {{-->
        <!--              server.expiration_time ? new Date(server.expiration_time).toLocaleString(i18n.global.locale) : tc('components.server.ServerDeleteDialog.permanently_valid')-->
        <!--            }}-->
        <!--            &lt;!&ndash;            <q-icon&ndash;&gt;-->
        <!--            &lt;!&ndash;              v-if="server.expiration_time !== null && (new Date(server.expiration_time).getTime() - new Date().getTime()) < 0"&ndash;&gt;-->
        <!--            &lt;!&ndash;              name="help_outline" color="red" size="xs">&ndash;&gt;-->
        <!--            &lt;!&ndash;              <q-tooltip>{{ tc('云主机已到期') }}</q-tooltip>&ndash;&gt;-->
        <!--            &lt;!&ndash;            </q-icon>&ndash;&gt;-->
        <!--          </div>-->
        <!--        </div>-->

      </q-card-section>

      <q-separator/>

      <q-card-section>

        <div class="row items-center">
          <div class="col text-grey-7">
            {{ tc('请仔细阅读以下事项，并在确认后勾选:') }}
          </div>
        </div>

        <q-checkbox class="row" style="margin-left: -10px;" v-model="check1" color="primary">
          <div :class="check1?'text-primary':'text-black'">
            {{ tc('我了解所删除代金券不可恢复') }}
          </div>
        </q-checkbox>

        <q-checkbox class="row" style="margin-left: -10px;" v-model="check2" color="primary">
          <div :class="check2?'text-primary':'text-black'">
            {{ tc('我了解删除代金券不会影响已经获得的资源') }}
          </div>
        </q-checkbox>

      </q-card-section>

      <q-card-actions align="between">

        <q-btn class="q-ma-sm" color="primary" unelevated no-caps
               :label="tc('取消')" @click="onCancelClick"/>

        <q-btn class="q-ma-sm" :color="!check1 || !check2 ? 'grey' : 'red'"
               unelevated no-caps
               :disable="!check1 || !check2"
               :label="tc('确认')"
               @click="onOKClick"/>

      </q-card-actions>

    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
</style>
