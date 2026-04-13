import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#EBEBEB] mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-[#333] mb-3 text-sm">Acerca de</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm text-[#666] hover:text-[#E8640B]">Quiénes somos</Link></li>
              <li><Link href="#" className="text-sm text-[#666] hover:text-[#E8640B]">Cómo compramos</Link></li>
              <li><Link href="#" className="text-sm text-[#666] hover:text-[#E8640B]">Noticias</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-[#333] mb-3 text-sm">Ayuda</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm text-[#666] hover:text-[#E8640B]">Centro de ayuda</Link></li>
              <li><Link href="#" className="text-sm text-[#666] hover:text-[#E8640B]">Comprar</Link></li>
              <li><Link href="#" className="text-sm text-[#666] hover:text-[#E8640B]">Resolución de problemas</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-[#333] mb-3 text-sm">Medios de pago</h3>
            <ul className="space-y-2">
              <li><span className="text-sm text-[#666]">MercadoPago</span></li>
              <li><span className="text-sm text-[#666]">Tarjeta de crédito</span></li>
              <li><span className="text-sm text-[#666]">Transferencia</span></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-[#333] mb-3 text-sm">Redes sociales</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm text-[#666] hover:text-[#E8640B]">Instagram</Link></li>
              <li><Link href="#" className="text-sm text-[#666] hover:text-[#E8640B]">Facebook</Link></li>
              <li><Link href="#" className="text-sm text-[#666] hover:text-[#E8640B]">WhatsApp</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#EBEBEB] mt-8 pt-6 text-center">
          <p className="text-xs text-[#999]">© 2026 Trifixstore. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
