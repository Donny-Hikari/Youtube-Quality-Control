//
// Youtube Quality Control
// By Donny
// Donny (c) 2020
//

const allPossibleQualities = ["best", "4320p", "2160p", "1440p", "1080p", "720p", "480p", "360p", "240p", "144p"]
const allPossiblePlaybackSpeed = ['0.25', '0.5', '0.75', '1.0', '1.25', '1.5', '1.75', '2']

const storage = chrome.storage.sync

let currentQuality = "best"
let currentSpeed = '1.0'
let notPremium = true
let skipAd = true
let swapColumns = false
let normalSpeedShortcut = true

storage.get(['quality', 'skipAd', 'swapColumns', 'notPremium', 'playbackSpeed', 'normalSpeedShortcut'], function (d) {
    currentQuality = d['quality'] || "best"
    currentSpeed = d['playbackSpeed'] || '1.0'
    notPremium = d['notPremium'] ?? true
    skipAd = d['skipAd'] ?? true
    swapColumns = d['swapColumns'] ?? false
    normalSpeedShortcut = d['normalSpeedShortcut'] ?? true

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
        if (q === currentQuality) {
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
    for (let q of allPossiblePlaybackSpeed) {
        let itemWrapper = document.createElement("div")

        let item = document.createElement("input")
        item.setAttribute('id', `speed-${q}`)
        item.setAttribute('type', "radio")
        item.setAttribute('name', "speed")
        item.setAttribute('value', q)
        if (q === currentSpeed) {
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
}

function checkboxControl(ctrlSelector, bindVarName) {
    let controlElem = document.querySelector(ctrlSelector)
    controlElem.checked = global[bindVarName]
    controlElem.addEventListener('change', () => {
        global[bindVarName] = controlElem.checked
        storage.set({[bindVarName]: global[bindVarName]}, function () {
            console.log(`Swap columns: ${(global[bindVarName]) ? "On" : "Off"}`)
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
