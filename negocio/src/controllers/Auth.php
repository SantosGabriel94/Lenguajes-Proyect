<?php
namespace App\controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class Auth extends ServicioCURL {
    private const ENDPOINT = '/auth';

    public function iniciar(Request $request, Response $response, $args) {
        $body = $request->getParsedBody(); // ✅ se parsea como array
        $respA = $this->ejecutarCURL(self::ENDPOINT, 'PATCH', json_encode($body)); // ✅ JSON serializado

        $response->getBody()->write($respA['resp']);
        return $response->withStatus($respA['status'])
                        ->withHeader('Content-Type', 'application/json');
    }

    public function cerrar(Request $request, Response $response, $args) {
        $token = $this->extraerToken($request);
        $uri = '/' . $args['idUsuario'];

        $respA = $this->ejecutarCURL(self::ENDPOINT . $uri, 'DELETE', null, $token);
        return $response->withStatus($respA['status']);
    }

    public function refrescar(Request $request, Response $response, $args) {
        $token = $this->extraerToken($request);
        $body = $request->getParsedBody(); 
        $respA = $this->ejecutarCURL(self::ENDPOINT . '/refresh', 'PATCH', json_encode($body), $token);

        $response->getBody()->write($respA['resp']);
        return $response->withHeader('Content-Type', 'application/json')
                        ->withStatus($respA['status']);
    }
}
