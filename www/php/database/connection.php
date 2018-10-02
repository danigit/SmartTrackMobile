<?php
/**
 * Created by IntelliJ IDEA.
 * User: surpa
 * Date: 02/10/18
 * Time: 23.57
 */

require_once 'database_errors.php';

/**
 * Classe che crea la connessione al database ed esegue le query richieste dalle chiamate ajax
 */
class connection{
    const PATH = 'localhost', USERNAME = 'root', PASSWORD = 'password', DATABASE = 'smartTrack';
    private $connection, $test = false;

    public function __construct($test = false){
        $this->connection = new mysqli(self::PATH, self::USERNAME, self::PASSWORD, self::DATABASE);

        if($this->connection->set_charset('utf4')){
            $error = new database_errors(database_errors::$ERROR_ON_SETTING_UTF);
            print_r($error->get_error_name() . ' - ' . $this->connection->error);
        }

        $this->test = $test;
    }

    function __destruct(){
        $this->connection->close();
    }

    function test(){
        $testQuery = 'SELECT * FROM object';

        $result = $this->connection->query($testQuery);

        if ($result === false)
            return new database_errors(database_errors::$ERROR_ON_TESTING);

        $result_array = array();

        while ($row = mysqli_fetch_assoc($result)){
            $result_array[] = $row['name'];
        }

        return $result_array;
    }
}