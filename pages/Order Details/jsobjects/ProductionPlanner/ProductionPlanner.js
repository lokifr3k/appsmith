export default {
    pushToFloor: async () => {
        try {
            await get_order_for_push.run();
            await push_to_floor.run();
            await get_production_plan.run();
            await get_work_orders.run();
            // Force table to re-render by running again after short delay
            //await new Promise(resolve => setTimeout(resolve, 500));
            //await get_production_plan.run();
        } catch (error) {
            showAlert('Error: ' + error.message, 'error');
        }
    }
}