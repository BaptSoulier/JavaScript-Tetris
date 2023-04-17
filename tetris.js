const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(20, 20);
  
// balayer lorsque ligne complète
function balayage(){
	let rowCount = 1; // nombre de ligne nettoyées
	outer: for(let y = arena.length - 1; y > 0; --y) {
		for(let x = 0; x < arena[y].length; ++x) { // parcourt la grille de jeu de bas en haut (en partant de l'avant-dernière ligne), et pour chaque ligne, elle parcourt toutes les cellules de gauche à droite
			if(arena[y][x] === 0) { // Si elle trouve une cellule vide, elle passe à la ligne suivante
				continue outer; // sortie de la boucle interne (celle qui parcourt les cellules) et de continuer la boucle externe (celle qui parcourt les lignes)
			}
		}
		const row = arena.splice(y, 1)[0].fill(0); // arrive à la fin de la ligne sans trouver de cellule vide, cela signifie que la ligne est complète, elle la supprime donc de la grille de jeu
		arena.unshift(row); // ajoute la ligne supprimée au début de la grille de jeu 
		++y;

		player.score += rowCount * 10; // multipliant le nombre de lignes nettoyées par 10 
		rowCount *= 2; // doublant ce nombre à chaque ligne supplémentaire nettoyée
	}
}

//détecte s'il y a une collision entre la pièce actuelle du joueur et la grille de jeu
function collision(arena, player) { 
	const [m, o] = [player.matrix, player.pos]; // parcourt chaque case de la matrice de la pièce (m) en ajoutant les coordonnées de la position du joueur (o)
	for(let y = 0; y < m.length; ++y) { // trouve les coordonnées réelles de chaque case dans la grille de jeu
		for(let x = 0; x < m[y].length; ++x) {
			if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0){ // Si la case de la matrice de la pièce n'est pas vide (différente de 0) et que la case correspondante dans la grille de jeu n'est pas vide, cela signifie que la pièce actuelle du joueur entre en collision avec une autre pièce ou le bord de la grille
				return true; //  indique qu'il y a une collision
			}
		}
	}
	return false; // indique qu'il n'y a pas de collision
}

function createMatrix(w, h){
	const matrix = []; //  initialise une matrice vide
	while (h--){ // créer 'h' tableaux et 'w' éléments remplis de zéros
		matrix.push(new Array(w).fill(0)); // ajoute à la matrice
	}
	return matrix; // renvoie la matrice créée
}

// Crée pièce en fonction du type souhaité
function createPiece(type) {
	if(type === 'T') {
		return [
			[1, 1, 1],
			[0, 1, 0],
			[0, 1, 0],
		];
	}
	else if(type === 'O'){
		return [
			[2,2],
			[2,2],
		];
	}
	else if(type === 'L'){
		return [
			[3, 0, 0],
			[3, 0, 0],
			[3, 3, 3],
		];
	}
	else if(type === 'J'){
		return [
			[0, 4, 0],
			[0, 4, 0],
			[4, 4, 0],
		];
	}
	else if(type === 'I'){
		return [
			[0, 5, 0, 0],
			[0, 5, 0, 0],
			[0, 5, 0, 0],
			[0, 5, 0, 0],
		];
	}
	else if(type === 'S'){
		return [
			[0, 6, 6],
			[6, 6, 0],
			[0, 0, 0],
		];
	}
	else if(type === 'Z'){
		return [
			[7, 7, 0],
			[0, 7, 7],
			[0, 0, 0],
		];
	}
	else if(type === 'H'){
		return [
			[8, 8, 8],
			[0, 8, 0],
			[8, 8, 8],
		];
	}
}



// dessine l'état du jeu en direct 
function draw() {
	context.fillStyle = '#000'; 
	context.fillRect(0,0,canvas.width,canvas.height);// remplie le canvas en noir 

	drawMatrix(arena, {x: 0, y: 0}); // dessine la matrice 'arena' et un objet {x: 0, y: 0} comme deuxième argument
	drawMatrix(player.matrix, player.pos, colors[player.color], '#fff'); // dessine la matrice à la position sur le canvas (position actuelle du joueur)
}

