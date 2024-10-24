"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.criarTarefaAsana = exports.abrirProtocoloASC = exports.sendWhatsAppMessage = void 0;
const request = require("superagent");
// Endpoint para enviar mensagem via Z-API
const sendWhatsAppMessage = async (foneClient, whatsContent) => {
    const tokenZapi = 'F622e76b1e3f64e2a9517d207fe923fa5S';
    const url = `https://api.z-api.io/instances/39BD5CDB5E0400B490BE0E63F29971E4/token/996973B6263DE0E95A59EF47/send-text`;
    await request
        .post(url)
        .set('Client-Token', tokenZapi)
        .send({
        phone: foneClient,
        message: whatsContent,
    });
    console.log(whatsContent);
};
exports.sendWhatsAppMessage = sendWhatsAppMessage;
// Abrir um protocolo no ASC
const abrirProtocoloASC = async (foneClient) => {
    const baseUrl = 'https://api.asc.com';
    await request
        .post(`${baseUrl}/atendimento`)
        .send({
        cod_integracao: 1234,
        cod_conta: 5678,
        identificador: 'telefone',
        val_identificador: foneClient,
        ativo: 0,
        url_pesquisa: '1',
        tipo_destino: 'telefone',
        id_destino: 1,
        mensagem: 'Cliente teve uma experiência negativa e solicitou atendimento',
        contato: {
            nome: 'Nome Cliente',
            telefone: foneClient,
        },
        historico: [
            {
                descricao: 'Solicitação de atendimento',
                entrante: 1,
                data: new Date().toISOString(),
            },
        ],
    });
};
exports.abrirProtocoloASC = abrirProtocoloASC;
// Criar uma tarefa no Asana
const criarTarefaAsana = async () => {
    const asanaToken = 'Bearer your-asana-token';
    const url = 'https://app.asana.com/api/1.0/tasks';
    await request
        .post(url)
        .set('Authorization', asanaToken)
        .send({
        data: {
            name: `Análise de jornada negativa - Pedido ${Codigo}`,
            notes: `Pedido 1234 - Tarefa criada automaticamente após experiência negativa de um cliente. Precisa de atenção imediata.`,
            projects: ['1208480182057658'],
            assignee: '1206778681943779',
            followers: ['1208207258580881'],
            workspace: '1208207335184759'
        }
    });
};
exports.criarTarefaAsana = criarTarefaAsana;
