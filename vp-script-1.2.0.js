//-----------------------------------------------------------------------
// Copyright (c) 2017 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

$(document).ready(function () {

    var diagram = window.svgpublish || {};
    
    if (!diagram.layers || !diagram.enableLayers)
        return;

    $("#shape-layers").show();

    function setLayerVisible(layerName, set) {

        var layer = diagram.layers.filter(function (item) { return item.Name === layerName; })[0];
        if (!layer)
            return;

        var layerIndex = parseInt(layer.Index);
        $.each(diagram.shapes, function (shapeId, shape) {

            if (!shape.Layers || shape.Layers.indexOf(layerIndex) < 0)
                return;

            var $shape = $("#" + shapeId);
            if (set)
                $shape.show();
            else
                $shape.hide();
        });
    }

    diagram.setLayerVisible = function (layerName, set) {
        if (diagram.isLayerVisible(layerName) === set)
            return;

        $("#panel-layers")
            .find("input[data-layer='" + layerName + "']")
            .bootstrapSwitch('state', set);
    }

    var $table = $("<table class='table borderless' />");

    $.each(diagram.layers, function (i, layer) {

        var $check = $("<input type='checkbox' data-layer='" + layer.Name + "' checked><span style='margin-left:1em'>" + layer.Name + "</span></input>");

        $check.on("change.bootstrapSwitch", function (e) {
            var name = $(e.target).data("layer");
            setLayerVisible(name, !diagram.isLayerVisible(name));
        });

        $table
            .append($("<tr>")
            .append($("<td>")
            .append($check)));
    });

    $("#panel-layers").html($table);

    $("#panel-layers").find("input")
        .bootstrapSwitch({ size: "small", labelWidth: 0 });

    diagram.isLayerVisible = function (layerName) {
        return !!$("#panel-layers")
            .find("input[data-layer='" + layerName + "']")
            .bootstrapSwitch('state');
    }

});


//-----------------------------------------------------------------------
// Copyright (c) 2017 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

$(document).ready(function () {

    var diagram = window.svgpublish || {};

    var haveSvgfilters = SVGFEColorMatrixElement && SVGFEColorMatrixElement.SVG_FECOLORMATRIX_TYPE_SATURATE === 2;

    if (!diagram.shapes)
        return;
    
    $("#shape-links").show();

    function buildLinkTargetLocation(link) {

        if (link.Address)
            return link.Address;

        if (link.PageId >= 0 && diagram.pages)
            return document.location.href.replace("__" +diagram.currentPage.Id, "__" + link.PageId);

        return "#";
    }
    
    function buildLinkText(link) {

        if (link.Description)
            return link.Description;

        if (link.SubAddress) {
            return link.Address
                ? link.Address + '[' + link.SubAddress + ']'
                : link.SubAddress;
        }

        return link.Address;
    }

    function showShapeLinks(shapeId) {
        
        var shape = diagram.shapes[shapeId];

        var $html = $('<span>No Links</span>');
        
        if (shape) {

            $html = $("<table class='table borderless' />");

            var $tbody = $html.append($('<tbody />'));

            $.each(shape.Links, function (linkId, link) {

                var href = buildLinkTargetLocation(link);
                var text = buildLinkText(link);

                var $a = $("<a />")
                    .attr("href", href)
                    .text(text);

                if (link.Address && diagram.openHyperlinksInNewWindow)
                    $a.attr("target", "_blank");

                $tbody.append($('<tr />')
                    .append($("<td />")
                    .append($a)));
            });
        }

        $("#panel-links").html($html);
    }

    if (diagram.enableLinks)
        diagram.selectionChanged.add(showShapeLinks);

    if (!diagram.enableFollowHyperlinks)
        return;

    $.each(diagram.shapes, function (shapeId) {

        var $shape = $("#" + shapeId);

        $shape.css("cursor", 'pointer');

        $shape.on('click', function (evt) {
            evt.stopPropagation();

            if (evt && evt.ctrlKey)
                return;

            var thisId = $(this).attr('id');
            var shape = diagram.shapes[thisId];

            if (shape.DefaultLink) {

                var defaultlink = shape.Links[shape.DefaultLink - 1];
                var defaultHref = buildLinkTargetLocation(defaultlink);

                if (defaultHref) {

                    if (defaultlink.Address && diagram.openHyperlinksInNewWindow || evt.shiftKey)
                        window.open(defaultHref, "_blank");
                    else
                        document.location = defaultHref;
                }
                    
            }
        });

        // hover support
        if (haveSvgfilters) {
            $shape.on('mouseover', function () {
                var thisId = $(this).attr('id');
                if (diagram.shapes[thisId].DefaultLink)
                    $(this).attr('filter', 'url(#hyperlink)');
            });
            $shape.on('mouseout', function () {
                var thisId = $(this).attr('id');
                if (diagram.shapes[thisId].DefaultLink)
                    $(this).removeAttr('filter');
            });
        }
    });

});


