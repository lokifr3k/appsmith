export default {
    dispatchShipment: async () => {
        // 1. Grab the values directly
        let invNo = inp_invoice_no.text;
        // This checks both date properties just to be safe!
        let invDate = dat_invoice_date.selectedDate || dat_invoice_date.formattedDate; 

        // 2. Safety Check
        if (!invNo || !invDate) {
            showAlert("Please enter both an Invoice Number and Date!", "error");
            return;
        }

        try {
            // 3. Mark the master shipment folder as 'Dispatched'
            await mark_shipment_dispatched.run();
            
            // 4. Grab all the items currently sitting in your Details table
            let items = tbl_shipment_details.tableData;
            
            // 5. Loop through every single order and deduct the factory stock!
            for (let i = 0; i < items.length; i++) {
                await update_sent_qty.run({
                    order_no: items[i].order_no,
                    qty: items[i].required_pcs 
                });
            }
            
            // 6. Refresh the dashboard so the tables update instantly
            await get_shipments.run();
            await get_shipment_details.run();
            
            // 7. Clean up the UI
            resetWidget('inp_invoice_no', true);
            resetWidget('dat_invoice_date', true);
            showAlert('Shipment Dispatched & Stock Updated Successfully!', 'success');
            
        } catch (error) {
            showAlert('Error processing shipment: ' + error.message, 'error');
        }
    }
}