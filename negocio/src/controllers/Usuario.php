<?php
namespace App\controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class Usuario extends ServicioCURL {
    private const ENDPOINT = '/usr';

    public function buscar(Request $request, Response $response, $args) {
        $token = $this->extraerToken($request);
        $uri = '/' . $args['id'];
        
        // Consumir el servicio de búsqueda del servidor de datos
        $respA = $this->ejecutarCURL(self::ENDPOINT . $uri, 'GET', null, $token);
        
        $response->getBody()->write($respA['resp']);
        
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($respA['status']);
    }

    public function resetPassw(Request $request, Response $response, $args) {
        $token = $this->extraerToken($request);
        $uri = '/reset/' . $args['idUsuario'];
        
        // Consumir el servicio de reset de contraseña del servidor de datos
        $respA = $this->ejecutarCURL(self::ENDPOINT . $uri, 'PATCH', null, $token);
        
        return $response->withStatus($respA['status']);
    }

    public function changePassw(Request $request, Response $response, $args) {
        $token = $this->extraerToken($request);
        $uri = '/change/' . $args['idUsuario'];
        $body = $request->getBody();
        
        // Consumir el servicio de cambio de contraseña del servidor de datos
        $respA = $this->ejecutarCURL(self::ENDPOINT . $uri, 'PATCH', $body, $token);
        
        return $response->withStatus($respA['status']);
    }

    public function changeRol(Request $request, Response $response, $args) {
        $token = $this->extraerToken($request);
        $uri = '/rol/' . $args['idUsuario'];
        $body = $request->getBody();
        
        // Consumir el servicio de cambio de rol del servidor de datos
        $respA = $this->ejecutarCURL(self::ENDPOINT . $uri, 'PATCH', $body, $token);
        
        return $response->withStatus($respA['status']);
    }
}
