package com.tubespbo.foodorder.model;

import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "orders")
public class Order {

    public static final String DEFAULT_STATUS_PAYMENT = "PAID";
    public static final String STATUS_CONFIRMED = "CONFIRMED";
    public static final String STATUS_IN_QUEUE = "IN_QUEUE";
    public static final String STATUS_IN_PROGRESS = "IN_PROGRESS";
    public static final String STATUS_DELIVERED = "DELIVERED";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int orderId;

    @ManyToOne
    private Customer customer;

    private int tableNumber;

    @ManyToMany
    private List<MenuItem> items;

    private String paymentStatus = DEFAULT_STATUS_PAYMENT;
    private int queueNumber;
    private String status = STATUS_CONFIRMED;

    public Order() {
    }

    public Order(int orderId, Customer customer, int tableNumber, List<MenuItem> items, int queueNumber) {
        this.orderId = orderId;
        this.customer = customer;
        this.tableNumber = tableNumber;
        this.items = items;
        this.queueNumber = queueNumber;
    }

    public double calculateTotal() {
        return items.stream().mapToDouble(MenuItem::getPrice).sum();
    }

    public int getOrderId() {
        return orderId;
    }

    public void setOrderId(int orderId) {
        this.orderId = orderId;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public int getTableNumber() {
        return tableNumber;
    }

    public void setTableNumber(int tableNumber) {
        this.tableNumber = tableNumber;
    }

    public List<MenuItem> getItems() {
        return items;
    }

    public void setItems(List<MenuItem> items) {
        this.items = items;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public int getQueueNumber() {
        return queueNumber;
    }

    public void setQueueNumber(int queueNumber) {
        this.queueNumber = queueNumber;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
