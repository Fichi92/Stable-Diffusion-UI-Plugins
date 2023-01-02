/*
    Restore Image Modifiers
    by Patrice

    Restores the image modifier cards upon reloading the page. VErsion 1.1 loads much faster, improved reliability. Requires Easy Diffusion 2.5.2 or later.
*/
(function () {
    "use strict"

    // save image modifiers upon update
    document.addEventListener("refreshImageModifiers", function(e) {
        localStorage.setItem('image_modifiers', JSON.stringify(activeTags))
        return true
    })

    // reload image modifiers at start
    document.addEventListener("loadImageModifiers", function(e) {
        let savedTags = JSON.parse(localStorage.getItem('image_modifiers'))
        let active_tags = savedTags == null ? [] : savedTags.map(x => x.name)
        
        // reload image modifiers
        refreshModifiersState(active_tags)
        
        // update inactive tags
        const inactiveTags = savedTags.filter(tag => tag.inactive === true).map(x => x.name)
        refreshInactiveTags(inactiveTags)
        
        return true
    })
})()
