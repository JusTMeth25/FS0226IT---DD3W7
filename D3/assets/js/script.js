// Asincrono semplice
console.log("primo"); // 1
setTimeout(() => {
  // 2
  (callback(), 3000); // 5
});

function callback() {
  console.log("terzo"); // 4
}

console.log("secondo"); // 3

const semaforo = document.querySelector("#semaforo");
const promiseState = document.querySelector("#promiseState");
const spinner = document.querySelectorAll(".spinner");
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mostra(light, text) {
  semaforo.textContent = light;
  promiseState.textContent = text;
}

mostra("🔴", "Stop");
wait(2000)
  .then(() => mostra("🟢", "Via"))
  .then(() => wait(2000))
  .then(() => mostra("🟡", "Attesa..."))
  .then(() => wait(2000))
  .then(() => mostra("🔴", "Stop"))
  .then(() => spinner[0].classList.add("nascondi"));

// Primo esempio catch

const result = document.querySelector("#result");

function divide(num1, num2) {
  return new Promise((resolve, reject) => {
    if (num1 === 0 || num2 === 0) {
      reject(new Error("Non è possibile dividere per zero!!"));
      return;
    }
    resolve((result.textContent = `Risultato: ${num1 / num2}`));
  });
}

divide(10, 5).catch((err) => {
  result.textContent = err.message;
});

// Esempio catch e finally

const imgBox = document.querySelector("#imgBox");

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image(); // Creo una nuova immagine
    img.onload = () => setTimeout(resolve(img), 2000); // Quando l'immagine carica, risolvo la promise
    img.onerror = () => reject(new Error("Impossibile caricare l'immagine")); // Se c'è un errore, rifiuto la promise
    img.src = url; // Imposto l'URL dell'immagine
  });
}

loadImage(
  "https://images.pexels.com/photos/34145802/pexels-photo-34145802.jpeg",
)
  .then((img) => {
    imgBox.classList.add("img");
    imgBox.appendChild(img);
  })
  .catch((err) => {
    imgBox.textContent = err.message;
  })
  .finally(() => {
    spinner[1].classList.add("nascondi");
  });

// Esempio fetch
let myData; // Dichiaro la variabile che conterrà i dati
fetch("https://jsonplaceholder.typicode.com/users")
  .then((response) => {
    myData = response.json();
  })
  .then((data) => {
    console.log(myData);
  })
  .catch((err) => {
    console.log(err);
  });

// Open library
let myBooks = [];
fetch("https://openlibrary.org")
  .then((response) => (myBooks = response.json))
  .then((data) => {
    myBooks = data;
    console.log(myBooks);
  });
