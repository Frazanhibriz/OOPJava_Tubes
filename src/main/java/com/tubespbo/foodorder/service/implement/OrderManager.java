package com.tubespbo.foodorder.service.implement;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tubespbo.foodorder.model.Customer;
import com.tubespbo.foodorder.model.MenuItem;
import com.tubespbo.foodorder.model.Order;
import com.tubespbo.foodorder.repository.OrderRepository;
import com.tubespbo.foodorder.service.OrderService;

@Service
public class OrderManager implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Override
    public Order createOrder(Customer customer, List<MenuItem> items, int tableNumber) {
        Order newOrder = new Order();
        newOrder.setCustomer(customer);
        newOrder.setItems(items);
        newOrder.setPaymentStatus(Order.DEFAULT_STATUS_PAYMENT);
        newOrder.setStatus(Order.STATUS_CONFIRMED);
        newOrder.setQueueNumber(generateQueueNumber());
        newOrder.setTableNumber(tableNumber);
        newOrder.setTotalPrice(newOrder.calculateTotal());
        return orderRepository.save(newOrder);
    }

    private int generateQueueNumber() {
        long count = orderRepository.count();
        return (int) count + 1;
    }

    @Override
    public Order getOrderById(int id) {
        Optional<Order> result = orderRepository.findById(id);
        return result.orElse(null);
    }

    @Override
    public void updateOrderStatus(int id, String status) {
        Order order = getOrderById(id);
        if (order != null) {
            order.setStatus(status);
            orderRepository.save(order);
        }
    }

    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    public List<Order> getOrdersByCustomer(Customer customer) {
        return orderRepository.findByCustomer(customer);
    }
}
