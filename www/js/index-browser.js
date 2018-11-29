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
        console.log(env);
        console.log(address);
        console.log(time);
        let envKitUl = $('.env-kit-ul');
        $.ajax({
            type: 'POST',
            data: {environment: env, time: time},
            // url: ''
            url: address
        }).done(function (data) {
            $.ajax({
                type: 'POST',
                data: {environment: env},
                url: 'http://danielfotografo.altervista.org/smartTrack/php/ajax/get_environment_objects.php'
            }).done(function (lost) {
                // alert(data);
                envKitUl.empty();

                let incompleteKit = false;
                let isPresent = false;
                let jsonStatus = JSON.parse(data);
                let lonelyJsonStatus = JSON.parse(lost);
                let count = 0;

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

                if(incompleteKit){
                    if (!isIncomplete) {
                        isIncomplete = true;
                        $('#alert').css('display', 'block');
                    }
                }else{
                    isIncomplete = false;
                    $('#alert').css('display', 'none');
                }

                if (lonelyJsonStatus[0].length) {
                    let lonelyList = $('<li id="lonely-objects" class="lonely-objects"></li>');

                    let lonelyListButton = $('<a href="#lonely-objects-page" id="lonely-objects-button">OGGETTI SPARSI</a>').on('tap', function () {
                        // let id = $(this).attr('id');
                        let lonelyObjects = $('.lonely-objects-list');
                        let createKit = false;
                        lonelyObjects.empty();
                        $.each(lonelyJsonStatus[0], function (innerKey, innerValue) {
                            if(innerValue['kit_create'] === 1) {
                                lonelyObjects.append('<li class="lonely-object" id="' + innerValue['cod'] + '"><div class="flot-left width-100"><span class="float-left">'
                                    + innerValue['name'] + '</span><span class="float-right margin-right-30px"><input type="checkbox" class="checkAntani"></span></div></li>');
                                //non va bene come soluzione devo spostare l'if fuori dal ciclo
                                $('#create-kit-container').empty();
                                let createKitButton = $('<a href="#" id="create-kit" class="ui-btn ui-shadow ui-corner-all create-kit-button margin-auto font-large">CREA KIT</a>').on('click', function () {
                                    let createKitForm = new FormData();
                                    if ($('#kit-name input').val() === '')
                                        showError($('#error-lonely-objects'), "Creazione kit", "Inserire un none e seleziona almeno un oggetto", "error");
                                    $.each(lonelyObjects.children(), function (key, value) {
                                        if($(value).find('input').prop('checked')){
                                            let obj = $(value).attr('id');
                                            console.log('key' + key);
                                            console.log(obj);
                                            createKitForm.append("" + count, obj);
                                            count++;
                                        }
                                        // alert($(value).find('input').prop('checked'));
                                    });

                                    if(count > 0) {
                                        console.log(createKitForm);
                                        createKitForm.append('count', "" + count);
                                        createKitForm.append('description', $('#kit-name input').val());

                                        alert('making request');
                                        $.ajax({
                                            type: 'POST',
                                            processData: false,
                                            contentType: false,
                                            data: createKitForm,
                                            url: 'http://danielfotografo.altervista.org/smartTrack/php/ajax/create_kit.php'
                                        }).done(function (data) {
                                            alert('sended');
                                            showError($('#error-lonely-objects'), "Creazione kit", "Il kit e' stato creato con successo", "success");
                                            setTimeout(function () {
                                               window.location.href = 'index.html?environment=1&time=100000000';
                                            }, 1500);
                                            alert(data);
                                        }).fail(function (error) {
                                            alert('non posso salvare kit');
                                        })
                                    }else {
                                        showError($('#error-lonely-objects'), "Creazione kit", "Inserire un none e seleziona almeno un oggetto", "error");
                                    }
                                });
                                $('#create-kit-container').append(createKitButton);
                                createKit = true;
                            }else
                                lonelyObjects.append('<li class="lonely-object">' + innerValue['name'] + '</li>');
                        });

                        if (createKit){
                            $('#kit-name').append($('<input type="text" placeholder="Inserire il nome del kit">'));
                            createKit = false;
                        }
                        lonelyObjects.listview();
                        lonelyObjects.listview('refresh');
                    });

                    lonelyList.append(lonelyListButton);
                    envKitUl.append(lonelyList);
                }

                envKitUl.listview();
                envKitUl.listview('refresh');

            }).fail(function (error) {
                alert('Impossibile recuperare oggetti vaganti');
            })
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

/**
 * Funzione che mostra un errore in modalita' popup
 * @param errorPopup
 * @param title - titolo dell'errore
 * @param content - contenuto dell'errore
 * @param type - il tipo di messaggio
 */
function showError(errorPopup, title, content, type) {
    let elem = errorPopup;
    if(type === 'success') {
        elem.removeClass('error-popup');
        elem.addClass('success-popup');
        $('.error-title').text(title);
        $('.error-content').text(content);
        elem.popup();
        elem.popup("open");

    }else if(type === 'error'){
        elem.removeClass('success-popup');
        elem.addClass('error-popup');
        $('.error-title').text(title);
        $('.error-content').text(content);
        elem.popup();
        elem.popup("open");
    }

    setTimeout(function () {
        elem.popup("close");
    }, 2000);
}

$(document).ready( function () {
    let environment = findGetParameter('environment');
    let time = findGetParameter('time');
    let address = 'http://danielfotografo.altervista.org/smartTrack/php/ajax/get_environment_kits.php';
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