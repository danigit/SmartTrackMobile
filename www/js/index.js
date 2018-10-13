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
// import * as cordova from "../../plugins/cordova-plugin-file/www/fileSystemPaths";

let isIncomplete = false;

let app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {

        // storage.writeConfiguration('configuration.json', {environment: 1});
        storage.readConfiguration('configuration.json');

        //chiamo la funzione ripetitivamento dopo ogni secondo

    },

    initSync: function (environment) {
        let json = $.parseJSON(environment);
        let envId = json.environment;


        setInterval(function (){
            //chiamo la funzione ripetitivamento dopo ogni secondo
            kits.getEnvironmentKits(envId)
        }, 1000);

        if($('#alert').length){
            $('#close-alert').on('click', function () {
                $('#alert').css('display', 'none')
            })
        }
    }
};

let storage = {
    /**
     * Funzione che crea un file nel file system del dispositivo
     * @param fileToCreate - nome del file
     * @param fileContent - il contenuto del file
     */
    writeConfiguration: function(fileToCreate, fileContent){
        let fileName = fileToCreate;
        let data = fileContent;

        window.resolveLocalFileSystemURL( cordova.file.externalRootDirectory, function( directoryEntry ) {
            directoryEntry.getFile(fileName, { create: true }, function( fileEntry ) {
                fileEntry.createWriter( function( fileWriter ) {
                    fileWriter.onwriteend = function( result ) {
                        //TODO mostrare che il contenuto sul file e' stato scritto
                    };

                    fileWriter.onerror = function( error ) {
                        alert("ERROR: Impossibile salvare file, errore: " + error)
                    };

                    fileWriter.write( data );
                }, function (error) {
                    alert("ERROR: Impossibile salvare file, codice errore: " + error.code);
                });
            }, function (error) {
                alert("ERROR: Impossibile salvare file, codice errore: " + error.code);
            });
        }, function (error) {
            alert("ERROR: Impossibile salvare file, codice errore: " + error.code);
        });
    },

    /**
     * Funzione che legge un file dal file system del dispositivo
     * @param fileToRead - nome del file da leggere
     */
    readConfiguration: function(fileToRead){
        let fileName = fileToRead;

        window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function (directoryEntry) {
            directoryEntry.getFile(fileName, null, function (fileEntry) {

                fileEntry.file(function (file) {
                    let reader = new FileReader();

                    reader.onloadend = function (event) {
                        env = event.target.result;
                        app.initSync(env);
                    };

                    reader.readAsText(file);
                }, function (error) {
                    alert("ERROR: Impossibile leggere file, codice errore: " + error.code);
                });
            }, function (error) {
                alert("ERROR: Impossibile leggere file, codice errore: " + error.code);
            })
        }, function (error) {
            alert("ERROR: Impossibile leggere file, codice errore: " + error.code);
        });
    },
};


let kits = {

    /**
     * Funzione che recupera tutti i kit nell'ambiente tassato come parametro
     */
    getEnvironmentKits: function (env) {
        $.ajax({
            type: 'POST',
            data: {environment: env},
            url: 'http://danielfotografo.altervista.org/smartTrack/php/ajax/get_environment_kits.php'
        }).done(function (data) {
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


$(document).ready( function () {
    app.initialize();
});