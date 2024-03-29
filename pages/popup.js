//
// Youtube Quality Control
// By Donny
// Donny (c) 2020
// 

const allPossibleQualities = ["best", "4320p", "2160p", "1440p", "1080p", "720p", "480p", "360p", "240p", "144p"]

const storage = chrome.storage.sync

let currentQuality = "best"
let notPremium = true
let skipAd = true
let swapColumns = false

storage.get(['quality', 'skipAd', 'swapColumns'], function (d) {
    currentQuality = d['quality'] || "best"
    notPremium = d['notPremium'] ?? true
    skipAd = d['skipAd'] ?? true
    swapColumns = d['swapColumns'] ?? false

    setupQualityList()
    setupNotPremium()
    setupSkipAd()
    setupSwapColumns()
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

function setupNotPremium() {
    let notPremiumElem = document.querySelector("#not-premium")
    notPremiumElem.checked = notPremium
    notPremiumElem.addEventListener('change', () => {
        notPremium = notPremiumElem.checked
        storage.set({notPremium: notPremium}, function () {
            console.log(`Swap columns: ${(notPremium) ? "On" : "Off"}`)
        })
    })
}

function setupSkipAd() {
    let skipAdElem = document.querySelector("#skip-ad")
    skipAdElem.checked = skipAd
    skipAdElem.addEventListener('change', () => {
        skipAd = skipAdElem.checked
        storage.set({skipAd: skipAd}, function () {
            console.log(`Skip Ad: ${(skipAd) ? "On" : "Off"}`)
        })
    })
}

function setupSwapColumns() {
    let swapColumnsElem = document.querySelector("#swap-columns")
    swapColumnsElem.checked = swapColumns
    swapColumnsElem.addEventListener('change', () => {
        swapColumns = swapColumnsElem.checked
        storage.set({swapColumns: swapColumns}, function () {
            console.log(`Swap columns: ${(swapColumns) ? "On" : "Off"}`)
        })
    })
}
