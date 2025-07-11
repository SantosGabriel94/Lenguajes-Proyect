<?php
   
use Slim\Factory\AppFactory;
use Slim\Middleware\BodyParsingMiddleware;
use DI\Container;

require __DIR__ . '/../../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable('/var/www/html');
$dotenv->load();

$container = new Container();
AppFactory::setContainer($container);
$app = AppFactory::create();

$app->addBodyParsingMiddleware(); // <-- ESTA ES LA CLAVE

require "config.php";

$app->add(new Tuupola\Middleware\JwtAuthentication([
    "secure" => false,
    "path" => ["/api"],
    "ignore" => ["/api/auth"],
    "secret" =>["acme"=>$container->get('key')],
    "algorithm" => ["acme"=>"HS256"]
]));

require "conexion.php";
require "routes.php";

$app->run();
