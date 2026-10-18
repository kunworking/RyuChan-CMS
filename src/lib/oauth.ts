// OAuth flow helper
import { CMS_CONFIG } from '@/config'

// 生成随机字符串
function generateRandomString(length: number): string {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => ('0' + byte.toString(16)).slice(-2)).join('')
}

// 跳转到 GitHub OAuth 授权页
export async function redirectToGitHubOAuth(): Promise<void> {
  const state = generateRandomString(16)

  // 存储 state 用于回调验证
  sessionStorage.setItem('oauth_state', state)

  const params = new URLSearchParams({
    client_id: CMS_CONFIG.GITHUB_CLIENT_ID,
    redirect_uri: CMS_CONFIG.OAUTH_PROXY_URL + '/callback',
    scope: 'repo',
    state,
  })

  window.location.href = 'https://github.com/login/oauth/authorize?' + params.toString()
}

// 解析 OAuth 回调的 hash
export function parseOAuthCallback(): { accessToken: string; error?: string } | null {
  const hash = window.location.hash.substring(1)
  const params = new URLSearchParams(hash)
  const accessToken = params.get('access_token')
  const error = params.get('error')

  if (error) {
    return { accessToken: '', error }
  }

  if (accessToken) {
    // 清除 URL hash
    window.history.replaceState(null, '', window.location.pathname)
    return { accessToken }
  }

  return null
}

// 获取存储的 token
export function getStoredToken(): string | null {
  return sessionStorage.getItem('github_token')
}

// 存储 token
export function storeToken(token: string): void {
  sessionStorage.setItem('github_token', token)
}

// 清除 token
export function clearToken(): void {
  sessionStorage.removeItem('github_token')
  sessionStorage.removeItem('oauth_state')
}
