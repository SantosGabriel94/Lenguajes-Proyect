<?php
namespace App\controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class Caso extends ServicioCURL {
    private const ENDPOINT = '/caso';

    public function create(Request $request, Response $response, $args) {
        $token = $this->extraerToken($request);
        $body = $request->getBody();
        
        // Consumir el servicio de creación del servidor de datos
        $respA = $this->ejecutarCURL(self::ENDPOINT, 'POST', $body, $token);
        
        return $response->withStatus($respA['status']);
    }

    public function filtrar(Request $request, Response $response, $args) {
        $token = $this->extraerToken($request);
        $uri = "/filtrar/{$args['pag']}/{$args['lim']}";
        
        // Agregar parámetros de consulta si existen
        $queryParams = $request->getQueryParams();
        if (!empty($queryParams)) {
            $uri .= '?' . http_build_query($queryParams);
        }
        
        // Consumir el servicio de filtrado del servidor de datos
        $respA = $this->ejecutarCURL(self::ENDPOINT . $uri, 'GET', null, $token);
        
        $response->getBody()->write($respA['resp']);
        
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($respA['status']);
    }

    public function estado(Request $request, Response $response, $args) {
        $token = $this->extraerToken($request);
        $uri = '/estado/' . $args['codigo'];
        
        // Consumir el servicio de estado del servidor de datos
        $respA = $this->ejecutarCURL(self::ENDPOINT . $uri, 'GET', null, $token);
        
        $response->getBody()->write($respA['resp']);
        
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($respA['status']);
    }

    public function cambiarEstado(Request $request, Response $response, $args) {
        $token = $this->extraerToken($request);
        $uri = '/estado/' . $args['codigo'];
        $body = $request->getBody();
        
        // Consumir el servicio de cambio de estado del servidor de datos
        $respA = $this->ejecutarCURL(self::ENDPOINT . $uri, 'POST', $body, $token);
        
        return $response->withStatus($respA['status']);
    }

    public function casosPorCliente(Request $request, Response $response, $args) {
        $token = $this->extraerToken($request);
        $uri = '/cliente/' . $args['idCliente'];
        
        // Agregar parámetros de consulta si existen (para filtrado)
        $queryParams = $request->getQueryParams();
        if (!empty($queryParams)) {
            $uri .= '?' . http_build_query($queryParams);
        }
        
        // Consumir el servicio de casos por cliente del servidor de datos
        $respA = $this->ejecutarCURL(self::ENDPOINT . $uri, 'GET', null, $token);
        
        $response->getBody()->write($respA['resp']);
        
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($respA['status']);
    }

    public function casosPorTecnico(Request $request, Response $response, $args) {
        $token = $this->extraerToken($request);
        $uri = '/tecnico/' . $args['idTecnico'];
        
        // Agregar parámetros de consulta si existen (para filtrado)
        $queryParams = $request->getQueryParams();
        if (!empty($queryParams)) {
            $uri .= '?' . http_build_query($queryParams);
        }
        
        // Consumir el servicio de casos por técnico del servidor de datos
        $respA = $this->ejecutarCURL(self::ENDPOINT . $uri, 'GET', null, $token);
        
        $response->getBody()->write($respA['resp']);
        
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($respA['status']);
    }

    public function historial(Request $request, Response $response, $args) {
        $token = $this->extraerToken($request);
        $uri = '/historial/' . $args['codigo'];
        
        // Consumir el servicio de historial del servidor de datos
        $respA = $this->ejecutarCURL(self::ENDPOINT . $uri, 'GET', null, $token);
        
        $response->getBody()->write($respA['resp']);
        
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($respA['status']);
    }

    public function buscar(Request $request, Response $response, $args) {
        $token = $this->extraerToken($request);
        $uri = '/' . $args['codigo'];
        
        // Consumir el servicio de búsqueda del servidor de datos
        $respA = $this->ejecutarCURL(self::ENDPOINT . $uri, 'GET', null, $token);
        
        $response->getBody()->write($respA['resp']);
        
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($respA['status']);
    }

    public function update(Request $request, Response $response, $args) {
        $token = $this->extraerToken($request);
        $uri = '/' . $args['codigo'];
        $body = $request->getBody();
        
        // Consumir el servicio de actualización del servidor de datos
        $respA = $this->ejecutarCURL(self::ENDPOINT . $uri, 'PUT', $body, $token);
        
        return $response->withStatus($respA['status']);
    }


    public function delete(Request $request, Response $response, $args) {
        $token = $this->extraerToken($request);
        $uri = '/' . $args['codigo'];
        
        // Consumir el servicio de eliminación del servidor de datos
        $respA = $this->ejecutarCURL(self::ENDPOINT . $uri, 'DELETE', null, $token);
        
        return $response->withStatus($respA['status']);
    }

    public function read(Request $request, Response $response, $args) {
        $token = $this->extraerToken($request);
        $uri = isset($args['codigo']) ? '/' . $args['codigo'] : '';
        
        // Consumir el servicio de lectura del servidor de datos
        $respA = $this->ejecutarCURL(self::ENDPOINT . $uri, 'GET', null, $token);
        
        $response->getBody()->write($respA['resp']);
        
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($respA['status']);
    }
}
