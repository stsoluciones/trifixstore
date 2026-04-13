export type EstadoOrden =
  | 'PENDIENTE_PAGO'
  | 'PAGADO'
  | 'ENVIADO_A_PROVEEDOR'
  | 'ERROR_PROVEEDOR'
  | 'EN_CAMINO'
  | 'ENTREGADO'

export interface PedidoProveedor {
  pedidoExternoId: string
  cliente: {
    nombre: string
    email: string
    telefono?: string
  }
  direccionEnvio: {
    calle: string
    ciudad: string
    provincia: string
    codigoPostal: string
    pais: string
  }
  items: Array<{
    productoId: string
    cantidad: number
    precioUnitario: number
  }>
}
