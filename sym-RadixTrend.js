window.PIVisualization = window.PIVisualization || {};

(function(PV) {
    // 'use strict';

    PV.TrendEnums = {
        ValueScaleType: Object.freeze({
            Autorange: 0, // Adjust based on values in range
            Database: 1, // Use min/max from AF or zero/span from PI data archive
            Absolute: 2 // Custom settings from MinValue and MaxValue
        }),
        TimeScaleType: Object.freeze({
            Full: 0, // Start, end and duration
            Partial: 1, // Partial timestamps for each tick
            Relative: 2, // Offset from end of plot
            RelativeToStart: 3 // Offset from start of plot
        })
    };

    function trendVis() {}
    PV.deriveVisualizationFromBase(trendVis);


    //Función para actualizar la tendencia utilizando TimeProvider
    const updateTrendWithTimeProvider = (timeProvider) => {
            var inistart = timeProvider.displayTime.start;
            var newinistart = inistart + '-1s';
            var endtime = timeProvider.displayTime.end;
            const startTime = timeProvider.displayTime.start == inistart ? newinistart : inistart;
            timeProvider.requestNewTime(startTime, endtime, true, true);
        }
        // Modifica la firma de la función initTrendTagListeners para incluir timeProvider
    function initTrendTagListeners(scope, timeProvider) {
        // Captura del evento 'Radix_Trend_Event'
        scope.$root.$on("Radix_Trend_Event", function(evt, data) {
            const index = scope.symbol.DataSources.indexOf(data.path);
            if (data.state && index == -1) {
                scope.IamEmpty = false;
                scope.symbol.DataSources.push(data.path);
                updateTrendWithTimeProvider(timeProvider);
            } else {
                scope.symbol.DataSources.splice(index, 1);
                scope.runtimeData.data.Traces.splice(index, 1);
                updateTrendWithTimeProvider(timeProvider);
            }
            // Verificar si el modelo de tendencia está vacío
            scope.symbol.DataSources.length == 0 && (scope.IamEmpty = true);
        });
    }


    trendVis.prototype.init = function(scope, elem, $rootScope, appData, dateTimeFormatter, timeProvider, trendZoomService) {
        var that = this;

        scope.timeProvider = timeProvider;

        if (PV.isUnitTesting) {
            this.scope.instance = this;
        }
        // Add your symbol code here
        scope.symbol.DataSources.splice(0);
        scope.IamEmpty = true;

        initTrendTagListeners(scope, timeProvider);


        // no need to bind() these callbacks
        this.onDataUpdate = dataUpdate;
        this.onDestroy = destroy;
        this.onResize = resize;
        this.onConfigChange = configChange;

        // Time handlers
        this.onTimeRangeGesture = onTimeRangeGesture.bind(this);
        this.revertZoom = () => delete this.scope.config.Zoom;

        // Use custom display time provider if present
        this.displayTimeProvider = scope.runtimeData.timeProvider || timeProvider;
        this.displayTimeProvider.onGesture.subscribe(this.onTimeRangeGesture);

        this.revertOnDisplayTimeChanged = function() {
            if (!that.hasCustomTimeRange()) {
                that.revertZoom();
            }
        };
        this.displayTimeProvider.onDisplayTimeChanged.subscribe(this.revertOnDisplayTimeChanged);
        this.setTimeProvider();

        this.appData = appData;
        this.dateTimeFormatter = dateTimeFormatter;
        this.trendZoomService = trendZoomService;

        this.plotArea = elem.find('.plot-area-rect');
        this.gestureRoot = null;
        this.lastGoodPinchEvent = null;
        this.gestureTimeoutPromise = null;
        this.gestureInactivityTimeout = 750;
        this.currentGesture = null;
        this.tapTimeoutPromise = null;
        this.rootScope = $rootScope;

        // 15px font height + 1px margin, from 'symbol-title' class
        this.scope.titleHeight = function() {
            return scope.config.Title ? 17 : 0;
        };

        scope.trendModel = new PV.SVGTrendModel(
            scope.position.width,
            scope.position.height - this.scope.titleHeight(),
            scope.config.TrendConfig);

        scope.trendModel.outsideScales = function() { return !!scope.config.OutsideScales; };

        // Trend always has at least one cursor, visible is 'pos' property is > 0
        scope.cursors = [new PV.SVGTrendCursor(scope.trendModel)];
        this.currentCursor = this.scope.cursors[0];

        // Default interaction options are read at startup, can be overridden by setting property on runtimeData
        var options = angular.merge({
            timeRangeChange: true, // includes "zoom", "pinch" and "pan" action changes to time
            cursor: true, // allow cursor gestures and data requests
            relativeCursorTime: false, // if true show times relative to zero time
            doubleClick: true, // if true, emit 'expandSymbol' when double-clicked, delay cursor-add
            highlightTraceOnLegendClick: true,
            clearHighlightOnConfigChange: true
        }, scope.runtimeData.options);

        scope.runtimeData.options = options;

        // Initialize trend legend with datasources
        if (scope.symbol.DataSources) {
            scope.symbol.DataSources.forEach(function(item) {
                item = item ? item.toString() : ''; // Make sure it's a string
                var path = item;
                item = item.substr(item.lastIndexOf('\\') + 1) || item; // strip out server and database
                item = item.substr(0, item.indexOf('?')) || item; // remove ID after last '?'
                scope.trendModel.trendData.Traces.push({ Label: item, Path: path, Value: '...' });
            });
        }

        // Set legend width from persistence
        scope.trendModel.config.legend.width = scope.config.TrendConfig.LegendWidth;
        scope.legendResizer = new PV.TrendLegendResizer(legendResizeHandler.bind(this));

        scope.trendModel.getTooltip = function(path) {
            return PV.Utils.generateTooltip(null, scope.config.LinkURL, path, true);
        };
        scope.busy = false;
        scope.isTraceHidden = function(index) {
            return def.configure.isTraceHidden(scope, index);
        };

        // Color settings
        scope.bandingColor = PV.Utils.computeReverseColor(scope.config.BackgroundColor);
        scope.traceColor = function(palIndex) { return 'palette-' + palIndex; };

        scope.valueScaleClass = function(palIndex) {
            return scope.config.MultipleScales && scope.trendModel.traces.length > 1 ?
                scope.traceColor(palIndex) :
                'primary-scale';
        };
        scope.valueScaleColor = function(palIndex) {
            return scope.config.MultipleScales && scope.trendModel.traces.length > 1 ?
                scope.traceProperty('Color', palIndex) :
                scope.config.TextColor;
        };

        scope.traceClasses = function(trace) {
            var classes = [scope.traceColor(trace.palIndex)];
            if (trace.highlighted) {
                classes.push('highlighted');
            }
            return classes;
        };
        scope.trendModel.getTraceLabel = function(index, showAssetName) {
            var data = scope.trendModel.trendData.Traces[index];
            if (scope.config.TraceSettings && scope.config.TraceSettings[index] && scope.config.TraceSettings[index].NameType) {
                return PV.LabelUpdateService.getLabel(scope.config.TraceSettings[index], data);
            }
            if (showAssetName) {
                return data.Label;
            }

            return PV.LabelUpdateService.getLabel({ NameType: 'P' }, data);
        };

        scope.traceProperty = function(property, index) {
            if (scope.config.TraceSettings && scope.config.TraceSettings[index]) {
                return scope.config.TraceSettings[index][property];
            }
        };
        scope.traceStrokeStyle = (index, hasMarkers) => {
            if (scope.config.TraceSettings && scope.config.TraceSettings[index] && scope.config.TraceSettings[index].hasOwnProperty('StrokeStyle')) {
                const strokeStyle = scope.config.TraceSettings[index].StrokeStyle;
                if (strokeStyle === '0,10000' && !hasMarkers) {
                    // Avoid invisible line with no markers
                    return;
                }
                return strokeStyle;
            }
            if (scope.config.MarkerStyle === 'scatter' && hasMarkers) {
                return '0,10000';
            }
        };
        scope.traceWidth = function(index) {
            // Fall back to CSS class for highlighting narrow lines, leave thicker lines alone to preserve detail
            var width = scope.traceProperty('StrokeWidth', index);
            return width <= 3 && scope.trendModel.highlightedIndex === index ? undefined : width;
        };

        // Marker at end of trace if updating
        scope.traceEndMarker = function(trace) {
            if (trace.updating && trace.updateIndicator) {
                return PV.Markers.dataMarkers[scope.traceProperty('endMarkerIndex', trace.traceIndex)];
            }
        };

        // Markers along the trace line
        scope.hasDataMarkers = function() {
            return !!scope.config.MarkerStyle || (scope.config.TraceSettings && scope.config.TraceSettings.some(function(setting) {
                return setting && setting.MarkerIndex >= 0;
            }));
        };
        scope.traceDataMarker = function(index) {
            return traceDataMarker(scope.config, index);
        };
        scope.trendModel.traceDataMarker = scope.traceDataMarker; // Callback in trend model

        scope.hasCustomTimeRange = this.hasCustomTimeRange.bind(this);
        scope.runtimeData.hasCustomTimeRange = scope.hasCustomTimeRange; // for zoom sync

        scope.legendItemClass = function(index) {
            var classes = [];
            if (scope.isTraceHidden(index)) {
                classes.push('hidden-trace');
            }
            if (scope.isLegendItemSelected(index)) {
                classes.push('trend-legend-selected-item');
            }
            if (scope.bandingColor) {
                classes.push('light-theme');
            }
            if (!scope.layoutMode && scope.runtimeData.options && scope.runtimeData.options.highlightTraceOnLegendClick) {
                classes.push('hover-highlight');
            }

            return classes;
        };
        scope.cursorItemSelected = function(index) {
            return scope.trendModel.highlightedIndex === index || scope.trendModel.highlightedIndex === undefined || scope.trendModel.highlightedIndex === null;
        };

        scope.onClickLegendItem = function(index) {
            if (scope.runtimeData.options.highlightTraceOnLegendClick && !scope.layoutMode && !scope.isTraceHidden(index)) {
                scope.trendModel.highlight(scope.trendModel.highlightedIndex === index ? null : index);
                scope.$emit('highlightTraceOnLegendClick', scope.trendModel.highlightedIndex);
            }
        };

        scope.isLegendItemSelected = function(index) {
            // Return true if the context menu is active for the this legend item or if its trace is highlighted and the context menu is not active
            return scope.runtimeData.contextMenuIndex === index || (scope.trendModel.highlightedIndex === index && scope.runtimeData.contextMenuIndex === undefined);
        };

        scope.lastConfigChangeDisplayTime = null;

        scope.onMouseMove = onMouseMove.bind(this);
        scope.onMouseEnter = onMouseEnter.bind(this);
        scope.onMouseLeave = onMouseLeave.bind(this);
        scope.onMouseUp = onMouseUp.bind(this);
        scope.gesturing = false;

        scope.rubberBandLeft = function() { return trendZoomService.rubberBand.left + scope.trendModel.plotLeft(); };
        scope.rubberBandTop = function() { return trendZoomService.rubberBand.top + scope.trendModel.plotTop(); };
        scope.rubberBandWidth = function() { return trendZoomService.rubberBand.width; };
        scope.rubberBandHeight = function() { return trendZoomService.rubberBand.height; };
        scope.zooming = function() { return trendZoomService.currentTrend === scope.symbol.Name; };

        scope.beginSplitterMove = beginSplitterMove.bind(this);

        var trendRoot = elem.find('.trend-container');
        trendRoot.on('touchstart', onSymbolTouchStart.bind(this));
        trendRoot.on('touchmove', onSymbolTouchMove.bind(this));
        trendRoot.on('touchend', onSymbolTouchEnd.bind(this));

        // prevent page from scrolling when dragging trend with touch
        elem.find('svg.trend').on('touchmove', function(event) { event && event.preventDefault(); });

        Object.defineProperty(scope, 'panning', { get: function() { return that.currentGesture === 'panning'; } });

        this.gestureRoot = elem.find('.trend-gesture-root');

        // We must force hammer to listen for touch and mouse events under unit tests
        // otherwise we cannot test touch handlers on browsers running on non-touch devices.
        // Hammer will feature detect touch support and not listen for those events. This happens
        // when the script loads so we cannot trick this detection by, for example, adding
        // ontouchmove() to the window object. It also seeme impossible to get the hammer manager (mc)
        // in the tests to reset the input class.
        var inputClass = PV.isUnitTesting ? Hammer.TouchMouseInput : null;

        var mc = new Hammer(
            this.gestureRoot[0], {
                domEvents: false,
                recognizers: [
                    [Hammer.Tap, { interval: 0, taps: 1, threshold: 10 }],
                    [Hammer.Pan, { enable: true, direction: Hammer.DIRECTION_HORIZONTAL }],
                    [Hammer.Pinch]
                ],
                inputClass: inputClass
            }
        );

        if (options.cursor) {
            mc.on('tap', onTap.bind(this));
        }

        if (options.cursor || options.timeRangeChange) {
            mc.on('panstart', onPanStart.bind(this));
            mc.on('pan', onPan.bind(this));
            mc.on('panend', onPanEnd.bind(this));
        }

        if (options.timeRangeChange) {
            mc.on('pinchstart', onPinchStart.bind(this));
            mc.on('pinchcancel', onPinchCancel.bind(this));
            mc.on('pinch', onPinch.bind(this));
            mc.on('pinchend', onPinchEnd.bind(this));
        }


        // Update after datasources are reordered or deleted

        scope.$watch('symbol.DataSources', (nv, ov) => {

            if (nv && ov && !angular.equals(nv, ov)) {
                scope.trendModel.highlight(null);
                this.revertZoom();
                if (nv.length < ov.length || // datasources deleted
                    ((nv.length === ov.length) && ov.some(function(ds, idx) { return nv.indexOf(ds) > -1 && ds !== nv[idx]; }))) { // datasources reordered

                    updateTrendOnChange(scope);
                    scope.trendModel.refresh();
                }
            }
        }, true);

        scope.$on('highlightTrace', onHighlightTrace.bind(this));

        scope.$on('trendHideNowLine', function() {
            that.hideNowLine.call(that);
        });

        if (options.cursor) {
            // add cursor handling on the runtime for calls from a containing symbol
            scope.runtimeData.setCursorFromContainer = this.setCursor.bind(this);
            scope.runtimeData.activateCursorFromContainer = this.onActivateCursor.bind(this);
            scope.runtimeData.newCursorFromContainer = this.onNewCursor.bind(this);

            scope.$on('setTrendCursors', function(_, date) {
                if (!that.hasCustomTimeRange()) {
                    that.setCursor.call(that, date);
                }
            });

            scope.$on('newTrendCursors', function() {
                that.hideNowLine.call(that);
                if (!that.hasCustomTimeRange()) {
                    that.onNewCursor.call(that);
                }
            });

            scope.$on('activateTrendCursors', function(_, date) {
                if (!that.hasCustomTimeRange()) {
                    that.onActivateCursor.call(that, date);
                }
            });
        }

        scope.$on('setLayoutModeEvent', function() { scope.trendModel.highlight(null); });
    };

    function valueScaleSettings(config) {
        return (config.TraceSettings || [])
            .filter(function(traceSetting) {
                return traceSetting && !!traceSetting.ValueScaleSetting;
            }).map(function(traceSetting) {
                return traceSetting.ValueScaleSetting;
            });
    }

    function hiddenTracesCount(config) {
        return (config.TraceSettings || [])
            .filter(function(traceSetting) {
                return traceSetting && traceSetting.Hidden;
            }).length;
    }

    function onHighlightTrace(e, index) {
        this.scope.trendModel.highlight(index);
    }

    trendVis.prototype.hasCustomTimeRange = function() {
        return !!this.customTimeProvider;
    };

    trendVis.prototype.setTimeProvider = function() {
        if (this.scope.config.StartOffset || this.scope.config.StartTime || this.scope.config.EndOffset || this.scope.config.EndTime) {
            var that = this;
            this.customTimeProvider = this.displayTimeProvider.create();
            this.customTimeProvider.model.getServerStartTime = function() {
                return that.scope.runtimeData.data.StartTimeUtc;
            };
            this.customTimeProvider.model.getServerEndTime = function() {
                return that.scope.runtimeData.data.EndTimeUtc;
            };
            this.customTimeProvider.onRubberbandZoom.subscribe(function(start, end) {
                angular.merge(that.scope.config.Zoom, {
                    StartTime: start,
                    EndTime: end,
                    detached: true
                });
                that.scope.$emit('pushUndoChange');
            });
            this.customTimeProvider.onGesture.subscribe(function(startLabel, endLabel, gesture) {
                that.scope.$emit('stopDataPump');
                that.onTimeRangeGesture.call(that, startLabel, endLabel, gesture, true);
            });
            this.customTimeProvider.onDisplayTimeChanged.subscribe(function() {
                that.clearCursors();
                that.scope.config.Zoom = {
                    StartTime: that.customTimeProvider.displayTime.start,
                    EndTime: that.customTimeProvider.displayTime.end,
                    detached: true
                };
                that.scope.$emit('pushUndoChange');
            });

            this.timeProvider = this.customTimeProvider;

        } else {
            this.timeProvider = this.displayTimeProvider;
            delete this.customTimeProvider;
        }
    };

    // Called from deep watch on Configuration property if anything changes
    function configChange(newConfig, oldConfig) {
        if (!newConfig || !oldConfig || angular.equals(newConfig, oldConfig)) {
            return;
        }

        var requestDataUpdate;

        if (newConfig.BackgroundColor !== oldConfig.BackgroundColor) {
            this.scope.bandingColor = PV.Utils.computeReverseColor(newConfig.BackgroundColor);
        }

        var hiddenTracesChange = hiddenTracesCount(newConfig) - hiddenTracesCount(oldConfig);
        if (hiddenTracesChange !== 0) {
            requestDataUpdate = true;

        } else if (newConfig.FormatType !== oldConfig.FormatType) {
            requestDataUpdate = true;

        } else if (!angular.equals(newConfig.ValueScaleSetting, oldConfig.ValueScaleSetting) || !angular.equals(valueScaleSettings(newConfig), valueScaleSettings(oldConfig))) {
            // Trend scale type changed
            requestDataUpdate = true;

        } else if (newConfig.StartTime !== oldConfig.StartTime || newConfig.StartOffset !== oldConfig.StartOffset ||
            newConfig.EndTime !== oldConfig.EndTime || newConfig.EndOffset !== oldConfig.EndOffset) {
            requestDataUpdate = true;
            this.setTimeProvider();

        } else if (newConfig.MultipleScales !== oldConfig.MultipleScales || newConfig.TimeScaleType !== oldConfig.TimeScaleType) {
            requestDataUpdate = true;

        } else if (newConfig.OutsideScales !== oldConfig.OutsideScales) {
            requestDataUpdate = true;

        } else if (newConfig.MarkerStyle !== oldConfig.MarkerStyle && (!newConfig.MarkerStyle || !oldConfig.MarkerStyle)) {
            requestDataUpdate = true;

        } else if (traceSettingsChanged.call(this, newConfig, oldConfig)) {
            requestDataUpdate = true;

        } else if (!angular.equals(newConfig.Zoom, oldConfig.Zoom)) {
            if (this.hasCustomTimeRange()) {
                requestDataUpdate = true;
                if (!newConfig.Zoom) {
                    // Revert time range
                    this.clearCursors();
                }
            } else if (newConfig.Zoom) {
                this.scope.$emit('updateZoomedTrend', cursorDates(this.scope));
            }
        }



        // Remove highlighted traces after any config change other than zooming, legend width changes
        if ((!this.scope.runtimeData.options || this.scope.runtimeData.options.clearHighlightOnConfigChange) &&
            this.scope.trendModel.highlightedIndex >= 0 &&
            angular.equals(newConfig.Zoom, oldConfig.Zoom) &&
            angular.equals(newConfig.TrendConfig.LegendWidth, oldConfig.TrendConfig.LegendWidth)) {
            this.scope.trendModel.highlight(null);
        }

        if (newConfig.TrendConfig.legend &&
            oldConfig.TrendConfig.legend &&
            newConfig.TrendConfig.legend.shown !== oldConfig.TrendConfig.legend.shown) {
            this.scope.trendModel.config.legend.shown = newConfig.TrendConfig.legend.shown;
            this.scope.trendModel.refresh();
        }

        if (newConfig.TrendConfig.gridlines !== oldConfig.TrendConfig.gridlines ||
            newConfig.TrendConfig.valueScale.bands !== oldConfig.TrendConfig.valueScale.bands) {
            this.scope.trendModel.config.valueScale.bands = newConfig.TrendConfig.valueScale.bands;
            this.scope.trendModel.config.gridlines = newConfig.TrendConfig.gridlines;
            this.scope.trendModel.refresh();
        }

        if (!!newConfig.Title !== !!oldConfig.Title) {
            this.onResize(this.scope.position.width, this.scope.position.height);
        }

        if (requestDataUpdate) {
            updateTrendOnChange(this.scope);
        }
    }

    function traceSettingsChanged(newConfig, oldConfig) {
        const newSettings = newConfig.TraceSettings || [];
        const oldSettings = oldConfig.TraceSettings || [];
        let refreshModel = false;

        for (let i = 0; i < Math.max(newSettings.length, oldSettings.length); i++) {
            const newSetting = newSettings[i] || {};
            const oldSetting = oldSettings[i] || {};
            if (newSetting.NameType !== oldSetting.NameType ||
                newSetting.CustomName !== oldSetting.CustomName ||
                newSetting.DisplayUOM !== oldSetting.DisplayUOM) {
                this.scope.trendModel.refresh();
                return true;
            }

            const newMarker = newSetting.MarkerIndex;
            const oldMarker = oldSetting.MarkerIndex;
            if (newMarker !== oldMarker) {
                if (!newConfig.MarkerStyle && ((newMarker >= 0 && !oldMarker) || (oldMarker >= 0 && !newMarker))) {
                    // Trend set to lines without markers, one trace has marker
                    return true;
                }
                if (newConfig.MarkerStyle && (newMarker === -1 || oldMarker === -1)) {
                    // Trend set to show markers, one trace has no marker
                    return true;
                }
                refreshModel = true;
            }
        }

        if (refreshModel) {
            this.scope.trendModel.refresh();
        }
    }

    // Called by symbol host when this.scope is destroyed
    function destroy() {
        this.displayTimeProvider.onDisplayTimeChanged.unsubscribe(this.revertOnDisplayTimeChanged);
        this.displayTimeProvider.onGesture.unsubscribe(this.onTimeRangeGesture);
    }

    function resize(width, height) {
        if (this.scope.trendModel) {
            this.scope.trendModel.setDimensions(width, height - this.scope.titleHeight());
            this.scope.cursors.forEach(function(cursor) { cursor.resize(); });
        }
    }


    function dataUpdate(newVal) {

        if (this.scope.IamEmpty) {
            newVal.Traces = [];
            this.scope.trendModel.update(newVal);
        }

        if (newVal.Traces.length > 0) {
            //Add By Hagy
            //scope.symbol.DataSources.splice(0);
            //End by HAGY

            // we're definitely done gesturing when a data update arrives
            this.scope.gesturing = false;

            this.scope.legendResizer.update(this.scope.config.TrendConfig.LegendWidth); //  Required to reset the legendWidth on undo/redo of legend resize.
            this.scope.trendModel.update(newVal);

            if (newVal.CursorTimes && newVal.CursorPositions) {
                // May need to reset positions after zooming around a cursor
                this.scope.cursors.length = newVal.CursorTimes.length;
                this.scope.cursors.forEach((cursor, index) => {
                    cursor.setPadding(this.scope.hasDataMarkers());

                    const cursorPercent = newVal.CursorPositions[index] / 100;
                    const pos = this.scope.trendModel.plotLeft() + (this.scope.trendModel.plotWidth() * cursorPercent);
                    cursor.setPosition(pos); // Do not set 'pos' directly, allow repositioning on resize

                    cursor.update(newVal, index);

                    if (newVal.Duration && this.scope.runtimeData.options.relativeCursorTime) {
                        cursor.date = newVal.Duration * cursorPercent;
                    }
                });
            } else {
                this.clearCursors();
            }
        }
    }

    function beginSplitterMove(event) {
        this.scope.legendResizer.onLegendResizeStart(event);
    }

    function onMouseMove(event) {
        this.scope.legendResizer.onLegendResizeMove(event, this.scope.position.width);
    }

    function onMouseUp(event) {
        this.scope.legendResizer.onLegendResizeEnd(event);
    }

    function onMouseEnter(event) {
        this.scope.legendResizer.onLegendResizeEnter(event);
    }

    function onMouseLeave(event) {
        this.scope.legendResizer.onLegendResizeEnter(event);
    }

    //
    // Gesture functionality
    //

    function onTap(e) {
        var that = this;
        if (this.tapTimeoutPromise) {
            this.timeout.cancel(this.tapTimeoutPromise);
            this.tapTimeoutPromise = null;
            this.scope.$emit('expandSymbol', { symbolName: this.scope.runtimeData.name });
        } else if (!this.scope.layoutMode && !this.scope.gesturing) {
            this.tapTimeoutPromise = this.timeout(function() {
                that.tapTimeoutPromise = null;
                that.addCursor(e);
            }, this.scope.runtimeData.options.doubleClick ? 300 : 0);
        }
    }

    trendVis.prototype.getGestureTargetArea = function(e) {
        // Can not use e.target for the target - see bug https://github.com/hammerjs/hammer.js/issues/815
        // Using elementFromPoint work around to get the target.
        var target;
        if (e.pointers.length) {
            target = document.elementFromPoint(e.pointers[0].pageX - e.deltaX, e.pointers[0].pageY - e.deltaY);
        } else {
            target = document.elementFromPoint(e.center.x, e.center.y);
        }
        var gestTarg = $(target).closest('.trend-gesture-target', this.gestureRoot);
        if (!gestTarg || gestTarg.length !== 1) {
            return null;
        }
        if (gestTarg.hasClass('trend-cursor')) {
            var index = +(gestTarg.attr('data-cursorindex'));
            this.activateTrendCursors(this.scope.cursors[index].date);
            return 'cursor';
        }
        if (gestTarg.hasClass('trend-pan-area')) {
            return 'pan';
        }
        return 'plot';
    };

    function onPanStart(e) {
        // don't allow for new gestures if in layout mode or size is too small
        if (this.scope.layoutMode || this.scope.trendModel.isSparkline) {
            return;
        }

        this.currentGesture = null;
        this.lastGoodPinchEvent = null;

        var gestArea = this.getGestureTargetArea(e);
        var pt;
        if (gestArea === 'cursor') {
            pt = this.screenToClientPoint(e);
            this.startMoveCursor(pt.x - e.deltaX);
            this.moveCursor(pt.x);
        } else if (this.runtime.options.timeRangeChange) {
            if (gestArea === 'pan' || e.pointerType === 'touch') {
                this.currentGesture = 'panning';
            } else {
                pt = this.screenToClientPoint(e);
                pt.x = pt.x - e.deltaX;
                pt.y = pt.y - e.deltaY;
                this.trendZoomService.startRubberBandZoom(this.scope.symbol.Name, pt, this.scope.trendModel.plotWidth(), this.scope.trendModel.plotHeight());
                this.scope.$emit('stopDataPump');
            }
        }
    }

    function onPan(e) {
        if (this.scope.layoutMode) {
            return;
        }

        if (this.currentCursor.eventStart) {
            this.moveCursor(this.screenToClientPoint(e).x);
        } else if (this.currentGesture === 'panning') {
            this.timeProvider.panTimeRange(this.scope.trendModel.calcXOffsetPercent(e.deltaX) / this.appData.zoomLevel);
        } else if (this.trendZoomService.currentTrend) {
            this.trendZoomService.createRubberBand(this.screenToClientPoint(e));
        }
    }

    function onPinchStart() {
        this.lastGoodPinchEvent = null;
    }

    function onPinch(e) {
        if (this.scope.layoutMode) {
            return;
        }

        // see onPinchCancel
        if (e.scale !== 1) { this.lastGoodPinchEvent = e; }

        this.currentGesture = 'pinching';
        var x = this.screenToClientPoint(e).x;
        this.timeProvider.scaleTimeRange(e.scale, this.scope.trendModel.calcXOffsetPercent(x) / this.appData.zoomLevel);
    }

    function onPinchEnd() {
        if (this.scope.layoutMode) {
            return;
        }

        this.gestureComplete();
    }

    // iOS seems to cancel our pinch events at random when we stop pinching, it will go so far
    // as to send a finial pan event that resets any panning done previously. To work around this
    // we'll keep the last event that actually changed the scale and use it change the zoom of
    // the trend in the cancel message
    function onPinchCancel() {
        if (!this.scope.layoutMode) {
            onPinch.bind(this)(this.lastGoodPinchEvent);
            this.gestureComplete();
        }
    }

    function onPanEnd(e) {
        if (this.scope.layoutMode) {
            return;
        }

        if (this.currentGesture) {
            this.gestureComplete();
        } else if (this.trendZoomService.currentTrend) {
            this.zoomTrend(this.screenToClientPoint(e));
        } else if (!this.scope.gesturing && this.currentCursor.eventStart) {
            // we must have been moving a cursor if this is set
            this.stopMoveCursor(this.screenToClientPoint(e).x);
        }
    }

    trendVis.prototype.gestureComplete = function() {
        // tell the timeprovider we're done one gesture, but don't fire a data update yet
        this.timeProvider.gestureComplete(false);

        // start waiting to detect inactivity
        if (this.gestureTimeoutPromise) { this.timeout.cancel(this.gestureTimeoutPromise); }

        var that = this;
        this.gestureTimeoutPromise = this.timeout(function() {
            that.timeProvider.gestureComplete(true);
        }, this.gestureInactivityTimeout);

        this.currentGesture = null;
    };

    trendVis.prototype.screenToClientPoint = function(e) {
        var rect = this.plotArea[0].getBoundingClientRect();

        // hammer seems to round points, so we should as well
        return {
            x: e.center.x - Math.round(rect.left) - this.scope.trendModel.plotLeft(),
            y: e.center.y - Math.round(rect.top) - this.scope.trendModel.plotTop()
        };
    };

    // Handler from the time provider signal. This routine will be called for all synchronized trends
    // even if that trend isn't the one being panned and will actually apply the pan or pinch to the traces
    // while gesturing is taking place
    function onTimeRangeGesture(startLabel, endLabel, gesture, isCustom) {
        if (!!isCustom !== this.hasCustomTimeRange()) {
            return;
        }

        if (gesture.cancel) {
            this.scope.gesturing = false;
        } else {
            this.scope.gesturing = true;
            this.scope.cursors.forEach(function(cursor) {
                if (cursor.pos > this.scope.trendModel.plotLeft()) {
                    cursor.reset();
                }
            }, this);

            // stop the gesture timeout on this trend if we started gesturing on another symbol, that symbol will now
            // handle the final application of the time change
            this.cancelPendingGestureTimeout();

            if (gesture.type === 'panning') {
                this.scope.trendModel.pan(gesture.percent, startLabel, endLabel);
            } else {
                this.scope.trendModel.scale(gesture.scale, gesture.offset, startLabel, endLabel);
            }
        }
    }

    trendVis.prototype.cancelPendingGestureTimeout = function() {
        if (this.gestureTimeoutPromise) {
            this.timeout.cancel(this.gestureTimeoutPromise);
            this.gestureTimeoutPromise = null;
        }
    };

    //
    // Rubber-Band Zooming
    //

    trendVis.prototype.zoomTrend = function() {
        this.trendZoomService.zoomComplete();
        var limits = this.scope.trendModel.getValueScaleLimits();
        if (this.trendZoomService.rubberBand.height <= 1 || this.trendZoomService.rubberBand.width <= 1 || !limits) {
            return;
        }

        // This will trigger configChange after a digest cycle - request data update after diff generator is ready
        var zoom = this.scope.config.Zoom = {};

        // If limits.min is set then proceed setting a single scale, otherwise set scales for individual traces
        // Scale limit types: 0 = Autorange, 1 = Database, 2 = Absolute
        // If absolute, MinValue = scale lower limit, MaxValue = scale upper limit        
        if (limits.min !== null) {
            zoom.ValueScaleSetting = this.zoomedScaleSetting(limits.min, limits.max);
        } else {
            zoom.TraceSettings = limits.traces.map(function(limits) {
                return { ValueScaleSetting: this.zoomedScaleSetting(limits.min, limits.max) };
            }, this);
            zoom.ValueScaleSetting = {
                MinType: PV.TrendEnums.ValueScaleType.Absolute,
                MaxType: PV.TrendEnums.ValueScaleType.Absolute
            };
        }

        // determine the new start and end time
        var startPercent = this.scope.trendModel.calcXOffsetPercent(this.trendZoomService.rubberBand.left);
        var endPercent = this.scope.trendModel.calcXOffsetPercent((this.trendZoomService.rubberBand.left + this.trendZoomService.rubberBand.width));
        this.timeProvider.setZoomedTimeRange(startPercent, endPercent);
    };

    // determine the new scale max and min based on rubberBand dimensions
    trendVis.prototype.zoomedScaleSetting = function(scaleMin, scaleMax) {
        var plotRange = this.scope.trendModel.plotHeight();
        var scaleRange = scaleMax - scaleMin;
        var min = (1 - ((this.trendZoomService.rubberBand.top + this.trendZoomService.rubberBand.height) / plotRange)) * scaleRange + scaleMin;
        var max = (1 - (this.trendZoomService.rubberBand.top / plotRange)) * scaleRange + scaleMin;
        var limits = adjustLimits(min, max);
        return {
            MinType: PV.TrendEnums.ValueScaleType.Absolute,
            MinValue: limits.min,
            MaxType: PV.TrendEnums.ValueScaleType.Absolute,
            MaxValue: limits.max
        };
    };

    // round limits for significant digits
    function adjustLimits(min, max) {
        var delta = max - min;
        if (delta > 0) {
            var tooSmall = 1e-14; // Practical limit of floating point rounding
            if (delta < tooSmall) {
                max = min + tooSmall;
            } else if (delta > 100) {
                min = Math.floor(min);
                max = Math.ceil(max);
            } else {
                var log10delta = Math.floor(Math.log(delta) / Math.LN10);
                var precision = Math.abs(log10delta - 2);
                var pow10 = Math.pow(10, precision);
                min = Math.round(min * pow10) / pow10;
                max = Math.round(max * pow10) / pow10;
            }
        }
        return { min: min, max: max };
    }

    //
    // Cursor functionality
    //
    function cursorDates(scope) {
        if (scope.cursors[0].date) {
            return scope.cursors.map(function(cursor) { return cursor.date; });
        }
    }

    function updateTrendOnChange(scope) {
        var dates = cursorDates(scope);
        if (dates) {
            scope.$emit('refreshDataforChangedSymbolsWithCursor', dates, scope.symbol.Name);
        } else {
            scope.$emit('refreshDataForChangedSymbols');
        }
    }

    trendVis.prototype.hideNowLine = function() {
        this.scope.trendModel.nowline = -1;
        this.scope.trendModel.trendData.NowPosition = undefined;
    };

    trendVis.prototype.clearCursors = function() {
        this.scope.cursors.length = 1;
        this.scope.cursors[0].reset();
    };

    trendVis.prototype.requestCursorUpdate = function() {
        if (this.scope.runtimeData.options.cursor) {
            if (this.displayTimeProvider.getServerIsUpdating()) {
                // Pin display time range to use fixed times
                this.displayTimeProvider.displayTime = {
                    start: this.displayTimeProvider.getServerStartTime(),
                    end: this.displayTimeProvider.getServerEndTime()
                };
            }

            const dates = cursorDates(this.scope);
            const requestData = !this.scope.runtimeData.data.CursorTimes;
            if (this.hasCustomTimeRange()) {
                // Pin the trend time range to last absolute times
                const start = this.scope.runtimeData.data.StartTimeUtc;
                const end = this.scope.runtimeData.data.EndTimeUtc;
                const zoom = this.scope.config.Zoom = (this.scope.config.Zoom || {});

                if (zoom.StartTime !== start || zoom.EndTime !== end) {
                    // update gets triggered by config change
                    zoom.StartTime = start;
                    zoom.EndTime = end;
                } else {
                    this.scope.$emit('updateTrendMultipleCursors', dates, requestData, this.scope.symbol.Name);
                }
            } else {
                this.scope.$emit('updateTrendMultipleCursors', dates, requestData);
            }
        }
    };

    trendVis.prototype.newTrendCursors = function() {
        if (this.scope.runtimeData.options.cursor) {
            if (this.hasCustomTimeRange()) {
                this.onNewCursor();
                this.rootScope.$broadcast('trendHideNowLine');

                // notify containing symbol of custom trend cursor change
                this.scope.$emit('newCustomTrendCursors');
            } else {
                this.rootScope.$broadcast('newTrendCursors');
            }
        }
    };

    trendVis.prototype.activateTrendCursors = function(cursorDate) {
        if (this.scope.runtimeData.options.cursor) {
            if (this.hasCustomTimeRange()) {
                this.onActivateCursor(cursorDate);

                // notify containing symbol of custom trend cursor change
                this.scope.$emit('activateCustomTrendCursors', cursorDate);
            } else {
                this.rootScope.$broadcast('activateTrendCursors', cursorDate);
            }
        }
    };

    trendVis.prototype.setTrendCursors = function(cursorDate) {
        if (this.hasCustomTimeRange()) {
            this.setCursor(cursorDate);

            // notify containing symbol of custom trend cursor change
            this.scope.$emit('setCustomTrendCursors', cursorDate);
        } else {
            this.rootScope.$broadcast('setTrendCursors', cursorDate);
        }
    };

    trendVis.prototype.addCursor = function(e) {
        if (this.scope.trendModel.allowCursor) {
            var x = this.screenToClientPoint(e).x;
            var date = this.getCursorDate(x / this.appData.zoomLevel, this.scope.trendModel);
            if (date && this.getGestureTargetArea(e) !== 'cursor') {
                this.newTrendCursors();
                this.setTrendCursors(date);
                this.requestCursorUpdate(date);
            }
        }
    };

    trendVis.prototype.onNewCursor = function() {
        if (this.scope.runtimeData.options.cursor) {
            if (this.scope.cursors[this.scope.cursors.length - 1].pos > 0) {
                this.scope.cursors.push(new PV.SVGTrendCursor(this.scope.trendModel));
            }
            this.currentCursor = this.scope.cursors[this.scope.cursors.length - 1];
        }
    };

    trendVis.prototype.onActivateCursor = function(date) {
        if (this.scope.runtimeData.options.cursor) {
            var index = -1;
            this.scope.cursors.forEach(function(cursor, i) {
                if (cursor.date === date) {
                    index = i;
                }
            });
            if (index >= 0) {
                this.currentCursor = this.scope.cursors[index];
                this.scope.cursors.push(this.scope.cursors.splice(index, 1)[0]); // move to top of z-order
            }
        }
    };

    trendVis.prototype.startMoveCursor = function(x) {
        this.currentCursor.eventStart = {
            offset: x / this.appData.zoomLevel - this.currentCursor.pos
        };
    };

    trendVis.prototype.moveCursor = function(x) {
        // For touch on Android and Chrome, March 2019
        // symbol template has ontouchmove handler to prevent 'pointercancel' events from reaching the plot area
        // caused by mixing hammer with native touch handlers for the legend
        if (this.currentCursor.eventStart) {
            var cursorDate = this.getCursorDate(x / this.appData.zoomLevel - this.currentCursor.eventStart.offset, this.scope.trendModel);
            this.setTrendCursors(cursorDate);
            return cursorDate;
        }
    };

    trendVis.prototype.stopMoveCursor = function(x) {
        if (this.currentCursor.eventStart) {
            var cursorDate = this.moveCursor(x);
            if (cursorDate) {
                this.requestCursorUpdate(cursorDate);
                delete this.currentCursor.eventStart;
            }
        }
    };

    trendVis.prototype.setCursor = function(cursorDate) {
        var pos, duration, newDates;
        var options = this.scope.runtimeData.options;

        // For cursor sync
        this.scope.runtimeData.allowCursor = this.scope.trendModel.allowCursor && !this.hasCustomTimeRange();

        if (cursorDate && this.scope.trendModel.allowCursor) {
            // Set the cursor position, displayed time string
            pos = this.getCursorPos(cursorDate, this.scope.trendModel);
            this.currentCursor.setPosition(pos);
            this.currentCursor.date = cursorDate;
            if (this.scope.runtimeData.options.relativeCursorTime) {
                this.currentCursor.time = this.dateTimeFormatter.formatDurationNumber(cursorDate - this.scope.trendModel.relativeTimeZero);
            } else {
                duration = Date.parse(this.timeProvider.getServerEndTime()) - Date.parse(this.timeProvider.getServerStartTime());
                this.currentCursor.time = this.dateTimeFormatter.formatDateTime(cursorDate, duration <= 5000);
            }
            if (this.scope.config.CursorDragValues) {
                this.showCursorDragValues();
            }
        } else {
            // Reset position to 0 to hide in template
            this.currentCursor.reset();
        }

        // If not hidden, remove the Now line
        if (!(this.currentCursor.pos === 0 && this.scope.trendModel.allowCursor)) {
            this.hideNowLine();
        }

        // If cursor was dragged off the plot area, stop the drag action
        if (this.currentCursor.eventStart && this.currentCursor.pos === 0) {
            delete this.currentCursor.eventStart;
            if (options.cursor && this.scope.cursors.length > 1) {
                // Make the next-to-last cursor the current one
                this.scope.cursors.pop();
                this.currentCursor = this.scope.cursors[0];
            }

            if (this.currentCursor.pos > 0) {
                this.requestCursorUpdate();
            } else {
                // Last cursor removed
                if (Date.parse(this.timeProvider.getServerEndTime()) > Date.now() && !this.hasCustomTimeRange()) {
                    // Relative future end time, request new formatted times
                    newDates = this.timeProvider.model.reset(new Date(this.timeProvider.getServerStartTime()), new Date(this.timeProvider.getServerEndTime()));
                    this.timeProvider.requestNewTime(newDates.start, newDates.end, true, true);
                } else {
                    this.scope.$emit('clearTrendMultipleCursors');
                }

                // Custom time range, not panned or zoomed
                if (this.hasCustomTimeRange() && this.scope.config.Zoom && !this.scope.config.Zoom.detached) {
                    this.revertZoom(); // Update is requested in onConfigChange
                }
            }
        }
    };

    trendVis.prototype.showCursorDragValues = function() {
        // CursorTimes is not present if cursor data not requested yet
        if (this.scope.runtimeData.data.CursorTimes) {
            const traces = this.scope.runtimeData.data.Traces;
            const visibleTrace = traces.find(trace => trace.CursorDragValues);
            if (visibleTrace) {
                // Get the position of the cursor in the plot area
                const offset = this.currentCursor.pos - this.scope.trendModel.plotLeft();

                // Assume all traces have the same number of drag values
                const numberOfValues = visibleTrace.CursorDragValues.length;
                const valueIndex = Math.round(offset / this.scope.trendModel.plotWidth() * numberOfValues);

                // Get drag values for all traces
                const cursorData = traces.map(trace => ({
                    Value: trace.Value, // used by cursor to detect hidden traces
                    CursorValues: trace.CursorDragValues ? [trace.CursorDragValues[valueIndex]] : null
                }));

                // Update current cursor for index 0 in the data
                const cursorUpdate = {
                    CursorTimes: [this.currentCursor.time],
                    Traces: cursorData
                };
                this.currentCursor.setPadding(this.scope.hasDataMarkers());
                this.currentCursor.update(cursorUpdate, 0);
            }
        }
    };

    trendVis.prototype.trendRange = function() {
        var start, end;
        if (this.hasCustomTimeRange()) {
            start = this.scope.runtimeData.data.StartTimeUtc;
            end = this.scope.runtimeData.data.EndTimeUtc;
        } else {
            start = this.timeProvider.getServerStartTime();
            end = this.timeProvider.getServerEndTime();
        }
        return {
            start: Date.parse(start),
            end: Date.parse(end)
        };
    };

    trendVis.prototype.getCursorPos = function(cursorDate, trendModel) {
        if (this.scope.runtimeData.options.relativeCursorTime) {
            return Math.ceil(trendModel.calcXPosition(cursorDate));
        }

        var range = this.trendRange(),
            cursorMs = cursorDate.getTime(),
            offset = (cursorMs - range.start) / (range.end - range.start),
            pos = (trendModel.plotWidth() * offset) + trendModel.plotLeft();

        return Math.ceil(pos);
    };

    trendVis.prototype.getCursorDate = function(offsetX, trendModel) {
        if (this.scope.runtimeData.options.relativeCursorTime) {
            return trendModel.calcRelativeOffset(offsetX);
        }

        var range = this.trendRange(),
            percent = offsetX / trendModel.plotWidth(),
            cursorMs = range.start + ((range.end - range.start) * percent),
            cursorDate = new Date(cursorMs);

        if (cursorMs >= range.start && cursorMs <= range.end) {
            return cursorDate;
        }
    };

    function traceDataMarker(config, index) {
        var markerIndex = config.MarkerStyle ? index % 12 : -1;
        if (config.TraceSettings && config.TraceSettings[index] && config.TraceSettings[index].hasOwnProperty('MarkerIndex')) {
            markerIndex = config.TraceSettings[index].MarkerIndex;
        }
        return PV.Markers.dataMarkers[markerIndex];
    }

    //
    // Legend resize functionality
    //
    function legendResizeHandler(width, isFinal) {
        var legendConfig = this.scope.trendModel.config.legend;
        if (width === undefined) {
            return legendConfig.width;
        }
        if (isFinal) {
            // Persist the new width in the *symbol's* copy of the TrendConfig
            // which is different than the trendModel's config property
            this.scope.config.TrendConfig.LegendWidth = width;
            this.scope.$emit('updateOnLegendResize');
            this.scope.$emit('pushUndoChange');
        } else if (width !== legendConfig.width) {
            legendConfig.width = width;
            this.scope.trendModel.refresh();
            this.scope.cursors.forEach(function(cursor) { cursor.resize(); });
        }
    }

    function onSymbolTouchStart(event) {
        this.scope.legendResizer.onLegendResizeStart(event);
        this.scope.$digest();
    }

    function onSymbolTouchMove(event) {
        var handled = this.scope.legendResizer.onLegendResizeMove(event, this.scope.position.width);

        // in non-layout mode eat all touch move message, but not when legend scrollbars are shown
        if (!this.scope.layoutMode && !handled && !this.scope.legendResizer.showScrollbars) {
            event.stopPropagation();
            event.preventDefault();
        }

        this.scope.$digest();
    }

    function onSymbolTouchEnd(event) {
        this.scope.legendResizer.onLegendResizeEnd(event);
        this.scope.$digest();
    }

    function loadConfig(config, datasources) {
        delete config.updateDisplay;

        // CS 3.0 Beta - flag was missing, server defaults to single scale
        if (config.MultipleScales === undefined) {
            config.MultipleScales = false;
        }

        // v 3.0 2016 - deprecated settings
        delete config.HiddenTraceIndexes;
        delete config.LastValueScaleSetting;
        delete config.LastTraceSettings;

        if (config.TraceSettings) {
            // v 3.2 2017 and earlier - make stroke width numeric, round to nearest step
            config.TraceSettings.forEach(function(setting) {
                if (setting && setting.StrokeWidth) {
                    setting.StrokeWidth = PV.symbolCatalog.adjustSliderProperty(setting.StrokeWidth, .5, .7);
                }
            });

            // v 3.3.1 2017 R2 SP1 and earlier - unhide single trace on trend
            if (datasources && PV.TrendConfig.configure.allTracesHidden({ Configuration: config, DataSources: datasources })) {
                datasources.forEach(function(ds, i) {
                    PV.TrendConfig.configure.hideShowTrace({ Configuration: config }, i);
                });

                config.updateDisplay = true;
            }
        }

        // v 3.6 2021 - ignore persisted scale, time overrides
        if (config.Zoom) {
            delete config.Zoom;
            config.updateDisplay = true; // force upload before first update
        }

        return true; // Merge with getDefaultConfig
    }

    function getDefaultConfig() {
        return {
            DataShape: 'Trend',
            Height: 250,
            Width: 600,
            TrendConfig: {
                valueScale: {
                    axis: false,
                    tickMarks: true,
                    bands: true,
                    padding: 2
                },
                timeScale: {
                    axis: true,
                    tickMarks: true
                },
                padding: 2,
                nowPosition: true,
                LegendWidth: 120
            },
            MultipleScales: true,
            ValueScaleSetting: {
                MinType: PV.TrendEnums.ValueScaleType.Autorange,
                MaxType: PV.TrendEnums.ValueScaleType.Autorange
            },
            TimeScaleType: PV.TrendEnums.TimeScaleType.Full,
            NowPosition: true,
            TraceSettings: null,
            CursorDragValues: true
        };
    }

    function isolateDirtyDisplayProperties(config) {
        if (config && config.Zoom) {
            delete config.Zoom;
            return true; // config changed
        }
    }

    // Generate custom configuration settings when opening ad hoc display from a trend symbol
    function switchSymbolConfig(symbol) {
        var newConfig = {};
        ['Title', 'BackgroundColor', 'MarkerStyle', 'MultipleScales', 'OutsideScales', 'NowPosition', 'TextColor',
            'Description', 'TimeScaleType', 'TraceSettings', 'TrendConfig', 'ValueScaleSetting'
        ].forEach(function(property) {
            if (symbol.Configuration.hasOwnProperty(property)) {
                newConfig[property] = angular.copy(symbol.Configuration[property]);
            }
        });

        return newConfig;
    }

    // Called by adhoc service to get DisplayUOMs for datasources being added to
    // adhoc workspace or opened in popup trend
    function getDisplayUOMForDatasource(config, index) {
        return config.TraceSettings && config.TraceSettings[index] && config.TraceSettings[index].DisplayUOM;
    }

    var def = {
        visObjectType: trendVis,
        typeName: 'RadixTrend',
        displayName: 'New Trend | Check',
        datasourceBehavior: PV.Extensibility.Enums.DatasourceBehaviors.Multiple,
        iconUrl: "/Scripts/app/editor/symbols/ext/icons/cmp_trendcheck.png",
        loadConfig: loadConfig,
        getDefaultConfig: getDefaultConfig,
        themes: {
            reverse: {
                TextColor: 'black',
                BackgroundColor: '#f0f0f0'
            }
        },
        switchSymbolConfig: switchSymbolConfig,
        isolateDirtyDisplayProperties: isolateDirtyDisplayProperties,
        traceDataMarker: traceDataMarker,
        templateUrl: 'scripts/app/editor/symbols/sym-trend-template.html',
        inject: ['$rootScope', 'appData', 'dateTimeFormatter', 'timeProvider', 'trendZoomService'],
        noExpandSelector: '.trend-gesture-root',
        supportsCollections: true,
        largeSelector: true,
        configTemplateUrl: 'scripts/app/editor/symbols/sym-trend-config.html',
        configOptions: PV.TrendConfig.contextMenuOptions,
        contextMenuClose: PV.TrendConfig.contextMenuClose,
        configInit: PV.TrendConfig.init,
        configure: PV.TrendConfig.configure,
        dataSourcesAdded: PV.TrendConfig.configure.addTraces,
        selectSymbolDefaultsFromConfig: PV.TrendConfig.configure.selectSymbolDefaultsFromConfig,
        getDisplayUOMForDatasource: getDisplayUOMForDatasource,
        symbolDefaultsNestedConfig: true,
        doubleClickLinks: true,
    };

    PV.symbolCatalog.register(def);

})(window.PIVisualization);