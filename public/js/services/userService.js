/**
 * Busca os dados do perfil do usuário atualmente logado.
 * Requer um token de autenticação válido no localStorage.
 * @async
 * @returns {Promise<object>} Uma Promise que resolve para o objeto com os dados do usuário.
 * @throws {Error} Lança um erro se o token não for encontrado, se a sessão expirar, ou se houver falha na rede.
 */
export const getUserProfile = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('Usuário não autenticado.');
    }

    try {
        const response = await fetch('/api/users/profile', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('authToken');
            throw new Error('Sua sessão expirou. Por favor, faça login novamente.');
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Não foi possível buscar os dados do perfil.');
        }

        return await response.json();

    } catch (error) {
        throw error;
    }
}