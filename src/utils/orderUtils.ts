export const getStoredOrders = () => {
    if (typeof window === "undefined") return {};
    const stored = localStorage.getItem("orders");
    return stored ? JSON.parse(stored) : {};
    };
    
    export const setStoredOrders = (orders: Record<number, number>) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("orders", JSON.stringify(orders));
    };
    
    export const calculateTotals = (menuItems: any[], orderCounts: Record<number, number>) => {
    let totalItems = 0;
    let totalPrice = 0;
    
    for (const item of menuItems) {
    const qty = orderCounts[item.id] || 0;
    totalItems += qty;
    totalPrice += qty * item.price;
    }
    
    return { totalItems, totalPrice };
    };
    
    