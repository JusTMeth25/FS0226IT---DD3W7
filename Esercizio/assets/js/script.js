const STORAGE_KEY = "libri";

// === salvaLibri ===
function salvaLibri() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(libri));
}
// === caricaLibri ===
function caricaLibri() {
  const datiSalvati = localStorage.getItem(STORAGE_KEY);

  if (datiSalvati === null) {
    return [];
  } else {
    const datiGrezzi = JSON.parse(datiSalvati);

    return datiGrezzi.map((d) => {
      let l;

      if (d.dimensioneMb !== undefined) {
        l = new LibroDigitale(d.titolo, d.autore, d.anno, d.dimensioneMb);
      } else if (d.durataMinuti !== undefined) {
        l = new LibroAudio(d.titolo, d.autore, d.anno, d.durataMinuti);
      } else {
        l = new Libro(d.titolo, d.autore, d.anno);
      }

      l.id = d.id;
      l.letto = d.letto;
      if (d.id > Libro.contatore) Libro.contatore = d.id;
      return l;
    });
  }
}

class Libro {
  static contatore = 0;

  constructor(_titolo, _autore, _anno) {
    this.id = ++Libro.contatore;
    this.titolo = _titolo;
    this.autore = _autore;
    this.anno = _anno;
    this.letto = false;
  }

  segnaComeLetto() {
    this.letto = true;
  }

  formato() {
    return "cartaceo";
  }
}

class LibroDigitale extends Libro {
  constructor(_titolo, _autore, _anno, _dimensioneMb) {
    super(_titolo, _autore, _anno);
    this.dimensioneMb = _dimensioneMb;
  }

  formato() {
    return `digitale (${this.dimensioneMb}MB)`;
  }
}

class LibroAudio extends Libro {
  constructor(_titolo, _autore, _anno, _durataMinuti) {
    super(_titolo, _autore, _anno);
    this.durataMinuti = _durataMinuti;
  }

  formato() {
    return `audio (${this.durataMinuti} minuti)`;
  }
}

// === Stato ===
let libri = caricaLibri();
let filtroAttuale = "tutti"; // valori possibili: "tutti", "letti", "daLeggere"
// === Render ===
function renderLibri() {
  let libriFiltrati;

  if (filtroAttuale === "letti") {
    libriFiltrati = libri.filter((l) => l.letto);
  } else if (filtroAttuale === "daLeggere") {
    libriFiltrati = libri.filter((l) => !l.letto);
  } else {
    libriFiltrati = libri;
  }
  const html = libriFiltrati
    .map(
      (l) =>
        `
        <li class="${l.letto ? "letto" : ""}" data-id="${l.id}">
            <div class="info">
                <span class="titolo">${l.titolo}</span>
                <span class="badge-formato">${l.formato()}</span>
            <div class="meta">${l.autore} - ${l.anno}</div>
            </div>
            <div class="azioni">
                ${l.letto ? "✓ letto" : '<button data-azione="leggi">Segna come letto</button>'}
                <button data-azione="Rimuovi">Rimuovi</button>
            </div>
            </li>
            `,
    )
    .join("");

  document.getElementById("lista-libri").innerHTML = html;
  document.getElementById("contatore").textContent = libriFiltrati.length;
}

// === Mostra / nasconde campo dimensione ===
document.getElementById("formato").addEventListener("change", (e) => {
  if (e.target.value === "digitale") {
    document.getElementById("campo-dimensione").removeAttribute("hidden");
  } else {
    document.getElementById("campo-dimensione").setAttribute("hidden", "");
  }

  if (e.target.value === "audio") {
    document.getElementById("campo-durata").removeAttribute("hidden");
  } else {
    document.getElementById("campo-durata").setAttribute("hidden", "");
  }
});

// === Filtro ===
document.getElementById("filter-all").addEventListener("click", () => {
  filtroAttuale = "tutti";
  renderLibri();
});
document.getElementById("filter-read").addEventListener("click", () => {
  filtroAttuale = "letti";
  renderLibri();
});
document.getElementById("filter-toRead").addEventListener("click", () => {
  filtroAttuale = "daLeggere";
  renderLibri();
});
// === Ordina per titolo o anno ===
document.getElementById("ordina").addEventListener("change", (e) => {
  const criterio = e.target.value;

  if (criterio === "titolo") {
    libri.sort((a, b) => a.titolo.localeCompare(b.titolo));
  } else if (criterio === "anno") {
    libri.sort((a, b) => a.anno - b.anno);
  }
  salvaLibri();
  renderLibri();
});

// === Submit form ===
document.getElementById("aggiungi-libro").addEventListener("submit", (e) => {
  e.preventDefault();

  const titolo = e.target.titolo.value;
  const autore = e.target.autore.value;
  const anno = parseInt(e.target.anno.value);
  const formato = e.target.formato.value;
  const dimensioneMb = parseFloat(e.target.dimensione.value) || 0;
  const durataMinuti = parseInt(e.target.durata.value) || 0;

  let nuovoLibro;

  if (formato === "digitale") {
    nuovoLibro = new LibroDigitale(titolo, autore, anno, dimensioneMb);
  } else if (formato === "audio") {
    nuovoLibro = new LibroAudio(titolo, autore, anno, durataMinuti);
  } else {
    nuovoLibro = new Libro(titolo, autore, anno);
  }

  libri.push(nuovoLibro);
  salvaLibri();
  renderLibri();

  e.target.reset();
  document.getElementById("campo-dimensione").setAttribute("hidden", "");
});

// === Event delegation lista libri ===
document.getElementById("lista-libri").addEventListener("click", (e) => {
  const azione = e.target.dataset.azione;

  if (!azione) return;

  const li = e.target.closest("li");
  const idLibro = parseInt(li.dataset.id);

  if (azione === "leggi") {
    const libro = libri.find((l) => l.id === idLibro);

    if (libro) {
      libro.segnaComeLetto();
      salvaLibri();
      renderLibri();
    }
  }

  if (azione === "Rimuovi") {
    libri = libri.filter((l) => l.id !== idLibro);
    salvaLibri();
    renderLibri();
  }
});

// === Event listener svuota lista libri ===
document.getElementById("svuota-tutto").addEventListener("click", () => {
  libri = [];
  localStorage.removeItem(STORAGE_KEY);
  renderLibri();
});
// === Event listener esporta lista libri ===
document.getElementById("export-all").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(libri, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "libri.json";
  a.click();
  URL.revokeObjectURL(url);
});

// Funzioni helper e cerca()
function mostraSpinner() {
  const spinner = document.getElementById("spinner");
  spinner.classList.remove("hidden");
  const errore = document.getElementById("errore");
  spinner.classList.add("errore");
}

function nascondiSpinner() {
  const spinner = document.getElementById("spinner");
  spinner.classList.add("hidden");
  const errore = document.getElementById("errore");
  spinner.classList.remove("errore");
}

function mostraErrore() {
  const errore = document.getElementById("errore");
  errore.textContent = "Errore durante il caricamento dei libri";
  errore.classList.remove("hidden");
}







renderLibri();
