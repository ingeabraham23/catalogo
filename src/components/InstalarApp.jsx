import { useEffect, useState } from "react";
import "./InstalarApp.css";

export default function InstalarApp() {
  const [eventoInstalacion, setEventoInstalacion] = useState(null);
  const [instalada, setInstalada] = useState(false);

  useEffect(() => {
    // Detectar si ya está instalada
    const comprobarInstalacion = () => {
      const esStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;

      setInstalada(esStandalone);
    };

    comprobarInstalacion();

    // Detectar cuándo el navegador permite instalar
    const manejarInstalacion = (event) => {
      event.preventDefault();
      setEventoInstalacion(event);
    };

    const manejarInstalada = () => {
      setInstalada(true);
      setEventoInstalacion(null);
    };

    window.addEventListener(
      "beforeinstallprompt",
      manejarInstalacion
    );

    window.addEventListener(
      "appinstalled",
      manejarInstalada
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        manejarInstalacion
      );

      window.removeEventListener(
        "appinstalled",
        manejarInstalada
      );
    };
  }, []);

  async function instalarApp() {
    if (!eventoInstalacion) return;

    await eventoInstalacion.prompt();

    const resultado = await eventoInstalacion.userChoice;

    if (resultado.outcome === "accepted") {
      setInstalada(true);
    }

    setEventoInstalacion(null);
  }

  if (instalada || !eventoInstalacion) {
    return null;
  }

  return (
    <button
      className="button-app"
      onClick={instalarApp}
    >
      Instalar aplicación
    </button>
  );
}
