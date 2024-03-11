"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fastify_1 = __importDefault(require("fastify"));
const app = (0, fastify_1.default)();
const prisma = new client_1.PrismaClient();
const authToken = "effca82a-7127-45de-9a53-b71fc01a9064";
// Endpoint: Admin - inicio
// Endpoint: authUsers - inicio
app.post('/login', async (request, reply) => {
    const authTokenHeader = request.headers.token;
    const stringbody = JSON.stringify(request.body);
    const data = JSON.parse(stringbody);
    const email = data.email;
    const pw = data.pw;
    const existingRecord = await prisma.adminUsers.findFirst({
        where: {
            email: email,
            password: pw
        }
    });
    if (existingRecord && authTokenHeader == authToken) {
        return reply.status(200).send(existingRecord?.token);
    }
    else {
        return reply.status(401).send("Dados de login incorretos.");
    }
});
// Endpoint: authUsers - fim
// Endpoint: newUser - inicio
app.post('/newUser', async (request, reply) => {
    const authTokenHeader = request.headers.token;
    const stringbody = JSON.stringify(request.body);
    const data = JSON.parse(stringbody);
    const email = data.email;
    const pw = data.pw;
    // Verifica se já existe um registro com o mesmo email
    const existingRecord = await prisma.adminUsers.findFirst({
        where: {
            email: email
        }
    });
    // Se não existir, insere o novo registro
    if (!existingRecord && authTokenHeader == authToken) {
        try {
            const createdUser = await prisma.adminUsers.create({
                data: {
                    email: email,
                    password: pw
                }
            });
            return reply.status(200).send(createdUser.token);
        }
        catch (error) {
            console.error(error);
            return reply.status(500).send('Internal Server Error');
        }
    }
    else {
        return reply.status(401).send('Usuario ja existente');
    }
});

app.get('/status-entrega', async (request, reply) => {

    return 'teste'
})

// Endpoint: newUser - fim
// Endpoint: Admin - fim
app.listen({
    host: '0.0.0.0',
    port: process.env.PORT ? Number(process.env.PORT) : 3333,
}).then(() => {
    console.log('HTTP Server Running ');
});
