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

    /**
     * Funzione che recupera tutti i kit
     * @return array|database_errors - l'array contenente i kit oppure un errore
     */
    function get_all_kits(){
        $query = "SELECT kit_id, description, creation_date, closing_date FROM kit";

        $result = $this->connection->query($query);

        if ($result === false )
            return new database_errors(database_errors::$ERROR_ON_GETTING_KIT);

        $result_array = array();

        while ($row = mysqli_fetch_assoc($result)) {
            $result_array[] = array('kit_id' => $row['kit_id'], "description" => $row['description'],
                "creation_date" => date('d/m/Y H:i:s', strtotime($row['creation_date'])), "closing_date" => $row['closing_date']);
        }

        $result->close();

        return $result_array;
    }

    /**
     * Funzione che recupera tutti i kit aganciati all'ancora passata come parametro
     * @param $anchor - l'ancora alla quale devono essere aganciati i kit
     * @return array|database_errors|mysqli_stmt - i kit aganciati all'ancora oppure un errore
     */
    function get_anchor_kits($anchor){
        $query = 'SELECT DISTINCT * FROM kit AS kt JOIN (SELECT kit_id FROM object JOIN tag ON object.ob_tag = tag.MAC WHERE  tag.AN_REF=?) AS k ON kt.kit_id = k.kit_id';

        $statement = $this->parse_and_execute_select($query, "s", $anchor);

        if($statement instanceof database_errors)
            return $statement;

        $result = $statement->get_result();

        $result_array = array();

        while ($row = $result->fetch_array()){
            $result_array[] = array('kit_id' => $row['kit_id'], 'description' => $row['description'], 'is_sent' => $row['is_sent'],
                'creation_date' => $row['creation_date'], 'closing_date' => $row['closing_date']);
        }

        return $result_array;
    }


    /**
     * Metodo che seleziona l'errore da ritornare in funzione dell'array passato come parametro
     * @param string $errors - array contenente gli ultimi errori generati
     * @return database_errors - l'errore associato alla coloonna che lo ha generato
     */
    function parse_error($errors){
        if ($errors['errno'] === 1062) {
//            $column = $this->parse_string($errors['error']);
//            if ($column === "'email'") {
                return new database_errors(database_errors::$ERROR_ON_UNIQUE_COLUMN);
//            }
        } //else if ($errors['errno'] === 1452)
        //return new DbError(DbError::$FOREIGN_KEY_ERROR);
        return new database_errors(database_errors::$ERROR_ON_EXECUTE);
    }

    /**
     * Metodo che prepara la query, fa il bind dei parametri e la esegue, viene chiamata principalmente per le insert
     * @param string $query - la query da eseguire
     * @param string $bind_string - la stringa con il tipo degli argomenti da passare al metodo bind
     * @param array ...$params - array con i parametri da passare al bind
     * @return bool|database_errors ERROR_ON_EXECUTE - se viene generato un errore in fase di esecuzione della query
     *                      - il risultato della execute altrimenti
     */
    function parse_and_execute_insert($query, $bind_string, ...$params){
        $statement = $this->connection->prepare($query);

        $bind_names[] = $bind_string;

        for($i = 0; $i < count($params); $i++){
            $bind_name = 'bind' . $i;
            $$bind_name = $params[$i];
            $bind_names[] = &$$bind_name;
        }

        call_user_func_array(array($statement, 'bind_param'), $bind_names);
        try{
            $result = $statement->execute();
            if($result === false)
                return $this->parse_error($statement->error_list[0]);
        }catch (Exception $e){
            return new database_errors(database_errors::$ERROR_ON_EXECUTE);
        }

        $statement->close();
        return $result;
    }

    /**
     * Metodo che prepara la query, fa il bind dei parametri e la esegue, viene chiamata principalmente per le select, update e delete
     * @param string $query - la query da eseguire
     * @param string $bind_string - la stringa con il tipo degli argomenti da passare al metodo bind
     * @param array ...$params - array con i parametri da passare al bind
     * @return database_errors|mysqli_stmt ERROR_ON_EXECUTE - se viene generato un errore in fase di esecuzione della query
     *                             - lo statement ritornato dal metodo prepare()
     */
    function parse_and_execute_select($query, $bind_string, ...$params){
        $statement = $this->connection->prepare($query);

        $bind_names[] = $bind_string;

        for ($i = 0; $i < count($params); $i++) {
            $bind_name = 'bind' . $i;
            $$bind_name = $params[$i];
            $bind_names[] = &$$bind_name;
        }

        call_user_func_array(array($statement, 'bind_param'), $bind_names);

        try {
            $statement->execute();
        } catch (Exception $e) {
            return new database_errors(database_errors::$ERROR_ON_EXECUTE);
        }

        return $statement;
    }
}