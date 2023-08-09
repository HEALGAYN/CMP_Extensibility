(function (CS) {
	'use strict';
	function symbolVis() { }
    CS.deriveVisualizationFromBase(symbolVis);
	
	const myCustomSymbolDefinition = {
		typeName: 'Table',
		displayName: 'Data Table',
		datasourceBehavior: CS.Extensibility.Enums.DatasourceBehaviors.Multiple,
		visObjectType: symbolVis,
		inject: ['timeProvider'],
		getDefaultConfig: function () {
			return {
				DataShape: 'TimeSeries',
				Height: 300,
				Width: 400,
				FormatType: null,
				Intervals: 1000,				
				rowTextColor: "black",
				hoverColor: "gray",
				evenRowColor: "darkgray",
				oddRowColor: "transparent",
				outsideBorderColor: "transparent",
				headerBackgroundColor: "black",
				headerTextColor: "white",
				decimalPlaces: 1,
			};
		},
		supportsCollections: true,
        supportsDynamicSearchCriteria: true,
		configOptions: function () {
            return [{
				title: 'Format Symbol',
                mode: 'format'
            }];
        },	
	};

	const styleRows = (cell, scope, index) => {
		const isEven = index % 2 == 0;
		cell.style.backgroundColor = isEven ? scope.config.evenRowColor : scope.config.oddRowColor;
		cell.style.color = scope.config.rowTextColor;
		cell.onmouseover = () => {cell.style.backgroundColor = scope.config.hoverColor};
		cell.onmouseout = () => {cell.style.backgroundColor = isEven ? scope.config.evenRowColor : scope.config.oddRowColor};
	}
	
	const styleHeaders = (cell, scope) => {
		cell.style.backgroundColor = scope.config.headerBackgroundColor;
		cell.style.color = scope.config.headerTextColor;
	}

	const getNumericValue = (item, decimalPlaces) => {
		return isNaN(item.Value) ? item.Value || '' : parseFloat(item.Value).toFixed(decimalPlaces);
	}

	const filterFromTime = (time, scope) => {
		const readableTime = new Date(time).toLocaleString();
		const values = [(scope.dataProvider.length+1), readableTime];
		scope.data.Data.forEach(data => {
			data.Values.filter(dataItem => {
				if(dataItem.Time === time) values.push(getNumericValue(dataItem, scope.config.decimalPlaces));
			})
		})
		return values;
	}

	const getValues = (arrayTimeStamps, scope) => {
		scope.dataProvider = [];
		arrayTimeStamps.forEach((time) => {
			const values = filterFromTime(time, scope);
			scope.dataProvider.push(values);
		})
	}

	const getTimeStamps = (scope) => {
		const arrayTimeStamps = [];
		scope.data.Data[0].Values.forEach(item => {
			arrayTimeStamps.push(item.Time);
		})
		return arrayTimeStamps;
	}

	const getDataProvider = (scope, timeProvider) => {
		const endTime = timeProvider.displayTime.end;
		if(scope.lastHour != endTime) {
			const arrayTimeStamps = getTimeStamps(scope);
			getValues(arrayTimeStamps, scope);
			scope.lastHour = endTime;
		}else {
			const time = scope.data.Data[0].Values.at(-1).Time;
			const lastValues = filterFromTime(time, scope);
			scope.dataProvider.push(lastValues);
		}
	}

	const haveChanges = (scope) => {
		const lastValue = scope.data.Data[0].Values.at(-1).Value || false;
		if (scope.lastValue != lastValue ) {
			scope.dataLength = scope.data.Data.length;
			scope.lastValue = lastValue;
			scope.haveChanges = true;
		}
		if(scope.dataLength != scope.data.Data.length){
			scope.haveChanges = true;
			scope.lastHour = false;
		}
	}

	const getData = (scope, timeProvider) => {
		haveChanges(scope);
		if(scope.haveChanges){
			getDataProvider(scope, timeProvider);
		}
	}

	const getUnits = (scope) => {
        scope.units = [];
        if (scope.data.Data && scope.data.Data.length > 0) {
            scope.data.Data.forEach(data => {
                scope.units.push(data.Units || '');
            });
        }
    }

	const getLabels = (scope) => {
		if (scope.data.Data[0].Units) {
			scope.labels = [' N° ', 'Fecha / Hora'];
			const metaData = scope.symbol.DataSources;
			getUnits(scope);
			metaData.forEach((item, index) => {
				const unit =  scope.units[index] || '';
				const label = item.split('|')[1].split('?')[0] +' '+ unit; 
				scope.labels.push( label );
			})
		} 
	}

	const buildCell = (row, item, isheader, className, scope) => {
		const cell = row.insertCell(-1);
		cell.className = className;
		if(isheader){
			cell.innerHTML = `<b> ${item} </b>`;
			styleHeaders(cell, scope);
		}else{
			cell.innerHTML = `<p> ${item} </p>`;
		}
	}

	const setRowValues = (scope, container) => {
		const className = "CellClass ValueCellClass"
		scope.dataProvider.forEach( (value, index) => {
			const newRow = container.insertRow(-1);
			newRow.className = "RowClass";
			styleRows(newRow, scope, index);
			value.forEach(item => {
				buildCell(newRow, item, false, className, scope);
			})
		})
	}

	const setHeaders = (headers,scope, container) => {
		const className = "CellClass HeaderCellClass";
		const headersRow = container.insertRow(0);
		headersRow.className = "HeaderCellClass";
		headers.forEach( header => {
			buildCell(headersRow, header, true, className, scope);
		});
	}

	const buildDataTable = (scope, timeProvider, container) => {
		getData(scope, timeProvider);
		getLabels(scope);
		if(scope.haveChanges) {
			$('#' + container.id).empty();
			setHeaders(scope.labels, scope, container);
			setRowValues(scope, container);
			scope.haveChanges = false;
		}
	}

	symbolVis.prototype.init = function(scope, elem, timeProvider) {
		this.onDataUpdate = dataUpdate;
		this.onConfigChange = configChange;
		scope.data = [];
		scope.lastHour = false;
		scope.haveChanges = false;
		scope.lastValue = false;
		scope.dataProvider = [];
		const container = elem.find('#container')[0];
		container.id = "table_Data_" + scope.symbol.Name;
        
		function dataUpdate(data) {
			scope.data = data;
			buildDataTable(scope, timeProvider, container);
		}

		function configChange() {
			document.getElementById(container.id).style.border = "3px solid " + scope.config.outsideBorderColor;
			if(scope.data.length != 0){
				scope.lastValue = false;
				scope.lastHour = false;
				buildDataTable(scope, timeProvider, container);
			}
		}	
	}
	
	CS.symbolCatalog.register(myCustomSymbolDefinition);
	
})(window.PIVisualization);