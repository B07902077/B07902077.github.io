function getMousePos(event) {
    var e = event || window.event;
    return [e.clientX,e.clientY];
}
class mapMark{
    constructor(coordinate, year, scale){
        this.scale=scale;
        this.pos=coordinate;
        this.year=year;
        this.markVectorSource = new ol.source.Vector();
        this.markVectorLayer = new ol.layer.Vector({
            source: this.markVectorSource
        });
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
                src: 'village_src/icon.png',
                img: undefined,
                scale: 0.03
            }))
        });
        this.iconFeature.setStyle(iconStyle);
        this.markVectorSource.addFeature(this.iconFeature);
        this.markVectorSource.addFeature(new ol.Feature({
            geometry:new ol.geom.Circle(ol.proj.fromLonLat(this.pos),100)
        }));
        map.removeLayer(this.markVectorLayer);
        map.addLayer(this.markVectorLayer);
        this.shown=1;
    }
    delete(){
        this.markVectorSource.removeFeature(this.iconFeature);
        map.removeLayer(this.markVectorLayer); 
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
