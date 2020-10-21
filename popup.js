//
// Youtube Quality Control
// By Donny
// Donny (c) 2020
// 

const allPossibleQualities = ["best", "4320p", "2160p", "1440p", "1080p", "720p", "480p", "360p", "240p", "144p"]

let currentQuality = "best"
let skipAd = true
let swapColumns = false

chrome.storage.sync.get(['quality', 'skipAd', 'swapColumns'], function (d) {
    currentQuality = d['quality'] || "best"
    skipAd = d['skipAd']
    swapColumns = d['swapColumns']

    if (skipAd === undefined) {
        skipAd = true
    }
    if (swapColumns === undefined) {
        swapColumns = false
    }

    setupQualityList()
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
            chrome.storage.sync.set({quality: q}, function () {
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

function setupSkipAd() {
    let skipAdElem = document.querySelector("#skip-ad")
    skipAdElem.checked = skipAd
    skipAdElem.addEventListener('change', () => {
        skipAd = skipAdElem.checked
        chrome.storage.sync.set({skipAd: skipAd}, function () {
            console.log(`Skip Ad: ${(skipAd) ? "On" : "Off"}`)
        })
    })
}

function setupSwapColumns() {
    let swapColumnsElem = document.querySelector("#swap-columns")
    swapColumnsElem.checked = swapColumns
    swapColumnsElem.addEventListener('change', () => {
        swapColumns = swapColumnsElem.checked
        chrome.storage.sync.set({swapColumns: swapColumns}, function () {
            console.log(`Swap columns: ${(swapColumns) ? "On" : "Off"}`)
        })
    })
}
