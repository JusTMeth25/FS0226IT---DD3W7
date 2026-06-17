const STORAGE_KEY = "libri";
const QUERY_KEY = "ultimaQuery";

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
// document.getElementById("formato").addEventListener("change", (e) => {
//   if (e.target.value === "digitale") {
//     document.getElementById("campo-dimensione").removeAttribute("hidden");
//   } else {
//     document.getElementById("campo-dimensione").setAttribute("hidden", "");
//   }

//   if (e.target.value === "audio") {
//     document.getElementById("campo-durata").removeAttribute("hidden");
//   } else {
//     document.getElementById("campo-durata").setAttribute("hidden", "");
//   }
// });

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
// document.getElementById("aggiungi-libro").addEventListener("submit", (e) => {
//   e.preventDefault();

//   const titolo = e.target.titolo.value;
//   const autore = e.target.autore.value;
//   const anno = parseInt(e.target.anno.value);
//   const formato = e.target.formato.value;
//   const dimensioneMb = parseFloat(e.target.dimensione.value) || 0;
//   const durataMinuti = parseInt(e.target.durata.value) || 0;

//   let nuovoLibro;

//   if (formato === "digitale") {
//     nuovoLibro = new LibroDigitale(titolo, autore, anno, dimensioneMb);
//   } else if (formato === "audio") {
//     nuovoLibro = new LibroAudio(titolo, autore, anno, durataMinuti);
//   } else {
//     nuovoLibro = new Libro(titolo, autore, anno);
//   }

//   libri.push(nuovoLibro);
//   salvaLibri();
//   renderLibri();

//   e.target.reset();
//   document.getElementById("campo-dimensione").setAttribute("hidden", "");
// });

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

function cerca(query) {
  mostraSpinner();
  const url = `https://openlibrary.org/search.json?q=${query}&limit=10`;
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Errore HTTP + response.status");
      }
      return response.json();
    })
    .then((dati) => {
      renderRisultati(dati.docs);
    })
    .catch((err) => {
      mostraErrore("Impossibile completare la ricerca: " + err.message);
    })
    .finally(() => {
      nascondiSpinner();
    });
}

function renderRisultati(docs) {
  if (docs.length === 0) {
    document.getElementById("risultati").innerHTML = `
      <li>"Nessun risultato trovato."</li>`;
    return;
    // } else if (docs.filter((d) => d.author_name === "")) {
    //   document.getElementById("risultati").innerHTML = `
    //     <li>"Nessun risultato trovato."</li>`;
  } else {
    const lista = docs.map((d, i) => {
      const titolo = d.title;
      const autore =
        d.author_name && d.author_name[0]
          ? d.author_name[0]
          : "Autore sconosciuto";
      const anno = d.first_publish_year ? d.first_publish_year : "?";
      return `<li class="info-search">
        <div class="info">
          <span class="titolo">${titolo}</span>
          <div class="meta">
            ${autore} - ${anno}
          </div>
          </div>
          <button
            data-titolo="${titolo}"
            data-autore="${autore}"
            data-anno="${anno}"
          >
            Aggiungi
          </button>
          <button data-key="${d.key}">Dettagli</button>
      </li>`;
    });
    document.getElementById("risultati").innerHTML = lista.join("");
  }
}

// Debounce
let timeoutId;

document.getElementById("cerca").addEventListener("input", (e) => {
  const query = e.target.value.trim(); // rimuove gli spazi vuoti iniziali e finali

  if (query.length < 3) {
    document.getElementById("risultati").innerHTML = "";
    return;
  } else {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      localStorage.setItem(QUERY_KEY, query);
      cerca(query);
    }, 400);
  }
});

// Listener click risultati
document.getElementById("risultati").addEventListener("click", (e) => {
  const buttonAggiungi = e.target.closest("button[data-titolo]");
  if (buttonAggiungi) {
    const titolo = buttonAggiungi.dataset.titolo;
    const autore = buttonAggiungi.dataset.autore;
    const anno = parseInt(buttonAggiungi.dataset.anno);

    const nuovoLibro = new Libro(titolo, autore, anno);
    libri.push(nuovoLibro);
    salvaLibri();
    renderLibri();
    buttonAggiungi.textContent = "✓ Aggiunto";
    buttonAggiungi.setAttribute("disabled", "");
    return;
  }

  const buttonDettagli = e.target.closest("button[data-key]");
  if (buttonDettagli) {
    const key = buttonDettagli.dataset.key;
    fetch(`https://openlibrary.org${key}.json`)
      .then((response) => response.json())
      .then((dati) => {
        let descrizione;
        if (typeof dati.description === "string") {
          descrizione = dati.description;
        } else if (dati.description && dati.description.value) {
          descrizione = dati.description.value;
        } else {
          descrizione = "Nessuna descrizione disponibile";
        }
        alert(descrizione);
      })
      .catch((err) => {
        alert("Errore nel caricamento dei dettagli: " + err.message);
      });
  }
});

const ultimaQuery = localStorage.getItem(QUERY_KEY);
if (ultimaQuery) {
  document.getElementById("cerca").value = ultimaQuery;
  cerca(ultimaQuery);
}

renderLibri();
