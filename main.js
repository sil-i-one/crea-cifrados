
let tonalidadOriginal = "C";
let tonalidadActual = "C";
let contadorCompas = 1;

const notas = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

document.getElementById("tonalidad-original").addEventListener("change", (e) => {
  tonalidadOriginal = e.target.value;
  tonalidadActual = tonalidadOriginal;
});

document.getElementById("tonalidad-destino").addEventListener("change", (e) => {
  const tonalidadDestino = e.target.value;
  const semitonos = calcularSemitonos(tonalidadOriginal, tonalidadDestino);
  transponerAcordes(semitonos);
  tonalidadActual = tonalidadDestino;
});

function calcularSemitonos(ton1, ton2) {
  const i1 = notas.indexOf(ton1);
  const i2 = notas.indexOf(ton2);
  return (i2 - i1 + 12) % 12;
}

function transponerAcordes(semitonos) {
  const compases = document.querySelectorAll(".compas");
  compases.forEach((div) => {
    let texto = div.innerText.trim();
    const numeroCompas = div.querySelector(".numero-compas");
    if (numeroCompas) texto = texto.replace(numeroCompas.textContent, "").trim();
    const acordes = texto.split(/\s+/).map(acorde => transponerAcorde(acorde, semitonos));
    div.innerHTML = "";
    if (numeroCompas) div.appendChild(numeroCompas);
    div.appendChild(document.createTextNode(acordes.join(" ")));
  });
}

function transponerAcorde(acorde, semitonos) {
  const regex = /^([A-G])(b|#)?(.*)$/;
  const match = acorde.match(regex);
  if (!match) return acorde;
  let nota = match[1];
  let alteracion = match[2] || "";
  let resto = match[3] || "";
  let notaBase = nota + alteracion;
  let i = notas.indexOf(notaBase);
  if (i === -1) {
    const bemoles = { "Db": "C#", "Eb": "D#", "Gb": "F#", "Ab": "G#", "Bb": "A#" };
    notaBase = bemoles[notaBase] || notaBase;
    i = notas.indexOf(notaBase);
    if (i === -1) return acorde;
  }
  const nuevaNota = notas[(i + semitonos) % 12];
  return nuevaNota + resto;
}

document.getElementById("agregar-seccion").addEventListener("click", () => {
  const seccion = document.createElement("div");
  seccion.className = "seccion";

  const titulo = document.createElement("h3");
  titulo.contentEditable = true;
  titulo.textContent = "Nombre de la sección";
  seccion.appendChild(titulo);

  const contenedorCompases = document.createElement("div");
  contenedorCompases.className = "compas-container";

  seccion.appendChild(contenedorCompases);
  document.getElementById("lienzo").appendChild(seccion);

  agregarCompas(contenedorCompases);

  const eliminarBtn = document.createElement("button");
  eliminarBtn.className = "eliminar-seccion-btn";
  eliminarBtn.textContent = "Eliminar sección";
  eliminarBtn.addEventListener("click", () => {
    seccion.remove();
  });
  seccion.appendChild(eliminarBtn);
});

function agregarCompas(contenedor) {
  const div = document.createElement("div");
  div.className = "compas";
  div.contentEditable = true;

  const numero = document.createElement("span");
  numero.className = "numero-compas";
  numero.textContent = contadorCompas++;
  div.appendChild(numero);

  div.setAttribute("draggable", "true");

  div.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", null);
    div.classList.add("dragging");
  });

  div.addEventListener("dragend", () => {
    div.classList.remove("dragging");
  });

  div.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    const menu = document.createElement("div");
    menu.className = "context-menu";
    menu.style.top = e.pageY + "px";
    menu.style.left = e.pageX + "px";

    const duplicar = document.createElement("div");
    duplicar.textContent = "Duplicar compás";
    duplicar.onclick = () => {
      const nuevo = div.cloneNode(true);
      nuevo.querySelector(".numero-compas").textContent = contadorCompas++;
      contenedor.insertBefore(nuevo, div.nextSibling);
      document.body.removeChild(menu);
    };

    const eliminar = document.createElement("div");
    eliminar.textContent = "Eliminar compás";
    eliminar.onclick = () => {
      div.remove();
      document.body.removeChild(menu);
    };

    menu.appendChild(duplicar);
    menu.appendChild(eliminar);
    document.body.appendChild(menu);

    document.addEventListener("click", () => {
      if (document.body.contains(menu)) menu.remove();
    }, { once: true });
  });

  div.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      agregarCompas(contenedor);
    }
  });

  contenedor.appendChild(div);
}

document.addEventListener("dragover", (e) => {
  e.preventDefault();
  const dragging = document.querySelector(".dragging");
  const afterElement = getDragAfterElement(e.clientX);
  const container = dragging.parentElement;
  if (afterElement == null) {
    container.appendChild(dragging);
  } else {
    container.insertBefore(dragging, afterElement);
  }
});

function getDragAfterElement(x) {
  const elements = [...document.querySelectorAll(".compas:not(.dragging)")];
  return elements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = x - box.left - box.width / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}
