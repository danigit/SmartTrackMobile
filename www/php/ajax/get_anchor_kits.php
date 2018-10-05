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
class get_anchor_kits extends client_server_interaction{
    private $anchor, $result;

    protected function elaborate_input(){
        $this->anchor = $this->validate_string('anchor');

        if(!$this->anchor)
            $this->json_error('Nessuna ancora ricevuta');
    }

    protected function get_db_informations(){

        $connection = $this->get_connection();
        $this->result = $connection->get_anchor_kits($this->anchor);

        if(is_error($this->result))
            $this->json_error("Errore nel recupero dei kit");
    }

    protected function get_returned_data(){
        return array($this->result);
    }
}

$get_anchor_kits = new get_anchor_kits();
$get_anchor_kits->execute();