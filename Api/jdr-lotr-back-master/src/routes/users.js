import {
	getUserById,
	getUsers,
	loginUser,
	registerUser,
} from "../controllers/users.js";
import { verifyEmail } from '../controllers/users.js'
export function usersRoutes(app) {
	// Route de connexion avec gestion des erreurs
	app.post("/login", async (request, reply) => {
		try {
			console.log("Requête reçue pour /login :", request.body);
			const result = await loginUser(request.body, app);
			reply.send(result); // { token, user: { id, username } }
		} catch (error) {
			console.error("Erreur lors de la connexion :", error);
			reply.status(error.status || 500).send({ error: error.message || "Erreur serveur." });
		}
	})
		.post(
			"/logout",
			{ preHandler: [app.authenticate] },
			async (request, reply) => {
				const token = request.headers["authorization"].split(" ")[1]; // Récupérer le token depuis l'en-tête Authorization

				// Ajouter le token à la liste noire
				blacklistedTokens.push(token);

				reply.send({ logout: true });
			}
		);

	// Route d'inscription avec gestion des erreurs
	app.post("/register", async (request, reply) => {
		try {
			const result = await registerUser(request.body, app.bcrypt);
			if (result.error) {
				reply.status(400).send({ error: result.error });
			} else {
				reply.send(result); // { message: 'Utilisateur créé...' }
			}
		} catch (error) {
			console.error("Erreur lors de l'inscription :", error);
			reply.status(500).send({ error: "Erreur serveur." });
		}
	});

	// Récupération de la liste des utilisateurs avec gestion des erreurs
	app.get("/users", async (request, reply) => {
		try {
			const users = await getUsers();
			reply.send(users);
		} catch (error) {
			console.error("Erreur lors de la récupération des utilisateurs :", error);
			reply.status(500).send({ error: "Erreur serveur." });
		}
	});

	// Récupération d'un utilisateur par son id avec gestion des erreurs
	app.get("/users/:id", async (request, reply) => {
		try {
			const user = await getUserById(request.params.id);
			if (!user) {
				reply.status(404).send({ error: "Utilisateur non trouvé." });
			} else {
				reply.send(user);
			}
		} catch (error) {
			console.error("Erreur lors de la récupération de l'utilisateur :", error);
			reply.status(500).send({ error: "Erreur serveur." });
		}
	});

	// Route de vérification d'email avec gestion des erreurs
	app.get("/verify-email/:token", async (request, reply) => {
		try {
			const result = await verifyEmail(request.params.token);
			if (result.error) {
				reply.status(400).send({ error: result.error });
			} else {
				reply.send(result); // { message: "Email verified successfully..." }
			}
		} catch (error) {
			console.error("Erreur lors de la vérification de l'email :", error);
			reply.status(500).send({ error: "Erreur serveur." });
		}
	});
}