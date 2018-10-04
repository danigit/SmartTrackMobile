<?php
/**
 * Created by IntelliJ IDEA.
 * User: surpa
 * Date: 03/10/18
 * Time: 1.15
 */
function is_error($value){
    return is_a($value, "db_error");
}
