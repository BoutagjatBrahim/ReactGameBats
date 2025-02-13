import chalk from "chalk";
import fastify from "fastify";
import fastifyBcrypt from "fastify-bcrypt";
import cors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifyJWT from "@fastify/jwt";
import { Server } from 'socket.io';
import { createServer } from 'node:http';
//routes
import { usersRoutes } from "./routes/users.js";
import { gamesRoutes } from "./routes/games.js";
import { loginUser } from './controllers/users.js';
import Game from './models/games.js';
import { Op } from 'sequelize';
//bdd
import { sequelize } from "./bdd.js";

// Stockage des parties en mémoire
const games = new Map();
const userSockets = new Map();


// Créer le serveur HTTP
const httpServer = createServer();

const app = fastify({
	logger: false,
});

// Créer l'instance Socket.IO
const io = new Server(httpServer, {
	cors: {
		origin: "http://localhost:5173",
		methods: ["GET", "POST"],
		credentials: true
	}
});

// Middleware Socket.IO pour l'authentification
io.use((socket, next) => {
	const token = socket.handshake.query.token;
	if (!token) {
		return next(new Error('Token manquant'));
	}
	try {
		const decoded = app.jwt.verify(token);
		socket.user = decoded;
		next();
	} catch (err) {
		next(new Error('Token invalide'));
	}
});

// // Gestionnaire de connexion Socket.IO
// io.on('connection', (socket) => {
// 	console.log(chalk.green('Client connecté:', socket.id));

// 	// Stocker la socket de l'utilisateur
// 	userSockets.set(socket.user.id, socket);

// 	// Obtenir les parties disponibles
// 	socket.on('getAvailableGames', (callback) => {
// 		try {
// 			const availableGames = Array.from(games.values())
// 				.filter(game => game.status === 'waiting');
// 			callback({ status: 'ok', games: availableGames });
// 		} catch (error) {
// 			callback({ status: 'error', error: error.message });
// 		}
// 	});

// 	// Créer une nouvelle partie
// 	socket.on('createGame', (gameData, callback) => {
// 		try {
// 			const gameId = Math.random().toString(36).substr(2, 9);
// 			const game = {
// 				id: gameId,
// 				...gameData,
// 				players: [{
// 					id: socket.user.id,
// 					username: socket.user.username
// 				}],
// 				status: 'waiting',
// 				createdAt: new Date(),
// 				currentTurn: socket.user.id
// 			};

// 			games.set(gameId, game);
// 			socket.join(`game:${gameId}`);

// 			// Notifier tous les clients de la nouvelle partie
// 			io.emit('gameListUpdated', Array.from(games.values()));
// 			callback({ status: 'ok', gameId });
// 		} catch (error) {
// 			callback({ status: 'error', error: error.message });
// 		}
// 	});

// 	// Rejoindre une partie
// 	socket.on('joinGame', ({ gameId }, callback) => {
// 		try {
// 			const game = games.get(gameId);
// 			if (!game) {
// 				throw new Error('Partie non trouvée');
// 			}

// 			if (game.players.length >= game.maxPlayers) {
// 				throw new Error('La partie est complète');
// 			}

// 			// Vérifier si le joueur n'est pas déjà dans la partie
// 			if (game.players.some(player => player.id === socket.user.id)) {
// 				throw new Error('Vous êtes déjà dans cette partie');
// 			}

// 			// Ajouter le joueur à la partie
// 			game.players.push({
// 				id: socket.user.id,
// 				username: socket.user.username
// 			});

// 			socket.join(`game:${gameId}`);

// 			// Si le nombre de joueurs requis est atteint, démarrer la partie
// 			if (game.players.length === game.maxPlayers) {
// 				game.status = 'playing';
// 			}

// 			// Notifier tous les clients des changements
// 			io.emit('gameListUpdated', Array.from(games.values()));
// 			io.to(`game:${gameId}`).emit('gameUpdated', game);

// 			callback({ status: 'ok', game });
// 		} catch (error) {
// 			callback({ status: 'error', error: error.message });
// 		}
// 	});

// 	// Gérer un coup joué
// 	socket.on('playMove', ({ gameId, move }, callback) => {
// 		try {
// 			const game = games.get(gameId);
// 			if (!game || game.status !== 'playing') {
// 				throw new Error('Partie invalide');
// 			}

// 			if (game.currentTurn !== socket.user.id) {
// 				throw new Error("Ce n'est pas votre tour");
// 			}

// 			// Appliquer le coup (à implémenter selon vos règles)
// 			// ...

// 			// Passer au joueur suivant
// 			const currentPlayerIndex = game.players.findIndex(p => p.id === socket.user.id);
// 			game.currentTurn = game.players[(currentPlayerIndex + 1) % game.players.length].id;

