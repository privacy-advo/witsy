
import { Configuration, EngineConfig } from '../types/config'
import { GetChatEnginesOpts } from '../types/llm'
import LlmManagerBase from './base'
import * as llm from 'multi-llm-ts'
import Witsy from './witsy'

export default class LlmManager extends LlmManagerBase {

  constructor(config: Configuration) {
    super(config)
  }

  supportsFavorites(): boolean {
    return false
  }
  
  getStandardEngines = (): string[] => {
    if (this.config.engines.witsy?.models?.chat?.length) {
      const engines = this.config.engines.witsy.models.chat.map((model) => {
        return model.id.split('___')[0]
      })
      return [...new Set(engines)].sort()
     } else {
      return [ 'witsy' ]
    }
  }

  getPriorityEngines = (): string[] => {
    return [ 'witsy' ]
  }

  getNonChatEngines = (): string[] => {
    return [
      ...[ 'openai', 'anthropic', 'google', 'xai', 'ollama', 'mistralai', 'deepseek', 'openrouter', 'groq', 'cerebras' ],
      ...[ 'huggingface', 'replicate', 'elevenlabs', 'sdwebui', 'falai', 'gladia' ]
    ]
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getChatEngines = (opts?: GetChatEnginesOpts): string[] => {
    const engines = [...new Set(this.config.engines.witsy?.models?.chat?.map((model) => {
      return model.id.split('-')[0]
    }) || []).values()].sort()
    console.log('Chat engines', engines)
    return engines
  }

  isEngineConfigured = (engine: string): boolean => {
    if (engine === 'witsy') return Witsy.isConfigured(this.config.engines.witsy)
    return true
  }  
  
  isEngineReady = (engine: string): boolean => {
    if (engine === 'witsy') return Witsy.isReady(this.config.engines.witsy, this.config.engines.witsy?.models)
    return true
  }

  getChatModels = (engine: string): llm.Model[] => {
    return this.config.engines.witsy?.models?.chat?.filter((model) => model.id.startsWith(`${engine}-`)).map((m) => {
      console.log(m)
      //m.id = m.id.split('___')[1]
      return m
    }) || []
  }
  
  igniteEngine = (engine: string): llm.LlmEngine => {

    try {

      // super
      if (this.isFavoriteEngine(engine)) {
        return this.igniteFavoriteEngine(engine)
      } else if (this.isCustomEngine(engine)) {
        return this.igniteCustomEngine(engine)
      }

    } catch { /* empty */ }

    // fallback
    console.warn(`Engine ${engine} unknown. Falling back to Witsy`)
    return new Witsy(this.config.engines.witsy)

  }
  
  loadModels = async (engine: string): Promise<boolean> => {

    // if (this.isCustomEngine(engine)) {
    //   return this.loadModelsCustom(engine)
    // }
    
    console.log('Loading models for', engine)
    let models: llm.ModelsList|null = null
    if (engine === 'witsy') {
      models = await this.loadWitsyModels(this.config.engines.witsy)
    }

    // save
    return this.saveModels(engine, models)
    
  }

  loadWitsyModels = async (config: EngineConfig): Promise<llm.ModelsList|null> => {

    const witsy = new Witsy(config)
    const models = await witsy.getModels()
    return {
      chat: models,
      image: [],
      video: [],
      embedding: [],
      realtime: [],
      computer: [],
      tts: [],
      stt: [],
    }

  }

  getValidModelId = (engineConfig: EngineConfig, type: string, modelId: string) => {
    const models: llm.Model[] = engineConfig?.models?.[type as keyof typeof engineConfig.models]
    const m = models?.find(m => m.id == modelId)
    return m ? modelId : (models?.[0]?.id || null)
  }

}

