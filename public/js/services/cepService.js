/**
 * Consulta os dados de um CEP no back-end.
 * @param {string} cep - O CEP a ser consultado.
 * @returns {Promise<object>} Uma Promise que resolve para o objeto do endereço.
 * @throws {Error} Lança um erro se o CEP não for encontrado ou se houver falha na comunicação.
 */
async function consultarCep(cep) {
    try {
        const response = await fetch(`/api/cep/${cep}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Não foi possível buscar o CEP.');
        }

        return data;

    } catch (error) {
        console.error("Erro no serviço de CEP:", error);
        throw error;
    }
}

//Tá aqui o exemplo de uso do viaCep, apagar depois de ver.
consultarCep(58429900).then(valor => console.log(valor)).catch(erro => console.log(erro));