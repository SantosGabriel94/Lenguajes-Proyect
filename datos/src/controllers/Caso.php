<?php
    namespace App\controllers;

    use Psr\Http\Message\ResponseInterface as Response;
    use Psr\Http\Message\ServerRequestInterface as Request;
    use Psr\Container\ContainerInterface;

    use PDO;
    use Exception;

    class Caso {
        protected $container;
        
        public function __construct(ContainerInterface $c) {
            $this->container = $c;
        }
    
        // Método read para GET /caso y GET /caso/{id}
        public function read(Request $request, Response $response, $args) {
            try {
                $con = $this->container->get('base_datos');
                
                // Si se proporciona un ID, buscar caso específico
                if (isset($args['id'])) {
                    $sql = "CALL buscarCaso(:id)";
                    $query = $con->prepare($sql);
                    $query->bindValue(':id', $args['codigo'] ?? $args['id'], PDO::PARAM_INT);

                    $query->execute();
                    
                    $data = $query->fetchAll(PDO::FETCH_ASSOC);
                    
                    if (count($data) > 0) {
                        $response->getBody()->write(json_encode($data[0]));
                        $status = 200;
                    } else {
                        $status = 404;
                    }
                } else {
                    // Consulta general básica
                    $sql = "SELECT * FROM caso LIMIT 0,10";
                    $query = $con->prepare($sql);
                    $query->execute();
                    
                    $data = $query->fetchAll(PDO::FETCH_ASSOC);
                    $response->getBody()->write(json_encode($data));
                    $status = 200;
                }
                
            } catch (Exception $e) {
                $status = 500;
            }
            
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus($status);
        }
        
        // Método create para POST /caso
        public function create(Request $request, Response $response, $args) {
            try {
                $body = json_decode($request->getBody());
                $con = $this->container->get('base_datos');

                $sql = "SELECT nuevoCaso(:idTecnico, :idCreador, :idArtefacto, :descripcion) as resultado";
                $query = $con->prepare($sql);

                $query->bindValue(':idTecnico', $body->idTecnico, PDO::PARAM_STR);
                $query->bindValue(':idCreador', $body->idCreador, PDO::PARAM_STR);
                $query->bindValue(':idArtefacto', $body->idArtefacto, PDO::PARAM_STR); // Ahora siempre como string
                $query->bindValue(':descripcion', $body->descripcion, PDO::PARAM_STR);

                $query->execute();
                $resultado = $query->fetch(PDO::FETCH_ASSOC)['resultado'];

                $status = match($resultado) {
                    0 => 201,  // Éxito
                    1 => 409,  // Ya existe caso activo
                    2 => 422,  // Técnico no existe (Unprocessable Entity)
                    3 => 422,  // Creador no existe (Unprocessable Entity)
                    4 => 404,  // Artefacto no existe
                    default => 500 // Error inesperado
                };

            } catch (Exception $e) {
                $status = 500;
            }

            return $response->withStatus($status);
        }

        // Método update para PUT /caso/{codigo}
        public function update(Request $request, Response $response, $args) {
            try {
                $body = json_decode($request->getBody());
                $con = $this->container->get('base_datos');

                $sql = "SELECT editarCaso(:id, :idTecnico, :descripcion, :idArtefacto) as resultado";
                $query = $con->prepare($sql);

                $query->bindValue(':id', $args['codigo'], PDO::PARAM_INT);
                $query->bindValue(':idTecnico', $body->idTecnico, PDO::PARAM_STR);
                $query->bindValue(':descripcion', $body->descripcion, PDO::PARAM_STR);
                $query->bindValue(':idArtefacto', $body->idArtefacto ?? '', PDO::PARAM_STR); // Permite null o string

                $query->execute();
                $resultado = $query->fetch(PDO::FETCH_ASSOC)['resultado'];

                $status = match($resultado) {
                    0 => 404,  // Caso no existe
                    1 => 200,  // Éxito
                    -1 => 404, // Artefacto no existe
                    -2 => 409, // Ya existe caso activo para ese artefacto
                    -3 => 422, // Técnico no existe
                    default => 500 // Error inesperado
                };

            } catch (Exception $e) {
                $status = 500;
            }

            return $response->withStatus($status);
        }
        
        // Método delete para DELETE /caso/{codigo}
        public function delete(Request $request, Response $response, $args) {
            try {
                $con = $this->container->get('base_datos');
                
                $sql = "SELECT eliminarCaso(:id) as resultado";
                $query = $con->prepare($sql);
                $query->bindValue(':id', $args['codigo'], PDO::PARAM_INT);
                
                $query->execute();
                $resultado = $query->fetch(PDO::FETCH_ASSOC)['resultado'];
                
                $status = match($resultado) {
                    0 => 404, // Caso no encontrado
                    1 => 200, // Eliminado exitosamente
                    2 => 409, // No se puede eliminar (tiene historial activo)
                    default => 500
                };
                
            } catch (Exception $e) {
                $status = 500;
            }
            
            return $response->withStatus($status);
        }
        
       public function filtrar(Request $request, Response $response, $args) {
    $datos = $request->getQueryParams();
    $filtro = "%";

    foreach($datos as $key => $value){
        $filtro .= "$value%&%";
    }
    $filtro = substr($filtro, 0, -1);

    // Si viene idTecnico y no está vacío, usamos el procedimiento por técnico
    if (isset($datos['idTecnico']) && !empty($datos['idTecnico'])) {
        $sql = "CALL obtenerCasosPorTecnico('{$datos['idTecnico']}', '$filtro', {$args['pag']}, {$args['lim']});";
    } else {
        $sql = "CALL filtrarCaso('$filtro', {$args['pag']}, {$args['lim']});";
    }

    $con = $this->container->get('base_datos');
    $query = $con->prepare($sql);
    $query->execute();

    $res = $query->fetchAll();
    $status = $query->rowCount() > 0 ? 200 : 204;

    $query = null;
    $con = null;

    $response->getBody()->write(json_encode($res));

    return $response
        ->withHeader('Content-Type', 'application/json')
        ->withStatus($status);
}

        
        // Método buscar para GET /caso/{codigo}
        public function buscar(Request $request, Response $response, $args) {
            try {
                $con = $this->container->get('base_datos');
                
                $sql = "CALL buscarCaso(:id)";
                $query = $con->prepare($sql);
                $query->bindValue(':id', $args['codigo'], PDO::PARAM_INT);
                $query->execute();
                
                $data = $query->fetchAll(PDO::FETCH_ASSOC);
                
                if (count($data) > 0) {
                    $response->getBody()->write(json_encode($data[0]));
                    $status = 200;
                } else {
                    $status = 404;
                }
                
            } catch (Exception $e) {
                $status = 500;
            }
            
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus($status);
        }
        
        // Método estado para GET /caso/estado/{codigo}
        public function estado(Request $request, Response $response, $args) {
            try {
                $con = $this->container->get('base_datos');
                
                $sql = "CALL consultarEstadoCaso(:id)";
                $query = $con->prepare($sql);
                $query->bindValue(':id', $args['codigo'], PDO::PARAM_INT);
                $query->execute();
                
                $data = $query->fetchAll(PDO::FETCH_ASSOC);
                
                if (count($data) > 0) {
                    $response->getBody()->write(json_encode($data[0]));
                    $status = 200;
                } else {
                    $status = 404;
                }
                
            } catch (Exception $e) {
                $status = 500;
            }
            
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus($status);
        }
        
        // Método cambiarEstado para POST /caso/estado/{codigo}
        public function cambiarEstado(Request $request, Response $response, $args) {
            try {
                $body = json_decode($request->getBody());
                $con = $this->container->get('base_datos');
                
                $sql = "SELECT cambiarEstadoCaso(:idCaso, :nuevoEstado, :idResponsable, :descripcion) as resultado";
                $query = $con->prepare($sql);
                
                $query->bindValue(':idCaso', $args['codigo'], PDO::PARAM_INT);
                $query->bindValue(':nuevoEstado', $body->estado, PDO::PARAM_INT);
                $query->bindValue(':idResponsable', $body->idResponsable, PDO::PARAM_STR);
                $query->bindValue(':descripcion', $body->descripcion ?? '', PDO::PARAM_STR);
                
                $query->execute();
                $resultado = $query->fetch(PDO::FETCH_ASSOC)['resultado'];
                
                $status = match($resultado) {
                    0 => 200, // Éxito
                    1 => 400, // Estado inválido
                    2 => 422, // Responsable no existe
                    default => 404 // Caso no encontrado
                };
                
            } catch (Exception $e) {
                $status = 500;
            }
            
            return $response->withStatus($status);
        }
        
        // Método casosPorCliente para GET /caso/cliente/{idCliente}
        public function casosPorCliente(Request $request, Response $response, $args) {
    $datos = $request->getQueryParams();
    $filtro = "%";
    foreach($datos as $key => $value){
        $filtro .= "$value%&%";
    }
    $filtro = substr($filtro, 0, -1);

    //idCliente (texto) a id numérico
    $con = $this->container->get('base_datos');
    $sqlId = "SELECT id FROM cliente WHERE idCliente = :idCliente";
    $queryId = $con->prepare($sqlId);
    $queryId->execute(['idCliente' => $args['idCliente']]);
    $idRow = $queryId->fetch(PDO::FETCH_ASSOC);

    if ($idRow) {
        $idCliente = $idRow['id'];
        $sql = "CALL obtenerCasosPorCliente(:idCliente, :filtro, 0, 100);";
        $query = $con->prepare($sql);
        $query->bindValue(':idCliente', $idCliente, PDO::PARAM_INT);
        $query->bindValue(':filtro', $filtro, PDO::PARAM_STR);
        $query->execute();

        $res = $query->fetchAll();
        $status = $query->rowCount() > 0 ? 200 : 204;
    } else {
        $res = [];
        $status = 404;
    }

    $query = null;
    $con = null;

    $response->getBody()->write(json_encode($res));

    return $response
        ->withHeader('Content-Type', 'application/json')
        ->withStatus($status);
}


        // Método casosPorTecnico para GET /caso/tecnico/{idTecnico}
        public function casosPorTecnico(Request $request, Response $response, $args) {
            // %codigo%&%idTecnico%&%idArtefacto%&%descripcion%&
            
            $datos = $request->getQueryParams();
            $filtro = "%";
            foreach($datos as $key => $value){
                $filtro .= "$value%&%";
            }
            $filtro = substr($filtro, 0, -1);

            $sql = "CALL obtenerCasosPorTecnico('{$args['idTecnico']}', '$filtro', 0, 100);";

            $con = $this->container->get('base_datos');
            $query = $con->prepare($sql);

            $query->execute();
            
            $res = $query->fetchAll();

            $status = $query->rowCount() > 0 ? 200 : 204;

            $query = null;
            $con = null;

            $response->getBody()->write(json_encode($res));

            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus($status);
        }
        
        // Método historial para GET /caso/historial/{codigo}
        public function historial(Request $request, Response $response, $args) {
            try {
                $con = $this->container->get('base_datos');
                
                $sql = "CALL obtenerHistorialCaso(:idCaso)";
                $query = $con->prepare($sql);
                $query->bindValue(':idCaso', $args['codigo'], PDO::PARAM_INT);
                $query->execute();
                
                $data = $query->fetchAll(PDO::FETCH_ASSOC);
                
                $response->getBody()->write(json_encode($data));
                $status = 200;
                
            } catch (Exception $e) {
                $status = 500;
            }
            
            return $response
                ->withHeader('Content-Type', 'application/json')
                ->withStatus($status);
        }
        
    }
?>
