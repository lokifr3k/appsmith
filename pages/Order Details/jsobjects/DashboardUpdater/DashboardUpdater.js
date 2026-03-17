export default {
    refreshAll: () => {
        // Triggers all your KPI cards and charts to fetch fresh data
        get_total_orders_received.run();
        get_total_balance_qty.run();
        get_total_stock_qty.run();
        get_orders_by_size.run();
        get_orders_by_color.run();
    }
}