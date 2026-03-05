import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // ກວດຫາ Cookie ທີ່ຊື່ວ່າ 'token'
  const token = request.cookies.get('token')?.value

  const isLoginPage = request.nextUrl.pathname.startsWith('/login')

  // ຖ້າບໍ່ມີ Token ແຕ່ຈະເຂົ້າໜ້າ Dashboard => ດີດໄປ Login
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ຖ້າມີ Token ແລ້ວ ແຕ່ຈະເຂົ້າໜ້າ Login => ດີດໄປ Dashboard (ຫນ້າ "/")
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}