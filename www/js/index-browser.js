/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

let isIncomplete = false;

let kits = {

    /**
     * Funzione che recupera tutti i kit nell'ambiente tassato come parametro
     */

    getEnvironmentKits: function (env, address, time) {
        $.ajax({
            type: 'POST',
            data: {environment: env, time: time},
            // url: ''
            url: 'http://localhost/SmartTrackMobile/www/php/ajax/get_environment_kits.php'
            // url: address
        }).done(function (data) {
            console.log(data);
            let incompleteKit = false;
            let isPresent = false;
            let envKitUl = $('.env-kit-ul');
            let jsonStatus = JSON.parse(data);

            envKitUl.empty();
            //ripristino lo stato degli kit a completti
            $.each(envKitUl.children(), function (k, v) {
                $(v).removeClass('incomplete-kit');
                $(v).addClass('complete-kit');
            });

            $.each(jsonStatus[0], function (key, value) {
                let list = $('<li id="' + value['kit_id'] + '" class="complete-kit"></li>');

                //controllo se il kit e' gia' presente nella lista
                $.each(envKitUl.children(), function (k, v) {
                    if(parseInt($(v).attr('id')) === value['kit_id'])
                        isPresent = true;
                });

                //se non e' presente lo inserisco
                if(!isPresent) {
                    let listButton = $('<a href="#kit-objects" id="' + value['kit_id'] + '">' + value['description'] + '</a>').on('tap', function () {
                        let id = $(this).attr('id');
                        let kitObjects = $('.kit-objects');
                        kitObjects.empty();

                        $.each(jsonStatus[0], function (innerKey, innerValue) {
                            if(innerValue['tag_mac'] === "" && innerValue['kit_id'] === parseInt(id)){
                                kitObjects.append('<li class="missing-object">' + innerValue['ob_name'] + '</li>');
                            }
                        });

                        kitObjects.listview();
                        kitObjects.listview('refresh');
                    });
                    list.append(listButton);
                    envKitUl.append(list);
                }

                isPresent = false;

                //se il kit e' incompletto lo marco come incompleto
                if(value['tag_mac'] === ""){
                    incompleteKit = true;
                    $('#' + value['kit_id']).removeClass('complete-kit');
                    $('#' + value['kit_id']).addClass('incomplete-kit');
                }
            });

            envKitUl.listview();
            envKitUl.listview('refresh');

            if(incompleteKit){
                if (!isIncomplete) {
                    isIncomplete = true;
                    $('#alert').css('display', 'block');
                }
            }else{
                isIncomplete = false;
                $('#alert').css('display', 'none');
            }
        }).fail(function (error) {
            alert('Impossibile recuperare i kit, codice errore: ' + error.code);
        });
    },
};

function findGetParameter(parameterName) {
    let result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
            tmp = item.split("=");
            if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}

$(document).ready( function () {
    let environment = findGetParameter('environment');
    let time = findGetParameter('time');
    let address = '';
    // let address = findGetParameter('address');

    setInterval(function (){
        //chiamo la funzione ripetitivamento dopo ogni secondo
        kits.getEnvironmentKits(environment, address, time);
    }, 1000);

    if($('#alert').length){
        $('#close-alert').on('click', function () {
            $('#alert').css('display', 'none')
        })
    }
});