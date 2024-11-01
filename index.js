console.log(gsap);
const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
console.log(c);
canvas.width = innerWidth;
canvas.height = innerHeight;

let flagGameOver = true;

//Audio
const asteroidHit = new Audio("audio/Asteroid-Hit.mp3");
const soundLaser = new Audio("audio/dist_audio_lasrhit2.mp3");
soundLaser.volume = 0.1;

const startGameBtn = document.getElementById("startGameBtn");
const scoreEL = document.getElementById("scoreEL");
const modalEL = document.getElementById("modalEL");
const bigScoreEl = document.getElementById("bigScoreEl");
class Player {
	constructor(x, y, radius, color) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
	}

	draw() {
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		c.fillStyle = this.color;
		c.shadowColor = "";
		c.shadowBlur = 0;
		c.shadowOffsetX = 0;
		c.shadowOffsetY = 0;
		c.fill();
	}
}

class Projectile {
	constructor(x, y, radius, color, velocity) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.velocity = velocity;
	}

	draw() {
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);

		c.shadowColor = "red";
		c.shadowBlur = 15;
		c.shadowOffsetX = 3;
		c.shadowOffsetY = 3;

		c.fillStyle = this.color;
		c.fill();
	}

	update() {
		this.draw();
		this.x = this.x + this.velocity.x;
		this.y = this.y + this.velocity.y;
	}
}

class Enemy {
	constructor(x, y, radius, color, velocity) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.velocity = velocity;
	}

	draw() {
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		c.fillStyle = this.color;

		c.shadowColor = "";
		c.shadowBlur = 0;
		c.shadowOffsetX = 0;
		c.shadowOffsetY = 0;

		c.fill();
	}

	update() {
		this.draw();
		this.x = this.x + this.velocity.x;
		this.y = this.y + this.velocity.y;
	}
}

const friction = 0.98;
class Particle {
	constructor(x, y, radius, color, velocity) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.velocity = velocity;
		this.alpha = 1;
	}

	draw() {
		c.save();
		c.globalAlpha = this.alpha;
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		c.fillStyle = this.color;
		c.fill();
		c.restore();
	}

	update() {
		this.draw();
		this.velocity.x *= friction;
		this.velocity.y *= friction;
		this.x = this.x + this.velocity.x;
		this.y = this.y + this.velocity.y;
		this.alpha -= 0.01;
	}
}

const x = canvas.width / 2;
const y = canvas.height / 2;

let player = new Player(x, y, 10, "white");
let projectiles = [];
let enemies = [];
let particles = [];

function init() {
	player = new Player(x, y, 10, "white");
	projectiles = [];
	enemies = [];
	particles = [];
	score = 0;
	scoreEL.innerHTML = score;
	bigScoreEl.innerHTML = score;
}

function spawnEnemies() {
	setInterval(() => {
		const radius = Math.random() * (30 - 10) + 10;

		let x;
		let y;
		if (Math.random() > 0.5) {
			x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
			y = Math.random() * canvas.height;
		} else {
			x = Math.random() * canvas.width;
			y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
		}

		const color = `hsl(${Math.random() * 360}, 50%, 50%)`;

		const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
		console.log(angle);
		const velocity = {
			x: Math.cos(angle),
			y: Math.sin(angle),
		};

		enemies.push(new Enemy(x, y, radius, color, velocity));
	}, 1000);

	console.log(enemies);
}

let animationId;
let score = 0;
function animate() {
	animationId = requestAnimationFrame(animate);
	c.shadowColor = "";
	c.shadowBlur = 0;
	c.shadowOffsetX = 0;
	c.shadowOffsetY = 0;
	c.fillStyle = "rgba(0,0,0,.1)";
	c.fillRect(0, 0, canvas.width, canvas.height);
	player.draw();
	particles.forEach((particle, index) => {
		if (particle.alpha <= 0) {
			particles.splice(index, 1);
		} else {
			particle.update();
		}
	});
	projectiles.forEach((projectile, index) => {
		projectile.update();
		// Remove projectiles from the edge of the screen
		if (
			projectile.x + projectile.radius < 0 ||
			projectile.x - projectile.radius > canvas.width ||
			projectile.y + projectile.radius < 0 ||
			projectile.y - projectile.radius > canvas.height
		) {
			setTimeout(() => {
				projectiles.splice(index, 1);
			}, 0);
		}
	});

	enemies.forEach((enemy, index) => {
		enemy.update();

		const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

		if (dist - enemy.radius - player.radius < 1) {
			console.log(`End Game!`);
			cancelAnimationFrame(animationId);
			modalEL.style.display = "flex";
			soundLaser.pause();
			soundLaser.currentTime = 0;
			asteroidHit.pause();
			asteroidHit.currentTime = 0;
			flagGameOver = true;
			bigScoreEl.innerHTML = score;
		}

		projectiles.forEach((projectile, projectileIndex) => {
			const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

			// When projectiles touch enemy
			if (dist - enemy.radius - projectile.radius < 1) {
				// Create explosions
				asteroidHit.pause();
				7;
				asteroidHit.currentTime = 0;
				asteroidHit.play();
				for (let i = 0; i < enemy.radius * 2; i++) {
					particles.push(
						new Particle(
							projectile.x,
							projectile.y,
							Math.random() * 2,
							enemy.color,
							{
								x: (Math.random() - 0.5) * (Math.random() * 5),
								y: (Math.random() - 0.5) * (Math.random() * 5),
							}
						)
					);
				}
				if (enemy.radius - 10 > 5) {
					// Increase score
					score += 100;
					scoreEL.innerHTML = score;

					gsap.to(enemy, {
						radius: enemy.radius - 10,
					});
					setTimeout(() => {
						projectiles.splice(projectileIndex, 1);
					}, 0);
				} else {
					// Increase score
					score += 250;
					scoreEL.innerHTML = score;
					setTimeout(() => {
						enemies.splice(index, 1);
						projectiles.splice(projectileIndex, 1);
					}, 0);
				}
			}
		});
	});
}

addEventListener("click", (event) => {
	console.log(event);

	if (!flagGameOver) {
		soundLaser.pause();
		soundLaser.currentTime = 0;
		soundLaser.play();
	}

	const angle = Math.atan2(
		event.clientY - canvas.height / 2,
		event.clientX - canvas.width / 2
	);
	console.log(angle);
	const velocity = {
		x: Math.cos(angle) * 5,
		y: Math.sin(angle) * 5,
	};
	projectiles.push(
		new Projectile(canvas.width / 2, canvas.height / 2, 4, "white", velocity)
	);
});

startGameBtn.addEventListener("click", () => {
	init();
	animate();
	spawnEnemies();
	modalEL.style.display = "none";
	flagGameOver = false;
});
