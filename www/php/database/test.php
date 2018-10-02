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
        self::test_functions($this->connection->test());
    }


    function test_functions($result){
        var_dump($result);
    }
}

new test();
