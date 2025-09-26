import jwt from 'jsonwebtoken';

// Chave "secreta", mesma do userController.js
import { JWT_SECRET } from '../config.js';

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        // Se não há token, o acesso é não autorizado
        return res.sendStatus(401); 
    }

    // Verifica se o token é válido
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            // Se o token for inválido ou expirado, o acesso é proibido
            return res.sendStatus(403); 
        }
        
        // Se o token for válido, adiciona os dados do usuário (payload) ao objeto 'req'
        // para que as próximas funções (como getUserProfile) possam usá-lo.
        req.user = user;
        
        // Passa para a próxima função (o controller)
        next();
    });
};