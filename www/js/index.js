let isIncomplete = false;

let app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false)
    },

    /**
     * Funzione che viene chiamata per inizializzare il sistema
     */
    onDeviceReady: function() {
        //scrivo il file di configurazione
        storage.writeConfiguration('configuration.json', {environment: 1, address: "http://danielfotografo.altervista.org/smartTrack/php/ajax/get_environment_kits.php", time: 1800000000});
        //leggo il file di configurazione
        storage.readConfiguration('configuration.json');
    },

    initSync: function (environment) {
        let json = $.parseJSON(environment);
        let envId = json.environment;
        let address = json.address;
        let time = json.time;


        setInterval(function (){
            //chiamo la funzione ripetitivamento dopo ogni secondo
            kits.getEnvironmentKits(envId, address, time);
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
     * Funzione che recupera tutti i kit nell'ambiente passato come parametro
     */
    getEnvironmentKits: function (env, address, time) {
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
                                                window.location.href = 'index.html';
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
    app.initialize();
});