//-----------------------------------------------------------------------
// Copyright (c) 2017 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

$(document).ready(function () {

    var diagram = window.svgpublish || {};
    
    if (!diagram.pages || !diagram.enablePages)
        return;

    $("#shape-pages").show();

    function filter(term) {
        var $ul = $('<ul class="nav nav-stacked nav-pills"/>');

        $.each(diagram.pages, function (index, page) {

            var re = new RegExp("(" + term.replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1") + ")", 'gi');

            if (term && !re.test(page.Name))
                return;

            var href = document.location.href.replace("__" + diagram.currentPage.Id, "__" + page.Id);
            var text = term ? page.Name.replace(re, "<span class='search-hilight'>$1</span>") : page.Name;

            var $a = $("<a />")
                .attr("href", href)
                .html(text);

            var $li = $('<li />');

            if (page.Id === diagram.currentPage.Id)
                $li.addClass('active');

            $li.append($a).appendTo($ul);
        });

        $("#panel-pages").html($ul);
    }

    filter('');

    $("#search-page").on("keyup", function () {

        filter($("#search-page").val());
        return false;
    });
});


//-----------------------------------------------------------------------
// Copyright (c) 2017 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

$(document).ready(function () {

    var diagram = window.svgpublish || {};
    
    if (!diagram.shapes || !diagram.enableProps)
        return;
    
    $("#shape-props").show();

    function showShapeProperties(thisShapeId) {

        var shape = diagram.shapes[thisShapeId];

        var $html = $('<span>No Shape Data</span>');

        if (shape) {

            $html = $("<table class='table table-bordered table-striped' />");

            var $thead = $html.append($('<thead />'));
            var $tbody = $html.append($('<tbody />'));

            $thead.append($('<tr />')
                .append($('<th />').text('Property'))
                .append($('<th />').text('Value'))
            );

            $.each(shape.Props, function(propName, propValue) {

                if (propValue == null)
                    propValue = "";

                $tbody.append($('<tr />')
                    .append($("<td />").text(propName))
                    .append($("<td />").text(propValue))
                );
            });
        }

        $("#panel-props").html($html);
    }

    diagram.selectionChanged.add(showShapeProperties);
});


//-----------------------------------------------------------------------
// Copyright (c) 2017 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

