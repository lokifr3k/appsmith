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
            
            // 6. Loop through every single order: Deduct stock AND log invoice!
            for (let i = 0; i < items.length; i++) {
                await update_shipped_order.run({
                    order_no: items[i].order_no,
                    qty: items[i].required_pcs 
                });
            }
            
            // 7. NEW: Run the sweep to auto-archive fully shipped orders
            await mark_orders_completed.run();
            
            // 8. Refresh the dashboard so all tables update instantly
            await get_shipments.run();
            await get_shipment_details.run();
            await get_active_orders.run(); // Makes the archived orders vanish!
            
            // Note: If you have a query named get_completed_orders, uncomment the line below:
            // await get_completed_orders.run(); 
            
            // 9. Clean up the UI
            closeModal('mod_confirm_dispatch');
            resetWidget('inp_invoice_no', true);
            resetWidget('dat_invoice_date', true);
            showAlert('Shipment Dispatched, Invoices Logged, & Orders Archived!', 'success');
            
        } catch (error) {
            showAlert('Error processing shipment: ' + error.message, 'error');
        }
    }
}