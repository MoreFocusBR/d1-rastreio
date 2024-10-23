import { FastifyReply, FastifyRequest } from "fastify";
import { PrismaClient } from "@prisma/client";
import {
  sendWhatsAppMessage,
  abrirProtocoloASC,
  criarTarefaAsana,
} from "./services";
import dayjs from "dayjs";

const prisma = new PrismaClient();

export const handleIncomingMessage = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { phone, text } = request.body as {
    phone: string;
    text: { message: string };
  };
  const mensagemCliente = text.message.trim().toUpperCase();

  // Verificar se há um contexto ativo
  const context = await prisma.conversationContext.findFirst({
    where: { phone },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();

  if (
    context &&
    dayjs(context.expiresAt).isAfter(now) &&
    !context.context.includes("posvenda-")
  ) {
    // Contexto ativo, perguntar se quer continuar o assunto
    if (mensagemCliente === "SIM") {
      // Renova o contexto por mais 48 horas
      await prisma.conversationContext.update({
        where: { phone },
        data: { expiresAt: dayjs().add(48, "hour").toDate() },
      });
      await sendWhatsAppMessage(
        phone,
        "Ótimo! Vamos continuar com o mesmo assunto. Como posso ajudar?"
      );
    } else if (mensagemCliente === "NÃO") {
      // Redireciona para o SAC e apaga o contexto
      await prisma.conversationContext.delete({ where: { phone } });
      await sendWhatsAppMessage(
        phone,
        "Para retirar suas dúvidas, conte sempre com nosso time do SAC no número 11930373935 😉\n\n"
      );
    } else {
      // Mensagem normal de fluxo
      await handleNormalFlow(mensagemCliente, phone, "");
    }
  } else {
    // Se tá no contexto posvenda, segue o fluxo
    if (context?.context.includes("posvenda-") && dayjs(context.expiresAt).isAfter(now)) {
      // Não há contexto prévio, segue o fluxo normal
      await handleNormalFlow(mensagemCliente, phone, context.context);
    } // Não há contexto ativo, perguntar se quer continuar o último assunto
    else if (context) {
      await sendWhatsAppMessage(
        phone,
        "Você gostaria de continuar falando sobre o mesmo assunto? Responda com SIM ou NÃO."
      );
    } else {
      // Não há contexto prévio, segue o fluxo normal
      await handleNormalFlow(mensagemCliente, phone, "");
    }
  }

  reply.send({ status: "Message processed" });
};

const handleNormalFlow = async (
  mensagemCliente: string,
  phone: string,
  context: string
) => {
  const requestSA = require("superagent");
  if (context && context === "posvenda-avaliacao") {
    // Experiencia POSITIVA
    if (mensagemCliente === "1") {
      // Envia mensagem de agradecimento e cria um contexto
      await prisma.conversationContext.create({
        data: {
          phone,
          lastMessage: mensagemCliente,
          context: "posvenda-CSATEnviada",
          expiresAt: dayjs().add(48, "hour").toDate(),
        },
      });
      const whatsContent =
        "Que ótimo saber disso! 😀 Estamos sempre à disposição e esperamos vê-lo novamente em sua próxima compra. 🛍️ Não deixe de avaliar a sua experiência de compra clicando no link abaixo ⭐ \n\nhttps://form.respondi.app/CEAQHsaj ";
        await sendWhatsAppMessage(phone, whatsContent);
    } else if (mensagemCliente === "2") {
      // Envia mensagem de desculpas e cria um contexto
      await prisma.conversationContext.create({
        data: {
          phone,
          lastMessage: mensagemCliente,
          context: "posvenda-experienciaNegativa",
          expiresAt: dayjs().add(48, "hour").toDate(),
        },
      });
      const whatsContent =
        "Poxa, sentimos muito que sua experiência não foi das melhores. 😞 Essa definitivamente não é a impressão que queremos causar. Podemos encaminhar para o nosso atendimento e entender o que ocorreu? 🙏\n\n 1 Sim\n 2 Não";
      await sendWhatsAppMessage(phone, whatsContent);
    } else {
      // Pede para responder apenas o número
      const whatsContent = "Por favor, responda apenas com o número";
      await sendWhatsAppMessage(
        phone,
        whatsContent
      );
    }

    // Experiencia POSITIVA
  } else if (context && context === "posvenda-experienciaNegativa") {
    // Pede pra avaliar no Respondi
    if (mensagemCliente === "1") {
      // Envia mensagem de agradecimento e cria um contexto
      await prisma.conversationContext.create({
        data: {
          phone,
          lastMessage: mensagemCliente,
          context: "posvenda-EncaminhadoAtendimento",
          expiresAt: dayjs().add(48, "hour").toDate(),
        },
      });
      const whatsContent =
        "Um de nossos atendentesentrará em contato com você em breve para entender a situação. Agradecemos sua paciência e compreensão. 🙏";
        await sendWhatsAppMessage(phone, whatsContent);

        //Avisa que precisa de atendimento
        const whatsContent2 =
        `Abrir atendimento no ASC sobre experiência de compra ruim. Telefone cliente: ${phone}, Pedido: ${context}`;
        await sendWhatsAppMessage(phone, whatsContent2);
    } else if (mensagemCliente === "2") {
      // Envia mensagem de desculpas e cria um contexto
      await prisma.conversationContext.create({
        data: {
          phone,
          lastMessage: mensagemCliente,
          context: "posvenda-desejaCupom",
          expiresAt: dayjs().add(48, "hour").toDate(),
        },
      });
      const whatsContent =
        "Entendemos sua decisão, mas gostaríamos muito de ajudar a resolver qualquer problema que tenha ocorrido. 😊 Sua satisfação é muito importante pra nós. Agradecemos por compartilhar sua experiência e esperamos poder atendê-lo melhor no futuro. 🙏";
      await sendWhatsAppMessage(phone, whatsContent);
      const whatsContent2 =
        "Como forma de compansar sua experiência de compra, você aceitaria um cupom exclusivo de desconto para utilizar no nosso site? 😊\n\n 1 Sim\n 2 Não";
      await sendWhatsAppMessage(phone, whatsContent2);
    } else {
      // Pede para responder apenas o número
      const whatsContent = "Por favor, responda apenas com o número";
      await sendWhatsAppMessage(
        phone,
        whatsContent
      );
    }
  } else if (context && context === "posvenda-desejaCupom") {
    if (mensagemCliente === "1") {
      // Envia Cupom
      const whatsContent = "Ficamos felizes em oferecer uma forma de compensar sua experiência de compra. Aqui está um cupom exclusivo para você utilizar em nosso site: #EUVOLTEI. Esperamos que aproveite 😊";
      await sendWhatsAppMessage(
        phone,
        whatsContent
      );
      await prisma.conversationContext.create({
        data: {
          phone,
          lastMessage: JSON.stringify(whatsContent),
          context: "posvenda-CupomEnviado",
          expiresAt: dayjs().toDate(),
        },
      });

    } else if (mensagemCliente === "2") {
      // Encerra conversa e cria um contexto
      const whatsContent = "Obrigada pela sua atenção";
      await sendWhatsAppMessage(
        phone,
        whatsContent
      );
      await prisma.conversationContext.create({
        data: {
          phone,
          lastMessage: mensagemCliente,
          context: "posvenda-naoQuisCupom",
          expiresAt: dayjs().toDate(),
        },
      })

      criarTarefaAsana(context);
    } else {
      // Pede para responder apenas o número
      const whatsContent = "Por favor, responda apenas com o número";
      await sendWhatsAppMessage(
        phone,
        whatsContent
      );
    }
  } else {
    // Se o contexto ativo não for "avaliacaoposvenda", execute lógica padrão para direcionar para o SAC

    // Envia uma saudação
    const whatsContent =
      "Olá!!\nPara retirar suas dúvidas, conte sempre com nosso time do SAC no número 11930373935 😉\n\n";
    await sendWhatsAppMessage(phone, whatsContent);
  }
};

export const enviaMsgAvaliacao = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const requestSA = require("superagent");
  const { phone, text } = request.body as {
    phone: string;
    text: { message: string };
  };
  const mensagemCliente = text.message.trim();

  //const whatsContent = `E aí, Rodrigo! Tudo certo? Queremos saber como foi sua experiência de compra na D1Fitness. 💪\n\n 1 Minha experiência foi top! 😀\n 2 Não curti muito a experiência 😕`;
  const bodyWhats = `{"phone": "${phone}","message": "${mensagemCliente}"}`;

  const resZAPI = await requestSA
    .post(
      "https://api.z-api.io/instances/39BD5CDB5E0400B490BE0E63F29971E4/token/996973B6263DE0E95A59EF47/send-text"
    )
    .set("Content-Type", "application/json")
    .set("Client-Token", `F622e76b1e3f64e2a9517d207fe923fa5S`)
    .send(bodyWhats);

  await prisma.conversationContext.create({
    data: {
      phone: `${phone}`,
      lastMessage: JSON.stringify(mensagemCliente),
      context: "posvenda-avaliacao",
      expiresAt: dayjs().add(48, "hour").toDate(),
    },
  });

  reply.send({ status: "Message processed" });
};
