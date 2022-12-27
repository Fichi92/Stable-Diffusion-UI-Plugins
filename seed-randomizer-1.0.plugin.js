/*
    Seed randomizer
    by Patrice

    Adds a new system setting to randomize the seed by image rather than by task. E.g. to run "A pug wearing a {reb, blue, green} hat" as 3 tasks with different seeds.
    Please note that running the same batch a second time will NOT recreate the same image(s) since the seed is randomized on the fly.
*/
(function() {
    "use strict"

    /* inject new settings in the existing system settings popup table */
    let settings = [
        {
            id: "seed_randomizer_behavior",
            type: ParameterType.select,
            label: "Random seed behavior",
            note: "How the seed shall be randomized<br/><br/><b>Per batch:</b> Single seed per batch (deterministic)<br/><b>Per image:</b> New seed for each image (non-deterministic)",
            default: "batch",
            options: [
                {
                    value: "batch",
                    label: "Per batch (default)"
                },
                {
                    value: "image",
                    label: "Per image"
                }
            ],
            icon: "fa-dice"
        }
    ];

    function injectParameters(parameters) {
        parameters.forEach(parameter => {
            var element = getParameterElement(parameter)
            var note = parameter.note ? `<small>${parameter.note}</small>` : "";
            var icon = parameter.icon ? `<i class="fa ${parameter.icon}"></i>` : "";
            var newRow = document.createElement('div')
            newRow.innerHTML = `
                <div>${icon}</div>
                <div><label for="${parameter.id}">${parameter.label}</label>${note}</div>
                <div>${element}</div>`
            //parametersTable.appendChild(newRow)
            parametersTable.insertBefore(newRow, parametersTable.children[13])
            parameter.settingsEntry = newRow
        })
    }
    injectParameters(settings)
    let seedRandomizerBehavior = document.querySelector("#seed_randomizer_behavior")

    // save/restore the desired method
    seedRandomizerBehavior.addEventListener('change', (e) => {
        localStorage.setItem('seed_randomizer_behavior', seedRandomizerBehavior.value)
    })
    seedRandomizerBehavior.value = localStorage.getItem('seed_randomizer_behavior') == null ? 'batch' : localStorage.getItem('seed_randomizer_behavior')

    PLUGINS['TASK_CREATE'].push(async function (event) {
        // replace seed on a per-task basis as needed
        if (randomSeedField.checked) {
            switch (seedRandomizerBehavior.value) {
                case 'image':
                    event.reqBody.seed = Math.floor(Math.random() * 10000000)
                    break;
                default:
                    // Nothing to do. Just stick to current seed behavior.
            }
        }
    })
})()
