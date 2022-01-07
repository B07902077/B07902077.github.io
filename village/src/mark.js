function getMousePos(event) {
    var e = event || window.event;
    return [e.clientX,e.clientY];
}

let markVectorSource = new ol.source.Vector();
let markVectorLayer = new ol.layer.Vector({
    source: markVectorSource
});

class mapMark{
    constructor(coordinate, year, scale){
        this.scale=scale;
        this.pos=coordinate;
        this.year=year;
        this.iconFeature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat(coordinate)),
        });
        this.shown=1;
        this.hover=0;
    }
    create(){
        var iconStyle = new ol.style.Style({
            image: new ol.style.Icon(/** @type {olx.style.IconOptions} **/({
                anchor:[0.5,0.5],
                src: 'src/icon.png',
                img: undefined,
                scale: 0.03
            }))
        });
        this.iconFeature.setStyle(iconStyle);
        markVectorSource.addFeature(this.iconFeature);
        map.removeLayer(markVectorLayer);
        map.addLayer(markVectorLayer);
        this.shown=1;
    }
    delete(){
        markVectorSource.removeFeature(this.iconFeature);
        map.removeLayer(markVectorLayer);
        map.addLayer(markVectorLayer);
        this.shown=0;
    }
    addEvtClick(callback){
        var selectClick = new ol.interaction.Select({
            condition: ol.events.condition.click
        });
        if (selectClick !== null) {
            map.addInteraction(selectClick);
            selectClick.on('select', function(e) {
                var iconSelect = e.target;
                var iconCollection = iconSelect.getFeatures();
                var iconFeatures = iconCollection.getArray();
                // console.log("iconFeatures[0]", iconFeatures[0]);
                if(iconFeatures.length > 0){
                    callback(iconFeatures[0].getGeometry().getCoordinates());
                }
            });
        }
    }
}
