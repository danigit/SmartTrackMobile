<?php
/**
 * Created by IntelliJ IDEA.
 * User: surpa
 * Date: 05/10/18
 * Time: 15.44
 */

require_once 'client_server_interaction.php';
require_once 'helper.php';

/**
 * Classe che recupera tutti gli oggetti presenti un un certo ambiente e non assocciati a nessun kit
 */
class get_environment_objects extends client_server_interaction{
    private $environment, $result;

    protected function elaborate_input(){
        $this->environment = $this->validate_string('environment');

        if($this->environment === false)
            $this->json_error('Nessun ambiente trovato');

    }

    protected function get_db_informations(){

        $connection = $this->get_connection();
        $this->result = $connection->get_environment_objects($this->environment);

        if(is_error($this->result))
            $this->json_error("Errore nel recupero dei kit dall'ambiente");
    }

    protected function get_returned_data(){
        return array($this->result);
    }
}

$get_environment_objects = new get_environment_objects();
$get_environment_objects->execute();