$(document).ready(function () {

    var diagram = window.svgpublish || {};
    
    if (!diagram.shapes || !diagram.enableSearch)
        return;

    $("#shape-search").show();

    var baseLocation = document.location.protocol + '//' + document.location.host + document.location.pathname;

    function processPage(term, pageId, $ul, external) {
        $.each(diagram.searchIndex[pageId], function (shapeId, searchText) {

            var re = new RegExp("(" + term.replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1") + ")", 'gi');

            if (!re.test(searchText))
                return;

            var $li = $('<li />');

            var a = '';
            a += '<a>';

            if (external) {
                var page = diagram.pages.filter(function (p) {
                    return p.Id == pageId;
                })[0];


                a += '<div class="text-muted small">';
                a += '(page ' + page.Name + ')';
                a += '</div>';
            }

            a += '<div>';
            a += searchText.replace(re, "<span class='search-hilight'>$1</span>");
            a += '</div>';

            a += '</a>';

            var $a = $(a);

            var pageUrl = external
                ? baseLocation.replace("__" + diagram.currentPage.Id, "__" + pageId)
                : baseLocation;

            var targetUrl = pageUrl + "#?shape=" + shapeId + "&term=" + encodeURIComponent(term);
            $a.attr('href', targetUrl);

            $li.append($a);

            $li.appendTo($ul);
        });
    }

    function search(term) {
        var $html = $("<div />");

        if (!term.length) {
            
        }
        else if (term.length < 2) {
            var $hint = $('<p class="text-muted">Please enter more than one character to search</p>');
            $html.append("<hr/>");
            $html.append($hint);
        } else {
            var $ul = $('<ul class="nav nav-stacked nav-pills"/>');

            $html.append("<hr/>");
            $html.append("<p>Results for <strong>" + term + "</strong>:</p>");
            $html.append($ul);

            var currentPageId = diagram.currentPage.Id;

            processPage(term, currentPageId, $ul);

            $.each(diagram.searchIndex, function(pageId) {
                if (pageId != currentPageId)
                    processPage(term, pageId, $ul, true);
            });
        }

        $("#panel-search-results")
            .html($html);
    }

    $("#search-term").on("keyup", function () {

        search($("#search-term").val());
        return false;
    });

    function getUrlParameter(name) {
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.hash);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };

    var term = getUrlParameter('term');
    if (term) {
        $('#search-term').val(term);
        search(term);
    }
});


//-----------------------------------------------------------------------
// Copyright (c) 2017 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

(function (diagram) {
    diagram.selectionChanged = $.Callbacks();
})(window.svgpublish);

$(document).ready(function () {

    var diagram = window.svgpublish;

    var haveSvgfilters = SVGFEColorMatrixElement && SVGFEColorMatrixElement.SVG_FECOLORMATRIX_TYPE_SATURATE === 2;

    if (!diagram.shapes || !diagram.enableSelection)
        return;

    diagram.setSelection = function(shapeId) {
        
        if (diagram.selectedShapeId && diagram.selectedShapeId !== shapeId) {

            if (haveSvgfilters)
                $("#" + diagram.selectedShapeId).removeAttr('filter');
            else
                $("#" + diagram.selectedShapeId).css('opacity', 1);

            delete diagram.selectedShapeId;
        }

        if (!diagram.selectedShapeId || diagram.selectedShapeId !== shapeId) {

            diagram.selectedShapeId = shapeId;
            diagram.selectionChanged.fire(shapeId);

            if (haveSvgfilters)
                $("#" + shapeId).attr('filter', 'url(#select)');
            else
                $("#" + shapeId).css('opacity', '0.5');
        }
    }

    $("div.svg").on('click', function () {
     	diagram.setSelection();
   	});

    $.each(diagram.shapes, function (shapeId) {

        var $shape = $("#" + shapeId);

        $shape.css("cursor", 'pointer');

        $shape.on('click', function (evt) {
            evt.stopPropagation();
            var thisId = $(this).attr('id');
            diagram.setSelection(thisId);
        });

        // hover support
        if (haveSvgfilters) {
            $shape.on('mouseover', function () {
                var thisId = $(this).attr('id');
                if (diagram.selectedShapeId !== thisId && !diagram.shapes[thisId].DefaultLink)
                    $(this).attr('filter', 'url(#hover)');
            });
            $shape.on('mouseout', function () {
                var thisId = $(this).attr('id');
                if (diagram.selectedShapeId !== thisId && !diagram.shapes[thisId].DefaultLink)
                    $(this).removeAttr('filter');
            });
        }
    });

    function getUrlParameter(name) {
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.hash);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };

    diagram.highlightShape = function (shapeId) {
        $("#" + shapeId).fadeTo(300, 0.3).fadeTo(300, 1).fadeTo(300, 0.3).fadeTo(300, 1);
        diagram.setSelection(shapeId);
    }

    function processHash() {
        var shape = getUrlParameter('shape');
        if (shape) {
            diagram.highlightShape(shape);
        }
    }

    processHash();
    $(window).on('hashchange', processHash);
});


