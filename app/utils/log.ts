const isDev = process.env.NODE_ENV !== 'production'

export const devLog = {
  error: isDev ? console.error.bind(console) : () => {},
  warn:  isDev ? console.warn.bind(console)  : () => {},
}
