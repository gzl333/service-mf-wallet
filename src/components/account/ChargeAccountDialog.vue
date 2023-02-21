<script setup lang="ts">
// import { ref, computed, PropType } from "vue"
// import { navigateToUrl } from 'single-spa'
// import { useStore } from 'stores/store'
// import { useRoute, useRouter } from 'vue-router'
import { i18n } from 'boot/i18n'
import { /*  Notify, QInput,  */useDialogPluginComponent } from 'quasar'

// import useExceptionNotifier from 'src/hooks/useExceptionNotifier'

/* const props =  */defineProps({
  groupId: {
    type: String,
    required: false
  }
})
// const emits = defineEmits(['change', 'delete'])
defineEmits([...useDialogPluginComponent.emits])

// const exceptionNotifier = useExceptionNotifier()
const { tc } = i18n.global
// const store = useStore()
// const route = useRoute()
// const router = useRouter()

const {
  dialogRef,
  onDialogHide,
  // onDialogOK,
  onDialogCancel
} = useDialogPluginComponent()

</script>

<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin dialog-primary">

      <q-card-section class="row items-center justify-center q-pb-md">
        <div class="text-primary">{{ tc('账户充值') }}</div>
        <q-space/>
        <q-btn icon="close" flat dense size="sm" v-close-popup/>
      </q-card-section>

      <q-separator/>

      <q-card-section>
        <div>
          {{tc('暂不支持自助充值，请联系平台管理员。')}}
        </div>

<!--        <div class="row q-pb-lg items-center ">-->
<!--          <div class="col-2 text-grey-7">-->
<!--            {{ tc('兑换到') }}-->
<!--          </div>-->

<!--          <div class="col-10 row justify-center ">-->

<!--            <q-btn class="col q-mr-sm"-->
<!--                   :outline="redeemType==='personal'?false:true"-->
<!--                   :ripple="false" dense unelevated no-caps-->
<!--                   :color="redeemType==='personal'?'primary':'grey'"-->
<!--                   @click="redeemType = 'personal'">-->
<!--              {{ tc('个人账户') }}-->
<!--            </q-btn>-->

<!--            <q-btn class="col"-->
<!--                   :outline="redeemType==='group'?false:true"-->
<!--                   :ripple="false" dense unelevated no-caps-->
<!--                   :color="redeemType==='group'?'primary':'grey'"-->
<!--                   @click="redeemType = 'group'">-->
<!--              {{ tc('项目组账户') }}-->
<!--            </q-btn>-->

<!--          </div>-->
<!--        </div>-->

<!--        <div v-if="redeemType === 'group'"-->
<!--             class="row q-pb-lg items-center">-->
<!--          <div class="col-2 text-grey-7">-->
<!--            {{ tc('项目组') }}-->
<!--          </div>-->
<!--          <div class="col">-->

<!--            <q-select v-if="groupOptions.length !== 0" outlined dense stack-label v-model="groupSelection"-->
<!--                      :options="groupOptions" emit-value map-options option-value="value"-->
<!--                      :label="tc('请选择项目组')"-->
<!--                      :option-label="i18n.global.locale ==='zh'? 'label':'labelEn'">-->
<!--              &lt;!&ndash;当前选项的内容插槽&ndash;&gt;-->
<!--              <template v-slot:selected-item="scope">-->
<!--                <span :class="groupSelection===scope.opt.value ? 'text-primary' : 'text-black'">-->
<!--                  {{ i18n.global.locale === 'zh' ? scope.opt.label : scope.opt.labelEn }}-->
<!--                </span>-->
<!--              </template>-->
<!--            </q-select>-->

<!--            <div v-else>-->
<!--              <div class="row items-center">-->
<!--                {{ tc('暂无项目组') }}-->
<!--                <q-btn flat no-caps padding="none" color="primary"-->
<!--                       :to="'/my/server/group/create'">-->
<!--                  {{ tc('创建项目组') }}-->
<!--                </q-btn>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->

<!--        <div class="row items-center">-->
<!--          <div class="col-2 text-grey-7">-->
<!--            {{ tc('兑换码') }}-->
<!--          </div>-->
<!--          <div class="col">-->
<!--            <q-input ref="inputDom" outlined v-model.trim="coupon" dense-->
<!--                     :label="tc('请输入兑换码')" @keydown.enter="onOKClick">-->
<!--              <template v-slot:append>-->
<!--                <q-icon v-if="coupon !== ''" name="close" @click="coupon = ''" class="cursor-pointer"/>-->
<!--              </template>-->
<!--            </q-input>-->
<!--          </div>-->
<!--        </div>-->

      </q-card-section>

      <!--      <q-separator/>-->

      <q-card-actions align="between">

        <q-btn class="q-ma-sm"
               color="primary"
               outline
               no-caps
               :label="tc('取消')"
               @click="onDialogCancel"/>

<!--        <q-btn class="q-ma-sm"-->
<!--               color="primary"-->
<!--               unelevated-->
<!--               no-caps-->
<!--               :label="tc('兑换')"-->
<!--               @click="onOKClick"-->
<!--               :loading="isLoading"-->
<!--        />-->

      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped>
.ChargeAccountDialog {
}
</style>
