export default {
    getDetails: (size, color) => {
        let lookupSize = (size || "").toUpperCase().trim();
        let colorName = (color || "").toLowerCase().trim();

        // THE MAGIC 12x12 EDGE CASE RULE:
        if (lookupSize === "12X12" && colorName !== "white" && colorName !== "offwhite") {
            lookupSize = "12X12C";
        }

        // Fetch the live master data from PostgreSQL
        let masterData = get_item_masters.data || [];
        
        // Find the matching size in the database
        let match = masterData.find(row => row.item_size === lookupSize);

        // If found, return the database values. If not, return 0s.
        if (match) {
            return { pcs: Number(match.pcs_per_meter), fabric: match.fabric_width };
        } else {
            return { pcs: 0, fabric: "-" };
        }
    },

    calculateMeters: (size, color, orderedQty, producedQty) => {
    let details = FabricCalculator.getDetails(size, color);
    let remaining = orderedQty - producedQty;
    
    if (details.pcs === 0 || remaining <= 0) return 0;
    
    let targetPcs = Math.ceil(remaining * 1.08);
    let meters = targetPcs / details.pcs;
    
    return parseFloat(meters.toFixed(2));
},

    getFabricTotals: () => {
        let orders = get_active_orders.data || [];
        let summary = {};

        orders.forEach(order => {
            if (order.balance_qty > 0) {
                let details = FabricCalculator.getDetails(order.item_size, order.color);
                let meters = FabricCalculator.calculateMeters(order.item_size, order.color, order.balance_qty);

                if (meters > 0 && details.fabric !== "-") {
                    let fabricName = details.fabric + '" ' + (order.color || "UNKNOWN").toUpperCase();

                    if (!summary[fabricName]) {
                        summary[fabricName] = 0;
                    }
                    summary[fabricName] += meters;
                }
            }
        });

        let resultTable = Object.keys(summary).map(key => ({
            "Fabric Type": key,
            "Total Needed (m)": parseFloat(summary[key].toFixed(2))
        }));

        return resultTable.sort((a, b) => a["Fabric Type"].localeCompare(b["Fabric Type"]));
    }
}