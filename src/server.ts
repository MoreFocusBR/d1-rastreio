import { FastifyInstance } from "fastify";
import { PrismaClient, Venda } from "@prisma/client";
import { FastifyRequest, FastifyReply } from "fastify";
import fastify from "fastify";
import {
  JsonArray,
  JsonConvertible,
  JsonObject,
  JsonValue,
} from "@prisma/client/runtime/library";
import { notaFiscalRoutes } from "./routes/nota-fiscal.routes";

const app = fastify();

const prisma = new PrismaClient();

app.register(notaFiscalRoutes, {
  prefix: "/nfe",
});

const authToken = "effca82a-7127-45de-9a53-b71fc01a9064";

const API_URL = "https://d1-rastreio.onrender.com";

// Endpoint: Admin - inicio

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

      resVenda.body;

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

              const existingRecord = await prisma.venda.findFirst({
                where: {
                  Codigo: Codigo,
                },
              });

              // Se não existir, insere o novo registro
              if (!existingRecord && Cancelada != true) {
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
              } else {
                console.log("Venda ja existente: " + Codigo);
              }
            } catch (error) {
              console.error(error);
            }
          });
        }
      } else {
        console.error("Erro ao obter o lista integração.");
        return;
      }
    }
  }

  // consome cada item da fila de integração Vendas - fim

  mainConsomeLista(codigoInicial, codigoFinal);

  const numeroDeVendas = await prisma.venda.count();
  return { numeroDeVendas };
});

// Endpoint: Carga inicial Vendas - fim

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
    return reply.status(200).send({ ultimaVendaCPFCNPJ });
  } else {
    const retorno = `{ "cpfcnpj": "${cpfcnpj}", "Codigo": "", "Mensagem": "Nenhuma venda localizada." }`;
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
    const retorno = `{ "cpfcnpj": "${cpfcnpj}", "Codigo": "", "Mensagem": "Nenhuma venda localizada." }`;
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
    const retorno = `{ "cpfcnpj": "${cpfcnpj}", "Codigo": "", "Mensagem": "Nenhuma venda localizada." }`;
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
  const cpfcnpj = params.cpfcnpj;

  // consome cada item da Lista Vendas - inicio

  async function mainBuscaOcorrencias(cpfcnpj: string) {
    const request = require("superagent");
    const resUltimaVendaCpfCnpj = await request
      .get(`${API_URL}/ultimaVendaCPFCNPJ?cpfcnpj=${cpfcnpj}`)
      .set("Accept", "application/json");

    if (resUltimaVendaCpfCnpj) {
      const resUltimaVendaCpfCnpjJson = await JSON.parse(
        resUltimaVendaCpfCnpj.text
      );

      try {
        const request = require("superagent");
        const resNfe = await request
          .get(
            `http://cloud01.alternativa.net.br:2086/root/nfe/${resUltimaVendaCpfCnpjJson.ultimaVendaCPFCNPJ.CodigoNotaFiscal}`
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

        const NotaFIscalEletronica = NfeJson.nfe[0].NotaFiscalEletronica;
        const TransportadoraNome = NfeJson.nfe[0].TransportadoraNome;

        // Se não existir, insere o novo registro
        if (TransportadoraNome == "BAUER" && NotaFIscalEletronica > 0) {
          console.log(
            "Transportadora Bauer. Buscando ocorrências na DataFrete. Nfe: " +
              NotaFIscalEletronica
          );

          const resDataFrete = await request
            .get(
              `https://services.v1.datafreteapi.com/ocorrencias/nota-fiscal?nota_fiscal[chave]=${NotaFIscalEletronica}`
            )
            .set("Accept", "application/json")
            .set("accept-encoding", "gzip")
            .set("x-api-key", "26a98a8a-b58b-45fb-bcdb-c8b96d0f7c38");

          const resDataFreteJson = JSON.parse(resDataFrete.text);

          console.log(resDataFreteJson.data);

          return resDataFreteJson.data;
        } else {
          // Realiza o UPDATE da venda já cadastrada
          console.log("Não é BAUER: " + NotaFIscalEletronica);

          return "Não é BAUER: " + NotaFIscalEletronica;
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      console.error("Erro ao obter o lista de vendas.");
      return;
    }
  }

  const retornoEndpoint = mainBuscaOcorrencias(cpfcnpj);

  // Função para formatar os dados conforme o desejado
  function formatarDados(dados: any[]) {
    return dados.map((item) => ({
      "Data/Hora da ocorrência": `${item.dt_ocorrencia} ${item.hora_ocorrencia}`,
      Observação: item.observacao,
      Descrição: item.desc_ocorrencia,
    }));
  }

  // Aplicando a formatação aos dados originais
  const dadosFormatados = formatarDados(await retornoEndpoint);

  return reply.status(200).send(await dadosFormatados);
});

// Endpoint: retorna Status última venda cpfcnpf - fim

// Endpoint: Admin - fim

app
  .listen({
    host: "0.0.0.0",
    port: process.env.PORT ? Number(process.env.PORT) : 3334,
  })
  .then(() => {
    console.log("HTTP Server Running");
  });
