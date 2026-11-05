/* eslint-disable no-undef */
import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, inicializarProductos } from "./db/db";
import Producto from "./components/Producto";
import "./App.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ProductoForm from "./components/ProductoForm";

inicializarProductos();

export default function App() {
  const productos = useLiveQuery(() => db.productos.toArray(), [], []);
  const [categoria, setCategoria] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("nombre");
  const [disponibilidad, setDisponibilidad] = useState("todos");

  const [formAbierto, setFormAbierto] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);

  const categorias = ["Todos", ...new Set(productos.map((p) => p.categoria))];

  const descargarPDF = () => {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "letter",
    });

    const fecha = new Date().toLocaleDateString("es-MX");

    pdf.setFontSize(20);
    pdf.text("CATÁLOGO DE PRODUCTOS", 14, 18);

    pdf.setFontSize(10);
    pdf.text(`Actualizado: ${fecha}`, 14, 25);

    autoTable(pdf, {
      startY: 32,
      head: [["Producto", "Categoría", "Precio", "Estado", "Disponibilidad"]],

      body: productos.map((p) => [
        p.nombre,
        p.categoria,
        dinero(p.precio),
        estados[p.estado] || "—",
        p.disponibilidad === "disponible"
          ? "Disponible"
          : p.disponibilidad === "agotado"
            ? "Agotado"
            : "Bajo pedido",
      ]),

      theme: "grid",

      styles: {
        fontSize: 9,
        cellPadding: 3,
        overflow: "linebreak",
      },

      headStyles: {
        fillColor: [28, 45, 70],
        textColor: 255,
      },

      columnStyles: {
        0: { cellWidth: 55 },
        1: { cellWidth: 30 },
        2: { cellWidth: 25 },
        3: { cellWidth: 35 },
        4: { cellWidth: 35 },
      },

      margin: {
        left: 14,
        right: 14,
        bottom: 18,
      },

      didDrawPage: () => {
        const pagina = pdf.internal.getNumberOfPages();
        const alto = pdf.internal.pageSize.height;

        pdf.setFontSize(8);
        pdf.text(`Catálogo de productos | Página ${pagina}`, 14, alto - 8);
      },
    });

    pdf.save("catalogo-productos.pdf");
  };

  const guardarProducto = async (producto) => {
    if (producto.id) {
      await db.productos.put(producto);
    } else {
      await db.productos.add(producto);
    }

    setFormAbierto(false);
    setProductoEditar(null);
  };

  const filtrados = productos
    .filter((p) => {
      const coincideCategoria =
        categoria === "Todos" || p.categoria === categoria;

      const coincideBusqueda = p.nombre
        .toLowerCase()
        .includes(busqueda.toLowerCase());

      const coincideDisponibilidad =
        disponibilidad === "todos" || p.disponibilidad === disponibilidad;

      return coincideCategoria && coincideBusqueda && coincideDisponibilidad;
    })
    .sort((a, b) => {
      if (orden === "precio-asc") return a.precio - b.precio;
      if (orden === "precio-desc") return b.precio - a.precio;
      if (orden === "fecha") {
        return b.fechaActualizacion.localeCompare(a.fechaActualizacion);
      }
      return a.nombre.localeCompare(b.nombre, "es");
    });

  const eliminar = async (producto) => {
    if (confirm(`¿Eliminar ${producto.nombre}?`)) {
      await db.productos.delete(producto.id);
    }
  };

  return (
    <main className="app">
      <header className="encabezado">
        <span className="marca">CATÁLOGO</span>
        <h1>Productos</h1>
        <p>Encuentra lo que necesitas.</p>
        <button
          onClick={() => {
            setProductoEditar(null);
            setFormAbierto(true);
          }}
        >
          + Agregar producto
        </button>
      </header>

      <section className="herramientas">
        <input
          type="search"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <div className="categorias">
          {categorias.map((c) => (
            <button
              key={c}
              className={categoria === c ? "activa" : ""}
              onClick={() => setCategoria(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="filtros">
          <select value={orden} onChange={(e) => setOrden(e.target.value)}>
            <option value="nombre">Nombre A–Z</option>
            <option value="precio-asc">Precio: menor a mayor</option>
            <option value="precio-desc">Precio: mayor a menor</option>
            <option value="fecha">Más recientes</option>
          </select>

          <select
            value={disponibilidad}
            onChange={(e) => setDisponibilidad(e.target.value)}
          >
            <option value="todos">Toda disponibilidad</option>
            <option value="disponible">Disponible</option>
            <option value="agotado">Agotado</option>
            <option value="bajo-pedido">Bajo pedido</option>
          </select>
        </div>
        <button
    className="boton-pdf"
    onClick={descargarPDF}
  >
    Descargar catálogo PDF
  </button>
      </section>

      <p className="contador">{filtrados.length} productos</p>

      <section className="catalogo">
        {filtrados.map((producto) => (
          <Producto
            key={producto.id}
            producto={producto}
            onEditar={(producto) => {
              setProductoEditar(producto);
              setFormAbierto(true);
            }}
            onEliminar={eliminar}
          />
        ))}
      </section>

      {formAbierto && (
        <div className="modal">
          <ProductoForm
            inicial={productoEditar}
            onGuardar={guardarProducto}
            onCerrar={() => {
              setFormAbierto(false);
              setProductoEditar(null);
            }}
          />
        </div>
      )}
    </main>
  );
}
