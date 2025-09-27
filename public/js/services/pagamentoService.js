const PAGAMENTO_API_URL = '/api/pagamento';

/**
 * Envia os dados de uma nova cobrança PIX para o back-end para processamento.
 *
 * @async
 * @function criarCobrancaPix
 * @param {object} dadosCobranca - Um objeto contendo os detalhes da cobrança.
 * @param {number} dadosCobranca.amount - Valor da cobrança em centavos.
 * @param {number} dadosCobranca.expiresIn - Tempo de expiração em segundos.
 * @param {string} dadosCobranca.description - Descrição da cobrança.
 * @param {string} dadosCobranca.name - Nome completo do cliente pagador.
 * @param {string} dadosCobranca.cellphone - Número de celular do cliente (com DDD).
 * @param {string} dadosCobranca.email - Email do cliente.
 * @param {string} dadosCobranca.taxId - CPF ou CNPJ do cliente.
 * @returns {Promise<object>} Uma Promise que resolve para o objeto da cobrança PIX gerada (com QR Code, etc.).
 * @throws {Error} Lança um erro se a requisição falhar, contendo a mensagem de erro retornada pelo back-end.
 */
export const criarCobrancaPix = async (dadosCobranca) => {
    try {
        const response = await fetch(PAGAMENTO_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosCobranca),
        });

        const responseData = await response.json();
        
        if (!response.ok) {
            throw new Error(responseData.error || `Erro HTTP: ${response.status}`);
        }
        
        return responseData;

    } catch (error) {
        console.error('Erro ao chamar o serviço de pagamento:', error);
        throw error;
    }
}