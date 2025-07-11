<?php
    namespace App\controllers;

    use Psr\Http\Message\ResponseInterface as Response;
    use Psr\Http\Message\ServerRequestInterface as Request;
    use Psr\Container\ContainerInterface;

    use PDO;

    class Tecnico extends ServicioCURL{
        protected $container;
        private const ENDPOINT= '/tecnico';

        public function __construct(ContainerInterface $c){
            $this->container = $c;
        }

        public function read(Request $request, Response $response, $args){
            $token = $this->extraerToken($request);
            $url= $this::ENDPOINT . '/read';
            if(isset($args['id'])){
                $url .= '/'.$args['id'];
            }
            //die($url);
            $respA = $this->ejecutarCURL($url, 'GET', null, $token);

            $response->getbody()->write($respA['resp']);
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus($respA['status']);
        }

        public function create(Request $request, Response $response, $args){
            $token = $this->extraerToken($request);
            $body= $request->getBody();
            
            $respA = $this->ejecutarCURL($this::ENDPOINT, 'POST', $body, $token);

            return $response ->withStatus($respA['status']);
        }

        public function update(Request $request, Response $response, $args){
            $token = $this->extraerToken($request);
            $uri= '/' . $args['id'];
            $body= $request->getBody();
            $respA = $this->ejecutarCURL($this::ENDPOINT . $uri, 'PUT', $body, $token);
            return $response ->withStatus($respA['status']);
        }

        public function delete(Request $request, Response $response, $args){
            $token = $this->extraerToken($request);
            $uri= '/' . $args['id'];
            $respA = $this->ejecutarCURL($this::ENDPOINT . $uri, 'DELETE', null, $token);
            return $response ->withStatus($respA['status']);
        }

        public function filtrar(Request $request, Response $response, $args){
            $token = $this->extraerToken($request);
            $uri= "/filtrar/{$args['pag']}/{$args['lim']}?" .
            http_build_query($request->getQueryParams());

            $respA = $this->ejecutarCURL($this::ENDPOINT . $uri, 'GET', null, $token);
            $response->getbody()->write($respA['resp']);
            return $response ->withStatus($respA['status']);
           
        }

        public function buscar(Request $request, Response $response, $args){
            $token = $this->extraerToken($request);
            $uri = '/' . $args['id'];
            $respA = $this->ejecutarCURL($this::ENDPOINT . $uri, 'GET', null, $token);

            $response->getbody()->write($respA['resp']);

            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus($respA['status']);
        }

    }
