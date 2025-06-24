const notas = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
let tonalidadActual = "C";
let compasSeleccionado = null;
let contenedorActivo = null;

function agregarSeccion() {
  const nombre = prompt("Nombre de la sección:");
  if (!nombre) return;

  const secciones = document.getElementById("secciones");

  const divSeccion = document.createElement("div");
  divSeccion.className = "seccion";

  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "center";

  const titulo = document.createElement("h3");
  titulo.textContent = nombre;

  const btnEliminar = document.createElement("button");
  btnEliminar.textContent = "🗑️ Eliminar sección";
  btnEliminar.className = "eliminar-seccion";
  btnEliminar.onclick = () => {
    if (confirm("¿Eliminar esta sección?")) {
      const wrapper = header.parentElement;
      const siguiente = wrapper.nextElementSibling;
      if (siguiente?.classList.contains("agregar-compas-wrapper")) siguiente.remove();
      wrapper.remove();
    }
  };

  header.appendChild(titulo);
  header.appendChild(btnEliminar);
  divSeccion.appendChild(header);

  const contenedor = document.createElement("div");
  contenedor.className = "compases-container";
  divSeccion.appendChild(contenedor);
  contenedorActivo = contenedor;

  secciones.appendChild(divSeccion);

  const wrapper = document.createElement("div");
  wrapper.className = "agregar-compas-wrapper";

  const botonAgregar = document.createElement("button");
  botonAgregar.textContent = "+ Agregar compás";
  botonAgregar.className = "btnAgregarCompas";
  botonAgregar.onclick = () => agregarCompas(contenedor);
  wrapper.appendChild(botonAgregar);
  secciones.appendChild(wrapper);

  agregarCompas(contenedor);
}

function agregarCompas(contenedor, texto = "") {
  const numero = contarCompases(contenedor) + 1;

  const div = document.createElement("div");
  div.className = "compas";
  div.dataset.compas = numero;
  div.setAttribute("draggable", true);

  const numeroSpan = document.createElement("span");
  numeroSpan.className = "numero";
  numeroSpan.textContent = numero;

  const editable = document.createElement("div");
  editable.className = "editable";
  editable.contentEditable = true;
  editable.innerText = texto;

  editable.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      agregarCompas(contenedor);
      setTimeout(() => {
        const nuevos = contenedor.querySelectorAll(".editable");
        nuevos[nuevos.length - 1].focus();
      }, 10);
    }
  });

  editable.addEventListener("focus", () => compasSeleccionado = div);

  div.appendChild(numeroSpan);
  div.appendChild(editable);
  contenedor.appendChild(div);

  agregarDragEvents(div, contenedor);
  actualizarNumeros(contenedor);
}

function contarCompases(contenedor) {
  return [...contenedor.children].filter(n => n.classList.contains("compas")).length;
}

function agregarFichaSimbolo(simboloTexto) {
  if (!contenedorActivo) return;

  const ficha = document.createElement("div");
  ficha.className = "ficha-simbolo";
  ficha.textContent = simboloTexto;
  ficha.setAttribute("draggable", true);

  contenedorActivo.appendChild(ficha);
  agregarDragEvents(ficha, contenedorActivo);
}

function insertarSimbolo(simbolo) {
  agregarFichaSimbolo(simbolo);
}

function insertarMetrica() {
  if (!contenedorActivo) return;

  const ficha = document.createElement("div");
  ficha.className = "ficha-simbolo";
  ficha.contentEditable = true;
  ficha.innerText = "4/4";
  ficha.style.userSelect = "text";
  contenedorActivo.appendChild(ficha);
  agregarDragEvents(ficha, contenedorActivo);
  ficha.focus();
}

function agregarDragEvents(el, contenedor) {
  el.addEventListener("dragstart", e => {
    el.classList.add("dragging");
    e.dataTransfer.setData("text/plain", "");
    contenedor._dragged = el;
  });

  el.addEventListener("dragend", () => {
    el.classList.remove("dragging");
    contenedor._dragged = null;
  });

  el.addEventListener("dragover", e => {
    e.preventDefault();
    const dragged = contenedor._dragged;
    if (dragged && dragged !== el) {
      contenedor.insertBefore(dragged, el);
      actualizarNumeros(contenedor);
    }
  });
}

