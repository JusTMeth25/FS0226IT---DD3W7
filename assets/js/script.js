// Asincrono semplice
console.log('primo'); // 1
setTimeout(() => {
	// 2
	(callback(), 3000); // 5
});

function callback() {
	console.log('terzo'); // 4
}

console.log('secondo'); // 3