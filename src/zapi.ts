import { FastifyReply, FastifyRequest } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { sendWhatsAppMessage, abrirProtocoloASC, criarTarefaAsana } from './services';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

export const handleIncomingMessage = async (request: FastifyRequest, reply: FastifyReply) => {
  const { phone, text } = request.body as { phone: string; text: { message: string } };
  const mensagemCliente = text.message.trim().toUpperCase();

  // Verificar se há um contexto ativo
  const context = await prisma.conversationContext.findFirst({
    where: { phone },
    orderBy: { createdAt: 'desc' },
  });

  const now = new Date();

  if (context && dayjs(context.expiresAt).isAfter(now)) {
    // Contexto ativo, perguntar se quer continuar o assunto
    if (mensagemCliente === 'SIM') {
      // Renova o contexto por mais 48 horas
      await prisma.conversationContext.update({
        where: { phone },
        data: { expiresAt: dayjs().add(48, 'hour').toDate() },
      });
      await sendWhatsAppMessage(phone, "Ótimo! Vamos continuar com o mesmo assunto. Como posso ajudar?");
    } else if (mensagemCliente === 'NÃO') {
      // Redireciona para o SAC e apaga o contexto
      await prisma.conversationContext.delete({ where: { phone } });
      await sendWhatsAppMessage(phone, "Para retirar suas dúvidas, conte sempre com nosso time do SAC no número 11930373935 😉\n\n");
    } else {
      // Mensagem normal de fluxo
      await handleNormalFlow(mensagemCliente, phone, "");
    }
  } else {
    // Não há contexto ativo, perguntar se quer continuar o último assunto
    if (context) {
      await sendWhatsAppMessage(phone, "Você gostaria de continuar falando sobre o mesmo assunto? Responda com SIM ou NÃO.");
    } else {
      // Não há contexto prévio, segue o fluxo normal
      await handleNormalFlow(mensagemCliente, phone, "");
    }
  }

  reply.send({ status: 'Message processed' });
};

const handleNormalFlow = async (mensagemCliente: string, phone: string, context: string) => {
  if (context && context === 'avaliacaoposvenda') {
    if (mensagemCliente === '1') {
      // Envia mensagem de agradecimento e cria um contexto
      await prisma.conversationContext.create({
        data: {
          phone,
          lastMessage: mensagemCliente,
          context: 'Experiência positiva',
          expiresAt: dayjs().add(48, 'hour').toDate(),
        },
      });
      const whatsContent = "Que ótimo saber disso! Estamos sempre à disposição e esperamos vê-lo novamente!";
      await sendWhatsAppMessage(phone, whatsContent);
    } else if (mensagemCliente === '2') {
      // Envia mensagem de desculpas e cria um contexto
      await prisma.conversationContext.create({
        data: {
          phone,
          lastMessage: mensagemCliente,
          context: 'Experiência negativa',
          expiresAt: dayjs().add(48, 'hour').toDate(),
        },
      });
      const whatsContent = "Poxa, sentimos muito que sua experiência não foi das melhores. Podemos encaminhar para o nosso atendimento?";
      await sendWhatsAppMessage(phone, whatsContent);
    } else if (mensagemCliente === 'SIM') {
      // Abre um protocolo no ASC
      await abrirProtocoloASC(phone);
      await sendWhatsAppMessage(phone, "Um de nossos atendentes entrará em contato com você em breve.");
    } else if (mensagemCliente === 'NÃO') {
      // Cria uma tarefa no Asana
      await criarTarefaAsana();
      await sendWhatsAppMessage(phone, "Obrigada pela sua atenção, abrimos uma tarefa para resolver o seu problema.");
    } else {
      // Mensagem não reconhecida
      const whatsContent = `Desculpe, não entendi sua mensagem. Por favor, responda com:
      1 - Se você gostou da experiência.
      2 - Se você não gostou da experiência.
      SIM - Para solicitar atendimento.
      NÃO - Para encerrar a conversa.`;
      await sendWhatsAppMessage(phone, whatsContent);
    }
  } else {
    // Se o contexto ativo não for "avaliacaoposvenda", execute lógica padrão para direcionar para o SAC
    
      // Envia uma saudação
      const whatsContent = "Olá!!\nPara retirar suas dúvidas, conte sempre com nosso time do SAC no número 11930373935 😉\n\n";
      await sendWhatsAppMessage(phone, whatsContent);
    

  }
};
