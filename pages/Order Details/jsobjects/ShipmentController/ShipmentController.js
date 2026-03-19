export default {
    saveShipment: async () => {
        // Step 1: Make sure they actually typed a shipment number!
        if (!inp_shipment_no.text) {
            showAlert("Please enter a Shipment Number first!", "error");
            return;
        }

        try {
            // Step 2: Run the first query to create the master shipment folder
            await insert_new_shipment.run();
            
            // Step 3: Grab the calculated math from your preview table
            let items = tbl_shipment_preview.tableData;
            
            // Step 4: Loop through the table and save each row one by one
            for (let i = 0; i < items.length; i++) {
                await insert_shipment_items.run({
                    order_no: items[i].order_no,
                    target_qty: items[i].target_qty,
                    total_cartons: items[i].total_cartons
                });
            }
            
            // Step 5: Success! Close the modal and clean the boxes for next time.
            showAlert('Shipment Saved Successfully!', 'success');
            closeModal('mod_create_shipment');
            resetWidget('inp_shipment_no', true);
            resetWidget('inp_shipment_paste', true);
            
        } catch (error) {
            showAlert('Error saving shipment: ' + error.message, 'error');
        }
    }
}