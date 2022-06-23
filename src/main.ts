import { createApp } from 'vue'
import App from './App.vue'
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css'

createApp(App).provide('$message', ElMessage).mount('#app')
