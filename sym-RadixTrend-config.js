/// <reference path="../_references.js" />

window.PIVisualization = window.PIVisualization || {};

(function (PV) {
    'use strict';

    PV.TrendConfig = (function () {
        const defaultTraceWeight = 1.7;            // From 'trace-line' CSS class
        const defaultTrendForeground = '#ffffff';  // In various 'trend*' classes
        const defaultTrendBackground = '#303030';  // from 't-display-container' CSS class

        // From CSS classes 'palette-0' to 'palette-11'
        const defaultTracePalette = ['#3e98d3', '#e08a00', '#b26bff', '#2fbcb8', '#db4646', '#9c806e', '#3cbf3c', '#c5560d', '#2e20ee', '#a52056', '#96892d', '#6e90d3'];

        function contextMenuOptions(context, clickedElement) {
            var options = [{
                title: PV.ResourceStrings.TrendConfigFormatSymbolOption,
                mode: 'default'
            }];

            if (canRevert(context.config)) {
                options.unshift({
                    title: PV.ResourceStrings.TrendRevertTimeRange,
                    action: function (context) { revertZoom(context.symbol.Configuration); }
                },
                'separator');
            }

            // add hide/show option
            if (clickedElement && context.symbol.DataSources.length > 1) {
                var legendItem = $(clickedElement).closest('.trend-legend-item[data-index]');
                if (legendItem.length > 0) {
                    var index = +legendItem.attr('data-index');
                    if (canHideTrace(context.symbol, index)) {
                        var showHide = currentTraceSetting(context.symbol.Configuration, index, 'Hidden', false) ? PV.ResourceStrings.TrendTraceShow : PV.ResourceStrings.TrendTraceHide;
                        context.runtimeData.contextMenuIndex = index;   // Bound in template to highlight the legend item
                        options.unshift({
                            title: showHide,
                            action: function (context) { hideShowTrace(context.symbol, index); }
                        }, {
                            title: PV.ResourceStrings.AdHocTrendAddTrace,
                            action: function (context, element, adHocService) { adHocService.addDatasourceToAdHoc([], [context.symbol.DataSources[index]]); }
                        },
                        'separator');
                    }
                }
            }
            return options;
        }

        // Callback executed when context menu closes
        function contextMenuClose(context) {
            delete context.runtimeData.contextMenuIndex;
        }

        function hideShowTrace(symbol, traceIndex) {
            var hidden = currentTraceSetting(symbol.Configuration, traceIndex, 'Hidden', false);
            currentTraceSetting(symbol.Configuration, traceIndex, 'Hidden', false, !hidden);
            if (hidden) {
                revertZoom(symbol.Configuration);
            } else {
                currentTraceSetting(symbol.Configuration, traceIndex, 'Columns', false, false);
            }
        }

        function showAllTraces(config) {
            if (config.TraceSettings) {
                var length = config.TraceSettings.length;
                for (var i = 0; i < length; i++) {
                    currentTraceSetting(config, i, 'Hidden', false, false);
                }
            }

            revertZoom(config);
        }

        // Called from symbol config host when config pane opens for a particular symbol
        function init(scope) {
            var runtimeData = scope.runtimeData,
                labelsettings;

            if (runtimeData.metaData) {
                // Set path binding list with actual names
                runtimeData.traceList = PV.Utils.configPaneDataList(runtimeData.metaData.map(function (item) { return item.Path; }));
            } else {
                // Error getting metadata, fall back to configured datasources
                runtimeData.metaData = [];
                runtimeData.traceList = PV.Utils.configPaneDataList(scope.symbol.DataSources);
            }

            var rangeTypes = [];
            rangeTypes[PV.TrendEnums.ValueScaleType.Autorange] = 'autorange';
            rangeTypes[PV.TrendEnums.ValueScaleType.Database] = 'database';
            rangeTypes[PV.TrendEnums.ValueScaleType.Absolute] = 'custom';

            // Initialize time range settings
            if (!!scope.config.StartTime || !!scope.config.EndTime) {
                runtimeData.customTimeRange = 'Custom';
            } else if (!!scope.config.StartOffset || !!scope.config.EndOffset) {
                runtimeData.customTimeRange = 'Duration';
                setOffsetAndDuration(scope.config, runtimeData);
            } else {
                delete runtimeData.customTimeRange;
            }

            //
            //  ng-model bindings
            //
            runtimeData.trendForegroundColor = function (value) {
                if (arguments.length === 0) {
                    return scope.config.TextColor || defaultTrendForeground;
                }

                if (value === defaultTrendForeground) {
                    delete scope.config.TextColor;
                } else {
                    scope.config.TextColor = value;
                }
            };

            runtimeData.trendBackgroundColor = function (value) {
                if (arguments.length === 0) {
                    return scope.config.BackgroundColor || defaultTrendBackground;
                }

                if (value === defaultTrendBackground) {
                    delete scope.config.BackgroundColor;
                } else {
                    scope.config.BackgroundColor = value;
                }
            };

            runtimeData.title = runtimeData.title || scope.config.Title;
            runtimeData.showTitleInput = !!scope.config.Title;

            runtimeData.showTitle = function (value) {
                if (arguments.length === 0) {
                    return runtimeData.showTitleInput;
                }

                runtimeData.showTitleInput = value;
                setTrendTitle(scope.config, runtimeData, value);
            };

            runtimeData.trendTitle = function (value) {
                if (arguments.length === 0) {
                    return runtimeData.title;
                }

                runtimeData.title = value;
                setTrendTitle(scope.config, runtimeData, !!value);
            };

            delete runtimeData.showMarkerPopup;
            runtimeData.dataMarkers = PV.Markers.dataMarkers;

            runtimeData.trendMarkerStyle = function (value) {
                if (arguments.length === 0) {
                    return scope.config.MarkerStyle || 'default';
                }

                markerStyles(scope.config, scope.symbol.DataSources.length, value);
            };

            runtimeData.gridStyle = function (value) {
                var config = scope.config.TrendConfig;
                if (arguments.length === 0) {
                    if (config.gridlines) {
                        return 'lines';
                    }
                    return config.valueScale.bands ? 'bands' : 'plain';
                }

                if (value === 'bands') {
                    config.gridlines = false;
                    config.valueScale.bands = true;
                } else if (value === 'lines') {
                    config.gridlines = true;
                    config.valueScale.bands = false;
                } else {
                    config.gridlines = false;
                    config.valueScale.bands = false;
                }
            };

            labelsettings = {
                get nameType() { return currentTraceSetting(scope.config, runtimeData.currentTrace, 'NameType'); },
                get customName() { return currentTraceSetting(scope.config, runtimeData.currentTrace, 'CustomName'); }
            };
            runtimeData.labelSettings = function (settings) {
                if (settings) {
                    currentTraceSetting(scope.config, runtimeData.currentTrace, 'NameType', '', settings.nameType || '');
                    currentTraceSetting(scope.config, runtimeData.currentTrace, 'CustomName', '', settings.customName || '');
                    setDescriptionFlag(scope.config);
                }
                return labelsettings;
            };

            runtimeData.traceColor = function (value) {
                return traceColor(scope.config, runtimeData.currentTrace, value);
            };

            runtimeData.traceStrokeWidth = function (value) {
                return traceStrokeWidth(scope.config, runtimeData.currentTrace, value);
            };

            runtimeData.traceStrokeStyle = function (value) {
                return traceStrokeStyle(scope.config, runtimeData.currentTrace, value);
            };

            runtimeData.traceMarkerIndex = function (value) {
                return traceMarkerIndex(scope.config, runtimeData.currentTrace, value);
            };

            runtimeData.traceFormatType = function (value) {
                return currentTraceSetting(scope.config, runtimeData.currentTrace, 'FormatType', '', value);
            };

            runtimeData.traceValueScaleInverted = function (value) {
                return currentTraceValueScaleInverted(scope.config, runtimeData.currentTrace, value);
            };

            runtimeData.trendValueScaleRange = function (value) {
                if (arguments.length === 0) {
                    return rangeTypes[scope.config.ValueScaleSetting.MinType];
                }
                setValueScaleRangeType(scope.config, (runtimeData.data || {}), rangeTypes, value);
                revertZoom(scope.config);
            };

            runtimeData.trendValueScaleInverted = function (value) {
                if (arguments.length === 0) {
                    return scope.config.ValueScaleSetting.Inverted;
                }
                if (value) {
                    scope.config.ValueScaleSetting.Inverted = true;
                } else {
                    delete scope.config.ValueScaleSetting.Inverted;
                }
                revertZoom(scope.config);
            };

            runtimeData.numberOfScales = function (value) {
                if (arguments.length === 0) {
                    return scope.config.MultipleScales ? 'multiple' : 'single';
                }
                setNumberOfScales(scope.config, runtimeData, value);
            };

            runtimeData.trendOutsideScales = function (value) {
                if (arguments.length === 0) {
                    return !!scope.config.OutsideScales;
                }
                if (value) {
                    scope.config.OutsideScales = true;
                } else {
                    delete scope.config.OutsideScales;
                }
            };

            runtimeData.traceScaleRangeOverrides = (scope.config.TraceSettings || []).map(function (setting) {
                return setting && setting.ValueScaleSetting;
            });
            runtimeData.traceScaleRangeOverride = function (value) {
                if (arguments.length === 0) {
                    return !!runtimeData.traceScaleRangeOverrides[runtimeData.currentTrace];
                }

                runtimeData.traceScaleRangeOverrides[runtimeData.currentTrace] = value;
                if (!value) {
                    runtimeData.traceValueScaleRange('default');
                }
            };

            runtimeData.traceValueScaleRange = function (value) {
                return traceValueScaleRange(scope.config, runtimeData, rangeTypes, value);
            };

            runtimeData.traceDisplayUOM = value => currentTraceSetting(scope.config, runtimeData.currentTrace, 'DisplayUOM', null, value);
        }

        function setDescriptionFlag(config) {
            if (config.TraceSettings && config.TraceSettings.some(function (ts) { return ts && ts.NameType === 'D'; })) {
                config.Description = true;
            } else {
                delete config.Description;
            }
        }

        function setTrendTitle(config, runtimeData, hasTitle) {
            if (hasTitle) {
                config.Title = runtimeData.title;
            } else {
                delete config.Title;
            }
        }

        function setOffsetAndDuration(config, runtimeData) {
            delete runtimeData.relativeOffsetUnits;
            delete runtimeData.relativeDurationUnits;

            function setDurationValues(configProp, property) {
                if (!config[configProp]) {
                    return;
                }

                var components = config[configProp].split('-');
                var configValue = components[components.length - 1];
                var value = parseFloat(configValue);
                var field = Math.abs(value);
                var units = configValue.substr(field.toString().length);
                runtimeData[property] = field;
                runtimeData[property + 'Units'] = units;
            }

            setDurationValues('EndOffset', 'relativeOffset');
            setDurationValues('StartOffset', 'relativeDuration');
        }

        function onChangeTimeRange(config, runtimeData) {
            ['StartTime', 'StartOffset', 'EndTime', 'EndOffset', 'Zoom'].forEach(function (prop) {
                delete config[prop];
            });

            ['relativeDuration', 'relativeDurationUnits', 'relativeOffset', 'relativeOffsetUnits'].forEach(function (prop) {
                delete runtimeData[prop];
            });
        };

        function onChangeDuration(config, runtimeData, element) {
            if (element) {
                element.blur();
            }

            delete config.Zoom;
            if (!runtimeData.relativeDuration || !runtimeData.relativeDurationUnits) {
                delete config.StartOffset;
                return;
            }

            config.StartOffset = (config.EndOffset || '') + '-' + runtimeData.relativeDuration + runtimeData.relativeDurationUnits;
        }

        function onChangeOffset(config, runtimeData, element) {
            if (element) {
                element.blur();
            }

            if (!runtimeData.relativeOffset || !runtimeData.relativeOffsetUnits) {
                delete config.EndOffset;
                onChangeDuration(config, runtimeData);
                return;
            }

            config.EndOffset = '-' + runtimeData.relativeOffset + runtimeData.relativeOffsetUnits;
            onChangeDuration(config, runtimeData);
        }

        // Delete empty settings at the end of the TraceSettings array, remove from the config if there are no custom settings
        function deleteTraceSettingsIfEmpty(config) {
            var hasCustomSettings = false;
            if (config.TraceSettings) {
                config.TraceSettings.forEach(function (setting, index) {
                    if (setting) {
                        if (Object.getOwnPropertyNames(setting).length === 0) {
                            config.TraceSettings[index] = undefined;
                        } else {
                            hasCustomSettings = true;
                        }
                    }
                });

                if (!hasCustomSettings) {
                    delete config.TraceSettings;
                } else {
                    while (config.TraceSettings.length > 0 && !config.TraceSettings[config.TraceSettings.length - 1]) {
                        // Trim empty settings at the end
                        config.TraceSettings.length = config.TraceSettings.length - 1;
                    }
                }
            }
        }

        // Getter/setter for a named trace property
        function currentTraceSetting(config, currentTrace, property, defaultValue, value) {
            var traceSettings = config.TraceSettings;
            // Getter
            if (value === undefined) {
                if (traceSettings && traceSettings[currentTrace] && traceSettings[currentTrace].hasOwnProperty(property)) {
                    return traceSettings[currentTrace][property];
                }
                return defaultValue;
            }

            // Setter
            if (value === defaultValue) {
                // Set to default - delete the property
                if (traceSettings && traceSettings[currentTrace]) {
                    delete traceSettings[currentTrace][property];
                }
                deleteTraceSettingsIfEmpty(config);
            } else {
                // Not the default - add the property
                if (!traceSettings) {
                    traceSettings = config.TraceSettings = [];
                }
                if (!traceSettings[currentTrace]) {
                    traceSettings[currentTrace] = {};
                }
                traceSettings[currentTrace][property] = value;
            }
        }

        function currentTraceValueScaleInverted(config, currentTrace, value) {
            if (value === undefined) {
                return currentTraceSetting(config, currentTrace, 'ValueScaleSetting', {}).Inverted;
            }
            var traceSettings = config.TraceSettings;
            if (value) {
                if (!traceSettings) {
                    traceSettings = config.TraceSettings = [];
                }
                if (!traceSettings[currentTrace]) {
                    traceSettings[currentTrace] = {};
                }
                var scaleSetting = traceSettings[currentTrace].ValueScaleSetting;
                if (!scaleSetting) {
                    scaleSetting = traceSettings[currentTrace].ValueScaleSetting = {};
                }
                scaleSetting.Inverted = true;
            } else if (traceSettings[currentTrace].ValueScaleSetting) {
                delete traceSettings[currentTrace].ValueScaleSetting.Inverted;
                deleteTraceSettingsIfEmpty(config);
            }
            revertZoom(config);
        }

        function markerStyles(config, count, value) {
            if (value === 'default') {
                delete config.MarkerStyle;
                if (config.TraceSettings) {
                    config.TraceSettings.forEach(function (setting) {
                        if (setting) {
                            delete setting.MarkerIndex;
                            delete setting.StrokeStyle;
                        }
                    });
                    deleteTraceSettingsIfEmpty(config);
                }
            } else {
                config.MarkerStyle = value;
                setMarkersNoRepeats(config, count);

                if (value === 'scatter' && config.TraceSettings) {
                    config.TraceSettings.forEach(function (setting) {
                        if (setting) {
                            delete setting.StrokeStyle;
                        }
                    });
                }
            }
        }

        // Change value scale type for trend or a trace
        function setValueScaleRangeType(scaleConfig, data, rangeTypes, value) {
            var scaleSetting = scaleConfig.ValueScaleSetting;
            scaleSetting.MinType = scaleSetting.MaxType = rangeTypes.indexOf(value);
            if (value === 'custom') {
                // Initialize custom limits to current scale range
                var limits = data.ValueScaleLimits && data.ValueScaleLimits.length === 2 ? data.ValueScaleLimits : [0, 100];
                scaleSetting.MinValue = limits[0];
                scaleSetting.MaxValue = limits[1];
            } else {
                delete scaleSetting.MinValue;
                delete scaleSetting.MaxValue;
            }
        }

        function setNumberOfScales(config, runtimeData, value) {
            config.MultipleScales = (value === 'multiple');
            if (!config.MultipleScales) {
                if (config.TraceSettings) {
                    config.TraceSettings.forEach(function (setting) {
                        if (setting) {
                            delete setting.ValueScaleSetting;
                        }
                    });
                }
                deleteTraceSettingsIfEmpty(config);
            } else if (runtimeData.trendValueScaleRange() === 'custom') {
                runtimeData.trendValueScaleRange('autorange');
            }
            revertZoom(config);
        }

        // Getter/setter for trace value scale type
        function traceValueScaleRange(config, runtimeData, rangeTypes, value) {
            var traceSetting;
            var traceConfig;
            var traceData;

            if (value === undefined) {
                traceSetting = (config.TraceSettings || [])[runtimeData.currentTrace];
                if (!traceSetting || !traceSetting.ValueScaleSetting) {
                    return 'default';
                }
                return rangeTypes[traceSetting.ValueScaleSetting.MinType];
            }

            if (value !== 'default') {
                if (!config.TraceSettings) {
                    config.TraceSettings = new Array((runtimeData.data.Traces || []).length);
                }
                traceConfig = config.TraceSettings[runtimeData.currentTrace];
                if (!traceConfig) {
                    traceConfig = config.TraceSettings[runtimeData.currentTrace] = {};
                }
                if (!traceConfig.ValueScaleSetting) {
                    traceConfig.ValueScaleSetting = {};
                    if ((value === 'database' || value === 'autorange') && config.ValueScaleSetting.Inverted) {
                        traceConfig.ValueScaleSetting.Inverted = true;
                    }
                }
                traceData = ((runtimeData.data || {}).Traces || [])[runtimeData.currentTrace];
                setValueScaleRangeType(traceConfig, traceData, rangeTypes, value);

            } else if (config.TraceSettings) {
                delete config.TraceSettings[runtimeData.currentTrace].ValueScaleSetting;
                deleteTraceSettingsIfEmpty(config);
            }
            revertZoom(config);
        }

        function moveTrace(scope, currentIndex, targetIndex) {
            var datasources = scope.symbol.DataSources;

            scope.runtimeData.currentTrace = targetIndex;
            setCustomTraceSettingsFromDefaults(datasources.length, scope.config);

            var traceSettings = scope.config.TraceSettings;
            var traceData = scope.runtimeData.data.Traces;
            if (targetIndex === 0 || targetIndex === datasources.length - 1) {
                // Move to head or tail
                var arrayOperator = targetIndex === 0 ? 'unshift' : 'push';
                datasources[arrayOperator](datasources.splice(currentIndex, 1)[0]);
                traceSettings.length = datasources.length;
                traceSettings[arrayOperator](traceSettings.splice(currentIndex, 1)[0]);
                if (traceData.length === datasources.length) {
                    traceData[arrayOperator](traceData.splice(currentIndex, 1)[0]);
                }
            } else {
                // Swap with neighbor
                datasources[currentIndex] = datasources.splice(targetIndex, 1, datasources[currentIndex])[0];
                traceSettings[currentIndex] = traceSettings.splice(targetIndex, 1, traceSettings[currentIndex])[0];
                if (traceData.length === datasources.length) {
                    traceData[currentIndex] = traceData.splice(targetIndex, 1, traceData[currentIndex])[0];
                }
            }

            revertZoom(scope.symbol.Configuration);
        }

        function selectTrace(scope, index) {
            scope.runtimeData.currentTrace = index;
        }

        function deleteTrace(scope, deleteIndex, newIndex) {
            const datasources = scope.symbol.DataSources;
            const config = scope.config;
            //arreglamos
            const traceData = scope.runtimeData.data ? scope.runtimeData.data.Traces : null;

            if (datasources.length > 1) {
                setCustomTraceSettingsFromDefaults(datasources.length, config);

                if (traceData && traceData.length === datasources.length) {
                    traceData.splice(deleteIndex, 1);
                }

                datasources.splice(deleteIndex, 1);
                config.TraceSettings.splice(deleteIndex, 1);

                // unhide last trace
                if (allTracesHidden(scope.symbol)) {
                    currentTraceSetting(scope.symbol.Configuration, newIndex, 'Hidden', false, false);
                }

                scope.runtimeData.currentTrace = newIndex;
            }

            setDescriptionFlag(config);
            revertZoom(config);
        }

        // Create entries in TraceSettings for trace colors and marker styles
        // Called before a traces are rearranged or deleted to retain colors after the move
        function setCustomTraceSettingsFromDefaults(count, config) {
            if (!config.TraceSettings) {
                config.TraceSettings = [];
            }

            for (let i = 0; i < count; i++) {
                if (!config.TraceSettings[i]) {
                    config.TraceSettings[i] = {};
                }
                if (!config.TraceSettings[i].Color) {
                    config.TraceSettings[i].Color = defaultTracePalette[i % 12];
                }
                if (!config.TraceSettings[i].hasOwnProperty('MarkerIndex') && config.MarkerStyle) {
                    config.TraceSettings[i].MarkerIndex = i % 12;
                }
            }
        }

        function resetToDefaults(scope) {
            // Refresh depends on a deep watch - save original size and clear existing config object
            const config = scope.config;
            const retained = { Top: config.Top, Left: config.Left, Width: config.Width, Height: config.Height };
            for (const prop in config) {
                delete config[prop];
            }
            // Reset to defaults and restore starting size
            let newConfig = scope.def.getDefaultConfig();
            let customDefault = getTrendCustomDefaults();
            if (customDefault) {
                customDefault = scope.def.selectSymbolDefaultsFromConfig(customDefault, scope.runtimeData.data.Traces);
                newConfig = $.extend(true, newConfig, customDefault);
            }

            Object.assign(config, newConfig, retained);
        }

        // Set color of added traces, avoid adjacent traces with the same color        
        function addTraces(config, datasources, added) {
            const nextIndex = datasources.length - added;

            // Load system-wide defaults for the base trend symbol, excluding derived types
            let palette;
            let nameType;
            let traceSettings = config.TraceSettings;
            if (this.typeName === 'trend') {
                const customDefaults = getTrendCustomDefaults();
                palette = getTrendTracePalette(customDefaults);

                // Assume if NameType is present on first setting, all the rest will be the same
                if (customDefaults && customDefaults.TraceSettings && customDefaults.TraceSettings[0]) {
                    nameType = customDefaults.TraceSettings[0].NameType;
                }

                if (nameType || !angular.equals(palette, defaultTracePalette)) {
                    if (!traceSettings) {
                        traceSettings = config.TraceSettings = [];
                    }
                    for (let i = nextIndex; i < datasources.length; i++) {
                        const color = palette[i % palette.length];
                        const isCustomColor = color !== defaultTracePalette[i % 12];
                        if (nameType || isCustomColor) {
                            traceSettings[i] = traceSettings[i] || {};
                            if (nameType) {
                                traceSettings[i].NameType = nameType;
                            }
                            if (isCustomColor) {
                                traceSettings[i].Color = color;
                            }
                        }
                    }
                }
            } else {
                palette = defaultTracePalette;
            }

            if (traceSettings) {
                let usesDefaultColors;

                // Build least-recently-used list of unique colors from existing traces
                const lruPalette = palette.slice();
                for (let i = 0; i < nextIndex; i++) {
                    let colorIndex;
                    const setting = traceSettings[i];
                    if (setting && setting.Color) {
                        // Color is assigned - normalize and check if its one of the defaults
                        colorIndex = lruPalette.indexOf(kendo.parseColor(setting.Color).toCss());
                        usesDefaultColors = usesDefaultColors || (colorIndex >= 0);
                    } else {
                        // Find the default color in the lru list
                        colorIndex = lruPalette.indexOf(palette[i % palette.length]);
                    }
                    if (colorIndex >= 0) {
                        lruPalette.push(lruPalette.splice(colorIndex, 1)[0]);    // move to end
                    }
                }

                if (usesDefaultColors) {
                    // Default colors were explicitly assigned - use lru palette sequence to assign new colors
                    for (let i = nextIndex; i < datasources.length; i++) {
                        // Get first color and move it to the end
                        const color = lruPalette.shift();
                        lruPalette.push(color);

                        // Different than hard coded default?
                        if (color !== defaultTracePalette[i % 12]) {
                            traceSettings[i] = traceSettings[i] || {};
                            traceSettings[i].Color = color;
                        }
                    }
                }

                if (config.MarkerStyle === 'scatter' || config.MarkerStyle === 'markers') {
                    setMarkersNoRepeats(config, datasources.length);
                }
            }
        }

        // Add markers to traces, avoid repeats
        function setMarkersNoRepeats(config, count) {
            var i, markerIndex, lruMarkers, hasMarkers;
            var traceSettings = config.TraceSettings;

            if (traceSettings) {
                // Build least-recently-used list of marker indexes
                lruMarkers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
                for (i = 0; i < traceSettings.length; i++) {
                    // Ignore anything above default range and traces set to -1 for no marker
                    if (traceSettings[i] && traceSettings[i].hasOwnProperty('MarkerIndex')) {
                        markerIndex = lruMarkers.indexOf(traceSettings[i].MarkerIndex);
                        if (markerIndex >= 0) {
                            hasMarkers = true;
                            lruMarkers.push(lruMarkers.splice(markerIndex, 1)[0]);    // move to end
                        }
                    }
                }
            }

            if (hasMarkers) {
                for (i = 0; i < count; i++) {
                    if (!traceSettings[i]) {
                        traceSettings[i] = {};
                    }

                    if (!traceSettings[i].hasOwnProperty('MarkerIndex')) {
                        markerIndex = lruMarkers.shift();
                        // Get next marker index from front of the list and assign it if not the default
                        if (markerIndex !== i % 12) {
                            traceSettings[i].MarkerIndex = markerIndex;
                        }
                        lruMarkers.push(markerIndex);
                    }
                }

                // Remove empty settings from the end of the list
                deleteTraceSettingsIfEmpty(config);
            }
        }

        function revertZoom(config) {
            delete config.Zoom;
        }

        function traceColor(config, index, value) {
            return currentTraceSetting(config, index, 'Color', defaultTracePalette[index % 12], value);
        }

        function traceStrokeWidth(config, index, value) {
            return currentTraceSetting(config, index, 'StrokeWidth', defaultTraceWeight, value);
        }

        function traceStrokeStyle(config, index, value) {
            return currentTraceSetting(config, index, 'StrokeStyle', config.MarkerStyle === 'scatter' ? '0,10000' : '', value);
        }

        function traceMarkerIndex(config, index, value) {
            return currentTraceSetting(config, index, 'MarkerIndex', config.MarkerStyle ? index % 12 : -1, value);
        }

        function isTraceHidden(scope, index) {
            return !!(scope.config && scope.config.TraceSettings && scope.config.TraceSettings[index] && scope.config.TraceSettings[index].Hidden);
        }

        function canRevert(config) {
            return config.Zoom && (config.StartOffset || config.StartTime || config.EndOffset || config.EndTime);
        }

        function canHideTrace(symbol, traceIndex) {
            var traceSettings = symbol.Configuration.TraceSettings;
            var hidden = currentTraceSetting(symbol.Configuration, traceIndex, 'Hidden', false);
            return hidden || !traceSettings ||
                traceSettings.filter(
                    function (traceSetting) {
                        return traceSetting && traceSetting.Hidden;
                    }
                ).length < symbol.DataSources.length - 1;
        }

        function allTracesHidden(symbol) {
            var traceSettings = symbol.Configuration.TraceSettings;
            return traceSettings && traceSettings.length === symbol.DataSources.length && traceSettings.every(function (traceSetting) {
                return traceSetting && traceSetting.Hidden;
            });
        }

        /* -------------------------------------------------------------------------- */
        /*    The following functions all involve custom defaults for editor trends   */
        /* -------------------------------------------------------------------------- */
        function getTrendCustomDefaults() {
            if (PV.displayDefaults) {
                return PV.displayDefaults.getCustomDefault(PV.displayDefaults.prefixForSymbolDefaults + 'trend');
            }
        }

        function getTrendTracePalette(customDefaults) {
            let tracePalette = defaultTracePalette.slice();
            if (customDefaults && customDefaults.TraceSettings) {
                // Replace stock colors with custom defaults
                for (const [index, setting] of customDefaults.TraceSettings.entries()) {
                    if (setting && setting.Color) {
                        tracePalette[index] = setting.Color;
                    }
                }

                // Remove duplicates
                tracePalette = [...new Set(tracePalette)];

                // Add back stock colors if result is too short
                if (tracePalette.length < defaultTracePalette.length) {
                    for (const color of defaultTracePalette) {
                        if (!tracePalette.includes(color)) {
                            tracePalette.push(color);
                        }
                    }
                    tracePalette.length = defaultTracePalette.length;
                }
            }
            return tracePalette;
        }

        function getAllowedDefaults(config, allowed) {
            const defaults = angular.copy(config);
            return Object.keys(defaults)
                .filter(key => key in allowed)
                .reduce((obj, key) => {
                    if (allowed[key] === 1) {
                        obj[key] = defaults[key];
                    } else {
                        //recursing here to get allowed defaults of a nested object
                        obj[key] = getAllowedDefaults(defaults[key], allowed[key]);
                    }
                    return obj;
                }, {});
        }

        // Copy trace Color and maybe NameType
        function getAllowedTraceDefaults(defaults, datasources) {
            if (defaults.TraceSettings) {
                const nameTypes = new Set();
                for (const [index, setting] of defaults.TraceSettings.entries()) {
                    nameTypes.add(setting ? setting.NameType : 'D');
                    if (setting) {
                        const newSetting = {};
                        if (setting.Color) {
                            newSetting.Color = setting.Color;
                        }
                        if (setting.NameType) {
                            newSetting.NameType = setting.NameType;
                        }
                        defaults.TraceSettings[index] = newSetting;
                    }
                }

                //only include NameType is all traces have the same NameType 
                //We also do not save custom name types as they are datasource specific
                if (nameTypes.size > 1 || nameTypes.has('C')) {
                    for (const setting of defaults.TraceSettings) {
                        if (setting) {
                            delete setting.NameType;
                        }
                    }
                }
                if (datasources) {
                    defaults.TraceSettings = defaults.TraceSettings.slice(0, datasources.length);
                }

                deleteTraceSettingsIfEmpty(defaults);
            }

            return defaults;
        }

        // Build an object from custom defaults that will be merged into result of getDefaultConfig
        function selectSymbolDefaultsFromConfig(config, datasources) {
            const allowed = {
                'BackgroundColor': 1,
                'TextColor': 1,
                'TrendConfig': { 'gridlines': 1, 'valueScale': { 'bands': 1 } },
                'MultipleScales': 1,
                'ValueScaleSetting': { 'Inverted': 1 },
                'OutsideScales': 1,
                'TimeScaleType': 1,
                'TraceSettings': 1
            };

            const defaults = getAllowedDefaults(config, allowed);
            return getAllowedTraceDefaults(defaults, datasources);
        }

        return {
            contextMenuOptions: contextMenuOptions,
            contextMenuClose: contextMenuClose,
            init: init,
            configure: {
                moveTrace: moveTrace,
                selectTrace: selectTrace,
                deleteTrace: deleteTrace,
                reset: resetToDefaults,
                addTraces: addTraces,
                canHideTrace: canHideTrace,
                allTracesHidden: allTracesHidden,
                isTraceHidden: isTraceHidden,
                hideShowTrace: hideShowTrace,
                showAllTraces: showAllTraces,
                markerStyles: markerStyles,
                onChangeTimeRange: onChangeTimeRange,
                onChangeDuration: onChangeDuration,
                onChangeOffset: onChangeOffset,
                traceColor: traceColor,
                traceStrokeWidth: traceStrokeWidth,
                traceStrokeStyle: traceStrokeStyle,
                traceMarkerIndex: traceMarkerIndex,
                traceValueScaleRange: traceValueScaleRange,
                tracePalette: defaultTracePalette,
                selectSymbolDefaultsFromConfig: selectSymbolDefaultsFromConfig,

                // For tests
                getTrendTracePalette: getTrendTracePalette
            }
        };

    }());

})(window.PIVisualization);
