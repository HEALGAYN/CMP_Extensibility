(function(PV) {
    "use strict";

    function symbolVis() {};
    PV.deriveVisualizationFromBase(symbolVis);

    var definition = {
        typeName: "tooltip2",
        displayname: "tooltip Editable",
        visObjectType: symbolVis,
        //inject: ['webServices', 'timeProvider'],
        datasourceBehavior: PV.Extensibility.Enums.DatasourceBehaviors.Single,
        iconUrl: '/Scripts/app/editor/symbols/ext/Icons/cmp_texto.png',
        getDefaultConfig: function() {
            return {
                Height: 60,
                Width: 120,
                name: "",
                font: "sans-serif", // Valor por defecto para la fuente
                color: "#333", // Valor por defecto para el color
                fontSize: 24, // Valor por defecto para el tamaño de la letra
                bold: true

            }
        },
        configOptions: function() {
            return [{
                title: 'Format Symbol',
                mode: 'format'
            }];
        }
    }


    symbolVis.prototype.init = function(scope, elem) {
        const symbolContainerDiv = elem.find("#container")[0];
        symbolContainerDiv.id = "Tooltip_" + scope.symbol.Name;

        // Utilizamos un ID único para el h2
        const uniqueTextId = "text_" + scope.symbol.Name;

        // Variable para almacenar el valor editado
        var editedName = scope.config.name;

        // Crear elemento h2
        const textElement = document.createElement("h2");
        textElement.id = uniqueTextId;
        textElement.innerHTML = editedName; // Mostrar el valor inicial del nombre
        symbolContainerDiv.appendChild(textElement);

        this.onDataUpdate = dataUpdate;
        this.onConfigChange = changeUpdate;

        function dataUpdate(data) {
            if (data) {
                // console.log("data: ", data);
                var name = data.Value;

                // Utilizamos el ID único para cada instancia
                document.getElementById(uniqueTextId).innerHTML = editedName || name;
            }
        }

        function changeUpdate() {
            // Accede al valor de name desde la configuración y actualiza la variable editada
            editedName = scope.config.name;
            // Actualiza el texto solo si se ha editado un valor
            if (editedName !== undefined && editedName !== null) {
                document.getElementById(uniqueTextId).innerHTML = editedName;

                // Actualiza la fuente si está definida en la configuración
                if (scope.config.font) {
                    document.getElementById(uniqueTextId).style.fontFamily = scope.config.font;
                }

                // Actualiza el color si está definido en la configuración
                if (scope.config.color) {
                    document.getElementById(uniqueTextId).style.color = scope.config.color;
                }

                // Actualiza el tamaño de la letra si está definido en la configuración
                if (scope.config.fontSize) {
                    document.getElementById(uniqueTextId).style.fontSize = scope.config.fontSize + 'px';
                }

                document.getElementById(uniqueTextId).style.fontWeight = scope.config.bold ? 'bold' : 'normal';
            }
        }
    }

    PV.symbolCatalog.register(definition);
})(window.PIVisualization);