import User from "../models/users.js";
import { Op } from "sequelize";
import crypto from "crypto";
// backend/controllers/users.js

import jwt from 'jsonwebtoken';
import { transporter } from '../config/emailConfig.js';
import { getVerificationEmailTemplate } from '../template/template.js'

// generate random unique id
function generateRandomId(length = 10) {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		result += characters[randomIndex];
	}
	return result;
}

export async function getUsers() {
	return await User.findAll();
}
export async function getUserById(id) {
	return await User.findByPk(id);
}
export async function findAndCountAllUsersById(id) {
	return await User.findAndCountAll({
		where: {
			id: {
				[Op.like]: `${id}%`,
			},
		},
	});
}
export async function findAndCountAllUsersByEmail(email) {
	return await User.findAndCountAll({
		where: {
			email: {
				[Op.eq]: email,
			},
		},
	});
}
export async function findAndCountAllUsersByUsername(username) {
	return await User.findAndCountAll({
		where: {
			username: {
				[Op.eq]: username,
			},
		},
	});
}
export async function registerUser(userDatas, bcryptInstance) {
	if (!userDatas) {
		return { error: "Aucune donnée à enregistrer" };
	}

	const { firstname, lastname, username, email, password } = userDatas;
	if (!firstname || !lastname || !username || !email || !password) {
		return { error: "Tous les champs sont obligatoires" };
	}
	// Vérification que l'email n'est pas déjà utilisé
	const { count: emailCount } = await findAndCountAllUsersByEmail(email);
	if (emailCount > 0) {
		return { error: "L'adresse email est déjà utilisée." };
	}

	// Vérification que le pseudo n'est pas déjà utilisé
	const { count: usernameCount } = await findAndCountAllUsersByUsername(username);
	if (usernameCount > 0) {
		return { error: "Le nom d'utilisateur est déjà utilisé." };
	}
	// Hasher le mot de passe
	const hashedPassword = await bcryptInstance.hash(password, 12);

	// Créer l'utilisateur avec `verified` à `false` et stocker le token
	const verificationToken = crypto.randomBytes(20).toString("hex");
	const user = await User.create({
		id: generateRandomId(12),
		firstname,
		lastname,
		username,
		email,
		password, // Stocker le mot de passe haché après
		verified: false,
		verificationToken
	});

	// Generate the verification link
	// const confirmationLink = `http://localhost:3000/verify-email/${verificationToken}`;
	const confirmationLink = `${process.env.BACKEND_URL}/verify-email/${verificationToken}`;

	// Generate the email HTML
	const emailHtml = getVerificationEmailTemplate(confirmationLink);

	// Envoyer l'e-mail
	await transporter.sendMail({
		from: 'dadamicro1@gmail.com',
		to: email,
		subject: 'Confirmez votre adresse e-mail',
		html: emailHtml,
	});

	return { message: 'Utilisateur créé. Veuillez vérifier votre e-mail pour confirmer votre adresse.' };
}




// backend/controllers/users.js

export async function loginUser(userDatas, app) {
	if (!userDatas) {
		throw { status: 400, message: "Aucune donnée n'a été envoyée" };
	}

	const { email, password } = userDatas;

	if (!email || !password) {
		throw { status: 400, message: "Tous les champs sont obligatoires" };
	}

	// Récupération de l'utilisateur par email
	const user = await User.findOne({
		where: {
			email: email,
		},
	});

	if (!user) {
		throw {
			status: 401,
			message: "Il n'y a pas d'utilisateur associé à cette adresse email.",
		};
	}

	// Comparaison des mots de passe (sans hashage pour le moment)
	const match = password === user.password;

	if (!match) {
		throw { status: 401, message: "Mot de passe incorrect" };
	}

	// Générer le token JWT
	const token = app.jwt.sign(
		{ id: user.id, username: user.username },
		process.env.JWT_SECRET,
		{ expiresIn: "3h" }
	);

	// Renvoi du token et des informations utilisateur
	return {
		token,
		user: {
			id: user.id,
			username: user.username,
			email: user.email,
		},
	};
}


export async function verifyEmail(token) {
	const user = await User.findOne({ where: { verificationToken: token } });

	if (!user) {
		return { error: "Invalid verification token" };
	}

	user.verified = true;
	user.verificationToken = null;
	await user.save();

	return { message: "Email verified successfully. You can now log in." };
}
