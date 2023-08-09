(function(PV) {
    //console.log("El elemento ha sido cargado en el panel de elementos");
    function symbolVis() {}
    PV.deriveVisualizationFromBase(symbolVis);

    symbolVis.prototype.init = function(scope, elemm, $http) {
        //console.log("Función de inicialización");
        // Definimos la función que se llama al actualizar los datos
        this.onDataUpdate = dataUpdate;
        // Actualización de datos
        function dataUpdate(data) {
            if (data) {
                if (data.Path) {
                    scope.Path = data.Path; // Obteniendo la ruta completa del elemento enlazado
                    $http.get('/piwebapi' + '/attributes?path=' + scope.Path.slice(3)).then(function(response) { // Obtener el WebID según la ruta
                        //console.log(response.data.WebId); // Depuración
                        scope.webId = response.data.WebId; // Ahora, en scope tendremos el WebID del origen de datos
                    });
                }
            }
            //console.log(scope); // Depuración
        }
        // Función llamada al hacer clic en el botón
        scope.sendValue = function() {
            var data = JSON.stringify({
                Timestamp: '*',
                Value: scope.runtimeData.input
            });
            //console.log(data) // Depuración
            $http.post('/piwebapi' + '/streams/' + scope.webId + '/value', data); // Solicitud para escribir en WebAPI
        }
    };

    var definition = {
        typeName: 'data-entry',
        inject: ['$http'],
        datasourceBehavior: PV.Extensibility.Enums.DatasourceBehaviors.Single,
        visObjectType: symbolVis,
        getDefaultConfig: function() {
            return {
                DataShape: 'Value',
                Height: 150,
                Width: 350,
                BackgroundColor: 'rgb(255,0,0)',
                TextColor: 'rgb(0,255,0)',
                ShowLabel: true,
                ShowTime: false
            };
        }
    };

    PV.symbolCatalog.register(definition);
})(window.PIVisualization);