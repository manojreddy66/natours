
export const displayMap=locations=>{
    mapboxgl.accessToken = 'pk.eyJ1IjoibWFub2o2NiIsImEiOiJja3NlbjV1bTUxMmQ4Mm9vZGVxcmgxdzl3In0.OrP3GhKPcvz57wI96rgkDA';
    var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/manoj66/cksent4ov21m718nvd5pkx6ur',
    scrollZoom:false
    //center:[-118.2437,34.0522,]
    });
    
    const bounds=new mapboxgl.LngLatBounds();
    
    locations.forEach(location=> {
        const el=document.createElement('div');
        el.className='marker';
    
        new mapboxgl.Marker({
            element:el,
            anchor:'bottom'
        }).setLngLat(location.coordinates).addTo(map);
    
    
        new mapboxgl.Popup({offset:30}).setLngLat(location.coordinates).setHTML(`<p>Day${location.day}:${location.description} </p>`).addTo(map);
    
        bounds.extend(location.coordinates);
    });
    
    
    
    
    map.fitBounds(bounds,{
        padding:{
            top:200,
        bottom:150,
        left:100,
        right:100
        }
    });
    
}

