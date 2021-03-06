﻿
//-----------------------------------------------------------------------
// Copyright (c) 2017 Nikolay Belykh unmanagedvisio.com All rights reserved.
// Nikolay Belykh, nbelyh@gmail.com
//-----------------------------------------------------------------------

/*global jQuery, $, Mustache */

$(document).ready(function () {

    var diagram = window.svgpublish || {};

    var haveSvgfilters = SVGFEColorMatrixElement && SVGFEColorMatrixElement.SVG_FECOLORMATRIX_TYPE_SATURATE === 2;

    if (!diagram.shapes)
        return;
    
    $("#shape-links").show();

    function buildLinkTargetLocation(link) {

        if (link.Address)
            return link.Address;

        var linkPageId = link.PageId;
        if (linkPageId >= 0 && diagram.pages) {
            var targetPage = diagram.pages.filter(function (p) { return p.Id === linkPageId })[0];
            var curpath = location.pathname;
            var newpath = curpath.replace(curpath.substring(curpath.lastIndexOf('/') + 1), targetPage.FileName);
            var href = document.location.origin + newpath;

            if (link.ShapeId) {
                href += "#?shape=" + link.ShapeId;
            }

            return href;
        }

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