// 			// Notifier les joueurs de la partie
// 			io.to(`game:${gameId}`).emit('gameUpdated', game);
// 			callback({ status: 'ok', game });
// 		} catch (error) {
// 			callback({ status: 'error', error: error.message });
// 		}
// 	});

// 	// Gérer la déconnexion
// 	socket.on('disconnect', () => {
// 		console.log(chalk.yellow('Client déconnecté:', socket.id));
// 		userSockets.delete(socket.user.id);

// 		// Gérer les parties du joueur déconnecté
// 		games.forEach((game, gameId) => {
// 			if (game.players.some(p => p.id === socket.user.id)) {
// 				// Option 1: Supprimer la partie
// 				games.delete(gameId);
// 				// Option 2: Marquer le joueur comme déconnecté
// 				// game.players = game.players.map(p => 
// 				//   p.id === socket.user.id ? { ...p, disconnected: true } : p
// 				// );
// 				io.emit('gameListUpdated', Array.from(games.values()));
// 			}
// 		});
// 	});
// });


// Gestionnaire de connexion Socket.IO
io.on('connection', (socket) => {
	//console.log(chalk.green('Client connecté:', socket.id));



	// Stocker la socket de l'utilisateur
	userSockets.set(socket.user.id, socket);

	// // Rejoindre une room de jeu
	// socket.on('joinGameRoom', (gameId) => {
	// 	console.log(`${socket.id} rejoint la room: game:${gameId}`);
	// 	socket.join(`game:${gameId}`);


	// });
	socket.on('joinGame', async (gameId, callback) => {
		try {
			const game = await Game.findByPk(gameId, {
				include: [
					{
						model: User,
						as: 'player1',
						attributes: ['id', 'username']
					}
				]
			});

			if (!game || game.state !== 'pending') {
				throw new Error('Partie non disponible');
			}

			await game.update({
				player2: socket.user.id,
				state: 'playing'
			});

			socket.join(`game:${gameId}`);

			const updatedGame = await Game.findByPk(gameId, {
				include: [
					{
						model: User,
						as: 'player1',
						attributes: ['id', 'username']
					},
					{
						model: User,
						as: 'secondPlayer',
						attributes: ['id', 'username']
					}
				]
			});

			io.to(`game:${gameId}`).emit('gameUpdated', updatedGame);
			callback({ status: 'ok', game: updatedGame });
		} catch (error) {
			callback({ status: 'error', error: error.message });
		}
	});

	// Quitter une room de jeu
	socket.on('leaveGameRoom', (gameId) => {
		//console.log(`${socket.id} quitte la room: game:${gameId}`);
		socket.leave(`game:${gameId}`);
	});

	// Obtenir les parties disponibles
	socket.on('getAvailableGames', async (callback) => {
		try {
			const availableGames = await Game.findAll({
				where: {
					state: 'pending',
					player2: null
				},
				include: [
					{
						model: User,
						as: 'player1',
						attributes: ['id', 'username']
					}
				]
			});
			callback({ status: 'ok', games: availableGames });
		} catch (error) {
			callback({ status: 'error', error: error.message });
		}
	});

	// Créer une nouvelle partie
	socket.on('createGame', async (gameData, callback) => {
		try {
			const game = await Game.create({
				creator: socket.user.id,
				name: gameData.name || `Partie de ${socket.user.username}`,
				state: 'pending',
				sticks: 21,
				currentPlayer: socket.user.id
			});

			socket.join(`game:${game.id}`);

			// Récupérer la partie avec les relations
			const gameWithRelations = await Game.findByPk(game.id, {
				include: [
					{
						model: User,
						as: 'player1',
						attributes: ['id', 'username']
					}
				]
			});

			// Notifier tous les clients
			io.emit('gameCreated', gameWithRelations);
			callback({ status: 'ok', game: gameWithRelations });
		} catch (error) {
			callback({ status: 'error', error: error.message });
		}
	});

	// // Jouer un coup
	// socket.on('playMove', async ({ gameId, sticksToRemove }, callback) => {
	// 	try {
	// 		const game = await Game.findByPk(gameId, {
	// 			include: [
	// 				{
	// 					model: User,
	// 					as: 'player1',
	// 					attributes: ['id', 'username']
	// 				},
	// 				{
	// 					model: User,
	// 					as: 'secondPlayer',
	// 					attributes: ['id', 'username']
	// 				}
	// 			]
	// 		});

	// 		if (!game || game.state !== 'playing') {
	// 			throw new Error('Partie invalide');
	// 		}

	// 		if (game.currentPlayer !== socket.user.id) {
	// 			throw new Error("Ce n'est pas votre tour");
	// 		}

	// 		// Calculer le nouveau nombre de bâtonnets
	// 		const remainingSticks = game.sticks - sticksToRemove;

	// 		if (remainingSticks < 0) {
	// 			throw new Error('Pas assez de bâtonnets');
	// 		}

	// 		// Déterminer le prochain joueur
	// 		const nextPlayer = game.creator === socket.user.id ? game.player2 : game.creator;

	// 		// Mettre à jour le jeu
	// 		if (remainingSticks === 0) {
	// 			await game.update({
	// 				sticks: remainingSticks,
	// 				state: 'finished',
	// 				winner: nextPlayer,
	// 				currentPlayer: null
	// 			});
	// 		} else {
	// 			await game.update({
	// 				sticks: remainingSticks,
	// 				currentPlayer: nextPlayer
	// 			});
	// 		}

	// 		// Récupérer la partie mise à jour
	// 		const updatedGame = await Game.findByPk(gameId, {
	// 			include: [
	// 				{
	// 					model: User,
	// 					as: 'player1',
	// 					attributes: ['id', 'username']
	// 				},
	// 				{
	// 					model: User,
	// 					as: 'secondPlayer',
	// 					attributes: ['id', 'username']
	// 				}
	// 			]
	// 		});

	// 		// Notifier les joueurs
	// 		io.to(`game:${gameId}`).emit('gameUpdated', updatedGame);

	// 		if (remainingSticks === 0) {
	// 			io.to(`game:${gameId}`).emit('gameEnded', {
	// 				winner: nextPlayer,
	// 				game: updatedGame
	// 			});
	// 		}

	// 		callback({ status: 'ok', game: updatedGame });
	// 	} catch (error) {
	// 		callback({ status: 'error', error: error.message });
	// 	}
	// });


	// Jouer un coup
	// socket.on('playMove', async ({ gameId, sticksToRemove }, callback) => {
	// 	try {
	// 		const game = await Game.findByPk(gameId, {
	// 			include: [
	// 				{
	// 					model: User,
	// 					as: 'player1',
	// 					attributes: ['id', 'username']
	// 				},
	// 				{
	// 					model: User,
	// 					as: 'secondPlayer',
	// 					attributes: ['id', 'username']
	// 				}
	// 			]
	// 		});

	// 		if (!game || game.state !== 'playing') {
	// 			throw new Error('Partie invalide');
	// 		}

	// 		if (game.currentPlayer !== socket.user.id) {
	// 			throw new Error("Ce n'est pas votre tour");
	// 		}

	// 		if (sticksToRemove < 1 || sticksToRemove > 3) {
	// 			throw new Error('Vous devez retirer entre 1 et 3 bâtonnets');
	// 		}

	// 		if (sticksToRemove > game.sticks) {
	// 			throw new Error(`Il ne reste que ${game.sticks} bâtonnets. Vous ne pouvez pas en retirer ${sticksToRemove}`);
	// 		}

	// 		// Calculer le nouveau nombre de bâtonnets
	// 		const remainingSticks = game.sticks - sticksToRemove;
	// 		const nextPlayer = game.creator === socket.user.id ? game.player2 : game.creator;

	// 		// Si après le coup il reste 1 bâtonnet
	// 		if (remainingSticks === 1) {
	// 			// Le joueur actuel gagne car il force l'autre à prendre le dernier
	// 			await game.update({
	// 				sticks: remainingSticks,
	// 				state: 'finished',
	// 				winner: socket.user.id, // Le joueur actuel gagne
	// 				currentPlayer: null
	// 			});
	// 		}
	// 		// Si le joueur prend le dernier bâtonnet
	// 		else if (remainingSticks === 0) {
	// 			await game.update({
	// 				sticks: remainingSticks,
	// 				state: 'finished',
	// 				winner: nextPlayer,
	// 				currentPlayer: null
	// 			});
	// 		}
	// 		// Sinon, le jeu continue
	// 		else {
	// 			await game.update({
	// 				sticks: remainingSticks,
	// 				currentPlayer: nextPlayer
	// 			});
	// 		}

	// 		// Récupérer la partie mise à jour
	// 		const updatedGame = await Game.findByPk(gameId, {
	// 			include: [
	// 				{
	// 					model: User,
	// 					as: 'player1',
	// 					attributes: ['id', 'username']
	// 				},
	// 				{
	// 					model: User,
	// 					as: 'secondPlayer',
	// 					attributes: ['id', 'username']
	// 				}
	// 			]
	// 		});

	// 		// Notifier les joueurs
	// 		io.to(`game:${gameId}`).emit('gameUpdated', updatedGame);

	// 		// Émettre gameEnded si la partie est terminée
	// 		if (updatedGame.state === 'finished') {
	// 			io.to(`game:${gameId}`).emit('gameEnded', {
	// 				winner: updatedGame.winner,
	// 				game: updatedGame
	// 			});
	// 		}

	// 		callback({ status: 'ok', game: updatedGame });
	// 	} catch (error) {
	// 		callback({ status: 'error', error: error.message });
	// 	}
	// });

	socket.on('playMove', async ({ gameId, sticksToRemove }, callback) => {
		try {
			const game = await Game.findByPk(gameId, {
				include: [
					{ model: User, as: 'player1', attributes: ['id', 'username'] },
					{ model: User, as: 'secondPlayer', attributes: ['id', 'username'] }
				]
			});

			// Vérifications de base
			if (!game || game.state !== 'playing') throw new Error('Partie invalide');
			if (game.currentPlayer !== socket.user.id) throw new Error("Ce n'est pas votre tour");
			if (sticksToRemove < 1 || sticksToRemove > 3) throw new Error('Vous devez retirer entre 1 et 3 bâtonnets');
			if (sticksToRemove > game.sticks) throw new Error(`Il ne reste que ${game.sticks} bâtonnets`);

			const remainingSticks = game.sticks - sticksToRemove;
			const nextPlayer = game.creator === socket.user.id ? game.player2 : game.creator;

			let updateData = {
				sticks: remainingSticks,
				lastPlayer: socket.user.id
			};

			if (remainingSticks === 0) {
				updateData = {
					...updateData,
					state: 'finished',
					winner: socket.user.id,
					currentPlayer: null
				};
				console.log('Fin de partie - État de mise à jour:', updateData);
			} else {
				updateData.currentPlayer = nextPlayer;
			}

			await Game.update(updateData, {
				where: { id: gameId }
			});

			const updatedGame = await Game.findByPk(gameId, {
				include: [
					{ model: User, as: 'player1', attributes: ['id', 'username'] },
					{ model: User, as: 'secondPlayer', attributes: ['id', 'username'] }
				]
			});

			io.to(gameId).emit('gameUpdated', updatedGame);
			if (updatedGame.state === 'finished') {
				io.to(gameId).emit('gameEnded', {
					winner: updatedGame.winner,
					game: updatedGame
				});
			}

			callback({ status: 'ok', game: updatedGame });
		} catch (error) {
			callback({ status: 'error', error: error.message });
		}
	});



	// Gérer la déconnexion
	socket.on('disconnect', () => {
		//console.log(chalk.yellow('Client déconnecté:', socket.id));
		userSockets.delete(socket.user.id);

		// Mettre à jour les parties où le joueur était actif
		Game.findAll({
			where: {
				[Op.or]: [
					{ creator: socket.user.id },
					{ player2: socket.user.id }
				],
				state: 'playing'
			}
		}).then(games => {
			games.forEach(async (game) => {
				await game.update({
					state: 'finished',
					winner: game.creator === socket.user.id ? game.player2 : game.creator
				});
				io.to(`game:${game.id}`).emit('playerDisconnected', {
					gameId: game.id,
					userId: socket.user.id
				});
			});
		});
	});
});

