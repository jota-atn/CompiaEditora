
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail } from '../database/database.js';

//Chave Secreta para o JWT
// Em um projeto real, isso NUNCA deve estar no código.
// Deve vir de uma variável de ambiente (process.env.JWT_SECRET)
// Por motivos de simplicidade ficara assim
const JWT_SECRET = 'seu-segredo-super-secreto';

/**
 * Registra um novo usuário.
 */
export const register = (req, res) => {
    const { name, email, password } = req.body;

    // Validação simples
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
    }

    const newUser = { name, email, password };

    createUser(newUser, (err, user) => {
        if (err) {
            // Verifica se o erro é de email duplicado (UNIQUE constraint)
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
        
        // Se o usuário não for encontrado
        if (!user) {
            return res.status(401).json({ message: 'Credenciais inválidas.' }); // 401 Unauthorized
        }

        // Compara a senha enviada com a senha criptografada no banco
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).json({ error: err.message });
            
            // Se as senhas não baterem
            if (!isMatch) {
                return res.status(401).json({ message: 'Credenciais inválidas.' }); // 401 Unauthorized
            }
            
            // Se as senhas baterem, cria o token JWT
            const payload = { id: user.id, email: user.email };
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Token expira em 1 hora

            res.status(200).json({
                message: 'Login bem-sucedido!',
                token: token,
                user: { id: user.id, name: user.name, email: user.email }
            });
        });
    });
};