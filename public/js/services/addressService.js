const API_URL = '/api/addresses';

/**
 * Busca todos os endereços do usuário logado.
 */
export const getMyAddresses = async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Falha ao buscar endereços.');
    return response.json();
};

/**
 * Adiciona um novo endereço.
 */
export const addMyAddress = async (addressData) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressData)
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Falha ao adicionar endereço.');
    }
    return response.json();
};

/**
 * Atualiza um endereço existente.
 */
export const updateMyAddress = async (addressId, addressData) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/${addressId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressData)
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Falha ao atualizar endereço.');
    }
    return response.json();
};

/**
 * Deleta um endereço.
 */
export const deleteMyAddress = async (addressId) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/${addressId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Falha ao remover endereço.');
    }
    return response.json();
};