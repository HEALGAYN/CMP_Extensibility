(function(PV) {
    "use strict";

    function symbolVis() {}
    PV.deriveVisualizationFromBase(symbolVis);

    const definition = {
        typeName: 'Tabla',
        displayName: 'Tabla Con Límites',
        visObjectType: symbolVis,
        inject: ['$http'],
        datasourceBehavior: PV.Extensibility.Enums.DatasourceBehaviors.Multiple,
        iconUrl: 'scripts/app/editor/symbols/ext/Icons/cmp_tabla.png',
        templateUrl: 'scripts/app/editor/symbols/ext/sym-Tabla-template.html',
        configOptions: function() {
            return [{
                title: 'Format Custom Table',
                mode: 'formatCustomTable'
            }];
        },

        getDefaultConfig: function() {
            return {

                DataShape: 'TimeSeries',
                Height: 300,
                Width: 550,
                Intervals: 100000,
                Columns: [],
                TimeFormat: 'TIME',
                // TimeFormat: 'DATE_AND_TIME',
                Mode: 'COMPRESSED',
                Interval: 1,
                FontSize: 12,
                decimalPlaces: 2,
                TextAlign: 'center',
                Theme: '',
                MaximumLimit: 'brown',
                MaximumTextColor: 'white',
                HiHiLimit: 'red',
                HiHiTextColor: 'white',
                HiLimit: 'green',
                HiTextColor: 'white',
                LoLimit: 'orange',
                LoTextColor: 'white',
                LoLoLimit: 'yellow',
                LoLoTextColor: 'black',
                TimeColumnTitle: 'TimeStamp',
                ShowColumnTime: true,
                FormatType: null
            }
        }
    }

    function convertStringTimeToMomentDate(string) {
        return window.Libraries.moment(string);
    }

    symbolVis.prototype.init = function(scope, elem, $http) {

        const defaultColumn = [{
            title: scope.config.TimeColumnTitle,
            field: "time",
            resizable: true,
            headerSort: false,
            minWidth: 130,
            maxWidth: 220,
            visible: scope.config.ShowColumnTime
        }];



        class TableData {
            constructor() {
                this.fields = {};
            }

            addField(field, data) {
                if (!this.fields[field]) {
                    this.fields[field] = data; // Si el field no existe, se crea con los datos proporcionados
                } else {
                    // Si el field ya existe, se combinan los datos existentes con los nuevos datos
                    this.fields[field] = {...this.fields[field], ...data };
                }

            }

            updateFieldTitle(field, newTitle) {
                this.fields[field].title = newTitle;
            }

            removeField(path) {
                const field = getFieldName(path);
                this.fields = window.Libraries.lodash.omit(this.fields, field);
                const fieldKeys = Object.keys(this.fields);
                fieldKeys.forEach(key => {
                    const item = this.fields[key];
                    // Va a contener el path siempre y cuando sea un limite del elemento eliminado
                    // Ejem: [PATH...]|Hi
                    if (item.path.includes(path)) {
                        this.fields = window.Libraries.lodash.omit(this.fields, key);
                    }
                });
            }

            setValues(field, values) {
                this.fields[field]['values'] = values;
            }

            setUnits(field, units) {
                this.fields[field]['units'] = units;
            }


        }

        var tableData = new TableData();
        //console.log("DAaaaata tabla ", tableData);

        const tabulatorEl = elem.find('.customization.tabulator')[0];
        const tabulatorConfig = {
            height: "100%",
            width: "100%",
            layout: "fitDataFill",
            data: [],
            fitColumns: true,
            columns: defaultColumn,
            invalidOptionWarnings: false,
            tooltips: function(cell) {
                const column = cell.getColumn();
                const columnDefinition = column.getDefinition();
                const elementMaximum = cell.getElement();
                const elementHiHi = cell.getElement();
                const elementHi = cell.getElement();
                const elementLo = cell.getElement();
                const elementLoLo = cell.getElement();
                const value = +cell.getValue();
                if (window.Libraries.lodash.isNumber(value) && columnDefinition.hasLimits) {

                    if (!!columnDefinition['loloLimit'] && value <= columnDefinition['loloLimit']) {
                        outOfLimitLoLo(elementLoLo);
                        return; // Salir tempranamente
                    } else if (!!columnDefinition['loLimit'] && value <= columnDefinition['loLimit']) {
                        outOfLimitLo(elementLo);
                        return; // Salir tempranamente
                    } else if (!!columnDefinition['hiLimit'] && value <= columnDefinition['hiLimit']) {
                        outOfLimitHi(elementHi);
                        return; // Salir tempranamente
                    } else if (!!columnDefinition['hihiLimit'] && value <= columnDefinition['hihiLimit']) {
                        outOfLimitHiHi(elementHiHi);
                        return; // Salir tempranamente
                    }
                    if (!!columnDefinition['maximumLimit'] && value <= columnDefinition['maximumLimit']) {
                        outOfLimitMaximum(elementMaximum);
                        return; // Salir tempranamente
                    }
                }

                return false;
            }
        }

        function outOfLimitMaximum(elementMaximum) {
            elementMaximum.style.backgroundColor = scope.config.MaximumLimit;
            elementMaximum.style.color = scope.config.MaximumTextColor;
        }

        function outOfLimitHiHi(elementHiHi) {
            elementHiHi.style.backgroundColor = scope.config.HiHiLimit;
            elementHiHi.style.color = scope.config.HiHiTextColor;
        }

        function outOfLimitHi(elementHi) {
            elementHi.style.backgroundColor = scope.config.HiLimit;
            elementHi.style.color = scope.config.HiTextColor;
        }

        function outOfLimitLo(elementLo) {
            elementLo.style.backgroundColor = scope.config.LoLimit;
            elementLo.style.color = scope.config.LoTextColor;
        }

        function outOfLimitLoLo(elementLoLo) {
            elementLoLo.style.backgroundColor = scope.config.LoLoLimit;
            elementLoLo.style.color = scope.config.LoLoTextColor;
        }

        const table = new window.Libraries.Tabulator(tabulatorEl, tabulatorConfig);

        this.onDataUpdate = onDataUpdate;
        this.onConfigChange = onConfigChange;


        scope.config.MoveItem = moveItem;
        scope.config.RemoveItem = removeItem;

        function moveItem(index, movement) {
            if (movement === 'up' || movement === 'down') {
                var replaced = index;
                if (movement === 'up') {
                    replaced = index - 1;
                } else if (movement === 'down') {
                    replaced = index + 1;
                }
                const auxItem = _.clone(scope.config.Columns[replaced]);
                scope.config.Columns[replaced] = scope.config.Columns[index];
                scope.config.Columns[index] = auxItem;
            } else {
                const column = _.clone(scope.config.Columns[index])
                scope.config.Columns.splice(index, 1);
                if (movement === 'top') {
                    scope.config.Columns.unshift(column);
                } else if (movement === 'bottom') {
                    scope.config.Columns.push(column);
                }
            }

            reloadTable();
        }
        // Edit By Henry
        function removeItem(index) {
            // debugger;
            const column = scope.config.Columns[index];
            const { field, path } = column;
            const item = tableData.fields[field];
            table.deleteColumn(field);
            tableData.removeField(path);
            scope.config.Columns = scope.config.Columns.filter(c => !c.path.includes(item.path));

            var pathInclude = '';
            for (var intData = 0; intData < scope.symbol.DataSources.length; intData++) {
                const pathParts = scope.symbol.DataSources[intData].split('|');
                var newdataSourcePath = '';
                for (var intIndex = 0; intIndex < pathParts.length; intIndex++) {
                    var bdatos = pathParts[intIndex].split('?')[0];
                    newdataSourcePath = newdataSourcePath + bdatos;
                    if ((intIndex + 1) != pathParts.length) {
                        newdataSourcePath = newdataSourcePath + '|';
                    }
                }
                if (newdataSourcePath == item.path) {
                    pathInclude = scope.symbol.DataSources[intData];
                    break;
                }
            }

            //scope.symbol.DataSources = scope.symbol.DataSources.filter(d => !d.includes(item.path));
            scope.symbol.DataSources = scope.symbol.DataSources.filter(d => !d.includes(pathInclude));

            reloadTable();
        }

        function onConfigChange(newConfig, oldConfig) {

            const differences = window.Libraries.lodash.differenceWith(newConfig.Columns, oldConfig.Columns, window.Libraries.lodash.isEqual);

            if (differences.length > 0) {
                reloadTitles(differences);
                reloadTable();
            }

            //cambiar nombre de tabla 
            const timeColumnTitleChanged = newConfig.TimeColumnTitle !== oldConfig.TimeColumnTitle;
            if (timeColumnTitleChanged) {
                defaultColumn[0].title = newConfig.TimeColumnTitle;
                reloadTable();
            }
            //ver o ocultar el titulo de la tabla 
            const showColumnTimeChanged = newConfig.ShowColumnTime !== oldConfig.ShowColumnTime;
            if (showColumnTimeChanged) {
                defaultColumn[0].visible = newConfig.ShowColumnTime;
                reloadTable();
            }





            const timeFormatWasChanged = newConfig.TimeFormat !== oldConfig.TimeFormat;
            const modeWasChanged = newConfig.Mode !== oldConfig.Mode;
            const intervalWasChanged = newConfig.Interval !== oldConfig.Interval;

            if (timeFormatWasChanged || modeWasChanged || intervalWasChanged) {
                reloadTable();
            }
            const MaximumLimitChanged = newConfig.MaximumLimit !== oldConfig.MaximumLimit;
            const MaximumTextColorChanged = newConfig.MaximumTextColor !== oldConfig.MaximumTextColor;
            const HiHiLimitChanged = newConfig.HiHiLimit !== oldConfig.HiHiLimit;
            const HiHiTextColorChanged = newConfig.HiHiTextColor !== oldConfig.HiHiTextColor;
            const HiLimitChanged = newConfig.HiLimit !== oldConfig.HiLimit;
            const HiTextColorChanged = newConfig.HiTextColor !== oldConfig.HiTextColor;
            const LoLimitChanged = newConfig.LoLimit !== oldConfig.LoLimit; // Agregado
            const LoTextColorChanged = newConfig.LoTextColor !== oldConfig.LoTextColor; // Agregado
            const LoLoLimitChanged = newConfig.LoLoLimit !== oldConfig.LoLoLimit; // Agregado
            const LoLoTextColorChanged = newConfig.LoLoTextColor !== oldConfig.LoLoTextColor; // Agregado

            if (MaximumLimitChanged || MaximumTextColorChanged || HiHiLimitChanged || HiHiTextColorChanged || HiLimitChanged || HiTextColorChanged || LoLimitChanged || LoTextColorChanged || LoLoLimitChanged || LoLoTextColorChanged) { // Modificado
                updateCellColors();
                reloadTable();
            }

            const fontSizeWasChanged = newConfig.FontSize !== oldConfig.FontSize;
            if (fontSizeWasChanged) {
                const tabulatorEl = elem.find('.customization.tabulator')[0];
                tabulatorEl.style.fontSize = newConfig.FontSize + 'px';
            }

            const textAlignWasChanged = newConfig.TextAlign !== oldConfig.TextAlign;
            if (textAlignWasChanged) {
                reloadTable();
            }

            const themeWasChanged = newConfig.Theme !== oldConfig.Theme;
            if (themeWasChanged) {
                changeTheme();
            }

            const decimalPlacesChanged = newConfig.decimalPlaces !== oldConfig.decimalPlaces;
            if (decimalPlacesChanged) {
                reloadTable();
            }
        }

        function reloadTitles(newColumns) {
            newColumns.forEach(column => {
                const { title, field } = column;
                tableData.updateFieldTitle(field, title);
            })
        }

        function onDataUpdate(newData) {
            if (!newData) {
                return;
            }
            // console.log("newData", newData);

            tabulatorEl.style.fontSize = scope.config.FontSize + 'px';


            var items = newData.Data;
            //DatosBien
            // console.log("items con data buena!!: ",items);

            items.forEach(function(item) {
                if (typeof item.Path === 'undefined') {
                    return;
                }

                const title = getTitle(item);
                const field = getFieldName(item);
                const path = item.Path;

                const isLimit = isLimitPath(path);

                if (isLimit) {
                    return;
                }
                //tableData.addField(element, attribute, { title, path, field: `${element}.${attribute}` });
                tableData.addField(field, { title, path, field });

                if (typeof item.Units !== 'undefined') {
                    tableData.setUnits(field, item.Units);
                }

                const found = scope.config.Columns.find(c => c.path === path);
                if (!found) {
                    scope.config.Columns.push({ title, path, field });
                }

            });


            const limits = items.filter(function(item) {
                return isLimitPath(item.Path);
            });


            limits.forEach(function(limit) {
                const path = limit.Path;
                const limitName = getLimitName(path);
                const fatherField = getFathersFieldName(path);
                const limitValue = getLimitValue(limit);
                if (limitValue && typeof tableData.fields[fatherField] !== 'undefined') {
                    const father = tableData.fields[fatherField];
                    tableData.fields[fatherField] = {
                        ...father,
                        hasLimits: true,
                        [limitName]: limitValue
                    };
                }
            });


            // Edit By Henry
            const fieldKeys = Object.keys(tableData.fields);
            fieldKeys.forEach(key => {
                const field = tableData.fields[key];
                const { path } = field;
                const index = scope.symbol.DataSources.findIndex(datasource => {

                    const pathParts = datasource.split('|');
                    var newdataSourcePath = '';
                    for (var intIndex = 0; intIndex < pathParts.length; intIndex++) {
                        var bdatos = pathParts[intIndex].split('?')[0];
                        newdataSourcePath = newdataSourcePath + bdatos;
                        if ((intIndex + 1) != pathParts.length) {
                            newdataSourcePath = newdataSourcePath + '|';
                        }
                    }
                    return path == newdataSourcePath;

                });
                const values = getPIVisionItemValues(items[index]);
                tableData.setValues(key, values);

            });
            reloadTable();
        }

        function getTitle(item) {
            const indexFound = scope.config.Columns.findIndex(column => column.path === item.Path);
            if (indexFound > -1) {
                return scope.config.Columns[indexFound].title;
            }
            return item.Label;
        }

        function getFieldName(item) {
            return window.btoa(item.Path);
        }

        function getPIVisionItemValues(item) {
            const values = item.Values;
            const regex = /E\+|E\-/i;

            return values.map(val => {
                if (regex.test(val.Value)) {
                    return { Value: +val.Value, ...val };
                }
                return val;
            });
        }

        function reloadTable() {
            const allColumns = getTableColumns();
            table.setColumns(allColumns);
            const [, ...dataColumns] = allColumns;
            const rows = formatRows(dataColumns);
            const sorted = sortData(rows);
            const filtered = filterByInterval(sorted);
            const formattedRows = formatTimeColumn(filtered);
            elem.find('.tabulator-col-title').css('text-align', scope.config.TextAlign);
            table.setData(formattedRows);
            changeTheme();
        }

        function getTableColumns() {
            const fields = scope.config.Columns.map(column => {
                const { field } = column;
                const fieldItem = {...tableData.fields[field] };
                const units = !!fieldItem.units ? " (" + fieldItem.units + ")" : "";
                return {
                    ...fieldItem,
                    title: fieldItem.title + units,
                    headerSort: false
                };
            });
            const columns = window.Libraries.lodash.concat(defaultColumn, fields);
            return columns.map(col => ({...col, hozAlign: scope.config.TextAlign }))
        }

        function isLimitPath(path) {
            if (typeof path === 'undefined') {
                return false;
            }
            const regex = new RegExp(/\|(Maximum|HiHi|Hi|LoLo|Lo){1}$/g);
            return regex.test(path);
        }

        function updateCellColors() {
            const elements = tabulatorEl.getElementsByClassName('tabulator-cell');

            for (const element of elements) {
                const value = +element.textContent;
                if (!isNaN(value)) {
                    if (value <= scope.config.MaximumLimit) {
                        outOfLimitMaximum(element);
                    } else if (value <= scope.config.HiHiLimit) {
                        outOfLimitHiHi(element);
                    } else if (value <= scope.config.HiLimit) {
                        outOfLimitHi(element);
                    } else if (value <= scope.config.LoLimit) { // Agregado
                        outOfLimitLo(element); // Agregado
                    } else if (value <= scope.config.LoLoLimit) { // Agregado
                        outOfLimitLoLo(element); // Agregado
                    } else {
                        resetCellColors(element); // Agregado
                    }
                }
            }
        }

        function resetCellColors(element) { // Agregado
            element.style.backgroundColor = '';
            element.style.color = '';
        }

        function isMaximumLimit(path) {
            const regex = new RegExp(/\|Maximum{1}$/g);
            return regex.test(path);
        }

        function isHighHighLimit(path) {
            const regex = new RegExp(/\|HiHi{1}$/g);
            return regex.test(path);
        }

        function isHighLimit(path) {
            const regex = new RegExp(/\|Hi{1}$/g);
            return regex.test(path);
        }

        function isLowLimit(path) {
            const regex = new RegExp(/\|Lo{1}$/g);
            return regex.test(path);
        }

        function isLowLowLimit(path) {
            const regex = new RegExp(/\|LoLo{1}$/g);
            return regex.test(path);
        }

        function getLimitName(path) {
            if (isMaximumLimit(path)) {
                return 'maximumLimit';
            } else if (isHighHighLimit(path)) {
                return 'hihiLimit';
            } else if (isHighLimit(path)) {
                return 'hiLimit';
            } else if (isLowLimit(path)) {
                return 'loLimit';
            } else if (isLowLowLimit(path)) {
                return 'loloLimit';
            }
            return 'unknown'
        }

        function getLimitValue(item) {
            const value = +item.Values[0].Value;
            return window.Libraries.lodash.isNumber(value) ? value : null;
        }

        function getFathersFieldName(limitPath) {
            let suffixLength;
            // console.log("MaximumLimit", limitPath.endsWith("Maximum"));     
            if (limitPath.endsWith("Maximum")) {
                suffixLength = 8;
            } else if (limitPath.endsWith("HiHi") || limitPath.endsWith("LoLo")) {
                suffixLength = 5;
            } else if (limitPath.endsWith("Hi") || limitPath.endsWith("Lo")) {
                suffixLength = 3;
            } else {
                return window.btoa(limitPath); // Si no hay un sufijo conocido, simplemente devuelve el path original en formato codificado.
            }

            const fatherPath = limitPath.slice(0, -suffixLength);
            // console.log("fatherPath",fatherPath);
            return window.btoa(fatherPath);
        }

        function formatRows(filteredColumns) {
            // debugger;
            const values = window.Libraries.lodash.map(filteredColumns, function(column) {
                return window.Libraries.lodash.map(column.values, function(value) {
                    return {
                        ...value,
                        field: column.field
                    };
                });
            });

            const flattened = window.Libraries.lodash.flatten(values);
            const groupped = window.Libraries.lodash.groupBy(flattened, 'Time');

            const keys = Object.keys(groupped);

            const formatted = keys.map(function(key) {
                const fields = {};
                // El parametro item es un "record" de PI System
                // Está compuesto de un "Value" y su respectivo "Time"
                groupped[key].forEach(function(item) {
                    // fields[item.field] = item.Value;

                    //console.log(item.Value > 0? parseFloat(("" + item.Value).replace(",", ".")).toFixed(scope.config.decimalPlaces) : 0);
                    // Formatear el valor con la cantidad de decimales configurada
                    const formattedValue = formatValueWithDecimals(item.Value, scope.config.decimalPlaces);
                    fields[item.field] = formattedValue;
                });
                return {
                    time: key,
                    moment: convertStringTimeToMomentDate(key),
                    ...fields
                }
            });
            return formatted;
        }

        function formatValueWithDecimals(value, decimalPlaces) {
            if (typeof value === 'number' && !isNaN(value)) {
                return value.toFixed(decimalPlaces);
            }
            return value;
        }

        function sortData(rows) {
            const compare = function(a, b) {
                return a.moment.unix() - b.moment.unix();
            }
            return rows.sort(compare);
        }

        //Probando nueva modificaciòn
        function filterByInterval(sortedRows) {
            if (scope.config.Mode === 'INTERVAL') {
                const oClockRows = filterOClockRows(sortedRows);
                const intervalFiltered = [];

                if (oClockRows.length === 0) {
                    return intervalFiltered;
                }

                const interval = scope.config.Interval;

                for (let i = 0; i < oClockRows.length; i++) {
                    const currentRow = oClockRows[i];
                    const currentMoment = currentRow.moment;

                    // Verificar si el momento actual es un múltiplo exacto del intervalo
                    if (currentMoment.hours() % interval === 0) {
                        intervalFiltered.push(currentRow);
                    }
                }

                return intervalFiltered;
            }
            return sortedRows;
        }

        function stringTimeIsOclock(stringTime) {
            const oClockRegex = new RegExp(/([0-9]?[0-9]):{1}0?0:0?0/g);
            return oClockRegex.test(stringTime);
        }

        function filterOClockRows(rows) {
            return rows.filter(function(row) {
                return stringTimeIsOclock(row.time);
            });
        }
        //Dejamos de utilizar esta funciòn por que tenemos un nuevo  filterByInterval
        // function getInitialReferenceTime(sortedRows) {
        //     if (sortedRows.length > 0) {
        //         const { time, moment: referenceTime } = sortedRows[0];
        //         const isOClock = stringTimeIsOclock(time);
        //         const referenceTimeClone = referenceTime.clone();
        //         if (!isOClock) {
        //             return referenceTimeClone.add(1, 'hours').minutes(0).seconds(0).milliseconds(0);
        //         }
        //         return referenceTimeClone;
        //     }
        //     return null;
        // }

        function formatTimeColumn(rows) {
            return rows.map(function(row) {
                let timeFormatted = '';

                if (scope.config.TimeFormat === 'DATE') {
                    timeFormatted = row.moment.format('D/M/YYYY');
                } else if (scope.config.TimeFormat === 'TIME') {
                    timeFormatted = row.moment.format('D/M/YYYY H:mm');
                } else if (scope.config.TimeFormat === 'TIME_SECONDS') {
                    timeFormatted = row.moment.format('D/M/YYYY H:mm:ss');
                }

                return {
                    ...row,
                    time: timeFormatted
                }
            });
        }

        function changeTheme() {
            const theme = scope.config.Theme;
            tabulatorEl.className = 'customization tabulator ' + theme;
        }
    }


    PV.symbolCatalog.register(definition);
})(window.PIVisualization)