# 前端代码风格指南 (Vue 3 + Vite + Vuetify)

## 目录
1. [项目结构](#项目结构)
2. [Vue 3 组合式 API](#vue-3-组合式-api)
3. [组件规范](#组件规范)
4. [脚本设置](#脚本设置)
5. [模板规范](#模板规范)
6. [样式规范](#样式规范)
7. [API 集成](#api-集成)
8. [命名规范](#命名规范)
9. [最佳实践](#最佳实践)

## 项目结构

```
frontend/
├── src/
│   ├── components/          # 可复用 Vue 组件
│   │   ├── ContactList.vue
│   │   └── ContactForm.vue
│   ├── services/            # API 和业务逻辑
│   │   ├── api.js          # Axios 实例和拦截器
│   │   └── contactService.js # 联系人 API 调用
│   ├── assets/             # 静态资源
│   ├── App.vue             # 根组件
│   └── main.js             # 应用入口
├── index.html
├── vite.config.js
└── package.json
```

## Vue 3 组合式 API

### 推荐用法
对所有新组件使用 Vue 3 组合式 API（`<script setup>`）。

```vue
<script setup>
import { ref, computed, onMounted } from 'vue'

// 响应式状态
const count = ref(0)

// 计算属性
const doubleCount = computed(() => count.value * 2)

// 生命周期钩子
onMounted(() => {
  console.log('组件已挂载')
})
</script>
```

### 响应式引用
- 原始值和对象使用 `ref()`
- 多个属性的对象使用 `reactive()`
- 派生状态使用 `computed()`

```vue
<script setup>
// ✓ 正确
const user = ref({
  name: '',
  email: ''
})

// ✓ 正确
const isValid = computed(() => user.value.name.length > 0)
</script>
```

## 组件规范

### 单一职责
每个组件应该有一个明确定义的目的。

```vue
<!-- ✓ 正确：ContactList 专注于联系人列表 -->
<template>
  <div class="contact-list">
    <!-- 实现 -->
  </div>
</template>

<script setup>
// 组件逻辑
</script>
```

### 组件通信

**Props（父 → 子）**
```vue
<script setup>
const props = defineProps({
  contact: {
    type: Object,
    default: () => ({})
  },
  isEditing: {
    type: Boolean,
    default: false
  }
})
</script>
```

**Emits（子 → 父）**
```vue
<script setup>
const emit = defineEmits(['submit', 'cancel'])

// 触发事件
const handleSubmit = () => {
  emit('submit', formData)
}
</script>
```

### Props 和 Emits 命名
- Props：JavaScript 中使用 camelCase，模板中使用 kebab-case
- Emits：推荐使用 kebab-case

```vue
<!-- 模板 -->
<ContactForm
  :contact-data="contact"
  @form-submitted="handleSubmit"
/>

<!-- 脚本 -->
<script setup>
const props = defineProps({
  contactData: Object
})

const emit = defineEmits(['form-submitted'])
</script>
```

## 脚本设置

### 脚本设置语法
对所有 Vue 3 组件使用 `<script setup>`。

```vue
<script setup>
import { ref } from 'vue'

const message = ref('Hello World')
</script>

<template>
  <div>{{ message }}</div>
</template>
```

### 顶层常量和函数
将常量和辅助函数放在顶层。

```vue
<script setup>
import { ref, computed } from 'vue'

// ✓ 正确：顶层常量
const API_BASE_URL = '/api'

// ✓ 正确：顶层函数
const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

// 组件逻辑
const currentDate = ref(new Date())
</script>
```

## 模板规范

### 指令顺序
当在元素上使用多个指令时，按以下顺序：

1. `v-if`, `v-else-if`, `v-else`
2. `v-for`
3. `v-once`
4. `v-show`
5. `v-bind` (`:`)
6. `v-model`
7. `v-on` (`@`)
8. `v-html` / `v-text`

```vue
<!-- ✓ 正确 -->
<li
  v-if="isVisible"
  v-for="item in items"
  :key="item.id"
  :class="{ active: item.isActive }"
  @click="handleClick"
>
  {{ item.name }}
</li>
```

### 模板表达式
保持模板表达式简单易读。

```vue
<template>
  <div>
    <h1>{{ pageTitle }}</h1>
    <span>{{ fullName }}</span>
  </div>
</template>

<script setup>
const pageTitle = 'Contact List'
const fullName = computed(() => `${firstName} ${lastName}`)
</script>
```

## 样式规范

### 作用域样式
始终为组件样式使用 `scoped` 属性。

```vue
<style scoped>
.contact-list {
  padding: 20px;
}

.contact-list .header {
  margin-bottom: 20px;
}
</style>
```

### CSS 命名规范
- CSS 类名使用 kebab-case
- 对复杂组件使用 BEM 方法论

```vue
<style scoped>
/* BEM 示例 */
.contact-form {
  /* 块 */
}

.contact-form__field {
  /* 元素 */
}

.contact-form__field--error {
  /* 修饰符 */
}
</style>
```

### Vuetify 3 集成
遵循 Vuetify 3 组件约定：

```vue
<template>
  <!-- ✓ 正确：使用 Vuetify 组件 -->
  <v-card>
    <v-card-title>Contact Details</v-card-title>
    <v-card-text>
      <v-text-field
        v-model="form.name"
        label="Name"
        :rules="[rules.required]"
      />
    </v-card-text>
  </v-card>
</template>

<script setup>
const rules = {
  required: value => !!value || 'Required'
}
</script>
```

## API 集成

### 服务层模式
使用专用服务文件进行 API 调用。

```javascript
// services/contactService.js
import apiClient from './api'

export const contactService = {
  /**
   * 获取所有联系人
   * @returns {Promise} 解析为 API 响应的 Promise
   */
  async getContacts() {
    return apiClient.get('/contacts')
  },

  /**
   * 创建新联系人
   * @param {Object} contactData - 联系人信息
   * @returns {Promise} 解析为 API 响应的 Promise
   */
  async createContact(contactData) {
    return apiClient.post('/contacts', contactData)
  }
}
```

### Axios 配置
在 `api.js` 中集中配置 API。

```javascript
// services/api.js
import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 响应拦截器
apiClient.interceptors.response.use(
  response => response.data,
  error => Promise.reject(error)
)

export default apiClient
```

## 命名规范

### 文件和文件夹
- **组件**: PascalCase（例如 `ContactList.vue`, `UserProfile.vue`）
- **服务**: camelCase（例如 `contactService.js`, `userService.js`）
- **工具函数**: camelCase（例如 `helpers.js`, `formatters.js`）
- **常量**: UPPER_SNAKE_CASE（例如 `API_ENDPOINTS.js`）

### 变量和函数
- 使用 camelCase
- 使用有意义的描述性名称

```javascript
// ✓ 正确
const userProfile = ref({})
const isLoading = ref(false)

const fetchUserProfile = async () => { }

// ✗ 避免
const user = ref({})
const loading = ref(false)

const getData = async () => { }
```

### 常量
使用 UPPER_SNAKE_CASE 和有意义的名称。

```javascript
// ✓ 正确
const MAX_RETRY_COUNT = 3
const API_TIMEOUT = 10000
const DEFAULT_PAGE_SIZE = 20
```

## 最佳实践

### 1. 避免计算属性中的副作用
```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)

// ✓ 正确
const doubleCount = computed(() => count.value * 2)

// ✗ 避免
const badComputed = computed(() => {
  console.log('This is a side effect!')
  return count.value * 2
})
</script>
```

### 2. v-for 使用 key
```vue
<template>
  <!-- ✓ 正确 -->
  <li v-for="item in items" :key="item.id">
    {{ item.name }}
  </li>
</template>
```

### 3. 优化响应性
```vue
<script setup>
import { ref, shallowRef } from 'vue'

// 对于不需要深度响应性的大对象
const largeData = shallowRef([])

// 对于原始值和小对象
const count = ref(0)
const user = ref({ name: '' })
</script>
```

### 4. 错误处理
```vue
<script setup>
import { ref } from 'vue'

const error = ref(null)
const loading = ref(false)

const fetchData = async () => {
  loading.value = true
  error.value = null

  try {
    // API 调用
  } catch (err) {
    error.value = err.message || 'An error occurred'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <v-alert v-if="error" type="error">
      {{ error }}
    </v-alert>
    <v-progress-linear v-if="loading" indeterminate />
  </div>
</template>
```

### 5. 在 onUnmounted 中清理
```vue
<script setup>
import { onMounted, onUnmounted } from 'vue'

let intervalId = null

onMounted(() => {
  intervalId = setInterval(() => {
    // 执行操作
  }, 1000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>
```

### 6. Props 验证
```vue
<script setup>
const props = defineProps({
  // 必需字符串
  title: {
    type: String,
    required: true
  },

  // 可选带默认值
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },

  // 特定形状的对象
  user: {
    type: Object,
    default: () => ({})
  }
})
</script>
```

## 代码审查检查清单

- [ ] 组件遵循单一职责原则
- [ ] 使用 `<script setup>` 和组合式 API
- [ ] 正确的响应式引用（ref vs reactive）
- [ ] 所有 props 有类型定义
- [ ] 所有 emits 使用 `defineEmits` 定义
- [ ] 模板表达式简单易读
- [ ] 样式使用 scoped
- [ ] 适当的错误处理
- [ ] 复杂函数有 JSDoc 注释
- [ ] 遵循命名规范
- [ ] 生产代码中无 console.log
- [ ] v-for 有 :key 属性
- [ ] 计算属性无副作用
- [ ] 需要时在 onUnmounted 中清理资源

## 参考资源

- [Vue 3 风格指南](https://vuejs.org/style-guide/)
- [Vue 3 组合式 API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Vuetify 3 文档](https://vuetifyjs.com/)
- [Vite 文档](https://vitejs.dev/)
