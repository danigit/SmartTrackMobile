<?php
/**
 * Created by IntelliJ IDEA.
 * User: surpa
 * Date: 26/09/18
 * Time: 22.25
 */
require_once 'helper.php';
require_once 'client_server_interaction.php';

/**
 * Classe che si occupa della creazione dei kit
 */
class create_kit extends client_server_interaction {

    private $count, $description, $data, $time, $result;

    protected function elaborate_input(){
        $this->count = $this->validate_string('count');

        if($this->count === false)
            $this->json_error('Numero oggetti non ricevuto');

        $this->time = $this->validate_string('time');

        if ($this->time === false)
            $this->json_error('Nessun tempo ricevuto');

        $this->description = $this->validate_string('description');

        if ($this->description === false)
            $this->json_error('Inserire una descrizione');

        for($i = 0; $i < $this->count; $i++){
            $this->data[] = $this->validate_string($i);
        }
    }

    protected function get_db_informations(){
        $connection = $this->get_connection();
        $this->result = $connection->create_kit($this->description, $this->data, $this->time);
        if(is_error($this->result))
            $this->json_error("Errore nel creare il kit");
    }

    protected function get_returned_data(){
        return array($this->result);
    }
}

$create_kit = new create_kit();
$create_kit->execute();