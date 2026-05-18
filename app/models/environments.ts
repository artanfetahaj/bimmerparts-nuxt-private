import type { ConfigValue } from './Config';

const environments: Environment[] = [
  {
    hostnames: ['localhost'],
    config: {
      APP_TITLE: import.meta.env.VITE_APP_TITLE || '',
      APP_VERSION: import.meta.env.VITE_APP_VERSION || '',
      APP_ENV: import.meta.env.VITE_APP_ENV || '',
      APP_PLATFORM: import.meta.env.VITE_APP_PLATFORM || '',

      APP_HOST_API: import.meta.env.VITE_APP_HOST_API,
      APP_HOST_RPC: import.meta.env.VITE_APP_HOST_RPC,
      APP_HOST_OAUTH: import.meta.env.VITE_APP_HOST_OAUTH,
      APP_LOCAL_STORAGE_TOKEN: import.meta.env.VITE_APP_LOCAL_STORAGE_TOKEN,
    },
  },
]

export default environments

export interface Environment {
  hostnames: string[]
  config: { [key: string]: ConfigValue }
}