//dessine une matrice dans le canvas
function drawMatrix(matrix, offset,color, squareSize) { //En arguments : une matrice à dessiner et un objet qui contient deux propriétés x et y qui représentent la position à laquelle la matrice sera dessinée sur le canvas
	matrix.forEach((row,y) => {
		row.forEach((value,x) => { // parcour chaque élément de la matrice
			if(value !== 0){ //  Si la valeur de l'élément n'est pas égale à zéro
				context.fillStyle = colors[value]; //  représente une pièce et on utilise la couleur correspondante à cette pièce pour remplir un rectangle de taille 1x1
				context.fillRect(x + offset.x, y + offset.y,1, 1);
				context.strokeRect(x + offset.x, y + offset.y, 1, 1);
				context.strokeStyle = 'white';
				context.lineWidth = 0.05;
				//context.stroke()
			}
		});
	});
}					

function merge(arena, player) { // fusionner la matrice de "player" avec la matrice de "arena" en copiant les valeurs de la matrice "player" dans la matrice "arena"
  player.matrix.forEach((row, y) => {
		row.forEach((value, x) => { //  parcour chaque ligne et chaque colonne
			if (value !== 0) { // Pour chaque élément différent de zéro dans la matrice "player"
				arena[y + player.pos.y][x + player.pos.x] = value; // détermine la position correspondante dans la matrice "arena"
			}
		});
	});
}

// faire tomber une pièce d'une ligne
function playerDrop(){
	player.pos.y++; // incrémente la position Y de la pièce d'une unité
	if(collision(arena, player)) { // détecte si la pièce est entrée en collision avec les blocs déjà placés dans la matrice
		player.pos.y--; //  Si une collision est détectée, la position Y de la pièce est décrémentée pour revenir à sa position précédente
		merge(arena, player); // fusionne la pièce avec les blocs existants dans la matrice
		playerReset(); // réinitialise la pièce à sa position de départ en haut de la grille
		//player.pos.y = 0;
		balayage(); // supprime les lignes complètes de la matrice
		updateScore(); // MAJ du score
	}
	dropCounter = 0; // compteur de descente remis à 0 (contrôle la vitesse de descente)
}

// mouvements du joueur 
function playerMove(dir) {
	player.pos.x += dir; // modifie la position X de la pièce en ajoutant ou en soustrayant la valeur de "dir" à sa position actuelle
	if (collision(arena, player)) { // Si une collision est détectée
		player.pos.x -= dir; // la position X de la pièce est décrémentée de la même quantité que "dir" pour annuler le déplacement
	}
}

// une nouvelle pièce doit être créée et placée au sommet de la grille
function playerReset() {
	const pieces = 'ILJOTSZ'; // types de pièces possibles
	player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]); // créeer une nouvelle pièce aléatoire
	player.pos.y = 0; //  la pièce sera placée au sommet de la grille
	player.pos.x = (arena[0].length /  2 | 0) - (player.matrix[0].length / 2 | 0); // La position X de la pièce est définie en fonction de la largeur de la grille et de la largeur de la nouvelle pièce
	if(collision(arena, player)) { // Si une collision est détectée cela signifie que la partie est terminée
		arena.forEach(row => row.fill(0)); // la matrice est remplie de zéros
		player.score = 0; // le score du joueur est réinitialisé à zéro
		updateScore(); // MAJ du score
	}
}	

// pivoter la pièce
function playerRotate(dir) {
	const pos = player.pos.x; //  stocke la position X actuelle du joueur dans la variable "pos"
	let offset = 1; // utilisée pour ajuster la position X de la pièce si elle entre en collision avec les blocs existants dans la matrice
	rotate(player.matrix, dir); //prend en entrée une matrice et une direction
	while(collision(arena, player)) { // détecte les collisions entre la nouvelle position de la pièce et les blocs existants dans la matrice
		player.pos.x += offset; // Si une collision est détectée la fonction ajuste la position X de la pièce en ajoutant ou en soustrayant la valeur de "offset" à "player.pos.x"
		offset = -(offset + (offset > 0 ? 1 : -1)); // La valeur de "offset" est ensuite inversée et augmentée d'une unité (ou diminuée d'une unité si "offset" était négatif)
		if (offset > player.matrix[0].length) { // Si la valeur de "offset" est supérieure à la largeur de la nouvelle pièce cela signifie que la pièce ne peut pas être placée à un nouvel emplacement sans collision
			rotate(player.matrix, -dir); // pivote la matrice de la pièce dans la direction opposée à la direction spécifiée par l'argument "dir"
			player.pos.x = pos; // La position X de la pièce est réinitialisée à "pos"
			return;
		}
	}
}

