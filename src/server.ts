import { FastifyInstance } from "fastify";
import fastifyStatic from "@fastify/static";
import { PrismaClient, Venda } from "@prisma/client";
import { FastifyRequest, FastifyReply } from "fastify";
import fastify from "fastify";
import * as nodemailer from "nodemailer";
import { v4 as uuid } from "uuid";
import {
  JsonArray,
  JsonConvertible,
  JsonObject,
  JsonValue,
} from "@prisma/client/runtime/library";
import { notaFiscalRoutes } from "./routes/nota-fiscal.routes";
import { error } from "console";
import { Options } from "nodemailer/lib/mailer";
import { json } from "stream/consumers";
import { promises as fs } from "fs";
import { handleIncomingMessage } from './zapi';
import dayjs from "dayjs";


const app = fastify();

const path = require("node:path");

app.register(require("@fastify/static"), {
  root: path.join(__dirname, ""),
  prefix: "/", // optional: default '/'
  constraints: {}, // optional: default {}
});

const prisma = new PrismaClient();

app.register(notaFiscalRoutes, {
  prefix: "/nfe",
});

const authToken = "effca82a-7127-45de-9a53-b71fc01a9064";

const tokenZapi = "F622e76b1e3f64e2a9517d207fe923fa5S";

const API_URL = "https://d1-rastreio.onrender.com"; // https://d1-rastreio.onrender.com   http://localhost:3334

// Configurações de transporte para o servidor SMTP
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "naoresponda@d1fitness.com.br",
    pass: "fitness2020*",
  },
});

// Função para enviar o e-mail
async function enviarEmail(mailOptions: Options) {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("E-mail enviado:", info.messageId);
  } catch (error) {
    console.error("Erro ao enviar o e-mail:", error);
  }
}

// Endpoint: Admin - inicio

// Endpoint: ping - inicio
app.get("/ping", async (request, reply) => {
  return reply.status(200).send("API ativa.");
});

// Endpoint: ping - fim

// Endpoint: authUsers - inicio
app.post("/login", async (request, reply) => {
  const authTokenHeader = request.headers.token;

  interface RouteParams {
    email: string;
    pw: string;
  }

  const stringbody = JSON.stringify(request.body);
  const data = JSON.parse(stringbody);
  const email = data.email;
  const pw = data.pw;

  const existingRecord = await prisma.adminUsers.findFirst({
    where: {
      email: email,
      password: pw,
    },
  });

  if (existingRecord && authTokenHeader == authToken) {
    return reply.status(200).send(existingRecord?.token);
  } else {
    return reply.status(401).send("Dados de login incorretos.");
  }
});

// Endpoint: authUsers - fim

// Endpoint: newUser - inicio
app.post("/newUser", async (request, reply) => {
  interface adminUser {
    email: string;
    senha: string;
  }

  const authTokenHeader = request.headers.token;

  const stringbody = JSON.stringify(request.body);
  const data = JSON.parse(stringbody);
  const email = data.email;
  const pw = data.pw;

  // Verifica se já existe um registro com o mesmo email
  const existingRecord = await prisma.adminUsers.findFirst({
    where: {
      email: email,
    },
  });

  // Se não existir, insere o novo registro
  if (!existingRecord && authTokenHeader == authToken) {
    try {
      const createdUser = await prisma.adminUsers.create({
        data: {
          email: email,
          password: pw,
        },
      });
      return reply.status(200).send(createdUser.token);
    } catch (error) {
      console.error(error);
      return reply.status(500).send("Internal Server Error");
    }
  } else {
    return reply.status(401).send("Usuario ja existente");
  }
});

// Endpoint: newUser - fim

// Endpoint: Consome fila integração Vendas - início

