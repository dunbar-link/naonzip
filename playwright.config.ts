import { defineConfig, devices } from '@playwright/test'

// 로컬 전용 테스트 포트 — 기존 dev 서버(3000)·임시 진단 서버(3100)와 충돌하지 않도록 분리.
// Playwright webServer가 이 포트로 직접 dev 서버를 시작하고, 테스트 종료 후 직접 정리한다.
const TEST_PORT = 3247

// PLAYWRIGHT_BASE_URL 이 있으면 운영 URL 읽기 전용 테스트(로컬 서버 미기동).
const isRemote = Boolean(process.env.PLAYWRIGHT_BASE_URL)
// host는 localhost 사용 — Next 16 dev 의 allowedDevOrigins 가 127.0.0.1 을 cross-origin 으로
// 차단(HMR/RSC)하는 것을 피한다. (앱 next.config 는 수정하지 않는다)
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${TEST_PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0, // 로컬은 retry 없음 — flaky 를 retry 로 숨기지 않는다.
  reporter: [['html', { open: 'never' }], ['list']],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  // 운영 URL 테스트 시에는 로컬 dev 서버를 시작하지 않는다.
  // 로컬 테스트 시에만 전용 포트로 기존 dev 명령(next dev)을 PORT 지정해 기동.
  webServer: isRemote
    ? undefined
    : {
        command: 'npm run dev',
        env: { PORT: String(TEST_PORT) },
        url: baseURL,
        reuseExistingServer: false, // 기존 서버 재사용/종료하지 않고 자기 서버만 운용
        timeout: 120_000,
      },
})
