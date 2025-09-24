const API_URL = '/api/frete';

/**
 * Realiza uma chamada ao back-end para calcular as opções de frete para um determinado pacote.
 *
 * @async
 * @function calcularFrete
 * @param {object} dadosDoPacote - Um objeto contendo os detalhes do pacote para envio.
 * @param {string} dadosDoPacote.to_postal_code - O CEP de destino (apenas números).
 * @param {number} dadosDoPacote.weight - O peso do pacote em kg.
 * @param {number} dadosDoPacote.width - A largura do pacote em cm.
 * @param {number} dadosDoPacote.height - A altura do pacote em cm.
 * @param {number} dadosDoPacote.length - O comprimento do pacote em cm.
 * @returns {Promise<Array<object>>} Uma Promise que resolve para um array de objetos, onde cada objeto é uma opção de frete válida.
 * @throws {Error} Lança um erro se a requisição falhar (seja por problema de rede ou erro retornado pela API). A mensagem do erro será a retornada pelo back-end.
 */
const calcularFrete = async (dadosDoPacote) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosDoPacote),
        });

        const responseData = await response.json();
        
        if (!response.ok) {
            const errorMessage = responseData.error || `Erro HTTP: ${response.status}`;
            throw new Error(errorMessage);
        }
        
        return responseData;

    } catch (error) {
        console.error('Erro ao chamar o serviço de frete:', error);
        
        throw error;
    }
}

//exemplo de uso, como no cepService:
const dadosExemplos = {
  to_postal_code: "01311000",
  weight: 0.5,
  width: 16,
  height: 4,
  length: 23
};
calcularFrete(dadosExemplos).then(valor => console.log(valor)).catch(erro => console.log(erro));