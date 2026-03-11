export default {
    processBulkShipment: async () => {
        const shipments = tbl_shipping_preview.tableData;
        
        // 1. Loop through and update every order's sent_qty and invoice
        for (let i = 0; i < shipments.length; i++) {
            await update_shipped_order.run({
                order_no: shipments[i].order_no,
                qty: shipments[i].qty
            });
        }
        
        // 2. Run the sweep to auto-archive fully shipped orders
        await mark_orders_completed.run();
        
        // 3. Refresh both tabs on your dashboard
        await get_active_orders.run();
        await get_completed_orders.run();
        
        // 4. Cleanup UI
        showAlert("Shipment processed! Fully shipped orders have been moved to the Archive.", "success");
        resetWidget('inp_shipping_paste');
        resetWidget('inp_invoice_no');
        closeModal(ShippingModal.name);
    }
}