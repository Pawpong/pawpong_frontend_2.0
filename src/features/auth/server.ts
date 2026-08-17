// 서버 전용 public API — next/headers 를 쓰므로 클라이언트 배럴(index.ts)과 분리한다.
// 클라이언트 컴포넌트에서 이 파일을 import 하면 Next 가 빌드 단계에서 막는다.
export * from './lib/requireRole'
