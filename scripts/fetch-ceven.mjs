/**
 * fetch-ceven.mjs
 * ---------------
 * Descarga el catálogo completo de Ceven y guarda los productos en:
 *   src/shared/lib/ceven-productos.json
 *
 * Uso:
 *   node scripts/fetch-ceven.mjs
 *
 * Requiere Node.js 18+ (fetch nativo).
 */

import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = join(__dirname, '../src/shared/lib/ceven-productos.json')

const BASE_URL = 'https://www.ceven.com/api/items'
const PARAMS = {
  country: 'AR',
  currency: 'ARS',
  language: 'es',
  pricelevel: '32',
  fieldset: 'details',
  limit: '50',
}

// Campos que nos interesan (descarta ruido de la respuesta)
const CAMPOS = [
  'internalid',
  'itemid',
  'displayname',
  'storedisplayname2',
  'custitem_marca',
  'onlinecustomerprice',
  'onlinecustomerprice_formatted',
  'quantityavailable',
  'isinstock',
  'ispurchasable',
  'ispricevisible',
  'urlcomponent',
  'itemimages_detail',
  'storedescription',
  'storedetaileddescription',
  'stockdescription',
  'isbackorderable',
  'outofstockmessage',
  'itemtype',
  'pagetitle',
  'pricelevel32',
  'pricelevel32_formatted',
]

function filtrarCampos(item) {
  return Object.fromEntries(
    CAMPOS.filter(k => k in item).map(k => [k, item[k]])
  )
}

async function fetchPagina(offset) {
  const url = new URL(BASE_URL)
  Object.entries({ ...PARAMS, offset: String(offset) }).forEach(([k, v]) =>
    url.searchParams.set(k, v)
  )

  const res = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0',
    },
  })

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} en offset ${offset}`)
  }

  return res.json()
}

async function main() {
  console.log('Iniciando descarga del catálogo Ceven...')
  console.log(`Output: ${OUTPUT_PATH}\n`)

  // Primera página para saber el total
  const primera = await fetchPagina(0)
  const total = primera.total
  const items = primera.items.map(filtrarCampos)

  console.log(`Total de productos: ${total}`)
  console.log(`Página 1/${Math.ceil(total / 50)} — ${items.length} productos`)

  const limit = parseInt(PARAMS.limit, 10)
  const paginas = Math.ceil(total / limit)

  for (let i = 1; i < paginas; i++) {
    const offset = i * limit
    try {
      const data = await fetchPagina(offset)
      const nuevos = data.items.map(filtrarCampos)
      items.push(...nuevos)
      console.log(`Página ${i + 1}/${paginas} — ${nuevos.length} productos (total acumulado: ${items.length})`)
      // Pequeña pausa para no saturar la API
      await new Promise(r => setTimeout(r, 300))
    } catch (err) {
      console.error(`Error en página ${i + 1}:`, err.message)
    }
  }

  const output = {
    fetchedAt: new Date().toISOString(),
    source: 'https://www.ceven.com/api/items',
    total: items.length,
    items,
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8')
  console.log(`\n✓ ${items.length} productos guardados en ${OUTPUT_PATH}`)
}

main().catch(err => {
  console.error('Error fatal:', err)
  process.exit(1)
})
