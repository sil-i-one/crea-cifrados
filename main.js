
let tonalidadBase = "";
let canvas = document.getElementById("canvas");
const notas = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

document.getElementById("keySelect").addEventListener("change", () => {
  tonalidadBase = document.getElementById("keySelect").value;
  if (tonalidadBase) {
    canvas.contentEditable = "true";
    canvas.innerHTML = ""; document.getElementById("keySelect").disabled = true;
    mostrarTitulo();
    activarControles(true);
  }
});

document.getElementById("keyTarget").addEventListener("change", () => {
  const target = document.getElementById("keyTarget").value;
  transponerTodos(target);
});

document.getElementById("songName").addEventListener("input", mostrarTitulo);

function mostrarTitulo() {
  let titulo = document.getElementById("songName").value;
  let tituloEl = document.getElementById("titulo");
  if (!tituloEl) {
    tituloEl = document.createElement("h1");
    tituloEl.id = "titulo";
    tituloEl.style.textAlign = "center"; // centrado visual
    canvas.insertBefore(tituloEl, canvas.firstChild);
  }
  tituloEl.textContent = titulo;
}

function activarControles(estado) {
  const ids = ["keyTarget", "addPart", "addMeasure", "addComment", "addMeter", "addSymbol", "symbolSelect"];
  ids.forEach(id => document.getElementById(id).disabled = !estado);
}

document.getElementById("addPart").addEventListener("click", () => {
  const part = prompt("Nombre de la parte:");
  if (part) {
    const el = document.createElement("div");
    el.className = "part";
    el.textContent = part;
    canvas.appendChild(el);
  }
});

document.getElementById("addMeter").addEventListener("click", () => {
  const el = document.createElement("div");
  el.className = "meter";
  el.contentEditable = "true";
  el.textContent = "4/4";
  canvas.appendChild(el);
  el.focus();
});

document.getElementById("addMeasure").addEventListener("click", () => {
  crearCompás();
});

function crearCompás() {
  const measure = document.createElement("div");
  measure.className = "measure";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Escribí acordes y Enter";
  input.style.border = "none";
  input.style.outline = "none";
  input.style.fontSize = "16px";
  input.style.width = "200px";

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const acordes = input.value.trim().split(/\s+/);
      acordes.forEach(acorde => {
        const div = document.createElement("div");
        div.className = "chord";
        div.textContent = acorde;
        div.dataset.original = acorde;
        measure.appendChild(div);
      });
      measure.removeChild(input);
      crearCompás();
      transponerTodos(document.getElementById("keyTarget").value);
    }
  });

  measure.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    if (confirm("¿Eliminar este compás?")) {
      measure.remove();
    }
  });

  measure.appendChild(input);
  canvas.appendChild(measure);

// Agregamos una barra visual al final del compás
const barra = document.createElement("div");
barra.className = "barra";
measure.appendChild(barra);
  input.focus();
}

document.getElementById("addComment").addEventListener("click", () => {
  const comment = prompt("Comentario:");
  if (comment) {
    const el = document.createElement("div");
    el.className = "comment";
    el.textContent = comment;
    canvas.appendChild(el);
  }
});

function transponerTodos(destino) {
  if (!destino || !tonalidadBase) return;
  const semitonos = calcularIntervalo(tonalidadBase, destino);
  const acordes = document.querySelectorAll(".chord");
  acordes.forEach(el => {
    const original = el.dataset.original;
    const nuevo = transponerNota(original, semitonos);
    el.textContent = nuevo;
  });
}

function calcularIntervalo(origen, destino) {
  const i1 = notas.indexOf(origen);
  const i2 = notas.indexOf(destino);
  return (i2 - i1 + 12) % 12;
}

function transponerNota(nota, semitonos) {
  const match = nota.match(/^([A-G]#?)(.*)$/);
  if (!match) return nota;
  const raiz = match[1];
  const sufijo = match[2];
  const i = notas.indexOf(raiz);
  if (i === -1) return nota;
  const nueva = notas[(i + semitonos + 12) % 12];
  return nueva + sufijo;
}

document.getElementById("addSymbol").addEventListener("click", () => {
  const symbol = document.getElementById("symbolSelect").value;
  if (symbol) {
    const el = document.createElement("div");
    el.className = "symbol";
    el.textContent = symbol;
    canvas.appendChild(el);
  }
});

document.getElementById("saveTxt").addEventListener("click", () => {
  const txt = canvas.innerText;
  const blob = new Blob([txt], { type: "text/plain" });
  const link = document.createElement("a");
  link.download = "cifrado.txt";
  link.href = URL.createObjectURL(blob);
  link.click();
});

document.getElementById("loadTxt").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target.result;
    const el = document.createElement("pre");
    el.textContent = text;
    canvas.innerHTML = ""; document.getElementById("keySelect").disabled = true;
    canvas.appendChild(el);
  };
  reader.readAsText(file);
});
