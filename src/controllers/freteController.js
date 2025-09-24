import axios from "axios";
import 'dotenv/config';

/**
 * Calcula o preço e o prazo de entrega de uma encomenda utilizando o web service do melhor envio.
 * A função recebe os dados do frete pelo corpo da requisição, chama a API do melhor envio,
 * analisa a resposta e retorna um JSON simplificado para o front-end.
 *
 * @async
 * @function calcularFrete
 * @param {object} req - O objeto de requisição do Express. Espera-se que `req.body` contenha os dados do frete (to_postal_code, weight, etc.).
 * @param {object} res - O objeto de resposta do Express, usado para enviar a resposta (o valor do frete ou um erro) de volta ao cliente.
 * @returns {Promise<void>} Esta função não retorna um valor diretamente, mas envia uma resposta HTTP ao cliente.
 */
export const calcularFrete = async (req, res) => {

    const { to_postal_code, weight, width, height, length } = req.body;

    if (!to_postal_code || !weight || !width || !height || !length) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    const requestData = {
        from: {
            postal_code: '58429900',
        },
        to: {
            postal_code: to_postal_code,
        },
        package: {
            weight: weight,
            width: width,
            height: height,
            length: length,
        },
    };

    try {
        const response = await axios.post(
            `${process.env.MELHOR_ENVIO_API_URL}/api/v2/me/shipment/calculate`, requestData,
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.MELHOR_ENVIO_API_TOKEN}`,
                    'User-Agent': 'Aplicação de Teste (seu_email@dominio.com)',
                },
            }
        );

        res.json(response.data);

    } catch (error) {
        console.error('Erro ao calcular o frete:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Não foi possível calcular o frete.' });
    }
};