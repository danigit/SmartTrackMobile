<?php
/**
 * Created by IntelliJ IDEA.
 * User: surpa
 * Date: 03/10/18
 * Time: 1.16
 */

/**
 * Classe che gestisce gli errori generati dalla classe connection in fase di interrogazione del database
 */
class database_errors{

    public static $ERROR_ON_TESTING    = 0;
    public static $ERROR_ON_SETTING_UTF    = 1;
    public static $ERROR_ON_GETTING_KIT    = 2;
    public static $ERROR_ON_EXECUTE    = 3;
    public static $ERROR_ON_UNIQUE_COLUMN    = 4;

    private $error;

    public function __construct($error){
        $this->error = $error;
    }

    public function get_error(){
        return $this->error;
    }

    public function get_error_name(){
        switch ($this->error){
            case 0: return 'ERROR_ON_TESTING';
            case 1: return 'ERROR_ON_SETTING_UTF';
            case 2: return 'ERROR_ON_GETTING_KIT';
            case 3: return 'ERROR_ON_EXECUTE';
            case 4: return 'ERROR_ON_UNIQUE_COLUMN';
            default : return null;
        }
    }
}