// // Décorer Fastify avec io
// app.decorate('io', io);

// Configuration Fastify
await app
	.register(fastifyBcrypt, {
		saltWorkFactor: 12,
	})
	.register(cors, {
		origin: "http://localhost:5173",
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization']
	})
	.register(fastifyJWT, {
		secret: "unanneaupourlesgouvernertous",
	});
// Définir le middleware d'authentification
app.decorate("authenticate", async (request, reply) => {
	try {
		const token = request.headers["authorization"]?.split(" ")[1];
		if (!token) {
			return reply.code(401).send({ error: "Token manquant" });
		}
		await request.jwtVerify();
	} catch (err) {
		reply.code(401).send(err);
	}
});

// Configuration Socket.IO et autres...

// Ajouter les routes APRÈS la définition du middleware authenticate
usersRoutes(app);
gamesRoutes(app);
//console.log("Routes disponibles:", app.printRoutes());


// Démarrage du serveur
const start = async () => {
	try {
		await sequelize.sync({ alter: true, logging: console.log });
		//console.log(chalk.green("Base de données synchronisée."));

		await app.listen({
			port: 3000,
			host: '0.0.0.0'
		});

		// Attacher Socket.IO au serveur après le démarrage de Fastify
		io.attach(app.server);

		//console.log("Serveur Fastify lancé sur " + chalk.blue("http://localhost:3000"));
		//console.log("Socket.IO est prêt à recevoir des connexions");
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
};

start();