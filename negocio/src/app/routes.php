<?php
    namespace App\controllers;
    use Psr\Http\Message\ResponseInterface as Response;
    use Psr\Http\Message\ServerRequestInterface as Request;

    use Slim\Routing\RouteCollectorProxy;

    $app->get('/', function (Request $request, Response $response, $args) {
        $response->getBody()->write("Bienvenido al Servidor de Negocios");
        return $response;
    });

    $app->group('/api',function(RouteCollectorProxy $api){
        $api->group('/artefacto',function(RouteCollectorProxy $endpoint){
            $endpoint->get('/read[/{id}]', Artefacto::class . ':read');
            $endpoint->post('', Artefacto::class . ':create');
            $endpoint->put('/{id}', Artefacto::class . ':update');
            $endpoint->delete('/{id}', Artefacto::class . ':delete');
            $endpoint->get('/filtrar/{pag}/{lim}', Artefacto::class . ':filtrar');
            $endpoint->get('/{id}', Artefacto::class . ':buscar');
        });
 

        $api->group('/cliente',function(RouteCollectorProxy $endpoint){
            $endpoint->get('/{id}', Cliente::class . ':buscar');
            $endpoint->post('', Cliente::class . ':create');
            $endpoint->put('/{id}', Cliente::class . ':update');
            $endpoint->delete('/{id}', Cliente::class . ':delete');
            $endpoint->get('/filtrar/{pag}/{lim}', Cliente::class . ':filtrar');
        });
        

        $api->group('/admin',function(RouteCollectorProxy $endpoint){
            $endpoint->get('/{id}', Administrador::class . ':buscar');
            $endpoint->post('', Administrador::class . ':create');
            $endpoint->put('/{id}', Administrador::class . ':update');
            $endpoint->delete('/{id}', Administrador::class . ':delete');
            $endpoint->get('/filtrar/{pag}/{lim}', Administrador::class . ':filtrar');
        });

        $api->group('/oficinista',function(RouteCollectorProxy $endpoint){
            $endpoint->get('/{id}', Oficinista::class . ':buscar');
            $endpoint->post('', Oficinista::class . ':create');
            $endpoint->put('/{id}', Oficinista::class . ':update');
            $endpoint->delete('/{id}', Oficinista::class . ':delete');
            $endpoint->get('/filtrar/{pag}/{lim}', Oficinista::class . ':filtrar');
        });

        $api->group('/tecnico',function(RouteCollectorProxy $endpoint){
            $endpoint->get('/{id}', Tecnico::class . ':buscar');
            $endpoint->post('', Tecnico::class . ':create');
            $endpoint->put('/{id}', Tecnico::class . ':update');
            $endpoint->delete('/{id}', Tecnico::class . ':delete');
            $endpoint->get('/filtrar/{pag}/{lim}', Tecnico::class . ':filtrar');
        });

        $api->group('/usr',function(RouteCollectorProxy $endpoint){
            $endpoint->get('/{id}', Usuario::class . ':buscar');
            $endpoint->patch('/reset/{idUsuario}', Usuario::class . ':resetPassw');
            $endpoint->patch('/change/{idUsuario}', Usuario::class . ':changePassw');
            $endpoint->patch('/rol/{idUsuario}', Usuario::class . ':changeRol');
        });

        $api->group('/auth',function(RouteCollectorProxy $endpoint){
            $endpoint->patch('', Auth::class . ':iniciar');
            $endpoint->delete('/{idUsuario}', Auth::class . ':cerrar');
            $endpoint->patch('/refresh', Auth::class . ':refrescar');
        });

        $api->group('/caso',function(RouteCollectorProxy $endpoint){
            // Rutas CRUD básicas
            $endpoint->get('', Caso::class . ':read');                        // GET /caso - listar casos
            $endpoint->post('', Caso::class . ':create');                     // POST /caso - crear caso
            
            // Rutas específicas (deben ir ANTES de las rutas con parámetros genéricos)
            $endpoint->get('/filtrar/{pag}/{lim}', Caso::class . ':filtrar'); // GET /caso/filtrar/{pag}/{lim}
            $endpoint->get('/estado/{codigo}', Caso::class . ':estado');      // GET /caso/estado/{codigo}
            $endpoint->post('/estado/{codigo}', Caso::class . ':cambiarEstado'); // POST /caso/estado/{codigo}
            $endpoint->get('/cliente/{idCliente}', Caso::class . ':casosPorCliente'); // GET /caso/cliente/{idCliente}
            $endpoint->get('/tecnico/{idTecnico}', Caso::class . ':casosPorTecnico'); // GET /caso/tecnico/{idTecnico}
            $endpoint->get('/historial/{codigo}', Caso::class . ':historial'); // GET /caso/historial/{codigo}
            
            // Rutas con parámetros genéricos (deben ir AL FINAL)
            $endpoint->get('/{codigo}', Caso::class . ':buscar');             // GET /caso/{codigo}
            $endpoint->put('/{codigo}', Caso::class . ':update');             // PUT /caso/{codigo}
            $endpoint->delete('/{codigo}', Caso::class . ':delete');          // DELETE /caso/{codigo}
        });
        
    });


    