function rotate(matrix, dir) {
	for(let y = 0; y < matrix.length; ++y) { // parcour tout les éléments de la matrice
		for(let x = 0; x < y; ++x) {
			[
				matrix[x][y], // échange les éléments de la matrice
				matrix[y][x],
			] = [
					matrix[y][x],
					matrix[x][y],
			];
		}
	}

	if(dir > 0) { // Si la direction spécifiée par l'argument "dir" est positive
		matrix.forEach(row => row.reverse()); //  inverse l'ordre des éléments de chaque ligne de la matrice
	}
	else { // Si la direction spécifiée par l'argument "dir" est négative
		matrix.reverse(); // inverse l'ordre des lignes de la matrice
	}
}

let dropCounter = 0; // compte le temps écoulé depuis la dernière chute auto de la pièce 
let dropInterval = 500; // Interval de temps entre chaque chute en milliseconde
let lastTime = 0;// représente  le temps écoulé depuis le démarrage du jeu jusqu'à la dernière mise à jour de l'affichage



function update(time = 0){
	const deltaTime = time - lastTime; // calculer le temps écoulé depuis la dernière mise à jour de l'affichage en soustrayant la valeur de "lastTime" au temps actuel
	lastTime = time; // MAJ avec la valeur actuelle du temps 

	dropCounter += deltaTime;// détermine s'il est temps de faire tomber automatiquement la pièce vers le bas
	if(dropCounter > dropInterval){  // représente l'intervalle de temps entre chaque chute automatique
		playerDrop(); // fais tomber la pièce d'une ligne vers le bas
	}
	

	draw(); // MAJ de l'affichage 
	//requestAnimationFrame(update); // ddemande au nav de MAJ (boucle infini)
	animationId = requestAnimationFrame(update);

}

//mettre à jour l'affichage du score dans l'interface utilisateur en récupérant l'élément HTML
function updateScore() {
	document.getElementById('score').innerText = player.score; // mettre à jour le score
}

const colors = [
	null, // représenter l'absence de couleur associée à cette valeur numérique
	'red',
	'blue',
	'violet',
	'purple',
	'pink',
	'orange',
	'green',
	'yellow',
];

const arena = createMatrix(12, 20); // crée et renvoie une matrice avec un nombre de colonnes égal à 12 et un nombre de lignes égal à 20


const player = { //  objet qui représente le joueur dans le jeu
	pos: {x: 0, y: 0}, // objet qui contient les coordonnées (x, y) de la position actuelle du joueur sur l'aire de jeu
	matrix: null, //représente la pièce en cours de contrôle par le joueur
	score: 0, // représente le score actuel du joueur
 }

 // detecte les pression des touches du clavier
document.addEventListener('keydown', event =>{
	if(event.keyCode === 37){ // flèche de gauche
		playerMove(-1); // vers la gauche
	}
	else if(event.keyCode === 39){ // flèche de droite 
		playerMove(1); // vers la droite
	}
	else if(event.keyCode === 40){// flèche du bas 
		playerDrop(); // vers le bas (tombe plus vite)
	}
	else if(event.keyCode === 38){ // flèche du haut 
		playerRotate(-1); // pivoté anti horaire 
	}
});

let Ispaused = false; // le jeu n'est pas en pause
function pauseGame() {
	if (Ispaused) { // verifie si le jeu est en pause
		animationId = requestAnimationFrame(update); // Le jeu n'est pas en pause(mise à false)
	} else {
		cancelAnimationFrame(animationId); // si le jeu n'est pas en pause (mise à true)
	}
	Ispaused = !Ispaused; // inverser la valeur 
  }
  
playerReset(); //  initialise le jeu avec une nouvelle pièce
updateScore(); // affiche le score initial
update(); // boucle du jeu
