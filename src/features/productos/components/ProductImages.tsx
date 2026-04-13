'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Props {
  imagenes: string[]
  nombre: string
}

export default function ProductImages({ imagenes, nombre }: Props) {
  const [seleccionada, setSeleccionada] = useState(0)
  const lista = imagenes.length > 0 ? imagenes : ['https://placehold.co/600x600/ebebeb/999?text=Sin+imagen']

  return (
    <div className="flex flex-col gap-3">
      {/* Imagen principal */}
      <div className="relative aspect-square bg-white rounded-sm border border-[#EBEBEB] overflow-hidden">
        <Image
          src={lista[seleccionada]}
          alt={nombre}
          fill
          className="object-contain p-6"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Miniaturas */}
      {lista.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {lista.map((img, i) => (
            <button
              key={i}
              onClick={() => setSeleccionada(i)}
              className={`relative w-16 h-16 rounded-sm border-2 overflow-hidden bg-white transition-colors ${
                i === seleccionada ? 'border-[#E8640B]' : 'border-[#EBEBEB] hover:border-[#ccc]'
              }`}
            >
              <Image
                src={img}
                alt={`${nombre} ${i + 1}`}
                fill
                className="object-contain p-1"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
