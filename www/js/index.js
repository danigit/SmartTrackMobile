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


let app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {

       kits.getKits();
    },
};

let storage = {
    /**
     * Funzione che crea un file nel file system del dispositivo
     * @param fileToCreate - nome del file
     * @param fileContent - il contenuto del file
     */
    writeToExternalRootDirectory: function(fileToCreate, fileContent){
        let fileName = fileToCreate;
        let data = fileContent;

        window.resolveLocalFileSystemURL( cordova.file.externalRootDirectory, function( directoryEntry ) {
            directoryEntry.getFile(fileName, { create: true }, function( fileEntry ) {
                    fileEntry.createWriter( function( fileWriter ) {
                            fileWriter.onwriteend = function( result ) {
                                //TODO mostrare che il contenuto sul file e' stato scritto
                            };
                            fileWriter.onerror = function( error ) {
                                //TODO mostrare che non e' possibile scrivere sul file
                            };

                            fileWriter.write( data );
                    }, function( error ) {
                            //TODO mostrare che c'e' stato un errore
                        }
                    );
                },
                function( error ) {
                    //TODO  mostrare che c'e' stato un errore
                }
            );},
            function( error ) {
                //TODO mostrare che c'e' stato un errore
            }
        );
    },

    /**
     * Funzione che legge un file dal file system del dispositivo
     * @param fileToRead - nome del file da leggere
     */
    readConfiguration: function(fileToRead){
        let fileName = fileToRead;

        window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function (directoryEntry) {
            directoryEntry.getFile(fileName, {create: false}, function (fileEntry) {
                fileEntry.file(function (file) {
                    let reader = new FileReader();

                    reader.onloadend = function () {
                        //TODO usare il contenuto letto dal file
                    };

                    reader.readAsText(file);
                }, app.onErrorReadFile());
            })
        });
    },

    onErrorReadFile: function(){
        //TODO mostrare messaggion di errore
    },
};

let kits = {

    /**
     * Funzione che recupera tutti i kit attivi
     */
    getKits: function () {
        $.ajax({
          type: "GET",
          url: "http://danielfotografo.altervista.org/smartTrack/php/ajax/get_all_kits.php",
        }).done(function (data) {
            //TODO inserire i kit nella tabella
        }).fail(function (a, b, c) {
            //TODO mostrare messaggio di errore
        });
    }
};


$(document).ready( function () {
    app.initialize();
});