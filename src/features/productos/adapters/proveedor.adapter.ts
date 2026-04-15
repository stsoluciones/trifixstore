import type { ProductoInterno } from '../types/producto.types'

// Adapter genérico — para cuando se integre la API real del proveedor
export function adaptarProducto(raw: unknown): ProductoInterno {
  const data = raw as Record<string, unknown>

  return {
    id: String(data.id ?? data.sku ?? data.codigo ?? ''),
    nombre: String(data.nombre ?? data.name ?? data.title ?? ''),
    descripcion: String(data.descripcion ?? data.description ?? ''),
    precio: Number(data.precio ?? data.price ?? 0),
    precioOriginal: data.precioOriginal != null ? Number(data.precioOriginal) : undefined,
    imagenes: Array.isArray(data.imagenes)
      ? (data.imagenes as string[])
      : Array.isArray(data.images)
        ? (data.images as string[])
        : [],
    categoriaId: String(data.categoriaId ?? data.category ?? ''),
    stock: Number(data.stock ?? data.quantity ?? 0),
    slug: String(data.slug ?? data.id ?? ''),
    activo: Boolean(data.activo ?? data.active ?? true),
    metadatos: data,
  }
}

// Tipo del item en el formato de la API de Ceven (NetSuite SCA)
interface CevenItem {
  internalid: number
  itemid: string
  displayname: string
  storedisplayname2: string
  storedescription: string
  custitem_marca: string
  urlcomponent: string
  onlinecustomerprice: number
  onlinecustomerprice_formatted: string
  quantityavailable: number
  isinstock: boolean
  showoutofstockmessage: boolean
  itemimages_detail: {
    urls: Array<{ url: string; altimagetext: string }>
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

function encodeImageUrl(url: string): string {
  // Encode espacios y caracteres especiales preservando el protocolo y slashes
  return url.replace(/ /g, '%20')
}

export function adaptarProductoCeven(item: CevenItem, categoriaId: string): ProductoInterno {
  const descripcionStripped = stripHtml(item.storedescription ?? '')
  const descripcion = descripcionStripped.length > 10
    ? descripcionStripped
    : item.displayname ?? item.storedisplayname2 ?? ''

  const imagenes = Array.isArray(item.itemimages_detail?.urls)
    ? item.itemimages_detail.urls.map(u => encodeImageUrl(u.url)).filter(Boolean)
    : []

  return {
    id: String(item.internalid),
    nombre: item.storedisplayname2 || item.displayname || item.itemid,
    descripcion,
    precio: item.onlinecustomerprice ?? 0,
    precioOriginal: undefined,
    imagenes,
    categoriaId,
    stock: item.quantityavailable ?? 0,
    slug: (item.urlcomponent ?? String(item.internalid)).toLowerCase(),
    activo: true,
    metadatos: {
      sku: item.itemid,
      marca: item.custitem_marca,
      precioFormateado: item.onlinecustomerprice_formatted,
    },
  }
}
