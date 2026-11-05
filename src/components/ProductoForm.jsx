
import { useState } from "react";

const base = import.meta.env.BASE_URL;

const nuevoProducto = {
  nombre: "",
  categoria: "",
  precio: "",
  precioAnterior: "",
  estado: "",
  disponibilidad: "disponible",
  imagen: `${base}productos/`,
  descripcion: "",
};

export default function ProductoForm({ inicial, onGuardar, onCerrar }) {
  const [form, setForm] = useState({
    ...nuevoProducto,
    ...inicial,
  });

  const cambiar = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const guardar = (e) => {
    e.preventDefault();

    onGuardar({
      ...form,
      precio: Number(form.precio),
      precioAnterior: form.precioAnterior
        ? Number(form.precioAnterior)
        : null,
      fechaActualizacion: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <form className="form-producto" onSubmit={guardar}>
      <h2>{inicial ? "Editar producto" : "Nuevo producto"}</h2>

      <label>
        Nombre
        <input
          name="nombre"
          value={form.nombre}
          onChange={cambiar}
          required
        />
      </label>

      <label>
        Categoría
        <input
          name="categoria"
          value={form.categoria}
          onChange={cambiar}
          placeholder="Luces, Audio..."
          required
        />
      </label>

      <label>
        Precio
        <input
          name="precio"
          type="number"
          min="0"
          step="0.01"
          value={form.precio}
          onChange={cambiar}
          required
        />
      </label>

      <label>
        Precio anterior
        <input
          name="precioAnterior"
          type="number"
          min="0"
          step="0.01"
          value={form.precioAnterior ?? ""}
          onChange={cambiar}
        />
      </label>

      <label>
        Ruta de imagen
        <input
          name="imagen"
          value={form.imagen}
          onChange={cambiar}
          placeholder={`${base}productos/led-01.jpg`}
          required
        />
      </label>

      <label>
        Descripción
        <textarea
          name="descripcion"
          value={form.descripcion}
          onChange={cambiar}
        />
      </label>

      <label>
        Estado del precio
        <select
          name="estado"
          value={form.estado}
          onChange={cambiar}
        >
          <option value="">Sin etiqueta</option>
          <option value="oferta">Oferta</option>
          <option value="bajo">Bajó de precio</option>
          <option value="subio">Subió de precio</option>
        </select>
      </label>

      <label>
        Disponibilidad
        <select
          name="disponibilidad"
          value={form.disponibilidad}
          onChange={cambiar}
        >
          <option value="disponible">Disponible</option>
          <option value="agotado">Agotado</option>
          <option value="bajo-pedido">Bajo pedido</option>
        </select>
      </label>

      <div className="form-acciones">
        <button type="submit">Guardar producto</button>
        <button type="button" onClick={onCerrar}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
