// routes/games.js
import { getUserGames, createGame } from '../controllers/games.js';
import Game from '../models/games.js';  // Ajoutez cet import
import User from '../models/users.js';
// routes/games.js
import { Op } from "sequelize";
export function gamesRoutes(app) {
	// // Obtenir les parties d'un utilisateur
	// app.get(
	// 	"/games/user",
	// 	{ preHandler: [app.authenticate] },
	// 	async (request, reply) => {
	// 		try {
	// 			console.log("Récupération des parties pour l'utilisateur:", request.user.id);

	// 			const games = await getUserGames(request.user.id);
	// 			console.log("Parties trouvées:", games);

	// 			reply.send({ games });
	// 		} catch (error) {
	// 			console.error("Erreur lors de la récupération des parties:", error);
	// 			reply.code(500).send({
	// 				error: true,
	// 				message: error.message || 'Erreur lors de la récupération des parties'
	// 			});
	// 		}
	// 	}
	// );
	app.get('/games/available', { preHandler: [app.authenticate] }, async (request, reply) => {
		try {
			const games = await Game.findAll({
				where: {
					state: 'pending',
					player2: null
				},
				include: [
					{ model: User, as: 'player1', attributes: ['id', 'username'] }
				]
			});
			reply.send({ games });
		} catch (error) {
			reply.code(500).send({ error: error.message });
		}
	});

	// routes/games.js
	app.get('/games/user', { preHandler: [app.authenticate] }, async (request, reply) => {
		try {
			const games = await Game.findAll({
				where: {
					[Op.or]: [
						{ creator: request.user.id },
						{ player2: request.user.id }
					]
				},
				include: [
					{ model: User, as: 'player1', attributes: ['id', 'username'] },
					{ model: User, as: 'secondPlayer', attributes: ['id', 'username'] }
				],
				order: [['updatedAt', 'DESC']]
			});

			reply.send({ games });
		} catch (error) {
			console.error(error);
			reply.code(500).send({
				error: true,
				message: error.message || 'Erreur serveur'
			});
		}
	});

	app.post('/game/:gameId/save', { preHandler: [app.authenticate] }, async (request, reply) => {
		const { gameId } = request.params;
		const game = await Game.findByPk(gameId);

		await game.update({
			saveState: {
				sticks: game.sticks,
				currentPlayer: game.currentPlayer,
				lastPlayer: game.lastPlayer
			},
			lastSaved: new Date()
		});

		reply.send({ status: 'saved' });
	});

	app.post('/game/:gameId/load', { preHandler: [app.authenticate] }, async (request, reply) => {
		const { gameId } = request.params;
		const game = await Game.findByPk(gameId);

		if (!game.saveState) {
			return reply.code(404).send({ error: 'Pas de sauvegarde trouvée' });
		}

		await game.update({
			...game.saveState,
			state: 'playing'
		});

		reply.send(game);
	});
	app.post("/game", {
		preHandler: [app.authenticate]
	}, async (request, reply) => {
		try {
			const userId = request.user.id;
			console.log("Création de partie - User ID:", userId);
			console.log("Données reçues:", request.body);

			const gameData = {
				userId: userId,
				name: request.body.name || `Partie de ${userId}`,
				gameType: request.body.gameType || 'normal',
				maxPlayers: request.body.maxPlayers || 2
			};

			const game = await createGame(gameData);

			// Émettre un événement Socket.IO
			if (app.io) {
				app.io.emit('gameCreated', game);
			}

			console.log("Partie créée avec succès:", game.id);
			reply.send(game);
		} catch (error) {
			console.error("Erreur création partie:", error);
			reply.code(500).send({
				error: error.message || "Erreur lors de la création de la partie"
			});
		}
	});


	// Dans routes/games.js où vous gérez la route GET /game/:gameId
	app.get('/game/:gameId', { preHandler: [app.authenticate] }, async (request, reply) => {
		try {
			const { gameId } = request.params;
			const userId = request.user.id;

			// console.log("Récupération des détails de la partie:", {
			// 	gameId,
			// 	userId
			// });

			const game = await Game.findOne({
				where: { id: gameId },
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

			if (!game) {
				//console.log("Partie non trouvée");
				return reply.code(404).send({
					error: 'Partie non trouvée'
				});
			}



			// Envoyer la réponse complète
			reply.send({
				...game.toJSON(),
				state: game.state,
				sticks: game.sticks,
				creator: game.creator,
				player2: game.player2,
				currentPlayer: game.currentPlayer,
				winner: game.winner,
				lastPlayer: game.lastPlayer,
				player1: game.player1,
				secondPlayer: game.secondPlayer
			});

		} catch (error) {
			console.error("Erreur lors de la récupération de la partie:", error);
			reply.code(500).send({
				error: 'Erreur lors de la récupération de la partie'
			});
		}
	});




	// app.patch('/game/join/:gameId', { preHandler: [app.authenticate] }, async (request, reply) => {
	// 	try {
	// 		const { gameId } = request.params;
	// 		const userId = request.user.id;

	// 		console.log("\n=== Tentative de rejoindre une partie ===");
	// 		console.log("GameID:", gameId);
	// 		console.log("UserId qui tente de rejoindre:", userId);

	// 		// Vérifier si la partie existe
	// 		const game = await Game.findOne({
	// 			where: { id: gameId }
	// 		});

	// 		if (!game) {
	// 			console.log("Partie non trouvée");
	// 			return reply.code(404).send({
	// 				error: 'Partie non trouvée'
	// 			});
	// 		}

	// 		console.log("\nDétails de la partie:");
	// 		console.log("Creator ID:", game.creator, typeof game.creator);
	// 		console.log("User ID rejoignant:", userId, typeof userId);
	// 		console.log("Sont-ils égaux?", game.creator === userId);

	// 		// Comparaison avec conversion explicite
	// 		const creatorId = String(game.creator);
	// 		const joiningUserId = String(userId);

	// 		console.log("\nAprès conversion en string:");
	// 		console.log("Creator ID:", creatorId, typeof creatorId);
	// 		console.log("User ID rejoignant:", joiningUserId, typeof joiningUserId);
	// 		console.log("Sont-ils égaux?", creatorId === joiningUserId);

	// 		if (creatorId === joiningUserId) {
	// 			console.log("⚠️ Tentative de rejoindre sa propre partie!");
	// 			return reply.code(400).send({
	// 				error: 'Vous ne pouvez pas rejoindre votre propre partie'
	// 			});
	// 		}

	// 		if (game.state !== 'pending') {
	// 			return reply.code(400).send({
	// 				error: 'Cette partie n\'est plus disponible'
	// 			});
	// 		}

	// 		if (game.player2) {
	// 			return reply.code(400).send({
	// 				error: 'Cette partie est déjà complète'
	// 			});
	// 		}

	// 		console.log("\nMise à jour de la partie avec le nouveau joueur");
	// 		// Mettre à jour la partie
	// 		await game.update({
	// 			player2: userId,
	// 			state: 'playing'
	// 		});

	// 		const updatedGame = await Game.findOne({
	// 			where: { id: gameId },
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

	// 		console.log("\nPartie mise à jour avec succès:", updatedGame.toJSON());

	// 		reply.send(updatedGame);
	// 	} catch (error) {
	// 		console.error('Erreur détaillée:', error);
	// 		reply.code(500).send({
	// 			error: `Erreur lors de la rejointe de la partie: ${error.message}`
	// 		});
	// 	}
	// });


	app.patch('/game/join/:gameId', { preHandler: [app.authenticate] }, async (request, reply) => {
		try {
			const { gameId } = request.params;
			const userId = request.user.id;

			console.log("\n=== Tentative de rejoindre une partie ===");
			console.log("GameID:", gameId);
			console.log("UserId qui tente de rejoindre:", userId);

			// Vérifier si la partie existe
			const game = await Game.findOne({
				where: { id: gameId }
			});

			if (!game) {
				console.log("Partie non trouvée");
				return reply.code(404).send({
					error: 'Partie non trouvée'
				});
			}

			console.log("\nDétails de la partie:");
			console.log("Creator ID:", game.creator, typeof game.creator);
			console.log("User ID rejoignant:", userId, typeof userId);
			console.log("Sont-ils égaux?", game.creator === userId);

			// Comparaison avec conversion explicite
			const creatorId = String(game.creator);
			const joiningUserId = String(userId);

			console.log("\nAprès conversion en string:");
			console.log("Creator ID:", creatorId, typeof creatorId);
			console.log("User ID rejoignant:", joiningUserId, typeof joiningUserId);
			console.log("Sont-ils égaux?", creatorId === joiningUserId);

			if (creatorId === joiningUserId) {
				console.log("⚠️ Tentative de rejoindre sa propre partie!");
				return reply.code(400).send({
					error: 'Vous ne pouvez pas rejoindre votre propre partie'
				});
			}

			if (game.state !== 'pending') {
				return reply.code(400).send({
					error: 'Cette partie n\'est plus disponible'
				});
			}

			if (game.player2) {
				return reply.code(400).send({
					error: 'Cette partie est déjà complète'
				});
			}

			console.log("\nMise à jour de la partie avec le nouveau joueur");
			// Mettre à jour la partie
			await game.update({
				player2: userId,
				state: 'playing'
			});

			const updatedGame = await Game.findOne({
				where: { id: gameId },
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

			console.log("\nPartie mise à jour avec succès:", updatedGame.toJSON());

			reply.send(updatedGame);
		} catch (error) {
			console.error('Erreur détaillée:', error);
			reply.code(500).send({
				error: `Erreur lors de la rejointe de la partie: ${error.message}`
			});
		}
	});


	// app.post('/game/:gameId/play', { preHandler: [app.authenticate] }, async (request, reply) => {
	// 	try {
	// 		const { gameId } = request.params;
	// 		const { sticksToRemove } = request.body;
	// 		const userId = request.user.id;

	// 		console.log("=== Tentative de jouer un coup ===");
	// 		console.log("GameID:", gameId);
	// 		console.log("UserID:", userId);
	// 		console.log("Bâtonnets à retirer:", sticksToRemove);

	// 		const game = await Game.findOne({
	// 			where: { id: gameId },
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

	// 		console.log("État actuel de la partie:", {
	// 			currentPlayer: game.currentPlayer,
	// 			sticks: game.sticks,
	// 			state: game.state
	// 		});

	// 		// Vérifications
	// 		if (!game) {
	// 			return reply.code(404).send({
	// 				error: 'Partie non trouvée'
	// 			});
	// 		}

	// 		if (game.state !== 'playing') {
	// 			return reply.code(400).send({
	// 				error: 'La partie n\'est pas en cours'
	// 			});
	// 		}

	// 		if (game.currentPlayer !== userId) {
	// 			return reply.code(400).send({
	// 				error: 'Ce n\'est pas votre tour'
	// 			});
	// 		}

	// 		if (sticksToRemove < 1 || sticksToRemove > 3) {
	// 			return reply.code(400).send({
	// 				error: 'Vous devez retirer entre 1 et 3 bâtonnets'
	// 			});
	// 		}

	// 		// Calculer le nouveau nombre de bâtonnets
	// 		const remainingSticks = game.sticks - sticksToRemove;
	// 		console.log("Bâtonnets restants après le coup:", remainingSticks);

	// 		if (remainingSticks < 0) {
	// 			return reply.code(400).send({
	// 				error: 'Il n\'y a pas assez de bâtonnets'
	// 			});
	// 		}

	// 		const nextPlayer = game.creator === userId ? game.player2 : game.creator;
	// 		console.log("Prochain joueur:", nextPlayer);

	// 		// Mise à jour du jeu avec le prochain joueur
	// 		if (remainingSticks === 0) {
	// 			await game.update({
	// 				sticks: remainingSticks,
	// 				state: 'finished',
	// 				winner: userId,  // Le joueur actuel est le gagnant
	// 				currentPlayer: null,
	// 				lastPlayer: userId
	// 			});
	// 		} else {
	// 			await game.update({
	// 				sticks: remainingSticks,
	// 				currentPlayer: nextPlayer
	// 			});
	// 		}

	// 		const updatedGame = await Game.findOne({
	// 			where: { id: gameId },
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

	// 		console.log("État mis à jour:", {
	// 			currentPlayer: updatedGame.currentPlayer,
	// 			sticks: updatedGame.sticks,
	// 			state: updatedGame.state
	// 		});

	// 		// // Notifier via Socket.IO
	// 		// if (app.io) {
	// 		// 	app.io.to(`game:${gameId}`).emit('gameUpdated', updatedGame);

	// 		// 	if (remainingSticks === 0) {
	// 		// 		app.io.to(`game:${gameId}`).emit('gameEnded', {
	// 		// 			winner: nextPlayer,
	// 		// 			game: updatedGame
	// 		// 		});
	// 		// 	}
	// 		// }
	// 		if (app.io) {
	// 			// 
	// 			app.io.to(`game:${gameId}`).emit('gameUpdated', updatedGame);
	// 			if (updatedGame.state === 'finished') {
	// 				app.io.to(`game:${gameId}`).emit('gameEnded', {
	// 					winner: updatedGame.winner,
	// 					game: updatedGame
	// 				});
	// 			}
	// 		}

	// 		// reply.send(updatedGame);
	// 		reply.send({
	// 			...updatedGame.toJSON(),
	// 			winner: updatedGame.winner,
	// 			lastPlayer: updatedGame.lastPlayer
	// 		});
	// 		console.log("État final complet:", {
	// 			sticks: updatedGame.sticks,
	// 			state: updatedGame.state,
	// 			winner: updatedGame.winner,
	// 			lastPlayer: updatedGame.lastPlayer
	// 		});

	// 	} catch (error) {
	// 		console.error("Erreur lors du coup:", error);
	// 		reply.code(500).send({
	// 			error: 'Erreur lors du coup: ' + error.message
	// 		});
	// 	}
	// });


	app.post('/game/:gameId/play', { preHandler: [app.authenticate] }, async (request, reply) => {
		try {
			const { gameId } = request.params;
			const { sticksToRemove } = request.body;
			const userId = request.user.id;

			console.log("=== Tentative de jouer un coup ===");
			console.log("GameID:", gameId);
			console.log("UserID:", userId);
			console.log("Bâtonnets à retirer:", sticksToRemove);

			const game = await Game.findOne({
				where: { id: gameId },
				include: [
					{ model: User, as: 'player1', attributes: ['id', 'username'] },
					{ model: User, as: 'secondPlayer', attributes: ['id', 'username'] }
				]
			});

			// Vérifications
			if (!game) return reply.code(404).send({ error: 'Partie non trouvée' });
			if (game.state !== 'playing') return reply.code(400).send({ error: 'La partie n\'est pas en cours' });
			if (game.currentPlayer !== userId) return reply.code(400).send({ error: 'Ce n\'est pas votre tour' });
			if (sticksToRemove < 1 || sticksToRemove > 3) return reply.code(400).send({ error: 'Vous devez retirer entre 1 et 3 bâtonnets' });

			const remainingSticks = game.sticks - sticksToRemove;
			if (remainingSticks < 0) return reply.code(400).send({ error: 'Il n\'y a pas assez de bâtonnets' });

			const nextPlayer = game.creator === userId ? game.player2 : game.creator;
			const updateData = {
				sticks: remainingSticks,
				lastPlayer: userId
			};

			if (remainingSticks === 0) {
				Object.assign(updateData, {
					state: 'finished',
					winner: userId,
					currentPlayer: null
				});
			} else {
				Object.assign(updateData, {
					currentPlayer: nextPlayer,
					state: 'playing'
				});
			}

			await game.update(updateData);

			const updatedGame = await Game.findOne({
				where: { id: gameId },
				include: [
					{ model: User, as: 'player1', attributes: ['id', 'username'] },
					{ model: User, as: 'secondPlayer', attributes: ['id', 'username'] }
				]
			});

			console.log("État final:", {
				sticks: updatedGame.sticks,
				state: updatedGame.state,
				winner: updatedGame.winner,
				lastPlayer: updatedGame.lastPlayer
			});

			if (app.io) {
				app.io.to(`game:${gameId}`).emit('gameUpdated', updatedGame);
				if (updatedGame.state === 'finished') {
					app.io.to(`game:${gameId}`).emit('gameEnded', {
						winner: updatedGame.winner,
						game: updatedGame
					});
				}
			}

			reply.send(updatedGame.toJSON());

		} catch (error) {
			console.error("Erreur lors du coup:", error);
			reply.code(500).send({ error: 'Erreur lors du coup: ' + error.message });
		}
	});

}