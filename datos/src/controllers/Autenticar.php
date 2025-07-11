<?php
namespace App\controllers;

use Psr\Container\ContainerInterface;
use PDO;

class Autenticar {
    protected $container;

    public function __construct(ContainerInterface $c) {
        $this->container = $c;
    }

    public function autenticar($idUsuario, $passw, $cambioPassw = false) {
        $sql = "SELECT * FROM usuario WHERE idUsuario = :idUsuario OR correo = :idUsuario;";
        $con = $this->container->get('base_datos');
        $query = $con->prepare($sql);
        $query->bindValue(':idUsuario', $idUsuario, PDO::PARAM_STR);
        $query->execute();
        $datos = $query->fetch(PDO::FETCH_ASSOC);

        if ($datos && password_verify($passw, $datos['passw'])) {
            if (!$cambioPassw) {
                $retorno = ["rol" => $datos['rol']];
                $recurso = match ($datos['rol']) {
                    1 => "admin",
                    2 => "oficinista",
                    3 => "tecnico",
                    4 => "cliente"
                };

                $sql = "SELECT nombre FROM $recurso WHERE id$recurso = :idUsuario OR correo = :idUsuario;";
                $query = $con->prepare($sql);
                $query->bindValue(':idUsuario', $datos['idUsuario'], PDO::PARAM_STR);
                $query->execute();
                $extra = $query->fetch(PDO::FETCH_ASSOC);

                $retorno['nombre'] = $extra ? $extra['nombre'] : "SinNombre";
            } else {
                $retorno = true;
            }
        }

        $query = null;
        $con = null;
        return $retorno ?? null;
    }
}
