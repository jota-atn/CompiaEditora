import axios from "axios";
import 'dotenv/config';

/**
 * Cria uma nova cobrança PIX utilizando a API do Abacate Pay.
 * A função recebe os detalhes da cobrança e do cliente pelo corpo da requisição,
 * formata esses dados, adiciona as credenciais de autenticação seguras
 * e envia para o gateway de pagamento.
 *
 * @async
 * @function criarPagamentoPix
 * @param {object} req - O objeto de requisição do Express, contendo os dados do pagamento em `req.body`.
 * @param {object} res - O objeto de resposta do Express, usado para enviar o resultado (QR Code, etc.) ou um erro de volta ao cliente.
 * @returns {Promise<void>} Esta função não retorna um valor diretamente, mas envia uma resposta HTTP ao cliente.
 */
export const criarPagamentoPix = async (req, res) => {

    const { amount, expiresIn, description, name, cellphone, email, taxId } = req.body;

    if (!amount || !expiresIn || !description || !name || !cellphone || !email || !taxId) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    const requestData = {
        amount: amount,
        expiresIn: expiresIn,
        description: description,
        customer: {
            name: name,
            cellphone: cellphone,
            email: email,
            taxId: taxId,
        }
    };

    try {
        const response = await axios.post(
            `${process.env.ABACATE_PAY_API_URL}/v1/pixQrCode/create`, requestData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.ABACATE_PAY_API_TOKEN}`,
                },
            }
        );

        res.json(response.data);

    } catch (error) {
        console.error('Erro ao criar o pix:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Não foi possível criar o pix' });
    }
};