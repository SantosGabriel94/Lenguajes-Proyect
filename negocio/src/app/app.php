<?php

use Slim\Factory\AppFactory;
use Slim\Middleware\BodyParsingMiddleware;
use DI\Container;

require __DIR__ . '/../../vendor/autoload.php';

$container = new Container();
AppFactory::setContainer($container);

$app = AppFactory::create();


$app->addBodyParsingMiddleware();

require "routes.php";

$app->run();
