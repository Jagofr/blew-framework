class EnvironmentDetector {
get mode() {
if (typeof globalThis !== 'undefined' && globalThis.__APP_ENV__) {
return globalThis.__APP_ENV__ === 'production' ? 'production' : 'development';
}
if (
typeof process !== 'undefined' &&
process.env &&
process.env.NODE_ENV === 'production'
) {
return 'production';
}
return 'development';
}
isProd() {
return this.mode === 'production';
}
isDev() {
return this.mode === 'development';
}
}
export const ENV = new EnvironmentDetector();