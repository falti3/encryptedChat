<?php
use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;
use Ratchet\App;
use ChatServer\SocketHandler;
use Symfony\Component\Routing\Route;
use React\EventLoop\Factory;
use Symfony\Component\Routing\RouteCollection;
use Symfony\Component\Routing\RequestContext;

    require dirname(__DIR__) . '/vendor/autoload.php';
    $httpHost = "localhost";
    
	$app = new App($httpHost , 8080, "127.0.0.1" );
	$app->route( '/ws', new SocketHandler(), [ '*' ] );
	$app->run();

?>