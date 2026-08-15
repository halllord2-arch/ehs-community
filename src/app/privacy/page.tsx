import Link from 'next/link'

export const metadata = {
  title: '개인정보처리방침 | EHS 커뮤니티',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="text-lg font-bold text-blue-700">EHS 커뮤니티</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">개인정보처리방침</h1>
        <p className="text-sm text-gray-500 mb-8">시행일: 2026년 8월 15일</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-8 text-sm text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">1. 개인정보의 수집 및 이용 목적</h2>
            <p>EHS 커뮤니티(이하 "서비스")는 다음의 목적으로 개인정보를 수집·이용합니다.</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-gray-600">
              <li>회원 가입 및 본인 확인</li>
              <li>서비스 이용 기록 관리 및 포인트·등급 부여</li>
              <li>위험요소 게시물 업로드 및 동료 검증 기능 제공</li>
              <li>비밀번호 재설정 등 서비스 운영 관련 공지</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">2. 수집하는 개인정보 항목</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-3 py-2 text-left font-medium">구분</th>
                    <th className="border border-gray-200 px-3 py-2 text-left font-medium">수집 항목</th>
                    <th className="border border-gray-200 px-3 py-2 text-left font-medium">필수 여부</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2">회원가입</td>
                    <td className="border border-gray-200 px-3 py-2">이메일, 비밀번호(암호화), 이름, 회사명, 직무, 경력, 담당 산업</td>
                    <td className="border border-gray-200 px-3 py-2">필수</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2">게시물 업로드</td>
                    <td className="border border-gray-200 px-3 py-2">업로드 이미지, 위험요소 설명, 산업 분야, 위험 유형</td>
                    <td className="border border-gray-200 px-3 py-2">필수</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2">서비스 이용</td>
                    <td className="border border-gray-200 px-3 py-2">접속 IP, 서비스 이용 기록, 포인트 거래 내역</td>
                    <td className="border border-gray-200 px-3 py-2">자동 수집</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-gray-500 text-xs">
              ※ 업로드 이미지에 개인정보(얼굴, 차량번호 등)가 포함되지 않도록 회원이 직접 비식별 처리해야 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">3. 개인정보의 보유 및 이용 기간</h2>
            <p>회원 탈퇴 시 지체 없이 파기합니다. 단, 관련 법령에 따라 아래 정보는 일정 기간 보관합니다.</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-gray-600">
              <li>서비스 이용 기록, 접속 로그: 3개월 (통신비밀보호법)</li>
              <li>소비자 불만 또는 분쟁 처리 기록: 3년 (전자상거래법)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">4. 개인정보의 제3자 제공</h2>
            <p>서비스는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 이용자의 동의가 있거나 법령에 따른 경우는 예외로 합니다.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">5. 개인정보 처리 위탁</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-3 py-2 text-left font-medium">수탁업체</th>
                    <th className="border border-gray-200 px-3 py-2 text-left font-medium">위탁 업무</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2">Supabase Inc.</td>
                    <td className="border border-gray-200 px-3 py-2">데이터베이스 및 인증 서비스 운영</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-3 py-2">Vercel Inc.</td>
                    <td className="border border-gray-200 px-3 py-2">웹 서버 호스팅</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">6. 정보주체의 권리</h2>
            <p>이용자는 언제든지 다음 권리를 행사할 수 있습니다.</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-gray-600">
              <li>개인정보 열람 요청</li>
              <li>개인정보 정정·삭제 요청</li>
              <li>개인정보 처리 정지 요청</li>
              <li>회원 탈퇴 (마이페이지에서 직접 처리 가능)</li>
            </ul>
            <p className="mt-2 text-gray-500">권리 행사는 아래 개인정보 보호책임자에게 이메일로 요청하시면 지체 없이 처리합니다.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">7. 개인정보의 파기</h2>
            <p>보유 기간이 경과하거나 목적이 달성된 개인정보는 지체 없이 파기합니다. 전자적 파일은 복구 불가능한 방법으로 영구 삭제하며, 출력물은 분쇄 또는 소각합니다.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">8. 쿠키(Cookie) 사용</h2>
            <p>서비스는 로그인 세션 유지를 위해 쿠키를 사용합니다. 브라우저 설정에서 쿠키 저장을 거부할 수 있으나, 이 경우 로그인 등 일부 서비스 이용이 제한될 수 있습니다.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">9. 개인정보 보호책임자</h2>
            <div className="bg-gray-50 rounded-lg p-4 text-gray-600">
              <p><span className="font-medium">책임자:</span> EHS 커뮤니티 운영자</p>
              <p className="mt-1"><span className="font-medium">이메일:</span> halllord2@gmail.com</p>
              <p className="mt-1 text-xs text-gray-400">개인정보 관련 문의, 열람·정정·삭제 요청은 위 이메일로 연락해 주시면 신속히 처리합니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">10. 개인정보처리방침 변경</h2>
            <p>본 방침은 법령·서비스 변경 시 개정될 수 있으며, 변경 시 서비스 내 공지를 통해 안내합니다. 현재 버전의 시행일은 페이지 상단에 명시되어 있습니다.</p>
          </section>

        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-blue-600 hover:underline">← 홈으로 돌아가기</Link>
        </div>
      </div>
    </div>
  )
}
