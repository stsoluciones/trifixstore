/**
 * seed-mongodb.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Carga categorías y productos desde los JSON mock a MongoDB Atlas.
 *
 * Uso:
 *   node scripts/seed-mongodb.mjs
 *
 * Requiere .env con DATABASE_URL configurado.
 */

import { MongoClient } from 'mongodb'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createRequire } from 'module'

// Cargar .env sin dependencias externas
import { config } from 'dotenv'
config({ path: '.env' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const require = createRequire(import.meta.url)

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL no está definida en .env')
  process.exit(1)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

function normalizeImageUrl(url = '') {
  return url.includes('%20') ? url : url.replace(/ /g, '%20')
}

function adaptarProductoCeven(item, categoriaSlug, subcategoriaSlug) {
  const descripcionStripped = stripHtml(item.storedescription ?? '')
  const descripcion = descripcionStripped.length > 10
    ? descripcionStripped
    : item.displayname ?? item.storedisplayname2 ?? ''

  const imagenes = Array.isArray(item.itemimages_detail?.urls)
    ? item.itemimages_detail.urls.map(u => normalizeImageUrl(u.url)).filter(Boolean)
    : []

  const now = new Date()

  return {
    proveedorId: String(item.internalid),
    nombre: item.storedisplayname2 || item.displayname || item.itemid,
    descripcion,
    slug: (item.urlcomponent ?? String(item.internalid)).toLowerCase(),
    precio: item.onlinecustomerprice ?? 0,
    precioOriginal: undefined,
    imagenes,
    stock: item.quantityavailable ?? 0,
    activo: true,
    categoriaSlug,
    subcategoriaSlug,
    metadatos: {
      sku: item.itemid,
      marca: item.custitem_marca,
      precioFormateado: item.onlinecustomerprice_formatted,
    },
    creadoEn: now,
    actualizadoEn: now,
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const client = new MongoClient(DATABASE_URL)

  try {
    console.log('🔌 Conectando a MongoDB Atlas...')
    await client.connect()
    const db = client.db()

    // Leer JSON
    const categoriasPath = join(__dirname, '../src/shared/lib/ceven-categorias.json')
    const productosPath = join(__dirname, '../src/shared/lib/ceven-productos.json')

    const { categorias } = JSON.parse(readFileSync(categoriasPath, 'utf8'))
    const { items: productosRaw, meta } = JSON.parse(readFileSync(productosPath, 'utf8'))

    console.log(`📁 Categorías leídas: ${categorias.length}`)
    console.log(`📦 Productos leídos: ${productosRaw.length}`)

    // ── Índices ──────────────────────────────────────────────────────────────

    console.log('\n🗂️  Creando índices...')
    await Promise.all([
      db.collection('usuarios').createIndex({ firebaseUid: 1 }, { unique: true }),
      db.collection('usuarios').createIndex({ email: 1 }, { unique: true }),

      db.collection('categorias').createIndex({ slug: 1 }, { unique: true }),

      db.collection('productos').createIndex({ slug: 1 }, { unique: true }),
      db.collection('productos').createIndex({ proveedorId: 1 }, { unique: true }),
      db.collection('productos').createIndex({ categoriaSlug: 1 }),
      db.collection('productos').createIndex({ activo: 1 }),
      db.collection('productos').createIndex({ precio: 1 }),
      db.collection('productos').createIndex({ nombre: 'text', descripcion: 'text' }),

      db.collection('ordenes').createIndex({ usuarioId: 1 }),
      db.collection('ordenes').createIndex({ estado: 1 }),
      db.collection('ordenes').createIndex({ mpPagoId: 1 }, { sparse: true }),
      db.collection('ordenes').createIndex({ creadoEn: -1 }),
    ])
    console.log('✅ Índices creados')

    // ── Categorías ────────────────────────────────────────────────────────────

    console.log('\n📂 Insertando categorías...')
    let categoriasOk = 0

    for (const cat of categorias) {
      await db.collection('categorias').updateOne(
        { slug: cat.slug },
        { $set: cat },
        { upsert: true }
      )
      categoriasOk++
    }
    console.log(`✅ Categorías procesadas: ${categoriasOk}`)

    // ── Productos ─────────────────────────────────────────────────────────────

    console.log('\n📦 Insertando productos...')

    // Construir mapa slug → categoría para asignar categoriaSlug
    // Los productos vienen del JSON con un campo `category` o similar
    // En ceven-productos.json los items vienen con la categoria en meta.category
    const categoriaSlug = meta?.category?.toLowerCase?.() ?? 'computacion'

    let productosOk = 0
    let productosErr = 0

    for (const item of productosRaw) {
      try {
        const doc = adaptarProductoCeven(item, categoriaSlug)
        await db.collection('productos').updateOne(
          { proveedorId: doc.proveedorId },
          { $set: doc },
          { upsert: true }
        )
        productosOk++
      } catch (err) {
        console.error(`  ⚠️  Error en producto ${item.internalid}:`, err.message)
        productosErr++
      }
    }

    console.log(`✅ Productos insertados: ${productosOk}`)
    if (productosErr > 0) console.log(`⚠️  Productos con error: ${productosErr}`)

    // ── Resumen ───────────────────────────────────────────────────────────────

    const totalCategorias = await db.collection('categorias').countDocuments()
    const totalProductos = await db.collection('productos').countDocuments()

    console.log('\n─────────────────────────────────────────')
    console.log('🎉 Seed completado')
    console.log(`   Categorías en DB: ${totalCategorias}`)
    console.log(`   Productos en DB:  ${totalProductos}`)
    console.log('─────────────────────────────────────────')
  } catch (err) {
    console.error('❌ Error durante el seed:', err)
    process.exit(1)
  } finally {
    await client.close()
  }
}

main()
