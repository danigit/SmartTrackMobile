<?php
/**
 * Created by IntelliJ IDEA.
 * User: surpa
 * Date: 03/10/18
 * Time: 1.05
 */

require_once 'connection.php';

class test{
    private $connection;

    function __construct(){
        $this->connection = new connection(true);
        self::test_functions($this->connection->get_environment_kits(1));
    }


    function test_functions($result){
        if( $result instanceof database_errors)
            var_dump($result->get_error_name());
        else {
            var_dump($result);
        }
    }
}

new test();
