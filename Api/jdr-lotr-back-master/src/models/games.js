// models/games.js
import { DataTypes } from "@sequelize/core";
import { sequelize } from "../bdd.js";
import User from "./users.js";

const Game = sequelize.define("game", {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true,
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	state: {
		type: DataTypes.ENUM("pending", "playing", "finished"),
		defaultValue: "pending",
	},
	sticks: {
		type: DataTypes.INTEGER,
		defaultValue: 21,
	},
	currentPlayer: {
		type: DataTypes.STRING,
		allowNull: true,
	},
	winner: {
		type: DataTypes.STRING,
		allowNull: true,
	},
	lastPlayer: {
		type: DataTypes.STRING,
		allowNull: true,
	},
	player2: {
		type: DataTypes.STRING,
		allowNull: true,
	},
	gameType: {
		type: DataTypes.ENUM('normal', 'ranked'),
		defaultValue: 'normal'
	},
	maxPlayers: {
		type: DataTypes.INTEGER,
		defaultValue: 2
	},
	saveState: {
		type: DataTypes.JSON,
		allowNull: true
	},
	lastSaved: {
		type: DataTypes.DATE,
		allowNull: true
	}
}, {
	tableName: 'games',
	timestamps: true
});

Game.belongsTo(User, { as: "player1", foreignKey: "creator" });
Game.belongsTo(User, { as: "secondPlayer", foreignKey: "player2", allowNull: true });

export default Game;