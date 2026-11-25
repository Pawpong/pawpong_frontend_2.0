/**
 * 포퐁 앱(RN 웹뷰)이 UA 에 붙이는 표시 → <html> data 속성. 이 목록 한 곳에서만 정한다.
 * 루트 레이아웃의 첫 페인트 스크립트와 AppFlagBridge(하이드레이션 복구)가 같은 목록을 쓴다.
 * - PawpongApp/   → data-app          (앱 전용 숨김·모양: in-data-app:)
 * - PawpongTabs/  → data-native-tabs  (앱이 하단 탭 바를 그림: in-data-native-tabs:, hasNativeTabBar)
 * - PawpongStack/ → data-native-stack (상세를 새 화면으로 쌓음: hasNativeStack)
 */
export const APP_UA_FLAGS = [
  ['PawpongApp/', 'app'],
  ['PawpongTabs/', 'nativeTabs'],
  ['PawpongStack/', 'nativeStack'],
] as const

/** 첫 페인트 전 인라인 스크립트용 — 위 목록 그대로 dataset 에 붙인다 */
export const APP_FLAGS_SCRIPT = `var u=navigator.userAgent,d=document.documentElement.dataset;${APP_UA_FLAGS.map(
  ([marker, key]) => `if(u.indexOf('${marker}')>-1)d.${key}='';`,
).join('')}`
