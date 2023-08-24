// content.js

if (!window.bqCostObserverInitiated) {
    window.bqCostObserverInitiated = true;
    console.log("bqCostObserverInitiated")

    function computeCost(size, unit) {
        const TB_TO_BYTES = 1e12;
        const GB_TO_BYTES = 1e9;
        const MB_TO_BYTES = 1e6;
        const KB_TO_BYTES = 1e3;
        const COST_PER_TB = 6.25;

        let bytes;
        switch (unit) {
            case 'KB':
                bytes = size * KB_TO_BYTES;
                break;
            case 'MB':
                bytes = size * MB_TO_BYTES;
                break;
            case 'GB':
                bytes = size * GB_TO_BYTES;
                break;
            case 'TB':
                bytes = size * TB_TO_BYTES;
                break;
            default:
                return 0;
        }

        return (bytes / TB_TO_BYTES) * COST_PER_TB;
    }

    function processAndUpdateText(node) {
        console.log("processAndUpdateText started")
        const regex = /This query will process ([\d.,]+) ([KBGM]B) when run\./;
        const match = node.nodeValue.match(regex);
        console.log("processAndUpdateText match", match)
        if (match) {
            const size = parseFloat(match[1].replace(',', ''));
            const unit = match[2];

            const cost = computeCost(size, unit);
            const newText = `This query will process ${size} ${unit} when run (Estimated Cost: $${cost.toFixed(2)}).`;

            node.nodeValue = node.nodeValue.replace(regex, newText);
        }
    }

    const bqCostObserver = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            if (mutation.type === 'characterData') {
                console.log("Character data mutation detected.");
                processAndUpdateText(mutation.target);
            } else if (mutation.type === 'childList') {
                console.log("Child list mutation detected.");
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === 3 && node.nodeValue.includes("This query will process")) {
                        console.log("Target text node found in child list mutation.");
                        processAndUpdateText(node);
                    }
                }
            }
        }
    });

    bqCostObserver.observe(document.body, {childList: true, subtree: true, characterData: true});


    // This is a hack to force the observer to run on page load
    // because the observer only runs on mutations
    // and the page doesn't mutate on load
    const textNodes = document.evaluate("//text()", document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
    for (let i = 0; i < textNodes.snapshotLength; i++) {
        const node = textNodes.snapshotItem(i);
        if (node.nodeValue.includes("This query will process")) {
            processAndUpdateText(node);
        }
    }

    console.log("bqCostObserverInitiated done")

}
