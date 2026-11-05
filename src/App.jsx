import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, inicializarProductos } from "./db/db";
import Producto from "./components/Producto";
import "./App.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ProductoForm from "./components/ProductoForm";
import InstalarApp from "./components/InstalarApp";

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

  const descargarPDF = async () => {
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "letter",
      });

      const fecha = new Date().toLocaleDateString("es-MX");

      const dinero = (cantidad) =>
        new Intl.NumberFormat("es-MX", {
          style: "currency",
          currency: "MXN",
        }).format(Number(cantidad) || 0);

      const estados = {
        subio: "Subió de precio",
        bajo: "Bajó de precio",
        oferta: "Oferta",
        nuevo: "Nuevo",
        usado: "Usado",
      };

      // Convertir imagen a JPEG optimizado
      const cargarImagenPDF = (src) =>
        new Promise((resolve) => {
          if (!src) return resolve(null);

          const imagen = new Image();

          imagen.onload = () => {
            try {
              const canvas = document.createElement("canvas");

              // Resolución máxima
              const maxAncho = 300;
              const maxAlto = 300;

              const proporcion = Math.min(
                maxAncho / imagen.naturalWidth,
                maxAlto / imagen.naturalHeight,
                1,
              );

              canvas.width = Math.round(imagen.naturalWidth * proporcion);

              canvas.height = Math.round(imagen.naturalHeight * proporcion);

              const contexto = canvas.getContext("2d");

              contexto.fillStyle = "#FFFFFF";
              contexto.fillRect(0, 0, canvas.width, canvas.height);

              contexto.drawImage(imagen, 0, 0, canvas.width, canvas.height);

              resolve({
                data: canvas.toDataURL("image/jpeg", 0.65),
                width: canvas.width,
                height: canvas.height,
              });
            } catch {
              resolve(null);
            }
          };

          imagen.onerror = () => resolve(null);
          imagen.src = src;
        });

      const imagenes = await Promise.all(
        productos.map((p) => cargarImagenPDF(p.imagen)),
      );

      pdf.setFontSize(20);
      pdf.text("CATÁLOGO JOYVOLT AUTO", 14, 18);

      pdf.setFontSize(10);
      pdf.text(`Actualizado: ${fecha}`, 14, 25);

      autoTable(pdf, {
        startY: 32,

        head: [
          [
            "Foto",
            "Producto",
            "Categoría",
            "Precio",
            "Estado",
            "Disponibilidad",
          ],
        ],

        body: productos.map((p) => [
          "",
          p.nombre || "—",
          p.categoria || "—",
          dinero(p.precio),
          estados[p.estado] || p.estado || "—",
          p.disponibilidad === "disponible"
            ? "Disponible"
            : p.disponibilidad === "agotado"
              ? "Agotado"
              : "Bajo pedido",
        ]),

        theme: "grid",

        styles: {
          fontSize: 8,
          cellPadding: 3,
          overflow: "linebreak",
          valign: "middle",
        },

        headStyles: {
          fillColor: [28, 45, 70],
          textColor: 255,
        },

        columnStyles: {
          0: { cellWidth: 22, minCellHeight: 24 },
          1: { cellWidth: 45 },
          2: { cellWidth: 27 },
          3: { cellWidth: 22 },
          4: { cellWidth: 30 },
          5: { cellWidth: 32 },
        },

        // Evitar que una fila se divida entre páginas
        rowPageBreak: "avoid",

        margin: {
          left: 14,
          right: 14,
          bottom: 18,
        },

        didDrawCell: (data) => {
          if (data.section === "body" && data.column.index === 0) {
            const imagen = imagenes[data.row.index];

            if (imagen) {
              const maxAncho = 18;
              const maxAlto = 18;

              const proporcion = imagen.width / imagen.height;

              let ancho = maxAncho;
              let alto = ancho / proporcion;

              if (alto > maxAlto) {
                alto = maxAlto;
                ancho = alto * proporcion;
              }

              const x = data.cell.x + (data.cell.width - ancho) / 2;
              const y = data.cell.y + (data.cell.height - alto) / 2;

              pdf.addImage(imagen.data, "JPEG", x, y, ancho, alto);
            }
          }
        },

        didDrawPage: () => {
          const pagina = pdf.internal.getNumberOfPages();
          const alto = pdf.internal.pageSize.getHeight();

          pdf.setFontSize(8);
          pdf.text(`Catálogo de productos | Página ${pagina}`, 14, alto - 8);
        },
      });

      pdf.save("catalogo-productos.pdf");
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      alert("No se pudo generar el PDF. Revisa la consola.");
    }
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
        <button
          onClick={() => {
            setProductoEditar(null);
            setFormAbierto(true);
          }}
        >
          + Agregar producto
        </button>
        <InstalarApp />
      </header>

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
        <button className="boton-pdf" onClick={descargarPDF}>
          Descargar catálogo PDF
        </button>
      </section>
    </main>
  );
}
