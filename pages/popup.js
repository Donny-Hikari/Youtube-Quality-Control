//
// Youtube Quality Control
// By Donny
// Donny (c) 2020
//

const allPossibleQualities = ["best", "4320p", "2160p", "1440p", "1080p", "720p", "480p", "360p", "240p", "144p"]
const allPossiblePlaybackSpeed = ['0.25', '0.5', '0.75', '1.0', '1.25', '1.5', '1.75', '2']

const storage = chrome.storage.sync

let options = {
    'currentQuality': 'best',
    'currentSpeed': '1.0',
    'notPremium': true,
    'skipAd': true,
    'swapColumns': false,
    'normalSpeedShortcut': true,
}

storage.get(['quality', 'skipAd', 'swapColumns', 'notPremium', 'playbackSpeed', 'normalSpeedShortcut'], function (d) {
    options['currentQuality'] = d['quality'] || options['currentQuality']
    options['currentSpeed'] = d['playbackSpeed'] || options['currentSpeed']
    options['notPremium'] = d['notPremium'] ?? options['notPremium']
    options['skipAd'] = d['skipAd'] ?? options['skipAd']
    options['swapColumns'] = d['swapColumns'] ?? options['swapColumns']
    options['normalSpeedShortcut'] = d['normalSpeedShortcut'] ?? options['normalSpeedShortcut']

    setupQualityList()
    setupPlaybackSpeedList()
    setupNotPremium()
    setupSkipAd()
    setupSwapColumns()
    setupNormalSpeedShortcut()
})

function setupQualityList() {
    let qualityList = document.querySelector(".quality-list")
    for (let q of allPossibleQualities) {
        let itemWrapper = document.createElement("div")

        let item = document.createElement("input")
        item.setAttribute('id', `quality-${q}`)
        item.setAttribute('type', "radio")
        item.setAttribute('name', "quality")
        item.setAttribute('value', q)
        if (q === options['currentQuality']) {
            item.checked = true
        }
        item.addEventListener('change', () => {
            storage.set({quality: q}, function () {
                console.log(`Upper limit of quality now changed to ${q}.`)
            })
        })

        let label = document.createElement("label")
        if (q === "best") {
            label.innerText = "Best possible"
        } else {
            label.innerText = q
        }
        label.setAttribute('for', `quality-${q}`)

        itemWrapper.append(item)
        itemWrapper.append(label)
        qualityList.append(itemWrapper)
    }
}

function setupPlaybackSpeedList() {
    let speedList = document.querySelector(".speed-list")
    let speedCustom = speedList.querySelector('#speed-custom')
    let customSpeedInput = speedList.querySelector('#custom-speed')

    for (let q of allPossiblePlaybackSpeed) {
        let itemWrapper = document.createElement("div")

        let item = document.createElement("input")
        item.setAttribute('id', `speed-${q}`)
        item.setAttribute('type', "radio")
        item.setAttribute('name', "speed")
        item.setAttribute('value', q)
        if (q === options['currentSpeed']) {
            item.checked = true
        }
        item.addEventListener('change', () => {
            storage.set({playbackSpeed: q}, function () {
                console.log(`Default playback speed now changed to ${q}.`)
            })
        })

        let label = document.createElement("label")
        if (q === "1.0") {
            label.innerText = "Normal"
        } else {
            label.innerText = q
        }
        label.setAttribute('for', `speed-${q}`)

        itemWrapper.append(item)
        itemWrapper.append(label)
        speedList.append(itemWrapper)
    }

    function updateCustomSpeed() {
        let customSpeed = customSpeedInput.value
        customSpeed = parseFloat(customSpeed.toString())
        if (isNaN(customSpeed) || customSpeed <= 0) {
            customSpeedInput.classList.add('invalid')
        } else {
            if (String(customSpeed) != customSpeedInput.value) {
                customSpeedInput.classList.add('invalid')
            } else {
                customSpeedInput.classList.remove('invalid')
            }
            storage.set({playbackSpeed: customSpeed}, function () {
                console.log(`Default playback speed now changed to ${customSpeed}.`)
            })
        }
    }
    speedCustom.addEventListener('change', () => {
        updateCustomSpeed()
    })
    customSpeedInput.addEventListener('keyup', () => {
        updateCustomSpeed()
        speedCustom.click()
    })
    if (!allPossiblePlaybackSpeed.includes(options['currentSpeed'])) {
        speedCustom.checked = true
        customSpeedInput.value = options['currentSpeed']
    }
}

function checkboxControl(ctrlSelector, bindVarName) {
    let controlElem = document.querySelector(ctrlSelector)
    controlElem.checked = options[bindVarName]
    controlElem.addEventListener('change', () => {
        options[bindVarName] = controlElem.checked
        storage.set({[bindVarName]: options[bindVarName]}, function () {
            console.log(`Swap columns: ${(options[bindVarName]) ? "On" : "Off"}`)
        })
    })
}

function setupNotPremium() {
    checkboxControl("#not-premium", "notPremium")
}

function setupSkipAd() {
    checkboxControl("#skip-ad", "skipAd")
}

function setupSwapColumns() {
    checkboxControl("#swap-columns", "swapColumns")
}

function setupNormalSpeedShortcut() {
    checkboxControl("#normal-speed-shortcut", "normalSpeedShortcut")
}
