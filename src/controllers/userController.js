
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail, findUserById, updateUser, deleteUser } from '../database/database.js';
import { JWT_SECRET } from '../config.js';

/**
 * Registra um novo usuário.
 */
export const register = (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
    }

    const newUser = { 
        name, 
        email, 
        password,
        profilePicture: '/images/default-profile.png'
    };

    createUser(newUser, (err, user) => {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed: users.email')) {
                return res.status(409).json({ message: 'Este email já está cadastrado.' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Usuário criado com sucesso!', userId: user.id });
    });
};

/**
 * Autentica um usuário e retorna um token.
 */
export const login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    findUserByEmail(email, (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ message: 'Credenciais inválidas.' });

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!isMatch) return res.status(401).json({ message: 'Credenciais inválidas.' });
            
            const payload = { id: user.id, email: user.email, isAdmin: user.isAdmin };
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

            res.status(200).json({
                message: 'Login bem-sucedido!',
                token: token,
                user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin }
            });
        });
    });
};

/**
 * Busca o perfil do usuário logado.
 */
export const getUserProfile = (req, res) => {
    const userId = req.user.id; 

    findUserById(userId, (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
        
        res.status(200).json(user);
    });
};

/**
 * Atualiza o perfil do usuário logado.
 */
export const updateUserProfile = (req, res) => {
    const userId = req.user.id;
    const userData = req.body;

    updateUser(userId, userData, (err, success) => {
        if (err) {
            // Se o erro for de CPF duplicado
            if (err.message.includes('UNIQUE constraint failed: users.cpf')) {
                return res.status(409).json({ message: 'Este CPF já está em uso por outra conta.' }); // 409 Conflict
            }
            // Se o erro for de email duplicado
            if (err.message.includes('UNIQUE constraint failed: users.email')) {
                return res.status(409).json({ message: 'Este email já está em uso por outra conta.' });
            }
            // Para outros erros genéricos de banco
            return res.status(500).json({ error: err.message });
        }
        if (!success) return res.status(404).json({ message: 'Usuário não encontrado para atualizar.' });

        res.status(200).json({ message: 'Perfil atualizado com sucesso!' });
    });
};

/**
 * Deleta o perfil do usuário logado.
 */
export const deleteUserProfile = (req, res) => {
    const userId = req.user.id;

    deleteUser(userId, (err, success) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!success) return res.status(404).json({ message: 'Usuário não encontrado para deletar.' });

        res.status(200).json({ message: 'Usuário deletado com sucesso.' });
    });
};

