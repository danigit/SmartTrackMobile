<?php
/**
 * Created by IntelliJ IDEA.
 * User: surpa
 * Date: 02/10/18
 * Time: 23.47
 */

require_once '../database/Connection.php';


abstract class client_server_interaction{

    private $connection;

    abstract protected function elaborate_input();
    abstract protected function get_db_informations();
    abstract protected function get_returne_data();

    function __construct(){
        if (!isset($_SESSION))
            session_start();

        session_write_close();
        ob_start();
    }

    protected function get_connection(){
        if(!isset($this->connection))
            $this->connection = new Connection();
    }

    function execute(){
        $this->elaborate_input();
        $this->get_db_informations();
    }

    private static function escape_array($result){
        if (is_numeric($result) || is_bool($result))
            return $result;

        if (!is_array($result))
            return htmlspecialchars($result);

        if(is_array($result))
            foreach ($result as $key => $value)
                $result[$key] = client_server_interaction::escape_array($value);

        return $result;
    }

    function json_result($result){
        $buffer = ob_get_contents();
        ob_end_clean();

        $result['server_errors'] = $buffer;

        $result = self::escape_array($result);

        echo json_encode($result);
        die();
    }

    function json_success(){
        $result = $this->get_returne_data();
        $result['result'] = true;
        $this->json_result($result);
    }

    function json_error($message, $code = 0){
        $result = array();
        $result['result'] = false;
        $result['message'] = $message;
        $result['code'] = $code;

        $this->json_result($result);
    }
}