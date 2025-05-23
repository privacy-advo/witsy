<template>
  <div class="settings panel-content tabs" ref="tabs">
    <div class="panel">
      <header>
        <div class="title">{{ t('common.settings') }}</div>
      </header>
      <main>
        <ul>
          <SettingsTab class="general" :title="t('settings.tabs.general')" :checked="initialTab == 'general'"><BIconGear class="icon" /></SettingsTab>
          <SettingsTab class="appearance" :title="t('settings.tabs.appearance')"><BIconLayoutTextWindowReverse class="icon" /></SettingsTab>
          <SettingsTab class="models" :title="t('settings.tabs.models')" :checked="initialTab == 'models'"><BIconCpu class="icon" /></SettingsTab>
          <SettingsTab class="plugins" :title="t('settings.tabs.plugins')" :checked="initialTab == 'plugins'"><BIconTools class="icon" /></SettingsTab>
          <SettingsTab class="mcp" :title="t('settings.tabs.mcp')" @change="load(settingsMcp)" :checked="initialTab == 'mcp'"><WIconMcp class="icon" /></SettingsTab>
          <SettingsTab class="commands" :title="t('settings.tabs.commands')" @change="load(settingsCommands)"><BIconMagic class="icon" /></SettingsTab>
          <SettingsTab class="experts" :title="t('settings.tabs.experts')" @change="load(settingsExperts)"><BIconMortarboard class="icon" /></SettingsTab>
          <SettingsTab class="voice" :title="t('settings.tabs.voice')" :checked="initialTab == 'voice'"><BIconMegaphone class="icon" /></SettingsTab>
          <SettingsTab class="shortcuts" :title="t('settings.tabs.shortcuts')"><BIconCommand class="icon" /></SettingsTab>
          <SettingsTab class="advanced" :title="t('settings.tabs.advanced')" @change="load(settingsAdvanced)"><BIconTools class="icon" /></SettingsTab>
        </ul>
      </main>
    </div>
    <div class="content">
      <SettingsGeneral ref="settingsGeneral" />
      <SettingsAppearance ref="settingsAppearance" />
      <SettingsLLM ref="settingsLLM" />
      <SettingsPlugins ref="settingsPlugins" />
      <SettingsMcp ref="settingsMcp" />
      <SettingsCommands ref="settingsCommands" />
      <SettingsExperts ref="settingsExperts" />
      <SettingsVoice ref="settingsVoice" />
      <SettingsShortcuts ref="settingsShortcuts" />
      <SettingsAdvanced ref="settingsAdvanced" />
    </div>
  </div>
</template>

<script setup lang="ts">

import { OpenSettingsPayload } from '../types/index'
import { ref, onMounted, onUnmounted, watch, nextTick, PropType } from 'vue'
import { t } from '../services/i18n'
import SettingsTab from '../settings/SettingsTab.vue'
import SettingsGeneral from '../settings/SettingsGeneral.vue'
import SettingsAppearance from '../settings/SettingsAppearance.vue'
import SettingsCommands from '../settings/SettingsCommands.vue'
import SettingsExperts from '../settings/SettingsExperts.vue'
import SettingsShortcuts from '../settings/SettingsShortcuts.vue'
import SettingsLLM from '../settings/SettingsLLM.vue'
import SettingsPlugins from '../settings/SettingsPlugins.vue'
import SettingsMcp from '../settings/SettingsMcp.vue'
import SettingsVoice from '../settings/SettingsVoice.vue'
import SettingsAdvanced from '../settings/SettingsAdvanced.vue'
import WIconMcp from '../../assets/mcp.svg?component'
import { installTabs, showActiveTab } from '../composables/tabs'

const props = defineProps({
  extra: {
    type: Object as PropType<OpenSettingsPayload>,
    default: {
      initialTab: 'general'
    }
  }
})

const tabs = ref<HTMLElement>(null)
const initialTab = ref('general')
const settingsGeneral = ref(null)
const settingsAppearance = ref(null)
const settingsLLM = ref(null)
const settingsPlugins = ref(null)
const settingsMcp = ref(null)
const settingsCommands = ref(null)
const settingsExperts = ref(null)
const settingsVoice = ref(null)
const settingsShortcuts = ref(null)
const settingsAdvanced = ref(null)

const settings = [
  settingsGeneral,
  settingsAppearance,
  settingsLLM,
  settingsPlugins,
  settingsMcp,
  settingsCommands,
  settingsExperts,
  settingsVoice,
  settingsShortcuts,
  settingsAdvanced
]

onMounted(async () => {

  // watch props for changes
  watch(() => props.extra, (params) => {
    if (params?.initialTab) {
      showTab(params.initialTab)
      if (params.initialTab === 'models' && params.engine) {
        settingsLLM.value?.load({ engine: params.engine })
      }
      if (params.initialTab === 'voice' && params.engine) {
        settingsVoice.value?.load({ engine: params.engine })
      }
    }
  }, { immediate: true })

  // reload
  window.api.on('file-modified', (file: string) => {
    if (file === 'settings') {
      for (const setting of settings) {
        setting.value.load()
      }
    }
  })

  // tabs
  installTabs(tabs.value)
  showActiveTab(tabs.value)

  // load
  onOpenSettings(props.extra)

})

onUnmounted(() => {
  window.api.off('show')
  window.api.off('file-modified')
})

const showTab = (tab: string) => {
  const el = document.querySelector<HTMLElement>(`.settings .tab.${tab} input`)
  if (el) {
    el.click()
  }
}

const onOpenSettings = (payload: OpenSettingsPayload) => {

  // load all panels
  for (const setting of settings) {
    setting.value?.load(payload)
  }

  // show
  showActiveTab(tabs.value)

  // show initial tab
  nextTick(() => {
    if (payload?.initialTab) {
      showTab(payload.initialTab)
    }
  })

}

const load = (tab: any) => {
  tab.load()
}

</script>

<style scoped>
@import '../../css/panel-content.css';
@import '../../css/form.css';
</style>

<style>
@import '../../css/settings.css';
</style>