function actualizarNumeros(contenedor) {
  let numero = 1;
  [...contenedor.children].forEach(n => {
    if (n.classList.contains("compas")) {
      const span = n.querySelector(".numero");
      if (span) span.textContent = numero++;
    }
  });
}

function transponer() {
  const origen = document.getElementById("tonalidadOriginal").value;
  const destino = document.getElementById("tonalidadDestino").value;
  const desplazamiento = (notas.indexOf(destino) - notas.indexOf(origen) + 12) % 12;
  const titulo = document.getElementById("titulo").value || "";
  document.getElementById("tituloResultado").textContent = `${titulo} – Versión en ${destino}`;
  tonalidadActual = destino;

  document.querySelectorAll(".compases-container").forEach(contenedor => {
    [...contenedor.children].forEach(nodo => {
      if (nodo.classList.contains("compas")) {
        const campo = nodo.querySelector(".editable");
        const texto = campo.innerText.trim();
        const acordes = texto.split(/\s+/);
        const transpuestos = acordes.map(acorde => {
          const match = acorde.match(/^([A-G][b#]?)(.*)$/);
          if (!match) return acorde;
          const nota = match[1];
          const resto = match[2];
          const i = notas.indexOf(nota);
          if (i === -1) return acorde;
          return notas[(i + desplazamiento) % 12] + resto;
        });
        campo.innerText = transpuestos.join(" ");
      }
    });
  });
}

function exportar() {
  window.print();
}

function mostrarContextMenu(x, y) {
  const menu = document.getElementById("context-menu");
  menu.style.top = `${y}px`;
  menu.style.left = `${x}px`;
  menu.style.display = "block";
}

document.addEventListener("click", () => {
  document.getElementById("context-menu").style.display = "none";
});

function duplicarCompas() {
  if (!compasSeleccionado) return;
  const contenedor = compasSeleccionado.parentElement;
  const nuevo = compasSeleccionado.cloneNode(true);
  contenedor.insertBefore(nuevo, compasSeleccionado.nextSibling);
  actualizarNumeros(contenedor);
  compasSeleccionado = null;
  document.getElementById("context-menu").style.display = "none";
}

function eliminarCompas() {
  if (!compasSeleccionado) return;
  const contenedor = compasSeleccionado.parentElement;
  contenedor.removeChild(compasSeleccionado);
  actualizarNumeros(contenedor);
  compasSeleccionado = null;
  document.getElementById("context-menu").style.display = "none";
}

function guardarProyecto() {
  const contenido = document.getElementById("secciones").innerHTML;
  localStorage.setItem("proyectoAcordes", contenido);
  alert("¡Proyecto guardado!");
}

function cargarProyectoLocalStorage() {
  const guardado = localStorage.getItem("proyectoAcordes");
  if (guardado) {
    document.getElementById("secciones").innerHTML = guardado;
  }
}



document.getElementById("btnAgregarSeccion").onclick = agregarSeccion;
document.addEventListener("contextmenu", function (e) {
    const compas = e.target.closest(".compas");
    if (compas) {
      e.preventDefault();
      compasSeleccionado = compas;
      mostrarContextMenu(e.pageX, e.pageY);
    }
  });
  function descargarProyecto() {
    const contenido = document.getElementById("secciones").innerHTML;
    const blob = new Blob([contenido], { type: "text/plain;charset=utf-8" });
    const enlace = document.createElement("a");
    enlace.href = URL.createObjectURL(blob);
    enlace.download = "proyecto-acordes.txt";
    enlace.click();
  }
  
  function cargarDesdeArchivo(event) {
    const archivo = event.target.files[0];
    if (!archivo) return;
  
    const lector = new FileReader();
    lector.onload = function (e) {
      document.getElementById("secciones").innerHTML = e.target.result;
    };
    lector.readAsText(archivo);
  }