//-----------------------------------------------------------------------
// Copyright (c) 2017 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

$(document).ready(function () {

    var diagram = window.svgpublish || {};

    if (!diagram.enableSidebar)
        return;

    var right = diagram.rightSidebar;
    
    $("body").addClass(right ? "vp-sidebar-right" : "vp-sidebar-left");

    var sidebarWidth = 400;

    $("#sidebar-toggle").on("dragstart", function () {
        return false;
    });

    var storage;
    try { storage = window.localStorage; } catch (e) { }

    var defaultWidth = storage ? parseInt(storage.getItem("DiagramSidebarWidth")) : 0;
    if (defaultWidth > 0)
        sidebarWidth = defaultWidth;

    var maxWidth = $(window).width() - $("#sidebar-toggle").width() - 40;
    if (sidebarWidth >= maxWidth)
        sidebarWidth = maxWidth;

    var showSidebarSetting = storage ? storage.getItem("DiagramSidebarVisible") == '1' : 0;

    $("#sidebar-toggle").show();

    if (isSidebarEnabled()) {
        showSidebar(showSidebarSetting, 0);
    }

    var dragWidth;
    var dragClientX;

    var fnMouseMove = function (mouseMoveEvt) {
        if (dragClientX) {
            var width = dragWidth + (right ? -1 : 1) * (mouseMoveEvt.clientX - dragClientX);

            if (width < 0)
                width = 0;

            $("#diagram-sidebar").width(width + 'px').show();
            $("#sidebar-toggle").css(right ? "right" : "left", width + 'px');
        }
    };

    var fnMouseUp = function (mouseUpEvt) {

        $("iframe").css("pointer-events", "auto");

        $(document).off('mousemove', fnMouseMove);
        $(document).off('mouseup', fnMouseUp);

        var width = (right ? -1 : 1) * (mouseUpEvt.clientX - dragClientX) + dragWidth;

        if (width < 0)
            width = 0;

        if (Math.abs(mouseUpEvt.clientX - dragClientX) < 20) {
            showSidebar(width < 20, 400);
        } else {
            sidebarWidth = width;
            showSidebar(true, 0);
        }

        dragClientX = null;
    };

    $("#sidebar-toggle").on("mousedown", function (moseDownEvt) {

        if (moseDownEvt.button !== 0)
            return;

        $("iframe").css("pointer-events", "none");

        dragClientX = moseDownEvt.clientX;
        dragWidth = $("#diagram-sidebar").width();

        $(document)
            .on('mousemove', fnMouseMove)
            .on('mouseup', fnMouseUp);
    });

    function isSidebarEnabled() {
        return maxWidth > 600;
    }

    function showSidebar(show, animationTime) {

        if (show) {
            $("#diagram-sidebar")
			.show()
			.animate({
			    width: (sidebarWidth) + 'px',
			}, animationTime, function() {
                if (window.editor && window.editor.layout)
                    window.editor.layout();
                    if (diagram.enableSidebarHtml)
                        showSidebarHtml();
                });

            $("#sidebar-toggle")
			.addClass("rotated")
			.animate(
            right ? { right: (sidebarWidth - 2) + 'px' } : { left: (sidebarWidth - 2) + 'px' },
            animationTime);
        } else {
            $("#diagram-sidebar").animate({
                width: "0"
            }, animationTime, function () {
                $("#diagram-sidebar").hide();
            });

            $("#sidebar-toggle")
			.removeClass("rotated")
			.animate(
            right ? { right: "0" } : { left: "0" },
            animationTime);
        }

        if (isSidebarEnabled() && storage) {
            storage.setItem("DiagramSidebarVisible", show ? '1' : '0');
            storage.setItem("DiagramSidebarWidth", sidebarWidth);
        }
    }

    diagram.showSidebar = showSidebar;

    function showSidebarHtml(thisShapeId) {

        var shape = thisShapeId ? diagram.shapes[thisShapeId] : {};
        var $html = Mustache.render($('#sidebar-template').html(), shape);
        $("#sidebar-html").html($html);
    }

    if (diagram.enableSidebarHtml)
        diagram.selectionChanged.add(showSidebarHtml);
});


