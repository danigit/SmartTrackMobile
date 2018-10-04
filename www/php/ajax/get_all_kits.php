<?php
/**
 * Created by IntelliJ IDEA.
 * User: surpa
 * Date: 27/09/18
 * Time: 18.29
 */

require_once 'client_server_interaction.php';
require_once 'helper.php';

/**
 * Classe che recupera tutti i kit
 */
class get_all_kits extends client_server_interaction{
    private $result;

    protected function elaborate_input(){}

    protected function get_db_informations(){

        $connection = $this->get_connection();
        $this->result = $connection->get_all_kits();

        if(is_error($this->result))
            $this->json_error("Errore nel recupero dei kit");
    }

    protected function get_returned_data(){
        return array($this->result);
    }
}

$get_all_kits = new get_all_kits();
$get_all_kits->execute();