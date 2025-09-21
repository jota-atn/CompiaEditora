const axios = require('axios');
const { parseStringPromise } = require('xml2js');

//TODO: DEIXAR DINÂMICO, POIS NO NCDSERVICO ESTÁ PADRÃO O SEDEX. PORÉM DÁ PRA ESCOLHER O PAC (04510)
//TODO: DA MESMA FORMA PARA O FORMATO

/**
 * Calcula o preço e o prazo de entrega de uma encomenda utilizando o web service dos Correios.
 * A função recebe os dados do frete pelo corpo da requisição, chama a API dos Correios,
 * analisa a resposta XML e retorna um JSON simplificado para o front-end.
 *
 * @async
 * @function calcularFrete
 * @param {object} req - O objeto de requisição do Express. Espera-se que `req.body` contenha os dados do frete (cepOrigem, cepDestino, etc.).
 * @param {object} res - O objeto de resposta do Express, usado para enviar a resposta (o valor do frete ou um erro) de volta ao cliente.
 * @returns {Promise<void>} Esta função não retorna um valor diretamente, mas envia uma resposta HTTP ao cliente.
 */

const calcularFrete = async (req, res) => {
    try {
        console.log('1. Controller iniciado, dados recebidos:', req.body);
        const { cepOrigem, cepDestino, pesoKg, formato, comprimento, altura, largura, valorDeclarado } = req.body;

        const correiosAPI_URL = 'http://ws.correios.com.br/calculador/CalcPrecoPrazo.aspx';
        const params = {
            nCdEmpresa: '',
            sDsSenha: '',
            nCdServico: '04014', // SEDEX
            sCepOrigem: cepOrigem,
            sCepDestino: cepDestino,
            nVlPeso: pesoKg,
            nCdFormato: formato,
            nVlComprimento: comprimento,
            nVlAltura: altura,
            nVlLargura: largura,
            nVlDiametro: '0',
            sCdMaoPropria: 'n',
            nVlValorDeclarado: valorDeclarado,
            sCdAvisoRecebimento: 'n',
            output: 'xml'
        };
        console.log('2. Parâmetros para os Correios montados.');

        console.log('3. Fazendo a chamada para a API dos Correios...');
        const response = await axios.get(correiosAPI_URL, { 
            params,
            timeout: 5000 // Adicionando um timeout de 5 segundos
        });
        console.log('4. Resposta dos Correios recebida!');

        const xmlData = response.data;
        console.log('5. Traduzindo XML para JSON...');
        const jsonData = await parseStringPromise(xmlData);
        console.log('6. JSON traduzido com sucesso.');

        const servico = jsonData.Servicos.cServico[0];
        const valorFrete = servico.Valor[0];
        const prazoEntrega = servico.PrazoEntrega[0];
        const erro = servico.MsgErro[0];
        
        console.log('7. Dados extraídos. Verificando se há erro...');
        if (erro && erro.trim() !== '') {
            console.log('ERRO dos Correios encontrado:', erro);
            return res.status(400).json({ error: erro });
        }
        
        console.log('8. Enviando resposta final para o cliente...');
        res.json({
            servico: 'SEDEX',
            valor: valorFrete,
            prazoDias: prazoEntrega
        });

    } catch (error) {
        console.error('ERRO! Ocorreu um erro no bloco catch:', error.message);
        // Garante que uma resposta de erro seja enviada caso algo falhe
        res.status(500).json({ error: 'Ocorreu um erro interno ao calcular o frete.', details: error.message });
    }
};

module.exports = {
    calcularFrete,
};