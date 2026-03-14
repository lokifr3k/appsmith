export default {
    fabricData: {
        "10X10": { pcs: 80, fabric: 39 },
        "11X11": { pcs: 63, fabric: 39 },
        "12X12C": { pcs: 49, fabric: 39 },
        "12X12": { pcs: 58, fabric: 39 },
        "14X14": { pcs: 42.85, fabric: 39 },
        "15X15": { pcs: 46.66, fabric: 50 },
        "16X16": { pcs: 31.25, fabric: 39 },
        "20X10": { pcs: 40, fabric: 39 },
        "20X20": { pcs: 20, fabric: 39 },
        "38X28": { pcs: 7.8, fabric: 39 },
        "30X30": { pcs: 10, fabric: 50 },
        "35X25": { pcs: 14.28, fabric: 58 },
        "40X28": { pcs: 7.5, fabric: 39 },
        "40X30": { pcs: 6.66, fabric: 39 },
        "40X40": { pcs: 5, fabric: 39 },
        "40X50": { pcs: 4, fabric: 39 },
        "48X48": { pcs: 4.16, fabric: 50 },
        "50X25": { pcs: 8, fabric: 50 },
        "40X20": { pcs: 10, fabric: 39 }
    },

    getDetails: (size, color) => {
        let lookupSize = (size || "").toUpperCase().trim();
        let colorName = (color || "").toLowerCase().trim();

        // THE MAGIC 12x12 EDGE CASE RULE:
        if (lookupSize === "12X12" && colorName !== "white" && colorName !== "offwhite") {
            lookupSize = "12X12C";
        }

        return FabricCalculator.fabricData[lookupSize] || { pcs: 0, fabric: "-" };
    },

    calculateMeters: (size, color, balanceQty) => {
        let details = FabricCalculator.getDetails(size, color);
        
        // If the balance is 0 (or negative) or size is unknown, we need 0 meters!
        if (details.pcs === 0 || balanceQty <= 0) return 0;
        
        let targetPcs = Math.ceil(balanceQty * 1.08); // Adds the 8% extra to the REMAINING balance
        let meters = targetPcs / details.pcs; 
        
        return parseFloat(meters.toFixed(2)); 
    },

    getFabricTotals: () => {
        // Pull all the data currently showing in your active orders table
        let orders = get_active_orders.data || [];
        let summary = {};

        // Loop through every single order
        orders.forEach(order => {
            if (order.balance_qty > 0) {
                let details = FabricCalculator.getDetails(order.item_size, order.color);
                let meters = FabricCalculator.calculateMeters(order.item_size, order.color, order.balance_qty);

                // If this order needs fabric, add it to the bucket!
                if (meters > 0 && details.fabric !== "-") {
                    let fabricName = details.fabric + '" ' + (order.color || "UNKNOWN").toUpperCase();

                    if (!summary[fabricName]) {
                        summary[fabricName] = 0;
                    }
                    summary[fabricName] += meters;
                }
            }
        });

        // Convert the invisible buckets into a clean list for the Appsmith table
        let resultTable = Object.keys(summary).map(key => ({
            "Fabric Type": key,
            "Total Needed (m)": parseFloat(summary[key].toFixed(2))
        }));

        // Sort it alphabetically so all 39" group together and 50" group together
        return resultTable.sort((a, b) => a["Fabric Type"].localeCompare(b["Fabric Type"]));
    }
}