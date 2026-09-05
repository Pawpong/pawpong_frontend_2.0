# 포퐁 정적 점검 페이지

서비스 업데이트·점검 중 Vercel에 독립 배포하는 페이지입니다. Next.js 빌드나 API 연결 없이 `index.html`과 로컬 에셋만으로 동작합니다.

## 수정 위치

- 안내 문구: `index.html`의 `.notice`
- 오픈 일정: `.schedule time`의 표시 문구와 `datetime`을 함께 수정합니다. 한국 시간은 `+09:00`입니다.
- 예정 시간이 미정이면 `<time>`을 일반 문구로 교체하고 해당 영역의 스타일도 함께 맞춥니다.
- 제목·일정 폰트: Cafe24PROUP, 본문: Pretendard
- 색상: `:root`의 디자인 토큰. 프론트 `src/app/globals.css`와 일치하도록 유지합니다.
- 반응형: 모바일 기본 / 태블릿 768px / PC 1440px

일정은 안내용입니다. 시간이 지나도 서비스를 자동으로 재개하지 않습니다. 재개할 때는 준비된 서비스 배포에 도메인을 다시 연결합니다.

## 디자인 출처

- [2026-pawpong 디자인 시스템](https://www.figma.com/design/7VXGIjqr1eZBEmsp3OPNie/2026-pawpong?node-id=139-70)
- 제목체: Figma `742:66857`
- 고양이·픽셀 표지판: Figma 홈 카테고리 `3349:1763363`에서 내보낸 SVG
- 로고: 프론트 `public/logo.svg`와 동일한 파일
- 폰트: 프론트 `public/fonts/`와 동일한 파일

정적 사이트를 단독 배포할 수 있도록 에셋을 `assets/`에 포함합니다. Figma 임시 다운로드 URL이나 서비스 서버에 의존하지 않습니다. 폰트·로고가 변경되면 원본과 이 디렉터리를 함께 갱신합니다.

## 로컬 확인

저장소 루트에서 실행합니다. Orca 환경에서는 Orca 관리 터미널에서 실행합니다.

```sh
python3 -m http.server 4180 --bind 127.0.0.1 --directory maintenance
```

`http://127.0.0.1:4180`에서 확인합니다. 320·375·767·768·1439·1440px 너비에서 줄바꿈, 가로 넘침, 폰트와 SVG 로딩을 확인합니다.

## Vercel 배포

기존 운영 프로젝트 `pawpong_frontend`에 **이 디렉터리만** 배포합니다. `vercel.json`은 정적 배포 설정, 모든 경로의 점검 페이지 처리, 캐시 및 검색 색인 방지를 포함합니다.

1. 현재 `pawpong.kr`의 배포 URL을 확인해 복구 대상으로 기록합니다.

   ```sh
   vercel inspect https://pawpong.kr --scope pawpongs-projects
   ```

2. 도메인을 전환하기 전에 정적 배포를 만듭니다.

   ```sh
   vercel deploy maintenance --project prj_Q3awQTfl1p8wUAtEHH81EJ2DO7SY --scope pawpongs-projects --prod --skip-domain --yes
   ```

3. 반환된 배포 URL에서 페이지와 `/assets/`의 폰트·이미지가 정상인지 확인합니다. 준비된 배포 URL로 아래의 `<deployment-url>`을 바꿉니다.

   ```sh
   vercel alias set <deployment-url> pawpong.kr --scope pawpongs-projects
   ```

4. `https://pawpong.kr`에서 문구와 모바일 표시를 확인합니다. 되돌릴 때는 같은 `alias set` 명령에 복구할 배포 URL을 지정합니다.
