
import Dexie from "dexie";

export const db = new Dexie("CatalogoDB");

db.version(1).stores({
  productos:
    "++id, nombre, categoria, precio, estado, disponibilidad, fechaActualizacion",
});

import { productosIniciales } from "../data/productosIniciales";

export async function inicializarProductos() {
  const cantidad = await db.productos.count();

  if (cantidad === 0) {
    await db.productos.bulkAdd(productosIniciales);
  }
}