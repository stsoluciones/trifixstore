'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

const CATEGORIAS = [
  { slug: 'tecnologia',       nombre: 'Tecnología' },
  { slug: 'tv-y-audio',       nombre: 'TV y Audio' },
  { slug: 'electrodomesticos', nombre: 'Electrodomésticos' },
  { slug: 'hogar',            nombre: 'Hogar' },
]

interface Props {
  categoriaActiva?: string
}

export default function ProductFilters({ categoriaActiva }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString())
    if (value === null) {
      next.delete(key)
    } else {
      next.set(key, value)
    }
    router.push(`${pathname}?${next.toString()}`)
  }

  const soloStock = params.get('stock') === '1'
  const orden = params.get('orden') ?? 'relevancia'

  return (
    <aside className="w-full">
      {/* Categorías — solo en /productos */}
      {!categoriaActiva && (
        <div className="bg-white rounded-sm border border-[#EBEBEB] p-4 mb-3">
          <h3 className="text-sm font-semibold text-[#333] mb-3">Categoría</h3>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => setParam('categoria', null)}
                className={`text-sm w-full text-left py-1 transition-colors ${
                  !params.get('categoria') ? 'text-[#E8640B] font-semibold' : 'text-[#333] hover:text-[#E8640B]'
                }`}
              >
                Todas las categorías
              </button>
            </li>
            {CATEGORIAS.map(cat => (
              <li key={cat.slug}>
                <button
                  onClick={() => setParam('categoria', cat.slug)}
                  className={`text-sm w-full text-left py-1 transition-colors ${
                    params.get('categoria') === cat.slug
                      ? 'text-[#E8640B] font-semibold'
                      : 'text-[#333] hover:text-[#E8640B]'
                  }`}
                >
                  {cat.nombre}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Ordenar */}
      <div className="bg-white rounded-sm border border-[#EBEBEB] p-4 mb-3">
        <h3 className="text-sm font-semibold text-[#333] mb-3">Ordenar por</h3>
        <ul className="space-y-1">
          {[
            { value: 'relevancia',   label: 'Relevancia' },
            { value: 'precio-asc',  label: 'Menor precio' },
            { value: 'precio-desc', label: 'Mayor precio' },
            { value: 'descuento',   label: 'Mayor descuento' },
          ].map(op => (
            <li key={op.value}>
              <button
                onClick={() => setParam('orden', op.value)}
                className={`text-sm w-full text-left py-1 transition-colors ${
                  orden === op.value ? 'text-[#E8640B] font-semibold' : 'text-[#333] hover:text-[#E8640B]'
                }`}
              >
                {op.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Disponibilidad */}
      <div className="bg-white rounded-sm border border-[#EBEBEB] p-4">
        <h3 className="text-sm font-semibold text-[#333] mb-3">Disponibilidad</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={soloStock}
            onChange={e => setParam('stock', e.target.checked ? '1' : null)}
            className="accent-[#E8640B]"
          />
          <span className="text-sm text-[#333]">Solo con stock</span>
        </label>
      </div>
    </aside>
  )
}
