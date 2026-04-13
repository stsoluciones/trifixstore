import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#EDEDEE] flex flex-col">
      <div className="bg-[#E8640B] py-4 px-6">
        <Link href="/" className="text-white font-bold text-xl tracking-tight">
          trifixstore
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        {children}
      </div>
    </div>
  )
}
