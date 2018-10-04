<?php
/**
 * Created by IntelliJ IDEA.
 * User: surpa
 * Date: 02/10/18
 * Time: 23.47
 */

require_once '../database/connection.php';

/**
 * Classe che si occupa con la gestione della connessione al database e la gestione dello scambio di messaggi tra il
 * client e il server
 */
abstract class client_server_interaction{

    private $connection;

    abstract protected function elaborate_input();
    abstract protected function get_db_informations();
    abstract protected function get_returned_data();

    function __construct(){
        if (!isset($_SESSION))
            session_start();

        session_write_close();
        ob_start();
    }

    /**
     * Funzione che crea la connessione al database
     */
    protected function get_connection(){
        if(!isset($this->connection))
            $this->connection = new connection();

        return $this->connection;
    }

    /**
     * Funzione che chiama le funzioni che gestiscono lo scambio di messaggi
     */
    function execute(){
        $this->elaborate_input();
        $this->get_db_informations();
        $this->json_success();
    }

    /**
     * Funzione che rimuove i caratteri speciali html dai dati passati come parametro
     * @param $result - i dati da sanitizzare
     * @return array|string - un array oppure una stringa dalla quale sono stati rimossi i carratteri speciali html
     */
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

    /**
     * Funzione che ritorna il risultato json al client
     * @param $result - i dati da ritornare al client
     */
    function json_result($result){
        $res = ob_get_contents();
        ob_end_clean();

        $result['server_errors'] = $res;

        $result = $this->escape_array($result);

        echo json_encode($result);
        die();
    }

    /**
     * Funzione che viene chiamata se la chiamata del client ha avuto successo
     */
    function json_success(){
        $result = $this->get_returned_data();
        $result['result'] = true;
        $this->json_result($result);
    }

    /**
     * Funzione che viene chiamata se la chiamata del client ha generato un errore
     * @param $message - il messaggio di errore da ritornare
     * @param int $code - il codice dell'errore
     */
    function json_error($message, $code = 0){
        $result = array();
        $result['result'] = false;
        $result['message'] = $message;
        $result['code'] = $code;

        $this->json_result($result);
    }
}