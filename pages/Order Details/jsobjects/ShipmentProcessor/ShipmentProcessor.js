export default {
    dispatchShipment: async () => {
        // 1. THE GATEKEEPER: Stop immediately if not Pending!
        if (tbl_shipments.selectedRow.status !== 'Pending') {
            showAlert("This shipment is already dispatched! You cannot deduct stock twice.", "warning");
            return;
        }

        // 2. Grab the values directly
        let invNo = inp_invoice_no.text;
        let invDate = dat_invoice_date.selectedDate || dat_invoice_date.formattedDate; 

        // 3. Invoice Safety Check
        if (!invNo || !invDate) {
            showAlert("Please enter both an Invoice Number and Date!", "error");
            return;
        }

        try {
            // 4. Mark the master shipment folder as 'Dispatched'
            await mark_shipment_dispatched.run();
            
            // 5. Grab all the items currently sitting in your Details table
            let items = tbl_shipment_details.tableData;
            
            // 6. Loop through every single order and deduct the factory stock!
            for (let i = 0; i < items.length; i++) {
                await update_sent_qty.run({
                    order_no: items[i].order_no,
                    qty: items[i].required_pcs 
                });
            }
            
            // 7. Refresh the dashboard so the tables update instantly
            await get_shipments.run();
            await get_shipment_details.run();
            
            // 8. Clean up the UI
            resetWidget('inp_invoice_no', true);
            resetWidget('dat_invoice_date', true);
            showAlert('Shipment Dispatched & Stock Updated Successfully!', 'success');
            
        } catch (error) {
            showAlert('Error processing shipment: ' + error.message, 'error');
        }
    }
}