app.get("/consomeFilaIntegracaoVendas", async (request, reply) => {
  const maxRegistros = request.headers.maxRegistros;

  // busca fila de integração Vendas - inicio

  async function pegaListaIntegracaoVendas() {
    try {
      const request = require("superagent");
      const resListaIntegracao = await request
        .get("http://cloud01.alternativa.net.br:2086/root/venda")
        .set("Accept", "application/json")
        .set("accept-encoding", "gzip")
        .set("X-Token", "7Ugl10M0tNc4M8KxOk4q3K4f55mVBB2Rlw1OhI3WXYS0vRs");
      //.set("Limit", "1");

      resListaIntegracao.body;

      if (resListaIntegracao.status == 200) {
        return JSON.stringify(resListaIntegracao.body);
      } else {
        throw new Error("Erro ao obter o lista integração.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  // busca fila de integração Vendas - fim

  // consome cada item da fila de integração Vendas - inicio

  async function mainConsomeLista() {
    const resListaIntegracao = await pegaListaIntegracaoVendas();

    if (resListaIntegracao) {
      const resListaIntegracaoJson = await JSON.parse(resListaIntegracao);

      if (resListaIntegracaoJson.venda.length > 0) {
        resListaIntegracaoJson.venda.forEach(async (venda: any) => {
          try {
            interface Venda {
              Codigo: number;
              ClienteCodigo: number;
              ClienteTipoPessoa: string;
              ClienteDocumento: string;
              TransportadoraCodigo: number;
              DataVenda: string;
              Entrega: boolean;
              EntregaNome: string;
              EntregaEmail: string;
              NumeroObjeto: string;
              EntregaTelefone: string;
              EntregaLogradouro: string;
              EntregaLogradouroNumero: string;
              EntregaLogradouroComplemento: string;
              EntregaBairro: string;
              EntregaMunicipioNome: string;
              EntregaUnidadeFederativa: string;
              EntregaCEP: string;
              Observacoes: string;
              ObservacoesLoja: string;
              CodigoStatus: number;
              DescricaoStatus: string;
              DataHoraStatus: string;
              PrevisaoEntrega: string;
              CodigoNotaFiscal: number;
              DataEntrega: string;
              Cancelada: boolean;
              DataEnvio: string;
              NotaFiscalNumero: number;
              DataColeta: string;
            }

            const {
              Codigo,
              ClienteCodigo,
              ClienteTipoPessoa,
              ClienteDocumento,
              TransportadoraCodigo,
              DataVenda,
              Entrega,
              EntregaNome,
              EntregaEmail,
              NumeroObjeto,
              EntregaTelefone,
              EntregaLogradouro,
              EntregaLogradouroNumero,
              EntregaLogradouroComplemento,
              EntregaBairro,
              EntregaMunicipioNome,
              EntregaUnidadeFederativa,
              EntregaCEP,
              Observacoes,
              ObservacoesLoja,
              CodigoStatus,
              DescricaoStatus,
              DataHoraStatus,
              PrevisaoEntrega,
              CodigoNotaFiscal,
              DataEntrega,
              Cancelada,
              DataEnvio,
              NotaFiscalNumero,
              DataColeta,
            } = venda as Venda;

            const existingRecord = await prisma.venda.findFirst({
              where: {
                Codigo: Codigo,
              },
            });

            // Se não existir, insere o novo registro
            if (!existingRecord) {
              console.log("Inserindo Venda: " + Codigo);

              await prisma.venda.create({
                data: {
                  Codigo,
                  ClienteCodigo,
                  ClienteTipoPessoa,
                  ClienteDocumento,
                  TransportadoraCodigo,
                  DataVenda,
                  Entrega,
                  EntregaNome,
                  EntregaEmail,
                  NumeroObjeto,
                  EntregaTelefone,
                  EntregaLogradouro,
                  EntregaLogradouroNumero,
                  EntregaLogradouroComplemento,
                  EntregaBairro,
                  EntregaMunicipioNome,
                  EntregaUnidadeFederativa,
                  EntregaCEP,
                  Observacoes,
                  ObservacoesLoja,
                  CodigoStatus,
                  DescricaoStatus,
                  DataHoraStatus,
                  PrevisaoEntrega,
                  CodigoNotaFiscal,
                  DataEntrega,
                  Cancelada,
                  DataEnvio,
                  NotaFiscalNumero,
                  DataColeta,
                },
              });

              // insere o payload completo em VendaFilaIntegração como backup

              let resCreate = await prisma.vendaFilaIntegracao.create({
                data: {
                  Codigo,
                  ClienteDocumento,
                  Payload: JSON.stringify(venda),
                },
              });

              if ((await resCreate.Id) != null) {
                // retira da fila de integração do ERP
                const request = require("superagent");
                const resListaIntegracao = await request
                  .post(
                    "http://cloud01.alternativa.net.br:2086/root/venda/" +
                      resCreate.Codigo +
                      "/ok"
                  )
                  .set("Accept", "application/json")
                  .set("accept-encoding", "gzip")
                  .set(
                    "X-Token",
                    "7Ugl10M0tNc4M8KxOk4q3K4f55mVBB2Rlw1OhI3WXYS0vRs"
                  );

                resListaIntegracao.body;
              }
            } else {
              // Realiza o UPDATE da venda já cadastrada
              console.log("Realizando Update da Venda: " + Codigo);

              await prisma.venda.update({
                where: { Codigo: Codigo },
                data: {
                  Codigo,
                  ClienteCodigo,
                  ClienteTipoPessoa,
                  ClienteDocumento,
                  TransportadoraCodigo,
                  DataVenda,
                  Entrega,
                  EntregaNome,
                  EntregaEmail,
                  NumeroObjeto,
                  EntregaTelefone,
                  EntregaLogradouro,
                  EntregaLogradouroNumero,
                  EntregaLogradouroComplemento,
                  EntregaBairro,
                  EntregaMunicipioNome,
                  EntregaUnidadeFederativa,
                  EntregaCEP,
                  Observacoes,
                  ObservacoesLoja,
                  CodigoStatus,
                  DescricaoStatus,
                  DataHoraStatus,
                  PrevisaoEntrega,
                  CodigoNotaFiscal,
                  DataEntrega,
                  Cancelada,
                  DataEnvio,
                  NotaFiscalNumero,
                  DataColeta,
                },
              });

              // insere o payload completo em VendaFilaIntegração como backup

              let resCreate = await prisma.vendaFilaIntegracao.create({
                data: {
                  Codigo,
                  ClienteDocumento,
                  Payload: JSON.stringify(venda),
                },
              });

              if ((await resCreate.Id) != null) {
                // retira da fila de integração do ERP
                const request = require("superagent");
                const resListaIntegracao = await request
                  .post(
                    "http://cloud01.alternativa.net.br:2086/root/venda/" +
                      resCreate.Codigo +
                      "/ok"
                  )
                  .set("Accept", "application/json")
                  .set("accept-encoding", "gzip")
                  .set(
                    "X-Token",
                    "7Ugl10M0tNc4M8KxOk4q3K4f55mVBB2Rlw1OhI3WXYS0vRs"
                  );

                resListaIntegracao.body;
              }
            }
          } catch (error) {
            console.error(error);
          }
        });
      } else {
        console.log("Lista de vendas vazia.");
      }
    } else {
      console.error("Erro ao obter o lista integração.");
      return;
    }
  }

  // consome cada item da fila de integração Vendas - fim

  mainConsomeLista();

  const numeroDeVendas = await prisma.venda.count();
  return { numeroDeVendas };
});

// Endpoint: Consome fila integração Vendas - fim

// Endpoint: Redundancia Carga Vendas Rastreio - início

app.get("/redundanciaCargaVendas", async (req, reply) => {
  const ultimaVenda = await prisma.venda.findFirst({
    orderBy: { Codigo: "desc" },
  });

  if (ultimaVenda?.Codigo !== undefined) {
    const request = require("superagent");
    const resVenda = await request
      .get(
        `https://d1-rastreio.onrender.com/cargaVendas?codigoInicial=${
          ultimaVenda?.Codigo - 100
        }&codigoFinal=${ultimaVenda?.Codigo}`
      )
      .set("Accept", "application/json");

    return reply
      .status(200)
      .send(
        `codigoInicial ${ultimaVenda?.Codigo - 200}  codigoFinal ${
          ultimaVenda?.Codigo
        }`
      );
  }
});

// Endpoint: Redundancia Carga Vendas Rastreio - Fim

// Endpoint: Carga inicial Vendas - início

app.get("/cargaVendas", async (request, reply) => {
  const maxRegistros = request.headers.maxRegistros;

  interface RouteParams {
    codigoInicial: number;
    codigoFinal: number;
  }

  const params = request.query as RouteParams;
  const codigoInicial = params.codigoInicial;
  const codigoFinal = params.codigoFinal;

  // busca fila de integração Vendas - inicio

  async function pegaVenda(Codigo: number) {
    try {
      const request = require("superagent");
      const resVenda = await request
        .get(`http://cloud01.alternativa.net.br:2086/root/venda/${Codigo}`)
        .set("Accept", "application/json")
        .set("accept-encoding", "gzip")
        .set("X-Token", "7Ugl10M0tNc4M8KxOk4q3K4f55mVBB2Rlw1OhI3WXYS0vRs");
      //.set("Limit", "1");

      //resVenda.body;

      if (resVenda.status == 200) {
        return JSON.stringify(resVenda.body);
      } else {
        throw new Error("Erro ao obter o lista integração.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  // busca fila de integração Vendas - fim

  // consome cada item da fila de integração Vendas - inicio

  async function mainConsomeLista(codigoInicial: number, codigoFinal: number) {
    for (let Codigo = codigoInicial; Codigo <= codigoFinal; Codigo++) {
      const existingRecord = await prisma.venda.findFirst({
        where: {
          Codigo: Codigo * 1,
        },
      });

      if (!existingRecord) {
        const resVenda = await pegaVenda(Codigo);

        if (resVenda) {
          const resListaIntegracaoJson = await JSON.parse(resVenda);

          if (resListaIntegracaoJson.venda != "") {
            resListaIntegracaoJson.venda.forEach(async (venda: any) => {
              try {
                interface Venda {
                  Codigo: number;
                  ClienteCodigo: number;
                  ClienteTipoPessoa: string;
                  ClienteDocumento: string;
                  TransportadoraCodigo: number;
                  DataVenda: string;
                  Entrega: boolean;
                  EntregaNome: string;
                  EntregaEmail: string;
                  NumeroObjeto: string;
                  EntregaTelefone: string;
                  EntregaLogradouro: string;
                  EntregaLogradouroNumero: string;
                  EntregaLogradouroComplemento: string;
                  EntregaBairro: string;
                  EntregaMunicipioNome: string;
                  EntregaUnidadeFederativa: string;
                  EntregaCEP: string;
                  Observacoes: string;
                  ObservacoesLoja: string;
                  CodigoStatus: number;
                  DescricaoStatus: string;
                  DataHoraStatus: string;
                  PrevisaoEntrega: string;
                  CodigoNotaFiscal: number;
                  DataEntrega: string;
                  Cancelada: boolean;
                  DataEnvio: string;
                  NotaFiscalNumero: number;
                  DataColeta: string;
                }

                const {
                  Codigo,
                  ClienteCodigo,
                  ClienteTipoPessoa,
                  ClienteDocumento,
                  TransportadoraCodigo,
                  DataVenda,
                  Entrega,
                  EntregaNome,
                  EntregaEmail,
                  NumeroObjeto,
                  EntregaTelefone,
                  EntregaLogradouro,
                  EntregaLogradouroNumero,
                  EntregaLogradouroComplemento,
                  EntregaBairro,
                  EntregaMunicipioNome,
                  EntregaUnidadeFederativa,
                  EntregaCEP,
                  Observacoes,
                  ObservacoesLoja,
                  CodigoStatus,
                  DescricaoStatus,
                  DataHoraStatus,
                  PrevisaoEntrega,
                  CodigoNotaFiscal,
                  DataEntrega,
                  Cancelada,
                  DataEnvio,
                  NotaFiscalNumero,
                  DataColeta,
                } = venda as Venda;

                console.log("Inserindo Venda: " + Codigo);

                await prisma.venda.create({
                  data: {
                    Codigo,
                    ClienteCodigo,
                    ClienteTipoPessoa,
                    ClienteDocumento,
                    TransportadoraCodigo,
                    DataVenda,
                    Entrega,
                    EntregaNome,
                    EntregaEmail,
                    NumeroObjeto,
                    EntregaTelefone,
                    EntregaLogradouro,
                    EntregaLogradouroNumero,
                    EntregaLogradouroComplemento,
                    EntregaBairro,
                    EntregaMunicipioNome,
                    EntregaUnidadeFederativa,
                    EntregaCEP,
                    Observacoes,
                    ObservacoesLoja,
                    CodigoStatus,
                    DescricaoStatus,
                    DataHoraStatus,
                    PrevisaoEntrega,
                    CodigoNotaFiscal,
                    DataEntrega,
                    Cancelada,
                    DataEnvio,
                    NotaFiscalNumero,
                    DataColeta,
                  },
                });
              } catch (error) {
                console.error(error);
              }
            });
          }
        } else {
          console.error("Erro ao obter o lista integração.");
          return;
        }
      } else {
        console.log(`Venda ${Codigo} já existe`);
      }
    }
  }

  // consome cada item da fila de integração Vendas - fim

  mainConsomeLista(codigoInicial, codigoFinal);

  const numeroDeVendas = await prisma.venda.count();
  return { numeroDeVendas };
});

// Endpoint: Carga inicial Vendas - fim

// Teste envio e-mail - início

app.get("/testeEmail", async (request, reply) => {
  function substituirMarcador(
    mensagem: string,
    marcador: string,
    conteudo: string
  ) {
    return mensagem.replace(new RegExp(`{{${marcador}}}`, "g"), conteudo);
  }
  // Envio e-mail - início
  // Conteúdo do e-mail
  // Caminho do arquivo HTML
  const filePath = path.join(__dirname, "", `template-email-resp-LastMileWow.html`);

  // Leitura do conteúdo do arquivo
  let emailContentWow = await fs.readFile(filePath, "utf-8");

  const emailContentDB = await prisma.rastreioStatusEmail.findFirst({
    where: {
      Status: "LastMileWow",
    },
  });

  if (emailContentDB?.Mensagem) {
    emailContentWow = substituirMarcador(
      emailContentWow,
      "conteudoEmail",
      emailContentDB.Mensagem
    );

    emailContentWow = substituirMarcador(
      emailContentWow,
      "conteudoEmail",
      emailContentDB.Mensagem
    );

    emailContentWow = substituirMarcador(
      emailContentWow,
      "primeiroNome",
      "Rodrigo"
    );

    emailContentWow = substituirMarcador(
      emailContentWow,
      "numeroPedido",
      "1234"
    );

    emailContentWow = substituirMarcador(
      emailContentWow,
      "dataVenda",
      "10/09/2024"
    );

    emailContentWow = substituirMarcador(
      emailContentWow,
      "enderecoEntrega",
      `Rua Fernando Machado, 165, Centro, Porto Alegre / RS`
    );

    emailContentWow = substituirMarcador(
      emailContentWow,
      "numeroNotaFiscal",
      "456789"
    );

    emailContentWow = substituirMarcador(
      emailContentWow,
      "transportadoraNome",
      "BAUER"
    );

    emailContentWow = substituirMarcador(
      emailContentWow,
      "previsaoEntrega",
      "19/09/2024"
    );

    // Opções do e-mail
    
    const mailOptionsRodrigo = {
      from: '"D1Fitness" <naoresponda@d1fitness.com.br>',
      to: `c.albuquerque.rodrigo@gmail.com`, // E-mail do destinatário
      subject: "Seu pedido foi entregue",
      text: emailContentDB.Mensagem,
      html: emailContentWow,
    };
    enviarEmail(mailOptionsRodrigo);
  }
});

// Teste envio e-mail - fim

// Endpoint: Update Vendas - início

app.get("/updateVendas", async (request, reply) => {
  interface RouteParams {
    diasPeriodo: number;
  }

  const params = request.query as RouteParams;
  const codigoInicial = params.diasPeriodo;

  async function pegaVenda(Codigo: number) {
    try {
      const request = require("superagent");
      const resVenda = await request
        .get(`http://cloud01.alternativa.net.br:2086/root/venda/${Codigo}`)
        .set("Accept", "application/json")
        .set("accept-encoding", "gzip")
        .set("X-Token", "7Ugl10M0tNc4M8KxOk4q3K4f55mVBB2Rlw1OhI3WXYS0vRs");
      //.set("Limit", "1");

      //resVenda.body;

      if (resVenda.status == 200) {
        return JSON.stringify(resVenda.body);
      } else {
        throw new Error("Erro ao obter o lista integração.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Função para substituir o marcador pela variável
  function substituirMarcador(
    mensagem: string,
    marcador: string,
    conteudo: string
  ) {
    return mensagem.replace(new RegExp(`{{${marcador}}}`, "g"), conteudo);
  }

  async function enviaWhatsStatus(venda: string) {
    const vendaJson = JSON.parse(venda);
    const requestSA = require("superagent");
    let mensagem = "";
    let emailContent = "";
    let whatsContent = "";
    let whatsContentwow = "";
    const transportadorasComTrackin = [
      122, 151, 112, 110, 120, 210, 223, 224, 102, 119, 52, 118,
    ];

    if (
      vendaJson.DescricaoStatus == "Nota Fiscal Emitida" &&
      vendaJson.EntregaNome != null
    ) {
      let primeiroNome: string = vendaJson.EntregaNome.split(" ")[0];
      // Conteúdo do mensagem whats
      const whatsContentDB = await prisma.rastreioStatusWhats.findFirst({
        where: {
          Status: "Nota Fiscal Emitida",
        },
      });

      if (whatsContentDB?.Mensagem) {
        whatsContent = substituirMarcador(
          whatsContentDB?.Mensagem,
          "primeiroNome",
          primeiroNome
        );
      }

      const bodyWhats = `{"phone": "5551991508579","message": "${whatsContent}"}`;

      const resZAPI = await requestSA
        .post(
          "https://api.z-api.io/instances/39BD5CDB5E0400B490BE0E63F29971E4/token/996973B6263DE0E95A59EF47/send-text"
        )
        .set("Content-Type", "application/json")
        .set("Client-Token", `${tokenZapi}`)
        .send(bodyWhats);

      // Msg para Renan
        
      const bodyWhatsD1 = `{"phone": "5548988038546","message": "${whatsContent}"}`;

      const resZAPID1 = await requestSA
        .post(
          "https://api.z-api.io/instances/39BD5CDB5E0400B490BE0E63F29971E4/token/996973B6263DE0E95A59EF47/send-text"
        )
        .set("Content-Type", "application/json")
        .set("Client-Token", `${tokenZapi}`)
        .send(bodyWhatsD1);

      const bodyWhats2 = `{"phone": "55${vendaJson.EntregaTelefone}","message": "${whatsContent}"}`;

      const resZAPI2 = await requestSA
        .post(
          "https://api.z-api.io/instances/39BD5CDB5E0400B490BE0E63F29971E4/token/996973B6263DE0E95A59EF47/send-text"
        )
        .set("Content-Type", "application/json")
        .set("Client-Token", `${tokenZapi}`)
        .send(bodyWhats2);
        /* Desligando Whats para Renan e cliente */

      // estouaqui6
      // Envio e-mail - início
      // Conteúdo do e-mail
      // Caminho do arquivo HTML
      const filePath = path.join(
        __dirname,
        "",
        `template-email-resp-NotaFiscalWow.html`
      );

      // Leitura do conteúdo do arquivo
      let emailContentWow = await fs.readFile(filePath, "utf-8");

      const emailContentDB = await prisma.rastreioStatusEmail.findFirst({
        where: {
          Status: "NotaFiscalWow",
        },
      });

      if (emailContentDB?.Mensagem) {
        emailContentWow = substituirMarcador(
          emailContentWow,
          "primeiroNome",
          primeiroNome
        );

        emailContentWow = substituirMarcador(
          emailContentWow,
          "conteudoEmail",
          emailContentDB.Mensagem
        );

        emailContentWow = substituirMarcador(
          emailContentWow,
          "numeroPedido",
          `${vendaJson.Codigo}`
        );

        const dataVendaFormatada = vendaJson.DataVenda.split("-")
          .reverse()
          .join("/");

        emailContentWow = substituirMarcador(
          emailContentWow,
          "dataVenda",
          dataVendaFormatada
        );

        emailContentWow = substituirMarcador(
          emailContentWow,
          "enderecoEntrega",
          `${vendaJson.EntregaLogradouro.split(",")[0]}, ${
            vendaJson.EntregaLogradouroNumero
          }, ${vendaJson.EntregaLogradouroComplemento}, ${
            vendaJson.EntregaBairro
          }, ${vendaJson.EntregaMunicipioNome} / ${
            vendaJson.EntregaUnidadeFederativa
          }`
        );

        emailContentWow = substituirMarcador(
          emailContentWow,
          "numeroNotaFiscal",
          vendaJson.NotaFiscalNumero
        );
      }
      // Opções do e-mail

      const mailOptionsRodrigo = {
        from: '"D1Fitness" <naoresponda@d1fitness.com.br>',
        to: `c.albuquerque.rodrigo@gmail.com`, // E-mail do destinatário
        subject: `${
          vendaJson.EntregaNome.split(" ")[0]
        }, estamos preparando o envio do seu pedido n. ${vendaJson.Codigo}`,
        text: mensagem,
        html: emailContentWow,
      };
      enviarEmail(mailOptionsRodrigo);

      const mailOptions = {
        from: '"D1Fitness" <naoresponda@d1fitness.com.br>',
        to: `${vendaJson.EntregaEmail}`, // E-mail do destinatário
        subject: `${
          vendaJson.EntregaNome.split(" ")[0]
        }, estamos preparando o envio do seu pedido n. ${vendaJson.Codigo}`,
        text: mensagem,
        html: emailContentWow,
      };

      enviarEmail(mailOptions);

      /* Desligando email Renan 
      const mailOptionsRenan = {
        from: '"D1Fitness" <naoresponda@d1fitness.com.br>',
        to: `renan@d1fitness.com.br`, // E-mail do destinatário
        subject: `${
          vendaJson.EntregaNome.split(" ")[0]
        }, estamos preparando o envio do seu pedido n. ${vendaJson.Codigo}`,
        text: mensagem,
        html: emailContentWow,
      };
      enviarEmail(mailOptionsRenan);
      
       */

    } else if (
      vendaJson.DescricaoStatus == "Enviado" &&
      vendaJson.nomeCliente != null &&
      !transportadorasComTrackin.includes(vendaJson.TransportadoraCodigo)
    ) {
      let primeiroNome: string = vendaJson.nomeCliente.split(" ")[0];
      const whatsContentDB = await prisma.rastreioStatusWhats.findFirst({
        where: {
          Status: "Enviado",
        },
      });

      // Mensagem simples
      if (whatsContentDB?.Mensagem) {
        whatsContent = substituirMarcador(
          whatsContentDB?.Mensagem,
          "primeiroNome",
          primeiroNome
        );
      }

      // Mensagem Wow - Envia via get /updateRastreio

      const bodyWhats = `{"phone": "5551991508579","message": "${whatsContent}"}`;

      const resZAPI = await requestSA
        .post(
          "https://api.z-api.io/instances/39BD5CDB5E0400B490BE0E63F29971E4/token/996973B6263DE0E95A59EF47/send-text"
        )
        .set("Content-Type", "application/json")
        .set("Client-Token", `${tokenZapi}`)
        .send(bodyWhats);

      const bodyWhatsD1 = `{"phone": "5548988038546","message": "${whatsContent}"}`;

      const resZAPID1 = await requestSA
        .post(
          "https://api.z-api.io/instances/39BD5CDB5E0400B490BE0E63F29971E4/token/996973B6263DE0E95A59EF47/send-text"
        )
        .set("Content-Type", "application/json")
        .set("Client-Token", `${tokenZapi}`)
        .send(bodyWhatsD1);

      const bodyWhats2 = `{"phone": "55${vendaJson.EntregaTelefone}","message": "${whatsContent}"}`;

      const resZAPI2 = await requestSA
        .post(
          "https://api.z-api.io/instances/39BD5CDB5E0400B490BE0E63F29971E4/token/996973B6263DE0E95A59EF47/send-text"
        )
        .set("Content-Type", "application/json")
        .set("Client-Token", `${tokenZapi}`)
        .send(bodyWhats2);
        
        /* Desligando whats Renan e cliente */

      // Envio e-mail - início
      // Conteúdo do e-mail
      // Caminho do arquivo HTML
      const filePath = path.join(
        __dirname,
        "",
        `template-email-resp-EnviadoSemPrevisaoWow.html`
      );

      // Leitura do conteúdo do arquivo
      let emailContentWow = await fs.readFile(filePath, "utf-8");

      const emailContentDB = await prisma.rastreioStatusEmail.findFirst({
        where: {
          Status: "EnviadoSemPrevisaoWow",
        },
      });

      if (emailContentDB?.Mensagem) {
        emailContentWow = substituirMarcador(
          emailContentWow,
          "primeiroNome",
          primeiroNome
        );

        emailContentWow = substituirMarcador(
          emailContentWow,
          "conteudoEmail",
          emailContentDB.Mensagem
        );
      }

      
      // Opções do e-mail - Rodrigo
      const mailOptionsRodrigo = {
        from: '"D1Fitness" <naoresponda@d1fitness.com.br>',
        to: `c.albuquerque.rodrigo@gmail.com`, // E-mail do destinatário
        subject: `${vendaJson.EntregaNome.split(" ")[0]}, seu pedido n. ${
          vendaJson.Codigo
        } está a caminho!`,
        text: mensagem,
        html: emailContentWow,
      };
      enviarEmail(mailOptionsRodrigo);

      // Opções do e-mail
      const mailOptions = {
        from: '"D1Fitness" <naoresponda@d1fitness.com.br>',
        to: `${vendaJson.EntregaEmail}`, // E-mail do destinatário
        subject: `${vendaJson.EntregaNome.split(" ")[0]}, seu pedido n. ${
          vendaJson.Codigo
        } está a caminho!`,
        text: mensagem,
        html: emailContentWow,
      };

      enviarEmail(mailOptions);

      /* Desligando e-mail Renan 
      const mailOptionsRenan = {
        from: '"D1Fitness" <naoresponda@d1fitness.com.br>',
        to: `renan@d1fitness.com.br`, // E-mail do destinatário
        subject: `${vendaJson.EntregaNome.split(" ")[0]}, seu pedido n. ${
          vendaJson.Codigo
        } está a caminho!`,
        text: mensagem,
        html: emailContentWow,
      };
      enviarEmail(mailOptionsRenan);
      
       */
    }
  }

  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - params.diasPeriodo); // Subtrai X dias da data atual

  // Define o tamanho do lote para a paginação
  const tamanhoLote = 30; // Pode ajustar conforme necessário

  let offset = 0;
  let todasVendasProcessadas = false;

  while (!todasVendasProcessadas) {
    await prisma.$transaction(
      async (prismaClient) => {
        const vendasFiltradas = await prismaClient.venda.findMany({
          take: tamanhoLote,
          skip: offset,
          where: {
            DataVenda: {
              gt: dataLimite.toISOString(),
            },
            Cancelada: false,
            NOT: [
              {
                DescricaoStatus: {
                  in: ["Enviado", "Finalizado", "Em Conflito/Disputa"],
                },
              },
              { EntregaEmail: { contains: "@mercadolivre.com" } },
              { EntregaEmail: { contains: "@marketplace.amazon.com.br" } },
            ],
          },
          orderBy: {
            Codigo: "desc",
          },
        });

        interface VendaInterface {
          Codigo: number;
          ClienteCodigo: number;
          ClienteDocumento: string;
          TransportadoraCodigo: number | null;
          TransportadoraNome: string | null;
          DataVenda: string | null;
          Entrega: boolean;
          EntregaNome: string | null;
          EntregaEmail: string | null;
          NumeroObjeto: string | null;
          EntregaTelefone: string | null;
          EntregaLogradouro: string | null;
          EntregaLogradouroNumero: string | null;
          EntregaLogradouroComplemento: string | null;
          EntregaBairro: string | null;
          EntregaMunicipioNome: string | null;
          EntregaUnidadeFederativa: string | null;
          EntregaCEP: string | null;
          Observacoes: string | null;
          ObservacoesLoja: string | null;
          CodigoStatus: number | null;
          DescricaoStatus: string | null;
          DataHoraStatus: string | null;
          PrevisaoEntrega: string | null;
          PrevisaoEntregaRastreio: string | null;
          CodigoNotaFiscal: number | null;
          DataEntrega: string | null;
          Cancelada: boolean;
          DataEnvio: string | null;
          NotaFiscalNumero: number | null;
          DataColeta: string | null;
        }

        async function processaVenda(
          prismaClient: PrismaClient,
          venda: VendaInterface
        ) {
          try {
            const resVenda = await pegaVenda(venda.Codigo);

            if (resVenda) {
              const resListaIntegracaoJson = JSON.parse(resVenda);

              if (
                resListaIntegracaoJson.venda &&
                resListaIntegracaoJson.venda.length > 0
              ) {
                for (const vendaJson of resListaIntegracaoJson.venda) {
                  const {
                    Codigo,
                    ClienteCodigo,
                    ClienteDocumento,
                    TransportadoraCodigo,
                    TransportadoraNome,
                    DataVenda,
                    Entrega,
                    EntregaNome,
                    EntregaEmail,
                    NumeroObjeto,
                    EntregaTelefone,
                    Observacoes,
                    ObservacoesLoja,
                    CodigoStatus,
                    DescricaoStatus,
                    DataHoraStatus,
                    PrevisaoEntrega,
                    CodigoNotaFiscal,
                    DataEntrega,
                    Cancelada,
                    DataEnvio,
                    NotaFiscalNumero,
                    DataColeta,
                  } = vendaJson as VendaInterface;

                  // Atualiza a venda apenas se o status for diferente
                  if (venda.DescricaoStatus !== DescricaoStatus) {
                    console.log(
                      `Atualizando Venda: ${venda.Codigo}. Status: de ${venda.DescricaoStatus} para ${DescricaoStatus}`
                    );

                    await prismaClient.venda.update({
                      where: { Codigo: venda.Codigo },
                      data: {
                        Codigo,
                        ClienteCodigo,
                        ClienteDocumento,
                        TransportadoraCodigo,
                        TransportadoraNome,
                        DataVenda,
                        Entrega,
                        EntregaNome,
                        EntregaEmail,
                        NumeroObjeto,
                        EntregaTelefone,
                        Observacoes,
                        ObservacoesLoja,
                        CodigoStatus,
                        DescricaoStatus,
                        DataHoraStatus,
                        PrevisaoEntrega,
                        CodigoNotaFiscal,
                        DataEntrega,
                        Cancelada,
                        DataEnvio,
                        NotaFiscalNumero,
                        DataColeta,
                      },
                    });

                    enviaWhatsStatus(JSON.stringify(vendaJson));
                  }
                }
              }
            } else {
              console.error(`Erro ao obter a venda: ${venda.Codigo}`);
            }
          } catch (error) {
            console.error(`Erro ao processar a venda ${venda.Codigo}:`, error);
          }
        }

        // Processa as vendas do lote atual
        for (const venda of vendasFiltradas) {
          if (venda.Codigo == 158153) {
            const pararaqui = 1;
          }
          await processaVenda(prisma, venda);
        }

        // Verifica se todos os registros foram processados
        if (vendasFiltradas.length < tamanhoLote) {
          todasVendasProcessadas = true;
        } else {
          offset += tamanhoLote;
        }
      },
      { timeout: 120000 }
    );
  }

  const totalVendasParaUpdate = await prisma.venda.findMany({
    select: {
      Codigo: true,
    },
    where: {
      DataVenda: {
        gt: dataLimite.toISOString(),
      },
      Cancelada: false,
      NOT: [
        {
          DescricaoStatus: {
            in: ["Enviado", "Finalizado", "Em Conflito/Disputa"],
          },
        },
        { EntregaEmail: { contains: "@mercadolivre.com" } },
        { EntregaEmail: { contains: "@marketplace.amazon.com.br" } },
      ],
    },
  });

  console.log(`Vendas para atualizar: ${totalVendasParaUpdate.length}`);
  return reply
    .status(200)
    .send(`Vendas para atualizar: ${totalVendasParaUpdate.length}`);
});

// Endpoint: Update Vendas - fim

// Endpoint: Update Tracking Rastreio - início

  app.get("/updateRastreio", async (request, reply) => {
    interface RouteParams {
      diasPeriodo: number;
    }

    const params = request.query as RouteParams;
    const codigoInicial = params.diasPeriodo;

    async function pegaVenda(Codigo: number) {
      try {
        const request = require("superagent");
        const resVenda = await request
          .get(`http://cloud01.alternativa.net.br:2086/root/venda/${Codigo}`)
          .set("Accept", "application/json")
          .set("accept-encoding", "gzip")
          .set("X-Token", "7Ugl10M0tNc4M8KxOk4q3K4f55mVBB2Rlw1OhI3WXYS0vRs");
        //.set("Limit", "1");

        //resVenda.body;

        if (resVenda.status == 200) {
          return JSON.stringify(resVenda.body);
        } else {
          throw new Error("Erro ao obter o lista integração.");
        }
      } catch (err) {
        console.error(err);
      }
    }

    // Função para substituir o marcador pela variável
    function substituirMarcador(
      mensagem: string,
      marcador: string,
      conteudo: string
    ) {
      return mensagem.replace(new RegExp(`{{${marcador}}}`, "g"), conteudo);
    }

    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - params.diasPeriodo); // Subtrai X dias da data atual

    // Define o tamanho do lote para a paginação
    const tamanhoLote = 30; // Pode ajustar conforme necessário

    let offset = 0;
    let todasVendasProcessadas = false;

    while (!todasVendasProcessadas) {
      await prisma.$transaction(
        async (prismaClient) => {
          const vendasFiltradasSSW = await prismaClient.venda.findMany({
            take: tamanhoLote,
            skip: offset,
            where: {
              DataHoraStatus: {
                gt: dataLimite.toISOString(),
              },
              DescricaoStatus: "Enviado",
              Cancelada: false,
              TransportadoraCodigo: {
                in: [122, 151, 112, 110, 120, 210, 223, 224],
              },
            },
            orderBy: {
              Codigo: "desc",
            },
          });

          interface ItensVenda {
            Codigo: number;
            ProdutoReferencia: string;
            ProdutoBarras: string;
            ProdutoBundleCodigo: number;
            VendaCodigo: number;
            ProdutoCodigo: number;
            PrecoUnitarioVenda: string;
            PrecoUnitarioCusto: string;
            EmbaladoParaPresente: boolean;
            ValorEmbalagemPresente: string;
            Quantidade: string;
            AtributosEspeciais: string;
            ItemNome: string;
            ItemDescontoPercentual: string;
            ItemDescontoValor: string;
            ItemValorBruto: string;
            ItemValorLiquido: string;
            Servico: boolean;
            Movimentacao: object;
          }
          interface VendaInterface {
            Codigo: number;
            ClienteCodigo: number;
            ClienteDocumento: string;
            TransportadoraCodigo: number | null;
            TransportadoraNome: string | null;
            DataVenda: string | null;
            Entrega: boolean;
            EntregaNome: string | null;
            EntregaEmail: string | null;
            NumeroObjeto: string | null;
            EntregaTelefone: string | null;
            EntregaLogradouro: string | null;
            EntregaLogradouroNumero: string | null;
            EntregaLogradouroComplemento: string | null;
            EntregaBairro: string | null;
            EntregaMunicipioNome: string | null;
            EntregaUnidadeFederativa: string | null;
            EntregaCEP: string | null;
            Observacoes: string | null;
            ObservacoesLoja: string | null;
            CodigoStatus: number | null;
            DescricaoStatus: string | null;
            DataHoraStatus: string | null;
            PrevisaoEntrega: string | null;
            PrevisaoEntregaRastreio: string | null;
            CodigoNotaFiscal: number | null;
            DataEntrega: string | null;
            Cancelada: boolean;
            DataEnvio: string | null;
            NotaFiscalNumero: number | null;
            DataColeta: string | null;
            ItensVenda: ItensVenda[];
          }

          async function enviaWhatsTracking(
            Telefone: any,
            Email: any,
            VendaString: any,
            momentoTracking: number,
            data_hora: string,
            previsaoEntrega: string
          ) {
            const Venda = JSON.parse(VendaString);
            const request = require("superagent");
            let qualMensagem = "";
            if (momentoTracking == 1) {
              qualMensagem = "PrevisaoWow";
            } else if (momentoTracking == 2) {
              qualMensagem = "LastMileWow";
            } else if (momentoTracking == 3) {
              qualMensagem = "EntregueWow";
            }

            // Mensagem Wow
            const whatsContentDBwow = await prisma.rastreioStatusWhats.findFirst({
              where: {
                Status: qualMensagem,
              },
            });

            const transportadoras = [
              { TransportadoraCodigo: 118, TransportadoraNome: "JAMEF " },
              {
                TransportadoraCodigo: 92,
                TransportadoraNome: "RETIRADA NO CD",
              },
              { TransportadoraCodigo: 120, TransportadoraNome: "TPL" },
              { TransportadoraCodigo: 51, TransportadoraNome: "TRANSLOVATO" },
              {
                TransportadoraCodigo: 174,
                TransportadoraNome: "MERCADO LIVRE",
              },
              {
                TransportadoraCodigo: 199,
                TransportadoraNome: "CORREIOS SEDEX",
              },
              { TransportadoraCodigo: 210, TransportadoraNome: "PREMIUM LOG" },
              { TransportadoraCodigo: 172, TransportadoraNome: "AMAZON" },
              { TransportadoraCodigo: 0, TransportadoraNome: "" },
              { TransportadoraCodigo: 103, TransportadoraNome: "CORREIOS PAC" },
              { TransportadoraCodigo: 190, TransportadoraNome: "AMAZON" },
              {
                TransportadoraCodigo: 223,
                TransportadoraNome: "TRANSFARRAPOS",
              },
              { TransportadoraCodigo: 215, TransportadoraNome: "R&D CARGO" },
              {
                TransportadoraCodigo: 168,
                TransportadoraNome: "MAGALU ENTREGAS",
              },
              { TransportadoraCodigo: 105, TransportadoraNome: "BERTOLINI" },
              {
                TransportadoraCodigo: 173,
                TransportadoraNome: "EXPRESSO SAO MIGUEL",
              },
              { TransportadoraCodigo: 27, TransportadoraNome: "MODULAR" },
              {
                TransportadoraCodigo: 104,
                TransportadoraNome: "CORREIOS SEDEX",
              },
              { TransportadoraCodigo: 177, TransportadoraNome: "CORREIOS PAC" },
              { TransportadoraCodigo: 151, TransportadoraNome: "ACEVILLE" },
              { TransportadoraCodigo: 102, TransportadoraNome: "MODULAR" },
              { TransportadoraCodigo: 122, TransportadoraNome: "BAUER" },
              { TransportadoraCodigo: 198, TransportadoraNome: "CORREIOS PAC" },
              { TransportadoraCodigo: 224, TransportadoraNome: "FLYVILLE" },
              { TransportadoraCodigo: 157, TransportadoraNome: "A COMBINAR" },
              { TransportadoraCodigo: 7, TransportadoraNome: "CORREIOS PAC" },
              {
                TransportadoraCodigo: 175,
                TransportadoraNome: "Mercado Envios",
              },
              {
                TransportadoraCodigo: 186,
                TransportadoraNome: "MERCADO LIVRE",
              },
              { TransportadoraCodigo: 112, TransportadoraNome: "ACEVILLE" },
              {
                TransportadoraCodigo: 145,
                TransportadoraNome: "MERCADO ENVIOS",
              },
              {
                TransportadoraCodigo: 176,
                TransportadoraNome: "CORREIOS SEDEX",
              },
              { TransportadoraCodigo: 110, TransportadoraNome: "GOBOR" },
              {
                TransportadoraCodigo: 122,
                TransportadoraNome: "CORREIOS SEDEX",
              },
              { TransportadoraCodigo: 103, TransportadoraNome: "" },
              { TransportadoraCodigo: 212, TransportadoraNome: "TRANSCARAPIÁ" },
              { TransportadoraCodigo: 156, TransportadoraNome: "NATIVA" },
              { TransportadoraCodigo: 119, TransportadoraNome: "MANN" },
              { TransportadoraCodigo: 220, TransportadoraNome: "PAJUCARA" },
              {
                TransportadoraCodigo: 187,
                TransportadoraNome: "MERCADO LIVRE",
              },
              { TransportadoraCodigo: 51, TransportadoraNome: "" },
              { TransportadoraCodigo: 6, TransportadoraNome: "CORREIOS SEDEX" },
              { TransportadoraCodigo: 52, TransportadoraNome: "MOVVI" },
              { TransportadoraCodigo: 52, TransportadoraNome: "" },
              // Add the rest of the entries here...
            ];
            function retornaNomeTransportadora(
              TransportadoraCodigo: number
            ): string | undefined {
              const transportadora = transportadoras.find(
                (item) => item.TransportadoraCodigo === TransportadoraCodigo
              );
              return transportadora
                ? transportadora.TransportadoraNome
                : undefined;
            }

            if (
              momentoTracking == 1 &&
              whatsContentDBwow?.Mensagem &&
              Venda.EntregaNome &&
              Venda.TransportadoraCodigo &&
              Venda.Itens
            ) {
              let whatsContentwow = substituirMarcador(
                whatsContentDBwow?.Mensagem,
                "primeiroNome",
                Venda.EntregaNome.split(" ")[0]
              );

              whatsContentwow = substituirMarcador(
                whatsContentwow,
                "numeroPedido",
                `${Venda.Codigo}`
              );

              const dataVendaFormatada = Venda.DataVenda.split("-")
                .reverse()
                .join("/");

              whatsContentwow = substituirMarcador(
                whatsContentwow,
                "dataVenva",
                dataVendaFormatada
              );
              // {{nomeTransportadoraNotaFiscal}}transportadoraNome

              // Substui dados da entrega
              whatsContentwow = substituirMarcador(
                whatsContentwow,
                "dadosEntrega",
                `Dados da entrega\n--------------------\nEndereço de entrega: ${
                  Venda.EntregaLogradouro.split(",")[0]
                }, ${Venda.EntregaLogradouroNumero}, ${
                  Venda.EntregaLogradouroComplemento
                }, ${Venda.EntregaBairro}, ${Venda.EntregaMunicipioNome} / ${
                  Venda.EntregaUnidadeFederativa
                }\nTransportadora: ${retornaNomeTransportadora(
                  Venda.TransportadoraCodigo
                )}\nNúmero Nota Fiscal: ${Venda.NotaFiscalNumero}`
              );

              whatsContentwow = substituirMarcador(
                whatsContentwow,
                "previsaoEntrega",
                previsaoEntrega
              );

              // Dispara msg whats
              const bodyWhats1 = `{"phone": "55${Telefone}","message": "${whatsContentwow}"}`;

              const resZAPI = await request
                .post(
                  "https://api.z-api.io/instances/39BD5CDB5E0400B490BE0E63F29971E4/token/996973B6263DE0E95A59EF47/send-text"
                )
                .set("Content-Type", "application/json")
                .set("Client-Token", `${tokenZapi}`)
                .send(bodyWhats1);

              // Disparo e-mail - inicio
              // estouaqui4
              // Conteúdo do e-mail
              // Caminho do arquivo HTML
              const filePath = path.join(
                __dirname,
                "",
                `template-email-resp-${qualMensagem}.html`
              );

              // Leitura do conteúdo do arquivo
              let emailContentWow = await fs.readFile(filePath, "utf-8");

              const emailContentDBWow =
                await prisma.rastreioStatusEmail.findFirst({
                  where: {
                    Status: qualMensagem,
                  },
                });

              if (emailContentDBWow?.Mensagem) {
                emailContentWow = substituirMarcador(
                  emailContentWow,
                  "primeiroNome",
                  Venda.EntregaNome.split(" ")[0]
                );

                emailContentWow = substituirMarcador(
                  emailContentWow,
                  "conteudoEmail",
                  emailContentDBWow.Mensagem
                );

                emailContentWow = substituirMarcador(
                  emailContentWow,
                  "numeroPedido",
                  `${Venda.Codigo}`
                );

                const dataVendaFormatada = Venda.DataVenda.split("-")
                  .reverse()
                  .join("/");
                emailContentWow = substituirMarcador(
                  emailContentWow,
                  "dataVenda",
                  dataVendaFormatada
                );
                // {{nomeTransportadoraNotaFiscal}}

                // Substui dados da entrega
                emailContentWow = substituirMarcador(
                  emailContentWow,
                  "enderecoEntrega",
                  `${Venda.EntregaLogradouro.split(",")[0]}, ${
                    Venda.EntregaLogradouroNumero
                  }, ${Venda.EntregaLogradouroComplemento}, ${
                    Venda.EntregaBairro
                  }, ${Venda.EntregaMunicipioNome} / ${
                    Venda.EntregaUnidadeFederativa
                  }`
                );

                emailContentWow = substituirMarcador(
                  emailContentWow,
                  "transportadoraNome",
                  `${retornaNomeTransportadora(Venda.TransportadoraCodigo)}`
                );

                emailContentWow = substituirMarcador(
                  emailContentWow,
                  "numeroNotaFiscal",
                  `${Venda.NotaFiscalNumero}`
                );

                emailContentWow = substituirMarcador(
                  emailContentWow,
                  "previsaoEntrega",
                  previsaoEntrega
                );

                // Opções do e-mail
                const mailOptions = {
                  from: '"D1Fitness" <naoresponda@d1fitness.com.br>',
                  to: `${Email}`, // E-mail do destinatário
                  subject: `${Venda.EntregaNome.split(" ")[0]}, seu pedido n. ${
                    Venda.Codigo
                  } está a caminho!`,
                  text: whatsContentwow,
                  html: emailContentWow,
                };
                enviarEmail(mailOptions);
              }
            } else if (
              momentoTracking == 2 &&
              whatsContentDBwow?.Mensagem &&
              Venda.EntregaNome &&
              Venda.TransportadoraCodigo &&
              Venda.Itens
            ) {
              let whatsContentwow = substituirMarcador(
                whatsContentDBwow?.Mensagem,
                "primeiroNome",
                Venda.EntregaNome.split(" ")[0]
              );
              // {{nomeTransportadoraNotaFiscal}}

              // Substui dados da entrega
              whatsContentwow = substituirMarcador(
                whatsContentwow,
                "dadosEntrega",
                `Dados da entrega\n--------------------\nEndereço de entrega: ${
                  Venda.EntregaLogradouro.split(",")[0]
                }, ${Venda.EntregaLogradouroNumero}, ${
                  Venda.EntregaLogradouroComplemento
                }, ${Venda.EntregaBairro}, ${Venda.EntregaMunicipioNome} / ${
                  Venda.EntregaUnidadeFederativa
                }\nTransportadora: ${retornaNomeTransportadora(
                  Venda.TransportadoraCodigo
                )}\nNúmero Nota Fiscal: ${Venda.NotaFiscalNumero}`
              );

              // Texto Itens
              const itensVenda = JSON.parse(JSON.stringify(Venda.Itens));
              let textoItens = "";
              for (const row of itensVenda) {
                const {
                  Codigo,
                  ProdutoReferencia,
                  ProdutoBarras,
                  ProdutoBundleCodigo,
                  VendaCodigo,
                  ProdutoCodigo,
                  PrecoUnitarioVenda,
                  PrecoUnitarioCusto,
                  EmbaladoParaPresente,
                  ValorEmbalagemPresente,
                  Quantidade,
                  AtributosEspeciais,
                  ItemNome,
                  ItemDescontoPercentual,
                  ItemDescontoValor,
                  ItemValorBruto,
                  ItemValorLiquido,
                  Servico,
                  Movimentacao,
                } = row;

                textoItens += `${Quantidade.split(".")[0]} X ${ItemNome}\n`;
              }

              // Substitui dados itens
              whatsContentwow = substituirMarcador(
                whatsContentwow,
                "dadosPedido",
                `\n\nItens do Pedido n. ${Venda.Codigo}\n--------------------\n${textoItens}`
              );

              // Dispara msg whats
              const bodyWhats1 = `{"phone": "55${Telefone}","message": "${whatsContentwow}"}`;

              const resZAPI = await request
                .post(
                  "https://api.z-api.io/instances/39BD5CDB5E0400B490BE0E63F29971E4/token/996973B6263DE0E95A59EF47/send-text"
                )
                .set("Content-Type", "application/json")
                .set("Client-Token", `${tokenZapi}`)
                .send(bodyWhats1);

              // Disparo e-mail - inicio
              // estouaqui5
              // Conteúdo do e-mail
              // Caminho do arquivo HTML
              const filePath = path.join(
                __dirname,
                "",
                `template-email-resp-${qualMensagem}.html`
              );

              // Leitura do conteúdo do arquivo
              let emailContentWow = await fs.readFile(filePath, "utf-8");

              const emailContentDBWow =
                await prisma.rastreioStatusEmail.findFirst({
                  where: {
                    Status: qualMensagem,
                  },
                });

              if (emailContentDBWow?.Mensagem) {
                emailContentWow = substituirMarcador(
                  emailContentWow,
                  "primeiroNome",
                  Venda.EntregaNome.split(" ")[0]
                );

                emailContentWow = substituirMarcador(
                  emailContentWow,
                  "conteudoEmail",
                  emailContentDBWow.Mensagem
                );

                emailContentWow = substituirMarcador(
                  emailContentWow,
                  "numeroPedido",
                  `${Venda.Codigo}`
                );

                const dataVendaFormatada = Venda.DataVenda.split("-")
                  .reverse()
                  .join("/");

                emailContentWow = substituirMarcador(
                  emailContentWow,
                  "dataVenda",
                  dataVendaFormatada
                );
                // {{nomeTransportadoraNotaFiscal}}

                // Substui dados da entrega
                emailContentWow = substituirMarcador(
                  emailContentWow,
                  "enderecoEntrega",
                  `${Venda.EntregaLogradouro.split(",")[0]}, ${
                    Venda.EntregaLogradouroNumero
                  }, ${Venda.EntregaLogradouroComplemento}, ${
                    Venda.EntregaBairro
                  }, ${Venda.EntregaMunicipioNome} / ${
                    Venda.EntregaUnidadeFederativa
                  }`
                );

                emailContentWow = substituirMarcador(
                  emailContentWow,
                  "transportadoraNome",
                  `${retornaNomeTransportadora(Venda.TransportadoraCodigo)}`
                );

                emailContentWow = substituirMarcador(
                  emailContentWow,
                  "numeroNotaFiscal",
                  `${Venda.NotaFiscalNumero}`
                );

                // Inicializa a variável que conterá o HTML dos itens
                let htmlItens = "";

                // Inicializa a variável para o total de itens
                let totalItens = 0;

                // Itera sobre cada item da venda
                for (const row of itensVenda) {
                  const {
                    Quantidade,
                    ItemNome,
                    // Outras propriedades, se necessário
                  } = row;

                  // Converte a quantidade para um número inteiro
                  const quantidadeInt = parseInt(Quantidade.split(".")[0], 10);

                  // Acumula o total de itens
                  totalItens += quantidadeInt;

                  // Monta o HTML para cada item
                  htmlItens += `
      <tr style="font-size: 12px;display:table-row;vertical-align:inherit;border-color:inherit;text-align:left;color:#5a5a5a;font-size:14px;font-family:sans-serif" align="left" valign="inherit">
        <td style="font-size: 12px;display:table-cell;vertical-align:inherit;border:none;padding-top:10px;padding-bottom:10px;padding-left:10px;border-bottom:1px solid #e0e0e0" valign="inherit">
          <table style="font-size: 12px;display:table;border-collapse:separate;border-spacing:2px;border-color:gray">
            <tbody style="font-size: 12px;display:table-row-group;vertical-align:middle;border-color:inherit" valign="middle">
              <tr style="font-size: 12px;display:table-row;vertical-align:inherit;border-color:inherit" valign="inherit">
                <td style="font-size: 12px;display:table-cell;vertical-align:inherit;border:none;color:#5a5a5a;font-family:sans-serif;" valign="inherit">
                  <p style="font-size: 12px;display:block;margin:0;">${ItemNome}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
        <td align="center" style="font-size: 12px;display:table-cell;vertical-align:inherit;border:none;font-family:sans-serif;padding-top:10px;padding-bottom:10px;border-bottom:1px solid #e0e0e0" valign="inherit">${quantidadeInt}</td>
      </tr>
    `;
                }

                // Adiciona a linha com o total de itens
                htmlItens += `
    <tr style="font-size: 12px;display:table-row;vertical-align:inherit;border-color:inherit;text-align:left;color:#5a5a5a;font-size:14px;font-family:sans-serif" align="left" valign="inherit">
      <td align="right" colspan="1" style="font-size: 12px;display:table-cell;vertical-align:inherit;border:none;font-family:sans-serif;padding:5px 0px 5px 10px" valign="inherit">
        <span style="font-size: 12px;color:#5A5A5A;font-weight:bold">Total de itens&nbsp;</span>
      </td>
      <td align="center" style="font-size: 12px;display:table-cell;vertical-align:inherit;border:none;font-family:sans-serif;font-weight:bold;padding-right:0px" valign="inherit">
        <span style="font-size: 12px;color:#5A5A5A;font-weight:bold">${totalItens}</span>
      </td>
    </tr>
  `;

                // Monta a tabela completa com o HTML dos itens
                const htmlTabelaItens = `
  <table cellspacing="0" cellpadding="0" border="0" style="font-size: 12px; display: table; border-collapse: separate; border-spacing: 2px; border-color: gray; width: 100%; margin: auto; text-align: center; border-radius: 20px; background: #fff;" align="center">
    <tbody style="font-size: 12px; display: table-row-group; vertical-align: middle; border-color: inherit;" valign="middle">
      <tr style="font-size: 12px; display: table-row; vertical-align: inherit; border-color: inherit;" valign="inherit">
        <td style="font-size: 12px; display: table-cell; vertical-align: inherit; border: none;" valign="inherit">
          <table width="100%" border="0" cellpadding="10" cellspacing="0" style="font-size: 12px; display: table; border-collapse: separate; border-spacing: 2px; border-color: gray; background: #fff;">
            <tbody style="font-size: 12px; display: table-row-group; vertical-align: middle; border-color: inherit;" valign="middle">
              <tr style="font-size: 12px; display: table-row; vertical-align: inherit; border-color: inherit; background: #fff;" align="left" valign="inherit">
                <td width="5%" style="font-size: 12px; display: table-cell; vertical-align: inherit; border: none; background: #fff;" align="left" valign="inherit">
                  <img src="https://mcusercontent.com/a908519133e0aa5f85fd3dbf0/images/b73d39ca-5dfa-4d8b-543d-4ed1b9d2ce16.jpg" width="27" height="27" align="left" style="font-size: 12px; max-width: 100vw; max-height: 83.3333vw;">
                </td>
                <td width="95%" style="font-size: 12px; display: table-cell; vertical-align: inherit; border: none; font-family: sans-serif; background: #fff; color: #5a5a5a; text-align: left; font-weight: bold; font-size: 15px;" align="left" valign="inherit">
                  Sua compra
                </td>
              </tr>
            </tbody>
          </table>

          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 12px; display: table; border-collapse: separate; border-spacing: 2px; border-color: gray; font-family: sans-serif; background: #fff; color: #5A5A5A; margin-top: 30px;">
            <tbody style="font-size: 12px; display: table-row-group; vertical-align: middle; border-color: inherit;" valign="middle">
              <tr style="font-size: 12px; display: table-row; vertical-align: inherit; border-color: inherit; text-align: left; color: #5a5a5a; font-family: sans-serif;" align="left" valign="inherit">
                <td style="font-size: 12px; display: table-cell; vertical-align: inherit; border: none; font-family: sans-serif; padding-bottom: 5px; padding-left: 10px; border-bottom: 1px solid #E0E0E0;" width="80%" valign="inherit">
                  <label style="font-size: 12px; cursor: default; font-size: 12px; font-weight: bold;">Produto</label>
                </td>
                <td align="center" style="font-size: 12px; display: table-cell; vertical-align: inherit; border: none; font-family: sans-serif; padding-bottom: 5px; border-bottom: 1px solid #E0E0E0;" width="20%" valign="inherit">
                  <span style="font-size: 12px; font-size: 12px; font-weight: bold;">Qtd</span>
                </td>
              </tr>
              ${htmlItens}
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
  `;

                emailContentWow = substituirMarcador(
                  emailContentWow,
                  "listaItens",
                  `${htmlTabelaItens}`
                );

                // Opções do e-mail
                const mailOptions = {
                  from: '"D1Fitness" <naoresponda@d1fitness.com.br>',
                  to: `${Email}`, // E-mail do destinatário
                  subject: `${Venda.EntregaNome.split(" ")[0]}, seu pedido n. ${
                    Venda.Codigo
                  } está chegando!`,
                  text: whatsContentwow,
                  html: emailContentWow,
                };
                enviarEmail(mailOptions);
              }
            } else if (
              momentoTracking == 3 &&
              whatsContentDBwow?.Mensagem &&
              Venda.EntregaNome
            ) {
              // Cenário 3 - início

              let whatsContentwow = substituirMarcador(
                whatsContentDBwow?.Mensagem,
                "primeiroNome",
                Venda.EntregaNome.split(" ")[0]
              );
              // {{nomeTransportadoraNotaFiscal}}

              // Substui dados da entrega
              whatsContentwow = substituirMarcador(
                whatsContentwow,
                "numeroPedido",
                `${Venda.Codigo}`
              );

              // Dispara msg whats
              const bodyWhats1 = `{"phone": "55${Telefone}","message": "${whatsContentwow}"}`;

              const resZAPI = await request
                .post(
                  "https://api.z-api.io/instances/39BD5CDB5E0400B490BE0E63F29971E4/token/996973B6263DE0E95A59EF47/send-text"
                )
                .set("Content-Type", "application/json")
                .set("Client-Token", `${tokenZapi}`)
                .send(bodyWhats1);

              // Disparo e-mail - inicio
              // estouaqui5
              // Conteúdo do e-mail
              // Caminho do arquivo HTML
              const filePath = path.join(
                __dirname,
                "",
                `template-email-resp-${qualMensagem}.html`
              );

              // Leitura do conteúdo do arquivo
              let emailContentWow = await fs.readFile(filePath, "utf-8");

              const emailContentDBWow =
                await prisma.rastreioStatusEmail.findFirst({
                  where: {
                    Status: qualMensagem,
                  },
                });

              if (emailContentDBWow?.Mensagem) {
                emailContentWow = substituirMarcador(
                  emailContentWow,
                  "primeiroNome",
                  Venda.EntregaNome.split(" ")[0]
                );

                emailContentWow = substituirMarcador(
                  emailContentWow,
                  "conteudoEmail",
                  emailContentDBWow.Mensagem
                );

                emailContentWow = substituirMarcador(
                  emailContentWow,
                  "numeroPedido",
                  `${Venda.Codigo}`
                );

                const dataVendaFormatada = Venda.DataVenda.split("-")
                  .reverse()
                  .join("/");

                emailContentWow = substituirMarcador(
                  emailContentWow,
                  "dataVenda",
                  dataVendaFormatada
                );
                // {{nomeTransportadoraNotaFiscal}}

                // Substui dados da entrega
                emailContentWow = substituirMarcador(
                  emailContentWow,
                  "enderecoEntrega",
                  `${Venda.EntregaLogradouro.split(",")[0]}, ${
                    Venda.EntregaLogradouroNumero
                  }, ${Venda.EntregaLogradouroComplemento}, ${
                    Venda.EntregaBairro
                  }, ${Venda.EntregaMunicipioNome} / ${
                    Venda.EntregaUnidadeFederativa
                  }`
                );

                emailContentWow = substituirMarcador(
                  emailContentWow,
                  "transportadoraNome",
                  `${retornaNomeTransportadora(Venda.TransportadoraCodigo)}`
                );

                emailContentWow = substituirMarcador(
                  emailContentWow,
                  "numeroNotaFiscal",
                  `${Venda.NotaFiscalNumero}`
                );

                // Opções do e-mail
                const mailOptions = {
                  from: '"D1Fitness" <naoresponda@d1fitness.com.br>',
                  to: `${Email}`, // E-mail do destinatário
                  subject: `${Venda.EntregaNome.split(" ")[0]}, seu pedido n. ${
                    Venda.Codigo
                  } foi entregue!`,
                  text: whatsContentwow,
                  html: emailContentWow,
                };
                enviarEmail(mailOptions);
              }
            }
          }

          async function processaVendaSSW(
            prismaClient: PrismaClient,
            vendaString: string
          ) {
            const venda = JSON.parse(vendaString);

            try {
              const resVenda = await pegaVenda(venda.Codigo);

              if (resVenda) {
                const resListaIntegracaoJson = JSON.parse(resVenda);

                if (
                  resListaIntegracaoJson.venda &&
                  resListaIntegracaoJson.venda.length > 0
                ) {
                  for (const vendaJson of resListaIntegracaoJson.venda) {
                    const {
                      Codigo,
                      ClienteCodigo,
                      ClienteDocumento,
                      TransportadoraCodigo,
                      TransportadoraNome,
                      DataVenda,
                      Entrega,
                      EntregaNome,
                      EntregaEmail,
                      NumeroObjeto,
                      EntregaTelefone,
                      Observacoes,
                      ObservacoesLoja,
                      CodigoStatus,
                      DescricaoStatus,
                      DataHoraStatus,
                      PrevisaoEntrega,
                      CodigoNotaFiscal,
                      DataEntrega,
                      Cancelada,
                      DataEnvio,
                      NotaFiscalNumero,
                      DataColeta,
                      ItensVenda,
                    } = vendaJson as VendaInterface;

                    // Pega ocorrencias rastreio
                    // SSW

                    const request = require("superagent");

                    // Busca dados NFe
                    const resNfe = await request
                      .get(
                        `http://cloud01.alternativa.net.br:2086/root/nfe/${venda.CodigoNotaFiscal}`
                      )
                      .set("Accept", "application/json")
                      .set("accept-encoding", "gzip")
                      .set(
                        "X-Token",
                        "7Ugl10M0tNc4M8KxOk4q3K4f55mVBB2Rlw1OhI3WXYS0vRs"
                      );

                    const NfeJson = JSON.parse(resNfe.text);

                    interface Nfe {
                      Codigo: number;
                      CodigoVenda: number;
                      CodigoCliente: number;
                      DataEmissao: string;
                      HoraEmissao: string;
                      HoraSaida: string;
                      Nfe: boolean;
                      Nfce: boolean;
                      NotaFiscalNumero: number;
                      TransportadoraCodigo: number;
                      TransportadoraNome: string;
                      MeioTransporte: string;
                      NumeroObjeto: string;
                      NotaFiscalEletronica: string;
                      Cancelada: boolean;
                      MotivoCancelamento: string;
                    }

                    const NotaFiscalEletronica =
                      NfeJson.nfe[0].NotaFiscalEletronica;

                    // Busca ocorrencias na SSW - início
                    // estouaqui3
                    const resSSW = await request
                      .post("https://ssw.inf.br/api/trackingdanfe")
                      .set("Accept", "application/json")
                      .set("Content-Type", "application/json")
                      .send(`{"chave_nfe": "${NotaFiscalEletronica}"}`);

                    const SSWocorrenciasJson = JSON.parse(resSSW.text);

                    if (SSWocorrenciasJson.success) {
                      for (const row of SSWocorrenciasJson.documento.tracking) {
                        const {
                          data_hora,
                          dominio,
                          filial,
                          cidade,
                          ocorrencia,
                          descricao,
                          tipo,
                          data_hora_efetiva,
                        } = row;

                        // Verifica se é ocorrencia Previsão, LastMile ou Entregue

                        if (/Previsao de entrega: /i.test(descricao)) {
                          const previsaoEntregaArray = descricao.split(
                            `Previsao de entrega: `
                          );
                          const previsaoEntregaComPonto =
                            previsaoEntregaArray[1].split(".");
                          const previsaoEntrega = previsaoEntregaComPonto[0];

                          console.log(
                            "Inserindo PrevisaoEntregaRastreio pelo SSW"
                          );
                          await prismaClient.venda.update({
                            where: { Codigo: venda.Codigo },
                            data: {
                              PrevisaoEntregaRastreio: previsaoEntrega,
                            },
                          });

                          const jaAvisouPrevisaoEntrega =
                            await prisma.venda.findFirst({
                              where: {
                                Codigo: Codigo,
                                NOT: [{ PrevisaoEntregaRastreioAviso: null }],
                              },
                            });

                          // #estouaqui
                          if (!jaAvisouPrevisaoEntrega) {
                            // Envia ocorrencias pro Whats
                            const telefoneRodrigo = "51991508579";
                            const emailRodrigo = "c.albuquerque.rodrigo@gmail.com";
                            const telefoneRenan = "48988038546";
                            const emailRenan ="renan@d1fitness.com.br";
                            await enviaWhatsTracking(
                              telefoneRodrigo,
                              emailRodrigo,
                              JSON.stringify(vendaJson),
                              1,
                              data_hora,
                              previsaoEntrega
                            );
                            // Deixando apena whats pro Renan
                              await enviaWhatsTracking(
                                telefoneRenan,
                                emailRodrigo,
                                JSON.stringify(vendaJson),
                                1,
                                data_hora,
                                previsaoEntrega
                              );
                              
                              await enviaWhatsTracking(
                                vendaJson.EntregaTelefone,
                                vendaJson.EntregaEmail,
                                JSON.stringify(vendaJson),
                                1,
                                data_hora,
                                previsaoEntrega
                              );
                              /* Desligando whatsprevisao entrega*/

                            console.log(
                              `Envio whats cliente. Pedido: ${venda.Codigo}. Motivo: Previsao Entrega`
                            );
                            // Registra envio Previsao Entrega
                            await prismaClient.venda.update({
                              where: { Codigo: venda.Codigo },
                              data: {
                                PrevisaoEntregaRastreioAviso: data_hora,
                              },
                            });
                          }
                        } else if (/SAIDA PARA ENTREGA/i.test(ocorrencia)) {
                          console.log("Inserindo LastMileRastreio pelo SSW");
                          await prismaClient.venda.update({
                            where: { Codigo: venda.Codigo },
                            data: {
                              LastMileRastreio: data_hora,
                            },
                          });

                          const jaAvisouLastMile = await prisma.venda.findFirst({
                            where: {
                              Codigo: Codigo,
                              NOT: [{ LastMileRastreioAviso: "NULL" }],
                            },
                          });

                          // #estouaqui
                          if (!jaAvisouLastMile) {
                            // Envia ocorrencias pro Whats
                            const telefoneRodrigo = "51991508579";
                            const emailRodrigo =
                              "c.albuquerque.rodrigo@gmail.com";
                            const telefoneRenan = "48988038546";
                            const emailRenan ="renan@d1fitness.com.br";
                            await enviaWhatsTracking(
                              telefoneRodrigo,
                              emailRodrigo,
                              JSON.stringify(vendaJson),
                              2,
                              data_hora,
                              ""
                            );
                            // Deixando apena o whats pro Renan
                              await enviaWhatsTracking(
                                telefoneRenan,
                                emailRodrigo,
                                JSON.stringify(vendaJson),
                                2,
                                data_hora,
                                ""
                              );
                              
                              await enviaWhatsTracking(
                                vendaJson.EntregaTelefone,
                                vendaJson.EntregaEmail,
                                JSON.stringify(vendaJson),
                                2,
                                data_hora,
                                ""
                              );
                              /* Desligando mensagens LastMile Renan e Cliente */
                            console.log(
                              `Envio whats cliente. Pedido: ${venda.Codigo}. Motivo: Last Mile`
                            );
                            // Registra envio LastMile
                            await prismaClient.venda.update({
                              where: { Codigo: venda.Codigo },
                              data: {
                                LastMileRastreioAviso: data_hora,
                              },
                            });
                          }
                        } else if (/MERCADORIA ENTREGUE/i.test(ocorrencia)) {
                          console.log("Inserindo EntregueRastreio pelo SSW");
                          await prismaClient.venda.update({
                            where: { Codigo: venda.Codigo },
                            data: {
                              EntregueRastreio: data_hora,
                            },
                          });

                          const jaAvisouEntregue = await prisma.venda.findFirst({
                            where: {
                              Codigo: Codigo,
                              NOT: [{ EntregueRastreioAviso: null }],
                            },
                          });

                          // #estouaqui2
                          if (!jaAvisouEntregue) {
                            // Envia ocorrencias pro Whats
                            const telefoneRodrigo = "51991508579";
                            const emailRodrigo =
                              "c.albuquerque.rodrigo@gmail.com";
                            const telefoneRenan = "48988038546";
                            const emailRenan ="renan@d1fitness.com.br";
                            await enviaWhatsTracking(
                              telefoneRodrigo,
                              emailRodrigo,
                              JSON.stringify(vendaJson),
                              3,
                              data_hora,
                              ""
                            );
                            // Deixando apena whats pro Renan
                            await enviaWhatsTracking(
                                telefoneRenan,
                                emailRodrigo,
                                JSON.stringify(vendaJson),
                                3,
                                data_hora,
                                ""
                              );
                              
                              
                              await enviaWhatsTracking(
                                vendaJson.EntregaTelefone,
                                vendaJson.EntregaEmail,
                                JSON.stringify(vendaJson),
                                3,
                                data_hora,
                                ""
                              );
                              /* Desligando mensagens Entregue Renan e Cliente */

                            console.log(
                              `Envio whats cliente. Pedido: ${venda.Codigo}. Motivo: Pedido Entregue`
                            );
                            // Registra envio Entregue
                            await prismaClient.venda.update({
                              where: { Codigo: venda.Codigo },
                              data: {
                                EntregueRastreioAviso: data_hora,
                              },
                            });
                          }
                        }
                      }
                    } else {
                      console.log("Não retornou tracking SSW");
                    }
                  }
                }
              } else {
                console.error(`Erro ao obter a venda: ${venda.Codigo}`);
              }
            } catch (error) {
              console.error(`Erro ao processar a venda ${venda.Codigo}:`, error);
            }
          }

          // Processa as vendas do lote atual
          for (const venda of vendasFiltradasSSW) {
            const vendaString = JSON.stringify(venda);
            await processaVendaSSW(prisma, vendaString);
          }

          // Verifica se todos os registros foram processados
          if (vendasFiltradasSSW.length < tamanhoLote) {
            todasVendasProcessadas = true;
          } else {
            offset += tamanhoLote;
          }
        },
        { timeout: 120000 }
      );
    }

    const totalVendasParaUpdate = await prisma.venda.findMany({
      select: {
        Codigo: true,
      },
      where: {
        DataHoraStatus: {
          gt: dataLimite.toISOString(),
        },
        DescricaoStatus: "Enviado",
        Cancelada: false,
        TransportadoraCodigo: {
          in: [122, 151, 112, 110, 120, 210, 223, 224],
        },
      },
    });

    console.log(`Vendas para atualizar: ${totalVendasParaUpdate.length}`);
    return reply
      .status(200)
      .send(`Vendas para atualizar: ${totalVendasParaUpdate.length}`);
  });

// Endpoint: Update Tracking Rastreio - fim

// Endpoint: Retorna Vendas - inicio

app.get("/vendas", async (request, reply) => {
  interface RouteParams {
    codigoInicial: string;
    codigoFinal: string;
  }

  const params = request.query as RouteParams;
  const codigoInicial = params.codigoInicial;
  const codigoFinal = params.codigoFinal;

  const vendas = await prisma.venda.findMany({
    select: {
      Codigo: true,
      DataVenda: true,
      CodigoNotaFiscal: true,
    },
    where: {
      Codigo: {
        gt: +codigoInicial,
        lt: +codigoFinal,
      },
      CodigoNotaFiscal: {
        gt: 0,
      },
      Cancelada: false,
    },
  });

  if (vendas.length > 0) {
    return reply.status(200).send(JSON.stringify(vendas));
  } else {
    return "Lista vazia.";
  }
});

// Endpoint: Retorna Vendas - fim

// Endpoint: Cadastra Nfe das Vendas últimos 3 meses - início

app.get("/cargaNfes", async (request, reply) => {
  interface RouteParams {
    codigoInicial: string;
    codigoFinal: string;
  }

  const params = request.query as RouteParams;
  const codigoInicial = params.codigoInicial;
  const codigoFinal = params.codigoFinal;

  // consome cada item da Lista Vendas - inicio

  async function mainInsereNfes(codigoInicial: string, codigoFinal: string) {
    const request = require("superagent");
    const resListaVendas = await request
      .get(
        `${API_URL}/vendas?codigoInicial=${codigoInicial}&codigoFinal=${codigoFinal}`
      )
      .set("Accept", "application/json");

    if (resListaVendas) {
      const resListaVendasJson = await JSON.parse(resListaVendas.text);

      resListaVendasJson.forEach(async (venda: any) => {
        try {
          const request = require("superagent");
          const resNfe = await request
            .get(
              `http://cloud01.alternativa.net.br:2086/root/nfe/${venda.CodigoNotaFiscal}`
            )
            .set("Accept", "application/json")
            .set("accept-encoding", "gzip")
            .set("X-Token", "7Ugl10M0tNc4M8KxOk4q3K4f55mVBB2Rlw1OhI3WXYS0vRs");

          const NfeJson = JSON.parse(resNfe.text);

          interface Nfe {
            Codigo: number;
            CodigoVenda: number;
            CodigoCliente: number;
            DataEmissao: string;
            HoraEmissao: string;
            HoraSaida: string;
            Nfe: boolean;
            Nfce: boolean;
            NotaFiscalNumero: number;
            TransportadoraCodigo: number;
            TransportadoraNome: string;
            MeioTransporte: string;
            NumeroObjeto: string;
            NotaFiscalEletronica: string;
            Cancelada: boolean;
            MotivoCancelamento: string;
          }

          const {
            Codigo,
            CodigoVenda,
            CodigoCliente,
            DataEmissao,
            HoraEmissao,
            HoraSaida,
            Nfe,
            Nfce,
            NotaFiscalNumero,
            TransportadoraCodigo,
            TransportadoraNome,
            MeioTransporte,
            NumeroObjeto,
            NotaFiscalEletronica,
            Cancelada,
            MotivoCancelamento,
          } = NfeJson.nfe[0] as Nfe;

          const existingRecord = await prisma.nfe.findFirst({
            where: {
              Codigo: Codigo,
            },
          });

          // Se não existir, insere o novo registro
          if (!existingRecord && CodigoVenda != null) {
            console.log("Inserindo Nfe: " + Codigo);

            await prisma.nfe.create({
              data: {
                Codigo,
                CodigoVenda,
                CodigoCliente,
                DataEmissao,
                HoraEmissao,
                HoraSaida,
                Nfe,
                Nfce,
                NotaFiscalNumero,
                TransportadoraCodigo,
                TransportadoraNome,
                MeioTransporte,
                NumeroObjeto,
                NotaFiscalEletronica,
                Cancelada,
                MotivoCancelamento,
                CodigoVendaRel: CodigoVenda,
              },
            });
          } else {
            // Realiza o UPDATE da venda já cadastrada
            console.log(
              "Realizando Update da NFe da Venda: " +
                CodigoVenda +
                "NÂO IMPLEMENTADO"
            );
            /*
            await prisma.nfe.update({
              where: { CodigoVenda: CodigoVenda },
              data: {
                Codigo,
                CodigoVenda,
                CodigoCliente,
                DataEmissao,
                HoraEmissao,
                HoraSaida,
                Nfe,
                Nfce,
                NotaFiscalNumero,
                TransportadoraCodigo,
                TransportadoraNome,
                MeioTransporte,
                NumeroObjeto,
                NotaFiscalEletronica,
                Cancelada,
                MotivoCancelamento,
                CodigoVendaRel: CodigoVenda,
              },
            });
            */
          }
        } catch (error) {
          console.error(error);
        }
      });
    } else {
      console.error("Erro ao obter o lista de vendas.");
      return;
    }
  }

  // consome cada item da fila de integração Vendas - fim

  mainInsereNfes(codigoInicial, codigoFinal);

  const numeroDeNFe = await prisma.nfe.count();
  return { numeroDeNFe };
});

// Endpoint: Cadastra Nfe das Vendas últimos 3 meses  - fim

// Busca Vendas por CPF - inicio

app.get("/ultimaVendaCPFCNPJ", async (request, reply) => {
  async function pegaVenda(Codigo: number) {
    try {
      const request = require("superagent");
      const resVenda = await request
        .get(`http://cloud01.alternativa.net.br:2086/root/venda/${Codigo}`)
        .set("Accept", "application/json")
        .set("accept-encoding", "gzip")
        .set("X-Token", "7Ugl10M0tNc4M8KxOk4q3K4f55mVBB2Rlw1OhI3WXYS0vRs");
      //.set("Limit", "1");

      // resVenda.body;

      if (resVenda.status == 200) {
        return JSON.stringify(resVenda.body);
      } else {
        throw new Error("Erro ao obter o lista integração.");
      }
    } catch (err) {
      console.error(err);
    }
  }
  interface RouteParams {
    cpfcnpj: string;
  }

  const params = request.query as RouteParams;
  const cpfcnpj = params.cpfcnpj;

  const ultimaVendaCPFCNPJ = await prisma.venda.findFirst({
    select: {
      Codigo: true,
      ClienteDocumento: true,
      DataVenda: true,
      DescricaoStatus: true,
      CodigoNotaFiscal: true,
      CodigoStatus: true,
      TransportadoraCodigo: true,
      Cancelada: true,
      DataHoraStatus: true,
      Entrega: true,
      NumeroObjeto: true,
      Observacoes: true,
    },
    where: {
      ClienteDocumento: cpfcnpj,
    },
    orderBy: {
      Codigo: "desc",
    },
  });

  if (ultimaVendaCPFCNPJ) {
    const vendaAtualizada = await pegaVenda(ultimaVendaCPFCNPJ.Codigo);
    return reply.status(200).send(await JSON.parse("" + vendaAtualizada));
  } else {
    const retorno = `{ "venda": [ { "NotaFiscalNumero": "0" } ] }`;
    return reply.status(200).send(JSON.parse(retorno));
  }
});

// Busca Vendas por CPF - fim

// Busca  Venda - inicio

app.get("/buscaVenda", async (request, reply) => {
  interface RouteParams {
    codigo: number;
    cpfcnpj: string;
  }

  const params = request.query as RouteParams;
  const codigo = params.codigo;
  const cpfcnpj = params.cpfcnpj;

  const buscaVenda = await prisma.venda.findFirst({
    where: {
      Codigo: +codigo,
    },
    orderBy: {
      Codigo: "desc",
    },
  });

  if (buscaVenda) {
    return reply.status(200).send({ buscaVenda });
  } else {
    const retorno = `{ "venda": [ { "NotaFiscalNumero": "0" } ] }`;
    return reply.status(200).send(JSON.parse(retorno));
  }
});

// Busca  Venda - fim

// Busca  Nfe - inicio

app.get("/buscaNfe", async (request, reply) => {
  interface RouteParams {
    codigonfe: number;
    cpfcnpj: string;
  }

  const params = request.query as RouteParams;
  const codigonfe = params.codigonfe;
  const cpfcnpj = params.cpfcnpj;

  const buscaNfe = await prisma.nfe.findFirst({
    where: {
      Codigo: +codigonfe,
    },
    orderBy: {
      Codigo: "desc",
    },
  });

  if (buscaNfe) {
    return reply.status(200).send({ buscaNfe });
  } else {
    const retorno = `{ "venda": [ { "NotaFiscalNumero": "0" } ] }`;
    return reply.status(200).send(JSON.parse(retorno));
  }
});

// Busca  Nfe - fim

// Endpoint: retorna Status última venda cpfcnpf - início

app.get("/retornaStatusEntrega", async (request, reply) => {
  interface RouteParams {
    codigo: number;
    cpfcnpj: string;
  }

  const params = request.query as RouteParams;
  const codigo = params.codigo;
  const cpfcnpj = params.cpfcnpj.replace(/[^\d]+/g, "").replace(/[^0-9]/g, "");
  let TransportadoraVenda = "";
  let resUltimaVendaCpfCnpjJsonFinal = {
    venda: [{ Codigo: "", DataVenda: "", NumeroNotaFiscal: 0 }],
  };
  let NotaFiscalNumero;
  let NotaFiscalEletronica;

  const requestREST = require("superagent");

  const resUltimaVendaCpfCnpj = await requestREST
    .get(`${API_URL}/ultimaVendaCPFCNPJ?cpfcnpj=${cpfcnpj}`)
    .set("Accept", "application/json");

  resUltimaVendaCpfCnpjJsonFinal = await JSON.parse(resUltimaVendaCpfCnpj.text);

  let resultadoFormatado = "";

  const resStatusEntregaBlip = await requestREST
    .get(`${API_URL}/retornaStatusEntregaBlip?cpfcnpj=${cpfcnpj}`)
    .set("Accept", "application/json");

  // insere registro de metricas
  let MetricaCodigoVenda;
  let MetricaDataVenda;
  //  verififa se ainda não foi gerada NF
  if (resUltimaVendaCpfCnpjJsonFinal.venda[0].NumeroNotaFiscal == 0) {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;

    MetricaCodigoVenda = 0;
    MetricaDataVenda = formattedDate; // apenas para não dar erro no PowerBI
  } else {
    MetricaCodigoVenda = resUltimaVendaCpfCnpjJsonFinal.venda[0].Codigo;
    MetricaDataVenda = resUltimaVendaCpfCnpjJsonFinal.venda[0].DataVenda;
  }

  try {
    const createdMetric = await prisma.rastreioChatMetricas.create({
      data: {
        CodigoVenda: `${MetricaCodigoVenda}`,
        DataVenda: `${MetricaDataVenda}`,
        NotaFiscalEletronica: `${NotaFiscalEletronica}`,
        TransportadoraNome: `${TransportadoraVenda}`,
        Ocorrencias: `${resultadoFormatado}`,
        Canal: "WhatsApp",
      },
    });
  } catch (error) {
    console.error(error);
  }

  return reply
    .status(200)
    .send(
      JSON.parse(
        JSON.stringify(`{ "ocorrencias": "${resStatusEntregaBlip.text}" }`)
      )
    );
});

// Esse é tem regra de negócio valendo, pois retorna apenas texto. /retornoStatusEntrega ta chamando /retornoStatusEntregaBlip

app.get("/retornaStatusEntregaBlip", async (request, reply) => {
  interface RouteParams {
    canal: any;
    codigo: number;
    cpfcnpj: string;
  }

  const params = request.query as RouteParams;
  const codigo = params.codigo;
  const cpfcnpj = params.cpfcnpj.replace(/[^\d]+/g, "").replace(/[^0-9]/g, "");
  let TransportadoraVenda = "";
  let resUltimaVendaCpfCnpjJsonFinal = {
    venda: [{ Codigo: "", DataVenda: "", NotaFiscalNumero: 0 }],
  };
  let NotaFiscalNumero: any;
  let NotaFiscalEletronica;
  let ClienteDocumento: any;

  // consome cada item da Lista Vendas - inicio

  async function mainBuscaOcorrencias(cpfcnpj: string) {
    const request = require("superagent");
    const resUltimaVendaCpfCnpj = await request
      .get(`${API_URL}/ultimaVendaCPFCNPJ?cpfcnpj=${cpfcnpj}`)
      .set("Accept", "application/json");

    if (await resUltimaVendaCpfCnpj) {
      const resUltimaVendaCpfCnpjJson = await JSON.parse(
        resUltimaVendaCpfCnpj.text
      );
      resUltimaVendaCpfCnpjJsonFinal = resUltimaVendaCpfCnpjJson;

      ClienteDocumento = resUltimaVendaCpfCnpjJson.venda[0].ClienteDocumento;

      try {
        if ((await resUltimaVendaCpfCnpjJson.venda[0].NotaFiscalNumero) > 0) {
          const requestNF = require("superagent");
          const resNfe = await requestNF
            .get(
              `http://cloud01.alternativa.net.br:2086/root/nfe/${resUltimaVendaCpfCnpjJson.venda[0].CodigoNotaFiscal}`
            )
            .set("Accept", "application/json")
            .set("accept-encoding", "gzip")
            .set("X-Token", "7Ugl10M0tNc4M8KxOk4q3K4f55mVBB2Rlw1OhI3WXYS0vRs");

          const NfeJson = JSON.parse(resNfe.text);

          interface Nfe {
            Codigo: number;
            CodigoVenda: number;
            CodigoCliente: number;
            DataEmissao: string;
            HoraEmissao: string;
            HoraSaida: string;
            Nfe: boolean;
            Nfce: boolean;
            NotaFiscalNumero: number;
            TransportadoraCodigo: number;
            TransportadoraNome: string;
            MeioTransporte: string;
            NumeroObjeto: string;
            NotaFiscalEletronica: string;
            Cancelada: boolean;
            MotivoCancelamento: string;
          }

          NotaFiscalEletronica = NfeJson.nfe[0].NotaFiscalEletronica;
          const TransportadoraNome = NfeJson.nfe[0].TransportadoraNome.replace(
            /\s/g,
            ""
          );
          // Atualiza TransportadoraVenda para utilizar fora desse nó
          TransportadoraVenda = TransportadoraNome;

          NotaFiscalNumero = NfeJson.nfe[0].NotaFiscalNumero;
          const NotaFiscalObjeto = NfeJson.nfe[0].NumeroObjeto;
          const cpfcnpj2 = NfeJson.nfe[0].DestinatarioDocumentoFiscal;

          // Se não existir, insere o novo registro
          if (NotaFiscalEletronica > 0) {
            console.log(
              `Transportadora ${TransportadoraNome}. Buscando ocorrências da Nfe: ` +
                NotaFiscalEletronica
            );

            // Busca Ocorrências Bauer, Aceville, Gobor, TPL

            if (
              TransportadoraNome == "BAUER" ||
              TransportadoraNome == "ACEVILLE" ||
              TransportadoraNome == "GOBOR" ||
              TransportadoraNome == "TPL" ||
              TransportadoraNome ==
                "PREMIUMLOGTRANSPORTERODOVIARIODECARGASLTDA" ||
              TransportadoraNome ==
                "TRANSFARRAPOSTRANSPORTESRODOVIARIOSDECARGASLTDA" ||
              TransportadoraNome == "FLYVILLETRANSPORTESLTDA"
            ) {
              const resSSW = await request
                .post("https://ssw.inf.br/api/trackingdanfe")
                .set("Accept", "application/json")
                .set("Content-Type", "application/json")
                .send(`{"chave_nfe": "${NotaFiscalEletronica}"}`);

              const SSWocorrenciasJson = JSON.parse(resSSW.text);

              if (SSWocorrenciasJson.success) {
                SSWocorrenciasJson.documento.tracking.forEach(
                  (
                    row: {
                      data_hora: string;
                      dominio: string;
                      filial: string;
                      cidade: string;
                      ocorrencia: string;
                      descricao: string;
                      tipo: string;
                      data_hora_efetiva: string;
                    },
                    index: number
                  ) => {
                    const {
                      data_hora,
                      dominio,
                      filial,
                      cidade,
                      ocorrencia,
                      descricao,
                      tipo,
                      data_hora_efetiva,
                    } = row;

                    resultadoFormatado += `Data/Hora da ocorrência: ${data_hora}\n`;
                    resultadoFormatado += `Observação: ${ocorrencia}\n`;
                    resultadoFormatado += `Descrição: ${descricao}\n`;

                    if (
                      index !==
                      SSWocorrenciasJson.documento.tracking.length - 1
                    ) {
                      resultadoFormatado += "------\n";
                    }
                  }
                );
              } else {
                resultadoFormatado +=
                  "A movimentação da Nota Fiscal não foi identificada. Por favor tente novamente em algumas horas.";
              }

              return JSON.stringify(resultadoFormatado);
            }

            // Busca Ocorrências TRANSLOVATO

            if (TransportadoraNome == "TRANSLOVATO") {
              return `Utilize a Nota Fiscal de número ${NotaFiscalNumero} para consultar a localização do seu pedido através do link: https://www.translovato.com.br/minha-carga/`;
            }

            // Busca Ocorrências MODULAR
            else if (TransportadoraNome == "MODULAR") {
              // 1. Busca lista de notas na Modular pra pegar o CONTROLE para passo 2
              const requestMODULAR = require("superagent");
              const resMODULAR = await requestMODULAR
                .post(`https://www.modular.com.br/rastrear/listar`)
                .set("Content-Type", "multipart/form-data")
                .field("dados[nfs]", `${NotaFiscalNumero}`)
                .field("dados[cnpjcpf]", `${cpfcnpj}`)
                .set("Accept", "application/json");

              const MODULARJson = JSON.parse(resMODULAR.text);

              // 2. Pega lista ocorrências do da NF[0]

              const requestMODULARocorrencias = require("superagent");
              const resMODULARocorrencias = await requestMODULARocorrencias
                .post(`https://www.modular.com.br/rastrear/listar/posicao`)
                .set("Content-Type", "multipart/form-data")
                .field(
                  "dados[filialorigem]",
                  `${MODULARJson.notas[0].Filial_Origem}`
                )
                .field("dados[controle]", `${MODULARJson.notas[0].Controle}`)
                .set("Accept", "application/json");

              const MODULARocorrenciasJson = JSON.parse(
                resMODULARocorrencias.text
              );

              function formatarDados(dados: any[]) {
                return dados.map((item) => ({
                  dataHora: item.Data_Inicial,
                  observacao: item.Localizacao,
                  descricao: item.Descricao,
                }));
              }

              // Aplicando a formatação aos dados originais
              const dadosFormatados = formatarDados(
                MODULARocorrenciasJson.posicao
              );

              return JSON.stringify(dadosFormatados);
            }

            // Busca Ocorrências MANN
            else if (TransportadoraVenda == "MANNTRANSPORTES") {
              const payloadMANN000000 = {
                user: {
                  name: "Chief",
                  filial: "117",
                  filialNum: 27,
                  auth: {
                    value:
                      "SSM13wnMAzrqbri/I3z0B6cw82xSDT+iBQSvDOxK8IrEv58kZnLDoO13DWnmPZEP8q7QO6AqQ0XEDW+7noeS60yyjQQlvKGU",
                    expire: "0001-01-01T00:00:00",
                  },
                },
                app: {
                  application: 2,
                  version: "1.000.000",
                },
                parameters: [`${cpfcnpj}`, 0],
              };
              const payloadMANN0000 = JSON.stringify(payloadMANN000000);

              const resMANN00 = await request
                .post("https://api.transmann.com.br/old/site/track/Simple")
                .set("Accept", "application/json")
                .set("Content-Type", "application/json")
                .send(payloadMANN0000);

              interface Report {
                columns: string[];
                rows: string[][];
              }

              const MANNocorrenciasJson00 = JSON.parse(resMANN00.text);

              const MANNocorrenciasJson001: Report =
                MANNocorrenciasJson00.report;

              if (MANNocorrenciasJson001 != null) {
                const ChaveAcessoMANN = MANNocorrenciasJson001.rows[0][10];

                const payloadMANN00 = {
                  user: {
                    name: "Chief",
                    filial: "117",
                    filialNum: 27,
                    auth: {
                      value:
                        "SSM13wnMAzrqbri/I3z0B6cw82xSDT+iBQSvDOxK8IrEv58kZnLDoO13DWnmPZEP8q7QO6AqQ0XEDW+7noeS60yyjQQlvKGU",
                      expire: "0001-01-01T00:00:00",
                    },
                  },
                  app: { application: 2, version: "1.000.000" },
                  parameters: [`${ChaveAcessoMANN}`],
                };
                const payloadMANN = JSON.stringify(payloadMANN00);

                const resMANN = await request
                  .post("https://api.transmann.com.br/old/site/track/NFhistory")
                  .set("Accept", "application/json")
                  .set("Content-Type", "application/json")
                  .send(payloadMANN);

                const MANNocorrenciasJson = JSON.parse(resMANN.text);

                interface ReportRow {
                  columns: string[];
                  rows: [string[], string[]];
                }

                const report: ReportRow = MANNocorrenciasJson.report;

                if (report && report.rows) {
                  report.rows.forEach((row, index) => {
                    const [dataHora, descricao] = row;

                    resultadoFormatado += `Data/Hora da ocorrência: ${dataHora}\n`;
                    resultadoFormatado += `Observação: \n`;
                    resultadoFormatado += `Descrição: ${descricao}\n`;

                    if (index !== report.rows.length - 1) {
                      resultadoFormatado += "------\n";
                    }
                  });
                } else {
                  resultadoFormatado +=
                    "A movimentação da Nota Fiscal não foi identificada. Por favor tente novamente em algumas horas.";
                }
              } else {
                resultadoFormatado +=
                  "A movimentação da Nota Fiscal não foi identificada. Por favor tente novamente em algumas horas.";
              }

              return JSON.stringify(resultadoFormatado);
            }

            // Busca Ocorrências MOVVI
            else if (TransportadoraNome == "MOVVI") {
              const resMOVVI = await request
                .get(
                  `https://apimovvi.meridionalcargas.com.br/api/rastrear-carga/${cpfcnpj2}/${NotaFiscalNumero}`
                )
                .set("Accept", "application/json");

              const MOVVIocorrenciasJson = JSON.parse(resMOVVI.text);

              if (MOVVIocorrenciasJson && MOVVIocorrenciasJson.ocorrencias) {
                MOVVIocorrenciasJson.ocorrencias.forEach(
                  (
                    row: { descricao: string; unidade: string; data: string },
                    index: number
                  ) => {
                    const { descricao, unidade, data } = row;

                    resultadoFormatado += `Data/Hora da ocorrência: ${data}\n`;
                    resultadoFormatado += `Observação: Unidade ${unidade}\n`;
                    resultadoFormatado += `Descrição: ${descricao}\n`;

                    if (index !== MOVVIocorrenciasJson.ocorrencias.length - 1) {
                      resultadoFormatado += "------\n";
                    }
                  }
                );
              } else {
                resultadoFormatado +=
                  "A movimentação da Nota Fiscal não foi identificada. Por favor tente novamente em algumas horas.";
              }

              return JSON.stringify(resultadoFormatado);
            }

            // Busca Ocorrências JAMEF
            else if (TransportadoraNome == "JAMEF") {
              const payloadJAMEF000000 = {
                username: "d1fitness",
                password: "d1fitness@188",
              };
              const payloadJAMEF0000 = JSON.stringify(payloadJAMEF000000);

              const resJAMEF00 = await request
                .post("https://api.jamef.com.br/login")
                .set("Content-Type", "application/json")
                .send(payloadJAMEF0000);

              const JAMEFlogin = JSON.parse(resJAMEF00.text);

              const ChaveAcessoJAMEF = JAMEFlogin.access_token;

              // seleciona documento emitente
              const Empresa = resUltimaVendaCpfCnpjJson.venda[0].Empresa;
              let CNPJEmpresa = "18850116000185";
              if (Empresa == 1) {
                CNPJEmpresa = "18850116000185";
              } else if (Empresa == 2) {
                CNPJEmpresa = "33054991000144";
              } else if (Empresa == 3) {
                CNPJEmpresa = "44350484000174";
              } else if (Empresa == 4) {
                CNPJEmpresa = "33054991000144";
              } else if (Empresa == 5) {
                CNPJEmpresa = "52544047000110";
              }

              const payloadJAMEF00 = {
                documentoResponsavelPagamento: CNPJEmpresa, // 18850116000185 52544047000110
                documentoDestinatario: `${cpfcnpj}`,
                numeroNotaFiscal: `${NotaFiscalNumero}`,
              };
              const payloadJAMEFok = JSON.stringify(payloadJAMEF00);

              const resJAMEF = await request
                .post("https://api.jamef.com.br/rastreamento/ver")
                .set("Accept", "application/json")
                .set("Content-Type", "application/json")
                .set("Authorization", `Bearer ${ChaveAcessoJAMEF}`)
                .send(payloadJAMEFok);

              const JAMEFocorrenciasJson = JSON.parse(resJAMEF.text);

              if (
                JAMEFocorrenciasJson &&
                JAMEFocorrenciasJson.conhecimentos[0].historico
              ) {
                JAMEFocorrenciasJson.conhecimentos[0].historico.forEach(
                  (
                    row: {
                      statusRastreamento: string;
                      dataAtualizacao: string;
                      numeroManifesto: string;
                      ufOrigem: string;
                      municipioOrigem: string;
                      ufDestino: string;
                      municipioDestino: string;
                      codigoOcorrencia: string;
                    },
                    index: number
                  ) => {
                    const {
                      statusRastreamento,
                      dataAtualizacao,
                      numeroManifesto,
                      ufOrigem,
                      municipioOrigem,
                      ufDestino,
                      municipioDestino,
                      codigoOcorrencia,
                    } = row;

                    resultadoFormatado += `Data/Hora da ocorrência: ${dataAtualizacao}\n`;
                    resultadoFormatado += `Observação: \n`;
                    resultadoFormatado += `Descrição: ${statusRastreamento}\n`;

                    if (
                      index !==
                      JAMEFocorrenciasJson.conhecimentos[0].historico.length - 1
                    ) {
                      resultadoFormatado += "------\n";
                    }
                  }
                );
              } else {
                resultadoFormatado +=
                  "A movimentação da Nota Fiscal não foi identificada. Por favor tente novamente em algumas horas.";
              }

              return JSON.stringify(resultadoFormatado);
            }

            // Busca Ocorrências BERTOLINI
            else if (/BERTOLINI/i.test(TransportadoraNome)) {
              return `Utilize a NF ${NotaFiscalNumero} e o link asseguir para consultar a localização do seu pedido: https://www.tbl.com.br/RastreamentoCarga `;
            }

            // Busca Ocorrências Mercado Livre
            else if (/EBAZAR/i.test(TransportadoraNome)) {
              return `Consulte a localização do seu pedido diretamente no site ou aplicativo do Mercado Livre.`;
            }
            // Busca Ocorrências CORREIOS
            else if (/PAC|SEDEX/i.test(TransportadoraNome)) {
              return `Utilize o link abaixo para consultar a localização do seu pedido: https://www.linkcorreios.com.br/${NotaFiscalObjeto}`;
            } else {
              return `Sem resposta da Transportadora ${TransportadoraNome}. Por favor, tente novamente em alguns instantes.`;
            }

            /*const resDataFrete = await request
              .get(
                `https://services.v1.datafreteapi.com/ocorrencias/nota-fiscal?nota_fiscal[chave]=${NotaFIscalEletronica}`
              )
              .set("Accept", "application/json")
              .set("accept-encoding", "gzip")
              .set("x-api-key", "26a98a8a-b58b-45fb-bcdb-c8b96d0f7c38");

            const resDataFreteJson = JSON.parse(resDataFrete.text); */

            // console.log(resDataFreteJson.data);

            // return resDataFreteJson.data;
          } else {
            // Retorna Status sem NF
            console.log(
              `Pedido n. ${resUltimaVendaCpfCnpjJson.venda[0].Codigo}: Aguardando emissão da Nota Fiscal.`
            );

            return `Pedido n. ${resUltimaVendaCpfCnpjJson.venda[0].Codigo}: Aguardando emissão da Nota Fiscal.`;
          }
        } else {
          return `Pedido n. ${resUltimaVendaCpfCnpjJson.venda[0].Codigo}: Aguardando emissão da Nota Fiscal.`;
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      console.error("Aguardando emissão da Nota Fiscal.");
      return;
    }
  }

  let resultadoFormatado = "";

  interface Ocorrencia {
    dataHora: string;
    observacao: string;
    descricao: string;
  }

  const retornoEndpointString = await mainBuscaOcorrencias(cpfcnpj);

  async function formatarOcorrencias() {
    const retornoEndpoint: Ocorrencia[] = await JSON.parse(
      "" + retornoEndpointString
    ); // Suponha que obterRetornoEndpoint() é a função que retorna a promessa

    let resultadoFormatado = "";

    retornoEndpoint.forEach((item, index) => {
      const { dataHora, observacao, descricao } = item;

      resultadoFormatado += `Data/Hora da ocorrência: ${dataHora}\n`;
      resultadoFormatado += `Observação: ${observacao}\n`;
      resultadoFormatado += `Descrição: ${descricao}\n`;

      if (index !== retornoEndpoint.length - 1) {
        resultadoFormatado += "------\n";
      }
    });

    return resultadoFormatado;
  }

  if (TransportadoraVenda == "MODULAR") {
    // Chamada da função para formatar as ocorrências
    const retornoEndpointFormatado = formatarOcorrencias();

    if (
      (await retornoEndpointFormatado) != "Aguardando emissão da Nota Fiscal."
    ) {
      // Função para formatar os dados conforme o desejado

      resultadoFormatado += await retornoEndpointFormatado;
    } else {
      resultadoFormatado = "Aguardando emissão da Nota Fiscal.";
    }
  } else if (
    TransportadoraVenda == "MANNTRANSPORTES" ||
    TransportadoraVenda == "MOVVI" ||
    TransportadoraVenda == "JAMEF" ||
    TransportadoraVenda == "BAUER" ||
    TransportadoraVenda == "ACEVILLE" ||
    TransportadoraVenda == "GOBOR" ||
    TransportadoraVenda == "TPL" ||
    TransportadoraVenda == "PREMIUMLOGTRANSPORTERODOVIARIODECARGASLTDA" ||
    TransportadoraVenda == "TRANSFARRAPOSTRANSPORTESRODOVIARIOSDECARGASLTDA" ||
    TransportadoraVenda == "FLYVILLETRANSPORTESLTDA"
  ) {
    // Mantem formato já pronto
  } else {
    resultadoFormatado += retornoEndpointString;
  }

  let canal = "Site";

  const canalReq = params.canal;

  if (canalReq == "WhatsApp-2") {
    canal = canalReq;
  }

  // insere registro de metricas
  let MetricaCodigoVenda;
  let MetricaDataVenda;
  //  verififa se ainda não foi gerada NF
  if (resUltimaVendaCpfCnpjJsonFinal.venda[0].NotaFiscalNumero == 0) {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;

    MetricaCodigoVenda = 0;
    MetricaDataVenda = formattedDate; // apenas para não dar erro no PowerBI
  } else {
    MetricaCodigoVenda = resUltimaVendaCpfCnpjJsonFinal.venda[0].Codigo;
    MetricaDataVenda = resUltimaVendaCpfCnpjJsonFinal.venda[0].DataVenda;
  }

  try {
    const createdMetric = await prisma.rastreioChatMetricas.create({
      data: {
        CodigoVenda: `${MetricaCodigoVenda}`,
        DataVenda: `${MetricaDataVenda}`,
        NotaFiscalEletronica: `${NotaFiscalEletronica}`,
        TransportadoraNome: `${TransportadoraVenda}`,
        Ocorrencias: `${resultadoFormatado}`,
        Canal: `${canal}`,
      },
    });
  } catch (error) {
    console.error(error);
  }

  return reply.status(200).send(resultadoFormatado);
});

// Endpoint: retorna Status última venda cpfcnpf - fim

// Busca  RastreioChat - inicio - DEPRACATED -> foi pro orquestrador

app.get("/rastreioChat", async (request, reply) => {
  interface RouteParams {
    Titulo: string;
    Etapa: number;
    Prioridade: number;
    Mensagem: string;
    Ativo: boolean;
  }

  const buscaRastreioChat = await prisma.rastreioChat.findMany({
    orderBy: {
      Etapa: "asc",
    },
  });

  if (buscaRastreioChat) {
    return reply.status(200).send({ buscaRastreioChat });
  } else {
    const retorno = `{ "Nenhuma mensagem cadastrada." }`;
    return reply.status(200).send(JSON.parse(retorno));
  }
});

// SHOW

app.get("/rastreioChat/:idMensagem", async (request, reply) => {
  const idMensagem: any = (request as any).parametro;
  interface RouteParams {
    Titulo: string;
    Etapa: number;
    Prioridade: number;
    Mensagem: string;
    Ativo: boolean;
  }

  const buscaRastreioChat = await prisma.rastreioChat.findFirst({
    where: {
      Id: `${idMensagem}`,
    },
  });

  if (buscaRastreioChat) {
    return reply.status(200).send({ buscaRastreioChat });
  } else {
    const retorno = `{ "Nenhuma mensagem cadastrada." }`;
    return reply.status(200).send(JSON.parse(retorno));
  }
});

// Busca  RastreioChat - fim

// Webhook Z-API -> Blip Rastreio - inicio

app.post("/zapi", async (request, reply) => {
  const requestSA = require("superagent");

  if (typeof request.body === "object" && request.body !== null) {
    const telefoneCliente = (request.body as { phone: string }).phone;
    const mensagemCliente = (request.body as { text: { message: string } }).text
      .message;

    let mensagem = "";
    let Etapa = 0;

    const bodyBlip = `{"ocorrencias": "Lista de ocorrencias"}`;

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")} ${now
      .getHours()
      .toString()
      .padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now
      .getSeconds()
      .toString()
      .padStart(2, "0")}`;

    function valida_cpfcnpj(inputCPFCNPJ: string): string {
      let documentoValido: string = "false";

      // Identifica e valida se o campo é de CPF ou CNPJ
      CPFouCNPJ(inputCPFCNPJ);

      function CPFouCNPJ(inputCPFCNPJ: string) {
        const contador: number = inputCPFCNPJ.replace(/[^0-9]/g, "").length;
        if (contador == 0) {
          documentoValido = "false";
        } else if (contador == 11) {
          if (validaCPF(inputCPFCNPJ)) {
            documentoValido = "cpf_valido";
          } else {
            documentoValido = "false";
          }
        } else if (contador == 14) {
          if (validaCNPJ(inputCPFCNPJ)) {
            documentoValido = "cnpj_valido";
          } else {
            documentoValido = "false";
          }
        } else {
          documentoValido = "false";
        }
      }

      // Valida CPF
      function validaCPF(cpf: string): boolean {
        cpf = cpf.replace(/[^\d]+/g, "");
        if (cpf == "") return false;
        if (
          cpf.length != 11 ||
          cpf == "00000000000" ||
          cpf == "11111111111" ||
          cpf == "22222222222" ||
          cpf == "33333333333" ||
          cpf == "44444444444" ||
          cpf == "55555555555" ||
          cpf == "66666666666" ||
          cpf == "77777777777" ||
          cpf == "88888888888" ||
          cpf == "99999999999" ||
          cpf == "01234567890"
        )
          return false;
        let add: number = 0;
        for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
        let rev: number = 11 - (add % 11);
        if (rev == 10 || rev == 11) rev = 0;
        if (rev != parseInt(cpf.charAt(9))) return false;
        add = 0;
        for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
        rev = 11 - (add % 11);
        if (rev == 10 || rev == 11) rev = 0;
        if (rev != parseInt(cpf.charAt(10))) return false;
        return true;
      }

      // Valida CNPJ
      function validaCNPJ(CNPJ: string): boolean {
        CNPJ = CNPJ.replace(/[^\d]+/g, "");
        const a: number[] = [];
        let b: number = 0;
        const c: number[] = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        for (let i = 0; i < 12; i++) {
          a[i] = parseInt(CNPJ.charAt(i));
          b += a[i] * c[i + 1];
        }
        let x: number = b % 11;
        if (x < 2) {
          a[12] = 0;
        } else {
          a[12] = 11 - x;
        }
        b = 0;
        for (let y = 0; y < 13; y++) {
          b += a[y] * c[y];
        }
        x = b % 11;
        if (x < 2) {
          a[13] = 0;
        } else {
          a[13] = 11 - x;
        }
        if (
          parseInt(CNPJ.charAt(12)) != a[12] ||
          parseInt(CNPJ.charAt(13)) != a[13]
        ) {
          return false;
        }
        if (parseInt(CNPJ) == 0) {
          return false;
        }
        return true;
      }

      return documentoValido; // Return value will be saved as "Return value variable" field name
    }

    // Verifica se já existe um registro com o mesmo agente e data_login
    const existingRecord = await prisma.contextoRastreio.findFirst({
      where: {
        Telefone: telefoneCliente,
      },
    });

    /* if (existingRecord) {
      Etapa = existingRecord.Etapa;
    } else {
      try {
        const createdContexto = await prisma.contextoRastreio.create({
          data: {
            Telefone: telefoneCliente,
            Data: formattedDate,
            MensagemCliente: mensagemCliente,
            Etapa: 1,
          },
        });
      } catch (error) {
        console.error(error);
      }
    } */

    if (Etapa == 0) {
      mensagem =
        "Olá!!\nPara retirar suas dúvidas, conte sempre com nosso time do SAC no número 11930373935 😉 \n\n ";

      try {
        const createdContexto = await prisma.contextoRastreio.create({
          data: {
            Telefone: telefoneCliente,
            Data: formattedDate,
            MensagemCliente: mensagemCliente,
            Etapa: 1,
          },
        });
      } catch (error) {
        console.error(error);
      }
    } /* else if (Etapa == 1) {
      const cpfcnpf = mensagemCliente;
      const documentoValido = valida_cpfcnpj(cpfcnpf.trim());

      if (documentoValido == "cpf_valido" || documentoValido == "cnpj_valido") {
        mensagem = "Estamos consultando o status da entrega";

        try {
          const createdContexto = await prisma.contextoRastreio.create({
            data: {
              Telefone: telefoneCliente,
              MensagemCliente: mensagemCliente,
              Data: formattedDate,
              Etapa: 2,
            },
          });
        } catch (error) {
          console.error(error);
        }

        // Envia mensagem de que foi buscar as ocorrências
        const bodyWhats0 = `{"phone": "${telefoneCliente}","message": "${mensagem}"}`;

        const resZAPI0 = await requestSA
          .post(
            "https://api.z-api.io/instances/39BD5CDB5E0400B490BE0E63F29971E4/token/996973B6263DE0E95A59EF47/send-text"
          )
          .set("Content-Type", "application/json")
          .set("Client-Token", `${tokenZapi}`)
          .send(bodyWhats0);

        // Busca ocorrências
        const resOcorrencias = await requestSA
          .get(
            `https://d1-rastreio.onrender.com/retornaStatusEntregaBlip?cpfcnpj=${cpfcnpf}&canal=WhatsApp-2`
          )
          .set("Content-Type", "application/json");

        // Envia ocorrencias pro Whats
        const bodyWhats1 = `{"phone": "${telefoneCliente}","message": "${resOcorrencias.text}"}`;

        const resZAPI1 = await requestSA
          .post(
            "https://api.z-api.io/instances/39BD5CDB5E0400B490BE0E63F29971E4/token/996973B6263DE0E95A59EF47/send-text"
          )
          .set("Content-Type", "application/json")
          .set("Client-Token", `${tokenZapi}`)
          .send(bodyWhats1);

        // FInaliza com mensagem para buscar mais informações no Whats oficial
        mensagem =
          "Para mais informações, fale com nosso atendimento pelo Whatsapp: 11930373935";

        // Zera o fluxo para recomeçar
        try {
          const createdContexto = await prisma.contextoRastreio.create({
            data: {
              Telefone: telefoneCliente,
              MensagemCliente: mensagemCliente,
              Data: formattedDate,
              Etapa: 0,
            },
          });
        } catch (error) {
          console.error(error);
        }
      } else {
        mensagem =
          "Por gentileza informe apenas os números do seu CPF ou CNPJ novamente";
      }
    } else {
      mensagem =
        "Não foi possível realizar a consulta de forma automática. Por gentileza, procure nosso time de atendimento através do link: https://wa.me/5511930373935 ";

      try {
        const createdContexto = await prisma.contextoRastreio.create({
          data: {
            Telefone: telefoneCliente,
            MensagemCliente: mensagemCliente,
            Data: formattedDate,
            Etapa: 0,
          },
        });
      } catch (error) {
        console.error(error);
      }
    } */

    // const blipuuid: string = uuid();
    const bodyWhats = `{"phone": "${telefoneCliente}","message": "${mensagem}"}`;

    const resZAPI = await requestSA
      .post(
        "https://api.z-api.io/instances/39BD5CDB5E0400B490BE0E63F29971E4/token/996973B6263DE0E95A59EF47/send-text"
      )
      .set("Content-Type", "application/json")
      .set("Client-Token", `${tokenZapi}`)
      .send(bodyWhats);

    return reply
      .status(200)
      .send(await JSON.parse(JSON.stringify(`Etapa atual: ${Etapa}`)));
  } else {
    console.error(error);

    return reply.status(500).send(error);
  }
});


// Webhook Z-API -> Blip Rastreio - inicio

app.post("/botpress", async (request, reply) => {
  const requestSA = require("superagent");

  if (typeof request.body === "object" && request.body !== null) {
    const telefoneCliente = (request.body as { phone: string }).phone;
    const mensagemCliente = (request.body as { text: { message: string } }).text.message;

      await prisma.conversationContext.create({
        data: {
          phone: "5551991508579",
          lastMessage: JSON.stringify(request.body),
          context: 'Experiência positiva',
          expiresAt: dayjs().add(48, 'hour').toDate(),
        },
      });

    return reply
      .status(200)
      .send(await JSON.parse(JSON.stringify(request.body)));
  } else {
    console.error(error);

    return reply.status(500).send(error);
  }
});

// Blip -> Whats Rastreio - inicio

app.post("/whatsrastreio", async (request, reply) => {
  const requestSA = require("superagent");

  const bodyBlip = JSON.parse(JSON.stringify(request.body));

  if (typeof bodyBlip === "object" && bodyBlip !== null) {
    console.log(bodyBlip);

    const telefoneCliente = (bodyBlip as { phone: string }).phone;
    const blocoCliente = (bodyBlip as { bloco: string }).bloco;

    let mensagem = "";

    if (blocoCliente == "solicita_cfpcnpj") {
      mensagem =
        "Olá!!\nEstou aqui pra te responder sobre status da entrega da sua compra 😉\nPara prosseguirmos, informe o seu CPF ou CNPJ";
    } else if (blocoCliente == "solicita_cfpcnpj_novamente") {
      mensagem =
        "Por gentileza informe apenas os números do seu CPF ou CNPJ novamente";
    } else if (blocoCliente == "verificando_ocorrencias") {
      mensagem = "Estamos consultando o status da entrega";
    } else if (blocoCliente == "envia_ocorrencias") {
      const ocorrencias = (bodyBlip as { ocorrencias: string }).ocorrencias;
      mensagem = ocorrencias;
    } else {
      mensagem =
        "Não foi possível realizar a consulta de forma automática. Por gentileza, procure nosso time de atendimento através do link: https://wa.me/5511930373935 ";
    }

    // const bodyWhats = `{"phone": "5548988038546","message": "Agente: ${data.respondent.respondent_utms.utm_source}\nProtocolo: ${data.respondent.respondent_utms.utm_campaign}\nNota: ${data.respondent.answers["Avalie o atendimento que você recebeu no Whatsapp!"]}\nSugestão: ${data.respondent.answers["Quer deixar alguma sugestão pra gente?"]} "}`;
    const bodyWhats = `{"phone": "5551991508579","message": "${mensagem}"}`;

    const resZAPI = await requestSA
      .post(
        "https://api.z-api.io/instances/39BD5CDB5E0400B490BE0E63F29971E4/token/996973B6263DE0E95A59EF47/send-text"
      )
      .set("Content-Type", "application/json")
      .set("Client-Token", `${tokenZapi}`)
      .send(bodyWhats);

    /* const res3 = await fetch(sendWhats.url, {
    method: sendWhats.method,
    headers: sendWhats.headers,
    body: sendWhats.body,
  }); */

    //console.log(resZAPI);

    return reply
      .status(200)
      .send(await JSON.parse(JSON.stringify(request.body)));
  } else {
    console.log("Nao entrou no if");

    return reply.status(200).send("500 NOK");
  }
});

// Busca  RastreioChat - fim

// Endpoint: Retorna Metricas - inicio

app.get("/metricas", async (request, reply) => {
  const metricas = await prisma.rastreioChatMetricas.findMany({});

  if (metricas.length > 0) {
    return reply.status(200).send(metricas);
  } else {
    return "Lista vazia.";
  }
});

// Percentual de consultas por Transportadora vs total de vendas com essa Transportadora

app.get("/metricasPercTransportadora", async (request, reply) => {
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - 60); // Subtrai 60 dias da data atual

  const vendasAgrupadas = await prisma.venda.groupBy({
    by: ["TransportadoraCodigo"],
    where: {
      Cancelada: false, // Exclui as vendas canceladas
      DataVenda: {
        gte: dataLimite.toISOString(), // Data de venda maior ou igual à data limite
      },
    },
    _count: {
      Codigo: true, // Conta o número de Codigo
    },
  });

  if (vendasAgrupadas.length > 0) {
    const vendasFormatadas = vendasAgrupadas.map((venda) => ({
      TotalVendas: venda._count.Codigo,
      TransportadoraCodigo: venda.TransportadoraCodigo,
    }));
    return reply.status(200).send(vendasFormatadas);
  } else {
    return "Lista vazia.";
  }
});

// Endpoint: Retorna Metricas - fim

// Chatbot pós-venda - início

app.post('/zapi2', handleIncomingMessage);

// Chatbot pós-venda - fim

// Exibe HTML - inicio

app.get("/webchat", async (request, reply) => {
  return reply.status(200).sendFile("rastreio-site-chat.html");
});

// Endpoint: Admin - fim

app
  .listen({
    host: "0.0.0.0",
    port: process.env.PORT ? Number(process.env.PORT) : 3334,
  })
  .then(() => {
    console.log("HTTP Server Running");
  });