//-----------------------------------------------------------------------
// Copyright (c) 2017 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

(function ($) {

    $.fn.extend({
        panzoom: function (svg) {
            return this.each(function () { PanZoom(this, svg); });
        }
    });

    var PanZoom = function (elem, options) {

        var enableZoom = 1; // 1 or 0: enable or disable zooming (default enabled)
        var zoomScale = 0.5; // Zoom sensitivity
        var panDelta = 3; // start pan on move

        var state = null;
        var stateOriginSvg = null;
        var stateOriginClient = null;
        var stateTf = null;
        var stateDiff = null;

        var onViewChanged = null;

        var svg = options.svg;
        var viewBox = options.viewBox;

        initCTM();

        if (!$.contains(document, svg))
            svg = $(elem).html(svg).find("svg").get(0);

        // bug workaround for IE getBoundingClientRect, see
        // https://connect.microsoft.com/IE/feedback/details/938382/svg-getboundingboxrect-returns-invalid-rectangle-top-and-height-are-invalid
        // 
        if (navigator.userAgent.match(/trident|edge/i)) {

            SVGElement.prototype.getBoundingClientRect = function () {

                var svgPoint1 = svg.createSVGPoint();

                var bbox = this.getBBox();
                var m = this.getScreenCTM();

                svgPoint1.x = bbox.x;
                svgPoint1.y = bbox.y;

                var pt1 = svgPoint1.matrixTransform(m);

                var svgPoint2 = svg.createSVGPoint();

                svgPoint2.x = bbox.x + bbox.width;
                svgPoint2.y = bbox.y + bbox.height;

                var pt2 = svgPoint2.matrixTransform(m);

                return {
                    left: pt1.x,
                    top: pt1.y,
                    right: pt2.x,
                    bottom: pt2.y,
                    width: pt2.x - pt1.x,
                    height: pt2.y - pt1.y
                };
            }
        }

        $(elem)
            .on("mousedown", handleMouseDown)
            .on("mousemove", handleMouseMove)
            .on("touchstart", handleTouchStart)
            .on("touchmove", handleMouseMove);

        $(elem).get(0).addEventListener('click', handleClick, true);

        if (navigator.userAgent.toLowerCase().indexOf('firefox') >= 0)
            $(elem).on('DOMMouseScroll', handleMouseWheel); // Firefox
        else
            $(elem).on('mousewheel', handleMouseWheel); // Chrome/Safari/Opera/IE

        return {
            zoomIn: function () {
                zoom(Math.pow(1 + zoomScale, +1));
            },
            zoomOut: function () {
                zoom(Math.pow(1 + zoomScale, -1));
            },
            zoomReset: function () {
                initCTM();
            },
            onViewChanged: function (handler) {
                onViewChanged = handler;
            }
        };

        function fitInBox(width, height, maxWidth, maxHeight) {

            var aspect = width / height;

            if (width > maxWidth || height < maxHeight) {
                width = maxWidth;
                height = Math.floor(width / aspect);
            }

            if (height > maxHeight || width < maxWidth) {
                height = maxHeight;
                width = Math.floor(height * aspect);
            }

            return {
                width: width,
                height: height
            };
        }

        function getViewPort() {
            return $(elem).find("#viewport").get(0);
        }

        function initCTM() {

            if (!viewBox)
                return;

            var bbox = viewBox.split(' ');

            var width = parseFloat(bbox[2]);
            var height = parseFloat(bbox[3]);

            var maxWidth = $(elem).width();
            var maxHeight = $(elem).height();

            if (typeof (svg.createSVGMatrix) != 'function')
                return;

            var m = svg.createSVGMatrix();

            var sz = fitInBox(width, height, maxWidth, maxHeight);

            if (sz.width < maxWidth)
                m = m.translate((maxWidth - sz.width) / 2, 0);

            if (sz.height < maxHeight)
                m = m.translate(0, (maxHeight - sz.height) / 2, 0);

            m = m.scale(sz.width / width);

            var viewPort = $(svg).find("#viewport").get(0);
            setCTM(viewPort, m);
        }

        function getEventClientPoint(evt) {

            var touches = evt.originalEvent.touches;

            if (touches && touches.length === 2) {

                var pt1 = makeClientPoint(touches[0].pageX, touches[0].pageY);
                var pt2 = makeClientPoint(touches[1].pageX, touches[1].pageY);

                return makeClientPoint((pt1.pageX + pt2.pageX) / 2, (pt1.pageY + pt2.pageY) / 2);
                
            } else {
                var realEvt = evt.originalEvent
                    ? evt.originalEvent.touches
                        ? evt.originalEvent.touches[0]
                        : evt.originalEvent
                    : evt;

                return makeClientPoint(realEvt.pageX, realEvt.pageY);
            }
        }

        /*
            Instance an SVGPoint object with given coordinates.
        */
        function getSvgClientPoint(clientPoint) {

            var p = svg.createSVGPoint();

            p.x = clientPoint.pageX - $(elem).offset().left;
            p.y = clientPoint.pageY - $(elem).offset().top;

            return p;
        }

        /*
            get center zoom point
        */

        function getDefaultPoint() {

            var p = svg.createSVGPoint();

            p.x = $(elem).width() / 2;
            p.y = $(elem).height() / 2;

            return p;
        }

        /*
            Sets the current transform matrix of an element.
        */

        function setCTM(element, matrix) {

            var s = "matrix(" + matrix.a + "," + matrix.b + "," + matrix.c + "," + matrix.d + "," + matrix.e + "," + matrix.f + ")";

            element.setAttribute("transform", s);

            // BUG with SVG arrow rendering in complex files in IE10, IE11
            if (navigator.userAgent.match(/trident|edge/i)) {

                if (typeof (svg.style.strokeMiterlimit) !== 'undefined') {

                    if (svg.style.strokeMiterlimit !== "3")
                        svg.style.strokeMiterlimit = "3";
                    else
                        svg.style.strokeMiterlimit = "2";
                }
            }

            if (onViewChanged)
                onViewChanged(elem);
        }

        /*
            zoom in or out on mouse wheel
        */

        function handleMouseWheel(evt) {

            if (!enableZoom)
                return;

            var diagram = window.svgpublish;

            if (diagram && diagram.enableZoomCtrl && !evt.ctrlKey)
                return;
            if (diagram && diagram.enableZoomShift && !evt.shiftKey)
                return;

            if (evt.preventDefault)
                evt.preventDefault();

            evt.returnValue = false;

            var delta;

            if (evt.originalEvent.wheelDelta)
                delta = evt.originalEvent.wheelDelta / 360; // Chrome/Safari
            else
                delta = evt.originalEvent.detail / -9; // Mozilla

            var z = Math.pow(1 + zoomScale, delta);

            zoom(z, evt);
        }

        /*
            zoom with given aspect at given (client) point
        */

        function zoom(z, evt) {

            var evtPt = evt
                ? getSvgClientPoint(getEventClientPoint(evt))
                : getDefaultPoint();

            var viewPort = getViewPort();

            var p = evtPt.matrixTransform(viewPort.getCTM().inverse());

            // Compute new scale matrix in current mouse position
            var k = svg.createSVGMatrix().translate(p.x, p.y).scale(z).translate(-p.x, -p.y);

            setCTM(viewPort, viewPort.getCTM().multiply(k));

            if (stateTf == null)
                stateTf = viewPort.getCTM().inverse();

            stateTf = stateTf.multiply(k.inverse());
        }

        /*
        
        */

        function makeClientPoint(pageX, pageY) {
            return { pageX: pageX, pageY: pageY };
        }

        /*
            compute geometric distance between points
        */

        function diff(pt1, pt2) {
            var dx = (pt1.pageX - pt2.pageX);
            var dy = (pt1.pageY - pt2.pageY);
            return Math.sqrt(dx * dx + dy * dy);
        }

        /*
             continue pan (one touch or mouse) or pinch (with two touches)
        */

        function handleMouseMove(evt) {

            if (!state)
                return;

            if (evt.preventDefault)
                evt.preventDefault();

            evt.returnValue = false;

            var clientPt = getEventClientPoint(evt);

            if (state === 'pinch') {

                var touches = evt.originalEvent.touches;
                if (touches && touches.length === 2) {

                    var pt1 = makeClientPoint(touches[0].pageX, touches[0].pageY);
                    var pt2 = makeClientPoint(touches[1].pageX, touches[1].pageY);

                    var currentDiff = diff(pt1, pt2);

                    zoom(currentDiff / stateDiff, evt);

                    stateDiff = currentDiff;

                    var pp = getSvgClientPoint(clientPt).matrixTransform(stateTf);
                    setCTM(getViewPort(), stateTf.inverse().translate(pp.x - stateOriginSvg.x, pp.y - stateOriginSvg.y));
                }
            }

            if (state === 'down') {
              
                if (diff(clientPt, stateOriginClient) > panDelta)
                    state = 'pan';
            }

            if (state === 'pan') {
                var sp = getSvgClientPoint(clientPt).matrixTransform(stateTf);
                setCTM(getViewPort(), stateTf.inverse().translate(sp.x - stateOriginSvg.x, sp.y - stateOriginSvg.y));
            }
        }

        /*
            start pan (one touch or mouse) or pinch (with two touches)
        */

        function handleMouseDown(evt) {

            if (evt.which !== 1)
                return false;

            // prevent selection on double-click
            if (evt.preventDefault)
                evt.preventDefault();

            return handleTouchStart(evt);
        }

        function handleTouchStart(evt) {

            var touches = evt.originalEvent.touches;

            if (touches && touches.length === 2) {

                var pt1 = makeClientPoint(touches[0].pageX, touches[0].pageY);
                var pt2 = makeClientPoint(touches[1].pageX, touches[1].pageY);

                stateDiff = diff(pt1, pt2);

                state = 'pinch';

            } else {

                var diagram = window.svgpublish;
                if (diagram && diagram.twoFingersTouch && touches) {
                    state = null;
                    return;
                }

                state = 'down';
            }

            stateTf = getViewPort().getCTM().inverse();
            stateOriginClient =  getEventClientPoint(evt);
            stateOriginSvg = getSvgClientPoint(stateOriginClient).matrixTransform(stateTf);
        }

        /*
            reset state on mouse up
        */

        function handleClick(evt) {

            // prevent firing 'click' event in case we pan or zoom
            if (state === 'pan' || state === 'pinch') {

                if (evt.stopPropagation)
                    evt.stopPropagation();
            }

            state = null;
        }
    };

})(jQuery);


//-----------------------------------------------------------------------
// Copyright (c) 2017 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

$(document).ready(function () {

    var diagram = window.svgpublish || {};
    
    if (!diagram.shapes || !diagram.enableTooltips) {
        return;
    }

    $.each(diagram.shapes, function (shapeId, shape) {

        if (!shape.Comment)
            return;

        var $shape = $("#" + shapeId);

        $shape.tooltip({
            container: "body",
            title: shape.Comment
        });
    });
});