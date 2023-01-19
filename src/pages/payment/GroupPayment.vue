<script setup lang="ts">
// import { ref, computed, PropType } from "vue"
// import { navigateToUrl } from 'single-spa'
// import { useStore } from 'stores/store'
import { useRoute/* , useRouter */ } from 'vue-router'
// import { i18n } from 'boot/i18n'

import PaymentTable from 'components/payment/PaymentTable.vue'

// const props = defineProps({
//   group: {
//     type: String,
//     required: false
//   }
// })
// const emits = defineEmits(['change', 'delete'])

// const { tc } = i18n.global
// const store = useStore()
const route = useRoute()
// const router = useRouter()

const groupId = route.query.group as string
</script>

<template>
  <div class="GroupPayment">
    <PaymentTable :is-group="true" :group-id="groupId"/>
  </div>
</template>

<style lang="scss" scoped>
.GroupPayment {
}
</style>
