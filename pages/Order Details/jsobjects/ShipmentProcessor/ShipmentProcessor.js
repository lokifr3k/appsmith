export default {
    dispatchShipment: async () => {
        // 1. Safety Check: Make sure they typed an invoice!
        if (!inp_invoice_no.text || !dat_invoice_date.formattedDate) {
            showAlert("Please enter both an Invoice Number and Date!", "error");
            return;
        }

        try {
            // 2. Mark the master shipment folder as 'Dispatched'
            await mark_shipment_dispatched.run();
            
            // 3. Grab all the items currently sitting in your Details table
            let items = tbl_shipment_details.tableData;
            
            // 4. Loop through every single order and deduct the factory stock!
            for (let i = 0; i < items.length; i++) {
                await update_sent_qty.run({
                    order_no: items[i].order_no,
                    qty: items[i].required_pcs // We use required_pcs from your smart factory query
                });
            }
            
            // 5. Refresh the dashboard so the tables update instantly
            await get_shipments.run();
            await get_shipment_details.run();
            
            // 6. Clean up the UI
            resetWidget('inp_invoice_no', true);
            resetWidget('dat_invoice_date', true);
            showAlert('Shipment Dispatched & Stock Updated Successfully!', 'success');
            
        } catch (error) {
            showAlert('Error processing shipment: ' + error.message, 'error');
        }
    }
}