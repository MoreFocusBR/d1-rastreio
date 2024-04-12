// Register post type
// Contexto
function wa_context_post_type_callback() {
    const args = {
        public: true,
        label: 'WA Contexts',
        supports: ['custom-fields']
    };
    register_post_type('wa_context', args);
}
add_action('init', wa_context_post_type_callback);

// Creditos
function mia_credits_post_type_callback() {
    const args = {
        public: true,
        label: 'MIA Créditos',
        supports: ['custom-fields']
    };
    register_post_type('mia_credits', args);
}
add_action('init', mia_credits_post_type_callback);

// Transações
function mia_transacts_post_type_callback() {
    const args = {
        public: true,
        label: 'MIA Transações',
        supports: ['custom-fields']
    };
    register_post_type('mia_transacts', args);
}
add_action('init', mia_transacts_post_type_callback);

// GET ROUTES
// busca contexto
function wa_api_callback() {
    register_rest_route('botsgpt/v1', '/wa_context/', {
        methods: 'GET',
        callback: wa_api_callback
    });
}

// busca transação
function mia_busca_transacts_api_callback() {
    register_rest_route('botsgpt/v1', '/mia_transacts/', {
        methods: 'GET',
        callback: mia_busca_transacts_api_callback
    });
}

// busca creditos
function mia_credits_api_callback() {
    register_rest_route('botsgpt/v1', '/mia_credits/', {
        methods: 'GET',
        callback: mia_credits_api_callback
    });
}

// POST ROUTES
// cria contexto
function wa_api_post_callback() {
    register_rest_route('botsgpt/v1', '/wa_context/create/', {
        methods: 'POST',
        callback: wa_api_post_callback,
        permission_callback: () => true
    });
}

// insere credito
function mia_credits_api_post_callback() {
    register_rest_route('botsgpt/v1', '/mia_credits/create/', {
        methods: 'POST',
        callback: mia_credits_api_post_callback,
        permission_callback: () => true
    });
}

// gera pix
function gera_pix_api_post_callback() {
    register_rest_route('botsgpt/v1', '/mia_credits/novopix/', {
        methods: 'POST',
        callback: gera_pix_api_post_callback,
        permission_callback: () => true
    });
}

// gera transação
function mia_transacts_api_post_callback() {
    register_rest_route('botsgpt/v1', '/mia_transacts/create/', {
        methods: 'POST',
        callback: mia_transacts_api_post_callback,
        permission_callback: () => true
    });
}

// Insere contexto
function wa_api_post_callback(request) {
    const numero_wa = sanitize_text_field(request.get_param('numero'));
    if (numero_wa === '') {
        return new WP_REST_Response('Numero nao informado');
    } else {
        if (numero_wa > 0) {
            const custom_field_key = 'title';
            const args = {
                post_type: 'wa_context',
                title: numero_wa,
                posts_per_page: 1
            };
            const wa_context = get_posts(args);
            if (wa_context.length > 0) {
                const response = {
                    status: 200,
                    success: true,
                    data: wa_context[0]
                };
                const post = {
                    post_title: numero_wa,
                    post_content: sanitize_text_field(request.get_param('context')),
                    post_status: 'private',
                    post_author: 1,
                    post_type: 'wa_context'
                };
                const new_post_id = wp_insert_post(post);
            } else {
                const response = {
                    status: 200,
                    success: true,
                    data: ''
                };
                const post = {
                    post_title: numero_wa,
                    post_content: sanitize_text_field(request.get_param('context')),
                    post_status: 'private',
                    post_author: 1,
                    post_type: 'wa_context'
                };
                const new_post_id = wp_insert_post(post);
            }
            return new WP_REST_Response(response);
        }
    }
}

