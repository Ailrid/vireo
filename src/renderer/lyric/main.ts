import 'reflect-metadata'
import '@/assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import { bootstrapVirid } from './ccs'
bootstrapVirid()

const app = createApp(App)
app.mount('#app')
