const API_URL = '/api/users/profile';

/**
 * Busca os dados do perfil do usuário logado na API.
 */
export const getUserProfile = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('Sessão expirada. Faça login novamente.');
    }

    const response = await fetch(API_URL, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Sessão expirada. Faça login novamente.');
    }
    return response.json();
};

/**
 * Envia os dados atualizados do perfil para a API.
 */
export const updateUserProfile = async (userData) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('Sessão expirada. Faça login novamente.');
    }

    const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Falha ao atualizar o perfil.');
    }
    return response.json();
};

export const deleteUserProfile = async () => {
    const token = localStorage.getItem('authToken'); 
    if (!token) {
        throw new Error('Sessão expirada. Faça login novamente.');
    }

    const response = await fetch(API_URL, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Falha ao deletar a conta.');
    }
    return response.json();
};