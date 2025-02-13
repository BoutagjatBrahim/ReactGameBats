// controllers/games.js
import Game from "../models/games.js";
import User from "../models/users.js";
import { Op } from "sequelize";

export async function getAvailableGames() {
	try {
		const games = await Game.findAll({
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
		return games;
	} catch (error) {
		console.error("Erreur lors de la récupération des parties:", error);
		throw error;
	}
}

export async function createGame(data) {
	try {
		console.log("Création du jeu avec les données:", data);

		if (!data.userId) {
			throw new Error("ID utilisateur manquant");
		}

		// Dans controllers/games.js, fonction createGame
		const game = await Game.create({
			name: data.name || `Partie de ${data.userId}`,
			creator: data.userId,
			state: 'pending',
			sticks: 21,
			currentPlayer: data.userId, // S'assurer que cette valeur est bien définie
			gameType: data.gameType || 'normal',
			maxPlayers: data.maxPlayers || 2
		});
		console.log("Jeu créé:", game.toJSON());

		const gameWithRelations = await Game.findByPk(game.id, {
			include: [
				{
					model: User,
					as: 'player1',
					attributes: ['id', 'username']
				}
			]
		});

		return gameWithRelations;
	} catch (error) {
		console.error("Erreur lors de la création du jeu:", error);
		throw error;
	}
}

export async function joinGame(gameId, userId) {
	try {
		const game = await Game.findByPk(gameId);

		if (!game) {
			throw new Error('Partie non trouvée');
		}

		if (game.state !== 'pending') {
			throw new Error('Cette partie n\'est plus disponible');
		}

		if (game.creator === userId) {
			throw new Error('Vous ne pouvez pas rejoindre votre propre partie');
		}

		if (game.player2) {
			throw new Error('Cette partie est déjà complète');
		}

		// Dans la route PATCH /game/join/:gameId
		await game.update({
			player2: userId,
			state: 'playing',
			currentPlayer: game.creator // S'assurer que le créateur commence
		});


		// Obtenir la partie mise à jour avec les relations
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

		// Émettre l'événement pour tous les joueurs
		if (app.io) {
			app.io.emit('gameUpdated', updatedGame);
			app.io.emit('playerJoined', {
				gameId,
				player: request.user
			});
		}
		return await Game.findByPk(gameId, {
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
	} catch (error) {
		console.error("Erreur lors de la rejointe de la partie:", error);
		throw error;
	}
}

// export async function playTurn(gameId, userId, sticksToRemove) {
// 	try {
// 		const game = await Game.findByPk(gameId);

// 		if (!game) {
// 			throw new Error('Partie non trouvée');
// 		}

// 		if (game.state !== 'playing') {
// 			throw new Error('Cette partie n\'est pas en cours');
// 		}

// 		if (game.currentPlayer !== userId) {
// 			throw new Error('Ce n\'est pas votre tour');
// 		}

// 		if (sticksToRemove < 1 || sticksToRemove > 3) {
// 			throw new Error('Vous devez retirer entre 1 et 3 bâtonnets');
// 		}

// 		// Modification du message d'erreur pour être plus spécifique
// 		if (sticksToRemove > game.sticks) {
// 			if (game.sticks === 1) {
// 				throw new Error('Il ne reste qu\'un seul bâtonnet. Vous devez en retirer 1.');
// 			} else {
// 				throw new Error(`Il ne reste que ${game.sticks} bâtonnets. Vous ne pouvez pas en retirer ${sticksToRemove}`);
// 			}
// 		}

// 		const remainingSticks = game.sticks - sticksToRemove;
// 		console.log(`Bâtonnets restants après le coup: ${remainingSticks}`);

// 		const nextPlayer = game.creator === userId ? game.player2 : game.creator;

// 		// Construire l'objet de mise à jour
// 		const updateData = {
// 			sticks: remainingSticks,
// 			lastMoveSticks: sticksToRemove,
// 			lastPlayer: userId
// 		};


// 		// Si c'est le dernier coup (plus de bâtonnets)
// 		if (remainingSticks === 0) {
// 			updateData.state = 'finished';
// 			updateData.winner = userId;
// 			updateData.currentPlayer = null;
// 			updateData.lastPlayer = userId;
// 			console.log('Fin de partie - Gagnant:', userId);
// 		} else {
// 			updateData.currentPlayer = nextPlayer;
// 			updateData.state = 'playing';
// 		}

// 		await game.update(updateData);
// 		// Après la mise à jour
// 		// const updatedGame = await game.update(updateData);
// 		// console.log('=== État final de la partie ===');
// 		// console.log('Game after update:', {
// 		// 	state: updatedGame.state,
// 		// 	winner: updatedGame.winner,
// 		// 	sticks: updatedGame.sticks,
// 		// 	currentPlayer: updatedGame.currentPlayer
// 		// });

// 		// return await Game.findByPk(gameId, {
// 		// 	include: [
// 		// 		{
// 		// 			model: User,
// 		// 			as: 'player1',
// 		// 			attributes: ['id', 'username']
// 		// 		},
// 		// 		{
// 		// 			model: User,
// 		// 			as: 'secondPlayer',
// 		// 			attributes: ['id', 'username']
// 		// 		}
// 		// 	]
// 		// });
// 		// Vérifier l'état après la mise à jour
// 		return await Game.findByPk(gameId, {
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

// 		// console.log('État final de la partie:', {
// 		// 	state: updatedGame.state,
// 		// 	winner: updatedGame.winner,
// 		// 	sticks: updatedGame.sticks,
// 		// 	currentPlayer: updatedGame.currentPlayer
// 		// });

// 		// return updatedGame;
// 	} catch (error) {
// 		console.error("Erreur lors du coup:", error);
// 		throw error;
// 	}
// }

export async function playTurn(gameId, userId, sticksToRemove) {
	try {
		const game = await Game.findByPk(gameId);
		if (!game) throw new Error('Partie non trouvée');

		const remainingSticks = game.sticks - sticksToRemove;
		const nextPlayer = game.creator === userId ? game.player2 : game.creator;

		let updateData = {
			sticks: remainingSticks,
			lastMoveSticks: sticksToRemove,
			lastPlayer: userId
		};

		if (remainingSticks === 0) {
			updateData = {
				...updateData,
				state: 'finished',
				winner: userId,
				currentPlayer: null
			};
			console.log('État de fin de partie:', updateData);
		} else {
			updateData = {
				...updateData,
				currentPlayer: nextPlayer,
				state: 'playing'
			};
		}

		const [updateSuccess] = await Game.update(updateData, {
			where: { id: gameId }
		});

		if (!updateSuccess) throw new Error('Échec de la mise à jour');

		const updatedGame = await Game.findByPk(gameId, {
			include: [
				{ model: User, as: 'player1', attributes: ['id', 'username'] },
				{ model: User, as: 'secondPlayer', attributes: ['id', 'username'] }
			]
		});

		console.log('État final après mise à jour:', {
			state: updatedGame.state,
			winner: updatedGame.winner,
			currentPlayer: updatedGame.currentPlayer
		});

		return updatedGame;
	} catch (error) {
		console.error("Erreur lors du coup:", error);
		throw error;
	}
}
export async function getUserGames(userId) {
	try {
		return await Game.findAll({
			where: {
				[Op.or]: [
					{ creator: userId },
					{ player2: userId }
				]
			},
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
	} catch (error) {
		console.error("Erreur lors de la récupération des parties de l'utilisateur:", error);
		throw error;
	}
}