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
 * Classe che recupera tutti i kit
 */
class get_environment_kits extends client_server_interaction{
    private $environment, $result;

    protected function elaborate_input(){
        $this->environment = $this->validate_string('environment');

        if(!$this->environment)
            $this->json_error('Nessun ambiente trovato');
    }

    protected function get_db_informations(){

        $connection = $this->get_connection();
        $this->result = $connection->get_environment_kits($this->environment);

        if(is_error($this->result))
            $this->json_error("Errore nel recupero dei kit dall'ambiente");
    }

    protected function get_returned_data(){
        return array($this->result);
    }
}

$get_anchor_kits = new get_environment_kits();
$get_anchor_kits->execute();