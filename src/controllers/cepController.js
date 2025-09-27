import axios from 'axios';

/**
 * Busca os detalhes de um endereço a partir de um CEP fornecido, utilizando a API pública ViaCEP.
 *
 * @async
 * @function consultarCep
 * @param {object} req - O objeto de requisição do Express. O CEP é esperado em `req.params.cep`.
 * @param {object} res - O objeto de resposta do Express, usado para enviar os dados do endereço ou um erro.
 * @returns {Promise<void>} Envia uma resposta JSON com os dados do endereço ou um objeto de erro.
 */
export const consultarCep = async (req, res) => {
    try {
        const { cep } = req.params;
        const cepLimpo = cep.replace(/\D/g, '');

        if (cepLimpo.length !== 8) {
            return res.status(400).json({ error: 'Formato de CEP inválido. O CEP deve conter 8 dígitos.' });
        }

        const apiUrl = `https://viacep.com.br/ws/${cepLimpo}/json/`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (data.erro) {
            return res.status(404).json({ error: 'CEP não encontrado.' });
        }

        res.status(200).json(data);

    } catch (error) {
        console.error('Erro ao consultar o CEP:', error.message);
        res.status(500).json({ error: 'Ocorreu um erro interno ao tentar consultar o CEP.' });
    }
};
