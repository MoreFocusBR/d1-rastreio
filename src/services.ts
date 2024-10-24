const request = require("superagent");

// Endpoint para enviar mensagem via Z-API
export const sendWhatsAppMessage = async (foneClient: string, whatsContent: string) => {
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

// Abrir um protocolo no ASC
export const abrirProtocoloASC = async (foneClient: string) => {
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

// Criar uma tarefa no Asana
