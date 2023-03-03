// exception handler
import { Notify } from 'quasar'
import { AxiosError } from 'axios'

export default function () {
  return (exception: unknown, source?: string) => {
    // axios error
    if (exception instanceof AxiosError) {
      if (exception.response?.data) { // 业务错误
        Notify.create({
          classes: 'notification-negative shadow-15',
          icon: 'mdi-alert',
          textColor: 'negative',
          message: exception?.response?.status + ' - ' + exception?.response?.data.code + ' - from: ' + source,
          caption: exception?.response?.data.message,
          position: 'bottom',
          closeBtn: true,
          timeout: 0,
          multiLine: false
        })
      } else {
        // 网络错误
        Notify.create({
          classes: 'notification-negative shadow-15',
          icon: 'mdi-alert',
          textColor: 'negative',
          message: exception?.code + ' - ' + source,
          caption: exception?.message,
          position: 'bottom',
          closeBtn: true,
          timeout: 0,
          multiLine: false
        })
      }
    } else {
      // other kind of exceptions
      console.error(exception)
    }
  }
}