// Gera Pix
function gera_pix_api_post_callback(request) {
    const numero_wa = sanitize_text_field(request.get_param('numero'));
    if (numero_wa === '') {
        return new WP_REST_Response('Numero nao informado');
    } else {
        const url = 'https://api.mercadopago.com/v1/payments';
        const countryCode = numero_wa.substring(0, 2);
        const areaCode = numero_wa.substring(2, 4);
        const phoneNumber = numero_wa.substring(4);
        const data = {
            transaction_amount: 9,
            description: 'MIA 100 Mensagens',
            payment_method_id: 'pix',
            payer: {
                email: `${areaCode}${phoneNumber}@botsgpt.com.br`,
                first_name: numero_wa,
                last_name: 'User',
                identification: {
                    type: 'CPF',
                    number: '19119119100'
                },
                address: {
                    zip_code: '06233200',
                    street_name: 'Av. das Nações Unidas',
                    street_number: '3003',
                    neighborhood: 'Bonfim',
                    city: 'Osasco',
                    federal_unit: 'SP'
                }
            }
        };
        const headers = [
            'Content-Type: application/json',
            'Authorization: Bearer APP_USR-6742826432034633-031208-b2a0868c6262d1ec9173891fe853fe69-1328598685'
        ];
        const ch = curl_init();
        curl_setopt(ch, CURLOPT_URL, url);
        curl_setopt(ch, CURLOPT_POST, true);
        curl_setopt(ch, CURLOPT_POSTFIELDS, JSON.stringify(data));
        curl_setopt(ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt(ch, CURLOPT_HTTPHEADER, headers);
        const responseMP = curl_exec(ch);
        const response = {
            status: 200,
            success: true,
            data: responseMP
        };
        curl_close(ch);
        const dataWP = {
            numero: numero_wa,
            transacao: responseMP
        };
        const urlWP = 'https://botsgpt.com.br/wp-json/botsgpt/v1/mia_transacts/create/';
        curl_setopt(ch, CURLOPT_URL, urlWP);
        curl_setopt(ch, CURLOPT_POST, true);
        curl_setopt(ch, CURLOPT_POSTFIELDS, JSON.stringify(dataWP));
        curl_setopt(ch, CURLOPT_RETURNTRANSFER, true);
        const responseWP = curl_exec(ch);
        curl_close(ch);
        return new WP_REST_Response(response);
    }
}

// PIX FIM

// Insere créditos
function mia_credits_api_post_callback(request) {
    const numero_wa = sanitize_text_field(request.get_param('numero'));
    if (numero_wa === '') {
        return new WP_REST_Response('Numero nao informado');
    } else {
        if (numero_wa > 0) {
            const post = {
                post_title: numero_wa,
                post_content: sanitize_text_field(request.get_param('credits')),
                post_status: 'private',
                post_author: 1,
                post_type: 'mia_credits'
            };
            const new_post_id = wp_insert_post(post);
        }
        return new WP_REST_Response(new_post_id);
    }
}

// Insere transação
function mia_transacts_api_post_callback(request) {
    const numero_wa = sanitize_text_field(request.get_param('numero'));
    if (numero_wa === '') {
        return new WP_REST_Response('Numero nao informado');
    } else {
        if (numero_wa > 0) {
            const post = {
                post_title: numero_wa,
                post_content: sanitize_text_field(request.get_param('transacao')),
                post_status: 'publish',
                post_author: 1,
                post_type: 'mia_transacts'
            };
            const new_post_id = wp_insert_post(post);
        }
        return new WP_REST_Response(new_post_id);
    }
}

// Busca contexto
function wa_api_callback(request) {
    const numero_wa = sanitize_text_field(request.get_param('numero'));
    if (numero_wa === '') {
        return new WP_REST_Response('Numero nao informado');
    } else {
        if (numero_wa > 0) {
            const args = {
                post_type: 'wa_context',
                title: numero_wa,
                post_status: 'private',
                posts_per_page: 1
            };
            const wa_context = get_posts(args);
            const argsTotoal = {
                post_type: 'wa_context',
                post_status: 'private',
                title: numero_wa
            };
            const loop = new WP_Query(argsTotoal);
            const totalMensagensPrivate = loop.found_posts;
            const argsCreditos = {
                post_type: 'mia_credits',
                title: numero_wa,
                post_status: 'private'
            };
            let sum = 0;
            let recargas = 0;
            const query = new WP_Query(argsCreditos);
            if (query.have_posts()) {
                while (query.have_posts()) {
                    query.the_post();
                    sum += parseInt(get_the_content());
                    recargas++;
                }
                const totalRecargas = recargas;
                const totalCreditos = sum + 15;
            } else {
                const totalRecargas = 0;
                const totalCreditos = 15;
            }
            let precisaRecarregar = false;
            if (totalMensagensPrivate > totalCreditos) {
                precisaRecarregar = true;
            }
            if (wa_context.length > 0) {
                const response = {
                    status: 200,
                    success: true,
                    data: wa_context[0],
                    totalMensagens: totalMensagensPrivate,
                    totalRecargas: totalRecargas,
                    totalCreditos: totalCreditos,
                    precisaRecarregar: precisaRecarregar
                };
            } else {
                const response = {
                    status: 200,
                    success: true,
                    data: { post_content: 'Exibir Termos de Uso' },
                    totalMensagens: totalMensagensPrivate,
                    totalRecargas: totalRecargas,
                    totalCreditos: totalCreditos,
                    precisaRecarregar: precisaRecarregar
                };
            }
            return new WP_REST_Response(response);
        }
    }
}

// Busca transação
function mia_busca_transacts_api_callback(request) {
    const transactId = sanitize_text_field(request.get_param('transactId'));
    if (transactId === '') {
        return new WP_REST_Response('Transação nao informada');
    } else {
        if (transactId > 0) {
            const args = {
                post_type: 'mia_transacts',
                post_content: transactId,
                post_status: 'publish'
            };
            const query = new WP_Query(args);
            if (query.have_posts()) {
                query.the_post();
                const numero_wa = get_the_title();
            }
            const response = {
                status: 200,
                success: true,
                data: numero_wa
            };
            return new WP_REST_Response(response);
        }
    }
}

// Busca creditos
function mia_credits_api_callback(request) {
    const numero_wa = sanitize_text_field(request.get_param('numero'));
    if (numero_wa === '') {
        return new WP_REST_Response('Numero nao informado');
    } else {
        if (numero_wa > 0) {
            const args = {
                post_type: 'mia_credits',
                title: numero_wa,
                post_status: 'private'
            };
            let sum = 0;
            let recargas = 0;
            const query = new WP_Query(args);
            if (query.have_posts()) {
                while (query.have_posts()) {
                    query.the_post();
                    sum += parseInt(get_the_content());
                    recargas++;
                }
                const response = {
                    status: 200,
                    success: true,
                    data: recargas,
                    totalCreditos: sum
                };
            } else {
                const response = {
                    status: 200,
                    success: true,
                    data: { post_content: '0 créditos localizados' },
                    totalCreditos: sum
                };
            }
            return new WP_REST_Response(response);
        }
    }
}


