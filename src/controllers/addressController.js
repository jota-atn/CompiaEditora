import { findAddressesByUserId, addAddress, updateAddress, deleteAddress } from '../database/database.js';

/**
 * Busca todos os endereços do usuário logado.
 */
export const getAddresses = (req, res) => {
    // O req.user.id é fornecido pelo nosso middleware de autenticação
    const userId = req.user.id;
    
    findAddressesByUserId(userId, (err, addresses) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(addresses || []);
    });
};

/**
 * Adiciona um novo endereço para o usuário logado.
 */
export const addNewAddress = (req, res) => {
    const userId = req.user.id;
    const addressData = req.body;

    // Validação simples
    if (!addressData.street || !addressData.city || !addressData.cep) {
        return res.status(400).json({ message: 'Rua, cidade e CEP são obrigatórios.' });
    }

    addAddress(userId, addressData, (err, newAddress) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Endereço adicionado com sucesso!', addressId: newAddress.id });
    });
};

/**
 * Atualiza um endereço existente do usuário logado.
 */
export const updateExistingAddress = (req, res) => {
    const addressId = req.params.id; // Pega o ID do endereço da URL (ex: /api/addresses/5)
    const addressData = req.body;

    updateAddress(addressId, addressData, (err, success) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!success) return res.status(404).json({ message: 'Endereço não encontrado.' });
        res.status(200).json({ message: 'Endereço atualizado com sucesso!' });
    });
};

/**
 * Deleta um endereço do usuário logado.
 */
export const deleteExistingAddress = (req, res) => {
    const addressId = req.params.id;

    deleteAddress(addressId, (err, success) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!success) return res.status(404).json({ message: 'Endereço não encontrado.' });
        res.status(200).json({ message: 'Endereço removido com sucesso!' });
    });
};