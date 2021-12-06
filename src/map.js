/**
 * Created by Epulari T on 3/16/2017.
 */

/** set map
 * para
 * var gotomap = new classGotoMap({
        mapTarget: 'map',
        mapSouce: new ol.source.OSM(),
        mapCenter: [0, 0],
        mapZoom: 2
    });
 */
var map;/* = new ol.Map({
    target: 'map',
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      })
    ],
    view: new ol.View({
      center: ol.proj.fromLonLat([120.6718112, 23.7502971]),
      zoom: 8
    })
  });*/
var classGotoMap = function (mapOptions) {
    var mapSettiings = $.extend({
        mapTarget: 'map',
        mapSouce: new ol.source.OSM(),
        mapCenter: [0, 0],
        mapZoom: 2
    }, mapOptions);

    var accessibleSource = mapSettiings.mapSouce;
    var accessibleLayers = [
        new ol.layer.Tile({
            source: accessibleSource
        })
    ];
    var accessibleView = new ol.View({
        center: mapSettiings.mapCenter,
        zoom: mapSettiings.mapZoom
    });
    var themap = new ol.Map({
        layers: accessibleLayers,
        target: mapSettiings.mapTarget,
        view: new ol.View({
            center: ol.proj.fromLonLat([121.2, 24.85]),
            zoom: 10
          })
    });
    map = themap;
};
