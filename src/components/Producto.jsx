import { useRef } from "react";
// eslint-disable-next-line no-unused-vars
import html2canvas from "html2canvas";
import "./Producto.css";

const WHATSAPP = "2312585892"; // Cambia por tu número

const dinero = (precio) =>
  Number(precio).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });

const estados = {
  oferta: "OFERTA",
  bajo: "BAJÓ DE PRECIO",
  subio: "SUBIÓ DE PRECIO",
};

const disponibilidad = {
  disponible: "Disponible",
  agotado: "Agotado",
  "bajo-pedido": "Bajo pedido",
};

export default function Producto({ producto, onEditar, onEliminar }) {
  const ref = useRef(null);

  const cargarImagen = (src) => {
    return new Promise((resolve, reject) => {
      const imagen = new Image();

      imagen.onload = () => resolve(imagen);
      imagen.onerror = reject;
      imagen.src = src;
    });
  };

  const textoEnLineas = (ctx, texto, x, y, maxAncho, alturaLinea) => {
    const palabras = String(texto || "").split(" ");
    let linea = "";
    let posicionY = y;

    palabras.forEach((palabra) => {
      const prueba = linea ? `${linea} ${palabra}` : palabra;

      if (ctx.measureText(prueba).width > maxAncho && linea) {
        ctx.fillText(linea, x, posicionY);
        linea = palabra;
        posicionY += alturaLinea;
      } else {
        linea = prueba;
      }
    });

    if (linea) {
      ctx.fillText(linea, x, posicionY);
    }

    return posicionY;
  };

  const descargar = async () => {
    try {
      const canvas = document.createElement("canvas");

      // Formato vertical para compartir en WhatsApp
      canvas.width = 1080;
      canvas.height = 1350;

      const ctx = canvas.getContext("2d");

      // Fondo
      ctx.fillStyle = "#f3f5f8";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Tarjeta blanca
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(40, 40, 1000, 1270, 35);
      ctx.fill();

      // Encabezado
      ctx.fillStyle = "#3d245a";
      ctx.beginPath();
      ctx.roundRect(40, 40, 1000, 125, [35, 35, 0, 0]);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 36px Arial";
      ctx.textAlign = "center";
      ctx.fillText("DETALLES DEL PRODUCTO", 540, 115);

      // Categoría
      ctx.fillStyle = "#718096";
      ctx.font = "bold 26px Arial";
      ctx.fillText(String(producto.categoria || "").toUpperCase(), 540, 220);

      // Imagen del producto
      const imagen = await cargarImagen(producto.imagen);

      const area = {
        x: 100,
        y: 260,
        ancho: 880,
        alto: 570,
      };

      // Fondo del área de fotografía
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(area.x, area.y, area.ancho, area.alto);

      // Ajuste proporcional: nunca estira la fotografía
      const proporcion = Math.min(
        area.ancho / imagen.naturalWidth,
        area.alto / imagen.naturalHeight,
      );

      const anchoImagen = imagen.naturalWidth * proporcion;
      const altoImagen = imagen.naturalHeight * proporcion;

      const xImagen = area.x + (area.ancho - anchoImagen) / 2;
      const yImagen = area.y + (area.alto - altoImagen) / 2;

      ctx.drawImage(imagen, xImagen, yImagen, anchoImagen, altoImagen);

      // Nombre del producto
      ctx.fillStyle = "#243c5a";
      ctx.font = "bold 44px Arial";
      ctx.textAlign = "center";

      const ultimoRenglon = textoEnLineas(
        ctx,
        producto.nombre,
        540,
        900,
        880,
        55,
      );

      // Precio actual
      const posicionPrecio = Math.max(1000, ultimoRenglon + 100);

      ctx.fillStyle = "#16804a";
      ctx.font = "bold 68px Arial";
      ctx.fillText(dinero(producto.precio), 540, posicionPrecio);

      // Precio anterior
      let siguientePosicion = posicionPrecio + 55;

      if (
        producto.precioAnterior !== null &&
        producto.precioAnterior !== undefined &&
        producto.precioAnterior !== "" &&
        Number(producto.precioAnterior) > 0
      ) {
        ctx.font = "30px Arial";
        ctx.fillStyle = "#94a3b8";

        const precioAnterior = dinero(producto.precioAnterior);

        ctx.fillText(`Antes: ${precioAnterior}`, 540, siguientePosicion);

        // Línea de tachado
        const anchoTexto = ctx.measureText(`Antes: ${precioAnterior}`).width;

        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(540 - anchoTexto / 2, siguientePosicion - 10);
        ctx.lineTo(540 + anchoTexto / 2, siguientePosicion - 10);
        ctx.stroke();

        siguientePosicion += 55;
      }

      // Estado del precio debajo de los precios
      const estados = {
        oferta: "OFERTA",
        bajo: "BAJÓ DE PRECIO",
        subio: "SUBIÓ DE PRECIO",
      };

      if (producto.estado && estados[producto.estado]) {
        ctx.fillStyle = "#d97706";
        ctx.font = "bold 27px Arial";
        ctx.fillText(estados[producto.estado], 540, siguientePosicion);

        siguientePosicion += 55;
      }

      // Disponibilidad
      const disponibilidad = {
        disponible: "DISPONIBLE",
        agotado: "AGOTADO",
        "bajo-pedido": "BAJO PEDIDO",
      };

      ctx.fillStyle = "#475569";
      ctx.font = "bold 26px Arial";
      ctx.fillText(
        disponibilidad[producto.disponibilidad] || "",
        540,
        siguientePosicion,
      );

      // Descripción
      ctx.fillStyle = "#64748b";
      ctx.font = "22px Arial";

      textoEnLineas(
        ctx,
        producto.descripcion || "",
        540,
        siguientePosicion + 55,
        850,
        30,
      );

      /* // Fecha de actualización
    ctx.fillStyle = "#94a3b8";
    ctx.font = "19px Arial";
    ctx.fillText(
      `Actualizado: ${producto.fechaActualizacion || ""}`,
      540,
      1230
    ); */

      // Franja inferior con bordes redondeados
      ctx.fillStyle = "#3d245a";
      ctx.beginPath();
      ctx.roundRect(40, 1250, 1000, 95, [0, 0, 35, 35]);
      ctx.fill();

      // Copyright
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 26px Arial";
      ctx.textAlign = "center";

      ctx.fillText("@el.joyboy.de.chignautla", 540, 1300);

      // Descargar
      const enlace = document.createElement("a");

      enlace.download = `${producto.nombre}.png`;
      enlace.href = canvas.toDataURL("image/png");
      enlace.click();
    } catch (error) {
      console.error("Error al generar la imagen:", error);
      alert("No fue posible generar la imagen del producto.");
    }
  };

  const consultarWhatsApp = () => {
    const mensaje = [
      "Hola, quisiera información sobre:",
      producto.nombre,
      `Precio: ${dinero(producto.precio)}`,
      `Disponibilidad: ${disponibilidad[producto.disponibilidad]}`,
    ].join("\n");

    window.open(
      `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <article className="producto" ref={ref} data-producto-id={producto.id}>
      <div className="producto-imagen">
        <img src={producto.imagen} alt={producto.nombre} />
      </div>

      <div className="producto-contenido">
        <span className="producto-categoria">{producto.categoria}</span>

        <h3>{producto.nombre}</h3>

        <p className="producto-descripcion">{producto.descripcion}</p>

        <table className="producto-tabla">
          <tbody>
            <tr>
              <th>Precio</th>
              <td>{dinero(producto.precio)}</td>
            </tr>

            {producto.precioAnterior != null && (
              <tr>
                <th>Precio anterior</th>
                <td className="precio-anterior">
                  {dinero(producto.precioAnterior)}
                </td>
              </tr>
            )}

            {producto.estado && (
              <tr>
                <th>Estado</th>
                <td>
                  <span className={`estado ${producto.estado}`}>
                    {estados[producto.estado]}
                  </span>
                </td>
              </tr>
            )}

            <tr>
              <th>Disponibilidad</th>
              <td>{disponibilidad[producto.disponibilidad]}</td>
            </tr>

            <tr>
              <th>Actualizado</th>
              <td>{producto.fechaActualizacion}</td>
            </tr>
          </tbody>
        </table>

        <div className="producto-acciones no-capturar">
          <button onClick={consultarWhatsApp}>Consultar por WhatsApp</button>

          <button onClick={descargar}>Descargar imagen</button>

          {onEditar && (
            <button onClick={() => onEditar(producto)}>Editar</button>
          )}

          {onEliminar && (
            <button onClick={() => onEliminar(producto)}>Eliminar</button>
          )}
        </div>
      </div>
    </article>
  );
}
