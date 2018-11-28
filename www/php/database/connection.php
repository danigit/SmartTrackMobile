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
//    const PATH = 'localhost', USERNAME = 'root', PASSWORD = 'password', DATABASE = 'smartTrack';
    const PATH = 'localhost', USERNAME = 'danielfotografo', PASSWORD = 'gacdicibpi67', DATABASE = 'my_danielfotografo';

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
     * @param $env
     * @return array|database_errors|mysqli_stmt - i kit aganciati all'ancora oppure un errore
     */
    function get_environment_kits($env, $time){
        $query = 'SELECT kit.kit_id, kit.description, alob.name, alob.ob_tag, alob.MAC from (SELECT * FROM 
                  (SELECT ob.name, ob.kit_id, ob.ob_tag FROM object AS ob JOIN (SELECT DISTINCT o.kit_id FROM object AS o 
                  JOIN (SELECT t.MAC, t.TIMESTAMP FROM tag AS t JOIN (SELECT * FROM anchors WHERE anchors.environment = ?) 
                  AS a ON t.AN_REF = a.MAC_ANCHOR AND (NOW() - t.TIMESTAMP) / 60 < ?) AS ta ON o.ob_tag = ta.MAC) AS al 
                  ON ob.kit_id = al.kit_id) AS tk LEFT JOIN (SELECT t.MAC, t.TIMESTAMP FROM tag AS t JOIN (SELECT * FROM anchors 
                  WHERE anchors.environment = ?) AS a ON t.AN_REF = a.MAC_ANCHOR AND (NOW() - t.TIMESTAMP) / 60 < ?) AS ta 
                  ON tk.ob_tag = ta.MAC) AS alob JOIN kit ON kit.kit_id = alob.kit_id';

        $statement = $this->parse_and_execute_select($query, "iiii", $env, $time, $env, $time);

        if($statement instanceof database_errors)
            return $statement;

        $result = $statement->get_result();

        $result_array = array();

        while ($row = $result->fetch_array()){
            $result_array[] = array('kit_id' => $row['kit_id'], 'description' => $row['description'], 'ob_name' => $row['name'], 'ob_tag' => $row['ob_tag'],
                'tag_mac' => $row['MAC']);
        }

        return $result_array;
    }

    /**
     * Funzione che recupera tutti gli oggetti presenti nell'ambiente e non associati a nessun kit
     * @param $env - l'ambiente da controllare
     * @return array|database_errors|mysqli_stmt
     */
    function get_environment_objects($env){
        $query = 'SELECT * FROM object JOIN (SELECT MAC, AN_REF FROM tag JOIN (SELECT MAC_ANCHOR FROM anchors WHERE anchors.environment = ?) 
                  AS env ON tag.AN_REF = env.MAC_ANCHOR) AS envtag ON object.ob_tag = envtag.MAC WHERE object.kit_id IS NULL
';

        $statement = $this->parse_and_execute_select($query, "i", $env);

        if($statement instanceof database_errors)
            return $statement;

        $result = $statement->get_result();

        $result_array = array();

        while ($row = $result->fetch_array()){
            $result_array[] = array('name' => $row['name']);
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

