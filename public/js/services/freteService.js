/**
 * Objeto que representa os dados necessários para calcular o frete.
 * @typedef {object} FreteData
 * @property {string} cepOrigem
 * @property {string} cepDestino
 * @property {string} pesoKg
 * @property {string} formato
 * @property {string} comprimento
 * @property {string} altura
 * @property {string} largura
 * @property {string} valorDeclarado
 */

/**
 * Envia os dados para a API do nosso back-end para calcular o frete.
 * Esta função abstrai a chamada fetch, o método POST e o tratamento do JSON.
 * @param {FreteData} dadosDoFrete - Um objeto contendo todos os dados necessários para o cálculo.
 * @returns {Promise<object>} Uma promessa que resolve para o objeto de resposta do frete (com valor e prazo).
 * @throws {Error} Lança um erro se a resposta da API não for bem-sucedida.
 */
export const calcularFreteFrontend = async (dadosDoFrete) => {
    try {
        const response = await fetch('/api/frete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosDoFrete) 
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ocorreu um erro ao calcular o frete.');
        }

        return response.json();

    } catch (error) {
        console.error('Erro no serviço de frete:', error);
        throw error;
    }
};