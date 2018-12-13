
$(document).on('ready', function () {
    loopPage($('body').children());
});

/**
 * Funzione che itera su tutti i nodi presenti nella pagina
 * @param children - la lista dei figli del nodo di partenza
 */
function loopPage(children) {
    $.each(children, function (key, value) {
        loopPage($(value).children());

        let id = $(value).attr('id');
        if (id in language) {
            $(value).text(language[id]);
        }
    });
}